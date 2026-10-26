# PowerPoint-look tests

A film can be correct in every frame and still be a slide deck that plays itself. These tests catch it on the plan, in the source code and on the render. Sources: bang-motion `anti-ppt.md` and structural bans (MIT, translated from Indonesian), motionmaxxing (Apache), huashu-art-motion (MIT), hyperframes docs and skills (Apache), hyperframes-community-skills vox-explainer (Apache), motion-video-kit (MIT), founder skills; IDEAS_ONLY sources (PolyForm explainer sources) rewritten.

## 1. Why models fall into slides

Models are trained to arrange information: title, explanation, support. A promo does not explain, it states: one punch per shot, with motion and music carrying the emotion. If a scene feels like it lacks information, that is often a sign it is right. One shot is one statement; a sentence of 5 words or fewer beats a full sentence; a claim that needs more than 6 words becomes two scenes or a visual (bang-motion).

## 2. Fast tests on any frame

| Test | Fail when | Source |
|---|---|---|
| Slide test (30 s, on the contact sheet) | Cover the text with your hand: more than half the frames are "a flat colour with a card or a block on it". Fix the picture, not the type | motionmaxxing |
| Corporate slide | The frame could become a corporate slide unchanged | bang-motion |
| Where to look | The eye does not know where to look within 0.2 s; remove elements | bang-motion |
| Background calm | Grey-scale the frame with the full title: any background part as bright as the letters is too busy; with all text hidden the background must feel calm, not "interesting" | bang-motion |
| Camera at transitions | Nothing moves because of the camera at a transition (only elements animating themselves) | bang-motion |
| Website hero | The frame would work as a slide or a website hero: it is a page | motionmaxxing |
| Web-section rejection (per scene) | Three or more of: a heading parked while cards move; most elements visible at the scene start; the scene could be exported as a landing-page hero; the primary action is only entrance, loop and exit; the scene ends on a timer. Three failed primary scenes reject the film | founder skills |

## 3. Structural bans checked in the source

| # | Ban | Check | Exception |
|---|---|---|---|
| 1 | Scenes as sections toggled by visibility | Count scene containers (`<section>` or `class="scene"`): three or more toggled with opacity or autoAlpha is a slide deck. Scenes must change because the world or camera moves (camera move, whip to another angle, push-through, background change) | Cartoon stage cuts between fully living stages |
| 2 | No persistent thread | One subject in continuous action, or one world the camera travels; changing full-bleed photos with no shared world is a deck; one picture plus one sentence per scene is a slideshow even with a moving camera; each scene needs 3-5 elements entering per phrase | |
| 3 | Three text levels | Count text nodes per scene: kicker + title + body or credit = slide. At most two: one big number or sentence plus one label that lives in the world | Documents, stamps, date blocks of 3 short lines or fewer count as objects |
| 4 | Ken Burns as the only motion | A photo scaling 1.0 to 1.05 is the only motion; per-second motion must come from the film's background motion language. Horizontal lanes and streak rain only for speed or flow themes, never two projects in a row | |
| 5 | Fade-only cuts | Only fade, a scale bump and a light leak at every cut = slide template; use a whip to another angle, a cut to an instrument (map, gauge, profile), a push-through | |
| 6 | Wrong starter | An explainer built from a generic opener template or from scratch instead of its style's starter (ice-styles skill) | |
| 7 | Zoom floor (miniatures are slides) | Camera zoom under 1.08 so the subject is thumb-sized and empty ground fills half the screen; split the world into frame-sized stages. A "zoom in-out" done as a few percent of camera breath is invisible: change shot size clearly (close-up then back to wide) | |
| 8 | Template skeleton | First scene text that zooms then exits left; three parallel feature tiles; a typed search box; hook, feature, feature, promise, logo, CTA. Two or more without a concept reason = template even in a new skin; at most two canonical components per opener and never the same skeleton two openers in a row | |

Explainer failure pattern seen in practice: six full-bleed photo sections toggled by visibility; kicker, two-line title and credit on each; only a Ken Burns from 1.08 to 1.015 plus a world bump from 1.12 to 0.96 at each cut; a light leak at every cut; no persistent subject. Fix: one flowing world, one big number or sentence plus one living label, parallax, whips and instruments, varied camera breathing, a light leak saved for one moment, the hero present over 60% of the duration (bang-motion).

## 4. Fade-only and front-loaded sections

- Things that only fade or rise in and hold are states, not events (motionmaxxing). A section where every entrance is opacity-only, or opacity plus a small slide, reads as a deck; entries spend two or more decaying channels (offset, scale, blur), never opacity alone (motionmaxxing; numbers owned by ice-motion).
- Front-loading: dumping the whole canvas in the first ~25% of a shot then holding is what reads as a slide. Reveal across the shot, especially the back ~50%, timed to the voiceover, with the camera moving underneath (hyperframes frame worker, product-launch-video, founder skills).
- "Enter then freeze" and "land then cut immediately" are both defects; over-correcting one produced the other (PolyForm ideas).
- `film_gate.py` reports the in-place fade share and the crossfade share of transitions (yellow above 0.60) and the uniform slow zoom share (yellow above 0.70): a uniform slow push in every shot was called "completely like playing a PPT" (huashu).

## 5. Repetition limits

| Limit | Source |
|---|---|
| Static-card or side-by-side layouts at most a third of beats; no two consecutive beats share the same layout recipe or treatment | vox-explainer |
| The same page type at most 3 in a row ("big word, support, top-left label" four times = slides); insert a number slam, an evidence page or a fill-zoom | huashu kinetic grammar |
| Charts: the same layout at most 3 in a row; a white chart in a night film disconnects from the film | huashu finance grammar |
| The same reveal sequence at most 3 times in a row (one long film had 36 slide-ins of 37 labels; the audience could predict it) | huashu Vox grammar |
| List each screen's layout (title, three cards, big number, screenshot): the same layout on 2 screens in a row = switch; "title, three feature cards, big number" looping = slideshow | huashu keynote grammar |
| Equal shot lengths read as slides even when each shot moves: never cut on a metronome | PolyForm ideas |
| Never end two shots the same way in a row | PolyForm ideas |
| Adjacent shots reviewed as silhouettes and actions with headings hidden: if they look like the same card reveal, redesign the weaker one | herk-edit-kit |
| The scene template "fixed heading + subtitle + centred cards or grid + ambient particles + entrance + static hold + exit" on three or more scenes: stop and redesign story and animatic | founder skills |

## 6. The six failure modes (art and explainer films)

1. Page-flip PPT: fixed header, page numbers, bullets fading in one by one, the same camera move every shot, ending on a centred quote card. Fix: remove page frames, one picture event per shot, adjacent shots with different moves, end on the hero's action; text may be written on an object in the picture.
2. Copying the demo: compositions, characters or assets from bundled demos or samples in the final film.
3. No concrete object: abstract concepts as words and icons only; every shot row names a concrete object and its action.
4. Dead background, empty frame: a large flat background unchanged while only a small centre moves; subject at least half the frame, background changing with content.
5. Real material exists but is drawn in code: full-bleed the real thing.
6. Instant AI look: blue-purple grounds, collage that changes style each shot, code-drawn chibi people and white-shell robots, faces on coins and balls.

(huashu; the film gate cannot catch a slideshow with one forced push per page, front-loaded pacing, page frames, beige small images, or an unclear explanation: check stills against these six and watch at normal speed.)

## 7. Client words that mean "slideshow"

"Too basic: image, then video, then text." "So much space is being wasted." "Some parts linger too long." "It's not elite; go harder." A version with a plain background and "zero desire to watch" was rejected even though nothing was wrong: not moving is not automatically good (motion-video-kit, huashu). Clean, smooth, error-free versions still get rejected for being basic, empty or slow.
