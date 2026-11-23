# What Happens on the Laptop Stays on the Laptop — demo script

AI Virtual Days 2026 · sáb. 14-nov-2026, 12:50 · PowerShell en Windows Terminal

## Preparación

### La víspera, con red
- [x] `vision`: `uv sync --group convert`
- [x] Cada Variant arranca una vez (cachea el catálogo y compila la NPU): D1, D3 y D2 abajo, 1–2 Observations cada uno
- [x] `agent`: `dotnet build Agent.slnx`, luego `dotnet run --project Agent --no-build` hasta el header, `Ctrl+C`
- [x] logi capture abierto y la imagen de la cámara USB ajustada
- [x] Grupo de firewall `Local vision demo` presente y desactivado
- [x] Ensayo con las reglas activas: observe, watch y agente arrancan sin red
- [x] Grabar un ensayo completo como respaldo; ruta en disco local ❓

### Antes de entrar
- [x] Mover las líneas de ensayo fuera de `agent\incidents\incidents.jsonl`
- [x] Notificaciones visibles al compartir pantalla (Do not disturb apagado, sin activación automática)
- [x] Windows Update en pausa; OneDrive cerrado; cargador puesto; ahorro de batería apagado
- [ ] Fuente del terminal grande
- [x] Work Cell montada, cámara USB encuadrada sin el antebrazo del operario en el borde
- [x] Tres paneles abiertos, cada uno con:
```
$env:PYTHONUTF8 = "1"; $env:UV_OFFLINE = "1"
```

## Layout

| Cámara | Índice | Demos |
|--------|--------|-------|
| Webcam del portátil, hacia mí | `0` | D1, D3 |
| USB en trípode, sobre la Work Cell | `2` | D2, D4 |

- **Panel A** — `vision` — D1, D3, D2 y el watch de D4
- **Panel B** — `agent` — el agente de D4
- **Panel C** — raíz del repo — el fichero emitido y el registro de D4

## Apertura · slide "outbound: blocked"

Activar el bloqueo en pantalla; se queda hasta el cierre:
```
Enable-NetFirewallRule -DisplayGroup "Local vision demo"
```

---

## D1 · Demo: one look · tras "To act on what a camera sees…"

**Setup**
- Webcam hacia mí · panel A

**Ejecutar** · panel A
```
uv run observe --camera 0 --variant qwen3-vl-2b-instruct-generic-cpu:2
```

**Hacer**
1. Leer en voz alta la frase que escribe

**Plan B** · la salida del README (1,2 s, la estantería con cohetes)

---

## D3 · Demo: three engines, one name · tras "Queue every frame / Skip to the present"

**Setup**
- Webcam hacia mí · panel A · cada run 3–4 Observations, luego `Ctrl+C`

**Ejecutar** · panel A, uno tras otro
```
uv run watch --camera 0 --variant qwen3-vl-4b-instruct-generic-cpu:3 --ask "What is the person doing? Answer in one sentence."
```
```
uv run watch --camera 0 --variant qwen3-vl-4b-instruct-int4-sym-gpu --ask "What is the person doing? Answer in one sentence."
```
```
uv run watch --camera 0 --variant qwen3-vl-4b-instruct-int4-sym-cw-npu --ask "What is the person doing? Answer in one sentence."
```

**Hacer**
1. CPU → señalar el Shortfall (`late — skipped…`)
2. iGPU → la más rápida: la elijo para lo que sigue
3. NPU → cumple; para D4 va lenta (mediana 6,6 s)

**Plan B** · la slide de benchmark que sigue

---

## D2 · Demo: ask the watch · tras "The laptop you use for video calls"

**Setup**
- Ponerme los guantes · manos en la placa de la Work Cell · taza roja fuera de cámara · panel A

**Ejecutar** · panel A
```
uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu
```

**Hacer**
1. Esperar `#1`, luego teclear:
```
Is there a cup on the green mat? Answer in one or two sentences.
```
2. Taza al lado del tapete → "no", y dice dónde
3. Taza encima → "sí" en una o dos Cadences. Quitarla
4. Teclear:
```
What is the person doing? Answer in one sentence.
```
5. `Ctrl+C`. Decir: la pregunta entra en la siguiente Cadence

**Plan B** · saltar a la slide siguiente

---

## D4 · Demo: gloves off · tras "What has changed: when a Trigger fires"

**Setup**
- Work Cell, guantes puestos, manos en el tapete · sin taza ni móvil

**Ejecutar** · en este orden
```
dotnet run --project Agent --no-build
```
Panel B → esperar `Watching …observations.jsonl`
```
uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu --structured --every 10 --emit observations.jsonl
```
Panel A → esperar el header
```
Get-Content vision\observations.jsonl -Wait -Tail 3
```
Panel C

**Hacer**
1. Una o dos Cadences: señalar `gloved hand` en el panel C
2. Fuera guantes, manos quietas en el tapete → panel B `no gloves: 1/2`
3. Narrar ~40 s → `Incident fired` + notificación
4. Panel C, `Ctrl+C`, luego:
```
Get-Content agent\incidents\incidents.jsonl -Tail 1
```
5. Guantes puestos → dos Cadences → `Incident cleared`
6. `Ctrl+C` en A, luego en B

**Plan B** · la grabación del ensayo ❓

## Cierre

Quitar el bloqueo en pantalla:
```
Disable-NetFirewallRule -DisplayGroup "Local vision demo"
```
