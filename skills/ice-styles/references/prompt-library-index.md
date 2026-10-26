# Community prompt library index (viral Opus 5.5 code-animation prompts)

An index, not a copy. The community library at https://github.com/yihui-dev/awesome-opus5-5-videos (repository MIT, compiled by yihui-dev) collects 703 prompt files (683 unique) from people who asked Claude Opus 5.5 to write animations as code. Every prompt and every video belongs to its creator. This file credits each creator, links to their original post, and names the prompt file (`prompts/<id>.md` in that repository). It never reproduces prompt text.

Contents
1. How to use this index
2. The structural pattern most strong prompts share (an idea, rewritten)
3. Strongest prompts by request type
4. Strongest prompts by industry
5. Gaps and cautions

## 1. How to use this index

- Use an entry to study structure, pacing, constraint lists and engine choices for a request type. Never paste a creator's prompt as a house prompt, never ship it as our template, and never reuse its subject, product or brand.
- When a film is clearly inspired by an entry's approach, credit the creator (handle plus post link) in the project's decision log.
- Many prompts name third-party brands, games, films or artworks. Those names are part of the creator's experiment, never material for a user's film.
- An entry marked (partial) holds only the creator's post text, not a full prompt.
- Counts in the library (estimates): categories motion 352, explainer 116, 3D 115, interactive 100; tech tags canvas 267, svg 183, threejs 131, shader 92, gsap 86, css 57, audio 39.
- A second curated gallery, Prompt Motion (https://prompt-motion.com), shows Opus 5.5 motion videos with links to their prompts or skills, filterable by category (counts read on 2026-10-20: Product UI 102, Kinetic type 98, Music 51, Shapes 44, Particles 43, Charts 33, Diagrams 31, Characters 27, Photos 23, Phone 22, Code 21). The same rules apply: study an entry's approach, credit the creator, never copy a prompt or its subject. Use it during research for current examples of a request type.

## 2. The structural pattern most strong prompts share

Written in our own words from the pattern that recurs across the strongest entries:

1. Inputs: ask the user first for the assets only they can give (product, states or screens, accent colour, a licensed song and its tempo, formats).
2. Direction: the look in testable terms, plus an explicit banned list (for example template looks, dead time, effects that do not serve meaning).
3. Structure: a beat grid with one event per beat or bar, shown to the user before code.
4. Build: every frame a pure function of time (no clocks, timers or state between frames), closed-form springs, sub-frame motion blur, one frame per beat rendered as a contact sheet before the full render.
5. Gotchas: the creator's own failure notes.
6. Start: what to do first.

The ice skills already cover each step (intake in ice-direction, beat grid in ice-audio, determinism in ice-engines, contact sheets in ice-qa). Use the pattern to check a brief is complete, not as a script.

## 3. Strongest prompts by request type

Format: creator (link to original post), prompt file id, one-line summary of the approach.

| Request type | Creator and post | Prompt id | Approach (summary in our words) |
|---|---|---|---|
| Product launch | [@twoclipping](https://x.com/twoclipping/status/2102554209166000267) | twoclipping-000267 | asks for product, promise and UI moments, then a beat-cut launch film with a drop |
| Product launch | [@HowDevelop](https://x.com/HowDevelop/status/2103840883812733090) | howdevelop-733090 | exact 15 s launch with a per-second shot list, a vertical-safe centre, synced sound design, a banned list |
| Product launch | [@AnnaCher___](https://x.com/AnnaCher___/status/2103571096549433425) | annacher-433425 | a promo built from the product's own UI as one morphing shape |
| Product launch | [@techtactician](https://x.com/techtactician/status/2103219463508144474) | techtactician-144474 | SaaS launch using real assets from the product site |
| Product launch | [@jake11moran](https://x.com/jake11moran/status/2103237884564414633) | jake11moran-414633 | teaser matching a product post's UI and copy in one continuous camera |
| App ad | [@redpersongpt](https://x.com/redpersongpt/status/2103807094554284430) | redpersongpt-284430 | long studio-level brief with strategist, copywriter and growth roles |
| App ad | [@Bilimfili1](https://x.com/Bilimfili1/status/2103743617848459762) | bilimfili1-459762 | 45-50 s vertical tour recorded from the real app, not mocked |
| App ad | [@punit_io](https://x.com/punit_io/status/2104468472344584518) | punit-io-584518 | 22 s launch from supplied screenshots, no generated imagery |
| App ad | [@twoclipping](https://x.com/twoclipping/status/2106101258834551116) | twoclipping-551116 | name, short tagline, three-step story, vertical launch |
| Tech explainer | [@AstroTheWizard](https://x.com/AstroTheWizard/status/2103629247751618782) | astrothewizard-618782 | autonomous 60 s explainer end to end |
| Tech explainer | [@ParkerRex](https://x.com/ParkerRex/status/2103206747846701462) | parkerrex-701462 | an algorithm explained on canvas, every frame a pure function of time |
| Tech explainer | [@deedydas](https://x.com/deedydas/status/2104391577091407965) | deedydas-407965 | code-repository explainer format (purpose, map, life of a request) |
| Tech explainer | [@aichrislee](https://x.com/aichrislee/status/2108709764817408244) | aichrislee-408244 | a series template of interactive 3D cutaways of mechanical objects |
| Tech explainer | [@egeberkina](https://x.com/egeberkina/status/2105029713445949521) | egeberkina-949521 | a natural phenomenon explained as an interactive sandbox, not slides |
| Education | [@Gdgtify](https://x.com/Gdgtify/status/2107054188836393073) | gdgtify-393073 | a mathematical proof as kinetic typography machinery |
| Education | [@RetropunkAI](https://x.com/RetropunkAI/status/2103237989065277590) | retropunkai-277590 | a building's history from minimal to complete architecture |
| Education | [@Michaelzsguo](https://x.com/Michaelzsguo/status/2102592355165782312) | michaelzsguo-782312 | a long history told as sand animation with music and SFX |
| Education | [@CurieuxExplorer](https://x.com/CurieuxExplorer/status/2103373314354016717) | curieuxexplorer-016717 | a disease explained from whole body down to one molecule |
| Education | [@RashadMirza404](https://x.com/RashadMirza404/status/2107310721600020971) | rashadmirza404-020971 | a lab technique explained on a single canvas |
| Brand film | [@twoclipping](https://x.com/twoclipping/status/2103835273813496100) | twoclipping-496100 | one-word wordmark, a photo set and a song with drop and breakdown |
| Brand film | [@notdwd](https://x.com/notdwd/status/2103995183255998633) | notdwd-998633 | a brand's five-year vision that teaches one coined word |
| Brand film | [@techhalla](https://x.com/techhalla/status/2103411244468498547) | techhalla-498547 | 20 s kinetic identity bumper in a street-poster direction |
| Brand film | [@heyiamnick](https://x.com/heyiamnick/status/2109174851412119558) | heyiamnick-119558 | looping showreel where one line is promoted through three media |
| Logo animation | [@Mounnna](https://x.com/Mounnna/status/2103802871934497266) | mounnna-497266 | wireframe, then low-poly shards assemble, then icon and typed name |
| Logo animation | [@rossaxbt](https://x.com/rossaxbt/status/2107483570885312793) | rossaxbt-312793 | question to answer to logo, with a hard drop |
| Logo animation | [@twoclipping](https://x.com/twoclipping/status/2104674464868762046) | twoclipping-762046 | question to answer to logo ending on a beat |
| Logo animation | [@op7418](https://x.com/op7418/status/2103724883301814408) | op7418-814408 | a game reward "highlight moment" (chest open, rank up), original IP only |
| Kinetic type | [@Gdgtify](https://x.com/Gdgtify/status/2103458245213929495) | gdgtify-929495 | spoken word where each line changes the frame's architecture |
| Kinetic type | [@Gdgtify](https://x.com/Gdgtify/status/2105669567036989608) | gdgtify-989608 | a historical speech where the sentence changes its own trajectory |
| Kinetic type | [@rossaxbt](https://x.com/rossaxbt/status/2107121188027707651) | rossaxbt-707651 | toggle label, hero word, percentage graph, final card on clear beats |
| Kinetic type | [@doubleunplussed](https://x.com/doubleunplussed/status/2103697580421181894) | doubleunplussed-181894 | a lyric video in the manner of a reference repository |
| Data story | [@GroundControl](https://x.com/GroundControl/status/2103678647777230877) | groundcontrol-230877 | a 3-minute climate data film from real online data |
| Data story | [@verbove](https://x.com/verbove/status/2103483957266268381) | verbove-268381 | a product story with real data in every state, three aspect ratios |
| Data story | [@nummanali](https://x.com/nummanali/status/2103565570310340931) | nummanali-340931 | a year of model progress with capabilities |
| Data story | [@stewchan2](https://x.com/stewchan2/status/2103542568361369810) | stewchan2-369810 | how a web-search ranking mechanism works |
| Music video | [@thewevr](https://x.com/thewevr/status/2106774417732681887) | thewevr-681887 | a full music video for a supplied song, setup inspects the lyrics |
| Music video | [@anjmaxx](https://x.com/anjmaxx/status/2103173729656459455) | anjmaxx-459455 | 20 s story-led music video with two protagonists |
| Music video | [@anabology](https://x.com/anabology/status/2103534482930491441) | anabology-491441 | a full pass on a supplied pop song |
| Music video | [@gandamu_ml](https://x.com/gandamu_ml/status/2102919394775220530) | gandamu-ml-220530 | a demoscene-style piece synced to a tracker file, analysed first |
| Social short | [@AGIOyaZ](https://x.com/AGIOyaZ/status/2103167623303397647) | agioyaz-397647 | 37 s vertical 3D short film with no human figure |
| Social short | [@kloss_xyz](https://x.com/kloss_xyz/status/2103664956482941143) | kloss-xyz-941143 | vertical high-energy edit with motion and sound design |
| Social short | [@byaiden_vu](https://x.com/byaiden_vu/status/2104846080722755862) | byaiden-vu-755862 | 15 s loop: a stick figure inside a battery icon, ink on cream |
| Art style | [@zacxbt](https://x.com/zacxbt/status/2103808699466944604) | zacxbt-944604 | pixel art on vanilla canvas with strict offscreen-buffer rules |
| Art style | [@jrayon](https://x.com/jrayon/status/2102861376184054015) | jrayon-054015 | a fractal visualizer styled as handcrafted paper and cardboard |
| Art style | [@zeezomb](https://x.com/zeezomb/status/2102906701552726206) | zeezomb-726206 | 80 s glass and gold-leaf mosaic film, no libraries or assets |
| Art style | [@itsolelehmann](https://x.com/itsolelehmann/status/2103124033365762215) | itsolelehmann-762215 | seasons passing outside a train window in a symmetrical film look |
| Art style | [@_nikolajankovic](https://x.com/_nikolajankovic/status/2102867033100616097) | nikolajankovic-616097 | hand-drawn stop-motion first-person finance story |
| UI motion | [@twoclipping](https://x.com/twoclipping/status/2103273003555402193) | twoclipping-402193 | the canonical "one shape, never cut" UI motion brief (reposted widely) |
| UI motion | [@flxrnc](https://x.com/flxrnc/status/2108242454105251921) | flxrnc-251921 | the same idea with numbers instead of adjectives |
| UI motion | [@TheGrootDev](https://x.com/TheGrootDev/status/2103516567824966114) | thegrootdev-966114 | a themed variant with a song licence check |
| UI motion | [@BThreeAgency](https://x.com/BThreeAgency/status/2103739079745827092) | bthreeagency-827092 | match a design frame exactly and add only motion |
| 3D and interactive | [@everestchris6](https://x.com/everestchris6/status/2104965415164399895) | everestchris6-399895 | role-based 3D motion brief judged against references |
| 3D and interactive | [@LexnLin](https://x.com/LexnLin/status/2103194052850241739) | lexnlin-241739 | an explorable cinematic 3D world of original architecture |
| 3D and interactive | [@_nieGRAMotny_](https://x.com/_nieGRAMotny_/status/2103128800909197521) | niegramotny-197521 | an original racing game inspired by a 1990s title |
| 3D and interactive | [@theSethian](https://x.com/theSethian/status/2106447666519384517) | thesethian-384517 | one shot, five stops across three decades |
| 3D and interactive | [@rubenssoto_ai](https://x.com/rubenssoto_ai/status/2108512810774802657) | rubenssoto-ai-802657 | a 30 s procedural motorsport pit stop with synthesized audio |
| Patterns worth noting | [@0xKarmi](https://x.com/0xKarmi/status/2108495927988129839) | 0xkarmi-129839 | loop seam check (first frame against last) and yes/no smoke gates before a human looks |
| Patterns worth noting | [@alex_prompter](https://x.com/alex_prompter/status/2103499977632997524) | alex-prompter-997524 | a five-scene business explainer skeleton |
| Patterns worth noting | [@johnsavage_ai](https://x.com/johnsavage_ai/status/2103792769982427263) | johnsavage-ai-427263 | an image used strictly as a style and vibe reference |

## 4. Strongest prompts by industry

| Industry | Entries (creator: prompt id) |
|---|---|
| AI and tech | [@HowDevelop](https://x.com/HowDevelop/status/2103840883812733090): howdevelop-733090; [@AstroTheWizard](https://x.com/AstroTheWizard/status/2103629247751618782): astrothewizard-618782; [@techhalla](https://x.com/techhalla/status/2103411244468498547): techhalla-498547; [@jdverolme](https://x.com/jdverolme/status/2105013143596302685): jdverolme-302685 |
| SaaS and developer tools | [@techtactician](https://x.com/techtactician/status/2103219463508144474): techtactician-144474; [@wani_shola](https://x.com/wani_shola/status/2103769906638459278): wani-shola-459278; [@jhylee95](https://x.com/jhylee95/status/2103604431627452427): jhylee95-452427; [@sachaarbonel](https://x.com/sachaarbonel/status/2103614797501673648): sachaarbonel-673648 |
| Mobile app | [@Bilimfili1](https://x.com/Bilimfili1/status/2103743617848459762): bilimfili1-459762; [@punit_io](https://x.com/punit_io/status/2104468472344584518): punit-io-584518; [@byaiden_vu](https://x.com/byaiden_vu/status/2104846080722755862): byaiden-vu-755862 |
| Delivery and logistics (thin) | [@lisp_mi](https://x.com/lisp_mi/status/2104046743751139812): lisp-mi-139812 (partial); [@konstantinsaifo](https://x.com/konstantinsaifo/status/2106855420237169107): konstantinsaifo-169107 |
| Food and beverage | [@Ror_Fly](https://x.com/Ror_Fly/status/2102853258582880547): ror-fly-880547; [@Sarut0biSasuke](https://x.com/Sarut0biSasuke/status/2103418429248069973): sarut0bisasuke-069973; [@itsolelehmann](https://x.com/itsolelehmann/status/2103124033365762215): itsolelehmann-762215 |
| Fintech and finance | [@dale_vaz](https://x.com/dale_vaz/status/2103290592679879074): dale-vaz-879074; [@riyadbkhsh](https://x.com/riyadbkhsh/status/2106467130963300736): riyadbkhsh-300736; [@_nikolajankovic](https://x.com/_nikolajankovic/status/2102867033100616097): nikolajankovic-616097; [@_Tony_TT_](https://x.com/_Tony_TT_/status/2103227891009872147): tony-tt-872147 (partial) |
| Real estate and architecture | [@aayush4soni](https://x.com/aayush4soni/status/2104181266459644283): aayush4soni-644283 (partial); [@MrKindey](https://x.com/MrKindey/status/2107817784432267498): mrkindey-267498; [@alexalbert__](https://x.com/alexalbert__/status/2102466523164274839): alexalbert-274839; [@RetropunkAI](https://x.com/RetropunkAI/status/2103237989065277590): retropunkai-277590 |
| Health and medical | [@aichrislee](https://x.com/aichrislee/status/2107985027254378670): aichrislee-378670; [@CurieuxExplorer](https://x.com/CurieuxExplorer/status/2103373314354016717): curieuxexplorer-016717; [@RashadMirza404](https://x.com/RashadMirza404/status/2107310721600020971): rashadmirza404-020971 |
| Automotive | [@aichrislee](https://x.com/aichrislee/status/2107260223907922082): aichrislee-922082; [@rubenssoto_ai](https://x.com/rubenssoto_ai/status/2108512810774802657): rubenssoto-ai-802657; [@iamtanzil_](https://x.com/iamtanzil_/status/2103459843831120030): iamtanzil-120030 |
| Consumer electronics | [@aichrislee](https://x.com/aichrislee/status/2108709764817408244): aichrislee-408244; [@irinatoxi](https://x.com/irinatoxi/status/2104212841657962937): irinatoxi-962937 (partial); [@jake11moran](https://x.com/jake11moran/status/2103237884564414633): jake11moran-414633 |
| Fashion, beauty, luxury | [@aichrislee](https://x.com/aichrislee/status/2107622585307476025): aichrislee-476025; [@theparuchh](https://x.com/theparuchh/status/2105009470292013286): theparuchh-013286 |
| Travel and hospitality | [@itsolelehmann](https://x.com/itsolelehmann/status/2103124033365762215): itsolelehmann-762215; [@eigeorguy](https://x.com/eigeorguy/status/2103992442072813651): eigeorguy-813651 (partial); [@heymrzak](https://x.com/heymrzak/status/2103768331782349060): heymrzak-349060 (partial) |
| Space and aerospace | [@aichrislee](https://x.com/aichrislee/status/2108347412636938609): aichrislee-938609; [@Artless101](https://x.com/Artless101/status/2103303449831964679): artless101-964679; [@theSethian](https://x.com/theSethian/status/2106447666519384517): thesethian-384517; [@Gdgtify](https://x.com/Gdgtify/status/2105669567036989608): gdgtify-989608 |
| Nature and climate | [@GroundControl](https://x.com/GroundControl/status/2103678647777230877): groundcontrol-230877; [@egeberkina](https://x.com/egeberkina/status/2105029713445949521): egeberkina-949521; [@apoorvjain25](https://x.com/apoorvjain25/status/2104818940467945542): apoorvjain25-945542 |
| Energy and industry | [@deifosv](https://x.com/deifosv/status/2103197522382786581): deifosv-786581; [@konstantinsaifo](https://x.com/konstantinsaifo/status/2106855420237169107): konstantinsaifo-169107 |
| Music and audio | [@thewevr](https://x.com/thewevr/status/2106774417732681887): thewevr-681887; [@gandamu_ml](https://x.com/gandamu_ml/status/2102919394775220530): gandamu-ml-220530; [@anjmaxx](https://x.com/anjmaxx/status/2103173729656459455): anjmaxx-459455; [@twoclipping](https://x.com/twoclipping/status/2103273003555402193): twoclipping-402193 |
| Gaming | [@0xChuckstock](https://x.com/0xChuckstock/status/2103804606794879327): 0xchuckstock-879327; [@aisongman](https://x.com/aisongman/status/2103763192971461057): aisongman-461057; [@op7418](https://x.com/op7418/status/2103724883301814408): op7418-814408; [@froessell](https://x.com/froessell/status/2103789415323562325): froessell-562325 |
| Education and science | [@Gdgtify](https://x.com/Gdgtify/status/2107054188836393073): gdgtify-393073; [@Michaelzsguo](https://x.com/Michaelzsguo/status/2102592355165782312): michaelzsguo-782312; [@anirockshady](https://x.com/anirockshady/status/2103195903012032809): anirockshady-032809; [@GodsBoy7777](https://x.com/GodsBoy7777/status/2103117450854150194): godsboy7777-150194 |
| News and media | [@gigabit_million](https://x.com/gigabit_million/status/2104068536041959719): gigabit-million-959719; [@kloss_xyz](https://x.com/kloss_xyz/status/2103652674336067876): kloss-xyz-067876 |
| Retail and brand | [@twoclipping](https://x.com/twoclipping/status/2103835273813496100): twoclipping-496100; [@notdwd](https://x.com/notdwd/status/2103995183255998633): notdwd-998633; [@Mounnna](https://x.com/Mounnna/status/2103802871934497266): mounnna-497266; [@iamtanzil_](https://x.com/iamtanzil_/status/2103459843831120030): iamtanzil-120030 |
| Personal brand and showreel | [@heyiamnick](https://x.com/heyiamnick/status/2109174851412119558): heyiamnick-119558; [@reflex_cloud](https://x.com/reflex_cloud/status/2103552840027304046): reflex-cloud-304046; [@chrisjdimarco](https://x.com/chrisjdimarco/status/2103606498928808196): chrisjdimarco-808196; [@lukasersil](https://x.com/lukasersil/status/2103742861971726495): lukasersil-726495 |

## 5. Gaps and cautions

- Thin coverage (under 10 strong prompts each): food, delivery and logistics, real estate, fitness, finance, fashion, travel, energy. Briefs in these industries must be built from the user's brief and ice-direction research, not from this library.
- No Arabic or right-to-left prompts exist in the library (it has some Chinese and German). Arabic work follows the ice-arabic skill.
- Several prompts ask the agent to scrape a product site or "pull online data" without a rights check, or to work fully autonomously with no confirmation. Our rules override them: asset rights per ice-assets, questions per ice-direction.
- Industry and request-type tags are keyword estimates; check an entry by eye before using it as a reference.
- Links point to posts on X and to the repository; media is hosted remotely by the creators and is never downloaded into a project.

Source: yihui-dev/awesome-opus5-5-videos `data/videos.json` and `prompts/` file names (repository MIT; prompts and videos belong to their creators, credited above).
