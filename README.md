## Accounting / House Ledger

Free, static-deployable construction accounting app built with Next.js.

Repository: https://github.com/dearaniket/Accounting.git

```text
   ┌───────────────────────────────────────────────┐
   │                HOUSE LEDGER                   │
   │   Journal  →  Ledgers  →  Analytics  → Reports│
   └───────────────────────────────────────────────┘
		 │
		 ▼
	 journal entries + payments
		 │
		 ▼
	live totals, ledgers, charts, reports
```

```text
Mobile
┌──────────────┐
│   Header     │
│  Summary     │
│  Cards      │
│  Charts     │
│  Bottom Nav │
└──────────────┘

Laptop
┌──────────────────────────────────────────────────────────┐
│ Sidebar │ Header + Actions                               │
│         │ Main workspace with cards, tables, and charts  │
└──────────────────────────────────────────────────────────┘
```

### Features

- Journal-first workflow for construction expense tracking
- Ledgers, reports, analytics, and payment history from the same source data
- Responsive layout for mobile phones and laptops
- Local demo data, dark mode, and browser storage persistence
- Static export ready for free hosting

### Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Recharts
- Vitest

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
```

### Free Deployment

This project is already configured for static deployment and can be hosted for free on GitHub Pages.

1. Push the code to the repository above.
2. Make sure GitHub Pages is enabled in the repo settings with GitHub Actions as the source.
3. Push to `main` to trigger the workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

The build output is written to `out/`, and the workflow adds `out/.nojekyll` so GitHub Pages serves Next.js assets correctly.

### Project Structure

```text
src/
  app/        routes and layouts
  components/ reusable UI and views
  lib/        data, finance, storage, validation
  tests/      unit tests
```

### Notes

- The app already passed `npm run build` in this workspace.
- If you want a different free host, Vercel will also work with the same codebase.
