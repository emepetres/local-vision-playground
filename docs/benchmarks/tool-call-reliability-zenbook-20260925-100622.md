# Tool-call reliability measurement — Zenbook

Measures how often `notify_supervisor` and `log_incident` are really called as tool calls — not narrated as text or skipped — for each candidate text model on each Execution Provider Foundry Local offers on this machine, over 10 synthetic Incidents (issue #62).

| Candidate | Execution Provider | Variant | Reliable | Total |
| --- | --- | --- | --- | --- |
| qwen3-1.7b | CPU | qwen3-1.7b-generic-cpu:2 | 0 | 10 |
| qwen3-1.7b | GPU | qwen3-1.7b-generic-gpu:2 | 0 | 10 |
| qwen2.5-1.5b-instruct | CPU | qwen2.5-1.5b-instruct-generic-cpu:4 | 0 | 10 |
| qwen2.5-1.5b-instruct | GPU | qwen2.5-1.5b-instruct-openvino-gpu:2 | 0 | 10 |
| qwen2.5-1.5b-instruct | NPU | qwen2.5-1.5b-instruct-openvino-npu:5 | 0 | 10 |
| qwen3-4b | CPU | qwen3-4b-generic-cpu:3 | 0 | 10 |
| qwen3-4b | GPU | qwen3-4b-generic-gpu:2 | 0 | 10 |

## Per-Incident detail

### qwen3-1.7b on CPU (`qwen3-1.7b-generic-cpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 53,5s |  |
| missing-screwdriver | False | False | 45,3s |  |
| no-gloves-first | False | False | 51,6s |  |
| no-gloves-second | False | False | 45,5s |  |
| foreign-phone | False | False | 42,6s |  |
| foreign-cup | False | False | 46,2s |  |
| missing-bracket-truncated | False | False | 38,6s |  |
| no-gloves-elsewhere | False | False | 37,4s |  |
| foreign-scissors | False | False | 38,5s |  |
| missing-gasket-second | False | False | 39,0s |  |

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
| missing-gasket | False | False | 19,0s |  |
| missing-screwdriver | False | False | 16,3s |  |
| no-gloves-first | False | False | 16,2s |  |
| no-gloves-second | False | False | 23,2s |  |
| foreign-phone | False | False | 15,3s |  |
| foreign-cup | False | False | 25,1s |  |
| missing-bracket-truncated | False | False | 11,8s |  |
| no-gloves-elsewhere | False | False | 19,4s |  |
| foreign-scissors | False | False | 18,6s |  |
| missing-gasket-second | False | False | 13,2s |  |

### qwen2.5-1.5b-instruct on GPU (`qwen2.5-1.5b-instruct-openvino-gpu:2`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 20,7s |  |
| missing-screwdriver | False | False | 0,7s |  |
| no-gloves-first | False | False | 0,5s |  |
| no-gloves-second | False | False | 1,3s |  |
| foreign-phone | False | False | 1,6s |  |
| foreign-cup | False | False | 1,1s |  |
| missing-bracket-truncated | False | False | 0,8s |  |
| no-gloves-elsewhere | False | False | 0,5s |  |
| foreign-scissors | False | False | 1,4s |  |
| missing-gasket-second | False | False | 1,0s |  |

### qwen2.5-1.5b-instruct on NPU (`qwen2.5-1.5b-instruct-openvino-npu:5`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 72,1s |  |
| missing-screwdriver | False | False | 1,4s |  |
| no-gloves-first | False | False | 2,5s |  |
| no-gloves-second | False | False | 1,5s |  |
| foreign-phone | False | False | 1,5s |  |
| foreign-cup | False | False | 1,8s |  |
| missing-bracket-truncated | False | False | 1,4s |  |
| no-gloves-elsewhere | False | False | 1,9s |  |
| foreign-scissors | False | False | 1,4s |  |
| missing-gasket-second | False | False | 1,3s |  |

### qwen3-4b on CPU (`qwen3-4b-generic-cpu:3`)

| Incident | notify_supervisor | log_incident | Elapsed | Error |
| --- | --- | --- | --- | --- |
| missing-gasket | False | False | 121,1s |  |
| missing-screwdriver | False | False | 84,2s |  |
| no-gloves-first | False | False | 79,8s |  |
| no-gloves-second | False | False | 80,0s |  |
| foreign-phone | False | False | 86,1s |  |
| foreign-cup | False | False | 82,3s |  |
| missing-bracket-truncated | False | False | 83,1s |  |
| no-gloves-elsewhere | False | False | 84,0s |  |
| foreign-scissors | False | False | 98,0s |  |
| missing-gasket-second | False | False | 88,6s |  |

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

