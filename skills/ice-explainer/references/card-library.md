# Card and scene library logic

Spine stages 04, 05 and 07. A card is a reusable visual unit with its own internal timing (a name plate, a counter, a highlighter sweep). A scene is a larger reusable composition (a stage, a desk, a board). This file says how to pick, adapt and rotate them. Motion numbers for generic moves are in `ice-motion`; sound levels in `ice-audio`.

Contents
1. Selection
2. Fidelity and reskin
3. Pitfalls and self-checks
4. Card families
5. Shot patterns by visual relation
6. Multi-media layouts
7. Rotation rules
8. Growing the library

## 1. Selection

1. Filter by input type: host, footage, image, screenshot, text only, live UI, invented scene.
2. Then filter by the sentence's tag (`references/semantic-tagging.md`). A card is listed only under the tags it was built for.
3. Pick from the candidates; write the choice and any deviation reason into the segment.

## 2. Fidelity and reskin

- Use the real card source, not a hand-written lookalike from reading its description.
- Reskin freely: colors, fonts, radius, stroke, shadow, material, chart axes, placeholder content.
- Never change on reskin: timing, easing, geometry ratios, layering order.
- Semantic colors keep their hue (marker yellow, up and down colors, warning red); only saturation follows the style.
- Cards that show a real product interface (a chat app, a terminal, a social profile) reproduce that product's real look exactly; the look is the content.
- Do not encode mood into motion style (slower easing for culture topics, bounce for entertainment). Energy level changes only entrance force and density.
- A complete token set per film; never pick colors per scene (`ice-direction`).

## 3. Pitfalls and self-checks

Each card carries its known pitfalls and placement checks. Copy them into the segment's self-check column in the storyboard. Unread pitfalls equal no pitfalls. Each card also lists its sound cues (2 to 6 per card); copy them with absolute times. Looping cards stay silent; name plates and pure transitions get one very light cue or none.

## 4. Card families

Key rules per family, written to be engine-neutral.

| Family | Rules |
|---|---|
| Name plate | Bar expands, name reveals by clip, role follows; exit reverses; one line of about 12 characters; sits above the caption band |
| Chapter card | Full-frame color block lands in about 0.3 s, a large number (about 40 percent of frame height) lands, name reveals about 0.18 s later; hold about 1.2 s; total 2.5 s or less. Each chapter card gets its own ground color and a motif tied to its content; never the same card four times |
| Quote card | Opaque plate, up to 5 lines appearing line by line, source visible, quiet exit |
| Number counter | Eases out and settles; units appear after the number settles; under two digits pops instead of rolling; tabular digits always |
| Number slab | Color block lands first, then the number; decimals and units after; caption outside the block |
| Metric with sparkline | Number and line start together; arrow and unit only after counting ends |
| Bar chart | Bars grow one by one with scale on one axis, never by animating height; axis never rescales mid-animation; labels follow bars; highlight only the top or the point bar; conclusion chip only after the last bar |
| Line chart story | History draws first; new parts grow from the turning point; alternative futures branch from the same point as dashes |
| Unit grid (proportion) | A 10 by 10 grid of exactly 100 cells, colored in reading order in sync with a counter; never random coloring |
| Keyword pop | Delayed after the sentence appears, scales from the word's baseline, one word per sentence, at most about 3 per film |
| Term card | Plain-word meaning first, term second; holds long enough to read |
| Highlighter sweep | Translucent multiply color with irregular ends, slower than 0.3 s, covers a whole meaningful phrase, dims the rest |
| Hand-drawn ellipse | Never perfectly closed, wider padding than tall, centered on the glyph box; the phrase emphasizes only after the circle completes |
| Ink underline | Variable width like pen pressure, baseline from font metrics, no line boil |
| Converging arrows | Two curved arrows with opposite bow arrive within 0.2 s of each other; tips stop short of the text; the word recolors after arrival |
| Callout | Dot, then a line at 45 degrees or horizontal, then the label from the line end into empty space |
| Magnifier | The zoomed copy is mathematically aligned to its target; lens beside the target with a connector; rest dimmed |
| Focus spotlight | Target unchanged, the rest dimmed to about 0.55, focus jumps in about 0.2 s, restored after; captions above the dim layer |
| Crash zoom | 1 s still, then 6 frames or fewer to about 2.3x on a text block, overshoot then lock; at most twice per film |
| Reticle lock | Corners fly in, overshoot, bite; one target per shot; dead still after |
| Strike and replace | New value takes the exact slot, width reserved for the longer value; strike grows left to right as a child of the old value |
| Evidence scroll | The page is the only moving element; annotations ride with it; decelerate into stops; page at least two screens tall |
| Media pop-in | White border, slight tilt, 10 to 20 percent corner overlap, entrance under 0.4 s; stack instead of rotating through |
| News desk | Tilt 1 to 2 degrees, very slow push (4 s or longer, 1.08 or less), underline synced to reading |
| Filmstrip conveyor | About 176 px/s (never over 220), enlarge near center, slow to about 0.25x and stop about 1.4 s on the key item, never a hard stop |
| Gallery wall | Per-stop target solved to frame center, about 1.0 s move plus 0.9 s stop, return to the wide at the end |
| Cursor actor | Oversized pointer, arcing path with separate x and y easing, immediate UI response, hover off after use |
| Terminal log | Output in bursts, never per character; commands typed at human speed; a frozen line for suspense with nothing blinking |
| Code walk | One continuous line position drives both camera and highlight band; dimming by distance; dwell per line |
| Schematic companion | For text-only shots: outline line art drawn to the line's meaning (section 6 of `references/minimal-motion.md`) |
| Framed footage | One frame style per film; footage inside untouched (no filter, zoom or fade); frame decoration draws in within about 1.35 s then stays; never fake a video player (no progress bar, play button, timecode) |
| Call to action | Given link or offer only; held long enough to read |

## 5. Shot patterns by visual relation

Identify which relation the sentence expresses, then pick a pattern. Topic-agnostic.

| Relation | Pattern |
|---|---|
| A subject and its traits | Subject large, traits as labels arriving one per phrase |
| Analogy | The familiar object performing the concept's behavior |
| Hero reveal | Cleared stage, single reveal on the beat, hold |
| Source or history | A node with date and source card |
| Ordered process | Stations on one stage, a traveling marker |
| Three-way trade-off | Triangle or three columns, one highlighted at a time |
| Neighbors or similarity | Point cloud, nearest items lighting |
| Layers | Stacked skewed planes, 2 to 3 layers |
| Container and access | Box with a door or gate, item passing |
| Merge | Sources traveling on curves into one result |
| Filter or funnel | Many in, few out, rejects visibly leaving |
| Discovery on a curve | Curve drawing, the turning point marked |
| Request, process, response | Three zones, a token traveling, citations attached |
| Two lists | Columns building in parallel rhythm |
| Balance | Scale tipping with each argument |
| Network | Nodes and edges, one path lit |
| Loop | Cycle with a marker going around |
| Magnitude | Repetition grid or size comparison against a known object |
| Callback | The opening's token returning changed |
| Timeline | 2 to 3 dates, one sentence each |
| Formula | Full formula faint, terms lit one by one |
| Table | Rows as evidence, one row promoted |
| "Many" | Orderly matrix of small squares lit on beats; never scattered icons |
| Look-alike mechanisms | Build each real mechanism so the difference is visible, not claimed |

## 6. Multi-media layouts

When several images or clips share a segment: main plus two supports, triptych, compare slider (identical composition required), rack-focus pair, gallery wall, timeline strip, conveyor (5 or more items), grid to hero, stack fan-out, 60/40 split. Entrances stagger 80 to 150 ms in one direction. Shift focus by dimming the others (brightness 0.55 to 0.6, scale 0.985), switch in 0.4 s, at least 1.5 s between switches. To point at something inside a clip, freeze a still first and annotate the still; one time manipulation per shot.

Single footage or image presentation styles: full bleed (plus host badge when a host exists), framed plus text, 60/40 split, blurred same-source bed, frozen frame with pointing, multi-media arrangement, brief media takeover. Adjacent segments use different styles.

## 7. Rotation rules

- The same card not in 3 consecutive segments, and not over one third of a film of 6 or more segments.
- Container type or host form changes at least every 3 segments; films of 8 or more segments use at least three container types.
- The same footage file not in adjacent segments and at most twice per film.
- The same reveal sequence at most 3 times in a row; the same page type (title plus support plus label) at most 3 times in a row.
- Static-card or side-by-side layouts at most one third of beats.
- Rotation means changing composition, not adding motion.

## 8. Growing the library

Bundled cards, scenes and demos are references, never defaults. After each film, record each problem as: what happened, root cause, fix, how it was verified, and where the lesson belongs (card pitfall, grammar rule, QA check). Recurring pitfalls become pre-flight checks. Template bugs found in a film are fixed in the template, not only in the copy.
