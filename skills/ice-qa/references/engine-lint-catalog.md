# Engine lint and check catalog

Codes and flags of the HyperFrames linter and browser check, plus the few engine-specific checks other engines need. Engine choice and authoring rules belong to the ice-engines skill; this file is only what the gates report and how to read it. Sources: hyperframes docs `reference/lint-rules`, `packages/cli`, the hyperframes CLI and core skills (Apache), product-launch-motion (MIT), hyperframes-community-skills (Apache), remotion-to-hyperframes eval (Apache).

## Contents
1. Severity and commands
2. Lint rule codes (E error, W warning, I info)
3. `check` audits, flags and escape hatches
4. Motion sidecar and animation map
5. Other engines

## 1. Severity and commands

- Error: the composition is broken or the render will fail. Warning: a quality, determinism or maintainability hazard; it fails `check` only with `--strict`. Info: read once.
- `check` runs the linter first and skips the browser entirely on a lint error. Do not prepend a separate lint call before `check`.
- Target: 0 errors. Read warnings once, then triage. Final gate: `check` with 0 findings across lint, runtime, layout, motion and contrast; then midpoint snapshots; render the final only when `delivery-checks.md` section 1 allows it (the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops")).
- Two-gate pattern when a full-frame grade overlay exists: `check --no-contrast` with the grade on; contrast with the grade off (a grade overlay made a contrast sampler read 1.06:1 on text that passes). Gate with the grade off, ship with it on (product-launch-motion).
- `doctor --json` always exits 0: gate on its payload (`.ok`), not the exit code.
- Never delete the `.hyperframes` folder wholesale: it holds project history; use the clean command with a dry run first.
- A render that stutters in preview can still render perfectly; a timeline that looks right only in continuous playback can fail when the renderer seeks directly. Check the first frame, a moving state and the end state by seeking.
- Parallel render workers are not bit-identical to each other; for determinism comparisons render with one worker and compare lossless frames, not the encoded MP4.

## 2. Lint rule codes

Structure: `nested_structure_needs_subcomposition` W/E; `timeline_element_missing_timing` W/E; `caption_track_kind_missing` W/E (add `data-track-kind="captions"`); `multiple_caption_tracks` W/E; `clip_ends_past_root_duration` W; `nested_clip_never_visible` W/E (a nested clip's `data-start` counts from the composition's start).

Contract: `invalid_composition_variables_declaration` E; `invalid_variable_values_json` E; `unknown_variable_binding` W; `unloadable_media_variable_default` E; `deprecated_data_end` E; `deprecated_data_layer` E; `duplicate_composition_id` E; `invalid_parent_traversal_in_asset_path` E; `composition_exceeds_inspection_viewport_cap` W (4096 px cap); `composition_file_too_large` W; `composition_heavy_overlay_count_high` W; `missing_data_no_timeline` W (the runtime polls up to 45 s); `negative_z_index` W; `requestanimationframe_in_composition` E; `root_composition_duration_derived` W; `root_composition_missing_duration_source` E; `root_composition_missing_html_wrapper` E; `root_zoom_rescales_a_fixed_canvas` E; `split_data_attribute_selector` E; `standalone_composition_wrapped_in_template` E; `subcomposition_blanks_before_host` W; `subcomposition_root_styled_by_class` E (give the root `id="root"`); `template_literal_selector` E; `timed_element_missing_clip_class` W; `timeline_track_too_dense` W (more than 3 timed elements on a track).

Document, CSS, scripts: `host_missing_composition_id` E; `css_parse_error` E; `css_transition_used` W (runs on the browser clock); `id_override_reduced_specificity` W; `id_requires_css_escape` E/W (id starts with a digit); `invalid_inline_script_syntax` E; `missing_timeline_registry` E; `non_deterministic_code` E (`Math.random`, `Date.now`, `gsap.utils.random`, `"random(...)"`); `repeated_id_descendant_selector` E; `root_dimensions_mismatch` W; `root_missing_composition_id` E; `root_missing_dimensions` E; `runtime_hidden_style_opacity` E; `scoped_css_missing_wrapper` W; `studio_missing_editable_id` W; `timeline_id_mismatch` E; `unbalanced_style_tags` E; `unclosed_tag_swallowed_element` E; `visible_markup_comment` E.

GSAP: `audio_reactive_single_tween_per_group` W (sample audio data at 100-200 ms intervals); `gsap_animates_clip_element` E; `gsap_callback_dom_measurement` W; `gsap_cold_seek_hidden_fromto_missing_reveal` E; `gsap_css_transform_conflict` E; `gsap_from_opacity_noop` E; `gsap_fullscreen_overlay_starts_visible` E; `gsap_function_value_hazard` E/W; `gsap_group_selector_keyframes` W; `gsap_infinite_repeat` E/W; `gsap_non_transform_motion` E (left, top, width, fontSize, letterSpacing, roundProps snap to whole device pixels and stutter); `gsap_relative_value_second_writer` E; `gsap_repeat_ceil_overshoot` W; `gsap_repeat_floor_unclamped` W (`repeat: Math.max(0, Math.floor(totalDuration / cycleDuration) - 1)`); `gsap_repeat_refresh_relative_value` E; `gsap_repeated_fromto_without_baseline` W (add `immediateRender: false` to every `fromTo` except the earliest); `gsap_timeline_not_registered` E; `gsap_timeline_registered_before_async_build` E; `gsap_timeline_return_used_as_tween` E; `gsap_timeline_set_initial_hide` W (a zero-duration set at position 0 does not render while the playhead sits exactly at 0); `gsap_undefined_css_variable` W; `missing_gsap_plugin` E; `missing_gsap_script` E; `overlapping_gsap_tweens` W (treat as error, including butt-joins); `svg_drawon_css_dasharray_conflict` E; `svg_measure_before_path_d` E/W.

Media: `audio_carve_ungrouped_sources` W; `audio_group_carve_attr` W; `audio_group_no_members` E; `audio_group_timing_attrs` W; `audio_volume_double_automation` W; `audio_volume_tween_overrides_gain` W; `base64_media_prohibited` E; `color_grading_invalid_json` E; `color_grading_invalid_structure` E; `color_grading_non_media` E; `duplicate_media_discovery_risk` W (treat as error; give the second copy its own file); `duplicate_media_id` E; `imperative_media_control` E; `media_crossorigin_breaks_preview` E; `media_missing_data_start` E; `media_missing_id` E (the audio goes silent or the video freezes); `media_missing_src` E; `media_preload_none` W; `media_runtime_src_mutation` W; `media_src_kind_mismatch` E; `media_variable_src_no_fallback` W; `nested_media_start_basis_ambiguous` W; `placeholder_media_url` E; `self_closing_media_tag` E (`<video ... />` swallows everything after it); `speed_ramp_on_non_media` W; `video_audio_double_source` E; `video_missing_muted` E; `video_muted_with_declared_audio` E; `video_nested_in_timed_element` E.

Captions: `caption_container_relative_position` E (absolute position for all caption elements); `caption_exit_missing_hard_kill` E (a hard set to hidden after every exit tween); `caption_fittext_scale_mismatch` W; `caption_overflow_clips_scaled_words` E (`overflow: visible`); `caption_text_overflow_risk` W (`max-width: 1600px` landscape, `900px` portrait); `caption_textshadow_on_group_container` W; `caption_transcript_not_inline` E.

Fonts and textures: `font_family_without_font_face` E; `system_font_will_alias` W; `texture_class_missing_base` W; `texture_class_unknown` E; `texture_drop_shadow_on_text` W (put the drop-shadow filter on the wrapper); `texture_text_missing_mask` W.

Other: `slideshow_invalid` E; `slideshow_unresolved_ref` E; `missing_lottie_script` E; `missing_three_script` E; `linked_clip_orphan` W; `linked_clips_out_of_sync` W; `multiple_root_compositions` E; `blank_root_with_standalone_composition` E; `missing_or_empty_sub_composition` E; `missing_local_asset` E; `audio_file_without_element` W; `audio_src_not_found` E; `duplicate_audio_track` W; `texture_mask_asset_not_found` E; `inaccessible_media_url` E (async only); `hevc_preview_codec` I; `video_media_start_at_or_past_eof` W.

## 3. `check` audits, flags and escape hatches

Audits in one browser session and one seek pass: runtime console errors and failed requests; layout (overflow, clipping, held overlaps, occlusion, coordinate-frame drift); `*.motion.json` assertions; WCAG AA contrast.

| Flag | Default and meaning |
|---|---|
| `--samples` | 9 midpoint samples across the duration |
| `--at` | explicit sample times |
| `--at-transitions` | also sample every tween start and end, to catch transient overlaps at seams |
| `--tolerance` | 2 px allowed overflow |
| `--caption-zone` | gate the caption band |
| `--frame-check` | out-of-frame detection |
| `--no-contrast`, `--strict`, `--snapshots` | skip contrast; fail on warnings; save snapshots |

Severity persistence: a single-sample transient is demoted to info; a held `content_overlap` is an error; a held `canvas_overflow` of 5% or more is a warning; text under transparent video: one word 80% hidden, or two neighbouring words each half hidden, is an error; a single glyph (a digit, `$`, `.`) flags at any coverage.

Escape hatches (`data-layout-allow-overflow`, `-overlap`, `-occlusion`, `-caption-zone`, `data-layout-ignore`, `data-layout-bleed="true"` for one intentional crop): not inherited; mark the specific layering participant, never a scene or root wrapper; run a snapshot and confirm before adding one; `overflow: hidden` clips the visual but does not suppress a layout finding. Known false positive: a 1-4 px `text_box_overflow` on caption highlight words; do not chase it.

`check` is not a visual gate: it passes compositions that render nothing (a blank plot raises no error); no acceptance criterion may rest on it alone. "Look at the PNGs before tuning automated warnings: your eye catches what the auditor misses, and the auditor catches what your eye misses."

Snapshots: `snapshot --at t1,t2 --no-end`; `snapshot --zoom "#selector"` makes a real 3x high-density crop (never CSS zoom or a viewport resize). Check the live preview and the decoded render at matching times: canvas and shader defects survive a clean DOM audit. Inspect the opening 30 s and every reported problem time at full resolution; zoom into fine geometry, text and WebGL edges. Treat tiny unstyled content, canvas-sized icons, missing hero elements or timeline-registration timeouts as render-blocking. Frame 0 must not flash unstyled content (prove it with a one-worker draft render).

## 4. Motion sidecar and animation map

- `*.motion.json` assertions: `appearsBy` (opacity >= 0.5 by a time), `before`, `staysInFrame`, `keepsMoving` (default `maxStaticSec` 2 s); a missing selector fails loudly. Report what was authored, measured from the timeline, not the plan's hopes.
- Animation map (`animation-map.mjs` in the HyperFrames skills; Ice does not ship it, so it runs only when the user's project has the HyperFrames skills installed, otherwise these flags are checked by eye on the contact sheet) flags per tween: `degenerate` (zero box), `offscreen`, `invisible` (opacity < 0.01), `paced-fast` (< 0.2 s on x, y, opacity, scale), `paced-slow` (> 2.0 s), `collision`; plus density and dead zones. Review it for multi-scene work.
- `sweep_static`: a composition of 3 s or more with no visible change fails; spread the reveal or keep one meaningful element alive (a caret for code typing); do not bolt on a drift to appease it; mark intended stills with `data-no-timeline`.
- `compare` (up to 16 variants) is a review surface, not a gate.

## 5. Other engines

- Remotion: inspect rendered pixels of a short MP4 at every target aspect ratio, not only Studio playback; render one middle still to validate framing before the full video; shimmer in map or detail plates means the renderer camera is moving, steady softness means an under-sized plate: never approve wavering detail as a preview artifact (remotion skills, ideas rewritten).
- Engine translations (Remotion to HyperFrames): grade against the original by SSIM with matched encoder settings (PNG frames, bt709); thresholds 0.95 / 0.95 / 0.90 per tier; a real regression drops the mean by 0.05 or more; refuse rather than approximate.
- Lottie: verify in the target player at `?frame=N` pins (frame 0, midpoint, op - 1, semantic beats); the final frame must look finished, not like an accidental stop (text-to-lottie). Logo animations end exactly on the verified static vector: capture the static view and the end time with the same tool, viewport and DPR; they must differ by zero pixels (pixel2motion).
- p5 and canvas: verify with canvas hashes, not encoded frames (x264 drifts on looped stills); the same seed must produce identical bytes (hyperframes-community-skills).
- Three.js: declare each camera cut once as a constant and check the last frame before it, `(ceil(cut * fps) - 1) / fps`, and the first after.
