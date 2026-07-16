# Work Log

## Setup

Accounts: Airtable (free), Make.com (**EU region** — deliberate choice, German
customer data), Vercel, GitHub repo. Toolchain: VS Code + AI-assisted coding.

## Airtable data model

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

## Make.com core scenario

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

## Watchdog & reconciliation

- Scenario **SLA Watchdog** (active, every 15 min): finds
  `New` leads past their tier deadline that were never contacted and never
  alerted, emails the alert, sets `SLA_Alerted` to prevent alert storms.
- Scenario **Reconciliation** (built, on-demand): counts Won leads vs mock
  CRM records, emails the comparison. Kept manual by design — the free plan
  allows 2 active scenarios, so real-time flows got the slots; in production
  this would be a nightly job.
## (cont.) — Frontend foundation

- Initialized Vite + React in the repo root, wired Tailwind v4 via the
  official Vite plugin.
- Created Airtable personal access token with minimal scope
  (`data.records:read/write`, single base only).
- Built first serverless function `api/leads.js`: a thin proxy that reads
  the Leads table and flattens `{id, fields}` into plain objects. The token
  lives in environment variables and never reaches the browser.
- Ran the stack locally with `vercel dev` (frontend + serverless together);
  Vercel project created and linked.
- First UI: live lead list rendering all 13 records with priority badges.

**Security incident (caught):** almost pasted the real Airtable token into
`.env.example` — the file that *does* get committed. Fixed before pushing;
verified GitHub history is clean. Also mistyped `vercel env add <value>`
(the CLI takes the variable *name*, then prompts for the value). Lessons:
secrets only ever live in `.env` / platform env vars, and `git status`
review before every commit is non-negotiable.


## Full frontend & closed loop

Built the complete sales workbench UI:

- **StatsBar** — active leads, hot count, SLA-overdue count, and annual
  pipeline value (sum of monthly rent × 12 across active leads).
- **CallQueue ("next best lead")** — priority-sorted top 5, urgency =
  lead score + a 100-point boost for SLA-overdue new leads, so breaches
  always surface first. One-click "Mark contacted" writes `Status` and
  `Last_Contacted` back via the serverless PATCH endpoint.
- **KanbanBoard (dnd-kit)** — six status columns, drag-and-drop updates
  Airtable. Dragging a card into *Won* triggers the native Airtable
  automation → order created + mock-CRM sync. Three layers of the system
  fire from a single drag.
- **NewLeadModal** — posts directly to the Make webhook and renders the
  returned score/priority/assignment/pricing as a result card. Duplicate
  submissions get a distinct "Duplicate lead" state instead of a silent
  failure.
- All mutations use **optimistic updates with rollback**: UI changes
  first, API follows, state reverts on failure.

### Debugging diary (cont.)

6. **"Webhook unreachable" in the lead form** — `vercel env pull` had
   generated `.env.local` containing only the two Airtable variables, and
   Vite gives `.env.local` precedence over `.env`, so
   `VITE_MAKE_WEBHOOK_URL` silently resolved to `undefined`. Fix: added
   the variable to `.env.local` *and* registered it in Vercel across all
   environments (`vercel env add`, dev/preview/production) so future
   pulls and the production deployment stay consistent. Lesson: know your
   tool's env-file precedence order, and keep the platform the single
   source of truth for env vars.

**End-to-end loop verified:** React form → Make webhook (validate,
dedupe) → Airtable (create, score, assign by postal code) → serverless
proxy → UI refresh, with email notification and duplicate rejection.
The demo is functionally complete. Next: production deployment on
Vercel, final README with the live URL, Loom walkthrough.