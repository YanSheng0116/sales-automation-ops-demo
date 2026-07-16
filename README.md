# Sales Ops Demo — Lead Management & Automation for a Solar Sales Team

> 🚧 Work in progress — live demo link coming soon.

## Why I built this

Preparing for a Sales Tools & Automation role at Enpal, I wanted to go beyond
saying "I can learn these tools quickly" — so I built a working mini
lead-management system using the exact stack from the job description:
**React, Airtable, Make.com, and custom serverless scripts**, developed with
AI-assisted tooling.

## What it does

- **Lead intake with data quality gates** — a React form posts to a Make.com
  webhook that validates payloads, deduplicates leads by email, and routes
  broken data into a `Failed_Intake` table with alerting. No silent failures.
- **Automatic lead scoring & prioritization** — consumption, battery/heat-pump
  interest, roof orientation and lead source feed a scoring formula; leads are
  tiered Hot / Warm / Cold.
- **Territory auto-assignment** — leads are routed to regional reps by postal
  code (Berlin / Hamburg / München), mirroring a distributed installer org.
- **Tiered SLA watchdog** — in residential solar, speed-to-lead decides
  conversion: hot leads escalate after 15 minutes, others after 2 hours,
  enforced by a scheduled Make.com scenario.
- **Order lifecycle** — won deals automatically create orders whose status
  machine ends at `OnePlus_Activated`, not `Installed` — because energy
  management activation depends on grid operator approval.
- **Mock external-CRM sync + reconciliation** — won deals sync to a mock CRM
  table; a reconciliation scenario compares record counts and flags drift.

## Stack

React (Vite) · Tailwind · dnd-kit · Airtable · Make.com · Vercel serverless

## Docs

- [Architecture & design decisions](docs/ARCHITECTURE.md)
- [Work log & debugging notes](docs/WORKLOG.md)