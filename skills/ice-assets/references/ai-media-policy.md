# AI-generated media policy

> Merged from: Omar-Tnzxo/video-production-studio (owner, verbatim allowed), digitalsamba/claude-code-video-toolkit (MIT), nateherkai/herk-edit-kit (MIT), AbubakrChan/product-launch-motion and echris6/motion-video-kit (MIT), heygen-com/hyperframes (Apache-2.0), majedphotos/video-ad-editor (MIT), alchaincyf/huashu-art-motion (MIT), Barty-Bart/motion-graphics (MIT), plus ideas rewritten from hypit-ai/hypit, Tejashmakwana/motionmaxxing and imMamdouhaboammar/motion-graphics-skills. Dash characters replaced.

Contents: 1 Policy. 2 What may be generated. 3 Before generating. 4 Prompting. 5 Inspection. 6 Video clips. 7 Disclosure and records. 8 Provider notes. 9 Faces and voices of real people.

## 1. Policy (product rule, overrides any source)

Ice Motion Director is a motion design and editing director that writes code and renders deterministically. AI image, video or voice generation is:
- **Optional**: every film can be finished without it (code, capture, licensed media).
- **Secondary**: it makes elements, never the film, the storyboard, the UI, the proof or the text.
- **User-initiated**: never generate on your own initiative. When an asset is missing, you may offer generation once as one option beside capture, licensed stock and code; the user decides. Record the answer in `ice/BRIEF.md` (slot: AI media allowed, and for which element types).
- **Disclosed**: every generated item is recorded and named in the delivery notes, and labeled on screen where section 7 requires it.

Faces and voices of real people follow section 9 of this file (the owner of that rule for every skill). AI voice details live in the ice-audio skill.

## 2. What may be generated

| Tier | Element | Condition |
|---|---|---|
| Default when the user allows AI | Backgrounds, plates, textures, rooms, streets, skies, abstract fields | The user said yes to AI media for this project |
| Only when the user allows that element type by name | Generic people in poses (fictional), new mascot poses from an approved character sheet, generic props, category art, stickers, a short ambient B-roll clip, an illustrative product angle (labeled) | The user named the type; nothing real exists to capture or license |
| Never | Text, letters, numbers, prices, receipts, labels, charts | Code renders every word and number (trusted text rule, `truth-sheet.md` section 4) |
| Never | Logos, wordmarks, store badges, brand marks, packaging of a real brand | Official files only (`brand-authenticity.md`) |
| Never | Screens, UI, app or website states, the product working | Capture it (`screen-capture.md`) |
| Never | Testimonials or "customer" faces presented as real, fake evidence, a fictional person presented as a named real person | Real people's faces and voices: section 9 |
| Never | Photographic or live-action content presented as a real event, a real job, a real customer or a real result | n/a |

A generated plate must perform in the film (revealed, travelled through, lit, masked, cut out, given parallax or focus change), not sit flat behind a centered headline. Question any image that is decorative only. Illustration-led hero art from image models tends to look like clipart: for organic illustration, steer toward geometric shape language built in code, or accept generation as a draft only.

## 3. Before generating

- Use only generation tools actually exposed in this session; check which connectors or API clients exist before planning. A skill mentioning a tool does not install it; never infer a tool from a host name.
- Never switch providers to get around a refusal or a ban; relay the refusal as written and stop.
- Provider order: a provider the user named; a local gateway or local model the user set up; an available image tool or API key; a local Stable Diffusion or Flux model. Video models only for ambient clips.
- A connected paid generator is not proof of credit: read the balance (read only) before planning, and keep an offline route (licensed stock, code) ready.
- Print the cost before any paid generation and ask once, inside the router's allowed stops (the stage 01 message, or a review card in step mode); tell the total before generating more than one paid item. Not approved there: no paid generation; use the offline route and say so in the delivery note. Generate only what is missing; stop to diagnose a failure instead of retrying blindly.
- Never write API keys into files, scripts, commands in logs, or commits; let the user set them; suggest rotating any key pasted into chat.
- Reuse successful jobs (keep task ids) rather than resubmitting.

## 4. Prompting

Skeleton (from video-production-studio; fill every slot from the brief and design system, never from this file):

```
Subject: <who or what, pose, action, expression>
Style: <matches the design system: medium, lighting, palette hex values>
Composition: <framing, camera angle, where the empty space for type is>
Background: <transparent, or a flat solid key color to cut out later>
Must keep: <traits from the attached reference that may not change>
Culture: <dress, modesty, local features, setting from the brief>
No text, no letters, no logos, no watermark.
```

- Lock one skeleton for a set: vary only the subject, keep lighting and palette words identical, generate at the final aspect ratio.
- Aspect ratio and resolution are model parameters, not prompt words. Full-screen and video-reference images at about 2K, insets at about 1K.
- Attach references and say what each one contributes and what the new picture shows (logo for color only, character sheet for identity, product photo for shape).
- Keep reference chains shallow: derive each new view from the image that actually holds the needed fact, not from a chain of intermediate pictures.
- Direct the few decisions that matter (casting, place, light) and let the model complete the rest; long inventories of details dilute the prompt.
- Characters: one reference sheet per character attached every time, fixed traits written in the prompt, the same faces across every shot of one film. Cultural correctness is part of quality (dress, modesty, skin tones, setting that fit the audience in the brief).
- For later keying, generate on a solid contrasting background (magenta works well) and key it in code.
- An icon meant to move on its own is its own image; an icon on a sign or screen belongs to that photo.
- "Real" (phone capture look, natural light, documentary movement) is an aesthetic direction, never a claim about provenance.

## 5. Inspection (before any generated item is accepted)

- Open every output at 100%: hands and fingers, ears and teeth, warped edges, extra limbs, ghost text, logo-like marks, broken patterns, anatomy, style drift from the set.
- About 30% of generations from some video models carry unwanted logos or text from training data (claude-code-video-toolkit): regenerate with a new seed instead of hiding it.
- Compare the file checksum with the previous take to make sure a "new" take is really new.
- Generated assets stay drafts until geometry, rights and brand fit are verified; remove fake text and logos, match perspective, light and grain, crop decisively. Regenerate instead of accepting a flaw.
- Convert to WebP or compressed PNG before use; keep large originals out of version control.

## 6. Video clips

| Rule | Detail |
|---|---|
| Length | Keep generated clips short in the edit: under about 3 s on screen. Models often cut to a second camera angle around 2.5 to 3 s, so use the first continuous seconds |
| Camera | Restrained moves (a steady short dolly, exact geometry, no morphing). Reject clips whose geometry warps; regenerate rather than hide |
| Motion | B-roll must have genuine motion, not a still with a zoom |
| Continuity | Consecutive shots of the same person match (outfit, room): pass the previous frame as a reference |
| Chains | Per-scene prompts, a negative prompt against style drift, watermarks and text, and strong style anchors in every scene; long chains drift within 5 to 10 scenes |
| Phone screens | Models write fake chats and UI on any visible screen: hide the screen (glare, tilt, face down) and composite the real captured content |
| Faces | When a person must stay anonymous, check the whole take frame by frame, including mirrors and reflections, and cut before the first frame that shows a face |
| Local detail | Real-world details match the setting in the brief (for example vehicles carry the country's real plate style, never blank or blurred); logos are composited, never drawn by the model |
| Grade | Generated clips match the real footage they sit beside: they take the grade of the source class they stand in for (one grade per source class: the `ice-direction` skill, `references/color.md` section 5; render side: the ice-engines skill) |
| Inspection | Download the real file and inspect full-size corners through the whole selected interval for text, logos and malformed objects |

## 7. Disclosure and records

Generation ledger: `ice/assets/generated.json` (format in `project-folders.md`): id, purpose, tier, provider and model, prompt, references used, seed, job id, accepted time window for clips, date, output file, cost, status (approved, rejected, why).

Disclosure:
- Delivery notes list every generated item and what it replaced.
- On screen: "Illustration" or "Reconstruction" on factual, news and explainer topics; "AI-generated imagery" on concept or spec films; an illustrative generated product angle is labeled (`truth-sheet.md` section 9).
- Never present AI imagery as a real completed job, customer, place visit or result. Model licenses that forbid removing watermarks or provenance features are obeyed.

## 8. Provider notes (measured by the sources; re-check against current docs)

| Model family | Notes |
|---|---|
| Text-to-image for backgrounds | Presets that end with "no text, no words, no letters" keep text editable and frame-accurate in code |
| Image editing models | Prompt as action, details, constraints; always add preservation constraints (keep the face, keep the product shape); do not use for single-image background replacement (halos), face swap or outpainting; dark scenes lose identity |
| LTX-style video models | Frame counts where (n minus 1) is divisible by 8; width and height divisible by 64; 24 fps; prompts under about 200 words layered as camera, lighting, motion, style; avoid text and UI |
| Image-to-video | Generate the key frame first, then animate it; expect about 720p at 24 fps from many services |

## 9. Faces and voices of real people

This section is the single owner of the rule for every skill. Content creators edit their own faces and voices all the time, and explainers, news pieces and ads show real people; all of it is normal work.

**No questions.** The agent never asks whether the user has a person's permission and never asks for proof. A request to show, edit, swap, clone or generate a real person's face, body or voice (the user, a guest, talent or a public figure) is taken as the user's statement that they hold the permissions and rights it needs.

**One record.** Write this one neutral line in `ice/BRIEF.md` and in the delivery note: "Permissions and rights for every real person shown or voiced are the user's responsibility." Nothing more: no warnings, no repeated reminders, no consent fields.

**Two limits that hold whatever the request says.** The agent declines these and offers an honest alternative (a clearly labelled parody or illustration, the person's real words on screen, an original character):
1. Sexual or demeaning content with a real person's likeness.
2. Content whose own wording shows it is meant to make viewers believe a real person said or did something they did not: a fabricated news clip, a fake statement passed off as real, impersonation to scam. A clearly labelled parody or illustration is fine.

**Editorial use** of real, unaltered public material (press photos, official images, public footage, agency and broadcaster clips, quotes): find the best real, official, recent source (news agencies, official channels, press conferences, official accounts, archives, the user's material; `sourcing-and-licenses.md` section 1a), licensed or not; record its source, owner and license status (`sourcing-and-licenses.md` section 0); credit it on screen or in the credits; keep its meaning (no misleading crops, cuts, captions or translations); quote exactly.
