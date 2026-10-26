# HyperFrames lint catalog

> Adapted from heygen-com/hyperframes `docs/reference/lint-rules.mdx` and skills (Apache-2.0, (c) 2026 HeyGen, Inc.). Changes: condensed into tables with short fixes; dashes replaced. Codes are stable for the CLI version pinned in `versions.json` (`npm.hyperframes`); when the pinned CLI prints a code not listed here, trust its message.

Severity: E = error (composition is broken or the render will fail; also switches off `check`'s browser audits), W = warning (quality, determinism or maintainability hazard; fails only with `--strict`), I = info. "W/E" depends on context.

Contents: 1 Structure. 2 Contract. 3 Document, CSS, scripts. 4 GSAP. 5 Media and audio. 6 Captions. 7 Fonts and textures. 8 Other. 9 Fix discipline.

## 1. Structure

| Code | Sev | Fix |
|---|---|---|
| `nested_structure_needs_subcomposition` | W/E | Move nested scene structure into its own sub-composition |
| `timeline_element_missing_timing` | W/E | Add `data-start` (and `data-duration` for DOM clips) |
| `caption_track_kind_missing` | W/E | Add `data-track-kind="captions"` on the caption host |
| `multiple_caption_tracks` | W/E | Keep all captions on one track |
| `clip_ends_past_root_duration` | W | Extend the root `data-duration` or shorten the clip |
| `nested_clip_never_visible` | W/E | A nested clip's `data-start` counts from its composition's start; fix the offset |
| `timeline_track_too_dense` | W | More than 3 timed elements on a track; split tracks or group into a sub-composition |

## 2. Contract

| Code | Sev | Fix |
|---|---|---|
| `invalid_composition_variables_declaration` | E | Valid array of `{id, type, label, default}`; enums need options |
| `invalid_variable_values_json` | E | Valid JSON for variable values |
| `unknown_variable_binding` | W | Bind only declared variable ids |
| `unloadable_media_variable_default` | E | Default media must exist locally |
| `deprecated_data_end` | E | Use `data-duration` |
| `deprecated_data_layer` | E | Use `data-track-index` |
| `duplicate_composition_id` | E | Unique ids per composition |
| `invalid_parent_traversal_in_asset_path` | E | Paths from the project root, never `../` |
| `composition_exceeds_inspection_viewport_cap` | W | Inspection viewport cap is 4096 px |
| `composition_file_too_large` | W | Split scenes into sub-compositions |
| `composition_heavy_overlay_count_high` | W | Fewer simultaneous heavy overlays |
| `missing_data_no_timeline` | W | Add `data-no-timeline` to intended stills, else each render polls up to 45 s |
| `negative_z_index` | W | Use non-negative z-index |
| `requestanimationframe_in_composition` | E | Remove rAF; drive from the timeline or `hf-seek` |
| `root_composition_duration_derived` | W | Author the root `data-duration` explicitly |
| `root_composition_missing_duration_source` | E | Add a root `data-duration` (required with infinite CSS/WAAPI or Three.js) |
| `root_composition_missing_html_wrapper` | E | Full HTML document around the root |
| `root_zoom_rescales_a_fixed_canvas` | E | Remove CSS zoom on the root |
| `split_data_attribute_selector` | E | Write the attribute selector in one piece |
| `standalone_composition_wrapped_in_template` | E | Standalone root sits in `<body>` without `<template>` |
| `subcomposition_blanks_before_host` | W | Full-bleed child shorter than its host: match durations or add a ground |
| `subcomposition_root_styled_by_class` | E | Give the root `id="root"` and style by id |
| `template_literal_selector` | E | Hard-code selector strings |
| `timed_element_missing_clip_class` | W | Add `class="clip"` to visible timed divs |

## 3. Document, CSS, scripts

| Code | Sev | Fix |
|---|---|---|
| `host_missing_composition_id` | E | Host slot needs the composition id |
| `css_parse_error` | E | Fix CSS syntax |
| `css_transition_used` | W | CSS transitions run on the browser clock; use timeline tweens |
| `id_override_reduced_specificity` | W | Keep id selectors' specificity |
| `id_requires_css_escape` | E/W | Ids must not start with a digit |
| `invalid_inline_script_syntax` | E | Fix the script |
| `missing_timeline_registry` | E | Register on `window.__timelines` |
| `non_deterministic_code` | E | Remove `Math.random`, `Date.now`, `gsap.utils.random`, `"random(...)"`; use a seeded PRNG |
| `repeated_id_descendant_selector` | E | Do not repeat an id inside a descendant selector |
| `root_dimensions_mismatch` | W | Root size attributes and CSS agree |
| `root_missing_composition_id` | E | Add `data-composition-id` |
| `root_missing_dimensions` | E | Add static `data-width` and `data-height` |
| `runtime_hidden_style_opacity` | E | Do not hide runtime-managed clips with inline opacity |
| `scoped_css_missing_wrapper` | W | Scope component CSS under its wrapper |
| `studio_missing_editable_id` | W | Give editable elements ids |
| `timeline_id_mismatch` | E | Timeline key equals `data-composition-id` |
| `unbalanced_style_tags` | E | Close every `<style>` |
| `unclosed_tag_swallowed_element` | E | Close the tag |
| `visible_markup_comment` | E | Remove comments that render as text |

## 4. GSAP

| Code | Sev | Fix |
|---|---|---|
| `audio_reactive_single_tween_per_group` | W | Sample audio data at 100 to 200 ms intervals, not one tween per group |
| `gsap_animates_clip_element` | E | Animate a child of the `.clip`, not the clip |
| `gsap_callback_dom_measurement` | W | No DOM measurement inside callbacks; precompute |
| `gsap_cold_seek_hidden_fromto_missing_reveal` | E | A hidden `fromTo` target needs an explicit reveal for cold seeks |
| `gsap_css_transform_conflict` | E | Do not combine CSS `translate(-50%,-50%)` with GSAP x/y; use `xPercent`/`yPercent` |
| `gsap_from_opacity_noop` | E | `from` opacity on an element already at that opacity does nothing; use `fromTo` |
| `gsap_fullscreen_overlay_starts_visible` | E | Start full-frame overlays hidden in CSS |
| `gsap_function_value_hazard` | E/W | Function-based values must be deterministic and seek-safe |
| `gsap_group_selector_keyframes` | W | Keyframes on group selectors are fragile; target elements |
| `gsap_infinite_repeat` | E/W | Use the finite repeat formula |
| `gsap_non_transform_motion` | E | `left`, `top`, `width`, `height`, `fontSize`, `letterSpacing`, `roundProps` snap to integer pixels and stutter; use transforms. Reproduce the same visual; never downgrade to a cheaper different effect just to satisfy the linter |
| `gsap_relative_value_second_writer` | E | No relative values when another tween writes the property |
| `gsap_repeat_ceil_overshoot` | W | `floor`, not `ceil`, in the repeat formula |
| `gsap_repeat_floor_unclamped` | W | `repeat: Math.max(0, Math.floor(totalDuration / cycleDuration) - 1)` |
| `gsap_repeat_refresh_relative_value` | E | No relative values with repeat refresh |
| `gsap_repeated_fromto_without_baseline` | W | Add `immediateRender: false` to every `fromTo` except the earliest |
| `gsap_timeline_not_registered` | E | Register the timeline |
| `gsap_timeline_registered_before_async_build` | E | Register only after the build finishes |
| `gsap_timeline_return_used_as_tween` | E | Do not treat a timeline as a tween |
| `gsap_timeline_set_initial_hide` | W | A zero-duration set at 0 does not render at exactly 0; hide in CSS |
| `gsap_undefined_css_variable` | W | Define the variable before tweening it |
| `missing_gsap_plugin` / `missing_gsap_script` | E | Load and register the plugin or GSAP |
| `overlapping_gsap_tweens` | W | Two tweens on one property at once: move one to a parent |
| `svg_drawon_css_dasharray_conflict` | E | Do not set dasharray in CSS when GSAP draws |
| `svg_measure_before_path_d` | E/W | Set path `d` before measuring length |
| `shader_unbounded_cosine_pow` | E/W | Clamp the cosine to [0, 1] before `pow(1 - cosine, exponent)`; a lower-only max is insufficient |

## 5. Media and audio

| Code | Sev | Fix |
|---|---|---|
| `audio_carve_ungrouped_sources` | W | Group voice clips; carve against the group |
| `audio_group_carve_attr` | W | Carve stays on the clip, not the group |
| `audio_group_no_members` | E | Groups need members |
| `audio_group_timing_attrs` | W | Groups carry no timing attributes |
| `audio_volume_double_automation` | W | One volume control: the automation lane |
| `audio_volume_tween_overrides_gain` | W | Remove the GSAP volume tween |
| `base64_media_prohibited` | E | File references, not base64 |
| `color_grading_invalid_json` / `_invalid_structure` / `_non_media` | E | Valid nested grading JSON (`adjust`, `details`, `effects`) on video, img or canvas only; a flat object renders nothing |
| `duplicate_media_discovery_risk` | W | Avoid duplicate media discovery paths |
| `duplicate_media_id` | E | Unique media ids |
| `imperative_media_control` | E | Never `play()`, `pause()` or seek media in code |
| `media_crossorigin_breaks_preview` | E | Remove `crossorigin` (no suppression) |
| `media_missing_data_start` | E | Add `data-start` |
| `media_missing_id` | E | Add an id; otherwise audio goes silent or video freezes |
| `media_missing_src` | E | Add `src` |
| `media_preload_none` | W | Do not set `preload="none"` |
| `media_runtime_src_mutation` | W | Never change `src` at runtime |
| `media_src_kind_mismatch` | E | `src` type matches the element |
| `media_variable_src_no_fallback` | W | Keep a real fallback `src` |
| `nested_media_start_basis_ambiguous` | W | Use local timing or `data-hf-media-start-basis="global"` explicitly |
| `placeholder_media_url` | E | Real local assets, never placeholder services |
| `self_closing_media_tag` | E | `<video ... />` swallows following elements; close the tag |
| `speed_ramp_on_non_media` | W | Rate lanes on media only |
| `video_audio_double_source` | E | One sound source per video |
| `video_missing_muted` | E | Silent footage gets `muted`; sound footage gets `data-has-audio="true"` |
| `video_muted_with_declared_audio` | E | Choose one |
| `video_nested_in_timed_element` | E | Move the video into an untimed wrapper |
| `audio_file_without_element` | W | Reference audio through an element |
| `audio_src_not_found` | E | Fix the path |
| `duplicate_audio_track` | W | Remove the duplicate |
| `hevc_preview_codec` | I | Preview proxies HEVC; render is fine |
| `video_media_start_at_or_past_eof` | W | `data-media-start` inside the source |
| `inaccessible_media_url` | E | Async check: copy media into the project |

## 6. Captions (design rules: the ice-type skill)

| Code | Sev | Fix |
|---|---|---|
| `caption_container_relative_position` | E | `position: absolute` for all caption elements |
| `caption_exit_missing_hard_kill` | E | `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end)` after every exit tween |
| `caption_fittext_scale_mismatch` | W | Fit text and scale agree |
| `caption_overflow_clips_scaled_words` | E | `overflow: visible` |
| `caption_text_overflow_risk` | W | `max-width: 1600px` landscape or `900px` portrait |
| `caption_textshadow_on_group_container` | W | Shadow on words, not the container |
| `caption_transcript_not_inline` | E | Inline `var TRANSCRIPT = [...]` |

## 7. Fonts and textures

| Code | Sev | Fix |
|---|---|---|
| `font_family_without_font_face` | E | Ship the font file with `@font-face` |
| `system_font_will_alias` | W | Distributed renders alias system fonts; ship a file |
| `texture_class_missing_base` / `texture_class_unknown` | W / E | Use known texture classes with their base class |
| `texture_drop_shadow_on_text` | W | Apply `filter: drop-shadow(...)` to the wrapper |
| `texture_text_missing_mask` / `texture_mask_asset_not_found` | W / E | Provide the mask asset |

## 8. Other

`slideshow_invalid` E, `slideshow_unresolved_ref` E, `missing_lottie_script` E, `missing_three_script` E, `linked_clip_orphan` W, `linked_clips_out_of_sync` W, `multiple_root_compositions` E, `blank_root_with_standalone_composition` E, `missing_or_empty_sub_composition` E, `missing_local_asset` E.

## 9. Fix discipline

- Lint and check verify structure, not quality. One variable per edit; re-run after each.
- Fix errors before warnings: any E switches off the browser audits.
- Never silence a finding with an escape hatch or a cheaper effect before confirming with a snapshot that the finding is false.
- A repro packet for an engine bug: repro command with relative paths, expected and actual, exact error, workaround; never paste absolute paths.
