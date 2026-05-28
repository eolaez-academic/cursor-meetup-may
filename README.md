# Lutong Bahay Planner

Hackathon MVP — Filipino weekly dinner planner for **4 people**, **7 unique dishes**, fridge/pantry photo scan, local stock memory, and low-stock notifications.

## Quick start

```bash
cd hackathon-cursor-meetup-may
npm install
cp .env.example .env   # optional: add EXPO_PUBLIC_OPENAI_API_KEY for real vision
npx expo start
npm test
```

Scan with Expo Go on your phone (same Wi‑Fi).

## Features

- **Scan** fridge / pantry / freezer (camera or gallery)
- **Memory** — AsyncStorage persists inventory, weekly plan, scan history
- **Weekly plan** — 14 Filipino recipes, picks 7 with no repeats
- **Shopping list** — auto-computed missing ingredients
- **Mark cooked** — deducts stock + low-stock push notification
- **Demo mode** — works without API key (sample detected items)

## Secrets

Never commit `.env`. See `AGENTS.md` for agent rules.

## Repo

https://github.com/eolaez-academic/cursor-meetup-may
