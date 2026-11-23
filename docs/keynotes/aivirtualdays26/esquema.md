# Lo que pasa en el portátil se queda en el portátil — esquema

AI Virtual Days 2026 · sáb. 14-nov-2026, 12:50, Track Horizonte (online) · 45 min · nivel 300 · ritmo ~35 s/cambio

## Tesis

> Tu agente no necesita ver para actuar: si el modelo convierte la imagen en una frase dentro del portátil, la privacidad deja de ser un problema de dónde corre la IA.

Refuta: para que un agente actúe sobre lo que ve una cámara, las imágenes tienen que irse a la nube, y eso es justo lo que ciberseguridad y legal no van a firmar. Debajo: la NPU y la GPU del portátil no sirven para nada serio.
Solo yo: tres motores medidos en el mismo Zenbook (4B: iGPU 3,46 s, NPU 5,72 s, CPU por medir); el 4B en la NPU limpio en 32 de 32 donde el 2B entraba en bucle; el modelo de visión que obedeció 0 de 11 llamadas a herramienta forzadas; el modelo que ve no es el que actúa (el 1.5B llama a sus herramientas 10/10 en CPU, 0/10 en GPU y NPU); ningún modelo de este tamaño ve que falta una pieza.

## Audiencia

Comunidad Microsoft hispanohablante, online, en un track lleno de Copilot, Fabric y agentes en la nube; nivel 300, desarrolladores .NET/Azure que ya han construido un agente contra un LLM en la nube. Creen que agente = LLM en la nube y que la NPU del portátil es marketing; casi nadie ha usado modelos de visión en local para aplicaciones en producción.

## Takeaway

El patrón: el modelo de visión convierte la imagen en una frase dentro del dispositivo y el agente solo lee frases, así que dónde corre el agente deja de ser una decisión de privacidad. Y el criterio para decidir qué se queda en el edge: ¿puede salir la imagen? ¿la carga es continua? ¿hay red cuando hay que decidir?

## Arco

Portador: la frase — la Observation literal que el modelo escribe; lo único que lee el agente; "una frase, nunca una cara" · Giro: fila 9

| #   | Sección                                          | Min | Qué cuenta                                                                                                                                                           | Estado      |
| --- | ------------------------------------------------ | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Apertura                                         | 3   | Cámara, NPU y GPU que solo usas en videollamadas; bloqueo de salida en el firewall a los procesos de la demo, en directo; la creencia dicha en voz alta              | ✅ decidido |
| 2   | Demo D1: `observe` en FL-CPU                     | 2   | prueba que es real y sin red: la primera frase, sobre el ponente                                                                                                     | ✅ decidido |
| 3   | Escenario                                        | 3   | Línea de montaje: graba a personas, red aislada, carga continua; por qué ciberseguridad y legal dicen no a la nube                                                   | ✅ decidido |
| 4   | El mapa                                          | 2   | Cámara → vision → JSONL → agente → aviso y registro, todo dentro del portátil                                                                                        | ✅ decidido |
| 5   | Dos motores                                      | 4   | El catálogo de Foundry Local solo publica CPU en este portátil → exportar con OpenVINO; la receta                                                                    | ✅ decidido |
| 6   | Más lento que la cámara                          | 2   | La Cadence pide, no garantiza; se descarta, nunca se encola; Shortfall                                                                                               | ✅ decidido |
| 7   | Demo D3: cara a cara CPU / iGPU / NPU en el 4B   | 4   | prueba que el portátil aguanta: Shortfall visible en la CPU, tabla, la NPU pasa; "tu portátil ya es el servidor"; elige el motor para lo que sigue                   | ✅ decidido |
| 8   | Demo D2: `watch` + Scene Questions en el 4B      | 4   | prueba la flexibilidad que un detector no tiene: "qué hay" y preguntas tecleadas en marcha; "qué falta" como hallazgo (~30 s)                                        | ✅ decidido |
| 9   | La costura (giro)                                | 4   | Una línea del JSONL: "esto es todo lo que verá el agente"; 0 de 11; prosa frente a forma                                                                             | ✅ decidido |
| 10  | Demo D4: sin guantes → agente → aviso y registro | 6   | prueba que el agente actúa sin ver una imagen: N Observations seguidas → Incident; el modelo que ve no es el que actúa; adaptador acreditado a Bruno Capuano. Clímax | ✅ decidido |
| 11  | El criterio                                      | 3   | Las tres preguntas; capacidad como cota superior (⌊Cadence / latencia⌋); el híbrido: la imagen se queda, la conclusión puede subir                                   | ✅ decidido |
| 12  | Cierre                                           | 2   | Se quita el bloqueo; "una frase, nunca una cara"; el repo; "a continuación, en este track, Bruno Capuano"                                                            | ✅ decidido |

Presupuesto: 45 − 5 de colchón − 1 de marco del evento = 39 min útiles. Demos: 16 min.
Cambios visibles: (39 − 16) × 60 / 35 ≈ 39.

## Promesas del abstract

- Cámara, NPU y GPU del portátil trabajando en directo → filas 1, 7
- Un agente que vigila un puesto, entiende y actúa sin que salga una imagen → filas 9, 10
- Caso real: línea de montaje, personas, red aislada, carga continua → fila 3
- "Las imágenes nunca salen de este dispositivo" consigue la aprobación → fila 3 (dicho como ciberseguridad y legal, no comité de empresa)
- Observaciones en texto: qué hay → fila 8; qué falta → fila 8, como hallazgo negativo; qué ha cambiado → fila 10
- Preguntas en lenguaje natural sobre lo que se ve → fila 8
- Agente C# con Microsoft Agent Framework que solo lee frases, avisa y registra en local → fila 10
- Por qué dos motores de inferencia en la misma máquina → fila 5
- Qué pasa cuando el modelo va más lento que la cámara → filas 6, 7
- Números reales de CPU, GPU y NPU del mismo portátil, cara a cara → fila 7
- Un patrón local first aplicable mañana → filas 9, 10
- Criterio de qué se queda en el edge y qué sube a la nube → fila 11

## Fuera de alcance

Entrenamiento y fine-tuning; el precio por imagen de una API de visión en la nube (el ítem 9 del backlog no está construido); medidas de energía propias; Phi-4-multimodal; los detalles internos de NNCF y AWQ; la transcripción en directo.

## Decisiones

- 2026-11-11 — Descartada la NPU como motor del watch en D2 y D4: probada en D4, va lenta para el directo; el watch corre en la iGPU y la NPU queda en D3.
- 2026-11-11 — Descartado "1 cámara por portátil" como cifra de capacidad: en planta habrá un dispositivo edge tipo mini-PC, y cuántas cámaras lleva depende de ese dispositivo; se da la fórmula y el dato de este portátil de 2025, sin recomendar ningún modelo.
- 2026-11-11 — Descartado reponer _Computer Vision in Airplane Mode_ con retoques: charla nueva que reutiliza demos y hallazgos, porque #80–#82 cambian la historia de la NPU.
- 2026-11-11 — Descartado el portador "what crosses the wire?": resultó poco natural en Azure Tour.
- 2026-11-11 — Descartada como tesis "el portátil que usas para videollamadas ya es el servidor de visión que buscas en la nube": se guarda como frase en la fila 7.
- 2026-11-11 — Descartado "comité de empresa": forzado; se dice ciberseguridad y legal.
- 2026-11-11 — Descartado el modo avión en la apertura, y un vídeo grabado en modo avión: el evento es online y el portátil emite; se bloquea la salida de los procesos de la demo en el firewall.
- 2026-11-11 — Descartado el giro en la NPU (orden de Azure Tour): la tesis es que el agente no necesita ver, así que gira en la costura.
- 2026-11-11 — Descartado D3 al final: tras D2 y D4 baja el ánimo; el arco va in crescendo D1 → D3 → D2 → D4.
- 2026-11-11 — Descartado D3 sobre el 2B: con #82 el 4B en la NPU pasa el listón, y es el modelo que vigila la Work Cell.
- 2026-11-11 — Descartado referenciar charlas previas de la agenda: no hay descripciones; solo se menciona a Bruno Capuano, que sigue en el mismo track.
