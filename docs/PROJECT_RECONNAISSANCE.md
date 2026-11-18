# Project Reconnaissance

Inspected 2026-11-16 on the build host (the Linux server this session runs on). Nothing outside
`/root/goldstein-apartment/` was modified.

## 1. Existing project structure

There was **no existing Goldstein project**. A search of the disk for "goldstein", "queenie" and
"fantastic" found nothing. The new project lives in `/root/goldstein-apartment/` and is separate from
every other project.

Neighbouring work that matters (inspected, left untouched):

| Path | What it is | Relevance |
|---|---|---|
| `/root/jumanji-vr` | WebXR VR world. IWSDK 1.1.0-rc.2 (Meta Immersive Web SDK), `super-three` 0.185, TypeScript, Vite 7. Target **Meta Quest 2**; Quest 2 XR emulator configured. | A working VR stack with locomotion, grabbing, spatial UI, performance tooling and headless emulator tests. **Its `main` branch auto-deploys publicly to Vercel**, so this project must not live inside it. |
| `/root/GameStudio` | Godot 4 studio: 2D/3D/mobile templates, validation scripts, skills | A possible native-VR route (see §4) |
| `/root/.local/bin/godot` | Godot **4.7.2-stable**, with Android export templates installed | Native Quest build possible |
| `/root/Android/Sdk` | build-tools 35.0.1, platform android-35, platform-tools; OpenJDK 17 | Needed to build a Quest APK |

## 2. Rendering engine and framework

Not chosen yet. This is decision **D1** in `MISSING_REFERENCES_AND_DECISIONS.md`. Two candidates are
already installed on this host:

| | **A. Godot 4.7 + OpenXR, native Quest APK** | **B. IWSDK / Three.js WebXR** (like jumanji-vr) |
|---|---|---|
| Privacy | APK sideloaded over USB. Never on the internet. | Needs HTTPS to reach the headset. Private only if served on the home network or behind access control. **Never** the public Vercel flow. |
| Fidelity headroom on Quest 2 | Higher: native Vulkan/GLES, MSAA, fixed foveation, no browser overhead | Lower: browser overhead; three.js PBR is costly on Quest 2 |
| Baked lighting | LightmapGI in-engine, or Blender bakes | Blender bakes only (no in-engine baker) |
| Test tooling here | Headless import/validation only; **no XR emulator** on this host | Proven headless XR emulator and test scripts in jumanji-vr |
| Iteration | Rebuild and sideload APK (about a minute) | Reload a browser tab |

**Recommendation: A (Godot native)**, mainly for privacy and GPU headroom. The scene is one small,
detailed interior where realistic lighting matters most. Use Blender as the modelling, UV and
lightmap-bake tool for both routes, so the decision stays reversible until Phase 3.

## 3. Existing VR compatibility

- Hardware evidence points to a **Meta Quest 2**: jumanji-vr's emulator and testing guide target it.
  jumanji-vr itself has **never been run on a physical headset** (its docs say so). To be confirmed: D2.
- No VR code exists for this project yet, and none should until the references are reviewed.

## 4. 3D modelling and asset pipeline

| Tool | Status on this host |
|---|---|
| FFmpeg / FFprobe 6.1.1 (scdet, select, tile, thumbnail filters) | Installed. Used by `tools/refs/refs.py`. |
| Python 3.12.3 + Pillow 10.2 + NumPy 1.26.4 | Installed. **No pip, no venv, no OpenCV, no SciPy.** |
| Node 22.23.3 | Installed (pdf.js was used once, in a scratch folder, to read the screenplay) |
| Godot 4.7.2 + Android templates + Android SDK + JDK 17 | Installed |
| **Blender** | **Not installed.** download.blender.org is reachable. Headless Blender runs here (CPU Cycles for bakes); interactive modelling is better on your Windows PC. Install decision: D3. |
| fSpy (camera matching from single images) | Not installed; a desktop app for your Windows PC |
| GPU | **None on this host.** Bakes would be CPU-only and slow. A Windows PC with a GPU is better for Cycles and Godot lightmap bakes. |
| Machine | 8 CPU cores, 23 GiB RAM, about 251 GB free disk |

## 5. Target headset and hardware constraints

Assuming Quest 2 until you confirm (D2). Budgets for one small apartment at 72–90 Hz:

| Budget | Quest 2 starting target |
|---|---|
| Triangles in view | ≤ 300k (native) / ≤ 150k (WebXR) |
| Draw calls | ≤ 100 (native) / ≤ 60 (WebXR) |
| Real-time shadow-casting lights | 0–1 (fire flicker only); everything else baked |
| Texture memory | ≤ 256 MB with ASTC/KTX2 compression |
| Character | One skinned mesh, ≤ 30k triangles, ≤ 60 bones, 1–2 materials |
| Audio | ≤ 8 simultaneous spatial voices |

A Quest 3 would roughly double the GPU headroom. Only the budgets change; the plan stays the same.

## 6. Preserving existing working code

No existing file was edited. The jumanji-vr working tree (uncommitted work included) was only read.

## 7. Legal and privacy constraints

- **Film footage:** no DRM circumvention, no rip tools, no pirate sources. See `REFERENCE_CAPTURE_GUIDE.md` §1.
- **Images:** public promotional stills are cached privately for study and are git-ignored. Film-derived
  textures (for example wallpaper traced from stills) stay in this private project and are never published.
- **Likeness:** Queenie is played by a real person. See `QUEENIE_BEHAVIOUR_PLAN.md` §2.
- **Music:** user-supplied recording only. See `AUDIO_REQUIREMENTS.md` §4.
- **Hosting:** nothing deployed. No public repository, no Vercel.
