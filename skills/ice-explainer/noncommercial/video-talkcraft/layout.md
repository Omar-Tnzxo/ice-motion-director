> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Layout Standard: Where, How Big, How to Align (talking-head frames · finalized by the user on 2026-09-05)

The layout budget in `cinematography.md` §4.5 governs **how much to place** (≤3 groups on screen, an empty quadrant, a unique hero); this document governs **where, how big and how to align**.
Origin: on 2026-09-05 the user reviewed a final cut and caught 10 defects, all of them layout: cards touching the edge, color blocks not aligned with titles, framing boxes not enclosing the text,
a standalone sentence too small and tucked in a corner, list items too small with backings of the same color, image groups not centered, inverted spacing (empty in the middle, cramped at the sides), black text pressing into the neighboring column, every chapter card the same black.
The root cause was not that some card was wrong, but that the skill had no "geometry standard".

The methodology is borrowed from the common paradigm of three layout skills (guizang-ppt / guizang-social-card / dashiai-ppt):
**grid snapping · spacing tokens · type scale + minimum readable size · single accent color · same styling within a group · numeric check list · do not rescue with margins, change the layout**.
All numbers below are given for 1920×1080; for vertical 1080×1920 the differences are only in the §1 safe zone and the subtitle band (design-language §5).

## 1. Grid and safe zone
- **Safe margin 96** (action-safe on all four sides), **title margin 160**; **subtitle band protected zone y ≥ 900** (subtitle bottom 100 + text height), subtitles only.
- **12-column grid**: content width 1728 (1920 − 2×96), gutter 32, column width 114.67; column lines `x_i = 96 + i × 146.67` (i = 0…12).
  Element left and right edges **snap to column lines** (tolerance ±4px). Common spans: full width 12 / main column 8 / side column 4 / two columns 6+6 / three columns 4+4+4 / one main two secondary 7+5.
- **Vertical anchors**: center line y=540, third lines y=360 / 720. A single subject sits on the center line; with subtitles the bottom edge of the subject group ≤ 860.
- Implementation: a `debugOverlay` input prop draws the column lines + safe zone + subtitle band (off by default in delivery, review-protocol.md §2).

## 2. Spacing tokens and hierarchy
- Tokens (multiples of 8): **8 / 16 / 24 / 32 / 48 / 64 / 96 / 160**. Do not use arbitrary numbers outside the tokens.
- **Hierarchy iron rule: outer margin ≥ inter-group spacing ≥ intra-group spacing** (96 ≥ 48~64 ≥ 16~32).
  Counterexample: 400px empty between the left-column title and the right-column list, with the list 40px from the right edge of the frame: **inverted spacing** (large inside, small outside), which reads as "two lumps each stuck to an edge".
  The fix is to pull the whole group into the grid columns and center it, **not** to change some margin.
- Elements are ≥ 96 from the frame edge; **< 64 is judged as touching the edge** (P1).
- Adjacent elements within a group are equally spaced, ≥ 24; title to the content below it ≥ 32, chapter-level title to content ≥ 96.

## 3. Alignment
- Elements in the same group **align their left edges to the same column line** (or right-align to the same column line); no element goes its own way.
- **Use the glyph edge as the reference, not the container box**: when a color block / pill / icon is in the same group as text, the color block's left edge = the left edge of the title's first character;
  for elements with inner padding, **compensate the padding in reverse** (negative margin). Counterexample: under the title "Learn only one AI tool", the Codex color block's left edge was indented 60px more than the first character's left edge.
- **Baseline alignment**: icons / numbers / text on the same line align to the baseline; numbers use `tabular-nums`.
- **Annotation geometry is derived from the measured bounding box of the target** (box / circle / underline / arrow / magnifier anchor / framing box):
  `getBoundingClientRect` / `measureText`, with equal 16~24 padding on all four sides, **never by eye**; after implementation sample key frames to check, and a deviation **> 8px means rework**.
  Counterexample: the top-left L of the diagonal corner frame was 80px from the first character, and the bottom-right L pressed below the last character: the frame did not enclose the text.
  Every card with a target anchor has a "placement self-check" section in its `references/cards/<slug>.md`; when choosing a card, copy it into the SHOTBOOK (SKILL.md ④).

## 4. Centering and balance
- **No host present**: the **bounding box** of the subject group is centered horizontally (not the first element centered); vertically on the center line or the upper third line (leaving room for the subtitle band).
  Counterexample: three color blocks as a whole shifted right, a "screenshot + list" group as a whole shifted right: in both cases the bounding box was not centered.
- **Host present** (a digital human or a person in live-action B-roll both count): the subject group goes on the side opposite the host, with the group's bounding-box center at the center of that half of the frame (x = 480 or 1440),
  and never entering the face safe zone (measured with `scripts/face_bbox.py`): the face safe zone takes priority over "centering". The layout for three parallel items with the host present is in §7.1.
- **Two-element groups**: width ratio 1:1 or 2:1 (golden ratio 1.618:1 also works), spacing from the intra-group tokens 32~64, top edges of the two elements aligned, and the group's bounding box centered.
- **Criterion for off-center**: the group bounding box center deviates from the target center by **> 48px** (P1).

## 5. Type scale and readability (supplements design-language §2)
| Tier | Font size | Use |
|---|---|---|
| hero | 96~120 | A single sentence owning a shot, quotes, chapter names |
| title | 64~72 | Shot titles |
| subtitle | 44 | Bottom read-along subtitles (plain styling) |
| body | 40~44 | List items, chips, bullets, in-card body text |
| caption | 28~32 | Image captions, supporting notes |
| micro | 22~24 | Source lines, timestamps |

- **Minimum readable 28** (still readable when the final cut is shrunk to 390px wide for review); **list items / chips / bullets ≥ 40**:
  counterexample: three items "write code / change projects / debug issues" at about 26px, "so small it is as good as absent".
- **A single sentence owning a shot = hero tier + centered + a backing or stroke for readability, but it must not cover a face** (added by the user on 2026-09-05).
  When there is a person in the frame (a digital human **or a person in live-action B-roll**), the text and its backing never enter the face safe zone at any moment (measurement criteria in host-footage.md §3):
  horizontally still centered, vertically moved to the third line away from the face (if the face is in the upper half, use the lower third line y≈720; if in the lower half, use the upper third line y≈360);
  when faces fill the middle band, place it at the center of the half of the frame opposite the host (x = 480 or 1440), and locally darken the base bed in the text area for readability.
  Counterexample: "the new hire who acts on its own" shrunk to a 44px pill stuck in the bottom left corner: the correct answer is hero tier on the upper third line, clear of both faces, not stuck in a corner.
- **Title character count → font size tier** (one line ≤ 14 Chinese characters; if exceeded, split into lines rather than shrinking the type): ≤6 characters 120 / 7~10 characters 96 / two lines each ≤8 characters 84 / two lines with 9~12 characters 72 / three lines 64.
- Two font weights (design-language); hero uses 600, title uses 700, **do not go bold to 800+** (the larger, the lighter).
- On screen hero : body **≥ 2:1**; without contrast there is no hierarchy.

## 6. Collisions and overflow
- **The bounding boxes of any two elements must not intersect**. The only exceptions are three kinds of deliberate layering: annotations over footage, the subtitle band, chips over B-roll.
- **Text block column width ≥ measured width of the longest line + 2×padding**, and text does not spill out of its own column. Counterexample: four lines of black text in the left column ("see the files / live preview…") pressed into the list on the right.
  Order of handling when it does not fit: **first cut words → then split lines → only last shrink the font size**.
- Nothing from the subject goes in the subtitle band (y ≥ 900); subject bottom edge ≤ 860.
- Overflow tiers (borrowed from the social card skill): 1~40px fine-tune; 40~90 tighten locally; 90~160 compress title / body; **> 160 change the layout or cut content**, do not rescue with margins.

## 7. Color and backings
- There is only one accent color (design-language).
- **List / chip / item backings are distinguished with pastel tones**: in a group of 3~6 items each gets its own pastel backing, no repeats within the group, and the text stays ink-colored:
  blue `#E8F0FF` / pink `#FFE9F0` / purple `#EFE9FF` / teal `#E6F7F2` / yellow `#FFF4DC` / gray `#F2F2F5`.
  Counterexample: three white chips of the same color, read as three identical empty boxes.
- **Chapter title cards rotate colors per chapter**: 4 dark-background sets navy `#0f1e3d` / ink green `#10261f` / wine red `#2b1218` / charcoal black `#16161a`,
  or 4 light-background sets (derived from this film's palette), with the number and chapter name in a contrasting color that switches with the background; **every chapter the same black is forbidden**.
- Acts alternate between dark and light backgrounds (design-language §1); the 12 act backdrops are in design-language §1.1 (`template/motion-systems/backdrop.tsx`).

### 7.1 Parallel sentences (how to lay out "three things" with the host present, finalized on 2026-09-05)
When the narration talks about "A, B, C", three parallel things, while the host is still in frame, it is one of the most frequent shots; the "copy the homework" routines of the Douyin talking-head editing scene were read frame by frame and collected into
the seven styles of `parallel-items-with-host` (horizontal row overhead / three horizontal bars gray to color / vertical column on a blurred base / card stack at the top / vertical three-way split / diagonal three-way split / rotating background with big text). Three disciplines:
1. **The host is always present**, with the form changing with the layout (full-body cut-out / small frame / round avatar / blurred into the base with a small frame added); once the person disappears, the talking head becomes a voiced-over PPT.
2. **The three items appear one by one following the narration** (0.6s per item, one entrance per item), not all three fading in together; gray to color / rotating background are two ways of doing the same rhythm.
3. **Labels sit on the images and are large**: at 1080p, card types ≥52, fullscreen split types 72~80, big-text version 168 (960 stage ×2): anything below the item tier is as good as absent (§5).
Geometry follows §4 for host present: the group bounding box is centered relative to the side opposite the host / above the host, card bottom to top of head ≥36@960, no card or label enters the face safe zone, leave ≥40 around the avatar; **one style per shot**.

## 8. Consistency
- Elements in the same group use the same styling class: white-border card / outline card / solid card, **pick one of three, do not mix**; images in the same group share the same ratio and height (cropped uniformly, not scaled individually).
- Three corner radius tiers, one shadow (design-language §4); chips in the same group have the same height and padding.

## 9. Layout finalization process and check list
1. For each shot the SHOTBOOK writes a **layout line**: column span + group bounding box `(x, y, w, h)` + alignment reference (which column line / glyph edge) + each element's type tier.
   Values are read back from the implementation (`getBoundingClientRect`), not by eye.
2. After implementation sample key frames, turn on `debugOverlay` (column lines + safe zone + subtitle band), and check the **nine items** one by one:
   ① touching the edge (distance to frame edge < 64) ② inverted spacing (intra-group spacing > outer margin) ③ left edge not snapped to a column line / not aligned by glyph
   ④ with no host, group bounding box not centered (deviation > 48) ⑤ annotation geometry not enclosing the target (> 8px) ⑥ font size below tier (body 28 / item 40 / standalone sentence hero)
   ⑦ bounding boxes intersecting ⑧ same-colored backings within a group / same-colored chapter cards ⑨ unreadable when shrunk to 390 wide.
3. Any failed item = **P1** (defect grading in review-protocol.md §1.4); fix it, then re-render that segment.
4. Add a line "nine-item layout standard" to the independent review rubric, and give the reviewer a set of key frames with `debugOverlay` turned on.

## References
- guizang-ppt-skill: 12-column grid snapping, left alignment + generous whitespace, single accent, main title : body ≥ 8:1, chapter-level title to content ≥ 9vh, decoration strictly inside the grid and never touching the edge, images in the same group with the same ratio and height, "do not rescue by adding margins".
- guizang-social-card-skill (github.com/op7418/guizang-social-card-skill): spacing tokens 8/12/16/24/32/40/48/64/80/96/160, minimum readable body 28 / caption 20 / cell 24,
  Chinese title character count → font size tiers, check list R1~R9 (overflow / footer collision / minimum font size / density / line count limit / title to content spacing ≥28), overflow tier handling, 360px thumbnail readability test.
- dashiai-ppt: choose the layout role by information relationship (parallel / hierarchy / comparison / process); set the relationship first, then the layout.
- Josef Müller-Brockmann, "Grid Systems in Graphic Design": the grid is a constraint, not decoration.
