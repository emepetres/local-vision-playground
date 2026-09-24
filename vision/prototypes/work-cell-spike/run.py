"""PROTOTYPE — throwaway. Spike #58: can the 2B model see the Work Cell?

Runs every photo in docs/fixtures/work-cell through each Variant and each candidate prompt,
and records the model's raw reply plus the {name, count, where} list parsed out of it. It
answers nothing by itself: report.html reads results.js and scores it against the labels.

    cd vision
    uv run python prototypes/work-cell-spike/run.py                     # the two default Variants
    uv run python prototypes/work-cell-spike/run.py --variant qwen3-vl-2b-instruct-int4-sym-npu

Not production code: no tests, no error handling beyond keeping one bad photo from ending
the run. Delete it once #58 is written up.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
import time
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps

from vision.capture import JPEG_CODEC, JPEG_QUALITY, WORKING_RESOLUTION, Frame, ImageFileCamera
from vision.inference import InProcessFoundryLocal, Workload
from vision.openvino_runtime import InProcessOpenVINO
from vision.router import Router

HERE = Path(__file__).resolve().parent
FIXTURES = HERE.parents[2] / "docs" / "fixtures" / "work-cell"
RESULTS = HERE / "results.js"

DEFAULT_VARIANTS = [
    "qwen3-vl-2b-instruct-int4-sym-gpu",  # OpenVINO iGPU: what the Watch uses in the demo
    "qwen3-vl-2b-instruct-generic-cpu",  # Foundry Local CPU: the reference for A6
]

_SHAPE = (
    ' Reply with ONLY a JSON array, where each element is an object {"name": <string>,'
    ' "count": <integer >= 1>, "where": <one of "tray", "zone", "hand", "elsewhere">}.'
)

PROMPTS = {
    # The spec's shape, with the four places named but not described: what #59 assumes.
    "plain": (
        "List every distinct object you can see in this image, and where it is."
        ' "tray" means in the tray, "zone" means on the work mat, "hand" means held in a'
        ' hand, "elsewhere" means anywhere else. Hands are objects too: name each one'
        ' "bare hand" or "gloved hand".'
        + _SHAPE
        + ' Example: [{"name": "cup", "count": 1, "where": "zone"},'
        ' {"name": "bare hand", "count": 1, "where": "zone"}].'
        " If the image is empty, reply with []."
    ),
    # The same shape, with the Tray and the Zone described as this Work Cell looks.
    "described": (
        "This is a work bench seen from above. The work zone is the green cutting mat. The"
        " tray is the white mesh tray beside it. List every distinct object you can see, and"
        ' where it is: "tray" if it lies in the white tray, "zone" if it lies on the green'
        ' mat, "hand" if a hand is holding it, "elsewhere" for anything else. Hands are'
        ' objects too: name each visible hand "bare hand" (skin showing) or "gloved hand".'
        + _SHAPE
        + ' Example: [{"name": "cup", "count": 1, "where": "zone"},'
        ' {"name": "bare hand", "count": 1, "where": "zone"}].'
        " If nothing is there, reply with []."
    ),
    # A closed list: the Work Cell's parts are named for the model, and anything else it sees
    # is still asked for, so a Foreign Object has a way in. Names become stable by construction.
    "checklist": (
        "This is a work bench seen from above: a green cutting mat (the work zone) and a"
        " white mesh tray beside it. The bench should hold these parts: soldering iron,"
        " solder spool, brush, tweezers, jumper wires, circuit board. List each of those"
        " parts you can see, then every visible hand, then any other object lying on the"
        ' green mat or in the tray. For each, give "where": "tray" if it lies in the white'
        ' tray, "zone" if it lies on the green mat, "hand" if a hand is holding it,'
        ' "elsewhere" otherwise. Name each hand "bare hand" (skin showing) or "gloved hand".'
        " Do not list the mat, the tray, the desk, the person or the camera tripod."
        + _SHAPE
        + ' Example: [{"name": "tweezers", "count": 1, "where": "tray"},'
        ' {"name": "cup", "count": 1, "where": "zone"},'
        ' {"name": "gloved hand", "count": 1, "where": "zone"}].'
    ),
}

# Not a list at all: one closed yes/no question per Trigger condition, one inference each. The
# `checklist` run showed the 2B model recites the list it is given rather than looking, so this
# asks about one thing at a time and never hands it an inventory to copy.
_PART_LOOKS = {
    "soldering iron": "a soldering iron (a black handle with a metal tip and a cable)",
    "solder": "a spool of solder (a small silver reel)",
    "brush": "a brush (a thin white stick with bristles at one end)",
    "tweezers": "a pair of black tweezers",
    "jumper wires": "a bundle of small colourful jumper wires",
    "circuit board": "a blue electronic circuit board",
}
QUESTIONS = {
    **{
        f"part:{part}": f"Is there {looks} anywhere in this image? Answer only yes or no."
        for part, looks in _PART_LOOKS.items()
    },
    "bare hand": (
        "Look at the hands in this image. Is any hand bare, with skin showing and no glove on it?"
        " If there are no hands, answer no. Answer only yes or no."
    ),
    "foreign:phone": (
        "Is there a mobile phone lying on the green cutting mat? Answer only yes or no."
    ),
    "foreign:cup": "Is there a cup or a mug standing on the green cutting mat? Answer only yes or no.",
}
PROMPTS["questions"] = " | ".join(QUESTIONS.values())  # recorded for the report, never sent whole

MAX_OUTPUT_TOKENS = 256  # double the Watch's 128, so the report can show what 128 would cut


def parse(text: str) -> dict[str, object]:
    """{name, count, where} out of a reply, salvaging a cut-off array element by element."""
    start = text.find("[")
    if start == -1:
        return {"objects": None, "reason": "prose, no array"}
    decoder = json.JSONDecoder()
    try:
        value, _ = decoder.raw_decode(text, start)
        elements = value if isinstance(value, list) else None
        salvaged = False
    except json.JSONDecodeError:
        elements, index, frag = [], start + 1, text
        while True:
            while index < len(frag) and frag[index] in " \t\r\n,":
                index += 1
            try:
                item, index = decoder.raw_decode(frag, index)
            except json.JSONDecodeError:
                break
            elements.append(item)
        salvaged = True
    if elements is None:
        return {"objects": None, "reason": "not a list"}
    objects = []
    for e in elements:
        if not isinstance(e, dict) or not isinstance(e.get("name"), str):
            break
        count = e.get("count", 1)
        objects.append(
            {
                "name": e["name"],
                "count": count if isinstance(count, int) and not isinstance(count, bool) else 1,
                "where": e.get("where") if isinstance(e.get("where"), str) else None,
            }
        )
    if not objects and elements:
        return {"objects": None, "reason": "elements do not match the shape"}
    return {"objects": objects, "salvaged": salvaged}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--variant", action="append")
    parser.add_argument("--prompt", action="append", choices=sorted(PROMPTS))
    parser.add_argument("--only", help="substring of the photo names to run")
    parser.add_argument("--out", type=Path, default=HERE / "results.js", help="results file to merge into")
    parser.add_argument(
        "--box", default="640x480", help="fit the Frame into WxH (the Watch uses 640x480)"
    )
    args = parser.parse_args()
    variants = args.variant or DEFAULT_VARIANTS
    prompts = args.prompt or list(PROMPTS)
    box = tuple(int(n) for n in args.box.split("x"))
    photos = sorted(p for p in FIXTURES.glob("*.png") if not args.only or args.only in p.name)
    # The part-in-use-* photos are byte-identical to bare-hand / one-glove ones: run each once.
    photos = [p for p in photos if not p.name.startswith("part-in-use-")]

    runs: list[dict[str, object]] = []
    global RESULTS
    RESULTS = args.out  # a second runner in parallel needs its own file, or they clobber each other
    if RESULTS.exists():  # keep earlier runs of other Variants/prompts; replace matching ones
        old = json.loads(RESULTS.read_text(encoding="utf-8").split("=", 1)[1].rstrip(";\n"))
        runs = [
            r
            for r in old["runs"]
            if not (
                r["variant_asked"] in variants
                and r["prompt"] in prompts
                and r.get("box", "640x480") == args.box
                and (not args.only or args.only in str(r["photo"]))
            )
        ]

    foundry = InProcessFoundryLocal()
    router = Router(foundry, InProcessOpenVINO())
    try:
        for name in variants:
            model = router.resolve(name)
            router.register_execution_providers(lambda s: print(f"  {s}", flush=True))
            if not model.is_cached:
                print(f"downloading {name}", flush=True)
                model.download(lambda pct: None)
            t = time.perf_counter()
            model.load()
            print(f"{model.identity.variant} loaded in {time.perf_counter() - t:.1f} s")
            try:
                for prompt in prompts:
                    for photo in photos:
                        frame = frame_of(photo, box)
                        if prompt == "questions":
                            runs.append(ask_each(model, name, frame, photo, args.box))
                            print(f"{name} questions {args.box} {photo.name:36}"
                                  f" {runs[-1]['seconds']:5.1f} s", flush=True)
                            write(runs)
                            continue
                        workload = Workload(
                            prompt=PROMPTS[prompt],
                            frame=frame,
                            max_output_tokens=MAX_OUTPUT_TOKENS,
                        )
                        t = time.perf_counter()
                        try:
                            raw = model.observe(workload)
                            text, finish, tokens, err = (
                                raw.text,
                                raw.finish_reason.value,
                                raw.completion_tokens,
                                None,
                            )
                        except Exception as error:  # one bad photo must not end the run
                            text, finish, tokens, err = "", "failed", 0, str(error)
                        seconds = time.perf_counter() - t
                        runs.append(
                            {
                                "variant_asked": name,
                                "variant": model.identity.variant,
                                "ran_on": model.identity.ran_on,
                                "prompt": prompt,
                                "box": args.box,
                                "frame": f"{frame.width}x{frame.height}",
                                "photo": photo.name,
                                "seconds": round(seconds, 3),
                                "completion_tokens": tokens,
                                "finish": finish,
                                "error": err,
                                "text": text,
                                **parse(text),
                            }
                        )
                        print(
                            f"{name} {prompt:9} {args.box} {photo.name:36} {seconds:5.1f} s"
                            f" {tokens:4} tok {finish}",
                            flush=True,
                        )
                        write(runs)
            finally:
                model.unload()
    finally:
        foundry.close()


def ask_each(model: Any, name: str, frame: Frame, photo: Path, box: str) -> dict[str, object]:
    """Every closed question about one photo, one inference each, answers read as yes/no."""
    answers: dict[str, object] = {}
    seconds = 0.0
    tokens = 0
    for key, question in QUESTIONS.items():
        t = time.perf_counter()
        try:
            raw = model.observe(Workload(prompt=question, frame=frame, max_output_tokens=8))
            text = raw.text
            tokens += raw.completion_tokens
        except Exception as error:  # one bad question must not end the run
            text = f"failed: {error}"
        seconds += time.perf_counter() - t
        word = text.strip().strip("`*.\"' ").lower()
        yes = True if word.startswith("yes") else False if word.startswith("no") else None
        answers[key] = {"text": text, "yes": yes}
    return {
        "variant_asked": name,
        "variant": model.identity.variant,
        "ran_on": model.identity.ran_on,
        "prompt": "questions",
        "box": box,
        "frame": f"{frame.width}x{frame.height}",
        "photo": photo.name,
        "seconds": round(seconds, 3),
        "completion_tokens": tokens,
        "finish": "complete",
        "error": None,
        "text": "\n".join(f"{k}: {v['text']}" for k, v in answers.items()),  # type: ignore[index]
        "objects": None,
        "answers": answers,
    }


def frame_of(photo: Path, box: tuple[int, ...]) -> Frame:
    """The photo as the Watch would see it, fit into ``box`` instead of 640x480."""
    if box == WORKING_RESOLUTION:
        return ImageFileCamera(photo).capture()
    with Image.open(photo) as image:
        resized = ImageOps.contain(image.convert("RGB"), (box[0], box[1]))
    buffer = io.BytesIO()
    resized.save(buffer, format="JPEG", quality=JPEG_QUALITY)
    return Frame(buffer.getvalue(), JPEG_CODEC, str(photo), resized.width, resized.height)


def write(runs: list[dict[str, object]]) -> None:
    payload = {"prompts": PROMPTS, "max_output_tokens": MAX_OUTPUT_TOKENS, "runs": runs}
    RESULTS.write_text(
        "window.SPIKE_RESULTS = " + json.dumps(payload, indent=1) + ";\n", encoding="utf-8"
    )


if __name__ == "__main__":
    sys.exit(main())
