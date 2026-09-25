# Tool-call reliability measurement — Zenbook

Measures how often `notify_supervisor` and `log_incident` are really called as tool calls — not narrated as text or skipped — for each candidate text model on each Execution Provider Foundry Local offers on this machine, over 10 synthetic Incidents (issue #62).

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
| missing-gasket | False | False | 33,0s |  |
| missing-screwdriver | False | False | 15,0s |  |
| no-gloves-first | False | False | 23,4s |  |
| no-gloves-second | False | False | 12,1s |  |
| foreign-phone | False | False | 22,7s |  |
| foreign-cup | False | False | 22,9s |  |
| missing-bracket-truncated | False | False | 22,4s |  |
| no-gloves-elsewhere | False | False | 11,8s |  |
| foreign-scissors | False | False | 24,4s |  |
| missing-gasket-second | False | False | 24,3s |  |

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
| missing-gasket | True | True | 23,7s |  |
| missing-screwdriver | True | True | 17,7s |  |
| no-gloves-first | True | True | 16,6s |  |
| no-gloves-second | True | True | 14,6s |  |
| foreign-phone | True | True | 17,6s |  |
| foreign-cup | True | True | 25,9s |  |
| missing-bracket-truncated | True | True | 16,8s |  |
| no-gloves-elsewhere | True | True | 15,3s |  |
| foreign-scissors | True | True | 19,1s |  |
| missing-gasket-second | True | True | 16,9s |  |

### qwen2.5-1.5b-instruct on GPU (`qwen2.5-1.5b-instruct-openvino-gpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | True | 7,1s |  |
| missing-screwdriver | False | True | 0,8s |  |
| no-gloves-first | False | True | 0,8s |  |
| no-gloves-second | False | True | 0,9s |  |
| foreign-phone | False | True | 1,0s |  |
| foreign-cup | False | True | 2,0s |  |
| missing-bracket-truncated | False | True | 1,8s |  |
| no-gloves-elsewhere | False | True | 0,9s |  |
| foreign-scissors | False | True | 1,0s |  |
| missing-gasket-second | False | True | 1,0s |  |

### qwen2.5-1.5b-instruct on NPU (`qwen2.5-1.5b-instruct-openvino-npu:5`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | True | False | 55,8s |  |
| missing-screwdriver | True | False | 3,0s |  |
| no-gloves-first | True | False | 3,5s |  |
| no-gloves-second | True | False | 3,5s |  |
| foreign-phone | True | False | 4,4s |  |
| foreign-cup | True | False | 3,7s |  |
| missing-bracket-truncated | True | False | 2,9s |  |
| no-gloves-elsewhere | True | False | 4,3s |  |
| foreign-scissors | True | False | 4,4s |  |
| missing-gasket-second | True | False | 3,0s |  |

### qwen3-4b on CPU (`qwen3-4b-generic-cpu:3`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 71,3s |  |
| missing-screwdriver | False | False | 53,1s |  |
| no-gloves-first | False | True | 102,0s |  |
| no-gloves-second | False | False | 51,1s |  |
| foreign-phone | False | False | 51,3s |  |
| foreign-cup | False | False | 51,4s |  |
| missing-bracket-truncated | False | False | 50,5s |  |
| no-gloves-elsewhere | False | False | 50,3s |  |
| foreign-scissors | False | False | 50,7s |  |
| missing-gasket-second | False | False | 51,4s |  |

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

