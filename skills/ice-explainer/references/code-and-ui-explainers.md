# Code, pull request, product UI and website explainers

Narrated films that explain software. A product promo without a leading voice belongs to `ice-film` (UI walkthrough or product launch types).

## 1. Pull request or code change

- Ingest the real change (title, description, diff, commits, authors) through the user's own tools. If the fetch fails, stop and report; never fabricate PR contents.
- Explain the change, not the diff file by file, and never read the description aloud. Show the behavior in motion (a mechanism beat).
- Archetypes: changelog, feature reveal, fix explainer (symptom, then cause, then fix), refactor walkthrough. Tests and refactors are not presented as product features.
- Lead with what users get, then the code.
- Show 2 to 4 real diff hunks in total, about 4 to 12 lines each; a whole file is unreadable at video scale. Quote code as a literal block; give the caret somewhere to rest; scrolling eases and settles, never snaps.
- A version number is the one fact you must never invent. Numbers that are not stakes move off the script onto a counter.
- Credits close: lead with the people who committed, ordered by commit count; the PR opener alone is not the author.
- Voice: plain, technical, unhurried; no hype.
- Pace and per-frame word budgets: the `ice-audio` skill, `references/voiceover.md` section 3 (use the explainer TTS budget). The whole film stays under about 400 words; the sweet spot is about 155 words or fewer.
- A mechanism diagram sequences at least three effects (entrance, development, settle); it never enters and freezes.
- Keep the caller's repository clean: project files go to the user's chosen output folder, never into the repository being explained.

## 2. Showing an interface inside an explainer

Choose per passage and keep roles clear:

| Need | Use |
|---|---|
| Exact wording or state | Screenshot of the real product |
| A real interaction and its response | Recording (fixed frame rate) |
| A concept with editable states | An authored component rebuilt from the real UI (real layout, labels, colors, fonts, radii, simplified) |

- Show the whole interface for orientation first, then a closer view to read a control. Judge text at delivery size: a sharp capture can be unreadable in a phone inset.
- An interaction needs a target, an action, a visible response, and time to register. A drag needs contact, displacement and the result (or the rejection).
- Product UI fills about 70 to 80 percent of a landscape frame's width when it is the subject.
- Headline over a UI zoom: keep it fully in view (zoom up to about 1.1) or zoom far enough that it leaves the frame (about 1.3 or more); in between it gets cut in half.
- Build order: background, camera, headline, screens, cursor last so it stays on top.
- Cursor: time each click to a spoken word; it arrives a beat before it clicks, moves on gentle curves, presses with a small dip; hover states change. No clicks in the first 0.7 s of a scene.
- Typing at real speed (about 25 characters per second), 0.5 s pause after each result.
- Real-time demos usually play 1.5x to 2x faster; recompute after the real voice exists.
- Chats are real threads: the request appears before its result, earlier messages stay, the thread scrolls.
- A non-chat product shows its UI in two states: the before (the problem), one press of its action, items moving to the after. Never a screenshot slideshow.

## 3. Websites are filmed, not pasted

- Capture the full page at 2x pixel ratio plus, in the same session, the measured boxes of every target you will point at. Flatten fixed and sticky headers, dismiss overlays, scroll first to trigger lazy images, wait for fonts. Pick the first visible match of a selector (hidden duplicates in navigation are a known trap).
- Capture failure is a hard stop: report it; never manufacture a synthetic replacement of a real site.
- Never use browser screen recordings as page footage (unstable frame rate, lazy-load and sticky-header artifacts, no alignment to words). Camera moves happen on the long capture.
- Techniques: scroll, tour, magnify, mark. One technique at a time: scroll, stop, mark or magnify, then scroll again; at most 2 marks per page.
- Scroll at about 10 percent of page height per second, decelerate before the key line, stop it near the viewport center for 1 to 2 s.
- Annotations are pinned to page coordinates, never screen coordinates, and their geometry comes from measured boxes (eyeballing drifts about 30 px; more than 8 px off on a still is rework).
- Source resolution must be at least frame size times the maximum zoom (illustration only: a 1080p frame pushed to 1.15 needs about 2200 px of width).
- Use real captures only for the user's own products or with permission; third-party sites carry terms and cookie banners.

## 4. Terminals and code cards

- Logs come out in bursts, never per character; commands type at human speed; a frozen line holds suspense with nothing blinking.
- Code walks: one continuous line position drives the camera and the highlight band together.
- Real tool and app skins are reproduced exactly; never invent a third-party product's interface for a claim about it.
- Code blocks are full-bleed; when captions are on, keep code above the caption band.

## 5. Truth rules

All of section 5 in `references/research-and-facts.md` applies: real wording, shipped features only, example data that looks like example data, no invented metrics, testimonials or prices.
