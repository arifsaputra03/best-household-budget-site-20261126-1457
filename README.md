# Hearthhold — Household Budget

[![make.fun](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Live on make.fun](https://img.shields.io/badge/live-make.fun%20bounty-green)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

An entry for the make.fun bounty **[Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457)**.

Hearthhold is a complete, working household budget planner for one fictional family — the Hartleys — built as plain static files. No build step, no framework, no network requests: open `app/index.html` through any static server and it runs, on a desktop or a phone.

## What it does

- **Dashboard** — the month at a glance: income, spending, what's left, savings rate, a budget-health ring with a pace note, a spending-by-category donut, recent activity and the bills still to pay.
- **Transactions** — a real ledger for October and November 2026. Add, edit and delete income and expenses; search notes; filter by type or category; sort four ways. Every total on every page recomputes from the same ledger.
- **Budgets** — one envelope per category with a progress bar, what's left, and over-budget warnings (dining out is already over — the Hartleys know). Limits are editable and saved.
- **Savings goals** — four goals with progress, monthly pace maths and working add-funds controls, including one goal already reached.
- **Bills & calendar** — eight recurring bills with due dates, autopay flags and paid toggles, plus a month calendar dotted with what's due when.
- **Reports** — a six-month income-vs-spending chart, a per-month category breakdown with an October/November switcher, and a "what changed" comparison.

State lives in `localStorage` (seeded with the demo ledger on first run); a reset button in the footer restores the original figures.

## Layout

- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.
- `app/index.html` — the shell: sidebar navigation, month stepper, view outlet.
- `app/data.js` — categories, the seeded ledger, budgets, goals, bills, history.
- `app/store.js` — state, persistence and every money total the site shows.
- `app/charts.js` — hand-rolled SVG donut, health ring and bar charts.
- `app/views.js` — one render function per section.
- `app/main.js` — hash router and all control wiring.
- `app/format.js` — money, date and percent formatting.
- `app/style.css` — the warm paper-and-ink design, responsive down to phones.
- `screenshots/` — four renders of the running site (desktop dashboard, transactions, reports, phone dashboard).
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Run it locally

```sh
node serve.ts            # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the hand-in
```

## License

MIT — see [LICENSE](./LICENSE).
