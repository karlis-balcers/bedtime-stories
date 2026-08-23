# Moonlit

Bedtime stories that remember.

Moonlit is a parent-controlled, audio-first story product. The product owns the child’s universe; the model only performs the next episode.

This repository is the long-term home of that system. A working web MVP (parent accounts, worlds, director pipeline, book + voice renderers) is running in the Grok app builder.

## What is implemented

- **My World** — persistent universes with characters, places, possessions, canon facts, and unfinished mysteries
- **Three story modes** — one night, a finite series with a planned arc, or a living series that never needs a finale
- **Duration, not word count** — parents ask for 5 / 10 / 15 minutes; we target ~130 spoken words per minute
- **Dice-first creation** — premises, settings, companions, and fears reroll from curated libraries. Lock any field and reroll the rest. LLMs are used to compose, not to invent every noun
- **Canonical script** — stories are structured JSON (scene, speaker, emotion, pause, sfx, choice, wind-down). Book text and audio are different renderings of the same object
- **Director pipeline** — plan the arc, then write the performance, then wind down for bedtime
- **Parent layer** — objectives and a short recap after each night, invisible to the child
- **Interactive choices** — sparse, with a fate-dice option so a child can also just listen

## Architecture

```
bedtime-stories/
├── apps/
│   ├── web/          # React MVP (Grok / TanStack Start today)
│   └── mobile/       # Expo / React Native later
├── packages/
│   ├── story/        # models, primitives, dice, director, renderers
│   ├── api-client/   # generated later from OpenAPI
│   └── auth/         # shared session types later
└── backend/         # Go REST API later — client-independent
```

Clients (web, iOS, Android) all call the same API. Billing is an entitlement behind the backend (`HasPremium`), not Stripe sprinkled through the app. Stripe is web; Apple/Google IAP come later without rewriting story logic.

### Canonical story representation

A chapter is not a blob of prose. It is a performance:

```json
{
  "kind": "dialogue",
  "speaker": "Fox",
  "text": "Hear what?!",
  "emotion": "startled",
  "pauseAfterMs": 400
}
```

- **Book renderer** turns that into reading UI (no `[PAUSE]`, no voice markup).
- **Audio renderer** turns the same beats into TTS with speech tags. Swap the engine without touching the story.

### Story modes

| Mode | Intent | Structure |
| --- | --- | --- |
| Single | One bedtime story | Self-contained |
| Finite series | An N-chapter adventure | Full arc planned before chapter 1 |
| Living series | Keep going with these characters | Each episode resolves; the world continues |

### Duration

```
target_words ≈ duration_minutes × 130
```

| Requested | ~words |
| --- | --- |
| 3 min | 400 |
| 5 min | 650 |
| 10 min | 1,300 |
| 15 min | 1,950 |

The last stretch of every episode is a wind-down: fewer choices, longer sentences, quieter delivery.

## Shared packages

`packages/story` is the TypeScript domain both the current web MVP and a future Go-backed client can share:

- `models.ts` — script beats, worlds, characters, entitlements-shaped types
- `primitives.ts` — curated libraries (settings, premises, archetypes, riddles)
- `dice.ts` — instant rerolls with field locks
- `compose.ts` — director plan + LLM prompt + local fallback composer
- `render-book.ts` / `render-audio.ts` — deterministic renderers

The live web app also persists child profiles, worlds, lore, and episodes per parent account, and calls xAI (Grok) for composition and voice.

## Product principles

1. The universe is data, not a prompt dump of old stories.
2. Canon is deliberate. Casual details do not become permanent truth.
3. Interaction is sparse enough that a child can just listen.
4. Native-quality mobile (lock screen, background audio) is why we will not force a single UI codebase later. Shared logic, separate surfaces.

## Next

- OpenAPI for `POST /v1/stories`, `GET /v1/stories/{id}`, worlds, characters, account, subscription
- Go backend on AWS, with an `EntitlementService`
- Expo app using `packages/story` + the same API
- Adaptive duration from real narration timings
- Selective illustrations from a canonical character appearance
