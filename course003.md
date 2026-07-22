# Course 3: Domain-Driven Design and System Decomposition

> Boundaries drawn from the org chart last a reorg; boundaries drawn from the domain last a decade.

## Welcome

Course 2 ended with a promise: styles need boundaries, and boundaries need a source. This course is about the only reliable source there is — the business domain itself. Domain-driven design is often mistaken for a code-pattern catalog; it is actually a discipline of *listening*: finding where the business naturally cleaves, where words change meaning, where one department's "order" is another's "shipment request," and drawing your seams there rather than where the database diagram suggests.

We will decompose Encore properly this time — not by intuition, as Course 1 allowed, but by method. Then we turn to the harder, more common case: the system that already exists, tangled and profitable, which you must reshape without stopping. Most architecture writing pretends systems are born; most architecture work happens on systems that were inherited.

## Module 1: Strategic Design

### Not all of your system deserves your best people

The first strategic act is admitting your domain is not uniformly interesting. DDD divides it into three kinds of subdomain, and the classification is an investment guide:

| Subdomain kind | Definition | Encore | Investment posture |
|---|---|---|---|
| **Core** | Where you beat competitors; changes constantly | Fair, bot-resistant on-sale admission; real-time seat inventory | Best engineers, custom-built, evolve aggressively |
| **Supporting** | Necessary, specific to you, not differentiating | Event catalog, organizer dashboards | Build simply; keep adequate |
| **Generic** | Everyone needs it; solved industry-wide | Payments, email/wallet delivery, auth | Buy or adopt; never innovate here |

*Figure 1 — Subdomain classification as capital allocation. The classic failure is inverted investment: a brilliant in-house auth system and an on-sale flow that falls over — gold-plated plumbing in a house with a leaking roof.*

### Bounded contexts: where words change meaning

Listen to Encore's people talk about a "ticket." To Sales, a ticket is inventory with a price. To the fan's phone, it is a QR code with an entry right. To Support, it is a case number about a refund. Three meanings, one word — and any attempt to build *one* Ticket model serving all three produces the familiar monster: forty fields, half nullable, meaning nothing.

The bounded context is DDD's answer: a boundary inside which words have exactly one meaning and one model. Inside the Ticketing context, "ticket" means entry right; inside Support, it means case. Contexts give the modules of Course 2's modular monolith — and later, perhaps, services — their *semantic* justification. The boundary is where the language changes; you find it by listening for the moment two colleagues use one word and mean two things.

### Context mapping: the politics between boundaries

Contexts must still talk, and *how* they relate is an architectural decision with names:

<pre class="mermaid">
flowchart TB
    onsale["On-Sale Admission<br/><small>core</small>"]
    inv["Seat Inventory & Ticketing<br/><small>core</small>"]
    cat["Event Catalog<br/><small>supporting</small>"]
    sup["Support & Refunds<br/><small>supporting</small>"]
    pay["Payments<br/><small>generic — external PSP</small>"]
    onsale -- "partnership<br/><small>(evolve together)</small>" --- inv
    cat -- "customer–supplier<br/><small>(catalog serves admission)</small>" --> onsale
    inv -- "open-host service<br/><small>(published ticket events)</small>" --> sup
    pay -- "anticorruption layer<br/><small>(PSP's model kept outside)</small>" --> inv
    classDef core fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    classDef supp fill:#1b1f3b,stroke:#1b1f3b,color:#fff
    classDef gen fill:#e8e8ee,stroke:#99a,color:#333
    class onsale,inv core
    class cat,sup supp
    class pay gen
</pre>

*Figure 2 — Encore's context map. The anticorruption layer around Payments is the map's most load-bearing label: the payment provider's model of the world stops at that line and is translated into Encore's own terms, so a PSP migration touches one translator, not every context.*

Three relationships to internalize: **partnership** (two contexts succeed or fail together — expensive, reserve it for core-to-core), **customer–supplier** (downstream's needs discipline upstream's roadmap), and the **anticorruption layer** (a translation shim that keeps someone else's model — a vendor's, a legacy system's — from colonizing yours). The ACL is the single most reusable idea in this module; you will build one every year of your career.

The map itself is discovered, not designed at a desk. The workshop format that works is **EventStorming**: business people and engineers, a long wall, orange stickies for domain events ("SeatReserved," "PaymentFailed," "TicketIssued"), arranged in time order until clusters and language shifts reveal the boundaries. It is cheap, it is fast, and it surfaces in an afternoon what requirement documents hide for months.

**Recap.** Classify subdomains to allocate investment. Bounded contexts are language boundaries — one word, one meaning, one model. Context maps make inter-boundary politics explicit; the ACL is your standing defense against foreign models.

**Exercise 1.1.** Find a word in your current company that means different things to two departments. Sketch the two models it implies. Where is the boundary?

## Module 2: Tactical Design for Architects

### Aggregates: consistency has a size

Inside a context, tactical DDD gives structure to the model. An architect needs one concept above the rest: the **aggregate** — a cluster of objects that changes as a unit, guarding an invariant that must *never* be violated, even for a millisecond.

Encore's crown-jewel invariant: *a seat is never sold twice.* Which objects must change together to guard it? The seats of one event's seating map — reserve, release, sell — and nothing more. So the aggregate is the **EventSeating** for a single event: one transactional boundary, one lock scope, one source of truth for "is seat 14B free?"

> **Aggregates are consistency boundaries, not object graphs.** The beginner's aggregate is everything reachable from Event: seating, orders, refunds, analytics — a lock the size of the business. The architect's aggregate is the *smallest* cluster that guards the invariant. Everything else learns about changes afterward, through domain events.

That "afterward" is the second tactical concept that matters architecturally: **domain events**. When EventSeating sells a seat, it emits `SeatSold`; the Order context reacts; Analytics reacts later still. Between aggregates, consistency is *eventual* — and this is not a compromise smuggled in by engineers, but a property of the business itself (Encore's finance team reconciles daily; they never expected microsecond truth). Course 6 industrializes this idea.

### The honesty clause

Tactical DDD — aggregates, entities, value objects, domain services, ports-and-adapters — earns its complexity only where the domain is complex. Encore's Notification context sends emails; it needs a transaction script and a queue, not a domain model. Applying tactical patterns uniformly is how supporting subdomains eat the budget that core subdomains deserved. The mark of a senior designer is not using the patterns; it is knowing where not to.

**Recap.** The aggregate is the smallest cluster guarding a real invariant — it sizes your transactions, locks, and eventually your service boundaries. Between aggregates: domain events and eventual consistency, blessed by the business. Tactical patterns are for core complexity only.

**Exercise 2.1.** Name the strongest invariant in a system you know. What is the *smallest* aggregate that can guard it? What currently guards it — and is that thing bigger?

## Module 3: Granularity — Forces That Split and Forces That Bind

Contexts give candidate boundaries; granularity forces decide how far to actually split. Six **disintegrators** push pieces apart; five **integrators** pull them together. Architecture happens where they collide:

| Disintegrators (split when...) | Integrators (merge when...) |
|---|---|
| pieces change at different rates | a workflow needs them in one transaction |
| one piece needs extreme scale (Sale Gate) | they chat constantly (latency tax on every call) |
| one piece must not take others down | they share data that cannot be teased apart |
| pieces need different security postures | the team is too small to operate more pieces |
| different teams own them | consistency demands one lock (the aggregate) |
| one piece deploys far more often | |

*Figure 3 — The granularity tug-of-war. Run every proposed split through both columns; a split justified only by fashion loses to any integrator.*

Watch the table settle an Encore argument. Someone proposes splitting Seat Inventory from Order "for cleanliness." Integrators object: seat reservation and order creation share one workflow, chat constantly, and the sale is one business transaction. Disintegrators counter: different change rates? No. Different scale? No — the *Gate* absorbs the spike upstream. Verdict: they stay together. Conway's Law gets the last word on any split: a boundary that requires two teams to ship one feature will be bulldozed by the org chart within a year, whatever the diagrams say. Team topology is not an afterthought to decomposition; it is a *force* in it.

**Recap.** Granularity is a force balance, not an aesthetic. Every split must name its disintegrator and survive the integrators — and the org chart votes last.

**Exercise 3.1.** Take the most recently split (or proposed-split) service at your work. Which disintegrator justified it? Which integrators were ignored, and what did that cost?

## Module 4: Decomposing Existing Systems

### First, the economics

Encore, remember, is lucky — it is young. The system you will actually be asked to decompose is nine years old, profitable, and load-bearing. Before any technique: *should* you? The honest checklist is short. Decompose when the monolith measurably blocks the business — deploys collide weekly, one component's scale needs starve the rest, teams idle in merge queues. Do **not** decompose because the code is ugly (refactor it), because hiring slides say "microservices," or because the monolith is merely old. A tangled monolith becomes tangled services with a network inside the tangle — you keep every problem and add latency, partial failure, and an ops bill.

### The strangler fig and its supporting cast

When the answer is yes, the master pattern is the **strangler fig**: grow the new system around the old, redirect traffic capability by capability, and let the old code die of irrelevance rather than surgery.

<pre class="mermaid">
flowchart LR
    users([Users]) --> proxy["Routing facade"]
    proxy -- "extracted capability" --> new["New Admission service"]
    proxy -- "everything else" --> old["Legacy monolith"]
    new -. "reads/writes via ACL" .-> old
    classDef new fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    classDef old fill:#e8e8ee,stroke:#99a,color:#333
    class new new
    class old old
</pre>

*Figure 4 — The strangler fig. The routing facade is the whole trick: every capability behind it can move without users knowing, and every move is reversible by routing rule — your rollback is a config change, not a war room.*

Around the fig, a supporting cast for the risky middle period: **branch by abstraction** (an interface inside the monolith with old and new implementations behind a toggle) when you cannot intercept at the edge; **parallel run** (both implementations execute, results compared, old one still authoritative) when correctness matters more than speed — run the new seat-allocation beside the old for two weeks of real on-sales before trusting it.

### The database is the boss fight

Code splits are the easy half. The shared database is where migrations go to die, and it yields only to a sequence: give each context its own *schema* first (ownership on paper), replace cross-context joins with API calls or replicated read models, then move data with **change data capture** streaming writes from old to new store while reads migrate gradually. Expect the grief stages: reports that joined everything, hidden consumers nobody declared, "temporary" direct-table access from 2019. Every one is an integrator you are paying down with interest. This is why Module 3 told you to check the data column *before* splitting.

**Recap.** Decompose for measured business pain, never aesthetics. Strangler fig + routing facade makes migration incremental and reversible; branch-by-abstraction and parallel run de-risk the middle; the database splits last, by schema → API → CDC.

**Exercise 4.1.** For a monolith you know: name the one capability you would extract first. Why that one — which disintegrator, and why is its data seam shallow?

## Module 5: Decomposition Kata

> **Your brief: "Harvest."** A farm-to-restaurant marketplace, eight years old, one Rails monolith, 26 engineers in four teams. Farmers list weekly harvests; restaurants order by Thursday; routes are planned Friday; trucks roll Saturday 4 a.m. Deploys are frozen Wednesday–Saturday because *nobody is sure what touches routing*. The delivery-routing team wants to rewrite in-place; the CTO wants "microservices like Uber"; the CFO wants neither to cost anything. Logistics is the differentiator; listings are commodity; payments are Stripe.

**Deliverables:**

1. **Subdomain classification** — core / supporting / generic, one sentence of investment posture each.
2. **Context map** — with named relationships; at least one ACL, justified.
3. **Granularity verdicts** — three proposed splits run through the Figure 3 force table; at least one *rejected*.
4. **Migration plan** — first extraction, strangler sequence, database strategy, and what "reversible" means at each step.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Language evidence | Are boundaries justified by meaning shifts, not table names? |
| Investment sanity | Does core get the talent; does generic get bought? |
| Force honesty | Did any split survive that names no disintegrator? |
| Reversibility | At every migration step, what is the undo — and is it a routing rule or a rewrite? |

### Where you now stand

You can find boundaries the business will respect, size the pieces by real forces, and reshape a living system without stopping it. What you have been allowed to ignore is what happens *between* the pieces once a network sits there — latency, partial failure, and the death of the single transaction. That physics, and the engineering that survives it, is Course 4.

## References

- Vlad Khononov — [*Learning Domain-Driven Design*](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/). O'Reilly, 2021.
- Sam Newman — [*Monolith to Microservices*](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/). O'Reilly, 2019.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.

**Further reading:**

- Eric Evans — [*Domain-Driven Design: Tackling Complexity in the Heart of Software*](https://www.informit.com/store/domain-driven-design-tackling-complexity-in-the-heart-9780321125217). Addison-Wesley, 2003.
- Vaughn Vernon — [*Implementing Domain-Driven Design*](https://www.informit.com/store/implementing-domain-driven-design-9780133039894). Addison-Wesley, 2013.
- Michael Feathers — [*Working Effectively with Legacy Code*](https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055). Prentice Hall, 2004.
- Martin Fowler — [*Refactoring*, 2nd ed.](https://www.informit.com/store/refactoring-improving-the-design-of-existing-code-9780134757599) Addison-Wesley, 2018.
