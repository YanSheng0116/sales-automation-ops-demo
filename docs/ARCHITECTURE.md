# Architecture & Design Decisions

## System overview


## Key decisions

**Writes go through Make.com, reads through serverless functions.**
A new lead is an *event* that triggers an automation chain (validation,
dedupe, scoring, assignment, alerting) — that is what Make is for. Reads and
simple status updates don't need orchestration; a thin serverless proxy keeps
the Airtable token out of the browser. This split is what "blending low-code
platforms with custom scripts" looks like in practice.

**Business logic lives in Airtable formula fields, not in Make.**
Scoring, pricing and SLA rules are computed by the database itself. Benefits:
one source of truth, instant recalculation, and ops people can read the rules
without opening a single scenario.

**Single-select fields as a data quality firewall.**
The Airtable token has no schema permissions, so any value outside the
whitelist is rejected with a 422 — malformed assignments physically cannot
enter the table. (Discovered the hard way; see WORKLOG.)

**Error handling: never fail silently.**
The create-record step has an error route (type: Ignore) that stores the raw
payload in `Failed_Intake`, alerts by email, and returns a clean 500 to the
client — while the scenario keeps serving the next request.

**Working within free-tier constraints.**
Make's free plan allows 2 active scenarios. Real-time flows (webhook intake,
SLA watchdog) occupy them; reconciliation is designed as an on-demand run —
in production it would be a nightly cron.

## Demo pricing model (simplified, documented assumptions)

- System size: `min(consumption / 950 kWh·kWp⁻¹, roof_area × 0.2)`
- Monthly rent: `max(128, 128 + (kWp − 4) × 22) + 45 if battery`
- Savings: with battery, 60% self-consumption at €0.35/kWh grid price plus
  surplus marketed at ~€0.12/kWh (energy-management direct marketing);
  without battery, 30% self-consumption plus €0.079/kWh EEG feed-in.
  The 0.12-vs-0.079 spread encodes the value proposition of smart
  energy management.