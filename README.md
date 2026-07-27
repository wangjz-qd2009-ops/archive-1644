# ARCHIVE 1644

An interactive detective case about one game debate and five different views.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

Build the production version:

```bash
npm run build
```

## Demo links

- `http://localhost:3000/?demo=mild`
- `http://localhost:3000/?demo=moderate`
- `http://localhost:3000/?demo=severe`
- `http://localhost:3000/?reset=true`
- `http://localhost:3000/?debug=scoring`

## Game flow

Players open the case, save a first view, explore five files, complete the
five-piece case puzzle, save a final view, receive a private result, and unlock
the final reward.

Every classification is accepted and saved. A puzzle piece shows that a file
was explored. It does not grade the player.

## Internal pattern system

The result combines five signals:

1. `exploration`
2. `evidenceChecking`
3. `understandingOthers`
4. `groupDependence`
5. `hostilityTolerance`

One choice cannot create a severe result. A severe pattern requires several
strong signals, repeated group reliance, repeated acceptance of attacks, and
very high confidence across the case.

The user-facing result never shows internal scores. Add `?debug=scoring` during
development to inspect them.

## Local progress

Progress is saved in `localStorage` under `archive-1644-progress-v1`.

## Research documentation

- [Teen user persona](docs/teen-user-persona.md)
- [Course methods and design changes](docs/course-methods-alignment.md)

The persona is a research hypothesis for cognitive walkthroughs, not a claim
about all teenagers. The design notes distinguish expert predictions from
findings that still require contextual inquiry and usability testing.
