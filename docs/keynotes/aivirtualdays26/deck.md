---
title: What Happens on the Laptop Stays on the Laptop
language: es
accent: "#0078D4"
---

type: title

# What Happens on the Laptop Stays on the Laptop
A camera, a local vision model and an agent that never sees an image

::: notes
AI Virtual Days 2026, Track Horizonte, 12:50. Javier Carnero, Plain Concepts.
Cámara encendida, Work Cell en la mesa, tres terminales abiertos.
:::

---

type: statement

# A camera, a GPU and an NPU
[+] busy with video calls, and little else

::: script
Tu portátil tiene una cámara, una GPU y una NPU.
Y casi siempre las usas para lo mismo: videollamadas como esta.
Hoy las vamos a poner a trabajar. En directo, y sin que salga una imagen.
:::

---

type: image
src: !todo "capture: Windows Defender Firewall with the outbound block rules for the demo's python and Agent executables, enabled"
alt: outbound firewall rules blocking the demo processes

outbound: blocked, for every process in this demo

::: notes
No puedo poner modo avión: este portátil emite la charla. Bloqueo la salida de los procesos de la demo, no la del portátil.
Activar las reglas en directo. Se quedan puestas hasta el cierre.
ENSAYAR: observe, watch y el agente arrancan con la salida bloqueada y el Variant fijado, sin esperar al catálogo.
:::

::: script
No puedo poner el portátil en modo avión, porque es el que os está emitiendo.
Así que hago algo más preciso. Bloqueo la salida a internet de cada proceso de la demo.
La emisión sigue. La demo no tiene red. Y así se queda hasta el final.
:::

---

type: statement

# "To act on what a camera sees, the images go to the cloud."

::: notes
La creencia de la sala, dicha como suya. Sin referencias a charlas anteriores.
:::

::: script
Casi todos los agentes que habéis construido hablan con un modelo en la nube.
Así que asumimos lo obvio: si el agente tiene que actuar sobre una cámara, las imágenes suben.
Y ahí se acaba el proyecto. Porque ciberseguridad y legal no van a firmar eso.
:::

---

type: demo

# Demo: one look
a local model describes me, with no network

::: notes
D1. `uv run observe --camera 0 --variant qwen3-vl-2b-instruct-generic-cpu:2`. Foundry Local, CPU.
Leer en voz alta la frase que escribe.
Plan B: la salida del README (1,2 s, la estantería con cohetes).
:::

---

type: statement

# It wrote a sentence about me
[+] and the picture never left this laptop

::: notes
Planta el portador: la frase. Vuelve en la costura y en el cierre.
:::

::: script
Un modelo me ha mirado y ha escrito lo que veía.
La imagen no ha ido a ningún sitio. Lo que ha salido es una frase.
Quedaos con esa frase. Es lo único que va a leer el agente.
:::

---

type: bullets

## A workstation on a production line
- the camera films people
- the plant network is cut off from the internet
- the camera watches all shift, every shift

::: notes
El caso real que ancla la demo. docs/business-value.md.
El tercer dato es el que importa para el coste, al final.
:::

---

type: image
src: images/work-cell.png
alt: desk-scale work cell with a green mat, a parts tray, gloves and a camera

the work cell, at desk scale

::: notes
La alfombrilla verde es la Zone; la bandeja blanca, la Tray con seis piezas.
El supervisor quiere saber tres cosas: falta una pieza, alguien trabaja sin guantes, algo se queda en la alfombrilla.
Hoy solo los guantes van en directo. Más adelante cuento por qué.
:::

---

type: statement

# "No image ever leaves this device."
[+] the sentence security and legal will sign

::: script
En una planta así, la nube no es viable. La red está aislada y la cámara graba a personas.
Y hay una frase que desbloquea el proyecto: ninguna imagen sale de este dispositivo.
Esa es la frase que firman ciberseguridad y legal. Vamos a hacerla verdad.
:::

---

type: image
src: !todo "draw: the whole system inside one laptop outline: a camera, then a box labelled vision (Python, Qwen3-VL), then a single sheet labelled observations.jsonl, then a box labelled Agent (C#, Agent Framework), then a notification bell and a log file; a dashed boundary around the camera and the vision box marks where the image stops; only text flows past it; no airplane icon"
alt: camera, vision, a JSON Lines file, the agent, a notification and a log, all on one laptop

the whole system, on one laptop

::: notes
Versión de Azure Tour sin el icono de modo avión. Se redibuja.
:::

::: script
Este es todo el sistema. Dos procesos en un portátil.
El primero ve: convierte una imagen de la cámara en texto. El segundo decide y actúa.
Entre los dos hay un fichero. Fijaos en la línea discontinua: la imagen nunca la cruza.
:::

---

type: bullets

## The stack
- Qwen3-VL 4B, the model that sees
- Foundry Local 2.0.1, in-process
- OpenVINO GenAI 2026.4, for the GPU and the NPU
- Microsoft Agent Framework 1.22, on .NET 10

::: notes
Todo versiones estables, nada en preview. Python para visión, C# para el agente.
Qwen3-VL y no Phi-4-multimodal: ADR-0001. Dos Runtimes: ADR-0012.
:::

---

type: section

# Two engines on one machine

---

type: bullets

## What the catalogue offers this laptop
- `qwen3-vl` on the CPU
- no GPU build
- no NPU build

::: notes
Verificado con `foundry model list` en esta máquina. El catálogo se filtra por dispositivo.
Arc 140V y NPU Intel AI Boost. Las builds de NPU de Foundry Local aquí son de chat, ninguna con visión.
:::

::: script
Este portátil tiene GPU y NPU. El catálogo ofrece este modelo solo para la CPU.
Si quieres los aceleradores, el modelo te lo construyes tú. Con un segundo motor: OpenVINO.
:::

---

type: code
file: vision/tools/convert/convert.py

```bash
uv run python tools/convert/convert.py \
  --weights Qwen/Qwen3-VL-4B-Instruct \
  --recipe int4-sym-cw
```

::: notes
Una vez, en la CPU, sin NPU. Receta: INT4 simétrico, channel-wise (group-size -1), ratio 1.0. 2,9 GB en disco.
Si preguntan: provenance.json guarda la receta junto al IR; transformers 4.57; CACHE_DIR para la primera compilación de la NPU (54 s).
:::

---

type: image
src: images/int4-one-ir.png
alt: 16-bit weights compressed to 4-bit, one file for three engines

sixteen bits to four, one file for three engines

::: script
Cada peso pasa de dieciséis bits a cuatro.
Un solo fichero exportado sirve a la CPU, a la GPU y a la NPU.
:::

---

type: statement

# The recipe sets the price
[+] and at 4B, the cheapest one is enough

::: notes
En el 2B, este mismo INT4 channel-wise entraba en bucle ("A white door is in the center" x4).
En el 4B: 0 bucles de 5 y forma correcta en 32 de 32, en channel-wise y en group-wise 128. #82.
El IR de Intel (g128) escribe palabra por palabra lo mismo que nuestro g128: no lo exportamos mal.
:::

::: script
En el 2B, esta receta hacía que el modelo se repitiera sin parar.
Cambié de receta, cambié de exportación, probé el modelo de Intel.
Lo que lo arregló fue el tamaño. A 4B, la receta más barata ya es suficiente.
:::

---

type: comparison

::: Queue every frame
- the delay grows every second
- you observe the past
:::

::: Skip to the present
- always the latest frame
- what it cost, counted: the Shortfall
:::

::: notes
ADR-0006. La Cadence es una petición, no una garantía.
Si la inferencia tarda más que la Cadence, se saltan las Cadences pasadas y se descartan los Stale Frames. Ambos se cuentan en la Observation donde ocurrieron.
:::

::: script
¿Qué pasa cuando el modelo va más lento que la cámara?
Si encolas, cada segundo llegas más tarde. Acabas vigilando el pasado.
Así que no encolo. Salto al presente, y digo cuánto me ha costado. Eso es el Shortfall.
:::

---

type: demo

# Demo: three engines, one name
the same watch on the CPU, the GPU and the NPU, changing only the Variant

::: notes
D3, el 4B, `--ask "What is the person doing? Answer in one sentence."`:
`--variant qwen3-vl-4b-instruct-generic-cpu:3` (VERIFY: versión actual), luego `qwen3-vl-4b-instruct-int4-sym-gpu`, luego `qwen3-vl-4b-instruct-int4-sym-cw-npu`.
En la CPU, señalar el Shortfall que aparece. En la NPU, ya compilada antes de la charla.
Cierra eligiendo la iGPU para lo que sigue: es la más rápida, y la NPU va justa para D4 en directo.
:::

---

type: bullets

## Qwen3-VL 4B, same image, same prompt
- Arc iGPU, OpenVINO: 3.5 s · 25.2 tokens/s
- NPU, OpenVINO: 5.7 s · 14.5 tokens/s
- CPU, OpenVINO: VERIFY
- CPU, Foundry Local: VERIFY

::: notes
VERIFY (#86): Benchmark nuevo del 4B en las cuatro filas, en una sola sesión, antes del 14-nov. Hoy solo hay iGPU y NPU (#82, 2026-11-04, 5 repeticiones, 128 tokens, temperatura 0).
La NPU no es más rápida que la iGPU en este modelo. Se dice una vez y no se insiste.
A favor de la NPU, medido aquí: carga con caché en 4-5 s frente a 17 s de la iGPU; deja libres CPU y GPU para el resto del puesto.
De Intel, etiquetado como de Intel: en Panther Lake, 2,8x rendimiento por vatio de la NPU sobre la GPU (Gemma 4 E2B). Otra generación, otro modelo.
:::

---

type: statement

# The NPU passes
[+] 32 of 32 on the work cell, where the 2B looped

::: notes
El listón: 0 de 5 bucles y la forma correcta con objetos en las 32 fotos de la Work Cell. Las tres Variants de NPU lo pasan.
Lo que no dice: no se ha puntuado la NPU contra los Triggers. "Pasa" es fiable en forma, no probado igual de preciso.
:::

::: script
La NPU no gana en velocidad. Pero ahora cumple, y en el 2B no cumplía.
Sin bucles, y con la forma correcta en las treinta y dos fotos.
Hoy la demo sigue en la GPU, porque es más rápida. Pero la NPU ya es un tercer motor de verdad.
:::

---

type: statement

# The laptop you use for video calls
[+] is the vision server you were pricing in the cloud

---

type: demo

# Demo: ask the watch
change what is watched by typing a question

::: notes
D2. `uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu`. El 4B en la iGPU, el elegido en D3.
"Is there a phone or a cup on the green mat? Answer in one or two sentences." Taza al lado primero, luego encima.
Luego "What is the person doing? Answer in one sentence."
La pregunta entra en la siguiente Cadence: decirlo, no esperar en silencio.
:::

---

type: comparison

::: A detector
- a fixed list of classes
- retrained when the list changes
:::

::: A vision-language model
- a list anyone changes by typing
- an accuracy you have to measure
:::

::: script
En producción hoy hay detectores, entrenados para una lista fija.
Aquí he tecleado una pregunta nueva. Sin modelo nuevo y sin científico de datos.
Esa flexibilidad es la razón para usar un modelo de visión y lenguaje. Y también la razón para medirlo.
:::

---

type: statement

# "What is missing from the tray?"
[+] It invents nothing. It misses the small parts.

::: notes
Spike del 2026-09-24. La pieza quitada falta en la lista 6 de 6. Pero la brocha falta en 26 fotos en las que está.
Con el 2B, "falta una pieza" salta en las 16 fotos sin nada quitado. Con la lista pieza a pieza, recita la lista y no mira.
El Trigger está construido y apagado.
:::

::: script
El abstract os prometía "qué falta". Lo medí antes de prometerlo en un escenario.
El modelo no se inventa piezas. Se le escapan las pequeñas, la brocha, las pinzas.
Un aviso así saltaría todo el turno. Por eso está apagado.
:::

---

type: code
file: docs/fixtures/watch-emit-contract.jsonl

```json
{"type": "cadence", "cadence": 1,
 "time": "2026-09-24T10:30:02+02:00",
 "variant": "qwen3-vl-2b-instruct-cuda-gpu:2",
 "outcome": "objects",
 "objects": [
   {"name": "soldering iron", "count": 1, "where": "tray"},
   {"name": "bare hand", "count": 1, "where": "hand"}],
 "truncated": false, "shortfall": null}
```

::: notes
GIRO. Una línea del fixture de contrato, partida para la diapositiva. ADR-0014.
Nunca un Frame ni una ruta a uno, ni siquiera con --keep-frames.
:::

::: script
Esto es todo lo que va a ver el agente. Todo.
Una línea de JSON por Cadence, en un fichero. Sin socket, sin endpoint compartido.
No hay imagen que proteger, porque al agente nunca le llega una.
:::

---

type: stat

# 0 of 11
forced tool calls with an image that the vision model honoured

::: notes
Spike del 2026-09-15. ADR-0011. La forma se pide en el prompt y se parsea lo que vuelve.
:::

::: script
Para llegar a esa línea, primero pedí al modelo de visión que llamara a una herramienta.
No lo hizo ni una vez de once. Así que dejé de forzarlo y pido la forma en el prompt.
:::

---

type: comparison

::: Asked in prose
- "Is each visible hand bare or gloved?"
- "bare" on 4 of 6 photos with no hands at all
:::

::: Asked for a shape
- a list of objects and where each one is
- 0 false Triggers on 17 photos with no bare hand
:::

::: notes
Las dos en el 4B iGPU, mismas fotos. docs/research/2026-09-24-d2-scene-questions.md.
:::

::: script
Preguntar es para personas. Un Trigger necesita una forma.
En prosa, el modelo encontró manos desnudas en fotos sin manos. Con una lista, ninguna falsa alarma.
:::

---

type: statement

# The agent never sees an image
[+] so where it runs stops being a privacy question

::: script
Este es el giro. El agente no necesita ver para actuar.
Si el modelo convierte la imagen en una frase dentro del portátil, el agente solo lee frases.
Y entonces dónde corre el agente deja de ser un problema de privacidad.
:::

---

type: image
src: images/maf-bridge.png
alt: Agent Framework over our own IChatClient over Foundry Local 2.0.1

Agent Framework, on Foundry Local 2.0.1

::: notes
ADR-0015. El adaptador de Bruno Capuano marcó el patrón: un IChatClient donde no hay uno oficial. Acreditarlo.
Por qué uno propio: el suyo fija Foundry Local 1.2.1, no apaga la telemetría y pierde tool calls en streaming.
:::

::: script
Agent Framework habla IChatClient. Foundry Local 2.0 no te da uno en .NET.
Bruno Capuano resolvió esto con un adaptador, y seguí su patrón para la versión 2.0.1.
:::

---

type: stat

# 10 of 10
Incidents where the 1.5B model called both tools, on the CPU. On the GPU and the NPU: 0 of 10.

::: notes
docs/benchmarks/tool-call-reliability-zenbook-20260925-114415.md. Ningún system prompt llegó a 10/10; sin system prompt, sí.
:::

::: script
El modelo que ve no es el modelo que actúa.
El que llama a herramientas de forma fiable solo lo hizo en la CPU.
Así que cada uno corre donde funciona. El portátil usa dos motores a la vez.
:::

---

type: bullets

## What has changed: when a Trigger fires
- its condition holds on N Observations in a row
- it re-arms after N in a row without it
- one firing is one Incident

::: notes
La promesa "qué ha cambiado": no lo decide el modelo, lo decide el Trigger sobre Observations seguidas.
Una Observation sin forma no cuenta ni a favor ni en contra. no_gloves con N = 2, en agent/work-cell.json.
:::

---

type: demo

# Demo: gloves off
bare hands on the mat, and the agent warns the supervisor from sentences alone

::: notes
D4, tres paneles: el agente, el watch con --structured --emit, y el fichero emitido.
`uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu --structured --every 10 --emit observations.jsonl`. iGPU: ~8 s por Frame estructurado, Cadence de 10 s.
Fuera guantes: no gloves 1/2, luego el Incident, la notificación y el registro. ~40 s: narrar sobre el fichero, nunca en silencio.
Plan B: la grabación.
:::

---

type: bullets

## The incident log
- the Trigger that fired
- the Observation that fired it, and the time
- whether the model acted
- [+] never a frame

::: notes
Señalar agent_acted. Si el modelo no llama a las dos herramientas, falla o tarda más de 60 s, la red de seguridad actúa por él, y el registro lo dice.
Guantes puestos: dos Cadences y "Incident cleared".
:::

::: script
El agente ha avisado al supervisor y lo ha apuntado. Mirad qué ha guardado.
El Trigger, la frase del modelo, la hora. Ni una imagen.
No puede filtrar una foto que nunca recibió. No es una promesa: es la arquitectura.
:::

---

type: bullets

## What stays at the edge
- May the image leave the site?
- Is the load continuous?
- Is the network there when the decision is due?

::: script
Tres preguntas. Si alguna te empuja a local, la imagen se queda donde se tomó.
Y solo sale texto.
:::

---

type: statement

# Cameras per box = Cadence ÷ inference time
[+] measured on your edge device, not on my laptop

::: notes
Un modelo sirviendo los Feeds en serie; cota superior para un Hardware Profile, nada más.
Este portátil, de 2025, con el 4B mirando guantes cada 10 s (~8 s por Frame en la iGPU): una cámara. Con una descripción cada 10 s (3,5 s): dos.
En planta no hay portátiles: hay un dispositivo edge, tipo mini-PC, junto a la cámara. Uno con más capacidad puede llevar varias. No se recomienda ningún modelo concreto.
:::

::: script
En una planta no vas a tener portátiles conectados a cámaras. Vas a tener un mini-PC industrial junto a cada puesto.
Cuántas cámaras lleva cada uno es una división: la Cadence entre lo que tarda el modelo.
Este portátil, de 2025, lleva una con el 4B mirando guantes cada diez segundos. Mide tu dispositivo.
:::

---

type: statement

# The image stays.
[+] The conclusion may leave.

::: script
Esto no es local contra nube. Si quieres ver todos los puestos desde la oficina central, sube las frases.
Cada imagen se queda en la máquina que la tomó. Y el diseño no cambia.
:::

---

type: statement

# This is not about cutting the network
[+] It is about deciding what leaves the machine

::: notes
Ahora se quitan las reglas del firewall, en pantalla.
:::

::: script
Ahora quito el bloqueo. Toda la charla ha corrido sin red.
Pero no se trata de desenchufar nada. Se trata de decidir qué sale de la máquina.
:::

---

type: statement

# What is kept is a sentence
[+] never a face

---

type: statement
link: https://github.com/emepetres/local-vision-playground

# Clone it. Measure your own machine.

::: notes
Todo lo que habéis visto está en el repo, con los benchmarks y las decisiones.
A continuación, en este mismo track, Bruno Capuano. Solo el dato, nada de su contenido.
:::
