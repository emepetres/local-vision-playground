# Which production edge devices with an Intel NPU could run this app next to a camera? — 2026-09-23

**Verdict: plenty, and from mainstream industrial vendors. Fanless boxes with Core Ultra
Series 1 (Meteor Lake), Series 2 (Arrow Lake) and, since Q2 2026, Series 3 (Panther Lake)
ship today from Advantech, OnLogic, ASRock Industrial, Lenovo ThinkEdge, Neousys and Vecow.
They take 64–128 GB of RAM, ship with Windows 11 IoT Enterprise LTSC 2024 and/or Ubuntu
24.04, and connect cameras over USB 3 and 2.5GbE/PoE+. Three caveats limit what that means
for this repo. (1) **The NPU in the Series 1/2 edge parts is small**: 11 TOPS (Meteor
Lake-H) or 13 TOPS (Arrow Lake-H/S). That is about a quarter of the 48 TOPS NPU in the demo
laptop's Lunar Lake. The big "36 / 97 / 180 TOPS" figures in vendor marketing are platform
totals, mostly iGPU. Only Panther Lake (NPU up to 50 TOPS) matches or beats the demo
laptop's NPU, and Intel does not offer Lunar Lake as an edge part at all. (2) **The
OpenVINO GenAI Runtime is the portable one**: Intel's Linux NPU driver covers every
generation, from Meteor Lake to Wildcat Lake, on Ubuntu 24.04/26.04. Foundry Local ties a
deployment to Windows, and on this hardware it only offers `qwen3-vl` on CPU anyway (see
`docs/stack.md`, Constraint 3). (3) **Copilot+ features are not something an edge box gets
for free**: Microsoft's Phi Silica updates list Windows 11 IoT Enterprise 24H2 but apply to
"Copilot+ PCs only", which requires a 40+ TOPS NPU. That rules out every Meteor Lake and
Arrow Lake box. None of the edge vendors below markets a Copilot+ designation.**

## Method

Web search and fetch only, run 2026-09-23. Device specs come from vendor product pages,
press releases, support documentation or product briefs. Where a vendor page would not
render for the fetch tool, which happened with ASRock Industrial, Neousys and the OnLogic
store, the note falls back to a trade-press reprint of the vendor's own release (CNX
Software, LinuxGizmos, automate.org, BVM) and flags it. NPU TOPS per generation come from
Intel's own *Core Ultra Processors (Series 3) for the Edge* overview deck (the PDF text
was extracted and read in full), not from vendor marketing. OS/NPU software support comes
from Intel's `linux-npu-driver` GitHub releases, OpenVINO's docs and Microsoft Learn /
Microsoft Support. The goal was a representative sample of 10 devices, not a catalogue.
Every vendor listed has more SKUs than shown.

---

## 1. The silicon: which Intel generations are edge parts, and how big is the NPU?

From Intel's edge overview deck (Series 3 for the Edge, comparison table):

| Generation | Edge variant | NPU | iGPU AI | Platform TOPS (Intel) | Memory ceiling |
| --- | --- | --- | --- | --- | --- |
| Core Ultra Series 1 (Meteor Lake-H) | yes | up to **11 TOPS** | Arc, up to 18 TOPS | up to 34 | DDR5-5600 / LPDDR5 |
| Core Ultra Series 2 (Arrow Lake-H) | yes | up to **13 TOPS** | Arc w/ XMX, up to 77 TOPS | up to 99 | DDR5-6400 / LPDDR5x |
| Core Ultra Series 3 (Panther Lake) | yes, incl. industrial extended-temp SKUs | up to **50 TOPS** | Arc w/ XMX, up to 120 TOPS (12 Xe) | ~180 (select H-SKUs) | DDR5-7200 **128 GB**, LPDDR5x **96 GB** |
| Core Ultra 200V (Lunar Lake) | **not in Intel's edge line-up** | 48 TOPS | Arc 140V | — | on-package memory (see caveats) |

Intel frames Series 3 for the edge with "up to 10 years availability", "Windows and Linux
long term service channel", "extended temperature (-40°C to 100°C)" on select SKUs, In-Band
ECC, and "as low as 15W for fanless designs". Arrow Lake-S desktop parts (Core Ultra 200S),
which some fanless boxes use, also have a 13 TOPS NPU. The "36 TOPS" figure that Advantech
and Neousys quote for them is CPU+GPU+NPU combined. Intel's edge product page lists Series 3
and links Series 2, and **does not mention Lunar Lake**. Note that the laptop this repo is
developed on (Arc 140V, `Intel(R) AI Boost`) is a Lunar Lake part, so it is **not
representative of the edge hardware you can buy**. Its NPU is roughly 4× the one in any
Series 1/2 edge box, and slightly below Panther Lake's.

## 2. Representative devices

All are fanless unless noted. "Vision/AI marketing" means the vendor's own page or release
names computer vision / edge AI as a target workload.

| Vendor / model | CPU gen (SKUs) | NPU | iGPU | RAM max | OS (vendor-stated) | Op. temp | Camera-relevant I/O | Vision/AI marketing | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **ASRock Industrial iEP-7050E** | Series 3, Panther Lake | up to 50 TOPS (platform up to 180) | Intel Graphics / Arc | 128 GB DDR5-7200, IBECC | *not stated in the release (unverified)* | **-25 to 60°C** | multiple LAN, PoE option, DIO, CAN, TSN | yes: "robotics and machine vision" | announced 2026-07-08 |
| **Advantech UNO-258** | Series 3 (up to 16 cores) | NPU5 (platform up to 180) | Arc, up to 12 Xe | dual-channel DDR5 (cap not stated) | *not stated (unverified)* | -20 to 50°C | 3× USB 3.2 Gen 2, 1× GbE + 2× 2.5GbE, **PoE board "for directly powering IP cameras"** | yes: "visual inspection" | announced 2026-01-06, Q2 2026 |
| **Vecow TGS-2000** | Series 3 (Ultra 9 386H, Ultra 5 336H) | up to 100 platform TOPS (these SKUs) | Intel Graphics (4 Xe) | 128 GB DDR5-6400 | Windows 11, Windows 10 LTSC, Linux | -25 to 45°C fanless (fan versions to 55°C) | 2× 2.5GbE, USB 3.2 Gen 2x2 Type-C + 2× Gen 2 | yes: edge AI, OpenVINO | CES 2026 |
| **Lenovo ThinkEdge SE60n Gen 2** | Series 2, Arrow Lake-H (Ultra 7 265H) | **13 TOPS** (97 total, 75 of them GPU) | Arc 140T (8 Xe) | 64 GB (96 GB mentioned) | **Windows 11 IoT Enterprise LTSC 2024, Ubuntu Core 24.04, Ubuntu Server 24.04** | -20 to 60°C | 2× 2.5GbE, 4× USB 3, 2× USB 2 | yes: "multi-camera vision" | April 2026 |
| **OnLogic Helix 520 (HX520/521/522/524) / Karbon K520** | Series 1 **or** 2 (125H/135H/165H, 225H/265H) | **11 or 13 TOPS** | Arc (dual-channel memory needed) | 96 GB DDR5-5600, IBECC | **Windows 11 IoT Enterprise LTSC 2024; Ubuntu 24.04; RHEL 9.6+/10** | 0–50°C (HX), **-40 to 70°C (K520)** | 4× 2.5GbE, 6× USB 3.2 Gen 2, 2× TB4/USB4, PoE via ModBay (up to 90 W on K520) | yes: "Edge AI" | shipping (HX524 has PCIe for a dGPU/Hailo) |
| **Advantech MIC-780** | Series 2, Arrow Lake-S (up to 24 cores) | 13 TOPS NPU; "up to 36 TOPS" platform | Intel Graphics | **128 GB DDR5 ECC** | *not stated (unverified)* | *not stated* | 4× GbE, 4× USB 3.2, PoE via iDoor, 1/2.5/10GbE options, PCIe Gen5 x16 | yes: "vision-intensive automated inspection"; Intel AI Edge System brief lists OpenVINO/Geti | launched Oct 2025 |
| **Neousys Nuvo-11531** | Series 2, Core Ultra 200S (Arrow Lake-S) | 13 TOPS NPU; "36 TOPS" platform | Intel Graphics | 64 GB DDR5-6400 | Windows / Linux *(per vendor page, details not fetched)* | -25 to 60°C | **4× 2.5GbE with optional PoE+**, 4× screw-lock USB 3.2 | yes: machine vision, PoE/GigE cameras | shipping (vendor page returned 403; specs via reseller/press, **secondary**) |
| **Neousys Nuvo-11000** | Series 2, Core Ultra 200S | 13 TOPS NPU; "36 TOPS" platform | Intel Graphics | *not verified* | *not verified* | **-25 to 70°C** | up to 6× 2.5GbE with optional PoE+ | yes | shipping (**secondary**) |
| **Lenovo ThinkEdge SE100** | Series 2, Arrow Lake-H (Ultra 5 225H / Ultra 7 255H) | 13 TOPS | Arc | *not verified* | *not verified* | *not verified* | *not verified* | yes: edge AI inference | shipping; this is a compact **fan-cooled edge server**, not fanless |
| **OnLogic Helix 521-PLC / 524-PLC** | Series 1 or 2 | 11 / 13 TOPS | Arc | 96 GB | Windows 11 IoT (Ubuntu/Ubuntu RT planned) | 0–50°C | 4× 2.5GbE, dual PoE+ M.2 (524, forthcoming) | PLC/CODESYS first, AI second | from $3,121 (HX521-PLC), **2026-09-22** |

Also seen but not tabulated: ASRock Industrial's iBOX-358H / iBOX-325 fanless Panther
Lake boxes (128 GB DDR5-7200 IBECC) and NUC(S) BOX Ultra 300 mini-PCs; AAEON's first
Panther Lake mini-PC (Jan 2026, model not confirmed); Dell Pro Slim Plus XE5 / Dell Pro
desktops with Core Ultra Series 2 as **NativeEdge** endpoints. NativeEdge is an
orchestration platform that manages OptiPlex/Precision/PowerEdge/gateway endpoints, not a
device line, and no Dell fanless Core Ultra edge box was confirmed.

### Intel's own programme

**Intel AI Edge Systems / Edge System Qualification (ESQ)** qualifies OEM systems against
the Open Edge Platform. Its published floor for the "AI Edge Systems" tier is Core Ultra
Series 2 or 3 with an iGPU of 7+ Xe cores and **at least 32 GB DDR5**. The ESQ page itself
does not list qualified systems, and the searchable catalogue lives in Intel's Solution
Hub (Advantech's UNO-258 appears there as a partner spotlight). Qualification is about
OpenVINO/Open Edge Platform benchmarks tiered by performance. The page names no VLM-specific
test, so "ESQ-qualified" does **not** mean "proven to run Qwen3-VL".

## 3. Software support on these boxes

- **Linux + NPU: yes, on every generation.** `intel/linux-npu-driver` v1.38.0 lists Meteor
  Lake, Arrow Lake, Lunar Lake, Panther Lake and Wildcat Lake, validated on Ubuntu 24.04 and
  (new in 1.38.0) Ubuntu 26.04, kernel 7.0.0-31-generic, paired with **OpenVINO 2026.3.1**
  and Level Zero 1.32.0. OpenVINO's NPU configuration page points at the same driver and
  requires a supported OS and kernel headers. In practice this means the OV-CPU / OV-GPU /
  OV-NPU rows of this repo's Benchmark could run on an Ubuntu-only edge box.
- **Windows IoT Enterprise: available, and is the default "Windows" offer.** Lenovo and
  OnLogic both ship Windows 11 IoT Enterprise LTSC 2024, which Microsoft describes as
  feature-equivalent to 24H2 with a 10-year lifecycle, for fixed-function devices. The
  Intel NPU is reached there through Windows ML's `OpenVINOExecutionProvider`, which Windows
  ML downloads on demand. That is the same path as on the laptop.
- **Copilot+ / Windows AI features on IoT Enterprise: only on Copilot+ hardware.** Microsoft
  Support's Phi Silica component update for Intel (KB5063134) lists "Windows 11 IoT
  Enterprise, version 24H2" among applicable editions, and says "This article applies to
  Copilot+ PCs only". Microsoft Learn defines Copilot+ as an NPU of 40+ TOPS. So a Meteor
  Lake or Arrow Lake edge box cannot get Phi Silica or the Windows AI APIs on its NPU.
  Whether a Panther Lake edge box, which clears 40 TOPS, carries the Copilot+ designation,
  and whether the **LTSC** channel (as opposed to IoT Enterprise GAC 24H2) receives AI
  components at all, are both **unverified**. No vendor above claims either. None of this
  affects this repo's own path, which uses Foundry Local and OpenVINO GenAI, not Windows AI
  APIs.

## 4. Camera interfaces

Every box above offers **USB 3.x** and **GbE/2.5GbE**. PoE(+) for powering IP/GigE
cameras is common, either built in or as a module: Advantech iDoor/PoE board, Neousys
PoE+, OnLogic ModBay, ASRock. **MIPI CSI** is effectively absent from the box-PC tier.
Intel's IPU6/IPU7 MIPI camera path exists in the silicon and has Linux drivers, but none
of the fanless boxes sampled exposes it, and GMSL cameras on this tier would mean a
vendor-specific add-in card (not verified for any device here). For this repo that is
fine: `vision/` reads frames through OpenCV, so a USB UVC camera works as-is. An RTSP/GigE
IP camera would need a different frame source, not a different model path.

## 5. Non-Intel context (one line each)

- **AMD Ryzen AI Embedded P100 / X100** (Jan 2026, expanded Mar 2026): Zen 5 + RDNA 3.5 +
  XDNA 2 NPU, 50 TOPS NPU, up to 80 platform TOPS, explicitly aimed at industrial, machine
  vision and robotics. Note that Windows ML's AMD GPU EP is "not supported for GenAI
  scenarios today" (`docs/stack.md`).
- **Qualcomm**: industrial boxes exist (e.g. OnLogic Factor 101 on QCS6490, Linux), but the
  Copilot+-class Snapdragon X parts appear mainly in consumer/commercial PCs and mini-PCs,
  not in fanless industrial edge boxes. **Not verified** beyond a trade-press listing.

## 6. Honest caveats

- **TOPS figures are vendor marketing and are not comparable across vendors.** Each vendor
  quotes whichever number is largest: Advantech/Neousys "36 TOPS", Lenovo "97 TOPS",
  ASRock/Advantech "up to 180 TOPS". All are platform sums that assume the top SKU. The
  NPU-only figures in the table come from Intel's per-generation numbers, not from the
  device pages.
- **Several vendor pages did not render** for the fetch tool (ASRock Industrial product
  pages, Neousys, parts of OnLogic's store, Lenovo PSREF). Those rows rely on the vendor's
  own press release as reprinted by trade press, and are marked.
- **Nothing here was measured.** No device above has been benchmarked with Qwen3-VL, and no
  vendor claims a VLM result for its box. Intel's deck contains third-party VLM claims
  ("3.9X higher VLM throughput… against NVIDIA Jetson AGX Orin", attributed to a humanoid
  robotics customer) that Intel itself footnotes as "Intel does not control or audit
  third-party data".
- **Lunar Lake memory ceiling not re-verified in this pass.** Its memory is on-package, and
  the commonly cited 32 GB maximum was not checked against Intel ARK here. It is irrelevant
  to the device list only because Intel does not position Lunar Lake for the edge.
- **"Commercially available" varies.** The Panther Lake systems were announced between
  January and July 2026 with "Q2 2026" availability targets. Actual shipping status by
  region was not confirmed per SKU.

---

## 7. Connection back to this repo

- **The benchmark laptop flatters the NPU.** The FL-CPU / OV-CPU / OV-GPU / OV-NPU rows were
  measured on Lunar Lake, whose 48 TOPS NPU is absent from every Series 1/2 edge box, where
  the NPU is 11–13 TOPS. On an Arrow Lake box the OV-GPU row (Arc 140T, up to 77 TOPS) is
  the one to expect to matter. The NPU's advantage there is power, not speed. A Panther Lake
  box (NPU 50 TOPS, 12-Xe GPU on H-SKUs) is the nearest edge equivalent of the dev machine.
  It is the right target if the demo wants to say "this runs on something you could bolt
  next to a production line".
- **ADR-0012/0013 look better in this light.** The second Runtime (OpenVINO GenAI) is the
  one that survives the move to the edge. It runs on the Ubuntu 24.04 images these vendors
  ship and is covered by Intel's Linux NPU driver. It also avoids the Windows dependency
  that Foundry Local brings. Foundry Local remains a valid Windows IoT Enterprise story, but
  on Intel it only offers `qwen3-vl` as CPU (Constraint 3).
- **RAM is not the bottleneck on this tier.** 64–128 GB is standard, well beyond a 2B–8B
  VLM. Intel's own ESQ floor of 32 GB is also enough.
- **Camera: USB now, IP cameras later.** Every box takes a UVC camera, which is all `vision/`
  handles today. PoE/GigE is where industrial deployments actually connect cameras, and
  would be the natural next Frame source if the demo ever moved to the edge.

---

## References

All accessed 2026-09-23.

- Intel — *Intel Core Ultra Processors (Series 3) for the Edge* overview (PDF): https://cdrdv2-public.intel.com/855291/Intel%C2%AE%20Core%E2%84%A2%20Ultra%20Processors%20Series%203%20for%20Edge%20Overview_2.pdf
- Intel — Core Ultra processors for the edge: https://www.intel.com/content/www/us/en/products/details/processors/core-ultra/edge.html
- Intel — ESQ for AI Edge Systems: https://builders.intel.com/ecosystem-engagement/solution-hub/systems/edge-systems-qualification/ai-edge-systems
- Intel — Solution Hub partner spotlight, Advantech UNO-258: https://builders.intel.com/ecosystem-engagement/solution-hub/edge-ai-catalog/partner-spotlight/advantech-uno-258-189
- Intel — `linux-npu-driver` releases: https://github.com/intel/linux-npu-driver/releases
- OpenVINO — Configurations for Intel NPU: https://docs.openvino.ai/2026/get-started/install-openvino/configurations/configurations-intel-npu.html
- Microsoft Learn — Copilot+ PCs developer guide (40+ TOPS): https://learn.microsoft.com/en-us/windows/ai/npu-devices/
- Microsoft Learn — What's new in Windows 11 IoT Enterprise LTSC 2024: https://learn.microsoft.com/en-us/windows/iot/iot-enterprise/whats-new/windows-11-iot-enterprise-ltsc-2024
- Microsoft Support — KB5063134, Phi Silica update for Intel-powered systems: https://support.microsoft.com/en-us/servicing/os/windows/ai-components/2025/06/kb5063134-phi-silica-ai-component-update-version-1-2506-707-0-for-intel-powered-systems
- Advantech — UNO-258 announcement: https://www.advantech.com/en-us/resources/news/advantech-unveils-next-gen-ai-box-pc-uno-258-powered-by-intel-core-ultra-series-3-processors
- Advantech — MIC-780 announcement: https://www.advantech.com/en-us/resources/news/advantech-launches-mic-780-the-first-fanless-industrial-box-pc-powered-by-intel%C2%AE-core%E2%84%A2-ultra-processors-with-integrated-npu
- Advantech / Intel — MIC-780 product brief (PDF): https://campaign.advantech.online/en/intelligent-systems/industrial-computers/2026/Intel%20AI%20Edge%20System%20Product%20Brief_MIC-780.pdf
- ASRock Industrial — iEP-7050E announcement: https://www.asrockind.com/ja-jp/article/287 (did not render; content via search snippet and https://timestech.in/asrock-industrial-introduces-iep-7050e-series-high-performance-edge-ai-controller/)
- ASRock Industrial — Core Ultra Series 3 line-up (trade press): https://www.back2gaming.com/news/asrock-industrial-brings-intel-core-ultra-series-3-to-edge-ai-boards-nucs-and-fanless-systems/
- OnLogic — HX520 / K520 support documentation: https://support.onlogic.com/product-documentation/industrial-products/helix-hx500-series/hx520-k520
- OnLogic — Helix 500 series: https://www.onlogic.com/store/computers/industrial/fanless/helix-500/
- LinuxGizmos — OnLogic Helix 521-PLC / 524-PLC: https://linuxgizmos.com/fanless-onlogic-controllers-pair-core-ultra-with-codesys-and-fieldbus-expansion/
- Lenovo — ThinkEdge press release (SE60n Gen 2): https://news.lenovo.com/pressroom/press-releases/data-potential-next-generation-ai-driven-thinkedge-solutions/
- CNX Software — Lenovo ThinkEdge SE60n Gen 2 specs: https://www.cnx-software.com/2026/03/02/lenovo-thinkedge-se60n-gen-2-fanless-edge-ai-computer-features-up-to-97-tops-intel-core-ultra-7-265h-soc/
- Lenovo Press — ThinkEdge SE100 product guide: https://lenovopress.lenovo.com/lp1995-lenovo-thinkedge-se100-server
- CNX Software — Vecow TGS-2000: https://www.cnx-software.com/2026/01/08/intel-core-ultra-series-3-panther-lake-h-cpu-powers-tgs-2000-series-stackable-edge-ai-computers/
- Neousys — Nuvo-11531: https://www.neousys-tech.com/en/product/product-lines/industrial-computers/nuvo-11531 (403 to the fetch tool; specs via https://www.bvm.co.uk/products/neousys-nuvo-11531-15th-gen-core-ultra-fanless-embedded-computer/)
- Neousys — Nuvo-11000 press release: https://www.neousys-tech.com/en/news/press-room/2025/463-neousys-technology-unveils-nuvo-11000-series-rugged-fanless-computers-boosting-ai-enabled-computing-performance (403; via search snippet)
- Dell — NativeEdge: https://www.dell.com/en-us/lp/dt/edge-solutions-nativeedge
- AMD — Ryzen AI Embedded portfolio press release: https://amd.com/en/newsroom/press-releases/2026-1-5-amd-introduces-ryzen-ai-embedded-processor-portfol.html
- CNX Software — OnLogic Factor 101 (Qualcomm QCS6490): https://www.cnx-software.com/2026/02/23/onlogic-factor-101-a-fanless-industrial-edge-ai-computer-with-qualcomm-qcs6490-soc-10gbe-networking/
- This repo — `docs/stack.md` (Constraint 3), ADR-0012, ADR-0013
- This repo — [2026-09-22 value scenarios](2026-09-22-local-multimodal-vision-value-scenarios.md)
