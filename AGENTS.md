# Lutong Bahay Planner — Agent Instructions

## Project purpose
Filipino weekly dinner planner (4 servings, no repeat dishes) with fridge/pantry inventory from photos, local memory persistence, and low-stock notifications.

## Hackathon constraints (30 min MVP)
- Ship working Expo mobile app; prefer features that demo in Expo Go.
- Do not add scope beyond: scan → inventory → weekly plan → cook deduct → low-stock alerts.
- Filipino recipes only; 7 unique dinners per week.

## Security — API keys (mandatory)
- **NEVER** commit `.env`, API keys, tokens, or credentials to git.
- **NEVER** hardcode secrets in source files, `app.json`, README, or comments.
- Use `.env.example` with empty placeholders only.
- Read secrets via `process.env.EXPO_PUBLIC_*` only for hackathon demo; document that production must use a **backend proxy** so keys stay server-side.
- If a key is accidentally committed, rotate it immediately and purge from history.
- Add new secret env vars to `.env.example` (no values) and `.gitignore`.

## Memory / persistence
- All household state lives in **AsyncStorage** via `lib/storage.ts`:
  - `inventory` — fridge/pantry stock with thresholds
  - `weeklyPlan` — current Mon–Sun Filipino dinners
  - `scanHistory` — last scan metadata
- Always load → mutate → save through storage helpers; do not duplicate state in components without syncing.

## Code conventions
- TypeScript strict; functional React components.
- Business logic in `lib/` (planner, recipes, vision, notifications).
- UI in `app/` (expo-router file-based routes).
- Match existing naming: `InventoryItem`, `WeeklyPlan`, `FilipinoRecipe`.

## Meal planner rules
- `SERVINGS = 4` always for dinner.
- Exactly 7 recipes per active week; **no duplicate `recipeId`** in the same plan.
- Score recipes by ingredient availability; fill gaps on shopping list.
- On "Mark cooked", deduct ingredients and re-check low stock.

## Vision / scan
- `lib/vision.ts`: use OpenAI vision only when `EXPO_PUBLIC_OPENAI_API_KEY` is set.
- Without key: demo mode returns plausible Filipino pantry items for hackathon demo.
- User must confirm detected items before merging into inventory.

## Notifications
- Use `expo-notifications` for local alerts when quantity ≤ `minThreshold`.
- Request permissions once; handle denial gracefully.

## Tests
- Run `npm test` before pushing; Jest covers `lib/planner`, `lib/recipes`, `lib/vision` (demo mode).
- Add tests in `__tests__/` for new planner or recipe logic.

## Git
- Remote: `https://github.com/eolaez-academic/cursor-meetup-may.git`
- Commit messages: short imperative ("Add weekly meal planner screen").
- Do not push `.env` or `node_modules/`.

## Do not
- Introduce new databases (Supabase/Firebase) in hackathon unless user asks.
- Repeat the same Filipino dish twice in one generated week.
- Log API keys or full image base64 to console in production builds.
