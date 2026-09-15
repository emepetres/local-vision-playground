# Spike: does a forced tool call with an image work on `qwen3-vl-2b-instruct`? — 2026-09-15

Resolves the load-bearing, previously unverified assumption behind
[ADR-0011](../adr/0011-a-structured-observation-is-obtained-by-tool-calling.md): that a
Structured Observation can be obtained by defining one tool whose JSON schema *is* the fixed
shape, forcing the tool choice, and reading the tool call's arguments. Issue
[#30](https://github.com/emepetres/local-vision-playground/issues/30).

**Verdict: CONTRADICTED.** A forced tool call with an image is not honoured as a tool call by
`qwen3-vl-2b-instruct` on this runtime — it never returns a native tool call. The
JSON-in-prompt fall-back, on the other hand, returns the exact `{name, count}` shape every
time. The adapter for `observe --structured` must be built on the fall-back, not on
tool-calling. This flips ADR-0011's default; every other decision in that ADR survives.

## Method

- **Machine / runtime**: the development machine (RTX 4090 + i7-13700KF), Foundry Local
  in-process via `foundry-local-sdk` 2.0.1. The alias `qwen3-vl-2b-instruct` resolved to
  `qwen3-vl-2b-instruct-cuda-gpu:2`, loaded on `GPU / CUDAExecutionProvider`.
- **Frame**: the repository reference Frame (`docs/fixtures/reference-frame.jpg`), encoded
  exactly as production does (640×360 JPEG, 43,881 bytes) through `vision.capture`.
- **Two experiments**, each 11 trials — one at temperature 0.0 (the production setting, which
  is deterministic) and ten at temperature 0.8 (to sample the variance the deterministic run
  cannot show):
  1. **Forced tool call.** One tool, `report_objects`, whose JSON schema is the fixed shape —
     `{objects: [{name: string, count: integer, minimum 1}]}` — registered with
     `ChatSession.add_tool_definition(...)`, sent with `RequestOptions(tool_choice=REQUIRED)`.
     Each response was classified as a **valid** tool call (a `ToolCallItem` named
     `report_objects` whose arguments validate), **invalid_args** (a tool call that does not
     validate), **declined** (no tool call and no text), or **prose** (text instead of a tool
     call).
  2. **JSON-in-prompt fall-back.** No tool. The prompt asks for a JSON array of
     `{name, count}` and the reply is parsed. Classified **valid** / **invalid_args** /
     **empty**.

The harness is reproducible; the two scripts used are reproduced in the appendix.

## Result 1 — the forced tool call is never honoured

| Outcome | Count | Share |
| --- | --- | --- |
| valid tool call | 0 | 0% |
| invalid arguments | 0 | 0% |
| declined | 0 | 0% |
| **prose (text, not a tool call)** | **11** | **100%** |

Across all 11 trials — including the deterministic temperature-0.0 run — the model returned
**no `ToolCallItem` at all**, despite `tool_choice=REQUIRED`. What came back was ordinary
text that *imitates* a tool call, e.g.:

```json
{"name": "report_objects", "arguments": {"objects": ["book", "bookshelf", "chair", "door", …]}}
```

Two failures, not one:

1. **It is text, not a tool call.** The runtime did not lift the model's output into a
   `ToolCallItem`; iterating the response yields `TextItem`s. An adapter reading tool-call
   arguments gets nothing to read.
2. **The shape is ignored anyway.** Even inside that imitation, `objects` was never an array
   of `{name, count}`. It was an array of bare strings on most trials, and once an array of
   `{bbox_2d, label}` (the object-detection shape Qwen-VL is trained on). The tool's JSON
   schema had no effect on what the model produced.

So the mechanism ADR-0011 rests on does not exist on this model/runtime: there is no forced
tool call to read, and no schema adherence to rely on.

## Result 2 — the JSON-in-prompt fall-back returns the exact shape

Two runs of the fall-back (a pretty-print prompt at a 256-token budget, then a
"compact, single line" prompt at 512 tokens):

| Outcome | Run A (256 tok) | Run B (512 tok) |
| --- | --- | --- |
| valid, parsed end-to-end | 6 / 11 (55%) | 6 / 11 (55%) |
| invalid arguments | 5 / 11 (45%) | 5 / 11 (45%) |
| empty | 0 | 0 |

The headline number understates it. **Every one of the 22 replies carried the correct
`{name, count}` shape** — never wrong keys, never bare strings, never `bbox_2d`. Unlike the
tool-call path, the prompt *does* steer the shape. The `invalid_args` results were **all**
the same mechanical failure: **the array was truncated before its closing `]`**, so it did not
parse. Two things cause the truncation, and both are addressable in the adapter:

- **The model wraps the array in a markdown ` ```json ` fence** even when the prompt says not
  to. The fence must be stripped before parsing.
- **The model over-enumerates** — long arrays with many duplicate entries (`book` counted,
  then listed again and again) — and at temperature 0.8 sometimes falls into a repetition
  loop (`{"name": "book", "count": 1}` repeated). Either exhausts the token budget mid-array.
  Note this is a temperature artefact; the production path runs at temperature 0.0.

## Recommendation for the `observe --structured` implementer

Build the adapter on the **JSON-in-prompt fall-back**, the contingency ADR-0011 already
named. Concretely:

- Put the fixed shape in the prompt, spelling out `name` and `count` explicitly with a
  worked example — the model defaults to an array of bare strings without it.
- **Strip a leading/trailing markdown code fence** before parsing.
- Budget output tokens generously, and treat a truncated array as a "no shape" outcome (or
  repair it by dropping the trailing incomplete element) rather than a crash — this is exactly
  the "a failure to produce a shape is an ordinary outcome" stance ADR-0011 already takes.
- Validate the parsed array against the sibling types; a reply that parses but does not match
  is still a defined "no shape" result.

What does **not** change, exactly as ADR-0011 anticipated: the sibling types (the Structured
Observation and its objects), the model port (`observe` gains a sibling method returning the
fixed shape), and the rendering. Only the adapter's internals move from
`add_tool_definition` + `tool_choice` to prompt + parse.

## Caveats

- One Frame, one model, one runtime version, on one machine. The catalogue and the SDK move
  quickly (see `docs/stack.md`); re-run the harness after an SDK or catalogue bump before
  trusting these numbers again.
- `tool_choice=REQUIRED` producing no tool call may be a limitation of the runtime's
  tool-call parsing for the `vision-language-chat` task rather than of the model's weights.
  The distinction does not matter to the adapter: from where it stands, a forced tool call
  yields no `ToolCallItem`.
- The larger VLMs in the catalogue (`qwen3-vl-4b-instruct`, `-8b`) were not tested. If the
  demo ever needs true tool-calling, they are the first thing to re-measure.

## Appendix — the harness

Both scripts import from the `vision` package and were run with
`uv run python <script> 10 0.8` from `vision/`.

### Forced tool call

```python
import json, time
from foundry_local_sdk import (
    ImageItem, MessageItem, Request, RequestOptions, SearchOptions, TextItem,
    ToolCallItem, ToolChoice,
)
from vision.capture import REFERENCE_FRAME, ImageFileCamera
from vision.inference import DEFAULT_ALIAS, InProcessFoundryLocal

TOOL_NAME = "report_objects"
TOOL_SCHEMA = json.dumps({
    "type": "object",
    "properties": {
        "objects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "count": {"type": "integer", "minimum": 1},
                },
                "required": ["name", "count"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["objects"],
    "additionalProperties": False,
})
PROMPT = "List the objects you can see and how many of each there are."

# resolve → register EPs → load, then reach model._session (a ChatSession) and:
#   session.add_tool_definition(TOOL_NAME, "...", TOOL_SCHEMA)
# per trial (undo_turns first so each Frame stands alone):
#   options = RequestOptions(
#       search=SearchOptions(temperature=t, max_output_tokens=256),
#       tool_choice=ToolChoice.REQUIRED,
#   )
#   with Request().add_item(MessageItem.user([TextItem(PROMPT),
#                                             ImageItem(frame.codec, frame.data)]))\
#                 .set_options(options) as request:
#       with session.process_request(request) as response:
#           for item in response:  # ToolCallItem? TextItem? (also inside MessageItem.parts)
#               ...
# Observed: response yields only TextItem — never a ToolCallItem — 11/11.
```

### JSON-in-prompt fall-back

```python
PROMPT = (
    "List every distinct object you can see in this image. "
    "Reply with ONLY a JSON array, where each element is an object "
    '{"name": <string>, "count": <integer >= 1>}. '
    'Example: [{"name": "cup", "count": 2}, {"name": "book", "count": 1}].'
)
# Same setup, no tool, tool_choice omitted. Parse the reply:
#   - strip a leading/trailing ```json fence
#   - take the text from the first '[' to the last ']'
#   - json.loads, then check every element is {name: str, count: int >= 1}
# Observed: shape correct 22/22; parse failures were all truncated arrays.
```
