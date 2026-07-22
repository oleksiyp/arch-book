# Course 5: Microservices — Building, Operating, Succeeding

> Microservices are an organizational technology that happens to run on computers.

## Welcome

Encore has grown. Three years after Course 1, it is 70 engineers in nine teams, and the modular monolith that served nine people beautifully has become a coordination machine: deploy trains, freeze windows, teams waiting on teams. This — not request volume, not résumé fashion — is the problem microservices exist to solve: letting many teams change one product *without asking each other's permission*.

This course is the honest, end-to-end treatment: how to cut services so independence is real, how to run workflows when no transaction spans them, how to build, test, deploy, and watch a fleet — and the organizational contract without which all of it curdles. The first law rules throughout: every microservices benefit is purchased with operational complexity, and this course is about making sure you receive what you pay for. Many teams pay full price for the distributed monolith — services coupled so tightly they deploy in lockstep — which is every cost and no benefit; this course is also about not being them.

## Module 1: Modeling and Communication

### Independence is the unit of correctness

A microservice is an independently deployable unit of business capability. Every word is load-bearing, but *independently* most of all — and independence is decided at modeling time, not deployment time. Services cut along Course 3's bounded contexts can change alone because the business seams they follow are real. Services cut by entity ("User service," "Ticket service" — Course 1's entity trap at fleet scale) or by layer put every business change on a tour through three repos and two teams' sprint plannings.

Encore's cut therefore reads like its context map: On-Sale Admission, Seat Inventory & Ticketing, Catalog, Orders & Payments, Support, Notifications, plus Bot Screening. Seven services, nine teams — some teams own two small ones, none share one. **Information hiding** completes the modeling rule: a service's database is private the way a class's fields are private; the moment two services share tables, they deploy together forever.

### The communication decision

Every inter-service link picks a row of this table, and the rows have owners from earlier courses:

| Mode | When it's right | Standing cost |
|---|---|---|
| Synchronous request/response | Caller cannot proceed without the answer (reserve seat) | Temporal coupling; availability multiplies (Course 4) |
| Asynchronous events | Others must *learn*, not approve (SeatSold → analytics, email) | Eventual consistency; visibility work |
| Orchestrated workflow | Multi-step process needing an accountable owner | The orchestrator to run and monitor |

*Figure 1 — Three communication modes. Default to events for propagation of facts, synchronous calls for moments of truth, orchestration for processes with names — and notice how few moments of truth Encore actually has (Course 4 found one).*

**Recap.** Services are bounded contexts made deployable; independence is won at modeling time. Databases are private. Communication mode is chosen per link, and most links carry facts, not questions.

**Exercise 1.1.** Take two services (real or from Encore) and list every way a change in one forces a deploy of the other. Each item is a coupling with a name — schema, timing, shared library. Which would you sever first?

## Module 2: Workflow, Transactions, and Contracts

### The saga: transactions without the transaction

Buying a ticket spans three services — reserve (Inventory), charge (Payments), issue (Ticketing) — and no database transaction will span them for you. The distributed answer is the **saga**: a sequence of local transactions, each with a *compensating* action for when a later step fails.

<pre class="mermaid">
sequenceDiagram
    participant O as Order (orchestrator)
    participant I as Seat Inventory
    participant P as Payments
    participant T as Ticketing
    O->>I: reserve seat 14B
    I-->>O: reserved (TTL 5 min)
    O->>P: charge intent #881
    P-->>O: DECLINED
    O->>I: release seat 14B ← compensation
    O-->>O: order failed, seat back on sale
</pre>

*Figure 2 — An orchestrated saga compensating a declined card. Note what compensation is: not "undo" (the decline already happened) but a forward action restoring business sense. Sagas are business processes wearing engineering clothes — which is why the compensations must be designed with the business, not invented in code review.*

Orchestration (an owner drives the steps — visible, debuggable, one accountable place) versus choreography (each service reacts to the previous event — decoupled, no bottleneck, but the workflow exists only as folklore): for money-touching flows with deadlines and dunning, Encore orchestrates; for propagation of facts, it choreographs. Course 6 gives both their full machinery.

### Contracts: the boundaries' constitution

Independent deployment dies the day service A's release breaks service B. The defense is contract discipline: explicit schemas with **expand–contract** evolution (add optional fields freely; remove or change meaning only after all consumers migrate), **tolerant readers** (ignore unknown fields; a consumer that rejects surprises is a coupling bomb), and **consumer-driven contract tests** — each consumer publishes what it actually relies on, and providers run those expectations in CI, converting "did we break anyone?" from a meeting into a test failure. One sharp corollary the industry keeps relearning: shared "common model" libraries re-couple everything they touch; share primitives and protocols, never domain models.

**Recap.** Sagas replace distributed transactions with compensation designed alongside the business. Orchestrate accountable processes; choreograph fact propagation. Expand–contract plus consumer contracts in CI make "independently deployable" true rather than aspirational.

**Exercise 2.1.** Design the saga for Encore's *refund* (payment reversal, seat re-listing if >48 h to showtime, ticket invalidation). Which step is the point of no return? What compensates a failure after it?

## Module 3: Delivery — Build, Test, Observe

### Deployment as a non-event

The fleet's health is measured by one cultural metric: is deploying boring? Each service gets its own pipeline — commit to production in under an hour, no coordination, no train, no freeze. **Progressive delivery** removes the remaining fear: canary a few percent of traffic, watch, widen, with automated rollback on error-budget burn; and **decouple deploy from release** with feature flags, so shipping code and enabling behavior are separate decisions owned by separate roles. Encore ships the new seat-picker dark on Tuesday, enables it for 5% on Thursday, and nobody works weekends.

### Testing a fleet without lying to yourself

The classic pyramid needs distributed-era honesty. Unit tests stay cheap and plentiful; service tests (one service, stubbed neighbors) carry most confidence; contract tests (Module 2) guard every seam. The top layer is where discipline lives: end-to-end tests spanning many services are slow, flaky, and politically expensive — keep a handful of *journeys* (fan buys ticket), not a thousand cases, and push everything else down. Below the pyramid sits its modern extension: **testing in production** — because with contracts guarding seams, the canary *is* the final integration test, and synthetic buyers exercising the real path hourly catch what staging never will.

### From monitoring to observability

Monitoring asks known questions ("is CPU high?"). Observability answers unknown ones ("why are Dutch fans' payments slow since 14:02?"). The toolkit: **structured, correlated logs**, **metrics** for cheap aggregates and alerting, and **traces** — the distributed call's biography, without which debugging a fleet is guesswork with dashboards. The architect's job is making all three *ambient*: baked into service templates (Module 5 returns to this), with a correlation ID born at the edge and carried through every hop, queue, and saga — so any Encore engineer can follow order #881 across seven services at 3 a.m. without waking anyone.

**Recap.** One pipeline per service; canaries plus flags make deploys boring and reversible. Confidence lives in service and contract tests; e2e is a few journeys; production is a test environment with dignity. Traces + correlation IDs are non-negotiable fleet equipment.

**Exercise 3.1.** For your current system: how long from merged commit to production, and how many humans touch it? If >1 hour or >1 human, name the single constraint you'd remove first.

## Module 4: Production Realities

Four topics decide whether the fleet survives contact with reality; each gets a deep course later, but the microservices-shaped view belongs here.

**Resilience, aggregated.** Course 4's chain-breakers must now exist *uniformly* — a bulkhead missing in one service is a hole in everyone's hull. This is the case for the **service mesh**: timeouts, retries, mTLS, and telemetry pushed into infrastructure sidecars, so resilience is fleet policy rather than seventy teams' individual diligence. The trade-off is real (a mesh is heavy machinery); the alternative — resilience by memo — is worse at Encore's scale.

**Security, previewed.** Every service boundary is an attack surface; "internal" is not a trust level (the fallacy list said so). Services get identities, mTLS everywhere, and per-service least-privilege credentials — Course 10 makes this a discipline.

**Scaling, per service.** The fleet's virtue: Sale Gate scales to 400 instances on Friday while Support idles on two. Scaling decisions become per-service and boring — which is the point.

**UIs and BFFs.** The frontend must not become the place where all decomposition is undone (one screen calling nine services). The **backend-for-frontend** aggregates per experience — fan app, organizer web — owned by the frontend team; Course 8 treats this seam fully.

**Recap.** Uniformity is the production theme: mesh-enforced resilience, identity everywhere, per-service scaling, BFFs guarding the UI seam. Fleet properties must be infrastructural, not voluntary.

**Exercise 4.1.** Pick any two services in your organization. Are their timeout, retry, and TLS behaviors the same? If not, you have found policy-by-diligence; sketch what moving it to infrastructure would take.

## Module 5: The Organization That Microservices Require

### Conway's law is a design tool

Team boundaries and service boundaries are the same drawing viewed twice; fight that and the org chart wins every time. The workable topology: **stream-aligned teams** owning services end to end — build it, run it, carry its pager — because ownership without operations is authorship, and authorship doesn't wake up at 3 a.m. and therefore never learns. Around them, a **platform** (Courses 11 and 14) turns the fleet's shared burdens — pipelines, observability, mesh, golden-path templates — into paved roads, so each stream team's cognitive load stays inside a human skull.

**Governance without a review board.** Central approval boards recreate the coordination the whole style exists to remove. The replacement is *paved roads plus fitness functions*: the golden-path template makes the right thing the easy thing; automated checks (Course 1's governance, now fleet-wide) catch the drift; deviation is allowed, priced, and owned by the deviator. Encore's rule of thumb: you may leave the paved road whenever you're prepared to build your own.

### The adoption question, asked out loud

> **Microservices are a prerequisite-gated purchase.** Before adopting, four questions in order: (1) Do you have a *team-coordination* problem, measured in waiting? (2) Are your domain boundaries stable enough to cut along (Course 3 done honestly)? (3) Can you operate a fleet — observability, on-call, automated deploys — or fund the platform that can? (4) Can leadership accept team autonomy, including its mistakes? Four yeses: proceed incrementally, strangler-style. Any no: a modular monolith with enforced boundaries gives you most of the benefit at a fraction of the invoice — and leaves the option open.

**Recap.** Stream-aligned teams own services cradle-to-pager; a platform absorbs the shared burden; governance rides paved roads and fitness functions instead of meetings. Adoption is gated on coordination pain, stable boundaries, operational capability, and cultural consent.

**Exercise 5.1.** Answer the four adoption questions for your organization, in writing, with evidence. Which "yes" is really a "hope"?

## Kata: The Adoption Verdict

> **Your brief: "Grainhouse."** A 60-developer grocery-chain software group: one twelve-year-old monolith (stores, warehouse, e-commerce, loyalty), release train every three weeks, six teams whose features queue behind each other. E-commerce loses money every release freeze. The CEO read an airline magazine and wants "microservices by Q3." The warehouse module is stable and beloved; loyalty changes weekly; the database is one schema with 700 tables and no owners.

**Deliverables:** (1) the four-question adoption verdict with evidence from the brief; (2) if yes-with-conditions — the first two extractions chosen by coordination pain and seam shallowness, with strangler plan; (3) the communication design for extracted pieces (Figure 1 discipline); (4) the *organizational* prerequisites list — what Grainhouse must build or hire before service #1 ships; (5) one ADR: "why we are not extracting the warehouse."

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Verdict honesty | Did evidence, not the CEO's magazine, decide? |
| Pain-first sequencing | Do extractions target measured waiting, not interesting code? |
| Prerequisite realism | Is the platform/on-call/contract tooling funded before the fleet grows? |
| Restraint | Is anything explicitly *left in the monolith*, with pride? |

### Where you now stand

You can cut, contract, deliver, observe, and organizationally sustain a service fleet. But the fleet's nervous system — the events that let services learn facts without asking — has been running on promissory notes since Module 1. Course 6 pays them: event-driven architecture and streaming, done with full rigor.

## References

- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Nicole Forsgren, Jez Humble, Gene Kim — [*Accelerate*](https://itrevolution.com/product/accelerate/). IT Revolution, 2018.
- Jez Humble, David Farley — [*Continuous Delivery*](https://www.informit.com/store/continuous-delivery-reliable-software-releases-through-9780321601919). Addison-Wesley, 2010.
