# Mortgage & Amortization Calculator

A local, no-install mortgage calculator covering loan basics, PITI, DTI,
cash-to-close, a full amortization schedule, extra-payment savings, a
down-payment scenario comparison, an affordability estimator, and a
refinance / discount-points break-even tool — and it works as an
installable app on your iPhone.

## Install it on your iPhone (recommended)

1. Open the live page in **Safari** (see "How to run it" below for how to
   host it, or open it directly if you've put it online).
2. Tap the **Share** icon (square with an arrow pointing up) in Safari's
   toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Give it a name (or keep "Mortgage Calc") and tap **Add**.

It now behaves like a real app: its own icon on your home screen, opens
full-screen with no browser address bar, and keeps working **offline** —
once you've opened it once, you can use it in airplane mode. All of your
inputs are automatically remembered between sessions, right on your
phone (nothing is ever sent to a server). A banner with these
instructions also appears automatically the first time you open it in
Safari on an iPhone.

## How to run it

No installation, build step, or internet connection (after first load) is
required.

**Quickest — just open the file:**
Double-click `index.html` (or right-click → Open With → your browser).
This works for using the calculator on a computer, but iOS Safari needs a
real `http(s)://` address (not `file://`) to install it as an app and to
enable offline mode via the service worker.

**To install it on your iPhone, host the folder somewhere Safari can reach it:**

- **Easiest:** upload the `mortgage-calculator` folder to any free static
  host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.) and open
  the resulting URL in Safari on your iPhone, then follow the install
  steps above.
- **On your own network:** from a terminal inside the `mortgage-calculator`
  folder, run:
  ```
  python3 -m http.server 8000
  ```
  then, on your iPhone (same Wi-Fi network), open
  `http://<your-computer's-IP-address>:8000` in Safari.

## What's inside

```
mortgage-calculator/
├── index.html          All page markup — six tabs (described below)
├── manifest.json        App name, icon, and theme for "Add to Home Screen"
├── sw.js                Service worker — caches everything for offline use
├── icons/                App icons (home screen, favicon, etc.)
├── css/
│   └── styles.css      All styling (the "ledger" visual theme)
└── js/
    ├── calculations.js   Core formulas: payment, LTV, PMI, DTI, closing costs
    ├── amortization.js   Month-by-month schedule generator + comparisons
    ├── affordability.js  "How much house can I afford?" solver
    ├── refinance.js       Refinance and discount-points break-even math
    ├── scenarios.js      Down-payment scenario comparison engine
    ├── formatters.js     Currency / percent / date display helpers
    ├── export.js         CSV export of the amortization schedule
    ├── storage.js        Saves/restores all your inputs via localStorage
    ├── ui.js              Renders all results, tables, and charts to the page
    └── main.js            Wires inputs to calculations and re-renders on change
```

Everything recalculates live as you type — there's no "Calculate" button
to press. Your inputs are saved automatically as you go; use **Reset to
defaults** at the bottom of the page to clear everything and start over.

## The six tabs

1. **Calculator** — Enter purchase price, down payment ($ or %), rate,
   term (including a custom term), start date, property tax, insurance,
   HOA, and PMI (auto-estimated or manually overridden). See your loan
   amount, LTV, full monthly PITI breakdown, total interest/total paid,
   payoff date, PMI removal date, front-end/back-end DTI, and a
   cash-to-close breakdown (down payment + closing costs + prepaid
   escrow). Closing costs can be entered as a percent of price or a flat
   dollar amount.

2. **Amortization Schedule** — The full month-by-month (or year-by-year)
   schedule, plus a balance-over-time chart. Toggle between monthly and
   annual views, and export the schedule to CSV (opens directly in Excel,
   Numbers, or Google Sheets).

3. **Extra Payments** — Add a recurring monthly extra payment, any number
   of one-time lump sums on specific dates (use "+ Add one-time payment"
   for as many as you like — e.g. a bonus in March 2028, then another in
   2030), and/or a recurring annual extra payment (e.g. from a tax refund).
   Compare the "with extra payments" schedule against the baseline: time
   saved, interest saved, and new payoff date, with a cumulative-interest
   comparison chart.

4. **Scenario Comparison** — Compare 5% / 10% / 20% down payment presets
   (or any custom set of down payments you add) side-by-side: loan
   amount, LTV, monthly P&I, estimated PMI, full PITI, payoff date, total
   interest, and total paid.

5. **Affordability** — Enter your gross monthly income, other monthly
   debts, target DTI, rate, term, and estimated tax/insurance rates to
   get an estimated maximum home price, corresponding loan amount, down
   payment, and resulting monthly payment breakdown.

6. **Refinance & Points** — Compare your current loan against a new rate/
   term to see monthly savings, lifetime interest difference, and
   break-even point on refinance costs.
   - **Your Original Loan**: the amount, term, and rate you *originally*
     took out. Your current monthly payment is calculated from these and
     stays fixed — it won't change just because you adjust the fields
     below to model a later point in your loan.
   - **Where You Are Now**: your current remaining balance and years
     remaining — update these to model "what if I refinanced N years from
     now" without affecting your current payment above. You can find your
     balance at any future date on the Amortization Schedule tab.
   - **Hypothetical Refinance**: the new rate, term, and closing costs for
     the loan you're considering.
   - **Include my extra payments**: check this box to have the interest
     totals for both loans assume you keep making the same extra payments
     (from the Extra Payments tab) on whichever loan you choose, starting
     this month. Leave it unchecked to compare just the loans' baseline
     fixed payments.

   The Points calculator (below) shows the break-even time for buying
   discount points to lower your rate. A "Use loan amount & rate from
   Calculator tab" button carries values over from the main tab.

## Notes on accuracy

- PMI is auto-estimated at roughly 0.55% of the loan balance per year
  when the down payment is below 20%, and is automatically dropped once
  the loan balance reaches 80% LTV (configurable). You can override the
  PMI amount manually if your lender quotes you a different figure.
- All calculations use standard amortization formulas. This tool is for
  planning and estimation — always confirm final numbers with your
  lender, as actual loan terms, fees, and PMI rates vary.

## Extending this into a full app later

The calculation logic (`calculations.js`, `amortization.js`,
`affordability.js`, `refinance.js`, `scenarios.js`) is plain,
dependency-free JavaScript with no DOM references, so it can be reused
as-is in a future Node/React/mobile version — only `ui.js` and `main.js`
(the DOM-binding layer) would need to be replaced.

