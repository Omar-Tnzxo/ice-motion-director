> Sources: ideas from imMamdouhaboammar/motion-graphics-skills and commercial-motion-design (rewritten); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) verification steps (translated); Omar-Tnzxo video-production-studio QA and delivery (founder's own); Vincentwei1021/mg-styles-15 (MIT) fallback-font check. Changes: merged into one checklist for `ice-qa`, dash characters removed.

# Arabic QA checks (run through ice-qa)

Geometry is measured; taste is reviewed. Trust a measured check only after you have seen it fail on a reintroduced defect in a scratch copy. "No findings" means nothing unless you also report how much was measured (assert hero words are present, not only unclipped).

## 1. Hard failures (block delivery regardless of overall quality)

- Letters disconnected unexpectedly, or a word split into isolated forms.
- Fallback font or tofu anywhere.
- Punctuation reversed; Latin names or numbers reordered.
- A read letter, dot, hamza, diacritic or descender clipped; a crop that removes meaning.
- Mixed digit systems, or digits not matching the profile.
- Kashida outside a valid point, on numbers, Latin or sacred text.
- Sacred text not verbatim from a verified source, or animated beyond a calm reveal.
- On-screen words not in the approved script; invented words in captions.
- Weights collapsed into one voice; Arabic too small at phone scale.
- Arabic text in a platform no-text zone.

## 2. Measured checks

| Check | Method |
|---|---|
| Clip audit | Sample every 0.1 s; measure each visible text run against the frame and every clipping ancestor; report cuts lasting 0.5 s or more; skip text fully hidden in a mask; skip declared intentional crops; optional near-edge warning (48 px). Polygon clips and sibling occlusion need full-resolution stills |
| Waiting-word leak | At the frame before each masked reveal, confirm no pixels of the waiting word are visible |
| Font gate | `references/fonts-and-shaping.md` section 6, per script |
| Digits | Scan every rendered string for digit code points; one system only, matching the profile |
| Bidi | For each line with a Latin run or number, compare rendered order to the script |
| Kashida | Run the point finder on every stretched word (`references/kashida.md`) |
| Caption word count | Corrected sentences keep the ASR word count; every caption word exists in the approved script |
| Sync | Re-transcribe the delivered file; 0.1 s (word highlight) or about 0.15 s (sentence cards) |
| Safe zones | Two-color render diff, text pixels in no-text zones, first caption within 0.5 s |
| Holds | Every word at least 0.6 s; important standalone lines 0.9 s in display-led types |
| Cover | Sizes from `references/covers-and-thumbnails.md`; preview at real phone size |

## 3. Review by eye (never from a contact sheet alone)

- Watch the animated states: shaping during reveals, dots during masks, punctuation direction, isolation, vertical crops during rises, partial joined forms exposed by word reveals.
- Phone gate: muted at phone size; Arabic must parse at a glance; reduce rather than add when unclear.
- Take stills from the delivered MP4, not the composition. Full-resolution stills decide what contact sheets only flag.
- Dialect sign-off recorded from the native reader (the user by default (or a person the user names): the Arabic script is shown for sign-off with the preview approval in auto mode, or on the 03 review card in step mode; when neither happens, the delivery note lists the sign-off as open); doubtful words and removed lines listed.
- Report honestly: what was checked by eye, by numbers, what could not be checked, which words were corrected with doubt, which tools were substituted.
