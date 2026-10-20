# Cuantización, explicada para el ponente

Informe de apoyo para el bloque «the model» de la keynote (`deck.md`, diapositivas del
`optimum-cli`, «The recipe sets the price» y «Quantising better»). Explica qué es cuantizar,
qué hace cada parámetro que aparece en pantalla, cómo cuantizamos hoy, cómo proponemos
hacerlo mejor y qué cambia según el dispositivo. Al final, un glosario (IR y demás) y
preguntas probables del público.

Fuentes: `docs/research/2026-09-25-int4-quantisation.md`, `vision/tools/convert/convert.py`,
las issues #72–#75, y —verificado hoy, 2026-09-25— la configuración real de
optimum-intel 2.1.0 / NNCF 3.3.0 instalada en `vision/.venv` y los metadatos del IR
exportado en `%LOCALAPPDATA%\local-vision-playground\ir\`.

---

## 0. En treinta segundos

- **Cuantizar** es guardar los pesos del modelo con menos bits (de 16 a 4) a cambio de algo
  de precisión. Se hace porque generar texto está limitado por **cuánto se tarda en leer los
  pesos de memoria**, no por cuánto se calcula: menos bytes → más tokens por segundo, y el
  modelo cabe.
- **INT4 no es una sola cosa.** Lo que decide la calidad es la **receta**: cuántos pesos
  comparten una escala (`--group-size`), si hay punto cero (`--sym`), qué capas se quedan
  más anchas (`--ratio`) y si se usan datos para elegir las escalas (AWQ, scale estimation,
  GPTQ).
- **Hoy** usamos la receta más gruesa posible (por canal, simétrica, todo en INT4, sin datos)
  porque es la que el NPU cargó a la primera, y un solo IR sirve a CPU, GPU y NPU. La GPU y
  la CPU pagan un precio que sólo pide el NPU.
- **Propuesta:** un IR por motor, recetas por grupos (y con AWQ) para GPU/CPU, AWQ + scale
  estimation para el NPU, penalización de repetición al decodificar, y medir los bucles.
- **Hallazgo de hoy:** optimum-intel ya trae una receta curada para `Qwen/Qwen3-VL-2B-Instruct`
  (INT4 asimétrica, grupos de 128, AWQ). Al pasarle nuestros flags, **la desactivamos**.

---

## 1. Qué es cuantizar

### La idea

Un modelo es, sobre todo, una montaña de números: los **pesos**. Qwen3-VL-2B tiene ~2.100
millones. Entrenados, se guardan en coma flotante de 16 bits (FP16 o BF16): 2 bytes por
peso, ~4,3 GB. Cuantizar es representar cada peso con menos bits —8 (INT8) o 4 (INT4)—
usando una **cuadrícula de valores** más pequeña y una **escala** que dice cuánto vale cada
escalón de esa cuadrícula.

Con 4 bits sólo hay **16 valores posibles**. Cuantizar es decidir, para cada peso, a cuál de
esos 16 escalones se redondea, y cuánto vale cada escalón.

### Por qué hacerlo

Un LLM genera texto **un token cada vez**, y para cada token tiene que leer **todos** los
pesos. En un portátil eso no lo limita la potencia de cálculo, sino el **ancho de banda de
memoria** (se dice que el *decode* es *memory-bound*).

Orden de magnitud en este portátil (Core Ultra 7 258V, LPDDR5X, ~130 GB/s teóricos):

| Formato | Tamaño del 2B | Techo teórico de lectura por token |
| --- | --- | --- |
| FP16 | ~4,3 GB | ~30 tokens/s |
| INT8 | ~2,2 GB | ~60 tokens/s |
| INT4 | ~1,1–1,3 GB | ~100 tokens/s |

(Techos teóricos, no medidas; la iGPU medida en el Benchmark da 56 tokens/s.) El 4B en FP16
son casi 9 GB: con la memoria que comparten iGPU, NPU y sistema, cuantizar **no es
opcional** en esta clase de máquina.

### Dos familias

- **Weight-only (compresión de pesos).** Sólo se cuantizan los pesos; los cálculos siguen en
  FP16 (o se hacen en INT8 donde el hardware lo permite). Antes de multiplicar, el peso se
  *descuantiza* al vuelo. Es lo estándar para LLMs, y es **lo que hacemos nosotros**
  (`--weight-format`).
- **Cuantización completa (pesos + activaciones).** También se cuantizan los valores
  intermedios. Necesita datos de calibración y es lo clásico en visión por computador (CNNs
  en INT8 con OpenVINO, probablemente lo que ya has hecho). En optimum es `--quant-mode`.
  No la usamos.

Y dos momentos:

- **PTQ (post-training quantization):** se cuantiza el modelo ya entrenado. Lo nuestro.
- **QAT (quantization-aware training):** se entrena sabiendo que se va a cuantizar. Fuera
  del alcance.

---

## 2. Cómo funciona INT4 por dentro

### Escala y redondeo

Para un conjunto de pesos que comparten escala:

- **Simétrica** (`--sym`): la cuadrícula va de −8 a +7, centrada en cero.
  `escala = max(|w|) / 7`, `q = redondear(w / escala)`, y al usarlo `w' = q · escala`.
- **Asimétrica** (sin `--sym`, el valor por defecto): la cuadrícula va de 0 a 15 y se
  desplaza con un **punto cero** (*zero-point*).
  `escala = (max(w) − min(w)) / 15`, `zp = redondear(−min(w) / escala)`,
  `w' = (q − zp) · escala`.

Redondear al valor más cercano sin mirar nada más se llama **RTN** (*round-to-nearest*). Es
lo más simple y lo que hacemos hoy.

### Por qué importa cuántos pesos comparten escala: el ejemplo del *outlier*

Supón una fila de pesos donde casi todos son pequeños y uno es grande (un *outlier*; los
LLMs los tienen, y son importantes):

```
0.02  -0.01  0.03  -0.02  …  1.20
```

**Una escala para toda la fila (por canal, `--group-size -1`):**
`escala = 1.20 / 7 ≈ 0.171`. Entonces `0.02 / 0.171 ≈ 0.12 → 0`, `0.03 → 0`, `−0.02 → 0`…
**Todos los pesos pequeños se convierten en cero.** El outlier se conserva y el resto de la
fila se aplana. En una fila real hay miles de pesos, no cinco.

**Una escala cada 32 pesos (por grupos, `--group-size 32`):** el grupo que no contiene el
outlier tiene `escala = 0.03 / 7 ≈ 0.0043`, y `0.02 → 5 → 0.0214`. El error es de un 7 %,
no del 100 %. El outlier sólo estropea su propio grupo de 32.

Esa es la intuición entera: **cuanto más pequeño el grupo, menos daño hace cada outlier**.

### Por qué la asimetría ayuda

Si un grupo tiene pesos entre 0,1 y 0,9 (todos positivos), la cuadrícula simétrica gasta la
mitad negativa (−8…−1) en valores que nunca aparecen: de 16 escalones sólo usa 8. La
asimétrica desplaza la cuadrícula y usa los 16.

### El coste de la precisión

Cada escala (y cada punto cero) ocupa memoria. Con escalas en FP16:

| Granularidad | Bits efectivos por peso (aprox.) |
| --- | --- |
| Por canal (`-1`) | ~4,0 |
| Grupos de 128 | ~4,1 (+ punto cero si es asimétrica) |
| Grupos de 32 | ~4,5 (+ punto cero si es asimétrica) |

Además de ocupar, grupos más pequeños exigen más trabajo al descuantizar, y **no todo el
hardware los acelera igual** (ver §6, el NPU).

---

## 3. Los parámetros, uno a uno

### Los cuatro que aparecen en la keynote

```bash
optimum-cli export openvino \
  --model Qwen/Qwen3-VL-2B-Instruct \
  --weight-format int4 --sym --ratio=1.0 --group-size=-1 \
  qwen3-vl-2b-instruct-int4-sym
```

| Parámetro | Qué es | Valores | Efecto en calidad | Efecto en tamaño / velocidad |
| --- | --- | --- | --- | --- |
| `--weight-format int4` | Formato de los pesos (weight-only). | `fp16`, `int8`, `int4`, `nf4`, `mxfp4`… | INT8 casi sin pérdida; INT4 pierde algo, según receta. | INT4 ≈ ¼ de FP16; INT8 ≈ ½. |
| `--sym` | Cuantización simétrica, sin punto cero. | Presente = simétrica; ausente = asimétrica (por defecto). | Simétrica pierde algo más si los pesos no están centrados en cero. | Simétrica es algo más ligera y más sencilla para el hardware. |
| `--group-size` | Cuántos pesos comparten una escala. | `-1` (por canal, una escala por fila), `128` (recomendado), `64`, `32`… | Más pequeño = mejor calidad. `-1` es lo más grueso. | Más pequeño = algo más grande y, en algunos motores, más lento. |
| `--ratio` | Fracción de capas en INT4; el resto va a la **precisión de respaldo** (INT8 asimétrica por defecto). | `0.0`–`1.0`; **por defecto 1.0**. | Menos de 1.0 deja en INT8 las capas más sensibles. | Menos de 1.0 = más grande y algo más lento. |

Una capa en este contexto es una matriz de pesos (una proyección de atención o del MLP). Con
`--ratio 0.8`, NNCF elige el 20 % más «sensible» (según `--sensitivity-metric`; sin datos,
mide el error de cuantización de los propios pesos) y lo deja en INT8.

### Otros parámetros que conviene conocer

| Parámetro | Qué hace | Necesita datos |
| --- | --- | --- |
| `--all-layers` | Cuantiza también a INT4 los *embeddings* y la última capa (`lm_head`). **Sin él se quedan en INT8**, aunque `--ratio` sea 1.0. | No |
| `--backup-precision` | La precisión de las capas que no van a INT4: `int8_asym` (por defecto), `int8_sym` o `none` (FP16). | No |
| `--awq` | *Activation-aware Weight Quantization*: antes de cuantizar, reescala los canales importantes para protegerlos. Sin dataset hace una versión *data-free* basada en magnitudes. | Opcional |
| `--scale-estimation` | Ajusta cada escala para minimizar el error de la salida de la capa (no el del peso). | Sí |
| `--gptq` | Cuantiza capa a capa corrigiendo los pesos que quedan para compensar el error de los ya cuantizados. Más lento de exportar. | Sí |
| `--dataset` | Datos de calibración. Para LLMs: `wikitext2`, `c4`, `gsm8k`, `auto`. **Para VLMs, `textvqa`** (`contextual` está obsoleto en esta versión). | — |
| `--sensitivity-metric` | Cómo se decide qué capas son «sensibles» cuando `ratio < 1`. Con datos puede usar la Hessiana o la varianza de las activaciones. | Según métrica |
| `--num-samples` | Cuántas muestras de calibración usar. | — |

**Data-free contra data-aware.** Sin datos, la receta sólo ve los pesos. Con datos, pasa
ejemplos reales por el modelo y ve qué pesos **multiplican activaciones grandes**, que son
los que de verdad importan. Es la palanca más potente cuando el formato (por ejemplo, el del
NPU) no se puede cambiar.

---

## 4. Cómo cuantizamos ahora

### La receta

`vision/tools/convert/convert.py` exporta con
`--weight-format int4 --sym --ratio=1.0 --group-size=-1`. Lo que quedó aplicado de verdad
(leído del `rt_info` del IR, `openvino_language_model.xml`):

```
mode           int4_sym
group_size     -1          ← una escala por fila
ratio          1.0
all_layers     False       ← embeddings y lm_head en INT8
backup_mode    int8_asym
awq            False
scale_estimation False
gptq           False
dataset        (ninguno)   ← RTN puro, data-free
```

Es decir: **RTN, por canal, simétrica, sin datos**. La receta más gruesa que admite INT4.

### Qué pesa cada parte del IR (2B)

| Fichero | Tamaño | Qué es |
| --- | --- | --- |
| `openvino_language_model.bin` | 971 MB | El LLM: capas en INT4, `lm_head` en INT8 |
| `openvino_vision_embeddings_merger_model.bin` | 386 MB | El codificador de visión (no en INT4) |
| `openvino_text_embeddings_model.bin` | 298 MB | La tabla de *embeddings* de texto, en INT8 |
| Tokenizer, detokenizer, posiciones | ~12 MB | |

~1,7 GB en total, **más** que el build de Foundry Local (1,34 GB) y aun así peor: los bytes
extra están fuera de las capas INT4. El tamaño no es un indicador de calidad.

### Por qué esa receta

1. **El NPU.** La cuantización INT4 simétrica por canal es el formato en torno al que está
   construido el plugin NPU de OpenVINO para LLMs, y es la que cargó a la primera en
   `Intel(R) AI Boost` (#40).
2. **Un solo IR para los tres motores.** OpenVINO recibe el dispositivo al cargar, así que el
   mismo IR sirve a CPU, GPU y NPU. Cómodo, pero la iGPU y la CPU heredan una restricción que
   sólo impone el NPU.

### La comparación con Foundry Local

El build de Foundry Local también es INT4 (su tamaño sólo cuadra con 4 bits). Su familia de
builds CPU usa la receta `cpu-int4-rtn-block-32-acc-level-4`:

- `int4-rtn`: INT4 con redondeo al más cercano, igual que nosotros;
- `block-32`: **una escala cada 32 pesos**, frente a una por fila en la nuestra;
- `acc-level-4`: en ONNX Runtime, el nivel de precisión de cálculo del operador
  `MatMulNBits`; el 4 significa activaciones en INT8 al multiplicar (A8W4).

(Que los builds `qwen3-vl` usan exactamente esa receta es una **inferencia** a partir del
resto del catálogo; no hay un `genai_config.json` de qwen3-vl en la caché de esta máquina.)

Por eso la diapositiva dice **«The recipe sets the price, not INT4»**: los dos son INT4, y
el de grupos de 32 describe la estantería limpiamente mientras el nuestro repite «A white
door is in the center».

### Lo que la cuantización no explica sola: la decodificación

Los dos runtimes decodifican de forma **greedy** (`temperature 0.0` → `do_sample=False`):
siempre eligen el token más probable. Es el modo más propenso a bucles, y un modelo pequeño
cuantizado de forma gruesa lo amplifica. Curiosamente, el `generation_config.json` que
publica Qwen con el modelo recomienda **muestrear** (`temperature 0.7`, `top_p 0.8`,
`top_k 20`). Por eso #74 (penalización de repetición) es una palanca independiente.

---

## 5. El hallazgo de hoy: optimum-intel ya sabía cuantizar este modelo

optimum-intel trae una tabla de recetas curadas por modelo (`_DEFAULT_4BIT_WQ_CONFIGS` en
`optimum/intel/openvino/configuration.py`). Para los nuestros:

| Modelo | `sym` | `group_size` | `ratio` | Método | Dataset |
| --- | --- | --- | --- | --- | --- |
| `Qwen/Qwen3-VL-2B-Instruct` | no (asimétrica) | 128 | 1.0 | AWQ | — (data-free) |
| `Qwen/Qwen3-VL-4B-Instruct` | no (asimétrica) | 128 | 1.0 | AWQ | `textvqa` |
| `Qwen/Qwen3-VL-8B-Instruct` | no (asimétrica) | 128 | 1.0 | AWQ | — |

La regla de optimum es: **si pasas `--weight-format int4` y ningún otro parámetro de
compresión, aplica la receta curada del modelo** (y si no la hay, la genérica: asimétrica,
grupos de 128, `ratio 1.0`). En cuanto pasas `--sym`, `--ratio` o `--group-size`, la
receta curada se ignora. Nuestro comando la desactiva.

Consecuencias para mañana:

- La mejor receta para GPU y CPU probablemente sea **quitar flags**, no añadirlos:
  `--weight-format int4` a secas.
- **Corrección a las notas del deck:** la nota de «The recipe sets the price» dice
  «optimum keeps 20% by default». No es así en optimum-intel 2.1.0: `--ratio` vale **1.0**
  por defecto. Lo que optimum deja en INT8 por defecto son los *embeddings* y el `lm_head`
  (por no pasar `--all-layers`). Lo mismo en la candidata 1 de #72 («ratio 0.8 —
  optimum-intel's usual default»). Si alguien pregunta, di «optimum, por defecto, usa grupos
  de 128, asimétrica, y para este modelo además AWQ».

---

## 6. Cuantizar distinto según el dispositivo

Los tres motores no quieren lo mismo. Todos descuantizan los pesos INT4 al vuelo y calculan
en FP16 (el NPU y la GPU) o FP16/FP32 con aceleración INT8 (la CPU), pero difieren en qué
formatos aceleran bien.

### CPU

- **Qué le va bien:** INT4 asimétrica por grupos (128, o 64/32 si hace falta calidad) e
  INT8. Los kernels de CPU de OpenVINO manejan bien grupos y puntos cero; en CPU además se
  comprime la *KV cache* a 8 bits por defecto.
- **Restricciones:** ninguna de formato relevante. Es el más lento de los tres para este
  trabajo, pero el más flexible.
- **Receta propuesta:** la curada de optimum (`--weight-format int4`), o `int8` si la
  calidad manda (el 2B en INT8 son ~2,2 GB, asumible).
- **Alternativa real:** para la CPU ya existe el build de Foundry Local, con mejor calidad.
  La fila OpenVINO-CPU sirve sobre todo para comparar motores con el mismo IR.

### GPU (Arc 140V integrada)

- **Qué le va bien:** INT4 por grupos (128 es el punto dulce), simétrica o asimétrica, e
  INT8. Es donde más rinde el modelo en este portátil (56 tokens/s).
- **Restricciones:** comparte memoria con el sistema; FP16 puede desbordar en algunas
  activaciones (de ahí el `ACTIVATIONS_SCALE_FACTOR` que optimum escribe en el IR).
- **Receta propuesta, en orden (#72):**
  1. `--weight-format int4` a secas (la curada: asimétrica, g128, AWQ);
  2. la curada + datos: `--weight-format int4 --group-size 128 --awq --scale-estimation --dataset textvqa`;
  3. `--weight-format int4 --sym --group-size 32` (lo más parecido a Foundry Local);
  4. `--weight-format int8` como techo de calidad.

### NPU (Intel AI Boost)

- **Qué le va bien:** INT4 **simétrica por canal**, que es exactamente lo que tenemos. La
  documentación de OpenVINO GenAI para NPU la recomienda para LLMs y **sugiere añadir AWQ y
  scale estimation con dataset** para recuperar calidad sin cambiar el formato. Los drivers
  recientes aceptan también grupos (g128), con coste de rendimiento. *Por verificar contra
  la documentación actual y el driver `>= 32.0.100.3104` (#73).*
- **Restricciones propias:**
  - **Formas estáticas:** el NPU compila el grafo con longitudes fijas de prompt y
    respuesta (OpenVINO GenAI expone `MAX_PROMPT_LEN`, `MIN_RESPONSE_LEN`). No redimensiona
    en caliente como la GPU.
  - **Compilación cara:** la primera compilación tarda ~32 s; con `CACHE_DIR` se guarda el
    *blob* compilado y baja a ~2 s (#45).
  - **Menos opciones de decodificación** probablemente soportadas en el pipeline estático
    (a verificar en #74).
- **Receta propuesta (#73), en orden:**
  1. mantener el formato y añadir datos:
     `--weight-format int4 --sym --ratio 1.0 --group-size -1 --awq --scale-estimation --dataset textvqa`;
  2. probar grupos: `--weight-format int4 --sym --group-size 128`;
  3. si ninguno carga o mejora, dejar la actual y escribir por qué.

### Resumen

| | CPU | GPU (iGPU) | NPU |
| --- | --- | --- | --- |
| Formato preferido | INT4 asim. g128 o INT8 | INT4 g128 (sim. o asim.) o INT8 | INT4 sim. por canal |
| Grupos pequeños | Bien | Bien | Limitado / más lento |
| Palanca principal | Granularidad o INT8 | Granularidad + AWQ | Datos (AWQ, scale estimation) |
| Particularidad | KV cache a 8 bits | Memoria compartida, FP16 | Formas estáticas, compilación, `CACHE_DIR` |
| IR propio | Sí | Sí | Sí (el actual) |

La idea clave: **un IR por motor**. El slug tendrá que nombrar la receta (por ejemplo,
`…-int4-g128-gpu`), porque `int4-sym` ya no identificaría una sola exportación, y el
`provenance.json` la registra junto al IR.

---

## 7. La diapositiva «Quantising better», bala a bala

1. **One IR per engine, not one for all.** Deja de imponer a la GPU y la CPU la forma que
   pide el NPU. Coste: más exportaciones (minutos cada una) y más disco.
2. **Group-wise INT4 or INT8 for the GPU and the CPU.** Grupos de 128 o 32, o INT8. Ver
   §6. El primer candidato, la receta curada de optimum (§5). Issue #72.
3. **Group-wise, or AWQ and scale estimation, for the NPU.** Mantener el formato que el NPU
   quiere y mejorar *cómo* se eligen las escalas, usando datos. Issue #73.
4. **A repetition penalty at decode time.** Sin reexportar nada: `repetition_penalty` o
   `no_repeat_ngram_size` en el `GenerationConfig` de OpenVINO GenAI. Ojo: la Observation
   estructurada repite claves JSON (`"name"`, `"where"`) legítimamente; una penalización
   agresiva la puede romper. Issue #74.
5. **Count the loops, not only the tokens per second.** Un INT4 malo puede ser rapidísimo y
   repetir la misma frase hasta el límite de 128 tokens. La métrica honesta es la tasa de
   bucles (A6 del spike de la Work Cell: 16 de 32 respuestas OpenVINO en bucle frente a 2 de
   32 en Foundry Local) y si detecta guantes, móvil y taza.

Y una quinta vía que no es cuantizar: **#75**, `qwen3.5-*`, que publica un build
`-generic-gpu` en Foundry Local y llegaría a la iGPU sin exportación nuestra.

---

## 8. Cómo se mide una receta

- **Rendimiento:** tiempo de carga, TTFT (tiempo hasta el primer token), tokens/s. El
  `benchmark` del repo.
- **Calidad en lo que importa:** la tasa de bucles y los Triggers de la Work Cell (guantes,
  móvil, taza), no la prosa bonita.
- **Tamaño del IR.**
- **Calidad genérica (opcional):** perplejidad o *who_what_benchmark* (WWB) de OpenVINO,
  que compara las respuestas del modelo cuantizado con las del original por similitud.

La tabla que cierra #72 y #73: receta × motor × {tokens/s, tasa de bucles, tamaño}.

---

## 9. Glosario

**IR (Intermediate Representation).** El formato propio de OpenVINO para un modelo. Es un
par de ficheros: `.xml` (el grafo: operaciones y cómo se conectan) y `.bin` (los pesos). Es
«intermedio» porque no está ligado a ningún hardware: el mismo IR se **compila** después para
CPU, GPU o NPU. Un VLM no es un IR sino varios: `openvino_language_model`,
`openvino_vision_embeddings_model`, `…_merger_model`, `…_pos_model`,
`openvino_text_embeddings_model`, más el tokenizer y el detokenizer, que también son IRs.
Los pesos INT4 viven en el `.bin` junto a sus escalas; en el grafo aparecen como una
subcadena de descuantización (`compression_format dequantize`) que cada plugin fusiona con
la multiplicación.

**OpenVINO.** El runtime de inferencia de Intel. Cada tipo de dispositivo tiene su
**plugin** (CPU, GPU, NPU); al cargar un IR se le dice el dispositivo y el plugin lo compila.

**OpenVINO GenAI.** La capa encima de OpenVINO para modelos generativos: el bucle de
generación token a token, la KV cache, el tokenizer, el `VLMPipeline` que usamos. Recibe el
dispositivo; nunca lo elige.

**optimum-intel (`optimum-cli export openvino`).** La herramienta de Hugging Face que
convierte un modelo de `transformers` a IR y, al exportar, llama a NNCF para cuantizar.

**NNCF (Neural Network Compression Framework).** La librería de Intel que hace la
cuantización: RTN, AWQ, scale estimation, GPTQ, precisión mixta. Deja constancia de lo que
aplicó en el `rt_info` del IR.

**Execution Provider (EP).** En el vocabulario del repo, el backend de hardware concreto:
CPU, GPU o NPU a través de Foundry Local u OpenVINO. Una Variant es un modelo concreto sobre
un EP concreto.

**Foundry Local / ONNX Runtime GenAI.** La otra pila: modelos en ONNX, cuantizados con el
operador `MatMulNBits` (pesos a N bits por bloques). Su catálogo en este portátil sólo trae
Qwen3-VL para CPU; por eso exportamos nosotros el IR para GPU y NPU.

**Compilación y `CACHE_DIR`.** Al cargar, el plugin traduce el IR a código de su
dispositivo. En el NPU es cara (~32 s); `CACHE_DIR` guarda el *blob* compilado junto al IR y
la siguiente carga tarda ~2 s.

**Prefill y decode.** Las dos fases de generar: el *prefill* procesa el prompt (y la imagen)
de una vez y es intensivo en cálculo; el *decode* genera token a token y es intensivo en
memoria. El TTFT mide sobre todo el prefill; los tokens/s, el decode.

**KV cache.** Lo que el modelo guarda de los tokens anteriores para no recalcularlos. Crece
con la conversación y también se puede cuantizar (la CPU de OpenVINO la guarda en 8 bits por
defecto).

**FP16 / BF16 / FP32.** Coma flotante de 16 (dos variantes) o 32 bits. BF16 tiene más rango
y menos precisión que FP16; los pesos de Qwen vienen en BF16.

**RTN (round-to-nearest).** Cuantizar redondeando cada peso al escalón más cercano, sin
datos. La base de todas las recetas.

**Outlier.** Un peso (o activación) mucho mayor que sus vecinos. Fija la escala de su grupo
y aplasta a los demás; es la razón de ser de los grupos pequeños y de AWQ.

**Calibración.** Pasar datos reales por el modelo durante la cuantización para ver qué
activaciones aparecen y elegir mejor escalas o capas sensibles.

**AWQ, scale estimation, GPTQ.** Tres formas de usar esos datos (ver §3). AWQ protege los
canales importantes; scale estimation ajusta escalas para minimizar el error de salida; GPTQ
compensa el error capa a capa.

**Precisión mixta / backup precision.** Dejar algunas capas en un formato más ancho (INT8 o
FP16) mientras el resto va en INT4. La controla `--ratio`.

**Greedy / sampling / repetition penalty.** Greedy elige siempre el token más probable
(determinista, propenso a bucles). Sampling elige al azar entre los probables (`temperature`,
`top_p`, `top_k`). La penalización de repetición abarata los tokens ya usados.

**`ACTIVATIONS_SCALE_FACTOR`.** Una opción de ejecución que optimum escribe en el IR (aquí,
8.0): escala las activaciones para que no desborden el rango de FP16 en GPU y NPU.

**Provenance (`provenance.json`).** El manifiesto que dejamos junto a cada IR: pesos de
origen, receta, versiones del toolchain y EP. Un IR no tiene id de catálogo; esto es su
identidad.

---

## 10. Preguntas probables del público

**«¿Por qué no usar FP16 y ya?»** Porque no cabe bien ni corre rápido: el decode está
limitado por memoria, y el 4B en FP16 son casi 9 GB en memoria compartida.

**«Entonces, ¿INT4 es malo?»** No. El build de Foundry Local es INT4 y va bien. Lo malo es
nuestra receta, la más gruesa posible, elegida porque el NPU la carga.

**«¿Por qué no usas la misma receta que Foundry Local en el NPU?»** Porque el NPU acelera
sobre todo el formato por canal simétrico; con grupos pequeños puede no cargar o ir más
lento. Para el NPU la palanca es usar datos (AWQ, scale estimation), no cambiar el formato.

**«¿Cuánto se tarda en exportar?»** Minutos, en CPU, una vez; no necesita el NPU. Con datos
de calibración tarda bastante más y necesita más memoria.

**«¿La imagen de calibración sale de la máquina?»** El dataset (`textvqa`) se descarga de
Hugging Face al exportar, igual que los pesos: cruza el cable una vez, al preparar la
máquina, nunca durante la demo. Encaja con «What crosses the wire? The model, once, while
you prepare the machine».

**«¿Y el NPU compensa si es más lento que la GPU?»** Hoy, en este portátil, no en tokens/s
(21,8 frente a 56,0). Su argumento es la eficiencia por vatio y liberar la GPU; los datos
cuantitativos de Intel son de la siguiente generación (Panther Lake). Ver las notas del deck.
