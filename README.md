# Plain Compass

A political compass test built to fix what people keep complaining about in the popular ones.

Static site, no build step, no dependencies, nothing stored. Open `index.html` or serve the folder.

## Try it

```
npm start        # serves on http://localhost:8080
npm test         # checks the question bank and the scoring
```

GitHub Pages: enable Pages on the branch root and it just works.

## What is wrong with existing tests

Read from Reddit threads (r/PoliticalCompass, r/neoliberal, r/NeutralPolitics, r/AskConservatives, r/AskALiberal), the 8values GitHub issue tracker, and factor-analysis and survey-design papers. The same complaints repeat:

| Complaint | Seen in | What this test does |
|---|---|---|
| Vague, reaction-baiting statements | politicalcompass.org, 8values | Concrete statements about real trade-offs, one idea each |
| Loaded wording that makes one side sound greedy or extreme | politicalcompass.org | Each side gets statements written the way its holders would say it |
| Unbalanced keying, so people who tend to agree drift one way | politicalcompass.org (36 right-coded vs 20 left-coded) | Exactly half of every axis, in every length, keyed each way |
| No neutral option | politicalcompass.org | 5-point scale with a real neutral |
| No way to skip | nearly all | Skip removes the item from the score |
| Consensus items nobody disagrees with | 8values | Only items that split people |
| Items scored on the wrong axis or several axes at once | 8values | One axis per item, equal weights, code is public |
| Hidden formula and offsets that put everyone in one corner | politicalcompass.org | No offsets, formula documented in the app |
| "Social" axis mixes state power with cultural values | politicalcompass.org | Separate Authority and Cultural axes |
| Tradition axis is really religion vs science | 8values | Cultural axis covers family, gender, sexuality, religion, monuments, respect for elders |
| Forced binary choices | Pew typology | Agree/disagree with strength, plus neutral and skip |
| One fixed length | all | Quick (24), Standard (48), Full (80) |
| US-specific or dated references | politicalcompass.org, Pew | No named countries, parties or politicians |
| Ideology name presented as fact | 8values family | Three closest positions with distances, described as rough |

The full write-up, with the scoring formula and every statement, is on the "Why this test is different" page in the app.

## Design

Four axes, 20 statements each:

- **Economic**: Left (collective) to Right (market)
- **Authority**: Libertarian to Authoritarian
- **Cultural**: Progressive to Traditional
- **World**: Global to National

Each statement has a tier. Tier 1 statements make up the quick test, tiers 1 and 2 the standard test, all three the full test. Within every axis and every tier the keying is balanced, so every length is balanced.

Answers: strongly disagree (-2) to strongly agree (+2), or skip. An optional "matters a lot to me" flag weights a statement 1.5x.

```
score = sum(direction x answer x weight) / sum(2 x weight) x 100
```

Results show the classic compass (Economic x Authority), all four axes as bars with plain-English bands, the three closest recognisable positions with distances, and a share link that encodes the answers in the URL.

## Public figures and AI estimates

`figures.js` holds 63 editorial placements of well-known people (US presidents and politicians, world leaders, a few thinkers) on the same four axes, each with a one-line reason. Portraits are fetched at view time from the Wikipedia REST API; nothing is hosted here. The results page lets you search and plot up to six of them next to you, and the Public figures page shows the whole set.

"Ask AI" estimates anyone not in the list. It calls the Anthropic Messages API directly from the browser with the visitor's own API key, sends the axis definitions plus ten built-in placements as calibration anchors, and asks for structured JSON (positions, confidence, two-sentence reason). AI estimates are labelled everywhere and are never merged into the built-in list. The key is only stored if the visitor ticks "remember on this device".

## Files

- `questions.js` question bank, axis definitions, test lengths
- `scoring.js` scoring, bands, quadrant, closest positions, share-link encoding
- `figures.js` public figures dataset
- `compare.js` compare view, portraits, gallery page, AI estimate call
- `app.js` UI
- `index.html`, `style.css`
- `test/` node tests that enforce bank balance and scoring behaviour

## Adding or changing statements

Edit `questions.js`. Keep each id stable (share links depend on the order). Run `npm test`; it fails if any axis or tier becomes unbalanced, if a statement is double-barreled, or if it uses a vague threshold word.
