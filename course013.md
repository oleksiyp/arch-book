# Course 13: Multi-Tenant SaaS Architecture

> One system, many customers, and every customer convinced it was built for them alone.

## Welcome

Encore's inbound email changed the company: a national venue chain wants "Encore, but ours" — their brand, their data, their compliance regime, running on Encore's machinery. This is the SaaS turn, and it is not a deployment detail. Multi-tenancy is a *defining architectural constraint*: one system serving many customers, with isolation, fairness, and per-tenant economics designed in from the first line — because every one of those properties, retrofitted, costs ten times what it costs designed.

This course is the full treatment, and it is deliberately the penultimate course of the specialization: a SaaS product is a platform with billing attached, and every mechanism built here — the control plane, self-service onboarding, tenant-aware operations — is the same machinery Course 14 generalizes to internal platforms. The word "tenant" will do a lot of work; watch how many prior disciplines it touches: identity (Course 10), partitioning (Course 4), cost (Course 11), even AI spend (Course 12). Multi-tenancy is not a feature; it is a dimension that runs through everything.

## Module 1: The SaaS Mindset

### Two planes, three models

The foundational split — the one that organizes everything after it — is between the **application plane** (the ticketing machinery tenants use) and the **control plane** (the machinery that *manages tenants*: onboarding, identity, configuration, billing, per-tenant operations). The control plane is where SaaS-ness lives; it has no tenant-facing features and it is the most load-bearing software the company will now write.

<pre class="mermaid">
flowchart TB
    subgraph cp["Control plane — manages tenants"]
        onb["Onboarding"] --- idm["Tenant identity"] --- cfg["Config & tiering"] --- bil["Billing & metering"] --- ops["Tenant-aware ops"]
    end
    subgraph ap["Application plane — serves tenants"]
        t1["Venue-chain tenant"] --- t2["Festival tenant"] --- t3["500 self-service venues"]
    end
    cp -- "provisions · configures · observes" --> ap
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class cp hot
</pre>

*Figure 1 — The two planes. Everything the next four modules build is one of these boxes. Companies that skip the control plane still have one — made of runbooks, spreadsheets, and a heroic ops engineer named something like Dana.*

Within the application plane, tenants deploy on a spectrum of three models: **silo** (each tenant their own stack — maximum isolation, maximum cost, compliance's darling), **pool** (shared everything, tenancy by scoping — one deployment, ruthless efficiency, Course 10's isolation stakes), and **bridge** (pooled compute, siloed data — the workhorse compromise). The senior insight: this is a *per-tenant, per-tier* decision, not a company decision — and Module 5 will price it accordingly.

**Recap.** Control plane manages tenants; application plane serves them; the control plane is the new crown jewel. Silo, pool, and bridge are a menu, chosen per tier — not an identity.

**Exercise 1.1.** Inventory what your company would need in a control plane today: how many of Figure 1's five boxes currently exist as software, and how many as Dana?

## Module 2: Tenant Lifecycle

### Onboarding is architecture, identity is destiny

A tenant's life begins at onboarding, and onboarding quality is measured the way Course 7 measured DX: *time from signature to first sale*. For Encore's self-service tier that must be minutes — which means onboarding is an automated, observable workflow (Course 6's engine, verbatim: provision → configure → seed → verify, with compensation for the partial failures that absolutely will happen), not a checklist in Confluence. The enterprise tier adds steps — SSO federation, custom domains, data residency — but the *same* pipeline runs them, because a hand-crafted enterprise tenant is a snowflake you will re-create wrongly in every disaster-recovery drill.

Identity does the daily work. The rule that prevents a category of catastrophe: **tenancy is resolved at authentication and carried in the token** — the fan logs in, the token says `tenant: venue-chain-a`, and every downstream service, query, and event scopes by claim. The alternatives (tenant from URL parsing, from lookup tables consulted per request, from "the service knows") all eventually serve one tenant another tenant's data on a Tuesday. Routing follows the same token: subdomain (`tickets.venuechain.com`) or path-based entry resolves to tenant context at the edge, and from the gateway inward, *tenant context propagates like Course 5's correlation ID* — in every call, every event, every log line. When context arrives everywhere, per-tenant everything (metrics, limits, bills) becomes a query instead of a project.

**Recap.** Onboarding is a compensating workflow measured in minutes-to-first-value, identical across tiers. Tenancy lives in the token from authentication onward and propagates like a correlation ID — making the rest of this course queryable.

**Exercise 2.1.** Sketch Encore's self-service onboarding as a Course 6 process model: steps, compensations, and the verification that flips a tenant to "live."

## Module 3: Building Multi-Tenant Services

### Tenant-aware without tenant-riddled

The application plane's code-quality battle is keeping tenancy *ambient* rather than epidemic. The failure mode: `if (tenant.tier == "enterprise")` sprinkled through business logic until no path is testable. The discipline: tenancy is resolved once (Module 2's token), enforced in shared infrastructure layers, and expressed in business code as *configuration, not conditionals* — Encore's seat-hold TTL is a per-tenant config value, not a branch.

Data partitioning applies Course 4's machinery with a tenant key:

| Scheme | Mechanics | Blast radius | Bill |
|---|---|---|---|
| Pooled tables | `tenant_id` column + row-level policy | one missing predicate | cheapest, easiest ops |
| Schema-per-tenant | one DB, N schemas | schema drift at N | middling both |
| Database-per-tenant | full separation | smallest | migrations × N, connection sprawl |

*Figure 2 — Partitioning schemes. The pooled row's risk column is why Course 10 insisted the tenant predicate be centralized — in the ORM layer, row-level security, or the data-access library — so ten thousand queries rely on one guarded implementation, not ten thousand memories.*

Isolation must then survive *runtime*: tenant-scoped credentials (the request's DB session can only see its tenant's rows — defense below the application), and **noisy-neighbor fairness**, which for Encore is existential: one tenant's on-sale *is* a Course 4 spike aimed at shared infrastructure. The answer stack: per-tenant rate limits and concurrency quotas at the edge, fair queueing in shared workers, and the Gate's admission control now *tenant-aware* — plus the bridge-model escape hatch of moving a chronically hot tenant to dedicated capacity, at a price Module 5 will name.

**Recap.** Resolve tenancy once, enforce it in layers, express it as config. Choose partitioning per blast-radius budget; centralize the predicate; scope runtime credentials. Fairness is engineered with quotas and fair queues — and priced when quotas aren't enough.

**Exercise 3.1.** Grep (mentally or actually) a codebase you know for tier/tenant conditionals in business logic. Redesign the worst one as configuration.

## Module 4: SaaS on Real Stacks

The models of Module 1 land differently on the two dominant substrates. **Kubernetes SaaS**: namespace-per-tenant with quotas and network policies gives bridge-grade isolation in one cluster; silo tiers get dedicated node pools or clusters; the noisy-neighbor tools are the scheduler's (requests/limits, priority classes). **Serverless SaaS**: per-invocation isolation comes free, making pooled compute safer by default; concurrency limits per tenant become the fairness lever; and per-invocation billing makes *cost attribution nearly exact* — the property Course 11's FinOps discipline now depends on. Encore runs the pattern this course has been converging on: pooled serverless for the self-service five hundred, bridge on Kubernetes for mid-tier, silo'd stacks for the venue chain whose auditors require it.

Operations gains a dimension: dashboards, alerts, and SLOs all grow a *tenant axis* (Module 2's propagated context paying out). The on-call question stops being "is the system up?" and becomes "is it up *for whom*?" — because a pooled system at 99.99% can be serving one tenant pure errors, invisibly, if nobody slices by tenant. Per-tenant health, per-tenant error budgets for the paying tiers, and support tooling that reconstructs *this tenant's* experience are what "tenant-aware operations" means when the pager goes off.

**Recap.** Kubernetes buys isolation with namespaces and schedulers; serverless buys it per-invocation with exact cost attribution. Mixed substrates per tier is the mature answer. Every operational artifact — dashboard, SLO, alert — grows a tenant dimension, or incidents hide inside averages.

**Exercise 4.1.** Take one alert your team owns. Rewrite it tenant-sliced: what threshold, per whom, and what would last month have shown that the averaged version hid?

## Module 5: The Business of Multi-Tenancy

### Tiers are architecture with a price list

Tiering is where Module 1's menu meets the CFO: architecture and packaging co-designed. Encore's sheet:

| Tier | Deployment | Isolation | SLO | AI features | Price logic |
|---|---|---|---|---|---|
| Self-service | pooled serverless | row + quota | 99.9% shared | shared budget, capped | efficient by design |
| Professional | bridge (pooled compute, own DB) | data silo | 99.95%, own error budget | own AI budget | margin from pooling, comfort from silo |
| Enterprise | silo | full stack | contractual, tenant-sliced | dedicated corpus + spend | the isolation *is* the product |

*Figure 3 — Tiering as co-design. Read it with Course 11's eyes: each row is only priceable because per-tenant cost is measurable — metering (requests, storage, AI tokens per tenant) is the control-plane service that keeps margins from being folklore.*

Two closing motions complete the course. **Migration** — taking single-tenant software multi-tenant — runs the strangler discipline of Course 3: tenant context introduced at the edge first (every request tagged, even with one tenant), the tenant predicate centralized, data consolidated pooled-ward tier by tier, silo customers moved last or never; the big-bang rewrite to multi-tenancy has a casualty list long enough to constitute its own literature. And **GenAI multi-tenancy** — Course 12's preview, now doctrine: tenant boundaries extend through prompts (no cross-tenant context assembly, structurally), corpora (per-tenant indexes or tenant-filtered retrieval — the venue chain's sales data must be unreachable from a rival's assistant, by construction), and spend (per-tenant AI budgets metered like any resource, because an unmetered AI feature is a margin leak wearing a demo). Tenancy, as promised, turned out to be a dimension of everything.

**Recap.** Tiers map deployment models to price points, and metering makes the mapping honest. Migrate by strangling tenancy inward from the edge. AI features inherit tenant boundaries across prompts, corpora, and spend — structurally, like everything else in this course.

**Exercise 5.1.** Draft your product's Figure-3 sheet, real or hypothetical. Which cell can you not fill because the metering doesn't exist? That cell is control-plane backlog.

## Kata: The Studio Suite

> **Your brief: "Metronome."** Beloved studio-management software (bookings, invoicing, class schedules) for music schools — currently *installed per customer*: 180 on-prem/VPS installations, each its own version, backed up by email reminders. The founders want SaaS: keep the 180 (some contractually on-prem for two more years), add self-service signup for small studios, and land "Allegro" — a 90-school national chain demanding SSO, data residency in-country, and a contractual SLA. Twelve engineers. The codebase assumes one tenant so thoroughly that the database is named after the customer.

**Deliverables:**

1. **Two-plane design** — Figure-1 control plane scoped to twelve engineers: which boxes are built, bought, or Dana-for-now (explicitly).
2. **Tier sheet** — Figure-3 for self-service, standard, Allegro, and the legacy on-prem tail; deployment model and metering per tier.
3. **Migration plan** — from 180 snowflakes to tenancy: edge-tagging first, predicate centralization, data consolidation order, and what "reversible" means at each step.
4. **Fairness & isolation** — the September-enrollment spike (every school's on-sale, same week): quotas, fair queues, and Allegro's contractual protection.
5. **One ADR** — "Allegro: silo or bridge?" — with the margin math and the ops bill in ink.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Control-plane realism | Is the plane sized to twelve engineers, with honest Dana-boxes? |
| Token-borne tenancy | Does tenant context flow from auth to logs, or from URL parsing and hope? |
| Migration reversibility | Can any consolidation step roll back without restoring from the email backups? |
| Priced isolation | Does Allegro's tier price its blast radius, or subsidize it? |

### Where you now stand

You can serve many masters from one system: planes split, tenants tokenized, fairness engineered, tiers priced. Now step back and look at what Encore has accumulated across thirteen courses — golden paths, an event backbone, data products, paved-road security, SLO tooling, an AI gateway, a control plane. Some company builds and runs that machinery *for its own teams*. At Encore's size, that company is Encore itself. The final course names the discipline: platform engineering — and hands you the capstone.

## References

- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Gregor Hohpe — [*Cloud Strategy*](https://leanpub.com/cloudstrategy). Leanpub, 2020.
- Martin L. Abbott, Michael T. Fisher — [*The Art of Scalability*, 2nd ed.](https://www.informit.com/store/art-of-scalability-scalable-web-architecture-processes-9780134032801) Addison-Wesley, 2015.
