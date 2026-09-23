# AI Virtual Days 2026

https://sessionize.com/ai-virtual-days-msh-en-espanol/

## Keynote

**Lo que pasa en el portátil se queda en el portátil**

Tu portátil tiene cámara, NPU y GPU, y casi nunca las usas para algo más que videollamadas. En esta sesión las ponemos a trabajar, en directo: un agente que vigila un puesto de trabajo a través de la cámara, entiende lo que ocurre y actúa, sin que una sola imagen salga de la máquina.

Partimos de un caso real: una línea de montaje donde la cámara graba a personas, la red de planta está aislada de internet y la carga es continua, turno tras turno. En estos casos ejecutar en la nube no es viable, y "las imágenes nunca salen de este dispositivo" es la frase que consigue que el comité de empresa apruebe el proyecto. Con Foundry Local sirviendo un modelo de visión y lenguaje, convertiremos el vídeo en observaciones en texto (qué hay, qué falta, qué ha cambiado) y responderemos en lenguaje natural preguntas sobre lo que se ve en ese momento.

Encima construiremos un agente en C# con Microsoft Agent Framework que nunca ve una imagen: solo lee frases. Decide cuándo algo merece un aviso, avisa al supervisor y lo apunta en un registro local. Una frase, nunca una cara.

Y contaremos lo que no sale en los tutoriales: por qué acabamos con dos motores de inferencia en la misma máquina, qué pasa cuando el modelo va más lento que la cámara, y los números reales de CPU, GPU y NPU del mismo portátil, cara a cara. Te llevarás un patrón de agentes local first que puedes aplicar mañana y criterio para decidir qué se queda en el edge y qué merece subir a la nube.

### Speakers

Javier Carnero

### Duración

50 minutos

### Track

DATA&AI

### Nivel

300 (Avanzado)

### Servicios de Azure

- Microsoft Foundry / Foundry Local: el modelo de visión y lenguaje servido en local, con Microsoft Foundry en la nube como contrapunto para decidir qué sube y qué no.

Tecnologías de Microsoft que también aparecen:

- Microsoft Agent Framework (.NET): el agente que decide y actúa.
- ONNX Runtime y OpenVINO GenAI: los dos motores de inferencia sobre CPU, GPU y NPU.
