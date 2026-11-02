# Google Flow in the agent's browser

The procedure behind `ai-media-policy.md` section 10 for Google Flow (labs.google/flow). Measured on one launch ad, 2026-10-17 and 18, on that week's Flow interface: labels, models and prices change, so read them on screen at first use and record what you read.

Contents: 1 When. 2 Connect. 3 Stills first. 4 Video rounds (paid). 5 Files. 6 Pitfalls and stops. 7 Review every take.

## 1. When

All of these hold: the user allowed AI media for the element types in question (`ai-media-policy.md` section 1), chose this route in their own words or answer, and has a Google plan that includes Flow. The film needs realistic plates, people without faces, or footage that cannot be filmed, captured or licensed. Never for screens, UI or the product working (capture it, `screen-capture.md`), never for logos (composite the real file), never for real people's faces (section 9 of the policy).

## 2. Connect

1. Use the agent browser that reaches this session (Claude's in-app browser needs no extension; Claude in Chrome needs the extension signed in to the same Claude account).
2. Open the Flow page and stop at Google's sign-in: the user signs in. A second account later is the user's own sign-in again; the agent never picks or switches accounts.
3. Read the plan and the credit balance shown on screen and write both in the ledger (`ai-media-policy.md` section 7). If the profile menu offers to hide the visible watermark, the user decides; the invisible SynthID mark always stays.

## 3. Stills first

- The image model the plan includes at no credit cost (Nano Banana Pro on the tested plan); start frames in the film's aspect ratio, references square, two outputs per prompt to pick from.
- One reference sheet per character (hands, rings, watch, sleeves, clothing colours, phone case) attached to every start frame of that character, so details hold across shots. Faces appear only where the brief allows them (for example a profile photo inside a chat).
- Prompt the real thing (`ai-media-policy.md` section 4): lens and aperture, one light source and its colour temperature, three to five real imperfections, light grain. Say where the frame edge cuts the body when a face must stay out. Screens off or plain, packaging unprinted, number plates in the country's real style and too soft to read.
- Fix a detail with an image edit (a stray logo, a readable word, a wrong plate), never by regenerating everything. Real logos are composited later from the official file.
- Inspect every still at full size (`ai-media-policy.md` section 5) before it becomes a start frame.

## 4. Video rounds (paid)

- Mode: frames to video, with the approved start frame (and an end frame when the camera must settle), the film's aspect ratio, the shortest length that covers the shot, one output per prompt. The default may be several outputs: read the credit line next to the generate button ("Generating will use N credits" on the tested interface) before every click.
- Quality model for finals, the fast model for tests. Before each round: tell the user the credits per clip, the round's total and the balance left, and wait for their yes (`ai-media-policy.md` section 10, router stop C). No yes: no clip.
- Prompts describe motion only: one action at real pace, the last second held still, "no dialogue, no music", and a line that keeps a head out of frame when it must stay out. The clip's own audio is always muted in the edit; music and effects come from real recordings only (`ice-audio/SKILL.md` core rule 7).
- Write every character as an adult; some regions refuse minors in generated video.
- A clip that fails at Flow's audio step may be refunded by Flow; rerun without the sound line, after checking the balance.

## 5. Files

- **Download.** Each image and clip has a signed media URL; fetch it with a plain HTTP request (no user cookies) into `ice/assets/generated/`, named by shot, and record its hash.
- **1080p.** The download menu offers an upscaled 1080p copy at no credit cost on the tested plan. One upscale at a time; when it is ready its signed URL appears in the page's own network response (the media id with an `_upsampled` suffix on the tested interface). After a reload, asking for 1080p again returns the finished link.
- **Upload** (references, the user's own frames). When the browser cannot open the local file picker, the file can be passed into the page in base64 chunks with a checksum per chunk, assembled into a `File`, and dropped on Flow's drop area as a drag event. Confirm the "rights to use this image" box only for the user's own material or material the user named.

## 6. Pitfalls and stops

- A late banner (credits, offers) shifts the grid: close it before clicking.
- Before every click, check the element under the point (by name, not by guessed coordinates). A wrong click once moved a clip to the trash; Undo restored it.
- Keep the normal window size; a phone-size emulation produced wrong clicks.
- Tile ids can disappear from the list: match thumbnails against the downloaded files.
- If the page moves without the agent, the user is working in it: wait.
- **Stops.** A sign-in, account picker, plan, payment, consent or terms page; an unusual activity response (`PUBLIC_ERROR_UNUSUAL_ACTIVITY`); a rate or quota warning; a captcha. Stop all automation on that account at once, tell the user, and fall back as `ai-media-policy.md` section 10 says. Never retry in a loop, never move to another account to continue.

## 7. Review every take

Full size, the whole take, before it enters the edit (`ai-media-policy.md` section 6): faces including mirrors and reflections, screens with invented text, phones used while dark or locked, objects that fly or float, scale between people and things, plates, logos, gestures (never one raised finger, `brand-authenticity.md` section 5), and the end state. Cut before the first bad frame or regenerate, and record the accepted window in the ledger.
