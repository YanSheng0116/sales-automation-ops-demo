# Sales Ops Demo — Lead Management & Automation for a Solar Sales Team

> 🔗 **Live demo:** _link coming after deployment_ · fake data, feel free to click around

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
- **Automatic lead scoring & prioritization** — consumption, battery /
  heat-pump interest, roof orientation and lead source feed a scoring
  formula; leads are tiered Hot / Warm / Cold.
- **Territory auto-assignment** — leads are routed to regional reps by
  postal code (Berlin / Hamburg / München), mirroring a distributed
  installer organization.
- **Call Queue ("next best lead")** — reps see a priority-sorted queue
  driven by score × SLA urgency, because in residential solar,
  speed-to-lead decides conversion. Tiered SLAs (15 min for hot leads,
  2 h otherwise) are enforced by a scheduled Make.com watchdog.
- **Kanban pipeline** — drag-and-drop status management (dnd-kit) synced
  back to Airtable; moving a deal to *Won* triggers a native Airtable
  automation that creates an order and syncs a mock external CRM.
- **Order lifecycle** — the order status machine ends at
  `OnePlus_Activated`, not `Installed`, because energy-management
  activation depends on grid-operator approval.
- **Reconciliation** — an on-demand Make scenario compares won deals
  against the mock CRM and flags drift — the unglamorous work that keeps
  commission data trustworthy.

## Architecture
React frontend (Vercel)
          · Call Queue · Kanban · New Lead form
             │ writes (events)         │ reads & updates
             ▼                         ▼
   Make.com webhook             Vercel serverless /api/*
   validate → dedupe →          (proxies the Airtable API;
   create → assign → notify      token stays server-side)
             │                         │
             └────────► Airtable ◄─────┘
   Leads · Orders · External_CRM_Mock · Failed_Intake
   (scoring, pricing, SLA status = formula fields)

   Scheduled:  SLA Watchdog (every 15 min)
   On demand:  Reconciliation (won leads vs mock CRM)

Writes are *events* and go through Make (orchestration, dedupe, alerting);
reads and simple updates go through a thin serverless proxy so the Airtable
token never reaches the browser. That split is what "blending low-code
platforms with custom scripts" looks like in practice.

## Stack

React (Vite) · Tailwind CSS · dnd-kit · Airtable · Make.com ·
Vercel serverless functions

## Run locally

```bash
npm install
cp .env.example .env        # fill in your own values
vercel dev                  # runs frontend + /api functions together
```

## Docs

- [Architecture & design decisions](docs/ARCHITECTURE.md)
- [Work log & debugging diary](docs/WORKLOG.md)

## What I'd build next

Salesforce bidirectional sync with a conflict strategy · webhook signature
verification · round-robin assignment with load balancing · migration of
the data core to Supabase once volume outgrows Airtable · role-based views.

## Honest limitations

Demo scope: no auth, simplified pricing model, Make free tier (2 active
scenarios, 15-min minimum polling), Airtable `NOW()` refresh latency.
Each has a documented production path.