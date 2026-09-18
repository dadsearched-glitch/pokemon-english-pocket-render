# Pocket English — Learning Data Handoff (Year 1–6)
## Learning-data-only update for the latest completed Work build

### 0. Source-of-truth rule

Use the **latest completed Pocket English source produced in Work** as the source of truth.

The graphics and battle upgrade are already substantially complete.  
This task is **not** a redesign of graphics or battle.

**Do not revert, simplify, or replace the current graphics, battle presentation, PIN/access behavior, card systems, save systems, pack systems, or other completed features.**

The scope of this handoff is:

1. audit the existing Year 3 / Year 4 / Year 5 learning data,
2. correct their difficulty progression where needed,
3. add full Year 1 / Year 2 / Year 6 learning levels,
4. make Settings support **Year 1–Year 6** per profile,
5. update/regenerate Molly-only learning audio required by changed/new content,
6. preserve all existing non-learning game systems and user data.

---

# 1. Educational basis and limits

This is a **supplementary English-learning game**, not a replacement for the complete NZ school English curriculum.

The 2026 New Zealand Curriculum English sequence includes oral language, reading, writing, vocabulary, phonics/decoding, morphology, syntax, fluency, text structure, comprehension, and other literacy components. This game currently uses a narrower game loop and should not claim to cover the whole school curriculum.

Official reference points:
- NZC English Phase 1, Years 0–3:
  https://newzealandcurriculum.tahurangi.education.govt.nz/5637288579.p
- NZC English Phase 2, Years 4–6:
  https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---english-phase-2/5637238346.p
- Ministry parent-facing Year 1–6 English pages:
  https://www.education.govt.nz/parents-and-caregivers/schools-year-0-13/parent-portal/

The game should be **aligned in progression and difficulty**, not marketed as a full curriculum.

For English-language learners:
- keep age-appropriate ideas,
- reduce unnecessary language load,
- use Korean support strategically,
- explicitly teach academic vocabulary as levels rise,
- do not equate school year level with English proficiency.

---

# 2. Existing learning loop — preserve

Keep the existing six-stage loop:

**Vocabulary → Listening → Reading → Sentence → Speaking → Review**

Keep the existing reward loop unless the latest build already changed it intentionally.

### Speaking — final decision

For **all Year 1–6**:

**Provided target sentence → listen/read → repeat aloud**

Do NOT add:
- free speaking,
- spontaneous answers,
- open-ended opinion speaking,
- pronunciation scoring,
- invented sentences as a speaking requirement.

Speech recognition may check the provided target sentence, with the existing self-confirm fallback.

---

# 3. Core vocabulary architecture

Every year uses:

- 24 units
- 4 **new Core Words** per unit
- 96 Core Words per year
- 576 unique Core Words across Year 1–6 in this handoff

The 4 Core Words are the explicitly taught / tracked / reviewed vocabulary.

They are **not** the only words the child may encounter.

Recommended incidental / Challenge exposure:

| Level | Core Words / unit | Challenge / Exposure Words | Review Words |
|---|---:|---:|---:|
| Year 1 | 4 | 0–1 | 0–1 |
| Year 2 | 4 | 0–1 | 1 |
| Year 3 | 4 | 0–1 | 1–2 |
| Year 4 | 4 | 1–2 | 1–2 |
| Year 5 | 4 | 2–3 | 1–2 |
| Year 6 | 4 | 2–4 | 1–2 |

Challenge words may appear in stories, examples, and listening but must **not accidentally become Core mastery items**.

The attached `Y1_Y6_CORE_WORDS.csv` and `.json` are the authoritative Core Word map.

---

# 4. Current Year 3 audit

The v4 Year 3 data inspected before this handoff contains:
- 24 units / 96 Core Words,
- short stories roughly 37–55 words,
- target sentences roughly 5–11 words,
- Korean-meaning vocabulary multiple choice,
- direct information plus simple inference.

### Decision

**Keep the current Year 3 Core Word list.**

It is broadly appropriate for an English learner at this level.

Refine only:
- definitions/translations that sound unnatural,
- ambiguous distractors,
- overly long or awkward target sentences,
- reading questions whose answer is not clearly supported,
- accidental difficulty spikes.

Recommended Year 3 story target:
**about 40–60 words**

Recommended target-sentence range:
**about 5–9 words**, with occasional longer natural sentences allowed.

Vocabulary mode:
**English Core Word → Korean meaning multiple choice**

Do not convert Year 3 to English-definition-only questions.

---

# 5. Year 4 audit / bridge decision

Year 4 must remain the bridge between:
**Year 3 daily-life English → Year 5 academic/reasoning English**

Vocabulary question progression:
- Units 1–8: Korean meaning multiple choice
- Units 9–16: easy English definition + optional Korean Hint
- Units 17–24: easy English definition, Korean Hint available on request

Recommended story target:
**about 55–75 words**

Recommended target sentence:
**about 6–9 words**

Reading progression:
- direct information,
- cause/reason,
- nearby inference,
- main idea / simple evidence,
- simple comparison.

---

# 6. Current Year 5 audit and required changes

The older Year 5 design was directionally appropriate but too lexically dense for Tony as an English learner.

Keep Year 5 concepts such as:
- evidence,
- inference,
- perspective,
- reliability/source,
- audience,
- comparison,
- justification,
- academic/subject vocabulary.

But make the ramp smoother.

### Move the hardest old Year 5 Core Words to Year 6

Replace these old Year 5 words:

- precaution → **warning**
- significance → **importance**
- assumption → **theory**
- contradict → **question**
- counterargument → **viewpoint**
- transferable → **apply**

The moved words reappear as Year 6 Core Words where appropriate.

Recommended Year 5 story target:
**about 65–90 words**

Recommended target sentence:
**about 7–11 words**

Vocabulary mode:
**easy English definition multiple choice + optional Korean Hint**

Definitions must be simpler than the target word.

Example:
`clarify` → `make something easier to understand`

Do not define one hard word using several harder words.

---

# 7. Year 6 design

Year 6 extends Year 5 into:
- comparing and contrasting,
- audience and purpose,
- stated and implied evidence,
- digital/media information,
- credibility and bias,
- scientific/subject vocabulary,
- more explicit reasoning and rebuttal,
- reflection and transfer of learning.

Recommended story target:
**about 80–110 words**

Recommended target sentence:
**about 8–12 words**

Vocabulary mode:
**easy English definition multiple choice + optional Korean Hint**

Korean Hint should be available but not shown by default.

Reading questions can include:
- main idea,
- implied evidence,
- author/creator purpose,
- compare/contrast,
- viewpoint,
- justify an answer with text evidence.

Do not make Year 6 adult/secondary-school English.

---

# 8. Year 1–2 design

## Year 1

Goal:
- foundational everyday English,
- concrete nouns/actions,
- simple feelings/needs,
- basic classroom and home language,
- simple sequence and directions.

Vocabulary:
**English word → Korean meaning multiple choice**

Recommended story:
**20–35 words**

Target sentence:
**3–5 words**, occasionally 6 if natural.

Reading:
- who / what / where,
- very simple sequence,
- one obvious reason when supported.

Listening:
- short phrase or simple sentence,
- clear distractors.

## Year 2

Goal:
- expand everyday vocabulary,
- location/description,
- simple cause and effect,
- sequence,
- prediction,
- simple opinions and reasons.

Vocabulary:
**English word → Korean meaning multiple choice**

Recommended story:
**30–45 words**

Target sentence:
**4–7 words**

Reading:
- direct details,
- order of events,
- simple because/so,
- simple prediction from obvious clues.

---

# 9. Authoritative Year 1 Core Words

| Unit | Topic | Core Words |
|---:|---|---|
| 1 | Ready for class | bag, book, pencil, desk |
| 2 | Making friends | hello, friend, play, help |
| 3 | Lunchbox choices | lunch, apple, water, hungry |
| 4 | A change in weather | sun, rain, warm, cold |
| 5 | Finding your way | left, right, stop, road |
| 6 | At the shops | shop, buy, pay, money |
| 7 | A fair playground | wait, give, take, together |
| 8 | Looking after things | keep, put, find, care |
| 9 | Books we choose | story, picture, page, read |
| 10 | Our school garden | plant, leaf, grow, flower |
| 11 | A trip to the beach | sand, sea, shell, swim |
| 12 | Getting around | bus, car, walk, ride |
| 13 | Feelings and needs | happy, sad, angry, tired |
| 14 | Working together | team, ask, answer, work |
| 15 | Making something tasty | cup, spoon, mix, eat |
| 16 | Celebrating together | family, party, song, dance |
| 17 | The world online | screen, tap, adult, close |
| 18 | Noticing the natural world | bird, tree, bug, animal |
| 19 | Changing our waste | bin, paper, bottle, pick |
| 20 | Moving and practising | run, jump, catch, throw |
| 21 | Solving a mystery | look, hide, where, found |
| 22 | Telling our stories | first, next, then, last |
| 23 | An idea worth sharing | think, say, like, want |
| 24 | Looking back and ahead | learn, try, better, proud |

---

# 10. Authoritative Year 2 Core Words

| Unit | Topic | Core Words |
|---:|---|---|
| 1 | Ready for class | pack, bring, begin, carry |
| 2 | Making friends | meet, smile, chat, polite |
| 3 | Lunchbox choices | fruit, sandwich, drink, full |
| 4 | A change in weather | cloud, windy, storm, coat |
| 5 | Finding your way | near, far, beside, between |
| 6 | At the shops | coin, spend, need, sale |
| 7 | A fair playground | fairly, queue, winner, chance |
| 8 | Looking after things | broken, fix, label, shelf |
| 9 | Books we choose | title, author, chapter, favourite |
| 10 | Our school garden | garden, dig, sprout, wet |
| 11 | A trip to the beach | ocean, rock, splash, deep |
| 12 | Getting around | ticket, driver, leave, early |
| 13 | Feelings and needs | excited, scared, sleepy, brave |
| 14 | Working together | group, job, leader, member |
| 15 | Making something tasty | pour, cut, bake, smell |
| 16 | Celebrating together | gift, music, decorate, guest |
| 17 | The world online | device, button, photo, online |
| 18 | Noticing the natural world | insect, nest, bush, river |
| 19 | Changing our waste | cardboard, wrapper, leftover, dispose |
| 20 | Moving and practising | hop, skip, kick, move |
| 21 | Solving a mystery | lost, track, secret, wonder |
| 22 | Telling our stories | before, after, while, soon |
| 23 | An idea worth sharing | because, maybe, should, why |
| 24 | Looking back and ahead | hard, easy, mistake, again |

---

# 11. Authoritative Year 3 Core Words — preserve current list

| Unit | Topic | Core Words |
|---:|---|---|
| 1 | Ready for class | borrow, return, ready, carefully |
| 2 | Making friends | invite, join, lonely, kind |
| 3 | Lunchbox choices | crunchy, fresh, enough, thirsty |
| 4 | A change in weather | drizzle, forecast, shelter, waterproof |
| 5 | Finding your way | corner, opposite, straight, crossing |
| 6 | At the shops | price, change, receipt, choose |
| 7 | A fair playground | fair, turn, agree, rule |
| 8 | Looking after things | tidy, sort, repair, useful |
| 9 | Books we choose | character, setting, clue, ending |
| 10 | Our school garden | seed, soil, shoot, gentle |
| 11 | A trip to the beach | shore, tide, shallow, litter |
| 12 | Getting around | arrive, depart, timetable, passenger |
| 13 | Feelings and needs | worried, calm, rest, explain |
| 14 | Working together | task, partner, plan, check |
| 15 | Making something tasty | measure, stir, mixture, finally |
| 16 | Celebrating together | celebrate, welcome, tradition, belong |
| 17 | The world online | message, private, permission, pause |
| 18 | Noticing the natural world | native, feather, quietly, notice |
| 19 | Changing our waste | reduce, reuse, recycle, rubbish |
| 20 | Moving and practising | balance, stretch, practise, improve |
| 21 | Solving a mystery | missing, search, perhaps, discover |
| 22 | Telling our stories | beginning, middle, suddenly, afterwards |
| 23 | An idea worth sharing | opinion, reason, suggest, listen |
| 24 | Looking back and ahead | remember, confident, challenge, goal |

---

# 12. Authoritative Year 4 Core Words

| Unit | Topic | Core Words |
|---:|---|---|
| 1 | Ready for class | prepare, follow, understand, finish |
| 2 | Making friends | greet, share, friendly, support |
| 3 | Lunchbox choices | healthy, snack, refill, prefer |
| 4 | A change in weather | cloudy, shower, temperature, protect |
| 5 | Finding your way | direction, nearby, across, map |
| 6 | At the shops | cost, total, cheaper, decide |
| 7 | A fair playground | patient, equal, solve, calmly |
| 8 | Looking after things | clean, mend, store, waste |
| 9 | Books we choose | plot, detail, theme, describe |
| 10 | Our school garden | root, stem, growth, sunlight |
| 11 | A trip to the beach | coast, wave, rockpool, pollution |
| 12 | Getting around | journey, station, board, cancel |
| 13 | Feelings and needs | nervous, relaxed, upset, solution |
| 14 | Working together | role, discuss, cooperate, complete |
| 15 | Making something tasty | recipe, slice, boil, taste |
| 16 | Celebrating together | culture, ceremony, special, community |
| 17 | The world online | password, safe, trust, report |
| 18 | Noticing the natural world | environment, forest, creature, survive |
| 19 | Changing our waste | compost, plastic, collect, save |
| 20 | Moving and practising | warm-up, skill, effort, routine |
| 21 | Solving a mystery | unusual, possibility, pattern, result |
| 22 | Telling our stories | event, paragraph, dialogue, connect |
| 23 | An idea worth sharing | idea, example, point, convince |
| 24 | Looking back and ahead | progress, strength, target, future |

---

# 13. Authoritative revised Year 5 Core Words

| Unit | Topic | Core Words |
|---:|---|---|
| 1 | Ready for class | clarify, instruction, organise, responsibility |
| 2 | Making friends | include, considerate, hesitate, encourage |
| 3 | Lunchbox choices | ingredient, portion, balanced, preference |
| 4 | A change in weather | conditions, predict, likely, warning |
| 5 | Finding your way | route, landmark, intersection, destination |
| 6 | At the shops | budget, compare, value, purchase |
| 7 | A fair playground | compromise, resolve, disagreement, respectful |
| 8 | Looking after things | priority, efficient, maintain, reusable |
| 9 | Books we choose | infer, evidence, narrator, motive |
| 10 | Our school garden | observe, germinate, variable, record |
| 11 | A trip to the beach | habitat, marine, fragile, impact |
| 12 | Getting around | delay, alternative, transfer, schedule |
| 13 | Feelings and needs | frustrated, reassure, perspective, strategy |
| 14 | Working together | contribute, coordinate, deadline, feedback |
| 15 | Making something tasty | quantity, method, adjust, consistent |
| 16 | Celebrating together | heritage, custom, diverse, importance |
| 17 | The world online | consent, reliable, source, audience |
| 18 | Noticing the natural world | species, adaptation, conservation, threat |
| 19 | Changing our waste | sustainable, resource, proposal, consequence |
| 20 | Moving and practising | stamina, technique, gradual, achievement |
| 21 | Solving a mystery | theory, investigate, conclude, question |
| 22 | Telling our stories | sequence, tension, resolution, vivid |
| 23 | An idea worth sharing | persuade, justify, viewpoint, benefit |
| 24 | Looking back and ahead | reflect, evaluate, apply, independent |

---

# 14. Authoritative Year 6 Core Words

| Unit | Topic | Core Words |
|---:|---|---|
| 1 | Ready for class | prioritise, requirement, initiative, accountability |
| 2 | Making friends | empathy, inclusion, negotiate, mutual |
| 3 | Lunchbox choices | nutrition, dietary, moderate, substitute |
| 4 | A change in weather | precaution, humidity, severe, probability |
| 5 | Finding your way | navigate, detour, orientation, accessible |
| 6 | At the shops | consumer, discount, quality, expense |
| 7 | A fair playground | fairness, conflict, mediate, outcome |
| 8 | Looking after things | durable, preserve, minimise, lifespan |
| 9 | Books we choose | interpret, symbolism, implication, tone |
| 10 | Our school garden | experiment, hypothesis, factor, data |
| 11 | A trip to the beach | ecosystem, erosion, biodiversity, vulnerable |
| 12 | Getting around | commute, disruption, connection, capacity |
| 13 | Feelings and needs | resilience, regulate, coping, wellbeing |
| 14 | Working together | delegate, collaboration, consensus, accountable |
| 15 | Making something tasty | ratio, texture, process, modify |
| 16 | Celebrating together | significance, identity, representation, influence |
| 17 | The world online | credibility, bias, misinformation, verify |
| 18 | Noticing the natural world | organism, population, interdependence, distribution |
| 19 | Changing our waste | consumption, renewable, footprint, efficiency |
| 20 | Moving and practising | endurance, coordination, recovery, performance |
| 21 | Solving a mystery | assumption, contradict, deduction, plausible |
| 22 | Telling our stories | flashback, foreshadowing, atmosphere, structure |
| 23 | An idea worth sharing | counterargument, claim, rebuttal, reasoning |
| 24 | Looking back and ahead | transferable, self-assess, adapt, ownership |

---

# 15. Cross-year validation

The Core Word map in this handoff contains:

- Year 1: 96 unique Core Words
- Year 2: 96 unique Core Words
- Year 3: 96 unique Core Words
- Year 4: 96 unique Core Words
- Year 5: 96 unique Core Words
- Year 6: 96 unique Core Words

**Total: 576 Core Words, with no exact Core Word duplicated across Years 1–6.**

Related forms may still appear incidentally in stories; that is normal.

Do not silently introduce duplicate Core Words when authoring the full data.

---

# 16. Full unit-data schema

For each of the 144 units, author/validate data equivalent to the current game fields:

- `year`
- `unit`
- `name`
- `place/topic`
- `focus`
- `words`:
  - English Core Word
  - natural Korean meaning
  - student-friendly English definition
- `s`:
  - two target sentences
- `story`
- `r`:
  - two reading questions
  - one correct answer + distractors
- `l`:
  - listening meaning choices
- optional:
  - Challenge / Exposure Words
  - Korean Hint
  - content tags / difficulty metadata

Keep compatibility with the latest build's actual schema; this list is conceptual.

---

# 17. Data authoring rules

For every Core Word:
- Korean meaning must be natural Korean, not machine-literal Korean.
- English definition must be student-friendly.
- The definition must not be harder than the word.
- Avoid definitions that are circular.

For every target sentence:
- use natural spoken English,
- use NZ spelling where relevant,
- make it useful in real life,
- do not create unnatural sentences merely to force all four words in.

For every story:
- coherent mini-text,
- age-appropriate content,
- NZ-life context when natural,
- avoid stereotypes,
- do not require outside knowledge to answer the reading questions.

For every reading question:
- correct answer must be supported by the text,
- distractors must be plausible but clearly wrong,
- do not use trick questions.

For Listening:
- test meaning and whole-sentence listening,
- do not rely only on hearing one isolated target word.

For Sentence:
- continue building a provided sentence,
- no open writing feature is required.

For Speaking:
- repeat provided sentence only.

---

# 18. Six-year difficulty matrix

| Area | Y1 | Y2 | Y3 | Y4 | Y5 | Y6 |
|---|---|---|---|---|---|---|
| Vocab choices | Korean | Korean | Korean | Korean→mixed→English | English + KR hint | English + KR hint |
| Core focus | concrete basics | expanded everyday | daily life + simple inference | bridge | academic/reasoning | evidence/media/complex reasoning |
| Story target | 20–35 | 30–45 | 40–60 | 55–75 | 65–90 | 80–110 |
| Sentence target | 3–5 | 4–7 | 5–9 | 6–9 | 7–11 | 8–12 |
| Reading | literal | literal + simple reason | simple inference | nearby evidence/main idea | stated+implied evidence | compare/viewpoint/purpose |
| Speaking | repeat | repeat | repeat | repeat | repeat | repeat |

These are **game design targets**, not official NZ curriculum word-count rules.

---

# 19. One exemplar style per level

## Year 1 exemplar — Unit 1

Core:
`bag, book, pencil, desk`

Target sentences:
- `My book is in my bag.`
- `Put the pencil on the desk.`

Mini-story style:
“Min has a book and a pencil. The book is in his bag. He puts the pencil on the desk before class.”

Questions:
- Where is the book? → In the bag.
- What does Min put on the desk? → The pencil.

## Year 2 exemplar — Unit 1

Core:
`pack, bring, begin, carry`

Target sentences:
- `I pack my bag before school.`
- `Please bring your book with you.`

Story/questions should add simple sequence and one clear reason.

## Year 3 exemplar — Unit 1

Preserve the current concept:
`borrow, return, ready, carefully`

Keep polite request + responsibility, but simplify any sentence that is unnecessarily long.

## Year 4 exemplar — Unit 1

Core:
`prepare, follow, understand, finish`

Use simple Korean meaning choices at this stage.

Reading can ask:
- What did the child prepare?
- Why did the child ask for help?

## Year 5 exemplar — Unit 1

Core:
`clarify, instruction, organise, responsibility`

Use easy English definitions + optional Korean hints.

Keep reasoning age-appropriate; do not overload the first unit with long abstract prose.

## Year 6 exemplar — Unit 1

Core:
`prioritise, requirement, initiative, accountability`

Use a school/project context.

The reading should make the meanings inferable from context and ask one evidence-based question.

---

# 20. Settings — update to Year 1–6

In the latest completed build:

**Settings → Learning Level**

must offer:
- Year 1
- Year 2
- Year 3
- Year 4
- Year 5
- Year 6

Per profile.

Defaults remain:
- Kai → Year 3
- Tony → Year 4

Changing learning level must preserve progress at all other levels.

Do not erase old Tony Year 5 history.

Allow manual switching to any Year 1–6 level.

After completion:
- Y1 may suggest Y2
- Y2 → Y3
- Y3 → Y4
- Y4 → Y5
- Y5 → Y6
- Y6 → completion/continue review

Do not auto-switch without confirmation.

---

# 21. Save-data migration

Inspect the latest build first.

Preferred behavior:
- separate progress by learning level,
- separate curriculum/data version by level,
- preserve cards / XP / packs / battle / catalogue / profile settings.

When learning data changes:
- preserve completed-unit history where safe,
- preserve progress in other years,
- if an in-progress unit's content changed incompatibly, reset only that partial unit, not the whole profile.

Do not use a single global course-version migration that wipes every level.

---

# 22. Important v4 architecture warning

The old v4 source used profile identity to choose course difficulty (`Kai` vs `Tony`) and used profile identity to choose Korean vs English vocabulary definitions.

The latest Work build may already have fixed this.

If not, minimally refactor learning selection to be based on:
**profile learning level / curriculum year**, not child name.

Do not change visual design while doing this.

---

# 23. Audio update — Molly only

Changing/adding learning data changes audio text.

For Year 1–6 learning content, use **Molly only**.

For every new or changed learning-audio string:
- generate/update **Molly** assets using the build's existing audio pipeline,
- do **not** generate new Mitchell learning-audio files,
- make Molly the fixed/default learning voice,
- update the manifest,
- verify every referenced Molly learning-audio file exists,
- verify no stale manifest entry points to missing learning content.

If the latest build still exposes a Molly/Mitchell learning-voice selector:
- remove or hide the Mitchell choice for learning content,
- keep Molly as the only selectable/active learning voice.

Do not delete legacy Mitchell files unless it is clearly safe and useful; they may remain as unused legacy assets. The important requirement is that new Year 1–6 learning content must not depend on Mitchell audio.

Do not hard-code the old audio-file count; Year 1–6 will naturally require a different total.

Report:
- number of unique learning utterances,
- expected Molly learning-audio files,
- actual Molly learning-audio files found,
- missing files, if any.

---

# 24. Parent-test / QA tools

Update parent-test mode to allow:
- Year 1–6 selection,
- Unit 1–24 selection,
- direct jump to Vocabulary / Listening / Reading / Sentence / Speaking / Review.

Do not remove existing card/battle testing tools.

---

# 25. Required validation

### Static data validation
For all 144 units:
- exactly 4 Core Words,
- 24 units per year,
- 96 Core Words per year,
- no exact duplicate Core Word across Year 1–6,
- every word has Korean meaning,
- every word has English definition,
- every unit has 2 target sentences,
- every unit has a story,
- every unit has reading questions,
- every unit has listening choices,
- every question has exactly one intended correct answer.

### Difficulty sampling
Test at least:
- Unit 1, 8, 16, 24 for every year.

Check progression from Y1 to Y6.

### Functional
For each year:
Vocabulary → Listening → Reading → Sentence → Speaking → Review → reward

### Level switching
Verify:
- Kai default Y3,
- Tony default Y4,
- switch among Y1–Y6,
- return to previous year and resume progress.

### Regression
Verify no change to:
- graphics,
- battle effects,
- cards,
- packs,
- catalogue,
- XP,
- PIN/access,
- backup/restore.

---

# 26. Work deliverables

Before editing:
1. identify the latest build/source,
2. identify the current learning data files,
3. identify how Settings stores level,
4. identify Molly-only audio generation/manifests,
5. give a short data-only implementation plan.

Then implement.

After implementation provide:
1. files changed,
2. final Year 1–6 data counts,
3. Year 3 changes,
4. Year 4 changes,
5. Year 5 changes,
6. new Year 1 / Year 2 / Year 6 summary,
7. Molly-only audio generation report,
8. save migration report,
9. tests actually run,
10. verified failures/unverified items,
11. updated complete source ZIP.

**Do not make unrelated graphics or battle changes.**

Do not deploy unless explicitly requested.

---

# 27. Final intent

The latest completed game should become one continuous supplementary English-learning game:

**Year 1 → Year 2 → Year 3 → Year 4 → Year 5 → Year 6**

with the same polished graphics and battle system already completed, while the learning data itself becomes a coherent six-year progression.
