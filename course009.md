# Course 9: Data Architecture — From Distributed Data to Data Mesh

> Code is what a system does; data is what it knows. Split the doing, and the knowing demands a constitution.

## Welcome

Decomposition, this specialization has repeatedly promised, sets teams free. Data is where the promise gets audited. The moment Course 5 made every service's database private, three old comforts died quietly: the cross-domain `JOIN`, the all-embracing transaction, and the analyst's beloved "one big database where everything lives." Encore's teams now ship independently — and the finance report that once was one query is suddenly a distributed-systems problem with a deadline.

This course rebuilds data architecture for the decomposed world, in two movements. First, the *operational* half: who owns which data, how services answer joined-up questions without re-coupling, and what replaces the transactions we gave up. Second, the *analytical* half: why the centralized warehouse pipeline breaks at organizational scale, and how the data mesh — domain ownership, data as a product, self-service platform, federated governance — applies this specialization's own logic to analytics. The through-line: every data problem here is an *ownership* problem before it is a technology problem.

## Module 1: Data Ownership in Distributed Systems

### One writer per table, and the three hard cases

The baseline rule is Course 3's aggregate discipline at fleet scale: **every table has exactly one owning service; only the owner writes.** Reads are negotiable (Module 2); writes never are — a table with two writers is two services sharing one undeclared contract, deployable only together. Real domains produce three ownership shapes: **single** (Catalog owns events — trivial, and most of your data), **common** (everyone "needs" audit records — solve with one owning service and an API, or events into an owned store; never a shared table), and **joint** — two services legitimately claiming one concept, the genuinely hard case. Encore's: who owns a *sale*? Orders (the workflow) and Finance (the ledger) both have claims. The senior resolution is usually a **split by meaning**: the *sale-as-process* belongs to Orders; the *sale-as-accounting-fact* belongs to Finance, populated by `SaleCompleted` events. One word, two models, two owners — Course 3's bounded-context lesson, now applied to storage.

### What replaced the transaction

For workflows spanning owners, Course 5's sagas carry the how; this module adds the *consistency patterns* underneath, in rising order of decoupling: **background sync** (batch reconciliation — Encore's nightly finance close; embarrassingly effective), **orchestrated** (the saga's explicit process), and **event-based** (owners react to facts — the default for propagation). And one pattern to refuse: two-phase commit across services. 2PC buys atomicity by making every participant hostage to the slowest and the deadest; in a world of independent deploys and Course 4 physics, it converts partial failure into total unavailability — the trade running exactly backward.

> **Eventual consistency is a business conversation, not an apology.** "The dashboard trails reality by up to a minute" is a *requirement statement* the business can price. Course 4 taught the spectrum; this module's job is pinning each cross-owner flow to a rung — with the stakeholder's signature, not the engineer's guess.

**Recap.** One writer per table, always; common data gets an owner, joint data gets split by meaning. Sagas, events, and humble batch replace 2PC, which is refused on principle. Staleness is negotiated with the business, per flow.

**Exercise 1.1.** Find a table (or concept) in your world with two writers. Split it by meaning: name the two models, their owners, and the event that connects them.

## Module 2: Distributed Data Access

### Answering questions nobody owns

The fan's account page needs orders + tickets + refund status: three owners, one screen. The access menu, priced:

| Pattern | Mechanism | Freshness | Bill |
|---|---|---|---|
| **API composition** | call each owner, join in the BFF | live | latency stacks (Course 4 tails); fine for 2–3 owners |
| **Replicated read model** | subscribe to owners' events, keep a local copy shaped for your queries | seconds-stale | you now run a projection (Course 6's CQRS, cross-service) |
| **Data domain / shared read store** | several services share a *read-only* store fed by owners | seconds-stale | shared schema governance returns |
| **CDC-fed cache** | change-data-capture streams into a query store | seconds-stale | pipeline to operate; schema coupling to guard |

*Figure 1 — The access menu. Composition for screens, replicated read models for query-heavy needs, CDC for eventifying the reluctant. The pattern that is missing is the point: reaching into another service's tables — reads today become joins tomorrow become "why can't they change their schema" forever.*

The load-bearing idea is the middle rows: **the query moves to a copy shaped for it, and the copy is fed by contracts** (events, CDC-with-published-schema), never by trespass. Encore's account page: a replicated read model in the Fan-BFF's keeping, subscribed to three owners' streams — page loads in one query, owners evolve freely, staleness declared at "seconds," signed off by product.

**Recap.** Cross-owner questions get copies fed by contracts: composition for shallow joins, projections for deep ones, CDC for legacy. Direct foreign reads are the coupling you'll regret at the next schema change.

**Exercise 2.1.** Take your product's heaviest cross-domain screen. Which row of Figure 1 serves it today? Which *should* — and what contract would feed the copy?

## Module 3: Analytical Architectures

### The pipeline that breaks at org-scale

Analytics has its own architectural lineage: the **warehouse** (structured, governed, SQL truth), the **lake** (everything raw, schema-on-read, cheap), and the **lakehouse** (open table formats bringing warehouse discipline to lake storage — the current default). Any of them can store Encore's data. What breaks at scale is not storage but the *operating model* wrapped around it: a central data team extracting from every domain's databases through pipelines they must maintain but whose sources they don't control. Every upstream schema change breaks a pipeline the domain team never sees; every new question queues behind a team that understands the tables but not the ticketing business. The central team becomes what Course 5 called the coordination machine — a monolith made of ETL. Two structural repairs precede any mesh talk: **streaming analytics** (Course 6's backbone feeding dashboards continuously — the nightly CSV was a batch apology for missing events) and **data contracts** — published schemas with compatibility guarantees on every analytical feed, turning "your change broke finance's dashboard" from a Friday surprise into a failed CI check on the *producer's* build. Contracts move breakage to where the knowledge lives; that principle is about to become a whole architecture.

**Recap.** Lakehouse is the storage default; the real failure is organizational — central pipelines coupling to schemas they don't own. Streaming feeds and producer-side contracts are the repairs that scale.

**Exercise 3.1.** Trace one dashboard at your work back to its sources. How many schema changes away is its breakage, and who finds out first — the changer or the dashboard's owner?

## Module 4: Data Mesh

### The specialization's own logic, applied to analytics

Read the mesh's four principles as this course's greatest hits reassembled: **domain ownership** (the ticketing team owns ticketing's analytical data — Conway, Course 3); **data as a product** (streams with owners, contracts, SLOs — Course 6, Module 5, now with discoverability and documentation); **self-service platform** (domains can't each build lakehouse plumbing — a platform makes publishing a data product as easy as deploying a service; Course 14's thesis, arriving early); **federated computational governance** (global rules — privacy, identifiers, quality metadata — enforced *as code in the platform*, not as a committee's memos; Course 5's paved road, data edition).

A data product, concretely, is not a table with good intentions:

<pre class="mermaid">
flowchart LR
    subgraph dp["Data product: ticket-sales (owner: Ticketing team)"]
        direction TB
        code["Transformation code"] --> ports
        subgraph ports["Output ports"]
            s["stream: sales events"]
            t["table: daily aggregates"]
        end
        meta["Contract · SLOs · lineage · docs"]
    end
    src[["Operational events<br/>(Course 6 backbone)"]] --> code
    ports --> bi([Dashboards]) & ds([Data science]) & fin([Finance close])
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class dp hot
</pre>

*Figure 2 — Anatomy of a data product: code, ports, and contract travel together under one owner. Consumers subscribe to ports; nobody subscribes to somebody's tables. The unit of analytical architecture stops being "the warehouse" and becomes this.*

Honesty clause, as always: the mesh is an org-scale answer to an org-scale problem. Encore at nine teams adopts the *principles* — contracts, product thinking, two or three real data products — without the full federated apparatus. The mesh's machinery is bought the way microservices were in Course 5: with measured coordination pain, prerequisites first.

**Recap.** Mesh = ownership + product discipline + platform + governance-as-code — decomposition's logic reaching analytics. The data product (code + ports + contract, one owner) is the new unit. Adopt principles at any scale; buy machinery with pain.

**Exercise 4.1.** Sketch Figure 2 for the most-asked-about data in your company: owner, ports, contract, first three subscribers. What committee does this diagram dissolve?

## Module 5: The Self-Service Data Platform

The mesh stands or falls on its platform plane — and so does Course 12. What domains must be able to do *without tickets*: declare a product (scaffold, registry entry, catalog listing), publish ports (stream + table from one definition), inherit governance (PII detection, retention, access policies applied by the platform, not by memory), and observe (freshness, quality, lineage dashboards for free). This is Course 14's golden-path pattern with data-shaped paving stones — build it once, and the third data product costs a sprint instead of a quarter.

The closing bridge is the reason this module exists: **AI eats from here.** Course 12's feature pipelines and retrieval corpora are *consumers of data products* — demand forecasting subscribes to `ticket-sales`; the support assistant's RAG corpus is built from the `support-cases` product, inheriting its contract, lineage, and access rules. Teams that skipped this course's discipline meet it again as "why does the model train on stale, unowned, permission-less data" — the same lesson at a higher invoice.

**Recap.** The platform makes the right data behavior the cheap behavior: declare, publish, inherit, observe. AI systems are data-product consumers; their quality is bounded by this module.

**Exercise 5.1.** List the manual steps between "team has valuable data" and "another team uses it safely" at your company. Each step is either platform backlog or permanent tax.

## Kata: The Freight Ledger

> **Your brief: "Cargo."** A freight forwarder, 14 years old: one Oracle schema, 1,100 tables, a 22-person central data team drowning in 400 nightly ETL jobs. Domains: bookings, customs, fleet, billing. Fresh pain: billing disputes need booking + customs + GPS history joined within minutes (today: next morning); a new ML team wants two years of clean movement history; customs data is per-country restricted (Course 7's Atlas would nod); and the CFO has banned "another warehouse rewrite."

**Deliverables:**

1. **Ownership map** — the four domains' data, three joint-ownership conflicts resolved by split-by-meaning.
2. **Operational access design** — the dispute screen served by Figure 1's menu, with declared staleness and its business sign-off.
3. **Two data products** — Figure-2 anatomy for `shipment-movements` and `customs-status`, including the per-country access rule *as platform-enforced policy*.
4. **Migration path** — from 400 ETL jobs toward contracts and products without a big bang: first two pipelines strangled, producer-side CI contracts introduced where.
5. **One ADR** — "why the central data team becomes a platform team," losses included.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Ownership first | Is every technology choice downstream of a named owner? |
| Contract placement | Does producer CI, not consumer mornings, catch breakage? |
| Regulated data | Is the country restriction enforced in the platform, or in hope? |
| No big bang | Could the CFO stop funding at any month and keep the value shipped so far? |

### Where you now stand

Data now has owners, contracts, products, and a platform to serve them — and twice this course leaned on rules like "per-country access, enforced as code" while deferring the discipline behind them. That discipline is next. Course 10 draws the trust boundaries, threat-models the flows you've built across eight courses, and makes security what it must be in the cloud era: an architectural characteristic with fitness functions, not a questionnaire at the end.

## References

- Adam Bellemare — [*Building an Event-Driven Data Mesh*](https://www.oreilly.com/library/view/building-an-event-driven/9781098127596/). O'Reilly, 2023.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Ian Gorton — [*Foundations of Scalable Systems*](https://www.oreilly.com/library/view/foundations-of-scalable/9781098106058/). O'Reilly, 2022.
