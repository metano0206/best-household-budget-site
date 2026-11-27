# くらしの台帳 — Our Household, in Balance

[![make.fun competition](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![make.fun rank](https://make.fun/badge/best-household-budget-site-20261126-1457/metano0206/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![make.fun reward](https://make.fun/badge/best-household-budget-site-20261126-1457/metano0206/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

An entry for the make.fun competition
[best-household-budget-site-20261126-1457](https://make.fun/bounty/best-household-budget-site-20261126-1457).

**くらしの台帳** ("the ledger of our life") is a household budget book for a
fictional three-person Japanese family — a couple, both working, with one
child at primary school. It is designed like a well-kept paper ledger:
warm paper, ink, sage and persimmon, ruled lines, serif headings and
tabular figures. お金の流れが見えると、暮らしが整う — "when you can see where
the money goes, life falls into order."

## One source of truth

Every figure on every page is computed from one itemised list of records,
so the pages can never disagree. October 2026, the main month:

- Income **¥570,000** (salaries ¥320,000 + ¥240,000, child allowance ¥10,000)
- Living expenses **¥330,600** across 11 categories, against budgets of ¥360,000
- Savings **¥150,000** — a savings rate of **26.3%**
- Free balance **¥89,400** left over

September 2026 is itemised in full as the comparison month (income
¥560,000, expenses ¥337,000, savings ¥140,000).

## The six pages

- **ホーム (dashboard)** — the month's four headline figures, the
  signature お金の行き先 money-flow chart (income → living expenses /
  savings / free balance), a category donut drawn in hand-rolled SVG,
  budget usage bars, recent records, and 今月の暮らし通信 — a short
  monthly letter whose three paragraphs (what went well, what to watch,
  next month's goal) are generated from the month's own figures.
- **入出金 (transactions)** — add, edit and delete records (with a
  two-step delete), filter by kind and category, search by shop name;
  the summary strip and budget bar update immediately.
- **予算管理 (budgets)** — per-category budgets grouped into fixed and
  variable costs, progress bars with over-budget warnings, editable
  budget amounts, and the itemised list of monthly fixed costs.
- **カレンダー (calendar)** — a month grid with each day's spending
  total and income; selecting a day lists that day's records.
- **月次レポート (report)** — month-over-month comparison cards and a
  category table, the money-flow chart, a seven-month trend chart, and
  findings computed from the data.
- **貯蓄・目標 (goals)** — three savings goals (family trip ¥1,200,000,
  emergency fund ¥1,500,000, education ¥2,000,000) with progress,
  months-to-goal at the current pace, one-click monthly deposits, and a
  form to add new goals.

Records, budget changes and goal deposits persist in the browser's
localStorage; a footer button resets the demo data. The site is eight
static files (about 23 KB gzipped on first load), no framework, no
network request, and works the same on a phone — bottom tab bar and a
floating "＋記録" button included.

## Layout of this repository

- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to
  the output directory and writes `dossier.json` with the vendored
  make.fun library.
- `app/` — the site itself: `data.js` (categories, budgets, the itemised
  books), `store.js` (state, persistence, every total), `format.js`
  (yen and dates), `charts.js` (the SVG donut and trend chart),
  `views.js` (the six pages), `main.js` (the hash router), `style.css`.
- `screenshots/` — four screenshots of the site running (dashboard,
  transactions, report, and the dashboard at a phone size); `shots.json`
  records which view and viewport each was taken at.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
- `serve.ts` — a tiny local server for previewing `app/`.

Run it locally with `node serve.ts`, then open http://localhost:8080.
Hand it in with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
