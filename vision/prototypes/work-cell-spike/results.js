window.SPIKE_RESULTS = {
 "prompts": {
  "plain": "List every distinct object you can see in this image, and where it is. \"tray\" means in the tray, \"zone\" means on the work mat, \"hand\" means held in a hand, \"elsewhere\" means anywhere else. Hands are objects too: name each one \"bare hand\" or \"gloved hand\". Reply with ONLY a JSON array, where each element is an object {\"name\": <string>, \"count\": <integer >= 1>, \"where\": <one of \"tray\", \"zone\", \"hand\", \"elsewhere\">}. Example: [{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}]. If the image is empty, reply with [].",
  "described": "This is a work bench seen from above. The work zone is the green cutting mat. The tray is the white mesh tray beside it. List every distinct object you can see, and where it is: \"tray\" if it lies in the white tray, \"zone\" if it lies on the green mat, \"hand\" if a hand is holding it, \"elsewhere\" for anything else. Hands are objects too: name each visible hand \"bare hand\" (skin showing) or \"gloved hand\". Reply with ONLY a JSON array, where each element is an object {\"name\": <string>, \"count\": <integer >= 1>, \"where\": <one of \"tray\", \"zone\", \"hand\", \"elsewhere\">}. Example: [{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}]. If nothing is there, reply with [].",
  "checklist": "This is a work bench seen from above: a green cutting mat (the work zone) and a white mesh tray beside it. The bench should hold these parts: soldering iron, solder spool, brush, tweezers, jumper wires, circuit board. List each of those parts you can see, then every visible hand, then any other object lying on the green mat or in the tray. For each, give \"where\": \"tray\" if it lies in the white tray, \"zone\" if it lies on the green mat, \"hand\" if a hand is holding it, \"elsewhere\" otherwise. Name each hand \"bare hand\" (skin showing) or \"gloved hand\". Do not list the mat, the tray, the desk, the person or the camera tripod. Reply with ONLY a JSON array, where each element is an object {\"name\": <string>, \"count\": <integer >= 1>, \"where\": <one of \"tray\", \"zone\", \"hand\", \"elsewhere\">}. Example: [{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}].",
  "questions": "Is there a soldering iron (a black handle with a metal tip and a cable) anywhere in this image? Answer only yes or no. | Is there a spool of solder (a small silver reel) anywhere in this image? Answer only yes or no. | Is there a brush (a thin white stick with bristles at one end) anywhere in this image? Answer only yes or no. | Is there a pair of black tweezers anywhere in this image? Answer only yes or no. | Is there a bundle of small colourful jumper wires anywhere in this image? Answer only yes or no. | Is there a blue electronic circuit board anywhere in this image? Answer only yes or no. | Look at the hands in this image. Is any hand bare, with skin showing and no glove on it? If there are no hands, answer no. Answer only yes or no. | Is there a mobile phone lying on the green cutting mat? Answer only yes or no. | Is there a cup or a mug standing on the green cutting mat? Answer only yes or no."
 },
 "max_output_tokens": 256,
 "runs": [
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 4.987,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\":",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 1.687,
   "completion_tokens": 68,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 5.172,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"work mat",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 1.776,
   "completion_tokens": 81,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 2.061,
   "completion_tokens": 91,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"hand\", \"count\": 2, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 2, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 2,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 5.287,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"work mat\", \"where\": \"elsewhere\"},\n  {\"name\": \"tray\", \"where\": \"elsewhere\"},\n  {\"name\": \"work mat\", \"where\": \"zone\"},\n  {\"name\": \"solder\", \"where\": \"elsewhere\"},\n  {\"name\": \"tools\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"where\": \"elsewhere",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 2.022,
   "completion_tokens": 92,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 4.954,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 4.882,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 5.244,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name",
   "objects": [
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 5.624,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"mug\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},",
   "objects": [
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 5.071,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"phone\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"laser\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "laser",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 5.165,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"mug\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"phone\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screwdriver\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"laser\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"laser\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"laser\", \"count\": 1, \"where\": \"else",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "laser",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "laser",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 5.263,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"mug\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 5.688,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"phone\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wrench\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"spindle\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where",
   "objects": [
    {
     "name": "phone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wrench",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spindle",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 7.001,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 1.842,
   "completion_tokens": 67,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 1.846,
   "completion_tokens": 66,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"zone\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 1.661,
   "completion_tokens": 65,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"where\": \"hand\"},\n\t{\"name\": \"hand\", \"where\": \"hand\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 5.941,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 5.545,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 1.823,
   "completion_tokens": 91,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 1.786,
   "completion_tokens": 91,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 1.801,
   "completion_tokens": 89,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"}\n]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 5.679,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 5.49,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screwdriver\", \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"where\": \"tr",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 4.733,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 4.89,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"cable\", \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"where\": \"tray\"},\n\t{\"name\": \"solder",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 5.068,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"else",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 1.931,
   "completion_tokens": 80,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"work mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"hand\"},\n\t{\"name\": \"gloved hand\", \"where\": \"hand\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 5.799,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"hand\", \"count\": 2, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 5.54,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"work mat\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 1.522,
   "completion_tokens": 66,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 1.232,
   "completion_tokens": 51,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 5.39,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 1.769,
   "completion_tokens": 65,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 1.477,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 1.31,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 1.331,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 5.513,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cutting mat\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\":",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 1.303,
   "completion_tokens": 51,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"zone\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "zone",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 5.529,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"laptop\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name",
   "objects": [
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "laptop",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 1.688,
   "completion_tokens": 70,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 1.227,
   "completion_tokens": 50,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"zone\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "zone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 5.459,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"phone\", \"where\": \"elsewhere\"},\n\t{\"name\": \"mug\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"where\": \"elsewhere\"},\n\t{\"name\": \"laptop\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screwdriver\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"where\": \"elsewhere\"},\n\t{\"name\": \"screw\", \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "laptop",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 5.243,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"mug\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 1.226,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 1.209,
   "completion_tokens": 51,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 2.168,
   "completion_tokens": 102,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 1.163,
   "completion_tokens": 51,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 1.425,
   "completion_tokens": 65,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 1.456,
   "completion_tokens": 65,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 1.641,
   "completion_tokens": 68,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 1.204,
   "completion_tokens": 50,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 1.531,
   "completion_tokens": 68,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"zone\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "zone",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 1.471,
   "completion_tokens": 68,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 0.953,
   "completion_tokens": 37,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 1.188,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 5.338,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"where\": \"else",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 1.213,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 5.343,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tray\"},\n\t{\"name\": \"tools\", \"where\": \"tr",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 1.323,
   "completion_tokens": 52,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"cutting mat\", \"where\": \"zone\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 1.807,
   "completion_tokens": 67,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 1.569,
   "completion_tokens": 68,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"tray\", \"where\": \"tray\"},\n\t{\"name\": \"hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"where\": \"elsewhere\"},\n\t{\"name\": \"tray\", \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 5.312,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 5.715,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 5.629,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 5.643,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 5.247,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 5.775,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\":",
   "objects": [
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 5.112,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 5.195,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 5.229,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\":",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 5.128,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 5.077,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 5.059,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\":",
   "objects": [
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 5.087,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\": 1, \"where\":",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 5.28,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 5.318,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 5.091,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 5.185,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\",",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 5.081,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"cable\", \"count\":",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 5.112,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 5.306,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\",",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 5.24,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 5.097,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 5.277,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 4.846,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\":",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 5.273,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 4.546,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 5.642,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tools\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tools",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 6.903,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 6.342,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 7.202,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"wires\", \"count\": 1",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 4.966,
   "completion_tokens": 184,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 7.218,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1,",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "bare-hand_3.png",
   "seconds": 9.129,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "bare-hand_4.png",
   "seconds": 7.129,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "bare_hand_1.png",
   "seconds": 7.984,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "bare_hand_2.png",
   "seconds": 6.705,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"gloved hand",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "baseline_1.png",
   "seconds": 6.405,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\":",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "baseline_2.png",
   "seconds": 6.284,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\":",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "baseline_3.png",
   "seconds": 6.292,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"g",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "baseline_4.png",
   "seconds": 6.198,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"glo",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "baseline_5.png",
   "seconds": 6.314,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "foreign-cup-mobile.png",
   "seconds": 4.182,
   "completion_tokens": 158,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "foreign-cup.png",
   "seconds": 6.259,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "foreign-mobile.png",
   "seconds": 5.586,
   "completion_tokens": 223,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 6.313,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"wires\", \"count\": 1, \"where",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 6.273,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 6.196,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "mixed_1.png",
   "seconds": 6.212,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "mixed_2.png",
   "seconds": 6.374,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\":",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "mixed_3.png",
   "seconds": 6.288,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "mixed_4.png",
   "seconds": 6.185,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\":",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "mixed_5.png",
   "seconds": 6.277,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\",",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "one-glove_1.png",
   "seconds": 6.196,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"s",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "one-glove_2.png",
   "seconds": 6.544,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "one-glove_3.png",
   "seconds": 6.88,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "one-glove_4.png",
   "seconds": 8.263,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"cable\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "part-missing-brush.png",
   "seconds": 8.539,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"g",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "part-missing-electronics.png",
   "seconds": 8.361,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\r\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\r\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\r\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\r\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\r\n\t{\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\r\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\r\n\t{\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\r\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\r\n\t{\"name\": \"gloved hand\", \"",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "part-missing-pliers.png",
   "seconds": 8.399,
   "completion_tokens": 252,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "part-missing-small_cables.png",
   "seconds": 9.076,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\",",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 8.522,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\":",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "part-missing-tin.png",
   "seconds": 8.331,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"solder\", \"count\": 1,",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "two-gloves_1.png",
   "seconds": 6.372,
   "completion_tokens": 185,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "1280x720",
   "frame": "1280x720",
   "photo": "two-gloves_2.png",
   "seconds": 8.663,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n\t{\"name\": \"circuit board\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"brush\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n\t{\"name\": \"gloved",
   "objects": [
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 31.682,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 25.374,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 26.856,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 28.1,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 28.69,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 31.046,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"scraping mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "scraping mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 26.186,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"soldering station\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering station",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 23.449,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering station\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wiring\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron holder\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\":",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering station",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wiring",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron holder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 25.307,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 26.013,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count",
   "objects": [
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 25.261,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 21.863,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 22.418,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"microphone\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microphone",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 34.168,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n  {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\",",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 28.871,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool of wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\":",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool of wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 25.345,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"work mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "work mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 22.831,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\",",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 35.566,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 25.521,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 21.141,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 21.456,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 21.682,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 21.614,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"glove\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"watch\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"",
   "objects": [
    {
     "name": "glove",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "watch",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 19.96,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 19.08,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\":",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 22.845,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pliers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\",",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pliers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 21.005,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"spool of wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron stand\", \"count\": 1, \"where\":",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool of wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 19.72,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 20.144,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool of thread\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"small black object\", \"count\": 2, \"where\": \"zone\"},\n    {\"name\": \"plastic tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"plastic tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"plastic tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"plastic tray\", \"count\": 1",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool of thread",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "small black object",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "plastic tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "plastic tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "plastic tray",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 19.828,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 21.858,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"zone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "zone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 21.064,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"glove\", \"count\": 2, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count",
   "objects": [
    {
     "name": "glove",
     "count": 2,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 13.117,
   "completion_tokens": 46,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 12.712,
   "completion_tokens": 46,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 21.378,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"solder",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 13.735,
   "completion_tokens": 65,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 21.688,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 21.216,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 21.096,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 21.387,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron holder\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "Arduino",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron holder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 21.473,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"",
   "objects": [
    {
     "name": "mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 21.734,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n  {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},",
   "objects": [
    {
     "name": "mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 21.469,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 20.173,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n  {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 20.069,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"mug\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"phone\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pliers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pliers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 25.992,
   "completion_tokens": 222,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"red mug\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"white mesh tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n  {\"name\": \"spool of wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pliers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"black plastic object\", \"count\": 2, \"where\": \"elsewhere\"},\n  {\"name\": \"black plastic object\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "red mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "white mesh tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool of wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pliers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "black plastic object",
     "count": 2,
     "where": "elsewhere"
    },
    {
     "name": "black plastic object",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 22.73,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"Arduino\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"phone\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 2, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\":",
   "objects": [
    {
     "name": "Arduino",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 2,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 15.093,
   "completion_tokens": 89,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 14.317,
   "completion_tokens": 87,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 14.06,
   "completion_tokens": 87,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 13.954,
   "completion_tokens": 88,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 13.49,
   "completion_tokens": 65,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 14.883,
   "completion_tokens": 67,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 13.62,
   "completion_tokens": 67,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 13.301,
   "completion_tokens": 70,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 11.734,
   "completion_tokens": 47,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 20.336,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\":",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 20.377,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pliers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pliers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 23.94,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 20.327,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pliers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"soldering iron",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pliers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 21.891,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"spool\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"screw\", \"count\": 1, \"where\": \"tray",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screw",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 24.377,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"cutting mat\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name",
   "objects": [
    {
     "name": "cutting mat",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 15.565,
   "completion_tokens": 89,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 15.965,
   "completion_tokens": 90,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n    {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"},\n    {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n    {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 24.096,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 23.34,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 22.147,
   "completion_tokens": 222,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"hand\"}\n]\n```",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 20.417,
   "completion_tokens": 177,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 27.012,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 24.546,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 26.122,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 25.505,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "Arduino",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 22.853,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 22.753,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1",
   "objects": [
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 21.239,
   "completion_tokens": 221,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 21.03,
   "completion_tokens": 222,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"smartphone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "smartphone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 22.678,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"black object\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"black object\", \"count\": 1, \"where\": \"zone\"}",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "black object",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "black object",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 22.746,
   "completion_tokens": 222,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"red mug\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"black plastic parts\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "red mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "black plastic parts",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 23.48,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\":",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 19.011,
   "completion_tokens": 182,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 22.466,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\",",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 22.895,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\",",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 24.273,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"pen\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1,",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 20.761,
   "completion_tokens": 198,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 26.313,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 25.238,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\",",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 24.392,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\",",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 19.578,
   "completion_tokens": 181,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 20.324,
   "completion_tokens": 199,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"Arduino\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "Arduino",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 19.436,
   "completion_tokens": 179,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 23.143,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\":",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 19.443,
   "completion_tokens": 179,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 22.91,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\",",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 22.716,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 19.595,
   "completion_tokens": 179,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 19.622,
   "completion_tokens": 181,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 3.887,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 2.475,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 2.666,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 2.525,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 2.396,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 2.42,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 2.551,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 2.498,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: no\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "no",
     "yes": false
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 2.419,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 2.417,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: yes\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "yes",
     "yes": true
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 2.417,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 2.672,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: yes\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "yes",
     "yes": true
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 2.685,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 2.752,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 2.711,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 2.932,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 2.644,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 2.518,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 2.827,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 2.505,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 3.114,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 2.648,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 2.817,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 2.765,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: no\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "no",
     "yes": false
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 2.853,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 2.901,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 3.014,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 2.892,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: no\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "no",
     "yes": false
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 2.873,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: no\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "no",
     "yes": false
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 2.943,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 2.76,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-2b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 2.747,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: no\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "no",
     "yes": false
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 78.594,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 81.623,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 98.935,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 102.529,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 124.916,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 103.576,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 115.922,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 124.404,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 115.874,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 134.234,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: no\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: yes\nforeign:cup: yes",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "no",
     "yes": false
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "yes",
     "yes": true
    },
    "foreign:cup": {
     "text": "yes",
     "yes": true
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 124.299,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: yes",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "yes",
     "yes": true
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 115.87,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: yes\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "yes",
     "yes": true
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 110.532,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 99.704,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: no\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "no",
     "yes": false
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 79.842,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 74.977,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 72.33,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 72.712,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 72.091,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 73.05,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 73.672,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 72.428,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 72.177,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 72.226,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 72.29,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 72.471,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 72.712,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 72.567,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: no\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "no",
     "yes": false
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 73.842,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: no\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "no",
     "yes": false
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 73.184,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 73.933,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-2b-instruct-generic-cpu",
   "variant": "qwen3-vl-2b-instruct-generic-cpu:2",
   "ran_on": "CPU / CPUExecutionProvider",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 72.736,
   "completion_tokens": 9,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 4.745,
   "completion_tokens": 42,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"bare hand\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "bare hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 4.186,
   "completion_tokens": 60,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"hand\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 7.362,
   "completion_tokens": 104,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"hand\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"glove\", \"count\": 0, \"where\": \"hand\"}, {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"elsewhere\"}]",
   "objects": [
    {
     "name": "hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "glove",
     "count": 0,
     "where": "hand"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 16.655,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 1.818,
   "completion_tokens": 24,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 12.437,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"s",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 9.348,
   "completion_tokens": 186,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 11.403,
   "completion_tokens": 229,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 5.222,
   "completion_tokens": 107,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wrench\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wrench",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 10.127,
   "completion_tokens": 210,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"phone\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tongs\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tongs",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 9.344,
   "completion_tokens": 190,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 8.9,
   "completion_tokens": 150,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"smartphone\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "smartphone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 14.547,
   "completion_tokens": 254,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"smartphone\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering stand\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "smartphone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 13.633,
   "completion_tokens": 235,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 7.708,
   "completion_tokens": 133,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tongs\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering needle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering pen\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tongs",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering needle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering pen",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 2.442,
   "completion_tokens": 43,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 2.75,
   "completion_tokens": 43,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 2.349,
   "completion_tokens": 43,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 14.402,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "[{\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"",
   "objects": [
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 5.933,
   "completion_tokens": 85,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 6.025,
   "completion_tokens": 113,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 11.228,
   "completion_tokens": 184,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 8.792,
   "completion_tokens": 153,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering stand\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 3.246,
   "completion_tokens": 45,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 2.588,
   "completion_tokens": 41,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"glove\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "glove",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 3.593,
   "completion_tokens": 63,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"gloved hand\", \"count\": 0, \"where\": \"hand\"}, {\"name\": \"bare hand\", \"count\": 0, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 0,
     "where": "hand"
    },
    {
     "name": "bare hand",
     "count": 0,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 6.944,
   "completion_tokens": 114,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 8.922,
   "completion_tokens": 160,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 1.465,
   "completion_tokens": 22,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"glove\", \"count\": 1, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "glove",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 1.631,
   "completion_tokens": 25,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 4.118,
   "completion_tokens": 67,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 2, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"elsewhere\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "plain",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 5,
   "completion_tokens": 87,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 8.265,
   "completion_tokens": 155,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 2.374,
   "completion_tokens": 40,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 6.823,
   "completion_tokens": 128,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 2.816,
   "completion_tokens": 42,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"bare hand\", \"count\": 2, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "bare hand",
     "count": 2,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 6.548,
   "completion_tokens": 128,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"pencil\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pencil",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 12.706,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"s",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 5.75,
   "completion_tokens": 111,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"microcontroller board\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 6.918,
   "completion_tokens": 138,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 12.199,
   "completion_tokens": 249,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wrench\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron body\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wrench",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron body",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 9.578,
   "completion_tokens": 188,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"cell phone\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cell phone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 7.912,
   "completion_tokens": 151,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"mug\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tongs\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering pen\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "mug",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tongs",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering pen",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 8.774,
   "completion_tokens": 176,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"smartphone\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"microcontroller board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"black-handled tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "smartphone",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "microcontroller board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "black-handled tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 11.123,
   "completion_tokens": 169,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"mug\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"smartphone\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"cup\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "mug",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "smartphone",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 12.629,
   "completion_tokens": 173,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"cup\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"laptop\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "cup",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "laptop",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 9.448,
   "completion_tokens": 133,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"Arduino board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tongs\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "Arduino board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tongs",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 14.195,
   "completion_tokens": 178,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 19.819,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 20.574,
   "completion_tokens": 256,
   "finish": "truncated",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": true
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 7.122,
   "completion_tokens": 100,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"glove\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "glove",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 8.867,
   "completion_tokens": 127,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"solder\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 2.934,
   "completion_tokens": 45,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 2.904,
   "completion_tokens": 45,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 9.586,
   "completion_tokens": 159,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering tool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering tool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 3.016,
   "completion_tokens": 45,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 17.166,
   "completion_tokens": 255,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 9.852,
   "completion_tokens": 158,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 7.025,
   "completion_tokens": 113,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron stand\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron stand",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 8.501,
   "completion_tokens": 130,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 7.402,
   "completion_tokens": 123,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"tray\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"wire\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"screwdriver\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"pencil\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"microcontroller\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"cable\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "tray",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "wire",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "screwdriver",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "pencil",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "microcontroller",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "cable",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 8.032,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron tip\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"soldering iron handle\", \"count\": 1, \"where\": \"tray\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron tip",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "soldering iron handle",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 5.036,
   "completion_tokens": 67,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 2, \"where\": \"zone\"}, {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"}, {\"name\": \"solder wire\", \"count\": 1, \"where\": \"elsewhere\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder wire",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "described",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 3.035,
   "completion_tokens": 45,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 9.703,
   "completion_tokens": 150,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 9.081,
   "completion_tokens": 161,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 10.844,
   "completion_tokens": 161,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 10.186,
   "completion_tokens": 137,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 8.088,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 8.027,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 9.134,
   "completion_tokens": 163,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 7.511,
   "completion_tokens": 136,
   "finish": "complete",
   "error": null,
   "text": "[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 7.509,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 8.763,
   "completion_tokens": 158,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 8.521,
   "completion_tokens": 158,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"cup\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "cup",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 7.986,
   "completion_tokens": 161,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 6.951,
   "completion_tokens": 139,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 8.784,
   "completion_tokens": 162,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 7.064,
   "completion_tokens": 139,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 9.045,
   "completion_tokens": 181,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 7.816,
   "completion_tokens": 149,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"brush\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 9.021,
   "completion_tokens": 181,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"bare hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "bare hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 7.555,
   "completion_tokens": 150,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 7.284,
   "completion_tokens": 149,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 7.872,
   "completion_tokens": 161,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 7.579,
   "completion_tokens": 149,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"brush\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 8.518,
   "completion_tokens": 161,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 7.822,
   "completion_tokens": 149,
   "finish": "complete",
   "error": null,
   "text": "[{\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"}, {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}, {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"}, {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 7.406,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 5.639,
   "completion_tokens": 114,
   "finish": "complete",
   "error": null,
   "text": "[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"}\n]",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 7.011,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 6.666,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 7.434,
   "completion_tokens": 140,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 0, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 0,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 7.974,
   "completion_tokens": 163,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"elsewhere\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "elsewhere"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 8.919,
   "completion_tokens": 182,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"elsewhere\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 2, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 2, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "elsewhere"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 2,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 2,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "checklist",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 8.107,
   "completion_tokens": 160,
   "finish": "complete",
   "error": null,
   "text": "```json\n[\n  {\"name\": \"soldering iron\", \"count\": 1, \"where\": \"hand\"},\n  {\"name\": \"solder spool\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"brush\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"tweezers\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"jumper wires\", \"count\": 1, \"where\": \"tray\"},\n  {\"name\": \"circuit board\", \"count\": 1, \"where\": \"zone\"},\n  {\"name\": \"gloved hand\", \"count\": 1, \"where\": \"zone\"}\n]\n```",
   "objects": [
    {
     "name": "soldering iron",
     "count": 1,
     "where": "hand"
    },
    {
     "name": "solder spool",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "brush",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "tweezers",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "jumper wires",
     "count": 1,
     "where": "tray"
    },
    {
     "name": "circuit board",
     "count": 1,
     "where": "zone"
    },
    {
     "name": "gloved hand",
     "count": 1,
     "where": "zone"
    }
   ],
   "salvaged": false
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_3.png",
   "seconds": 4.231,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare-hand_4.png",
   "seconds": 3.941,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_1.png",
   "seconds": 3.748,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "bare_hand_2.png",
   "seconds": 3.496,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_1.png",
   "seconds": 3.892,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_2.png",
   "seconds": 3.838,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_3.png",
   "seconds": 3.403,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_4.png",
   "seconds": 4.41,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: no\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "no",
     "yes": false
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "baseline_5.png",
   "seconds": 3.667,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup-mobile.png",
   "seconds": 3.596,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: yes\nforeign:cup: yes",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "yes",
     "yes": true
    },
    "foreign:cup": {
     "text": "yes",
     "yes": true
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-cup.png",
   "seconds": 3.783,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: yes",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "yes",
     "yes": true
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-mobile.png",
   "seconds": 3.841,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: yes\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "yes",
     "yes": true
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup-mobile.png",
   "seconds": 4.049,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-cup.png",
   "seconds": 3.775,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "foreign-off-zone-mobile.png",
   "seconds": 3.664,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: yes\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "yes",
     "yes": true
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_1.png",
   "seconds": 4.349,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_2.png",
   "seconds": 3.636,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_3.png",
   "seconds": 3.748,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: yes\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "yes",
     "yes": true
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_4.png",
   "seconds": 4.415,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "mixed_5.png",
   "seconds": 3.878,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_1.png",
   "seconds": 4.049,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_2.png",
   "seconds": 3.944,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_3.png",
   "seconds": 4.282,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "one-glove_4.png",
   "seconds": 4.024,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-brush.png",
   "seconds": 3.879,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-electronics.png",
   "seconds": 4.119,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-pliers.png",
   "seconds": 3.95,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-small_cables.png",
   "seconds": 3.747,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: no\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "no",
     "yes": false
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-soldering_iron.png",
   "seconds": 3.737,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: no\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "no",
     "yes": false
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "part-missing-tin.png",
   "seconds": 4.119,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: no\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: no\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "no",
     "yes": false
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "no",
     "yes": false
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_1.png",
   "seconds": 4.078,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: yes\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "yes",
     "yes": true
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  },
  {
   "variant_asked": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "variant": "qwen3-vl-4b-instruct-int4-sym-gpu",
   "ran_on": "GPU",
   "prompt": "questions",
   "box": "640x480",
   "frame": "640x360",
   "photo": "two-gloves_2.png",
   "seconds": 3.432,
   "completion_tokens": 18,
   "finish": "complete",
   "error": null,
   "text": "part:soldering iron: yes\npart:solder: yes\npart:brush: no\npart:tweezers: no\npart:jumper wires: yes\npart:circuit board: yes\nbare hand: no\nforeign:phone: no\nforeign:cup: no",
   "objects": null,
   "answers": {
    "part:soldering iron": {
     "text": "yes",
     "yes": true
    },
    "part:solder": {
     "text": "yes",
     "yes": true
    },
    "part:brush": {
     "text": "no",
     "yes": false
    },
    "part:tweezers": {
     "text": "no",
     "yes": false
    },
    "part:jumper wires": {
     "text": "yes",
     "yes": true
    },
    "part:circuit board": {
     "text": "yes",
     "yes": true
    },
    "bare hand": {
     "text": "no",
     "yes": false
    },
    "foreign:phone": {
     "text": "no",
     "yes": false
    },
    "foreign:cup": {
     "text": "no",
     "yes": false
    }
   }
  }
 ]
};
