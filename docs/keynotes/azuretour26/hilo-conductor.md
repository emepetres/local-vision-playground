# El hilo conductor: «What crosses the wire?»

Informe para el ponente. Explica qué significa la pregunta, qué se pregunta en cada momento
de la charla, qué implica cada respuesta y cómo contarlo. Basado en `deck.md` y
`beat-sheet.md` de esta carpeta.

---

## 1. La idea en una frase

La sala llega pensando que la decisión es binaria: **o todo en la nube, o todo en local**.
La charla sustituye esa pregunta por otra más útil:

> No importa tanto *dónde* corre cada cosa. Importa **qué información cruza cada frontera**.

«The wire» es **el cable**: cualquier frontera por la que viaja información. La pregunta
«what crosses the wire?» se repite al final de cada bloque para ir mostrando, pieza a pieza,
que **la imagen nunca cruza ninguna frontera**. Lo que cruza es texto: una frase, una
pregunta, una línea de JSON. Al final eso se convierte en la tesis:

> **The image stays. The conclusion may leave.**
> La imagen se queda donde se tomó. La conclusión puede salir.

Y de ahí sale la consecuencia práctica: como sólo sale texto, puedes mandar ese texto a un
agente en Azure (el de la charla de las 11:35) sin haber tomado una decisión de privacidad
sobre las imágenes. Lo local y la nube dejan de ser excluyentes.

### Por qué funciona como hilo

- Es **una pregunta, no una afirmación**: la sala la anticipa y empieza a responderla sola
  hacia el tercer bloque.
- Tiene un **portador** concreto: *la frase*. La primera demo (D1) escribe una frase sobre
  ti; esa misma idea —«lo que sale es una frase, nunca una cara»— cierra la charla.
- Encaja con el **modo avión**: el portátil no tiene red en toda la charla, así que la
  sala puede comprobar que, literalmente, nada ha salido.

---

## 2. Qué es «el cable» (y la trampa)

Aquí está probablemente la fuente de tu duda: **«el cable» no es siempre el mismo cable**.
A lo largo de la charla la frontera cambia de sitio:

| Frontera                        | Dónde aparece                    |
| ------------------------------- | -------------------------------- |
| Cámara → modelo de visión       | Bloque 1 (el frame)              |
| Persona ↔ modelo                | Bloque 2 (la pregunta)           |
| Internet → portátil             | Bloque 3 (el modelo)             |
| Motor de hardware (CPU/GPU/NPU) | Bloque 4 (el hardware)           |
| Proceso de visión → Agente      | Bloque 5 (la costura, «seam»)    |
| Agente → el mundo (toast, log)  | Bloque 6 (la acción)             |
| Estación → Azure                | Cierre (el híbrido)              |

Eso no es un defecto; es lo que hace que la pregunta sirva de criterio: **en cualquier
frontera que dibujes, pregúntate qué la cruza**. Pero conviene decirlo en voz alta la
primera vez, o la sala (y tú) puede perderse cuando en el bloque 3 la respuesta pasa de
«una frase» a «el modelo».

**Recomendación:** cuando plantes la pregunta (la diapositiva sin respuesta, justo después
de «Local AI is a chat toy»), define el cable una vez. Algo así:

> «Cada vez que acabe una pieza os voy a hacer la misma pregunta: ¿qué ha cruzado el cable?
> Y por cable entiendo cualquier frontera: entre la cámara y el modelo, entre dos
> procesos, entre este portátil e internet. La respuesta de hoy nunca va a ser una imagen.»

Otra nota menor: en el deck la pregunta está en presente —«What **crosses** the wire?»—,
no en pasado. En español, «¿Qué cruza el cable?» o «¿Qué ha cruzado el cable?» funcionan
las dos; elige una y mantenla siempre igual, que la repetición literal es lo que la
convierte en estribillo.

---

## 3. Bloque a bloque

Para cada bloque: qué frontera miras, qué cruza, qué **no** cruza, qué implica, y la frase
que deja la diapositiva.

### Plantar la pregunta (tras «Local AI is a chat toy…»)

- **Qué haces:** enuncias la creencia de la sala (lo local es un juguete; la nube o nada) y
  sueltas la pregunta **sin responderla**.
- **Qué implica:** estás cambiando la pregunta binaria «¿local o nube?» por otra
  graduable. La sala aún no lo sabe; lo irá descubriendo.

### Bloque 1 — El frame → **«A sentence»**

- **Frontera:** la salida del modelo de visión. Entra un frame de la cámara, sale… ¿qué?
- **Cruza:** una frase de texto («A man with a beard is sitting…»).
- **No cruza:** la imagen. Se queda en memoria del proceso de visión.
- **Qué implica:** la conversión imagen → texto ocurre **en el origen**, en la máquina que
  tiene la cámara. A partir de aquí, todo lo que viaja es texto, y el texto es pequeño,
  legible y auditable. Foundry Local 2.0 refuerza esto: corre dentro del proceso (no hay
  salto HTTP a un servicio), la telemetría se puede apagar y una Variant fijada arranca sin
  red.
- **Para contarlo:** «Entra una imagen, sale una frase. La imagen no ha ido a ningún sitio.»

### Bloque 2 — La pregunta → **«A question in, a sentence out»**

- **Frontera:** entre la persona y el modelo (la interacción).
- **Cruza:** en los dos sentidos, texto. Hacia el modelo, una pregunta escrita; de vuelta,
  una frase.
- **No cruza:** ni imagen, ni un modelo nuevo, ni datos de entrenamiento.
- **Qué implica:** cambiar *qué vigilas* es cambiar un texto. Un detector clásico
  necesitaría reentrenarse (datos, un científico de datos, un modelo nuevo desplegado). Aquí
  el control del sistema también es texto. La otra cara: esa flexibilidad obliga a medir la
  precisión, y a acotar la respuesta («Answer in one sentence»).
- **Para contarlo:** «Lo que entra es una pregunta; lo que sale, una frase. Sigue sin
  haber imagen en el cable.»

### Bloque 3 — El modelo → **«The model, once, while you prepare the machine»**

- **Frontera:** aquí el cable es **literalmente la red**: internet → portátil. Y el sentido
  es el contrario: algo *entra*.
- **Cruza:** los pesos del modelo, **una vez**, mientras preparas la máquina (descarga y
  exportación a OpenVINO INT4).
- **No cruza:** nada durante la operación. Desde que el portátil está preparado, cero
  tráfico.
- **Qué implica:** separa dos fases con reglas distintas. **Preparar puede usar la red.
  Operar no.** Es la respuesta honesta a la objeción obvia («pero el modelo lo bajaste de
  internet»): sí, una vez, antes; nunca mientras la cámara graba.
- **Ojo:** es la primera respuesta que no es «una frase». Es intencionado: la pregunta ahora
  se aplica al cable de red. Si has definido «el cable» al plantarlo, este salto se
  entiende solo.
- **Para contarlo:** «Lo único que ha cruzado la red ha sido el modelo, una vez, cuando
  preparé el portátil. Desde entonces, nada.»

### Bloque 4 — El hardware (el giro) → **«Nothing. Changing engines is changing a name.»**

- **Frontera:** la elección de motor: CPU, iGPU o NPU.
- **Cruza:** **nada**. Cambiar de motor es cambiar el nombre de la Variant en la línea de
  comandos. No hay descarga, ni servicio, ni cuenta en la nube.
- **Qué implica:** el eje del hardware es **independiente** del eje de privacidad. Puedes
  optimizar rendimiento, consumo o carga continua (la pregunta «qué motor aguanta un turno
  entero», no «cuál es el más rápido») sin mover la frontera de los datos. Es el bloque del
  giro: el error propio («medí la NPU con la regla de la GPU») cambia la pregunta de
  velocidad punta a trabajo sostenido, pero el cable sigue vacío.
- **Para contarlo:** «¿Qué ha cruzado el cable al cambiar de CPU a GPU a NPU? Nada. Cambiar
  de motor es cambiar un nombre.»

### Bloque 5 — La costura → **«One line of JSON»**

- **Frontera:** la más literal de todas. Entre el proceso de visión (Python) y el Agente
  (C#). Es el cable que se ve en el mapa del sistema, con la línea discontinua donde se
  para la imagen.
- **Cruza:** **una línea de JSON por Cadence**, escrita en un fichero `observations.jsonl`:
  lista de objetos, dónde está cada uno, el resultado. Sin socket, sin endpoint compartido.
- **No cruza:** nunca un Frame, ni siquiera la ruta a un Frame (ni con `--keep-frames`).
- **Qué implica:** la frontera es un **contrato** que se puede abrir y leer. Cualquiera
  puede auditar *todo* lo que el Agente ha recibido jamás: basta con abrir el fichero. Y por
  eso se pide una forma (JSON) y no prosa: un Trigger necesita algo comprobable (0 falsos
  Triggers con la lista frente a «manos desnudas» inventadas con la pregunta en prosa).
- **Para contarlo:** «Esto es todo lo que cruza de la visión al Agente. Una línea. Podéis
  leerla entera; yo la voy a enseñar en la demo.»

### Bloque 6 — La acción → **«Text. The Agent never sees an image.»**

- **Frontera:** el Agente y lo que hace (toast al supervisor, línea en el log de
  incidencias).
- **Cruza:** texto. El Agente lee Observations, escribe una frase para el supervisor y la
  registra. En el log: el Trigger, la Observation, la frase, la hora, si actuó el modelo…
  y **nunca un Frame**.
- **Qué implica:** este es el mecanismo de toda la charla (ADR-0003: el Agente consume
  Observations, no imágenes). **El Agente no puede filtrar una foto que nunca ha recibido.**
  No es una promesa ni una política; es la arquitectura. Y eso tiene una consecuencia
  enorme para el cierre: **dónde corre el Agente deja de ser una decisión de privacidad**.
  Podría correr en este portátil o en Azure.
- **Para contarlo:** «El Agente no puede filtrar una imagen que nunca le han dado. No es una
  promesa; es la arquitectura.»

### Cierre — el criterio y el híbrido → **«The image stays. The conclusion may leave.»**

- **Qué haces:** recoges las seis respuestas. En todas, la imagen se quedó; sólo cruzó
  texto (o, en preparación, el modelo). Entonces das el criterio de tres preguntas:
  1. ¿Puede la imagen salir del sitio?
  2. ¿La carga es continua?
  3. ¿Hay red cuando hay que decidir?

  Si alguna respuesta empuja hacia local, **la imagen se queda y sólo sale texto**.
- **La revelación:** «La pregunta nunca fue local o nube. Era qué cruza el cable.» Y la
  diapositiva de las estaciones hacia Azure: varias estaciones que se quedan sus imágenes y
  mandan frases a un agente de Foundry. **El cable ahora sí llega a la nube**, y no pasa
  nada, porque lo que viaja por él es una frase.
- **Qué implica:** desmontas la creencia binaria del principio. No hay que elegir entre
  Azure y el edge; hay que decidir **qué sale de la máquina**. De ahí la frase final: «This
  is not about switching off the Wi-Fi. It is about deciding what leaves the machine.»
- **Remate:** el modo avión lleva puesto toda la charla, y «lo que se guarda es una frase,
  nunca una cara».

---

## 4. Resumen en una tabla

| Bloque        | Frontera              | Qué cruza                        | Qué implica                                        |
| ------------- | --------------------- | -------------------------------- | -------------------------------------------------- |
| 1. Frame      | cámara → modelo       | una frase                        | la imagen se convierte en texto en el origen       |
| 2. Pregunta   | persona ↔ modelo      | una pregunta y una frase         | cambiar qué vigilas es escribir texto              |
| 3. Modelo     | internet → portátil   | el modelo, una vez, al preparar  | preparar puede usar red; operar no                 |
| 4. Hardware   | CPU / GPU / NPU       | nada                             | el hardware no mueve la frontera de los datos      |
| 5. Costura    | visión → Agente       | una línea de JSON                | la frontera es un contrato legible y auditable     |
| 6. Acción     | Agente → mundo        | texto; nunca una imagen          | privacidad por arquitectura; el Agente puede ir a cualquier sitio |
| Cierre        | estación → Azure      | frases                           | local y nube no son excluyentes                    |

La progresión tiene sentido: empiezas dentro del modelo (1, 2), sales a la red (3), miras
el silicio (4), recorres las fronteras entre procesos (5, 6) y terminas en la frontera más
grande, la de la nube (cierre). Cada respuesta amplía un poco el perímetro, y en todas la
imagen se queda dentro.

---

## 5. Preguntas incómodas que puede provocar el hilo

Precisamente porque la pregunta es tan clara, invita a objeciones. Estas son las probables:

- **«Pero el modelo sí lo descargaste de internet.»** Sí: bloque 3. Una vez, al preparar.
  Preparar puede usar la red; operar no.
- **«¿Y la telemetría de Foundry Local / ONNX Runtime?»** Apagada de forma incondicional por
  el propio proceso (`ORT_TELEMETRY_DISABLED` y `disable_nonessential_telemetry`). Y en
  cualquier caso, el portátil está en modo avión.
- **«Una frase también puede ser un dato personal.»** Es la objeción más seria, y tiene
  razón: «un hombre con barba…» describe a una persona, y «trabajando sin guantes» asociado
  a un puesto y una hora puede identificar a un trabajador. La respuesta honesta: la frase
  es **mucho menos** que la imagen, **la eliges tú** (por eso se pide una forma acotada —una
  lista de objetos— y no prosa libre) y **se puede leer entera** antes de dejarla salir.
  No es anonimato automático; es que la decisión de qué sale pasa a ser tuya y auditable.
  Eso es, justamente, la tesis: decidir qué sale de la máquina.
- **«Entonces, ¿para qué la nube?»** Para lo que la nube hace bien: ver todas las estaciones
  desde la oficina central, cargas a ráfagas, agentes más grandes. Alimentada con frases,
  no con frames. Nada del diseño tiene que cambiar.

---

## 6. Chuleta para el escenario

- Al **plantar** la pregunta: defínela («cualquier frontera») y di que no la vas a responder
  todavía.
- Al **final de cada bloque**: haz la pregunta siempre con las mismas palabras, pausa, y
  deja que aparezca la respuesta en la diapositiva (`[+]`).
- En el **bloque 3**, remarca el cambio: «esta vez el cable es la red».
- En el **bloque 6**, di la frase clave despacio: «no es una promesa; es la arquitectura».
- En el **cierre**: «la pregunta nunca fue local o nube; era qué cruza el cable» → las
  estaciones hacia Azure → señala el icono del modo avión.
