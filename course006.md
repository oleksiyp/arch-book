# Course 6: Event-Driven Architecture and Streaming Systems

> A call asks permission; an event states a fact. Systems built on facts age better.

## Welcome

Every course so far has leaned on a quiet promise: that services can *learn* things without asking. `SeatSold` reached analytics in Course 1's trade-off, powered sagas in Course 5, carried facts across bounded contexts in Course 3. This course pays that debt in full. Event-driven architecture is not a messaging library choice; it is a different theory of how software communicates — facts announced rather than questions asked — and it now runs the checkout you used this morning, the fraud check that approved it, and the data pipelines feeding every AI system you will meet in Course 12.

The rigor matters because events fail differently than calls. A slow call is visible; a misdesigned event topology fails quietly — duplicated effects, out-of-order truths, workflows that exist only as folklore. By the end you will design events as carefully as you design APIs, wield event sourcing and CQRS where they earn their keep, and know exactly what "exactly-once" actually means (spoiler: less than the brochure says).

## Module 1: Event-Driven Fundamentals

### Events, commands, and the direction of authority

The vocabulary must be sharp, because everything downstream depends on it. A **command** asks a specific receiver to do something and may be refused ("reserve seat 14B"). An **event** states that something *happened*, is past tense, owned by its producer, and refuses nothing ("SeatSold"). The direction of authority reverses: commands put the sender in charge of intent; events put each *consumer* in charge of reaction. That reversal is the whole style. Order doesn't know Notifications exists — and when organizer payouts arrive next quarter, they subscribe without Order changing a line. Decoupling in space (who), time (when), and load (how fast) — bought with one currency: nobody waits for anybody, so nobody *knows* about anybody either. This course is about enjoying the first clause while managing the second.

### What rides inside the event

The most consequential small decision in the style:

| Pattern | Payload | Buys you | Bills you |
|---|---|---|---|
| **Notification** | just "it happened" + ID | tiny, never stale | every consumer calls back → hidden sync coupling |
| **Event-carried state transfer** | the relevant facts | consumers self-sufficient, producer stays quiet | schema discipline; payload bloat temptation |
| **Delta** | what changed | compact streams | consumers must replay history to know state |

*Figure 1 — Three payload philosophies. Default to event-carried state with a curated payload: the fields consumers legitimately need, not the producer's whole table — an event schema is an API, and Course 5's expand–contract rules apply verbatim.*

Add the producer's golden rule — events describe *the domain*, never the producer's implementation (`SeatSold`, not `SeatRowUpdated`) — and schema evolution discipline (additive changes; a registry enforcing compatibility in CI), and you have event design as contract design. This is the least glamorous and most valuable module in the course.

**Recap.** Commands request, events declare; authority moves to consumers. Payload choice is a coupling decision; event-carried state with curated fields is the default. Event schemas are APIs with the same evolution constitution.

**Exercise 1.1.** Take one message flowing in a system you know. Is it a command in event clothing ("SendEmailRequested")? If so, who is *actually* in charge, and what would the honest event be?

## Module 2: Event Streams as State

### The log: a database turned inside out

A queue forgets a message once consumed. A **log** (the Kafka-class abstraction) remembers: an append-only, ordered, replayable record where consumers hold cursors. This single upgrade — from postal service to ledger — changes what events are *for*: a new consumer can arrive years later and replay history; analytics can reprocess with better logic; the stream stops being plumbing and becomes a record.

Push the idea to its limit and you reach **event sourcing**: the events *are* the state. Encore's Seat Inventory stops storing "14B: sold" and stores the ledger — `Reserved(14B)`, `Expired(14B)`, `Sold(14B)` — deriving current truth by replay (plus snapshots for speed). For an auditable, dispute-heavy domain like ticket sales, the ledger answers questions a state table cannot: *when* did it sell, after how many failed holds, in what order during the rush? The price is real: append-only thinking, upcasting old events as schemas evolve, and answering "current state" queries — which brings its natural partner.

### CQRS: two models, one truth

Command Query Responsibility Segregation splits the write model (aggregates guarding invariants — Course 3) from read models (projections built *from the events*, shaped per question):

<pre class="mermaid">
flowchart LR
    cmd([commands]) --> agg["Write model<br/><small>EventSeating aggregate</small>"]
    agg -- "events (the truth)" --> log[["Event log"]]
    log --> p1["Projection: seat-map view"]
    log --> p2["Projection: sales dashboard"]
    log --> p3["Projection: fan's tickets"]
    p1 & p2 & p3 --> q([queries])
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class log hot
</pre>

*Figure 2 — CQRS fed by an event log. Each projection is disposable — wrong shape? Rebuild from the log with new code. The log is the system of record; projections are opinions about it. The lag between write and projection is Course 4's replication lag wearing domain clothes: declared, monitored, and honest.*

> **The CQRS honesty clause.** Full event sourcing + CQRS is heavy machinery: two models, projection infrastructure, replay tooling. Encore applies it to Seat Inventory (audit-critical, contended, query-diverse) and *nowhere else*. Applying it uniformly is the Module-2 version of Course 3's tactical-DDD-everywhere mistake.

For integrating the legacy and the ordinary, one bridge pattern carries most traffic: the **transactional outbox** — write your state change and the outgoing event in one local transaction (to an outbox table), with a relay publishing from there; its cousin **change data capture** taps the database's own log to eventify systems that never heard of events. Both exist to kill the classic bug of "saved to DB, crashed before publishing."

**Recap.** Logs remember; queues forget. Event sourcing makes the ledger the truth — for domains that are ledgers at heart. CQRS shapes projections per question and makes them disposable. Outbox/CDC keep state changes and event publishing atomic.

**Exercise 2.1.** Name one entity in your world whose *history* answers questions its current state cannot. What would its event ledger contain?

## Module 3: Stream Processing

### Partitions, ordering, and the delivery truth

Scale forces the log to partition, and partitioning sets the rules of the game: **order is guaranteed within a partition only**, so the partition key is a domain decision — Encore keys by `event_id` (the concert), making each on-sale a strictly ordered story while thousands of on-sales proceed in parallel. Consumer groups then divide partitions among instances, giving horizontal scale with per-key order — the trick behind every serious streaming system.

Then the truth about delivery, which every architect must be able to recite: *exactly-once delivery does not exist* between independent systems; failures plus retries make at-least-once the physical reality. What honest systems achieve is **exactly-once effect**: at-least-once delivery × idempotent consumers (Course 4's duty, now compulsory). Frameworks advertising exactly-once semantics achieve it inside their own transactional walls — valuable, real, and void the moment you call an external PSP from inside the pipeline.

### Time and state in motion

Stream processors compute *while data flows* — fraud scores during the on-sale, not after it. Two hard problems define the craft. **Time**: event-time vs. arrival-time diverge (stadium Wi-Fi, mobile retries), so windows need watermarks — a declared patience for stragglers — and a policy for the too-late. **State**: "bot check: >5 purchases in 10 min" requires remembering, so stateful processors keep local, changelogged, partitioned state — which must be rebuilt on failover and reprocessed on logic changes. Replayability (Module 2's gift) is what makes *reprocessing* — running v2 of the fraud logic over last month — a routine operation instead of a data-science archaeology project.

**Recap.** Partition key = ordering scope = a domain decision. Exactly-once is effect, not delivery: at-least-once + idempotency. Event-time needs watermarks; stateful streaming needs rebuildable state; replay turns reprocessing into a feature.

**Exercise 3.1.** Your busiest data flow: what is its natural partition key, and what ordering does the business actually require? Are those two answers compatible today?

## Module 4: Workflows and Process Automation

### Processes with names deserve engines

Choreography's weakness surfaces the day someone asks: *"where is order #881 stuck?"* When a workflow exists only as five services' reactions to each other's events, that question has no owner and no screen. For long-running, accountable processes — refunds with approval steps, payouts with dunning, anything involving humans and deadlines — Encore uses **process orchestration**: the saga orchestrator of Course 5 grown up into a workflow engine, where the process is *modeled explicitly*, versioned, monitored, and able to wait forty days without holding a thread.

<pre class="mermaid">
stateDiagram-v2
    [*] --> Requested : fan requests refund
    Requested --> AutoApproved : < €80, > 48h to show
    Requested --> Review : otherwise (human task, SLA 24h)
    Review --> AutoApproved : approved
    Review --> Denied : denied, with reason event
    AutoApproved --> Reversing : PSP refund (retry w/ backoff)
    Reversing --> Relisting : > 48h to show → seat back on sale
    Reversing --> Closed : ≤ 48h → seat stays retired
    Relisting --> Closed
    Denied --> [*]
    Closed --> [*]
</pre>

*Figure 3 — Encore's refund process as an explicit model. Everything folklore choreography hides is visible: the human step with an SLA, the retrying PSP call, the business rule at re-listing. The engine emits events at every transition — orchestrated inside, choreographed at the edges, which is the mature hybrid.*

The dividing line, restated as doctrine: **choreograph the propagation of facts; orchestrate processes with names, owners, and deadlines.** And two anti-patterns to patrol for: the *event chain monolith* — six services that must fire in exact sequence for anything to work, i.e., lockstep coupling wearing async clothes — and *event spaghetti*, where nobody can say what happens after `SeatSold` without grepping four repos. The cure for both is the same: an event catalog (AsyncAPI-documented, discoverable) and explicit process models for anything with a name.

**Recap.** Folklore workflows fail the "where is it stuck?" test. Engines make processes explicit, waitable, and versioned. Hybrid is the end state: orchestrated cores, event-driven edges, and a catalog so the topology is knowable.

**Exercise 4.1.** Name one process at your work that has a business name ("onboarding," "settlement") but no explicit model — only code reacting to code. What would its Figure-3 diagram reveal?

## Module 5: Flow — Streams as Products

The last move is a promotion: from events as integration plumbing to **streams as products** — discoverable, documented, schema-governed, SLO-carrying assets that teams *subscribe to* the way they call APIs. Encore's `ticket-sales.v2` stream has an owner, a contract, a lag SLO, and three consumers the producer has never met; when a data-science team builds demand forecasting in Course 12, they subscribe — no meetings, no export jobs. This is the bridge this course lays toward Course 9 (data mesh is this idea at analytical scale) and Course 14 (the platform serves streams the way it serves compute). Interoperability standards — CloudEvents for envelopes, AsyncAPI for contracts — keep the product promise portable across brokers and clouds.

**Recap.** Streams with owners, contracts, and SLOs are products; subscription replaces coordination. This is the seed of data mesh and a core platform service.

**Exercise 5.1.** If your most valuable internal data flowed as a product-grade stream tomorrow, which team would subscribe first, and what would they stop asking you for?

## Kata: The Event Backbone

> **Your brief: "Loop."** Food-delivery startup, 30 engineers. Orders flow: placed → restaurant accepts → courier assigned → picked up → delivered (or any of five failure exits). Today it runs on synchronous calls and a nightly CSV to analytics; couriers' apps poll every 5 seconds and the restaurant tablet misses updates. New asks: live order tracking, courier surge-pricing (needs 10-minute demand windows), a refund process with human review, and a fraud team that wants to "see everything, later."

**Deliverables:**

1. **Event catalog** — the domain events with payload philosophy per event (Figure 1) and schema-evolution rules.
2. **Topology** — brokers/logs, partition keys with ordering rationale, consumer groups; where CQRS projections serve the tracking screens.
3. **Process model** — the refund workflow, Figure-3 grade, orchestration engine at the core, events at the edges.
4. **Delivery honesty** — for courier assignment: the at-least-once story, the idempotency mechanism, and what the courier sees on a duplicate.
5. **One ADR** — polling → push migration for courier apps, losses included.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Fact vs. command | Are events past-tense facts, or RPC wearing a costume? |
| Ordering by design | Does every ordering guarantee trace to a partition key choice? |
| Effect honesty | Is exactly-once claimed anywhere delivery crosses a system boundary? |
| Named processes | Does everything with a business name have an explicit, ownable model? |

### Where you now stand

You can design facts, own truths in logs, process them in motion, and give processes engines and names. The next course turns to the boundary where your system meets everyone else's — the API: the promise you publish, version, defend, and operate. Events organize your inside; APIs are your outside.

## References

- Adam Bellemare — [*Building Event-Driven Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-event-driven-microservices/9798341622180/) O'Reilly, 2025.
- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) O'Reilly, 2025.
- Bernd Rücker — [*Practical Process Automation*](https://www.oreilly.com/library/view/practical-process-automation/9781492061441/). O'Reilly, 2021.
- Gwen Shapira, Todd Palino, Rajini Sivaram, Krit Petty — [*Kafka: The Definitive Guide*, 2nd ed.](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/) O'Reilly, 2021.
- James Urquhart — [*Flow Architectures*](https://www.oreilly.com/library/view/flow-architectures/9781492075882/). O'Reilly, 2021.
- Tyler Akidau, Slava Chernyak, Reuven Lax — [*Streaming Systems*](https://www.oreilly.com/library/view/streaming-systems/9781491983867/). O'Reilly, 2018.
- Ben Stopford — [*Designing Event-Driven Systems*](https://www.confluent.io/resources/ebook/designing-event-driven-systems/). Confluent/O'Reilly, 2018 — free ebook.
- Gregor Hohpe, Bobby Woolf — [*Enterprise Integration Patterns*](https://www.enterpriseintegrationpatterns.com/). Addison-Wesley, 2003.
