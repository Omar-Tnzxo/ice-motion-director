# Screen recordings, product UI capture and cutouts

> Merged from: Omar-Tnzxo/video-production-studio and brand-identity-studio (owner, verbatim allowed), edenfunf/reelmimic (MIT, crop detection), majedphotos/video-ad-editor (MIT), nateherkai/herk-edit-kit (MIT), heygen-com/hyperframes and hyperframes-community-skills (Apache-2.0), AbubakrChan/product-launch-motion (MIT), zhuyansen/awesome-claude-video-skills entries (MIT), plus ideas rewritten from Vincentwei1021/anything2explainer, Tejashmakwana/motionmaxxing and imMamdouhaboammar/motion-graphics-skills. Dash characters replaced.

Contents: 1 Before any capture. 2 Mobile apps. 3 Web and desktop. 4 Fixing recordings (frame rate, drops, crop). 5 Capture or rebuild. 6 Using captured UI in frame. 7 Product photos and cutouts. 8 User footage intake.

Real material is what makes a film look made by people who know the product. Capture it yourself; never ask the user for screenshots you can take.

## 1. Before any capture

- **Latest build.** Build and install the current app or open the live site and check the version. Old screenshots from tests or past campaigns show old screens: never reuse them.
- **Film language.** Switch the app to the language and direction of the film (Arabic UI for an Arabic film) and check RTL.
- **Demo data only.** A seeded test account with believable data. No real customer names, phones, emails, addresses or handles on screen; blur them in every frame if they slip in. The owner's own name stays only when the user is the owner and said so in the stage 01 message; otherwise it is blurred. Keep source footage read only.
- **Never act for real.** Stop before any real order, payment, booking, message or post. Record up to the confirm button, or use a staging environment. Never type real passwords or payment data.
- **Consent and terms dialogs.** Never click Accept on cookie or terms dialogs while recording: choose the privacy-preserving option, close the dialog, or use another page.
- **Clean status bar.** A fixed time, full battery, full signal, no notifications.
- **Credentials.** Keep keys, tokens and real account data out of captured UI, compositions, screenshots and commits.

## 2. Mobile apps

Android (emulator or device):
- Use demo mode for the status bar; drive the app with a UI automation tool (for example agent-device, Maestro, or adb input) for repeatable takes at a human-speed pace.
- `screenrecord` stops at 180 s and writes a variable frame rate file: convert before compositing (section 4).
- Git Bash rewrites device paths such as `/sdcard`; set `MSYS_NO_PATHCONV=1` when running adb from it.

iOS simulator:

```
xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4
xcrun simctl io booted recordVideo --codec h264 clip.mp4
xcrun simctl io booted screenshot shot.png
xcrun simctl status_bar booted clear
```

Recording practice (all devices):
- Record each feature as its own clip with about 1 s of stillness before and after the action, so the edit has handles.
- Show touches with a drawn finger or ring in the composition, not the system "show taps" dots. Place tap marks in the recording's own pixel coordinates, then map them through the same transform as the clip.
- AI assistants and chats: record the real feature in a fresh, empty conversation. Use a demo account or a new empty conversation; an agent never deletes production data itself, and never asks for history to be cleared after stage 01. Record the whole exchange once, then cut it into the beats a viewer needs (question, each answer card, confirm, result).
- Save each clip's last frame as a still so the screen can hold after the clip ends. Playback speed and push-ins on recorded chats: see the ice-motion skill.

## 3. Web and desktop

Websites and web apps:
- Use a headless browser (Playwright or similar) at the target device size with a device scale factor of 2 for crisp text; full-page screenshots for scroll shots; the context's video recording for interactions.
- Browser screen recorders capture CSS pixels, so high-DPR recordings come out small: when crisp text matters, capture frame by frame instead.
- Before a full-page capture: flatten fixed and sticky elements, dismiss overlays, pre-scroll to trigger lazy images, wait for fonts. Save a same-session JSON of the target element rectangles so later zooms aim at real coordinates.
- Pick the first visible match of a selector (non-zero size); hidden duplicates in navigation are a known trap.
- Some docs sites scroll an inner container: scroll with the mouse wheel, not by scrolling the window.
- Log in with a test account; hide personal data; for a website explainer, the user gives the link and which part to show, and the recording follows a visible cursor path.
- A real brand's site: `node <skill>/scripts/capture-brand.mjs --url <page> --out assets/capture/<brand>/<page>/ --sheet ice/assets/captures/<brand>/<page>.json --lang <film language tag> --ratios <film ratios>` saves viewport and full-page captures per ratio (phone widths for 9:16 and 4:5) and a brand sheet per page (language, redirects, consent answer, interface strings), the main page's copied to `ice/assets/brand-sheet.json`; the whole procedure, including what to do with its warnings, is `brand-authenticity.md` section 10 step 3.
- A website capture tool that reports failure is a hard stop for that path (`brand-authenticity.md` section 6).

Desktop software: OBS, or ffmpeg (`-f gdigrab` on Windows, `-f avfoundation` on macOS, `-f x11grab` on Linux) at 30 or 60 fps; scale the UI so text stays readable in the delivery frame.

## 4. Fixing recordings

Constant frame rate (every phone or screen recording before compositing):

```
ffmpeg -i in.mp4 -vf fps=30 -c:v libx264 -crf 16 -pix_fmt yuv420p out.mp4
```

Use 60 instead of 30 for fast scrolling UI.

Dropped frames: a gap above 0.07 s between frame timestamps is a drop. Browser recordings on phones have shown 13% to 54% drops (video-ad-editor). Re-record when possible; otherwise interpolate with ffmpeg `minterpolate` (motion-compensated mode) and check the result frame by frame.

Cropping a phone screen recording to the real picture: a recording of a video or app inside a phone often has the picture as a strip between static UI bands or black bars. Run:

```
python <skill>/scripts/detect_crop.py <recording> [--apply <out.mp4>]
```

It prints JSON with the crop box and a ready ffmpeg command. Method (from reelmimic `analyze.py`): ffmpeg `cropdetect` (limit 24, 2 fps, first 60 s) and the most common box wins; a box covering more than 85% of the frame means no crop is needed. When the bands are busy UI rather than black, it samples 12 frames, measures how much each row changes over time, and keeps the longest run of changing rows (valid only between 15% and 85% of the height). Look at one frame of the cropped output before using it.

Trimming social clips to a fixed vertical size: `scale=W:H:force_original_aspect_ratio=increase,crop=W:H`, and sample mean luma every 0.5 s to catch black cuts.

## 5. Capture or rebuild (scoped)

| Situation | Do |
|---|---|
| Site tour or "show it as it is" brief | The captured page is the visual source of truth: animate the viewport over the real screenshot; pushing past 1:1 needs a 2x capture of that region |
| Static proof (a screen that only needs to be seen) | Use the real screenshot or recording; pictures stay pictures |
| A part that must move, change state, or be read at large size | Rebuild only that part in HTML or code, faithfully, from tokens sampled from the real screen, element by element, compared side by side with the capture; real data only |
| A state that cannot be recorded on demand (a live map position, a rare error, a long process) | Rebuild that screen by copying a real screenshot of it exactly (layout, fonts, colors, spacing) with real data, and pass the side-by-side fidelity check (`brand-authenticity.md` section 11.1). "A rebuilt screen with invented names, prices, timers or ratings is not allowed." Label it in the storyboard |
| UI with no real counterpart (concept films, pre-launch, a "new" app with no build) | No UI screens by default: show the mechanism with objects, hands, places or type. At most one concept screen, with a written reason, built in the film's own type and palette (never a lookalike of another brand's app), declared as illustrative (`truth-sheet.md` section 9) and labelled "Concept screen" on screen in the film's language |
| A screen behind a paywall or login you cannot reach | Ask for access or a recording in the stage 01 message (the agent never signs in itself); without it, use the brand's own published screenshots of that screen or label the recreation as illustrative, and say so in the delivery note |

Never animate a stack of finished screenshots just because a design tool exported them: screenshots are proof, rebuilt code is what changes.

Real content inside feeds and posts: for a film about a public feed or social platform, real public posts may appear with their real usernames and counts when the subject requires it; tell the user what you pulled and from whom (handles, post ids) so they decide what to publish. For product demos, other people's names and personal data are blurred or replaced by demo data (section 1). Content of other rights holders inside a real brand's screens (cover art, artists, user posts, photos, other brands' products) is replaced with licensed or neutral content before build: `brand-authenticity.md` section 11.2.

## 6. Using captured UI in the frame

- The aspect ratio of a recording is sacred: fit it (contain), never stretch or fill-crop it into another shape; build the frame around the recording's ratio.
- Omit navigation bars, footers, cookie banners, URL bars, scrollbars and window controls unless a UI demo deliberately reconstructs them.
- Crop to the part that matters rather than shrinking the whole screen; keep key UI uncropped; a crop target should stay readable at delivery size.
- Real material is the main picture when it exists; code annotates, moves the camera and explains. Composition ratios, device frames and push-ins: see the ice-motion skill.

## 7. Product photos and cutouts

- Source order: the brand's catalog or database, the brand's shoots, the manufacturer's press kit. Check the right to use each image.
- One lighting direction and one shadow style across all products in a film.
- Cutout methods by subject:

| Subject | Method |
|---|---|
| Product on white | White key with border flood fill (keeps white labels inside the product), remove enclosed holes, cut the shadow rows; ML background removers built for people often fail here |
| Product on a colored backdrop | Color key against the measured backdrop color |
| People, complex backgrounds | An ML remover; for fine hair across busy backgrounds or VFX-grade edge stability, use a dedicated segmentation or masking tool |
| Flat vector-style art made on a solid key color | Chroma key (ffmpeg `colorkey`), not AI background removal |

- Check every cutout on the darkest and the lightest background in the film. Bright metal on white remains hard: reshoot or get a transparent original.
- Trim transparent margins; a cutout is a foreground subject, and a full-bleed background behind foreground content is dimmed about 30% to 50% so the foreground stays legible.
- Device-screen replacement: measure the screen edges and corners numerically and build the mask from that geometry; never ship a morphology-cleaned segmentation as a mask.

## 8. User footage intake

Probe every supplied file first: frame rate (variable or constant), HDR (tone map to SDR before compositing), rotation, dropped frames, duration against any length limit (report a voiceover that already breaks a cap; never trim or speed it silently), and a contact sheet to see where faces, hands and empty areas are. Editing the footage itself: see the ice-edit workflow.
