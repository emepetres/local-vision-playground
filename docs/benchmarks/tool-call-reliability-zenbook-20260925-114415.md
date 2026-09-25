# Tool-call reliability measurement — Zenbook

Measures how often `notify_supervisor` and `log_incident` are really called as tool calls — not narrated as text or skipped — for each candidate text model on each Execution Provider Foundry Local offers on this machine, over 10 synthetic Incidents (issue #62).

System instructions: none — the turn carries only the Incident text and the two tool definitions.

| Candidate | Execution Provider | Variant | Reliable | Total |
| --- | --- | --- | --- | --- |
| qwen3-1.7b | CPU | qwen3-1.7b-generic-cpu:2 | 0 | 10 |
| qwen3-1.7b | GPU | qwen3-1.7b-generic-gpu:2 | 0 | 10 |
| qwen2.5-1.5b-instruct | CPU | qwen2.5-1.5b-instruct-generic-cpu:4 | 10 | 10 |
| qwen2.5-1.5b-instruct | GPU | qwen2.5-1.5b-instruct-openvino-gpu:2 | 0 | 10 |
| qwen2.5-1.5b-instruct | NPU | qwen2.5-1.5b-instruct-openvino-npu:5 | 0 | 10 |
| qwen3-4b | CPU | qwen3-4b-generic-cpu:3 | 0 | 10 |
| qwen3-4b | GPU | qwen3-4b-generic-gpu:2 | 0 | 10 |

## Per-Incident detail

### qwen3-1.7b on CPU (`qwen3-1.7b-generic-cpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 45,6s |  |
| missing-screwdriver | False | False | 18,0s |  |
| no-gloves-first | False | False | 36,5s |  |
| no-gloves-second | False | False | 15,2s |  |
| foreign-phone | False | False | 38,9s |  |
| foreign-cup | False | False | 17,2s |  |
| missing-bracket-truncated | False | False | 32,6s |  |
| no-gloves-elsewhere | False | False | 32,8s |  |
| foreign-scissors | False | False | 35,8s |  |
| missing-gasket-second | False | False | 39,7s |  |

### qwen3-1.7b on GPU (`qwen3-1.7b-generic-gpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| missing-screwdriver | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| no-gloves-first | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| no-gloves-second | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| foreign-phone | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| foreign-cup | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| missing-bracket-truncated | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| no-gloves-elsewhere | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| foreign-scissors | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| missing-gasket-second | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-1.7b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |

### qwen2.5-1.5b-instruct on CPU (`qwen2.5-1.5b-instruct-generic-cpu:4`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | True | True | 38,1s |  |
| missing-screwdriver | True | True | 27,4s |  |
| no-gloves-first | True | True | 24,4s |  |
| no-gloves-second | True | True | 25,9s |  |
| foreign-phone | True | True | 27,7s |  |
| foreign-cup | True | True | 44,7s |  |
| missing-bracket-truncated | True | True | 23,8s |  |
| no-gloves-elsewhere | True | True | 23,1s |  |
| foreign-scissors | True | True | 24,3s |  |
| missing-gasket-second | True | True | 24,4s |  |

### qwen2.5-1.5b-instruct on GPU (`qwen2.5-1.5b-instruct-openvino-gpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | True | 11,7s |  |
| missing-screwdriver | False | True | 1,3s |  |
| no-gloves-first | False | True | 1,3s |  |
| no-gloves-second | False | True | 1,4s |  |
| foreign-phone | False | True | 1,5s |  |
| foreign-cup | False | True | 2,9s |  |
| missing-bracket-truncated | False | True | 3,3s |  |
| no-gloves-elsewhere | False | True | 2,1s |  |
| foreign-scissors | False | True | 1,6s |  |
| missing-gasket-second | False | True | 2,1s |  |

### qwen2.5-1.5b-instruct on NPU (`qwen2.5-1.5b-instruct-openvino-npu:5`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | True | False | 70,4s |  |
| missing-screwdriver | True | False | 2,8s |  |
| no-gloves-first | True | False | 3,3s |  |
| no-gloves-second | True | False | 3,5s |  |
| foreign-phone | True | False | 4,2s |  |
| foreign-cup | True | False | 3,6s |  |
| missing-bracket-truncated | True | False | 2,8s |  |
| no-gloves-elsewhere | True | False | 4,3s |  |
| foreign-scissors | True | False | 4,2s |  |
| missing-gasket-second | True | False | 2,8s |  |

### qwen3-4b on CPU (`qwen3-4b-generic-cpu:3`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 92,6s |  |
| missing-screwdriver | False | False | 76,0s |  |
| no-gloves-first | False | False | 78,7s |  |
| no-gloves-second | False | False | 78,0s |  |
| foreign-phone | False | False | 78,9s |  |
| foreign-cup | False | False | 78,6s |  |
| missing-bracket-truncated | False | False | 74,4s |  |
| no-gloves-elsewhere | False | False | 75,5s |  |
| foreign-scissors | False | False | 75,2s |  |
| missing-gasket-second | False | False | 75,9s |  |

### qwen3-4b on GPU (`qwen3-4b-generic-gpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| missing-screwdriver | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| no-gloves-first | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| no-gloves-second | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| foreign-phone | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| foreign-cup | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| missing-bracket-truncated | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| no-gloves-elsewhere | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| foreign-scissors | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |
| missing-gasket-second | False | False | 0,0s | genai_model_instance.cc:59 fl::GenAIModelInstance::GenAIModelInstance failed to load model qwen3-4b-generic-gpu:2: WebGPU execution provider is not supported in this build.  |

