# Course 2: Architecture Styles for the Cloud Era

> A style is not a destination; it is a bet about which changes will come.

## Welcome

Course 1 left Encore with characteristics, components, and a confession: we do not yet know the system's overall *shape*. This course supplies the vocabulary of shapes — the architecture styles — and, more importantly, the judgment to choose among them. A style is the largest decision you will make about a system: it fixes how components are packaged, how they communicate, and which characteristics come cheap versus at ruinous expense.

Be warned about how this catalog is taught. Every style here is presented with its costs attached, because a style catalog without prices is a menu without numbers — pleasant to browse, dangerous to order from. And one style receives a rehabilitation long overdue: the monolith. The industry spent a decade treating "monolith" as an insult and has spent the years since quietly paying the bill for that attitude. We will do better: we will treat style selection as an economic decision, made per system, revisited as the business changes.

## Module 1: Foundations of Style Analysis

### Two axes that generate the catalog

Styles look like a zoo until you see the two axes that generate them. First: is the code partitioned *technically* (by layer: presentation, business, persistence) or *by domain* (by business capability: orders, inventory, payments)? Second: does the system deploy as *one unit* or *many*? Cross them and the whole catalog falls into four quadrants:

<pre class="mermaid">
quadrantChart
    x-axis Technical partitioning --> Domain partitioning
    y-axis Monolithic deployment --> Distributed deployment
    quadrant-1 Distributed and domain-partitioned
    quadrant-2 Distributed but technically partitioned
    quadrant-3 Classic monoliths
    quadrant-4 Domain-partitioned monoliths
    Layered: [0.2, 0.25]
    Microkernel: [0.35, 0.3]
    Pipeline: [0.3, 0.15]
    Modular monolith: [0.75, 0.25]
    Service-based: [0.7, 0.65]
    Microservices: [0.85, 0.9]
    Event-driven: [0.6, 0.85]
    Space-based: [0.4, 0.8]
</pre>

*Figure 1 — The style catalog on its two generating axes. Notice the crowded and lonely corners: distributed-but-technically-partitioned (top left) is nearly empty because it is nearly always a mistake — services sliced by layer must all change together, giving you distribution's costs with none of its benefits.*

That empty quadrant is not hypothetical; the industry built it at scale in the 2000s and named it Service-Oriented Architecture. Orchestration-driven SOA sliced systems into technical strata — service buses, orchestration engines, "business services" shared by everything — and produced systems where changing one business feature meant coordinating five teams and a middleware committee. We will not study SOA; we will remember it, the way sailors remember a reef. Its lesson survives in one sentence: *partition by domain, or every change becomes a negotiation.*

### Reading a style's price tag

Each style in this course comes with characteristic ratings — one to five stars for deployability, elasticity, fault tolerance, simplicity, cost, and evolvability. Treat the stars the way you treat a used-car listing: honest about relative differences, silent about your particular situation. The ratings become decisions only when joined to *your* driving characteristics from Course 1. And underneath every distributed rating lurk the eight fallacies of distributed computing — the network is *not* reliable, latency is *not* zero, bandwidth is *not* infinite — which we will meet properly in Course 4. For now, one rule: every arrow that crosses a process boundary in your diagrams is a place where physics collects rent.

**Recap.** Two axes — partitioning and deployment — generate the catalog. Domain partitioning is the great lesson of the SOA failure. Ratings are relative prices, priced in your characteristics.

**Exercise 1.1.** Place the last three systems you worked on in Figure 1's quadrants. If any sat in the top-left, estimate what it cost.

## Module 2: Monolithic Styles Done Right

### The layered default and its sinkhole

The layered monolith — presentation atop business atop persistence — is where most systems begin, and for good reason: it matches how teams think when there is one team. Its ratings are honest: simplicity ★★★★★, cost ★★★★★, elasticity ★★, evolvability ★★. Its characteristic disease is the *architecture sinkhole*: requests that tunnel through layers without any layer doing work — a presentation call that passes through a business facade that calls a persistence method that runs one query. When most of your requests are sinkholes, the layers are ceremony, not architecture.

### The modular monolith: one deployment, real boundaries

The style this decade rehabilitated. A modular monolith partitions by *domain* — modules for Catalog, Orders, Inventory — inside one deployable. Each module owns its tables; modules talk through declared interfaces; the compiler and the build system enforce what a network would otherwise enforce, at nanosecond latency and zero operational cost.

The hard question is enforcement, because a monolith's modules are one careless import away from becoming a tangle. This is where Course 1's fitness functions become concrete:

| Boundary rule | Enforced by |
|---|---|
| Module A may not import module B's internals | dependency-analysis test in CI (fails the build) |
| No module reads another module's tables | schema ownership + SQL lint in CI |
| No dependency cycles between modules | cycle-detection fitness function |
| Public module APIs are explicit | build-system visibility (exported packages only) |

*A modular monolith without automated boundary enforcement is a regular monolith with better intentions.*

### Microkernel and pipeline: shapes for specific problems

Two more monolithic styles earn their keep in narrower niches. The **microkernel** — a minimal core plus plug-ins — fits products whose essence is extension: IDEs, browsers, payment processors with per-country rules, anything with a marketplace of add-ons. The **pipeline** — filters connected by pipes — fits transformation-shaped work: ETL, media processing, compiler-like flows. Recognize the shape of your problem in the shape of the style; forcing a marketplace product into layers, or a workflow product into plug-ins, is how architectures fight their own domains.

**Recap.** Layered is a fine start and a poor destiny; watch for sinkholes. The modular monolith gives domain partitioning without distribution — if and only if boundaries are enforced by machines, not intentions. Microkernel and pipeline are precision tools.

**Exercise 2.1.** Sketch Encore's eight components (Course 1, Module 3) as modules of a modular monolith. Which two module boundaries would you enforce first, and with what check?

## Module 3: Distributed Styles

### Service-based: the pragmatic middle

Service-based architecture splits the system into a handful of coarse domain services — typically four to twelve — usually sharing one database. It is the most underrated style in the catalog: you gain independent deployment of major domains and meaningful fault isolation while keeping one database's consistency and one ops team's sanity. Elasticity ★★★, deployability ★★★★, cost ★★★★, data consistency ★★★★★ — a remarkably balanced card, and very often the *correct* first distributed step.

### Microservices: maximum decoupling, maximum invoice

Microservices push domain partitioning to its limit: many small services, each owning its data, each independently deployable. Every rating that concerns independence goes to five stars — and simplicity and cost drop to one. The style's real prerequisite is not technical but organizational: many teams that need to move without coordinating. Nine people do not have coordination problems worth this price. This is a two-sentence preview of an entire course (Course 5); for now, hold one heuristic: *microservices solve a scaling problem you measure in teams, not in requests per second.*

### Event-driven and space-based: styles for motion and spikes

Event-driven architecture makes *events*, not calls, the connective tissue: producers announce facts, consumers react, nobody waits for anybody. Its two topologies split on control: **broker** (events flow peer-to-peer through channels; maximal decoupling, hazy visibility of the whole) versus **mediator** (a coordinator drives the workflow; visibility and control, at the cost of a smart hub). Fault tolerance and elasticity soar; reasoning about *"what happens after X"* becomes archaeology. Course 6 is devoted to doing this well.

Space-based architecture attacks the database bottleneck directly: processing units keep working state in replicated in-memory grids, and the database becomes an eventually-updated system of record. It exists for one situation — extreme, spiky, write-heavy load (flash sales, auctions, betting) — and its price is the hardest data-consistency reasoning in the catalog.

### The styles, side by side

| | Layered | Modular monolith | Service-based | Microservices | Event-driven | Space-based |
|---|---|---|---|---|---|---|
| Deployability | ★★ | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★ |
| Elasticity | ★★ | ★★ | ★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| Fault tolerance | ★ | ★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ |
| Simplicity | ★★★★★ | ★★★★ | ★★★ | ★ | ★★ | ★ |
| Cost | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★ | ★★ |
| Data consistency | ★★★★★ | ★★★★★ | ★★★★★ | ★★ | ★★ | ★★ |

*Figure 2 — Relative ratings. Read columns, not cells: no column is all stars, which is the first law wearing a table.*

**Recap.** Service-based is the balanced middle; microservices buy team-scale independence at maximum operational price; event-driven buys decoupling at the price of visibility; space-based buys spike survival at the price of consistency reasoning.

**Exercise 3.1.** Using Figure 2 and Encore's seven characteristics from Course 1, eliminate three styles for Encore *before* reading Module 4. Write one sentence per elimination.

## Module 4: Choosing and Evolving a Style

### The decision, worked honestly

Style selection is Course 1's method at maximum stakes. Line up the drivers: **domain shape** (how many naturally separate capabilities?), **team topology** (how many teams must move independently?), **operational maturity** (who carries the pager, and how good are they?), **characteristic outliers** (which components need radically different ratings?), and **cost ceiling**.

Run Encore through them. Nine engineers — one team, so microservices solve a problem Encore does not have. Modest steady traffic — so space-based is a mortgage on a house Encore doesn't own. But one characteristic outlier glares: the on-sale spike. Sale Gate needs elasticity ★★★★★ while the rest of the system needs ★★.

And here is the insight that makes this module worth its tuition: *a style decision need not be singular.* The unit of style is the deployment quantum, not the company. Encore's defensible answer:

<pre class="mermaid">
flowchart LR
    subgraph mono["Encore modular monolith — one deployment"]
        cat[Catalog] --- ord[Order]
        ord --- inv[Seat Inventory]
        ord --- pay[Payment Integration]
        cat --- ana[Sales Analytics]
    end
    gate["Sale Gate<br/><small>separately deployed,<br/>scales to the spike</small>"] -- admits fans at a sustainable rate --> mono
    bot["Bot Screening"] --- gate
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class gate,bot hot
</pre>

*Figure 3 — Encore's chosen shape: a modular monolith for the steady majority, with the elasticity outliers extracted and scaled independently. The style decision followed the characteristic outlier — not a trend.*

The ADR almost writes itself, and its consequences row is honest: Encore accepts a network boundary (and its fallacies) in exactly one place, in exchange for scaling one component 500× without paying to scale eight.

### Styles are bets; hedge them

Every style is a bet about which changes will come. Bets should be hedged: keep domain boundaries clean *inside* whatever you build (a modular monolith decomposes into services along its module seams in months; a tangled one, in years); automate the boundary checks so the option stays open; and re-run the style decision when its inputs change — team count doubling, an outlier characteristic appearing, an acquisition. The migration path monolith → modular monolith → service-based → (maybe) microservices exists precisely so that each step is paid for by the pressure that demands it.

> **The résumé trap.** The most common style-selection error is optimizing for the architect's next job instead of the business's next year. If your justification cites companies a thousand times your size, you are not doing architecture; you are doing cosplay.

**Recap.** Drivers: domain shape, team topology, ops maturity, outliers, cost. Style is chosen per deployment quantum — extract the outlier, not the org chart. Keep boundaries clean so today's style doesn't foreclose tomorrow's.

**Exercise 4.1.** Write Encore's style ADR (Figure 3) in the Course 1 format. The consequences row must name at least two real losses.

## Module 5: Style Selection Katas

Three briefs, three different correct answers — that is the point. For each: driving characteristics (≤ 7), chosen style(s) per quantum, a Figure-3-grade diagram, and one ADR.

> **Kata A: "Ledgerline."** B2B invoicing SaaS. 40,000 small-business customers, steady daytime load, five-person team, revenue depends on being *boringly* reliable. Finance-grade consistency. The CTO's phrase: "we sell trust, not fireworks."

> **Kata B: "Pulse."** Live audience-reaction app for TV shows. Zero traffic 20 hours a day; two million concurrent users for 90 seconds when a host says "vote now." Twelve engineers. Losing 2% of votes is acceptable; being slow is fatal.

> **Kata C: "Argus."** Analytics product ingesting retail sensor feeds continuously; customers run heavy ad-hoc queries each morning. Data volume grows 10× yearly; the ingest must never pause. Twenty engineers in three teams.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Arbitration | Did the characteristics — not the ratings table alone — decide? |
| Quantum thinking | Were outliers extracted rather than the whole system upgraded? |
| Economics | Does the ops bill fit the team that pays it? |
| The stress test | Halfway through, each brief doubles its team and adds one characteristic (announced in the exercise notes). Does your style survive, or did you bet everything on stillness? |

### Where you now stand

You can name the shapes, price them, and choose one per quantum with the characteristics as arbiter. What you cannot yet do is draw the *internal* boundaries that make any of these styles work — where one module ends and the next begins, and why. That is a question about the business itself, and it has a discipline: Course 3, domain-driven design.

## References

- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) O'Reilly, 2025.
- Neal Ford, Rebecca Parsons, Patrick Kua, Pramod Sadalage — [*Building Evolutionary Architectures*, 2nd ed.](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/) O'Reilly, 2022.
- Mark Richards — [*Software Architecture Patterns*, 2nd ed.](https://www.oreilly.com/library/view/software-architecture-patterns/9781098134280/) O'Reilly, 2022.
- Martin Fowler — [*Patterns of Enterprise Application Architecture*](https://www.informit.com/store/patterns-of-enterprise-application-architecture-9780321127426). Addison-Wesley, 2002.
