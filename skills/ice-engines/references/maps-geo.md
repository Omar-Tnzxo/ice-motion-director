# Maps and Cesium

> Ideas from remotion-dev/skills maps (no license file; rewritten in this repo's words) and rules from heygen-com/hyperframes motion-graphics maps (Apache-2.0). Changes: merged, reworded, dashes removed; the source tip to hide provider attribution was dropped (it likely breaks provider terms).

Applies to map shots in any engine (data stories, industry spots, travel, logistics). Map look and restraint (no decorative glows, particles, lens flares or gratuitous bloom on maps) belong with the ice-motion and ice-styles skills; the rules below make maps render correctly.

## 1. Pick one technique per shot

| Technique | Use | Needs |
|---|---|---|
| Static locator image | Fastest, most deterministic; labels as normal elements | Export at the final aspect ratio and at least render resolution |
| SVG or D3 with TopoJSON (vector lane) | Choropleths, outlines, routes drawn as paths | Bundled geodata; zoom by animating the SVG `viewBox` |
| Baked basemap (MapLibre, maplibre-gl pinned in `versions.json`) | Real tiles under animated overlays | Bake the basemap before render; await `map.once('idle')` before every frame |
| Mapbox | Nicer styles, globe, 3D buildings | Account token (paid key) |
| MapTiler | Borders, rivers, labels for explainers | Key that is unrestricted for headless use (domain-locked keys return 403); keep it out of shipped files |
| CesiumJS | Terrain or photoreal city flythroughs | Render through Remotion with ANGLE (Cesium does not draw in standalone headless Playwright); loads JS from a CDN: pin it |

Load only the chosen technique. Keys come from environment variables, never bundled.

## 2. Determinism

- Coordinates are always `[longitude, latitude]`.
- Disable map interactivity, set fade duration 0, `preserveDrawingBuffer: true`; do not call `map.remove()` in cleanup (breaks the render lifecycle).
- Prepare frame 0 fully (sources, layers, camera), wait for idle, then release the render. Per frame: block, update data and paint, wait idle, repaint.
- A moving 2D map camera shimmers in headless capture. Use a fixed map plate: render once at the highest zoom any waypoint needs into an oversized canvas, keep the map camera static, move the canvas and every overlay with CSS translate and scale per frame; pitch and bearing constant. Plate CSS scale never above 1; center the plate on the route extent's midpoint; max canvas side 4096 px (3840x2160 safe for 16:9, about 2700x3840 for 9:16); if the route does not fit, split into two plates with an editorial cut.
- Shimmer means the live camera is moving; steady softness means the plate is undersized or rescaled. Never approve wavering map detail as a preview artifact. Inspect rendered pixels at every target aspect ratio.
- Never use `tl.call` for stateful map updates.

## 3. Geometry and data

- Use Turf for distances, great circles, slicing and positions; never hand-rolled geodesy. Great circles for flight routes; straight LineStrings when the line should look straight on the map.
- Draw lines, markers and labels as GeoJSON map layers, not DOM markers, unless HTML markers are asked for. Labels needing full typography control are projected HTML overlays updated per frame, anchored at the pole of inaccessibility clipped to the story box (never centroids), with manual nudges.
- Vector tiles split features at tile boundaries, so they cannot drive a start-to-end line draw: extract, verify, order and bake to GeoJSON first. Use custom GeoJSON for absent, proposed, historical, disputed, corrected or private data.
- Never clip a border to the visible frame; draw complete multi-segment borders by cumulative length. Braided rivers: route by graph shortest path, not nearest-endpoint chaining. Strip basemap label layers and inner admin borders when they clutter; keep country and disputed borders.
- Omit absent optional layer properties (never pass `filter: undefined`) or fills vanish while halos remain.
- Provider alignment does not prove correctness: check geometry against the editorial source; record the source and effective date of every custom or disputed geography. Data accuracy rules: the ice-assets skill (truth sheet).
- Overpass API is often busy (use a mirror); Natural Earth is too coarse for valleys (use OSM, about 0.3 km vertex spacing; OSM data needs ODbL attribution).

## 4. Cesium flythrough

- Modes: landscape (quantized-mesh terrain plus satellite) for mountains, rivers, coasts; city (photorealistic 3D tiles, globe hidden) for landmarks. Never extruded footprints for cinematic cities. Photorealistic tiles: promo video max 30 s, credits on screen, screen-space error 4 for a hero landmark and 6 to 8 for wide shots.
- Camera path: continuous curvature (3 passes of Chaikin corner cutting; 4 softer, 2 tighter), constant ground speed by arc length (never by vertex index), sparse control points, swerve damped toward the straight chord (0.45), path length at least travel plus twice the look-ahead. Resample at 0.1 km and smooth with a moving average over about 2.8 km for 2 passes; never Douglas-Peucker (it creates corners).
- Heading aims at a real point 1.5 km ahead on the path; constant pitch (about -14 degrees in Cesium terms); bank into turns from the look-ahead bearing change (gain 0.6, max about 7.5 degrees).
- Calm reference: 13 km in 24 s (about 0.54 km/s); 8 s for the same path felt rushed; slow cameras also render faster (tiles stay cached).
- Mechanics: manual render loop calling the viewer render each settle tick; `preserveDrawingBuffer`; gate init and every frame with delayRender (60 to 120 s); settle until tiles are loaded and stable for about 8 ticks (cap about 600); sky atmosphere on; Cesium pitch and roll are inverse to MapLibre's. Render one middle still first, then the full video with ANGLE and concurrency 1.

## 5. Attribution (hard rule)

Keep provider attribution visible in every rendered frame where tiles show: for example "Esri, Maxar, Earthstar Geographics" for Esri imagery, "(c) CARTO, (c) OpenStreetMap" for CARTO, and each provider's required credit for Mapbox, MapTiler and Google tiles. Never hide attribution with CSS.
