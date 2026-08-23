# Moonlit web

TanStack Start app for parent accounts, child universes, the story director, and listen/read players.

## Run

```bash
cd apps/web
npm install
npm run dev
```

The app listens on `0.0.0.0:8080`.

Set `XAI_API_KEY` for Grok composition and voice. Without it, the director falls back to the local composer so you can still create and play stories.

Auth and Postgres (or PGLite in preview) are required for saved worlds.

## Layout

- `src/routes` — landing, login, library, new story, world, listen, read, parent recap
- `src/lib/bedtime` — models, primitives, dice, director, xAI, persistence
- `src/components` — dice controls, story player
- `migrations` — auth + worlds/episodes/lore schema
