# Work Log

## Day 0 — Setup (Jul 15)

Accounts: Airtable (free), Make.com (**EU region** — deliberate choice, German
customer data), Vercel, GitHub repo. Toolchain: VS Code + AI-assisted coding.

## Day 1 — Airtable data model (Jul 16)

Built base `Enpal Sales demo` with 4 tables: `Leads` (14 input fields + 6
formula fields), `Orders` (status machine ending at `OnePlus_Activated`),
`External_CRM_Mock`, `Failed_Intake`. Native Airtable automation: Won →
create Order + sync to mock CRM. Seeded 12 demo leads via CSV paste.

Formula design notes:
- Lead scoring rewards high consumption, battery & heat-pump interest, south
  orientation, and organic sources — a proxy for deal size and LTV.
- SLA status is tiered: 15 min for hot leads, 2 h otherwise. `NOW()` in
  Airtable refreshes lazily, so the *visible* status is informational; actual
  alerting is owned by the Make watchdog.
- Postal codes are TEXT, not numbers — German PLZ have leading zeros.

Schema hygiene lesson: caught and fixed two typos (`Emali` → `Email`,
`Faild_Intake` → `Failed_Intake`) before they poisoned every downstream
mapping. Clean inputs start at field naming.

## Day 2 — Make.com core scenario (Jul 16)

Scenario **Lead Intake** (active): webhook → filter (email contains @) →
search by email → router:
- *Duplicate*: annotate `Call_Notes`, respond `{"status":"duplicate"}`
- *New lead*: create record (postal-code routing via
  `switch(substring(plz;0;1); …)`), re-fetch record (formula fields are not
  returned on create!), Gmail notification, respond with score/priority/
  assignment/pricing JSON
- *Error route* (Ignore): raw payload → `Failed_Intake`, email alert,
  respond 500. Bad data cannot crash the intake and never fails silently.

### Debugging diary (all hit live, all fixed)

1. **`Function 'startsWith' not found`** — Make has its own function set;
   JS instincts don't transfer. Fix: `substring` + `switch`.
2. **`Invalid date in parameter`** — leftover whitespace in an empty date
   field. An empty string is not "no value"; it's an invalid date. Fix:
   truly empty fields are simply not sent.
3. **`[422] Insufficient permissions to create new select option`** — the
   computed value didn't match the select whitelist (quote artifacts +
   Munich vs München). Fix: aligned option names across table and formulas.
   Silver lining: single-select + a token without schema rights = a natural
   data-quality firewall.
4. **Formula stored as plain text** — Make only parses pasted expressions
   wrapped in `{{ }}`; naked text goes in literally. Verified by checking
   that functions render as structured tokens and `plz` as a mapped pill.
5. **Copied a placeholder URL into curl** — `Not found`. Read before paste.

## Day 3 — Watchdog & reconciliation (Jul 17)

- Scenario **SLA Watchdog** (active, every 15 min): finds
  `New` leads past their tier deadline that were never contacted and never
  alerted, emails the alert, sets `SLA_Alerted` to prevent alert storms.
- Scenario **Reconciliation** (built, on-demand): counts Won leads vs mock
  CRM records, emails the comparison. Kept manual by design — the free plan
  allows 2 active scenarios, so real-time flows got the slots; in production
  this would be a nightly job.

Next: React frontend (call queue, kanban, intake form) + Vercel serverless
proxy + deployment.