# Software Architecture in the AI & Cloud Era

*The road to platform architecture.*

<small>© 2026 Oleksiy Pylypenko · Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — share and adapt freely, non-commercially, with attribution. Source on [GitHub](https://github.com/oleksiyp/arch-book).</small>

## Preface

Code has never been cheaper to produce, and coherence has never been more expensive. The tools of our era generate implementations faster than any of us can type — and in doing so they quietly raise the price of the one thing they cannot generate: judgment. Which trade-off, for which quality, at what cost, written down where the next person can find it. Systems fail at the seams, and seams are drawn by judgment. That judgment — the working knowledge of a senior architect, from first sketch to company-wide platform — is what this book sets out to teach.

This is a book of decisions, not technologies. Frameworks age like fish; the decisions underneath them age like wine, and every chapter is built around them: how to hear quality attributes inside business sentences, where to draw boundaries a reorganization will respect, what a network really costs, when events beat calls, how to promise an API to strangers, what security means when the perimeter is gone, what a model-backed component does to testing, and why everything converges on platforms — systems whose users are other engineering teams.

One deliberate omission: you will find no UML here, no enterprise service buses, and no pretense that architecture is a phase that ends. Diagrams are code, decisions are records, and architecture is a stream of trade-offs made under uncertainty, recorded honestly, and revisited without shame.

## How to Read This Book

One company accompanies you through all fourteen chapters: **Encore**, a startup selling concert tickets — small enough to hold in your head, treacherous enough to be interesting. Encore begins with nine engineers and a terrifying traffic spike, and ends, four hundred engineers later, running its own platform. Every concept lands on Encore before it is generalized.

Each chapter closes with a **kata**: a practice brief for a *different* company, deliberately smaller than Encore, with a rubric of questions to ask yourself. Exercises punctuate every section: short, concrete, best done against a system you actually know. References at each chapter's end point to the books this field considers canonical; entries marked *free online* cost only attention.

## The Arc

**Foundations (Chapters 1–3):** how architects think — trade-offs, characteristics, modern styles, domain-driven boundaries.

**The distributed core (Chapters 4–9):** the technical backbone — distributed systems, microservices, events and streaming, APIs, user interfaces, data.
{: .flush}

**The modern era (Chapters 10–12):** security and zero trust, cloud-native operations and SRE, AI systems.
{: .flush}

**The destination (Chapters 13–14):** multi-tenant SaaS, and platform engineering — where everything converges, and where the capstone awaits.
{: .flush}

## Contents

1. [Foundations of Modern Software Architecture](#ch1)
2. [Architecture Styles for the Cloud Era](#ch2)
3. [Domain-Driven Design and System Decomposition](#ch3)
4. [Distributed Systems Foundations for Architects](#ch4)
5. [Microservices — Building, Operating, Succeeding](#ch5)
6. [Event-Driven Architecture and Streaming Systems](#ch6)
7. [API Architecture — Contracts, Traffic, and Evolution](#ch7)
8. [UI and Frontend Architecture](#ch8)
9. [Data Architecture — From Distributed Data to Data Mesh](#ch9)
10. [Security Architecture and Zero Trust](#ch10)
11. [Cloud-Native Operations — Serverless, Kubernetes, and SRE](#ch11)
12. [Architecting AI Systems — LLMs, RAG, and Agents](#ch12)
13. [Multi-Tenant SaaS Architecture](#ch13)
14. [Platform Engineering and the Capstone](#ch14)

---

## Chapter 1: Foundations of Modern Software Architecture {#ch1}

> "All architecture is design but not all design is architecture." — Grady Booch


Every discipline has a moment when it stops being a bag of techniques and becomes a way of seeing. For software architecture, that moment comes when you stop asking *"which technology should I use?"* and start asking *"what am I trading away?"* This chapter is about reaching that moment deliberately rather than by scar tissue.

**Encore**, our companion for all fourteen chapters, sells tickets to live concerts — small enough to hold in your head, treacherous enough to be interesting: when a major artist announces a tour, Encore's traffic multiplies five-hundred-fold in minutes; every seat must be sold exactly once; and the bots arrive before the fans do. By the end of the chapter you will have derived Encore's driving characteristics, drawn its first diagrams, and written the decision records that a real team could pick up and build from. Every later chapter repeats this loop at greater depth; here, we learn the loop.

---

### 1.1 What Software Architecture Is Today

#### The building metaphor, and why we must abandon it

For decades we explained software architecture by analogy to buildings: the architect draws, the builders build, the structure stands. It is a comforting story, and almost entirely wrong. Buildings do not double their occupancy overnight because an artist announced a tour. Buildings are not rebuilt every week by the people living in them. The defining property of software is that it is *soft* — and an architecture that ignores this is a monument, not a system.

Modern practice describes an architecture as the combination of four things:

| Dimension | What it captures | Encore example |
|---|---|---|
| **Architectural characteristics** | The "-ilities" the system must exhibit | Survive a 500× on-sale spike |
| **Architectural decisions** | The rules and constraints, with their rationale | "Seat inventory is owned by exactly one service" |
| **Logical components** | The building blocks and their responsibilities | Seat Inventory, Order, Bot Screening |
| **Architectural style** | The overall shape the components live in | To be decided — that's Chapter 2 |

None of the four is optional; a pile of microservices with no recorded decisions is as fragile as a beautiful decision log describing a system nobody built.

#### Architecture and design: a spectrum, not a wall

Where does architecture end and design begin? Nowhere — there is only a spectrum, and every decision sits somewhere along it.

<svg viewBox="0 0 640 120" style="max-width:640px;width:100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="specTitle specDesc">
  <title id="specTitle">The architecture–design spectrum</title>
  <desc id="specDesc">A horizontal gradient bar from "more architectural" (left) to "more design" (right), with markers at: choice of style, sync vs. async, library choice, class naming.</desc>
  <defs>
    <linearGradient id="spec" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f38b1c"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="20" y="45" width="600" height="18" rx="9" fill="url(#spec)"/>
  <text x="20" y="30" font-family="sans-serif" font-size="13" fill="#d97706" font-weight="bold">more architectural</text>
  <text x="620" y="30" font-family="sans-serif" font-size="13" fill="#0b7ecb" font-weight="bold" text-anchor="end">more design</text>
  <line x1="60" y1="63" x2="60" y2="80" stroke="#d97706" stroke-width="2"/>
  <text x="60" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">choice of style</text>
  <line x1="240" y1="63" x2="240" y2="80" stroke="#d97706" stroke-width="2"/>
  <text x="240" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">sync vs. async</text>
  <line x1="420" y1="63" x2="420" y2="80" stroke="#0b7ecb" stroke-width="2"/>
  <text x="420" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">library choice</text>
  <line x1="580" y1="63" x2="580" y2="80" stroke="#0b7ecb" stroke-width="2"/>
  <text x="580" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">class naming</text>
</svg>

*Figure 1.1 — The architecture–design spectrum. Ask three questions of any decision: how strategic is it, how costly to reverse, how significant are its trade-offs? The higher the answers, the further left it sits — and the more it deserves analysis and a written record.*

Choosing between a queue and a topic for Encore's order events? Strategic, hard to reverse once ten consumers depend on it, heavy trade-offs — architectural. Naming the `OrderPlaced` class? Move on with your life.

#### The two laws

Everything in this book rests on two laws, and the first is the closest thing our field has to physics:

> **First Law of Software Architecture.** Everything in software architecture is a trade-off. If you think you have found something that isn't, you haven't yet identified the trade-off.

> **Second Law of Software Architecture.** *Why* a decision was made is more important than *how* it was implemented. The code shows the how; only you can preserve the why.

The first law is why this chapter teaches analysis rather than answers: any book that tells you "microservices are better" (or worse) is selling you half a trade-off. The second law is why Section 1.4 makes you write things down: six months from now, the cleverest design with a forgotten rationale is indistinguishable from a mistake.

#### Meet Encore

Let's establish our running example properly. Encore sells tickets for live events. Fans browse listings, join an on-sale when tickets drop, pick seats, and pay. Event organizers create events and watch sales dashboards. Payments run through an external provider; tickets are delivered to fans' phones.

<pre class="mermaid">
flowchart LR
    fan(["Fan<br/><small>finds events, buys tickets</small>"])
    org(["Organizer<br/><small>creates events, tracks sales</small>"])
    encore["<b>Encore</b><br/>ticketing platform"]
    psp["Payment Provider<br/><small>card processing</small>"]
    wallet["Mobile Wallets<br/><small>ticket delivery</small>"]
    fan -- browses, queues, buys --> encore
    org -- manages events --> encore
    encore -- charges cards --> psp
    encore -- issues tickets --> wallet
    classDef person fill:#1b1f3b,stroke:#1b1f3b,color:#fff
    classDef system fill:#f38b1c,stroke:#f38b1c,color:#fff
    classDef external fill:#eaf2f8,stroke:#7a93a8,color:#1b1f3b
    class fan,org person
    class encore system
    class psp,wallet external
</pre>

*Figure 1.2 — Encore's system context: two kinds of users, two external dependencies, one system whose insides we haven't decided yet. Notice how much this diagram refuses to say — that restraint is deliberate, and Section 1.4 explains it.*

#### The architect, then and now

The architect of the old caricature sat above the team, produced documents, and departed before the consequences arrived. The modern architect is embedded — close enough to the code to feel their decisions, senior enough to own trade-offs that span teams — and increasingly thinks in *platforms*: systems whose users are other engineering teams. That idea is this book's destination; keep it in peripheral vision.

**Recap.** Architecture = characteristics + decisions + components + style. Architecture and design differ by degree (strategy, reversibility, significance of trade-offs), not kind. Everything is a trade-off; the *why* outlives the *how*.

**Exercise 1.1.** Take a system you know. Write down one decision from it that sits at the far architectural end of the spectrum and one from the far design end. For the architectural one: what was traded away?

---

### 1.2 Architectural Characteristics

#### The vocabulary of "-ilities"

Requirements tell you what a system must *do*. Architectural characteristics tell you what it must *be* — available, scalable, secure, testable, affordable. They are the dimensions along which architectures succeed or fail, and they come in four families:

| Family | Concern | Examples |
|---|---|---|
| **Operational** | How the system behaves while running | availability, elasticity, performance, recoverability |
| **Structural** | How the code sustains change | modularity, maintainability, testability, deployability |
| **Process** | How teams and the system co-evolve | agility, upgradeability, learnability |
| **Cross-cutting** | Constraints spanning everything | security, privacy, accessibility, cost, sustainability |

Two of these deserve a modern emphasis the older literature underplays. **Security** is a first-class characteristic from day one — bolting it on later is how breaches are architected. **Cost** is likewise a characteristic, not an accounting afterthought: in the cloud, every architectural decision has a monthly invoice attached.

#### Listening for characteristics

Nobody will hand you a list. Characteristics hide inside business sentences, and the architect's first skill is translation. Listen to Encore's founders:

| The founders say... | The architect hears... |
|---|---|
| "When a top artist drops tickets, traffic is 500× normal for ten minutes." | **Elasticity** — not just scale, but *speed* of scaling |
| "If we're down during an on-sale, it's front-page news." | **Availability**, precisely when load is worst |
| "We can never sell the same seat twice." | **Data integrity** — consistency where it counts |
| "Bots buy out shows before real fans get in." | **Security** and *fairness* — a composite worth naming |
| "We're a team of nine and we ship weekly." | **Deployability**, **testability**, **simplicity** |
| "Margins are thin; the platform can't eat them." | **Cost** as a standing constraint |

Notice what did *not* make the list. Nobody asked for "portability across cloud providers." Nobody needs the seat map to render in 4 ms. An implicit characteristic you invent without a driver is not diligence — it is overengineering with better manners.

#### The discipline of choosing few

Here is the uncomfortable arithmetic: every characteristic you commit to trades against the others. Optimize for elasticity and you complicate testability. Chase five nines and cost explodes. A system designed to exhibit twenty characteristics exhibits none of them well — this is the first law compounding.

The working discipline: **pick the seven or fewer that would sink the business if missed**, and let the rest be merely adequate. For Encore: elasticity, availability-under-peak, data integrity, security/fairness, deployability, cost, observability. Everything else — internationalization, portability, offline support — is explicitly *not driving* the architecture, and writing that down is as valuable as the list itself.

One preview: in later chapters these characteristics stop being adjectives and become *fitness functions* — automated checks that continuously verify the architecture still exhibits them. "Survives a 500× spike" will become a load test that runs before every release. Hold that thought; Chapter 14 turns it into a way of governing whole platforms.

**Recap.** Characteristics are the system's *be*, not its *do*. They hide in business sentences; translation is a skill. Security and cost are first-class. Choose ≤ 7 drivers and name what you're *not* optimizing for.

**Exercise 1.2.** Interview a colleague about their product for ten minutes. Extract five candidate characteristics from what they say — then cut two, and defend the cuts.

---

### 1.3 Modularity and Logical Components

#### Thinking in components

Between "the system" and "the classes" lies the level where architecture actually happens: **logical components** — named building blocks with responsibilities, independent of how they will be deployed. Getting these right matters more than any technology choice, because component boundaries become team boundaries, deployment boundaries, and eventually — if you decompose — service boundaries. Sections 1.2 and 1.3 are two halves of one motion: characteristics tell you what the system must be; components give you the shape that can be it.

How do you find them? Two complementary techniques:

**The workflow approach** walks the system's main journeys and names what each step needs. A fan's on-sale journey: browse the catalog → join the queue when sales open → pass the bot check → pick seats → pay → receive the ticket.

**The actor/action approach** lists each actor and what they do, then groups the actions. Organizers create events and watch dashboards; fans do everything in the journey above; the payment provider calls back with results.

Run both and a component set precipitates:

| Component | Responsibility | Driven by |
|---|---|---|
| Event Catalog | Listings, search, event details | availability (read-heavy) |
| Sale Gate | Admission control during on-sales: queueing, fairness | elasticity, fairness |
| Bot Screening | Distinguishing fans from scripts | security |
| Seat Inventory | The single source of truth for seat state | data integrity |
| Order | The purchase workflow, start to finish | data integrity |
| Payment Integration | Talking to the provider, handling callbacks | recoverability |
| Notification | Tickets to wallets, emails to fans | (deliberately modest) |
| Sales Analytics | Organizer dashboards | cost (isolate the load) |

<pre class="mermaid">
flowchart LR
    fan([Fan]) --> cat[Event Catalog]
    fan --> gate[Sale Gate]
    gate --> bot[Bot Screening]
    gate --> seats[Seat Inventory]
    seats --> order[Order]
    order --> pay[Payment Integration]
    order --> notif[Notification]
    order -. sales facts .-> analytics[Sales Analytics]
    org([Organizer]) --> cat
    org --> analytics
</pre>

*Figure 1.3 — Encore's first-cut logical components. Solid arrows are the purchase path; the dotted arrow hints that analytics should learn about sales without sitting inside the sale — a distinction that will matter enormously in Chapters 4 and 6.*

Look at how the characteristics shaped the cut. Sale Gate exists as a separate component *only because* of the 500× spike — a calmer business would fold it away. Seat Inventory is small and lonely *because* data integrity wants one owner for seat state. The component diagram is the characteristics list, drawn.

> **The entity trap.** The seductive wrong turn is to name components after database nouns: User Manager, Event Manager, Ticket Manager. Entities are what a system *stores*; components are what a system *does*. An architecture of Managers is a database wearing a trench coat — and every workflow will smear across all of them.

#### Coupling, cohesion, and the shape of change

Two old words measure whether your boundaries are good. **Cohesion**: do the things inside a component belong together? **Coupling**: how many other components feel it when one changes? The practical test is the *shape of change*: a good boundary means a typical business change lands inside one component; a bad boundary means every change is a committee meeting. When Encore adds "presale codes for fan clubs," that should touch Sale Gate and little else. If it touches five components, the boundaries — not the developers — are at fault.

Finally, keep logical and physical architecture distinct in your mind. These eight components might deploy as one process, three, or eight — that is a *separate decision*, with its own trade-offs, made in Chapter 2 and revisited for the rest of the book. Fusing "component" with "service" in your head is how systems end up with a network call inside every function.

**Recap.** Components are found through workflows and actor/actions, shaped by characteristics, and named for behavior, not data. Judge boundaries by the shape of change. Logical structure and physical deployment are different decisions.

**Exercise 1.3.** Encore adds gift cards. Which components change? If your answer exceeds two, propose a better boundary.

---

### 1.4 Communicating Architecture — C4 and ADRs

#### Diagrams that respect their readers

An architecture that lives in your head is a rumor. The modern standard for drawing systems is the **C4 model** — four zoom levels, each answering one question for one audience:

| Level | Name | Answers | Audience |
|---|---|---|---|
| 1 | System Context | What is this, and what does it touch? | everyone, including non-technical |
| 2 | Container | What are the deployable pieces? | engineers, ops, security |
| 3 | Component | What lives inside each piece? | the owning team |
| 4 | Code | How is a component built? | rarely worth drawing — it rots fastest |

Figure 1.2 was a Level 1; Figure 1.3 sketches Level 3 territory. The genius of C4 is what each level *omits*: the context diagram doesn't know what a queue is, and the container diagram doesn't know class names. Every element a diagram omits is a promise it keeps forever — recall how little Figure 1.2 dared to claim.

Three habits separate diagrams that communicate from diagrams that decorate. **Title every diagram with a question it answers** ("How does a fan's payment flow?"), and delete anything not helping answer it. **Label arrows with verbs** — an unlabeled arrow between Order and Payment could mean five different things, four of which will be assumed by somebody. **Keep diagrams as code** (Mermaid, Structurizr) so they live in the repository, diff in reviews, and update with the system instead of fossilizing in a wiki.

#### Decisions that survive their authors

The second law says the *why* is the most valuable artifact. The **Architecture Decision Record** is how you keep it — a one-page document, numbered and immutable:

| Section | Encore's ADR-007 |
|---|---|
| **Title** | Virtual waiting room in front of seat selection |
| **Status** | Accepted |
| **Context** | On-sales bring 500× traffic in minutes. Direct load would down Seat Inventory exactly when availability matters most. Fans expect fairness; bots try to skip lines. |
| **Decision** | All on-sale traffic passes through a queue-based waiting room (Sale Gate) that admits users at Seat Inventory's sustainable rate. |
| **Consequences** | Fans wait (mitigated: honest queue position). Sale Gate is a new critical path — it alone must handle raw spikes. Gains: Seat Inventory sized for admitted flow, not peaks; a single fairness point; a natural place for bot screening. |
| **Governance** | Pre-release load test replays the worst on-sale ×2; alert if p99 admission latency exceeds budget. |

Read the consequences row again — it lists what is *lost*, in ink. An ADR that admits no losses is advertising, and by the first law it is also lying. This honesty compounds: ADRs are never edited to look right in hindsight. A reversed decision gets a new ADR that supersedes the old one, and the old one becomes the fossil record that stops teams from re-arguing settled questions — or from repeating errors whose reasoning nobody remembered.

<pre class="mermaid">
stateDiagram-v2
    [*] --> Proposed : written, under review
    Proposed --> Accepted : team agrees
    Proposed --> Rejected : with reasons — still worth keeping!
    Accepted --> Superseded : new ADR replaces it
</pre>

*Figure 1.4 — An ADR's life. Even rejected records earn their keep: "we considered sharding and declined, here's why" saves the next person a week.*

And the same decision reads differently on different floors: engineers get the ADR; executives get one sentence of outcome and risk ("fans will queue briefly so the site cannot crash during our biggest sales moments"). Writing both is not spin; it is translation, and it is the architect's job.

**Recap.** C4 gives four zoom levels; power comes from what each omits. Diagrams live in the repo as code, titled with questions, arrows labeled. ADRs preserve the why, admit their losses, and are superseded rather than rewritten.

**Exercise 1.4.** Write the ADR for a decision your team made and never recorded. Show it to whoever argued the other side — the consequences row isn't done until they agree it's fair.

---

### 1.5 Trade-Off Analysis in Practice

#### Anatomy of a trade-off

Time to practice the first law deliberately. When a fan completes a purchase, three things must learn about it: Notification (send the ticket), Sales Analytics (update dashboards), and Bot Screening (learn purchase patterns). Should Order tell each consumer through dedicated **queues**, or publish once to a shared **topic**?

<pre class="mermaid">
sequenceDiagram
    participant O as Order
    participant Q1 as notif.queue
    participant Q2 as analytics.queue
    participant Q3 as fraud.queue
    Note over O,Q3: Option A — a queue per consumer
    O->>Q1: OrderPlaced (ticket fields)
    O->>Q2: OrderPlaced (stats fields)
    O->>Q3: OrderPlaced (risk fields)
</pre>

<pre class="mermaid">
sequenceDiagram
    participant O as Order
    participant T as orders.topic
    Note over O,T: Option B — one topic, many subscribers
    O->>T: OrderPlaced (one shared schema)
    T-->>Notification: subscribe
    T-->>Analytics: subscribe
    T-->>BotScreening: subscribe
</pre>

*Figure 1.5 — Two honest options. Neither is wrong; that's what makes it architecture.*

| Concern | Queues (A) | Topic (B) |
|---|---|---|
| Adding a fourth consumer | Order must change | just subscribe — Order never knows |
| Payload discipline | tailored per consumer | one schema; risk fields leak to all readers |
| Per-consumer monitoring | natural (queue depth each) | needs consumer-group tooling |
| Coupling | Order knows every consumer | consumers invisible to producer |
| Security | need-to-know by construction | broad read access to one stream |

Now — and this is the heart of the method — *return to Section 1.2's characteristics and let them arbitrate*. Encore expects new consumers soon (organizer payouts, a recommendation engine): that favors B. But fairness data in Bot Screening's payload is sensitive, and B shows it to every subscriber: that favors A. A defensible resolution: topic for the broad `OrderPlaced` fact, one dedicated queue for the sensitive risk payload — and an ADR recording exactly why, with the losses in ink. The generic answer does not exist; the *Encore* answer does. Trade-off analysis is not a table of pros and cons — it is pros and cons *weighed by the characteristics you committed to*.

### Kata: Curtain Call

An architectural kata is practice under realistic constraints: a business brief, a time box, and defense of your choices before peers — the closing-kata tradition every chapter of this book follows.

> **Your brief: "Curtain Call."** A regional theater chain (12 venues) wants season subscriptions, seat selection, member presales, and a waitlist for sold-out shows. Two-person engineering team. Modest but loyal traffic — except the annual holiday show, which sells out in an hour. The CFO's phrase: "we cannot afford drama, in either sense."

**Deliverables:**

1. **Driving characteristics** — at most seven, each traced to a sentence in the brief, plus one candidate you explicitly declined.
2. **Logical components** — a table and a diagram, derived by workflow or actor/action. No Managers.
3. **Three ADRs** for your most significant decisions, consequences honest.
4. **A context diagram** in the spirit of Figure 1.2.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Traceability | Does every characteristic point at a sentence in the brief? |
| Boundary quality | Does a typical change land in one component? |
| ADR honesty | Would the losing side of each argument sign the consequences row? |
| Restraint | Curtain Call is not Encore — a design that could serve Ticketmaster has failed the CFO. |

#### Where you now stand

You can hear characteristics inside business sentences, shape components around them, weigh options with the first law, and record the results so they outlive you. What you cannot yet do is name the overall *shape* — whether Encore should be a modular monolith, a service-based system, or something more exotic. That vocabulary of styles, and the judgment of when each fits, is Chapter 2.

---

### References

- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) O'Reilly, 2025.
- Raju Gandhi, Mark Richards, Neal Ford — [*Head First Software Architecture*](https://www.oreilly.com/library/view/head-first-software/9781098134341/). O'Reilly, 2024.
- Jacqui Read — [*Communication Patterns*](https://www.oreilly.com/library/view/communication-patterns/9781098140533/). O'Reilly, 2023.
- John Ousterhout — [*A Philosophy of Software Design*](https://web.stanford.edu/~ouster/cgi-bin/aposd.php). Yaknyam Press, 2021.
- Gregor Hohpe — [*The Software Architect Elevator*](https://www.oreilly.com/library/view/the-software-architect/9781492077534/). O'Reilly, 2020.
- Titus Winters, Tom Manshreck, Hyrum Wright — [*Software Engineering at Google*](https://abseil.io/resources/swe-book). O'Reilly, 2020 — free online.
- David Thomas, Andrew Hunt — [*The Pragmatic Programmer*, 20th Anniversary ed.](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) Addison-Wesley, 2019.

---

## Chapter 2: Architecture Styles for the Cloud Era {#ch2}

> A style is not a destination; it is a bet about which changes will come.


Chapter 1 left Encore with characteristics, components, and a confession: we do not yet know the system's overall *shape*. This chapter supplies the vocabulary of shapes — the architecture styles — and, more importantly, the judgment to choose among them. A style is the largest decision you will make about a system: it fixes how components are packaged, how they communicate, and which characteristics come cheap versus at ruinous expense.

Be warned about how this catalog is taught. Every style here is presented with its costs attached, because a style catalog without prices is a menu without numbers — pleasant to browse, dangerous to order from. One style receives a rehabilitation long overdue: the monolith — the industry spent a decade treating the word as an insult and has been quietly paying for that attitude since. Style selection here is an economic decision, made per system, revisited as the business changes.

### 2.1 Foundations of Style Analysis

#### Two axes that generate the catalog

Styles look like a zoo until you see the two axes that generate them. First: is the code partitioned *technically* (by layer: presentation, business, persistence) or *by domain* (by business capability: orders, inventory, payments)? Second: does the system deploy as *one unit* or *many*? Cross them and the whole catalog falls into four quadrants:

<pre class="mermaid">
quadrantChart
    x-axis Technical partitioning --> Domain partitioning
    y-axis Monolithic deployment --> Distributed deployment
    quadrant-1 Domain + distributed
    quadrant-2 Technical + distributed
    quadrant-3 Classic monoliths
    quadrant-4 Domain-partitioned monoliths
    Layered: [0.2, 0.25]
    Microkernel: [0.35, 0.3]
    Pipeline: [0.3, 0.15]
    Modular monolith: [0.75, 0.25]
    Service-based: [0.7, 0.65]
    Microservices: [0.85, 0.9]
    Event-driven: [0.6, 0.85]
    Space-based: [0.55, 0.78]
</pre>

*Figure 2.1 — The style catalog on its two generating axes. Notice the crowded and lonely corners: distributed-but-technically-partitioned (top left) is nearly empty because it is nearly always a mistake — services sliced by layer must all change together, giving you distribution's costs with none of its benefits.*

That empty quadrant is not hypothetical; the industry built it at scale in the 2000s and named it Service-Oriented Architecture. Orchestration-driven SOA sliced systems into technical strata — service buses, orchestration engines, "business services" shared by everything — and produced systems where changing one business feature meant coordinating five teams and a middleware committee. We will not study SOA; we will remember it, the way sailors remember a reef. Its lesson survives in one sentence: *partition by domain, or every change becomes a negotiation.*

#### Reading a style's price tag

Each style in this chapter comes with characteristic ratings — one to five stars for deployability, elasticity, fault tolerance, simplicity, cost, and evolvability. Treat the stars the way you treat a used-car listing: honest about relative differences, silent about your particular situation. The ratings become decisions only when joined to *your* driving characteristics from Chapter 1. And underneath every distributed rating lurk the eight fallacies of distributed computing — the network is *not* reliable, latency is *not* zero, bandwidth is *not* infinite — which we will meet properly in Chapter 4. For now, one rule: every arrow that crosses a process boundary in your diagrams is a place where physics collects rent.

**Recap.** Two axes — partitioning and deployment — generate the catalog. Domain partitioning is the great lesson of the SOA failure. Ratings are relative prices, priced in your characteristics.

**Exercise 2.1.** Place the last three systems you worked on in Figure 2.1's quadrants. If any sat in the top-left, estimate what it cost.

### 2.2 Monolithic Styles Done Right

#### The layered default and its sinkhole

The layered monolith — presentation atop business atop persistence — is where most systems begin, and for good reason: it matches how teams think when there is one team. Its ratings are honest: simplicity ★★★★★, cost ★★★★★, elasticity ★★, evolvability ★★. Its characteristic disease is the *architecture sinkhole*: requests that tunnel through layers without any layer doing work; when most requests are sinkholes, the layers are ceremony, not architecture.

#### The modular monolith: one deployment, real boundaries

The style this decade rehabilitated. A modular monolith partitions by *domain* — modules for Catalog, Orders, Inventory — inside one deployable. Each module owns its tables; modules talk through declared interfaces; the compiler and the build system enforce what a network would otherwise enforce, at nanosecond latency and zero operational cost.

The hard question is enforcement, because a monolith's modules are one careless import away from becoming a tangle. This is where Chapter 1's fitness functions become concrete:

| Boundary rule | Enforced by |
|---|---|
| Module A may not import module B's internals | dependency-analysis test in CI (fails the build) |
| No module reads another module's tables | schema ownership + SQL lint in CI |
| No dependency cycles between modules | cycle-detection fitness function |
| Public module APIs are explicit | build-system visibility (exported packages only) |

*A modular monolith without automated boundary enforcement is a regular monolith with better intentions.*

#### Microkernel and pipeline: shapes for specific problems

Two more monolithic styles earn their keep in narrower niches. The **microkernel** — a minimal core plus plug-ins — fits products whose essence is extension: IDEs, browsers, payment processors with per-country rules, anything with a marketplace of add-ons. The **pipeline** — filters connected by pipes — fits transformation-shaped work: ETL, media processing, compiler-like flows. Recognize the shape of your problem in the shape of the style; forcing a marketplace product into layers, or a workflow product into plug-ins, is how architectures fight their own domains.

**Recap.** Layered is a fine start and a poor destiny; watch for sinkholes. The modular monolith gives domain partitioning without distribution — if and only if boundaries are enforced by machines, not intentions. Microkernel and pipeline are precision tools.

**Exercise 2.2.** Sketch Encore's eight components (Section 1.3) as modules of a modular monolith. Which two module boundaries would you enforce first, and with what check?

### 2.3 Distributed Styles

#### Service-based: the pragmatic middle

Service-based architecture splits the system into a handful of coarse domain services — typically four to twelve — usually sharing one database. It is the most underrated style in the catalog: you gain independent deployment of major domains and meaningful fault isolation while keeping one database's consistency and one ops team's sanity. Elasticity ★★★, deployability ★★★★, cost ★★★★, data consistency ★★★★★ — a remarkably balanced card, and very often the *correct* first distributed step.

#### Microservices: maximum decoupling, maximum invoice

Microservices push domain partitioning to its limit: many small services, each owning its data, each independently deployable. Every rating that concerns independence goes to five stars — and simplicity and cost drop to one. The style's real prerequisite is not technical but organizational: many teams that need to move without coordinating. Nine people do not have coordination problems worth this price. This is a two-sentence preview of an entire chapter (Chapter 5); for now, hold one heuristic: *microservices solve a scaling problem you measure in teams, not in requests per second.*

#### Event-driven and space-based: styles for motion and spikes

Event-driven architecture makes *events*, not calls, the connective tissue: producers announce facts, consumers react, nobody waits for anybody. Its two topologies split on control: **broker** (events flow peer-to-peer through channels; maximal decoupling, hazy visibility of the whole) versus **mediator** (a coordinator drives the workflow; visibility and control, at the cost of a smart hub). Fault tolerance and elasticity soar; reasoning about *"what happens after X"* becomes archaeology. Chapter 6 is devoted to doing this well.

Space-based architecture attacks the database bottleneck directly: processing units keep working state in replicated in-memory grids, and the database becomes an eventually-updated system of record. It exists for one situation — extreme, spiky, write-heavy load (flash sales, auctions, betting) — and its price is the hardest data-consistency reasoning in the catalog.

#### The styles, side by side

| | Layered | Modular monolith | Service-based | Microservices | Event-driven | Space-based |
|---|---|---|---|---|---|---|
| Deployability | ★★ | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★ |
| Elasticity | ★★ | ★★ | ★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| Fault tolerance | ★ | ★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ |
| Simplicity | ★★★★★ | ★★★★ | ★★★ | ★ | ★★ | ★ |
| Cost | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★ | ★★ |
| Data consistency | ★★★★★ | ★★★★★ | ★★★★★ | ★★ | ★★ | ★★ |

*Figure 2.2 — Relative ratings. Read columns, not cells: no column is all stars, which is the first law wearing a table.*

**Recap.** Service-based is the balanced middle; microservices buy team-scale independence at maximum operational price; event-driven buys decoupling at the price of visibility; space-based buys spike survival at the price of consistency reasoning.

**Exercise 2.3.** Using Figure 2.2 and Encore's seven characteristics from Chapter 1, eliminate three styles for Encore *before* reading Section 2.4. Write one sentence per elimination.

### 2.4 Choosing a Style

#### The decision, worked honestly

Style selection is Chapter 1's method at maximum stakes. Line up the drivers: **domain shape** (how many naturally separate capabilities?), **team topology** (how many teams must move independently?), **operational maturity** (who carries the pager, and how good are they?), **characteristic outliers** (which components need radically different ratings?), and **cost ceiling**.

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
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class gate,bot hot
</pre>

*Figure 2.3 — Encore's chosen shape: a modular monolith for the steady majority, with the elasticity outliers extracted and scaled independently. The style decision followed the characteristic outlier — not a trend.*

The ADR almost writes itself, and its consequences row is honest: Encore accepts a network boundary (and its fallacies) in exactly one place, in exchange for scaling one component 500× without paying to scale eight.

### 2.5 Styles Are Bets — Hedge Them

Every style is a bet about which changes will come. Bets should be hedged: keep domain boundaries clean *inside* whatever you build (a modular monolith decomposes into services along its module seams in months; a tangled one, in years); automate the boundary checks so the option stays open; and re-run the style decision when its inputs change — team count doubling, an outlier characteristic appearing, an acquisition. The migration path monolith → modular monolith → service-based → (maybe) microservices exists precisely so that each step is paid for by the pressure that demands it.

> **The résumé trap.** The most common style-selection error is optimizing for the architect's next job instead of the business's next year. If your justification cites companies a thousand times your size, you are not doing architecture; you are doing cosplay.

**Recap.** Drivers: domain shape, team topology, ops maturity, outliers, cost. Style is chosen per deployment quantum — extract the outlier, not the org chart. Keep boundaries clean so today's style doesn't foreclose tomorrow's.

**Exercise 2.4.** Write Encore's style ADR (Figure 2.3) in the Chapter 1 format. The consequences row must name at least two real losses.

### Kata: Style Selection — Three Briefs

Three briefs, three different correct answers — that is the point. For each: driving characteristics (≤ 7), chosen style(s) per quantum, a Figure 2.3-grade diagram, and one ADR.

> **Kata A: "Ledgerline."** B2B invoicing SaaS. 40,000 small-business customers, steady daytime load, five-person team, revenue depends on being *boringly* reliable. Finance-grade consistency. The CTO's phrase: "we sell trust, not fireworks."

> **Kata B: "Pulse."** Live audience-reaction app for TV shows. Zero traffic 20 hours a day; two million concurrent users for 90 seconds when a host says "vote now." Twelve engineers. Losing 2% of votes is acceptable; being slow is fatal.

> **Kata C: "Argus."** Analytics product ingesting retail sensor feeds continuously; customers run heavy ad-hoc queries each morning. Data volume grows 10× yearly; the ingest must never pause. Twenty engineers in three teams.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Arbitration | Did the characteristics — not the ratings table alone — decide? |
| Quantum thinking | Were outliers extracted rather than the whole system upgraded? |
| Economics | Does the ops bill fit the team that pays it? |
| The stress test | Halfway through, each brief doubles its team and adds one characteristic (announced in the exercise notes). Does your style survive, or did you bet everything on stillness? |

#### Where you now stand

You can name the shapes, price them, and choose one per quantum with the characteristics as arbiter. What you cannot yet do is draw the *internal* boundaries that make any of these styles work — where one module ends and the next begins, and why. That is a question about the business itself, and it has a discipline: Chapter 3, domain-driven design.

### References

- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) O'Reilly, 2025.
- Neal Ford, Rebecca Parsons, Patrick Kua, Pramod Sadalage — [*Building Evolutionary Architectures*, 2nd ed.](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/) O'Reilly, 2022.
- Mark Richards — [*Software Architecture Patterns*, 2nd ed.](https://www.oreilly.com/library/view/software-architecture-patterns/9781098134280/) O'Reilly, 2022.
- Martin Fowler — [*Patterns of Enterprise Application Architecture*](https://www.informit.com/store/patterns-of-enterprise-application-architecture-9780321127426). Addison-Wesley, 2002.

---

## Chapter 3: Domain-Driven Design and System Decomposition {#ch3}

> Boundaries drawn from the org chart last a reorg; boundaries drawn from the domain last a decade.


Chapter 2 ended with a promise: styles need boundaries, and boundaries need a source. This chapter is about the only reliable source there is — the business domain itself. Domain-driven design is often mistaken for a code-pattern catalog; it is actually a discipline of *listening*: finding where the business naturally cleaves, where words change meaning, where one department's "order" is another's "shipment request," and drawing your seams there rather than where the database diagram suggests.

We will decompose Encore properly this time — not by intuition, as Chapter 1 allowed, but by method. Then we turn to the harder, more common case: the system that already exists, tangled and profitable, which you must reshape without stopping. Most architecture writing pretends systems are born; most architecture work happens on systems that were inherited.

### 3.1 Strategic Design

#### Not all of your system deserves your best people

The first strategic act is admitting your domain is not uniformly interesting. DDD divides it into three kinds of subdomain, and the classification is an investment guide:

| Subdomain kind | Definition | Encore | Investment posture |
|---|---|---|---|
| **Core** | Where you beat competitors; changes constantly | Fair, bot-resistant on-sale admission; real-time seat inventory | Best engineers, custom-built, evolve aggressively |
| **Supporting** | Necessary, specific to you, not differentiating | Event catalog, organizer dashboards | Build simply; keep adequate |
| **Generic** | Everyone needs it; solved industry-wide | Payments, email/wallet delivery, auth | Buy or adopt; never innovate here |

*Figure 3.1 — Subdomain classification as capital allocation. The classic failure is inverted investment: a brilliant in-house auth system and an on-sale flow that falls over — gold-plated plumbing in a house with a leaking roof.*

#### Bounded contexts: where words change meaning

Listen to Encore's people talk about a "ticket." To Sales, a ticket is inventory with a price. To the fan's phone, it is a QR code with an entry right. To Support, it is a case number about a refund. Three meanings, one word — and any attempt to build *one* Ticket model serving all three produces the familiar monster: forty fields, half nullable, meaning nothing.

The bounded context is DDD's answer: a boundary inside which words have exactly one meaning and one model. Inside the Ticketing context, "ticket" means entry right; inside Support, it means case. Contexts give the modules of Chapter 2's modular monolith — and later, perhaps, services — their *semantic* justification. The boundary is where the language changes; you find it by listening for the moment two colleagues use one word and mean two things.

#### Context mapping: the politics between boundaries

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
    classDef core fill:#f38b1c,stroke:#f38b1c,color:#fff
    classDef supp fill:#1b1f3b,stroke:#1b1f3b,color:#fff
    classDef gen fill:#eaf2f8,stroke:#7a93a8,color:#1b1f3b
    class onsale,inv core
    class cat,sup supp
    class pay gen
</pre>

*Figure 3.2 — Encore's context map. The anticorruption layer around Payments is the map's most load-bearing label: the payment provider's model of the world stops at that line and is translated into Encore's own terms, so a PSP migration touches one translator, not every context.*

Three relationships to internalize: **partnership** (two contexts succeed or fail together — expensive, reserve it for core-to-core), **customer–supplier** (downstream's needs discipline upstream's roadmap), and the **anticorruption layer** (a translation shim that keeps someone else's model — a vendor's, a legacy system's — from colonizing yours). The ACL is the single most reusable idea in this module; you will build one every year of your career.

The map itself is discovered, not designed at a desk. The workshop format that works is **EventStorming**: business people and engineers, a long wall, orange stickies for domain events ("SeatReserved," "PaymentFailed," "TicketIssued"), arranged in time order until clusters and language shifts reveal the boundaries. It is cheap, it is fast, and it surfaces in an afternoon what requirement documents hide for months.

**Recap.** Classify subdomains to allocate investment. Bounded contexts are language boundaries — one word, one meaning, one model. Context maps make inter-boundary politics explicit; the ACL is your standing defense against foreign models.

**Exercise 3.1.** Find a word in your current company that means different things to two departments. Sketch the two models it implies. Where is the boundary?

### 3.2 Tactical Design for Architects

#### Aggregates: consistency has a size

Inside a context, tactical DDD gives structure to the model. An architect needs one concept above the rest: the **aggregate** — a cluster of objects that changes as a unit, guarding an invariant that must *never* be violated, even for a millisecond.

Encore's crown-jewel invariant: *a seat is never sold twice.* Which objects must change together to guard it? The seats of one event's seating map — reserve, release, sell — and nothing more. So the aggregate is the **EventSeating** for a single event: one transactional boundary, one lock scope, one source of truth for "is seat 14B free?"

> **Aggregates are consistency boundaries, not object graphs.** The beginner's aggregate is everything reachable from Event: seating, orders, refunds, analytics — a lock the size of the business. The architect's aggregate is the *smallest* cluster that guards the invariant. Everything else learns about changes afterward, through domain events.

That "afterward" is the second tactical concept that matters architecturally: **domain events**. When EventSeating sells a seat, it emits `SeatSold`; the Order context reacts; Analytics reacts later still. Between aggregates, consistency is *eventual* — and this is not a compromise smuggled in by engineers, but a property of the business itself (Encore's finance team reconciles daily; they never expected microsecond truth). Chapter 6 industrializes this idea.

#### The honesty clause

Tactical DDD — aggregates, entities, value objects, domain services, ports-and-adapters — earns its complexity only where the domain is complex. Encore's Notification context sends emails; it needs a transaction script and a queue, not a domain model. Applying tactical patterns uniformly is how supporting subdomains eat the budget that core subdomains deserved. The mark of a senior designer is not using the patterns; it is knowing where not to.

**Recap.** The aggregate is the smallest cluster guarding a real invariant — it sizes your transactions, locks, and eventually your service boundaries. Between aggregates: domain events and eventual consistency, blessed by the business. Tactical patterns are for core complexity only.

**Exercise 3.2.** Name the strongest invariant in a system you know. What is the *smallest* aggregate that can guard it? What currently guards it — and is that thing bigger?

### 3.3 Granularity — Forces That Split and Forces That Bind

Contexts give candidate boundaries; granularity forces decide how far to actually split. Six **disintegrators** push pieces apart; five **integrators** pull them together. Architecture happens where they collide:

| Disintegrators (split when...) | Integrators (merge when...) |
|---|---|
| pieces change at different rates | a workflow needs them in one transaction |
| one piece needs extreme scale (Sale Gate) | they chat constantly (latency tax on every call) |
| one piece must not take others down | they share data that cannot be teased apart |
| pieces need different security postures | the team is too small to operate more pieces |
| different teams own them | consistency demands one lock (the aggregate) |
| one piece deploys far more often | |

*Figure 3.3 — The granularity tug-of-war. Run every proposed split through both columns; a split justified only by fashion loses to any integrator.*

Watch the table settle an Encore argument. Someone proposes splitting Seat Inventory from Order "for cleanliness." Integrators object: seat reservation and order creation share one workflow, chat constantly, and the sale is one business transaction. Disintegrators counter: different change rates? No. Different scale? No — the *Gate* absorbs the spike upstream. Verdict: they stay together. Conway's Law gets the last word on any split: a boundary that requires two teams to ship one feature will be bulldozed by the org chart within a year, whatever the diagrams say. Team topology is not an afterthought to decomposition; it is a *force* in it.

**Recap.** Granularity is a force balance, not an aesthetic. Every split must name its disintegrator and survive the integrators — and the org chart votes last.

**Exercise 3.3.** Take the most recently split (or proposed-split) service at your work. Which disintegrator justified it? Which integrators were ignored, and what did that cost?

### 3.4 Decomposing Existing Systems

#### First, the economics

Encore, remember, is lucky — it is young. The system you will actually be asked to decompose is nine years old, profitable, and load-bearing. Before any technique: *should* you? The honest checklist is short. Decompose when the monolith measurably blocks the business — deploys collide weekly, one component's scale needs starve the rest, teams idle in merge queues. Do **not** decompose because the code is ugly (refactor it), because hiring slides say "microservices," or because the monolith is merely old. A tangled monolith becomes tangled services with a network inside the tangle — you keep every problem and add latency, partial failure, and an ops bill.

#### The strangler fig and its supporting cast

When the answer is yes, the master pattern is the **strangler fig**: grow the new system around the old, redirect traffic capability by capability, and let the old code die of irrelevance rather than surgery.

<pre class="mermaid">
flowchart LR
    users([Users]) --> proxy["Routing facade"]
    proxy -- "extracted capability" --> new["New Admission service"]
    proxy -- "everything else" --> old["Legacy monolith"]
    new -. "reads/writes via ACL" .-> old
    classDef new fill:#f38b1c,stroke:#f38b1c,color:#fff
    classDef old fill:#eaf2f8,stroke:#7a93a8,color:#1b1f3b
    class new new
    class old old
</pre>

*Figure 3.4 — The strangler fig. The routing facade is the whole trick: every capability behind it can move without users knowing, and every move is reversible by routing rule — your rollback is a config change, not a war room.*

Around the fig, a supporting cast for the risky middle period: **branch by abstraction** (an interface inside the monolith with old and new implementations behind a toggle) when you cannot intercept at the edge; **parallel run** (both implementations execute, results compared, old one still authoritative) when correctness matters more than speed — run the new seat-allocation beside the old for two weeks of real on-sales before trusting it.

### 3.5 The Database Is the Boss Fight

Code splits are the easy half. The shared database is where migrations go to die, and it yields only to a sequence: give each context its own *schema* first (ownership on paper), replace cross-context joins with API calls or replicated read models, then move data with **change data capture** streaming writes from old to new store while reads migrate gradually. Expect the grief stages: reports that joined everything, hidden consumers nobody declared, "temporary" direct-table access from 2019. Every one is an integrator you are paying down with interest. This is why Section 3.3 told you to check the data column *before* splitting.

**Recap.** Decompose for measured business pain, never aesthetics. Strangler fig + routing facade makes migration incremental and reversible; branch-by-abstraction and parallel run de-risk the middle; the database splits last, by schema → API → CDC.

**Exercise 3.4.** For a monolith you know: name the one capability you would extract first. Why that one — which disintegrator, and why is its data seam shallow?

### Kata: Harvest

> **Your brief: "Harvest."** A farm-to-restaurant marketplace, eight years old, one Rails monolith, 26 engineers in four teams. Farmers list weekly harvests; restaurants order by Thursday; routes are planned Friday; trucks roll Saturday 4 a.m. Deploys are frozen Wednesday–Saturday because *nobody is sure what touches routing*. The delivery-routing team wants to rewrite in-place; the CTO wants "microservices like Uber"; the CFO wants neither to cost anything. Logistics is the differentiator; listings are commodity; payments are Stripe.

**Deliverables:**

1. **Subdomain classification** — core / supporting / generic, one sentence of investment posture each.
2. **Context map** — with named relationships; at least one ACL, justified.
3. **Granularity verdicts** — three proposed splits run through the Figure 3.3 force table; at least one *rejected*.
4. **Migration plan** — first extraction, strangler sequence, database strategy, and what "reversible" means at each step.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Language evidence | Are boundaries justified by meaning shifts, not table names? |
| Investment sanity | Does core get the talent; does generic get bought? |
| Force honesty | Did any split survive that names no disintegrator? |
| Reversibility | At every migration step, what is the undo — and is it a routing rule or a rewrite? |

#### Where you now stand

You can find boundaries the business will respect, size the pieces by real forces, and reshape a living system without stopping it. What you have been allowed to ignore is what happens *between* the pieces once a network sits there — latency, partial failure, and the death of the single transaction. That physics, and the engineering that survives it, is Chapter 4.

### References

- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Vlad Khononov — [*Learning Domain-Driven Design*](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/). O'Reilly, 2021.
- Sam Newman — [*Monolith to Microservices*](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/). O'Reilly, 2019.
- Martin Fowler — [*Refactoring*, 2nd ed.](https://www.informit.com/store/refactoring-improving-the-design-of-existing-code-9780134757599) Addison-Wesley, 2018.
- Vaughn Vernon — [*Implementing Domain-Driven Design*](https://www.informit.com/store/implementing-domain-driven-design-9780133039894). Addison-Wesley, 2013.
- Michael Feathers — [*Working Effectively with Legacy Code*](https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055). Prentice Hall, 2004.
- Eric Evans — [*Domain-Driven Design: Tackling Complexity in the Heart of Software*](https://www.informit.com/store/domain-driven-design-tackling-complexity-in-the-heart-9780321125217). Addison-Wesley, 2003.

---

## Chapter 4: Distributed Systems Foundations for Architects {#ch4}

> Distribution is not an upgrade; it is a mortgage. This chapter is the amortization table.


Encore extracted Sale Gate in Chapter 2 and drew context boundaries in Chapter 3, and in doing so quietly signed a contract with physics. The moment two components speak over a network, a new set of laws applies: messages get lost, arrive twice, or arrive late; clocks disagree; half of a system can die while the other half keeps cheerfully working. No framework repeals these laws. Architects who don't know them design systems that work in demos and fail on Saturdays.

This chapter is the physics and the engineering that survives it, architect-shaped: you will not implement a consensus protocol, but you will predict how a system behaves at 10× load and half a network, read consistency claims with a customs officer's eyes, and design failure behavior instead of discovering it. Encore's first real outage arrives in Section 4.4 — self-inflicted, as most are.

### 4.1 The Physics of Distribution

#### The eight famous lies

The eight fallacies of distributed computing are assumptions every engineer makes until production removes them — read them as a bill of costs:

| The lie | The truth's bill for Encore |
|---|---|
| The network is reliable | Every Gate→Inventory call needs a timeout and a retry policy — designed, not defaulted |
| Latency is zero | A seat-map render that makes 30 sequential calls spends its entire budget on speed-of-light |
| Bandwidth is infinite | Shipping the full seating map on every update melts the on-sale |
| The network is secure | Chapter 10's entire syllabus |
| Topology doesn't change | Deploys, autoscaling, and failovers reshuffle addresses hourly |
| There is one administrator | The PSP's maintenance window is not on Encore's calendar |
| Transport cost is zero | Serialization and TLS handshakes are real CPU on the hot path |
| The network is homogeneous | The fan on stadium Wi-Fi is part of your distributed system too |

*Figure 4.1 — Eight assumptions, eight invoices. The first two fund most of this chapter.*

#### Time, ordering, and the duty of idempotency

In one process, "before" and "after" are facts. Across machines they are opinions: clocks drift, messages race, and log timestamps from two servers cannot settle an argument. Two working consequences. First, *order must be designed* where it matters — sequence numbers, versions, single-writer ownership (Chapter 3's aggregates suddenly look prescient: one owner per invariant is an ordering strategy). Second, and non-negotiable:

> **The duty of idempotency.** Any operation that crosses a network will eventually be retried — by your code, a proxy, or a double-clicking fan. Every such operation must be safe to apply twice. "Charge card for order 123" is a bug; "charge order 123's single charge-intent" is engineering. Idempotency is not a pattern you add later; it is a property you owe from day one.

#### Tails, not averages

The last physics lesson is statistical. Users do not experience your average latency; they experience the tail — and tails compound viciously: a page fanning out to 10 services, each with a modest 1-in-100 chance of a 2-second stall, stalls for roughly one page-load in ten. At Encore's on-sale rates, "p99 = 2s" means thousands of fans in molasses at the worst possible minute. Architects budget latency at p99, and treat every fan-out as tail multiplication.

Budgets need prices. Commit these orders of magnitude to memory — they cost every arrow you will ever draw:

| Operation (2026) | Order of magnitude |
|---|---|
| Function call, same process | ~10 ns |
| Local SSD read | ~100 µs |
| Round trip, same availability zone | 0.5–1 ms |
| Round trip, cross-region | 30–100 ms |
| Object-store read (first byte) | 20–100 ms |
| LLM inference — first token / each token | 200–2,000 ms / 10–50 ms |

A seat-map render may spend a few same-AZ round trips — never a cross-region one, and never a wait on a model. The table is why.

**Recap.** The network lies eight ways; timeouts, retries, and bandwidth discipline are the tax. Order is designed, not assumed. Everything retryable must be idempotent. Latency lives in the tail, and fan-out multiplies it.

**Exercise 4.1.** Find one non-idempotent network operation in a system you know (payment, email, counter). Describe the double-fire scenario and the smallest fix.

### 4.2 State — Replication, Partitioning, Consistency

#### Copies and slices

State scales along exactly two axes. **Replication** makes copies — for surviving machine death and for serving hot reads (Encore's catalog: written weekly, read millions of times an hour on tour-announcement day). **Partitioning (sharding)** makes slices — when writes outgrow one machine, data splits by key. Choose keys for even spread and single-shard access: Encore partitioning seats by `event_id` keeps each on-sale on one shard's fast path — and concentrates each on-sale's fury on one shard, a trade-off we accept knowingly (the Gate meters it) rather than discover in an incident review.

Replication's price is the gap between copies. The leader acknowledges a write; a follower answers the next read; the fan who just bought a ticket asks "my tickets?" and sees none. Nothing crashed — the system is merely being honest about light-speed and buffers.

#### The consistency menu

What vendors bury in appendices, architects must read as a menu with prices:

<svg viewBox="0 0 640 110" style="max-width:640px;width:100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="consTitle consDesc">
  <title id="consTitle">The consistency spectrum</title>
  <desc id="consDesc">A horizontal gradient bar from stronger consistency (slower, coordination-hungry) to weaker (faster, available), with markers at: linearizable, causal, read-your-writes, eventual.</desc>
  <defs>
    <linearGradient id="cons" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f38b1c"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="20" y="40" width="600" height="16" rx="8" fill="url(#cons)"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" fill="#d97706" font-weight="bold">stronger — slower, coordination-hungry</text>
  <text x="620" y="26" font-family="sans-serif" font-size="13" fill="#0b7ecb" font-weight="bold" text-anchor="end">weaker — faster, available</text>
  <line x1="70" y1="56" x2="70" y2="72" stroke="#d97706" stroke-width="2"/>
  <text x="70" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">linearizable</text>
  <line x1="260" y1="56" x2="260" y2="72" stroke="#d97706" stroke-width="2"/>
  <text x="260" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">causal</text>
  <line x1="420" y1="56" x2="420" y2="72" stroke="#0b7ecb" stroke-width="2"/>
  <text x="420" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">read-your-writes</text>
  <line x1="570" y1="56" x2="570" y2="72" stroke="#0b7ecb" stroke-width="2"/>
  <text x="570" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">eventual</text>
</svg>

*Figure 4.2 — The consistency spectrum. The senior move is refusing to buy one level for the whole system: seat allocation is linearizable; ticket lists are read-your-writes; view counters are eventual. Consistency is purchased per invariant, not per company.*

CAP, correctly read, says only this: when a partition happens (and it will), each *operation* chooses — refuse to answer (consistency) or answer possibly-stale (availability). PACELC adds the everyday clause: even without partitions, stronger consistency costs latency, always. Seat-sale: choose C, proudly show "high demand, retrying." Catalog browse: choose A, always. The database serving both must let you choose *per operation* — that sentence disqualifies half the candidates in any vendor bake-off, which is precisely its value.

Underneath the strong end sits consensus (Raft and kin): machines voting on one truth, majorities required. Architect-level takeaways only: odd cluster sizes, a leader's failover pause is your write downtime, and quorums across regions pay intercontinental round-trips *per write* — which is why "global strongly-consistent and fast" appears only in marketing.

One further caveat earns its place: leadership itself expires. A leader that stalls — GC pause, VM migration, network blip — can keep *believing* it leads while a successor is elected, and a stale leader that still writes corrupts data politely. The defenses are **leases** (leadership with an expiry that must be re-earned) and **fencing tokens** (every write carries the leader's term; storage rejects any term older than the newest it has seen). Encore's seat shards write with fenced terms, so a zombie leader's late writes bounce harmlessly. No protocol internals required — just the architect's question: *what stops yesterday's leader from writing today?*

**Recap.** Replicate for reads and survival; partition for writes; choose keys for spread and single-shard flows. Consistency is a per-invariant purchase — pin your invariants to levels before choosing storage.

**Exercise 4.2.** List four data items in a system you know. Assign each the weakest consistency level the business genuinely tolerates — then name which your current database actually delivers.

### 4.3 Scalable Service Architectures

#### The reference shape

Most scalable request-serving systems converge on one silhouette, worth having as reflex:

<pre class="mermaid">
flowchart LR
    fans([Clients]) --> lb["Load balancer"]
    lb --> s1["Service instance"] & s2["Service instance"] & s3["..."]
    s1 & s2 --> cache[("Distributed cache")]
    s1 & s2 --> db[("Primary store")]
    s1 & s2 -- "slow/async work" --> q[["Queue"]]
    q --> w1["Workers (scale independently)"]
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class lb,q hot
    classDef store fill:#d9f6ff,stroke:#0b7ecb,color:#1b1f3b
    class cache,db store
</pre>

*Figure 4.3 — The workhorse topology. Its two load-bearing ideas are highlighted: statelessness at the balancer (any instance can serve anyone) and the queue (turning spikes into schedules).*

**Statelessness** is what makes the left half elastic: session state lives in the cache or a token, never in instance memory, so scaling is "add instances" and failure is "who cares." **Caching** buys read scale at a known price — staleness and invalidation. Cache-aside with TTLs covers most needs; the discipline is declaring *per item* how stale is acceptable (catalog: minutes; seat availability: never — cache the map's geometry, never its truth). **The queue** is the deepest idea on the diagram: a synchronous call demands the callee be alive *now*; a queued message asks only that it be alive *eventually*. Ticket-issuance behind a queue turns Encore's spike into a backlog that drains in minutes — invisible, because fans got "purchase confirmed" from the only part that had to be synchronous.

Here is the arithmetic the kata will demand, worked once. Encore's worst on-sale: the Gate admits 2,000 fans/sec; each admitted fan drives ~3 seat-map reads and ~1 reservation attempt — 6,000 reads/sec and 2,000 serialized writes/sec against Seat Inventory. A partition sustains ~10,000 reads but only ~1,500 ordered reservations, so *writes* size the system: two shards minimum, four for headroom, keyed by `event_id` (Section 4.2) so each on-sale stays on one ordered path. Three lines of multiplication, and the design review moves from adjectives to numbers.

> **Queueing intuition.** Little's law — items in system = arrival rate × time in system — has one corollary every architect needs: response time explodes as utilization nears 100%. At 50% load, queues are short; at 80% they lengthen; past ~85% they grow without bound. That knee is why Section 4.4's load shedding is doctrine, not cowardice: refusing work above the knee is the only way to keep serving the work below it.

One naming ritual completes the vocabulary: **scatter/gather** (fan out, assemble answers — ruled by the slowest shard, Section 4.1's tail math), and the Kubernetes-native trio — **sidecar** (per-instance helper for TLS/telemetry), **ambassador** (local proxy for remote things), **adapter** (uniform faces on diverse services). You will meet them wearing a "service mesh" badge in Chapter 5.

**Recap.** Stateless tier + cache + queue is the reference silhouette. Staleness is declared per item; queues convert spikes into schedules; the async boundary is an architectural decision, not an optimization.

**Exercise 4.3.** Redraw Figure 4.3 for Encore's purchase flow, marking exactly which arrow is the synchronous "moment of truth" and why everything else can queue.

### 4.4 Resilience Engineering

#### Anatomy of a self-inflicted outage

Encore's first big on-sale after extraction. Payment provider slows: 200 ms → 8 s. Order threads pile up waiting; the thread pool exhausts; health checks (same pool) fail; the autoscaler helpfully adds instances, which open *more* connections against the struggling PSP; client timeouts fire and *retry*, tripling load. Payments limp — but Encore is down. Total damage from one slow dependency and default settings.

Read the chain again: no component failed. Every link did its naive best. Resilience is the discipline of breaking this chain at every joint:

| Link in the chain | The breaker |
|---|---|
| Waiting forever on a slow call | **Timeouts** — aggressive, budgeted end-to-end (fan's 3 s budget allocates ~800 ms to PSP) |
| Retries amplifying load | **Backoff + jitter**, retry *budgets* (never >X% of traffic), idempotency prerequisite |
| Slowness spreading between dependencies | **Bulkheads** — separate pools per dependency; PSP's pool drains, seat-viewing's doesn't |
| Hammering a dying dependency | **Circuit breaker** — fail fast, probe gently, recover automatically |
| Load exceeding capacity | **Load shedding & backpressure** — reject early, cheaply, honestly; that is the Gate's whole job |

*Figure 4.4 — Each link of the outage chain has a named countermeasure. None is exotic; all must be present, because the chain is only as broken as its strongest link.*

<pre class="mermaid">
stateDiagram-v2
    Closed --> Open : failures exceed threshold
    Open --> HalfOpen : cool-down elapses
    HalfOpen --> Closed : probe succeeds
    HalfOpen --> Open : probe fails
    note right of Open : calls fail instantly —\nno threads parked,\ndependency gets air
</pre>

*Figure 4.5 — The circuit breaker's three states. Its gift is twofold: your threads stop dying in queues, and the struggling dependency gets the quiet it needs to recover.*

### 4.5 Degradation and Chaos

Two disciplines make resilience real rather than aspirational. **Graceful degradation** is designed beforehand: PSP down → accept orders, hold seats, charge when it recovers ("your card will be charged shortly" kept Encore's rival selling through their PSP's outage; nobody remembers, which is the point). And **chaos testing** turns all of it into Chapter 1 fitness functions: kill an instance, inject 5 s of PSP latency in staging, assert the breakers open and the queues drain. A resilience pattern you have never watched fire is a rumor.

**Recap.** Cascades are chains of naive best-effort; break every link — timeouts, budgeted retries, bulkheads, breakers, shedding. Degradation is designed in advance. Chaos experiments make resilience a tested property, not a hope.

**Exercise 4.4.** Trace your system's most important synchronous dependency. Answer in writing: timeout? retry budget? separate pool? breaker? what do users see when it's down? Any blank answer is your next sprint.

### Kata: Beacon

> **Your brief: "Beacon."** Live-score platform for a football league. 2 M concurrent fans on match days (35 M peak during cup finals), each expecting score updates within 2 seconds of the referee's whistle. Between matches: near-zero traffic. Also: a betting-partner API with a *hard* requirement — odds-relevant events (goals, red cards) must be delivered in order, exactly-once-in-effect, with p99 < 500 ms. Fifteen engineers. Cloud budget: "startup, not sovereign wealth fund."

**Deliverables:**

1. **Capacity model** — a table: reads/sec and writes/sec at match-peak and final-peak, fan-out factor per score update, and the arithmetic that sizes the fan-facing tier.
2. **Topology** — Figure 4.3-grade diagram; mark the synchronous moment(s) of truth, every queue, every cache with its declared staleness.
3. **Consistency ledger** — for fan scores vs. betting events: consistency level, ordering strategy, idempotency mechanism.
4. **Failure-mode analysis** — three failures (instance death, stats-provider stall, region loss): the designed behavior of each, plus the chaos experiment that proves it.
5. **Two ADRs** — the load-shedding policy for final-day overload, and the betting-API delivery design.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Arithmetic | Does the capacity model survive multiplication, or is it vibes with units? |
| Tail honesty | Are latency promises stated at p99 and budgeted per hop? |
| Two-speed design | Are fans (eventual, cheap) and bookmakers (ordered, exact) served by *different* machinery? |
| Failure authorship | Is behavior under failure designed and chaos-tested, or inherited from defaults? |

#### Where you now stand

You hold the physics: lies of the network, the price list of consistency, the reference topology, the resilience chain. What you have not yet done is run a *fleet* of services built this way — modeled, contracted, deployed, observed, and owned by teams who answer pagers. That operational and organizational reality is Chapter 5: microservices as they are actually lived.

### References

- Martin Kleppmann, Chris Riccomini — [*Designing Data-Intensive Applications*, 2nd ed.](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/) O'Reilly, 2025.
- Brendan Burns — [*Designing Distributed Systems*, 2nd ed.](https://www.oreilly.com/library/view/designing-distributed-systems/9781098156343/) O'Reilly, 2024.
- Ian Gorton — [*Foundations of Scalable Systems*](https://www.oreilly.com/library/view/foundations-of-scalable/9781098106058/). O'Reilly, 2022.
- Roberto Vitillo — [*Understanding Distributed Systems*, 2nd ed.](https://leanpub.com/understanding-distributed-systems) Leanpub, 2022.
- Alex Petrov — [*Database Internals*](https://www.oreilly.com/library/view/database-internals/9781492040330/). O'Reilly, 2019.
- Michael T. Nygard — [*Release It!*, 2nd ed.](https://pragprog.com/titles/mnee2/release-it-second-edition/) Pragmatic Bookshelf, 2018.

---

## Chapter 5: Microservices — Building, Operating, Succeeding {#ch5}

> Microservices are an organizational technology that happens to run on computers.


Encore has grown. Three years after Chapter 1, it is 70 engineers in nine teams, and the modular monolith that served nine people beautifully has become a coordination machine: deploy trains, freeze windows, teams waiting on teams. This — not request volume, not résumé fashion — is the problem microservices exist to solve: letting many teams change one product *without asking each other's permission*.

This chapter is the honest, end-to-end treatment: how to cut services so independence is real, how to run workflows when no transaction spans them, how to build, test, deploy, and watch a fleet — and the organizational contract without which all of it curdles. Every benefit here is purchased with operational complexity (the first law, at fleet prices), and many teams pay full price for the distributed monolith — services so coupled they deploy in lockstep: every cost, no benefit. This chapter is about receiving what you pay for.

### 5.1 Modeling and Communication

#### Independence is the unit of correctness

A microservice is an independently deployable unit of business capability. Every word is load-bearing, but *independently* most of all — and independence is decided at modeling time, not deployment time. Services cut along Chapter 3's bounded contexts can change alone because the business seams they follow are real. Services cut by entity ("User service," "Ticket service" — Chapter 1's entity trap at fleet scale) or by layer put every business change on a tour through three repos and two teams' sprint plannings.

Encore's cut therefore reads like its context map: On-Sale Admission, Seat Inventory & Ticketing, Catalog, Orders & Payments, Support, Notifications, plus Bot Screening. (Chapter 1's eight components have now been remapped twice — into Chapter 3's bounded contexts, and here into services. The renames are the point, not an accident: boundaries got truer as the business taught us its seams.) Seven services, nine teams — some teams own two small ones, none share one. **Information hiding** completes the modeling rule: a service's database is private the way a class's fields are private; the moment two services share tables, they deploy together forever.

#### The communication decision

Every inter-service link picks a row of this table, and the rows have owners from earlier chapters:

| Mode | When it's right | Standing cost |
|---|---|---|
| Synchronous request/response | Caller cannot proceed without the answer (reserve seat) | Temporal coupling; availability multiplies (Chapter 4) |
| Asynchronous events | Others must *learn*, not approve (SeatSold → analytics, email) | Eventual consistency; visibility work |
| Orchestrated workflow | Multi-step process needing an accountable owner | The orchestrator to run and monitor |

*Figure 5.1 — Three communication modes. Default to events for propagation of facts, synchronous calls for moments of truth, orchestration for processes with names — and notice how few moments of truth Encore actually has (Chapter 4 found one).*

**Recap.** Services are bounded contexts made deployable; independence is won at modeling time. Databases are private. Communication mode is chosen per link, and most links carry facts, not questions.

**Exercise 5.1.** Take two services (real or from Encore) and list every way a change in one forces a deploy of the other. Each item is a coupling with a name — schema, timing, shared library. Which would you sever first?

### 5.2 Workflow, Transactions, and Contracts

#### The saga: transactions without the transaction

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

*Figure 5.2 — An orchestrated saga compensating a declined card. Note what compensation is: not "undo" (the decline already happened) but a forward action restoring business sense. Sagas are business processes wearing engineering clothes — which is why the compensations must be designed with the business, not invented in code review.*

Sagas also leak. Between local commits there is no isolation — the world sees intermediate state: the fan whose card was declined watches seat 14B sit "held" by nobody until the compensation lands. The countermeasures are design moves, not settings: a **semantic lock** (an explicit pending status downstream readers must honor — the map shows "being purchased," honestly), **commutative updates** (steps safe in any order, so interleaving cannot corrupt), and **re-read-and-verify** (the final step re-checks its assumptions, treating the saga's earlier reads as stale by default). Choose per step; the seat map uses all three.

Orchestration (an owner drives the steps — visible, debuggable, one accountable place) versus choreography (each service reacts to the previous event — decoupled, no bottleneck, but the workflow exists only as folklore): for money-touching flows with deadlines and dunning, Encore orchestrates; for propagation of facts, it choreographs. Chapter 6 gives both their full machinery.

#### Contracts: the boundaries' constitution

Independent deployment dies the day service A's release breaks service B. The defense is contract discipline: explicit schemas with **expand–contract** evolution (add optional fields freely; remove or change meaning only after all consumers migrate), **tolerant readers** (ignore unknown fields; a consumer that rejects surprises is a coupling bomb), and **consumer-driven contract tests** — each consumer publishes what it actually relies on, and providers run those expectations in CI, converting "did we break anyone?" from a meeting into a test failure. One sharp corollary the industry keeps relearning: shared "common model" libraries re-couple everything they touch; share primitives and protocols, never domain models.

**Recap.** Sagas replace distributed transactions with compensation designed alongside the business. Orchestrate accountable processes; choreograph fact propagation. Expand–contract plus consumer contracts in CI make "independently deployable" true rather than aspirational.

**Exercise 5.2.** Design the saga for Encore's *refund* (payment reversal, seat re-listing if >48 h to showtime, ticket invalidation). Which step is the point of no return? What compensates a failure after it?

### 5.3 Delivery — Build, Test, Observe

#### Deployment as a non-event

The fleet's health is measured by one cultural metric: is deploying boring? Each service gets its own pipeline — commit to production in under an hour, no coordination, no train, no freeze. **Progressive delivery** removes the remaining fear: canary a few percent of traffic, watch, widen, with automated rollback on error-budget burn; and **decouple deploy from release** with feature flags, so shipping code and enabling behavior are separate decisions owned by separate roles. Encore ships the new seat-picker dark on Tuesday, enables it for 5% on Thursday, and nobody works weekends.

#### Testing a fleet without lying to yourself

The classic pyramid needs distributed-era honesty. Unit tests stay cheap and plentiful; service tests (one service, stubbed neighbors) carry most confidence; contract tests (Section 5.2) guard every seam. The top layer is where discipline lives: end-to-end tests spanning many services are slow, flaky, and politically expensive — keep a handful of *journeys* (fan buys ticket), not a thousand cases, and push everything else down. Below the pyramid sits its modern extension: **testing in production** — because with contracts guarding seams, the canary *is* the final integration test, and synthetic buyers exercising the real path hourly catch what staging never will.

#### From monitoring to observability

Monitoring asks known questions ("is CPU high?"). Observability answers unknown ones ("why are Dutch fans' payments slow since 14:02?"). The toolkit: **structured, correlated logs**, **metrics** for cheap aggregates and alerting, and **traces** — the distributed call's biography, without which debugging a fleet is guesswork with dashboards. The architect's job is making all three *ambient*: baked into service templates (Section 5.5 returns to this), with a correlation ID born at the edge and carried through every hop, queue, and saga — so any Encore engineer can follow order #881 across seven services at 3 a.m. without waking anyone.

**Recap.** One pipeline per service; canaries plus flags make deploys boring and reversible. Confidence lives in service and contract tests; e2e is a few journeys; production is a test environment with dignity. Traces + correlation IDs are non-negotiable fleet equipment.

**Exercise 5.3.** For your current system: how long from merged commit to production, and how many humans touch it? If >1 hour or >1 human, name the single constraint you'd remove first.

### 5.4 Production Realities

Four topics decide whether the fleet survives contact with reality; each gets a deep chapter later, but the microservices-shaped view belongs here.

**Resilience, aggregated.** Chapter 4's chain-breakers must now exist *uniformly* — a bulkhead missing in one service is a hole in everyone's hull. This is the case for the **service mesh**: timeouts, retries, mTLS, and telemetry pushed into infrastructure sidecars, so resilience is fleet policy rather than seventy teams' individual diligence. The trade-off is real (a mesh is heavy machinery); the alternative — resilience by memo — is worse at Encore's scale.

**Security, previewed.** Every service boundary is an attack surface; "internal" is not a trust level (the fallacy list said so). Services get identities, mTLS everywhere, and per-service least-privilege credentials — Chapter 10 makes this a discipline.

**Scaling, per service.** The fleet's virtue: Sale Gate scales to 400 instances on Friday while Support idles on two. Scaling decisions become per-service and boring — which is the point.

**UIs and BFFs.** The frontend must not become the place where all decomposition is undone (one screen calling nine services). The **backend-for-frontend** aggregates per experience — fan app, organizer web — owned by the frontend team; Chapter 8 treats this seam fully.

**Recap.** Uniformity is the production theme: mesh-enforced resilience, identity everywhere, per-service scaling, BFFs guarding the UI seam. Fleet properties must be infrastructural, not voluntary.

**Exercise 5.4.** Pick any two services in your organization. Are their timeout, retry, and TLS behaviors the same? If not, you have found policy-by-diligence; sketch what moving it to infrastructure would take.

### 5.5 The Organization That Microservices Require

#### Conway's law is a design tool

Team boundaries and service boundaries are the same drawing viewed twice; fight that and the org chart wins every time. The workable topology: **stream-aligned teams** owning services end to end — build it, run it, carry its pager — because ownership without operations is authorship, and authorship doesn't wake up at 3 a.m. and therefore never learns. Around them, a **platform** (Chapters 11 and 14) turns the fleet's shared burdens — pipelines, observability, mesh, golden-path templates — into paved roads, so each stream team's cognitive load stays inside a human skull.

**Governance without a review board.** Central approval boards recreate the coordination the whole style exists to remove. The replacement is *paved roads plus fitness functions*: the golden-path template makes the right thing the easy thing; automated checks (Chapter 1's governance, now fleet-wide) catch the drift; deviation is allowed, priced, and owned by the deviator. Encore's rule of thumb: you may leave the paved road whenever you're prepared to build your own.

#### The adoption question, asked out loud

> **Microservices are a prerequisite-gated purchase.** Before adopting, four questions in order: (1) Do you have a *team-coordination* problem, measured in waiting? (2) Are your domain boundaries stable enough to cut along (Chapter 3 done honestly)? (3) Can you operate a fleet — observability, on-call, automated deploys — or fund the platform that can? (4) Can leadership accept team autonomy, including its mistakes? Four yeses: proceed incrementally, strangler-style. Any no: a modular monolith with enforced boundaries gives you most of the benefit at a fraction of the invoice — and leaves the option open.

**Recap.** Stream-aligned teams own services cradle-to-pager; a platform absorbs the shared burden; governance rides paved roads and fitness functions instead of meetings. Adoption is gated on coordination pain, stable boundaries, operational capability, and cultural consent.

**Exercise 5.5.** Answer the four adoption questions for your organization, in writing, with evidence. Which "yes" is really a "hope"?

### Kata: The Adoption Verdict

> **Your brief: "Grainhouse."** A 60-developer grocery-chain software group: one twelve-year-old monolith (stores, warehouse, e-commerce, loyalty), release train every three weeks, six teams whose features queue behind each other. E-commerce loses money every release freeze. The CEO read an airline magazine and wants "microservices by Q3." The warehouse module is stable and beloved; loyalty changes weekly; the database is one schema with 700 tables and no owners.

**Deliverables:** (1) the four-question adoption verdict with evidence from the brief; (2) if yes-with-conditions — the first two extractions chosen by coordination pain and seam shallowness, with strangler plan; (3) the communication design for extracted pieces (Figure 5.1 discipline); (4) the *organizational* prerequisites list — what Grainhouse must build or hire before service #1 ships; (5) one ADR: "why we are not extracting the warehouse."

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Verdict honesty | Did evidence, not the CEO's magazine, decide? |
| Pain-first sequencing | Do extractions target measured waiting, not interesting code? |
| Prerequisite realism | Is the platform/on-call/contract tooling funded before the fleet grows? |
| Restraint | Is anything explicitly *left in the monolith*, with pride? |

#### Where you now stand

You can cut, contract, deliver, observe, and organizationally sustain a service fleet. But the fleet's nervous system — the events that let services learn facts without asking — has been running on promissory notes since Section 5.1. Chapter 6 pays them: event-driven architecture and streaming, done with full rigor.

### References

- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Nicole Forsgren, Jez Humble, Gene Kim — [*Accelerate*](https://itrevolution.com/product/accelerate/). IT Revolution, 2018.
- Jez Humble, David Farley — [*Continuous Delivery*](https://www.informit.com/store/continuous-delivery-reliable-software-releases-through-9780321601919). Addison-Wesley, 2010.

---

## Chapter 6: Event-Driven Architecture and Streaming Systems {#ch6}

> A call asks permission; an event states a fact. Systems built on facts age better.


Every chapter so far has leaned on a quiet promise: that services can *learn* things without asking. `SeatSold` reached analytics in Chapter 1's trade-off, powered sagas in Chapter 5, carried facts across bounded contexts in Chapter 3. This chapter pays that debt in full. Event-driven architecture is not a messaging library choice; it is a different theory of how software communicates — facts announced rather than questions asked — and it now runs the checkout you used this morning, the fraud check that approved it, and the data pipelines feeding every AI system you will meet in Chapter 12.

The rigor matters because events fail differently than calls. A slow call is visible; a misdesigned event topology fails quietly — duplicated effects, out-of-order truths, workflows that exist only as folklore. By the end you will design events as carefully as you design APIs, wield event sourcing and CQRS where they earn their keep, and know exactly what "exactly-once" actually means (spoiler: less than the brochure says).

### 6.1 Event-Driven Fundamentals

#### Events, commands, and the direction of authority

The vocabulary must be sharp, because everything downstream depends on it. A **command** asks a specific receiver to do something and may be refused ("reserve seat 14B"). An **event** states that something *happened*, is past tense, owned by its producer, and refuses nothing ("SeatSold"). The direction of authority reverses: commands put the sender in charge of intent; events put each *consumer* in charge of reaction. That reversal is the whole style. Order doesn't know Notifications exists — and when organizer payouts arrive next quarter, they subscribe without Order changing a line. Decoupling in space (who), time (when), and load (how fast) — bought with one currency: nobody waits for anybody, so nobody *knows* about anybody either. This chapter is about enjoying the first clause while managing the second.

#### What rides inside the event

The most consequential small decision in the style:

| Pattern | Payload | Buys you | Bills you |
|---|---|---|---|
| **Notification** | just "it happened" + ID | tiny, never stale | every consumer calls back → hidden sync coupling |
| **Event-carried state transfer** | the relevant facts | consumers self-sufficient, producer stays quiet | schema discipline; payload bloat temptation |
| **Delta** | what changed | compact streams | consumers must replay history to know state |

*Figure 6.1 — Three payload philosophies. Default to event-carried state with a curated payload: the fields consumers legitimately need, not the producer's whole table — an event schema is an API, and Chapter 5's expand–contract rules apply verbatim.*

Add the producer's golden rule — events describe *the domain*, never the producer's implementation (`SeatSold`, not `SeatRowUpdated`) — and schema evolution discipline (additive changes; a registry enforcing compatibility in CI), and you have event design as contract design. This is the least glamorous and most valuable module in the chapter.

**Recap.** Commands request, events declare; authority moves to consumers. Payload choice is a coupling decision; event-carried state with curated fields is the default. Event schemas are APIs with the same evolution constitution.

**Exercise 6.1.** Take one message flowing in a system you know. Is it a command in event clothing ("SendEmailRequested")? If so, who is *actually* in charge, and what would the honest event be?

### 6.2 Event Streams as State

#### The log: a database turned inside out

A queue forgets a message once consumed. A **log** (the Kafka-class abstraction) remembers: an append-only, ordered, replayable record where consumers hold cursors. This single upgrade — from postal service to ledger — changes what events are *for*: a new consumer can arrive years later and replay history; analytics can reprocess with better logic; the stream stops being plumbing and becomes a record.

Push the idea to its limit and you reach **event sourcing**: the events *are* the state. Encore's Seat Inventory stops storing "14B: sold" and stores the ledger — `Reserved(14B)`, `Expired(14B)`, `Sold(14B)` — deriving current truth by replay (plus snapshots for speed). For an auditable, dispute-heavy domain like ticket sales, the ledger answers questions a state table cannot: *when* did it sell, after how many failed holds, in what order during the rush? The price is real: append-only thinking, upcasting old events as schemas evolve, and answering "current state" queries — which brings its natural partner.

> **The right to be forgotten vs. the ledger.** Privacy law meets an append-only log head-on: the fan demands erasure (GDPR-style); the ledger's whole value is never forgetting. Three design moves resolve the collision. **Crypto-shredding** — encrypt each person's fields with a per-subject key; erasure is deleting the key, leaving tombstoned ciphertext in an intact log. **PII-out-of-payload** — events carry stable pseudonymous IDs while personal data lives in one mutable, erasable store: the ledger records that `fan-8812` bought seat 14B forever; who `fan-8812` *is* remains deletable. **Retention windows** for streams that never needed forever. Encore combines the first two: the audit ledger survives disputes, and the person can still vanish. The trade-off in ink: key management becomes critical infrastructure, and a lost key store is an accidental mass erasure.

#### CQRS: two models, one truth

Command Query Responsibility Segregation splits the write model (aggregates guarding invariants — Chapter 3) from read models (projections built *from the events*, shaped per question):

<pre class="mermaid">
flowchart LR
    cmd([commands]) --> agg["Write model<br/><small>EventSeating aggregate</small>"]
    agg -- "events (the truth)" --> log[["Event log"]]
    log --> p1["Projection: seat-map view"]
    log --> p2["Projection: sales dashboard"]
    log --> p3["Projection: fan's tickets"]
    p1 & p2 & p3 --> q([queries])
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class log hot
</pre>

*Figure 6.2 — CQRS fed by an event log. Each projection is disposable — wrong shape? Rebuild from the log with new code. The log is the system of record; projections are opinions about it. The lag between write and projection is Chapter 4's replication lag wearing domain clothes: declared, monitored, and honest.*

> **The CQRS honesty clause.** Full event sourcing + CQRS is heavy machinery: two models, projection infrastructure, replay tooling. Encore applies it to Seat Inventory (audit-critical, contended, query-diverse) and *nowhere else*. Applying it uniformly is the Section 6.2 version of Chapter 3's tactical-DDD-everywhere mistake.

For integrating the legacy and the ordinary, one bridge pattern carries most traffic: the **transactional outbox** — write your state change and the outgoing event in one local transaction (to an outbox table), with a relay publishing from there; its cousin **change data capture** taps the database's own log to eventify systems that never heard of events. Both exist to kill the classic bug of "saved to DB, crashed before publishing."

**Recap.** Logs remember; queues forget. Event sourcing makes the ledger the truth — for domains that are ledgers at heart. CQRS shapes projections per question and makes them disposable. Outbox/CDC keep state changes and event publishing atomic.

**Exercise 6.2.** Name one entity in your world whose *history* answers questions its current state cannot. What would its event ledger contain?

### 6.3 Stream Processing

#### Partitions, ordering, and the delivery truth

Scale forces the log to partition, and partitioning sets the rules of the game: **order is guaranteed within a partition only**, so the partition key is a domain decision — Encore keys by `event_id` (the concert), making each on-sale a strictly ordered story while thousands of on-sales proceed in parallel. Consumer groups then divide partitions among instances, giving horizontal scale with per-key order — the trick behind every serious streaming system.

Then the truth about delivery, which every architect must be able to recite: *exactly-once delivery does not exist* between independent systems; failures plus retries make at-least-once the physical reality. What honest systems achieve is **exactly-once effect**: at-least-once delivery × idempotent consumers (Chapter 4's duty, now compulsory). Frameworks advertising exactly-once semantics achieve it inside their own transactional walls — valuable, real, and void the moment you call an external PSP from inside the pipeline.

#### Time and state in motion

Stream processors compute *while data flows* — fraud scores during the on-sale, not after it. Two hard problems define the craft. **Time**: event-time vs. arrival-time diverge (stadium Wi-Fi, mobile retries), so windows need watermarks — a declared patience for stragglers — and a policy for the too-late. **State**: "bot check: >5 purchases in 10 min" requires remembering, so stateful processors keep local, changelogged, partitioned state — which must be rebuilt on failover and reprocessed on logic changes. Replayability (Section 6.2's gift) is what makes *reprocessing* — running v2 of the fraud logic over last month — a routine operation instead of a data-science archaeology project.

**Recap.** Partition key = ordering scope = a domain decision. Exactly-once is effect, not delivery: at-least-once + idempotency. Event-time needs watermarks; stateful streaming needs rebuildable state; replay turns reprocessing into a feature.

**Exercise 6.3.** Your busiest data flow: what is its natural partition key, and what ordering does the business actually require? Are those two answers compatible today?

### 6.4 Workflows and Process Automation

#### Processes with names deserve engines

Choreography's weakness surfaces the day someone asks: *"where is order #881 stuck?"* When a workflow exists only as five services' reactions to each other's events, that question has no owner and no screen. For long-running, accountable processes — refunds with approval steps, payouts with dunning, anything involving humans and deadlines — Encore uses **process orchestration**: the saga orchestrator of Chapter 5 grown up into a workflow engine, where the process is *modeled explicitly*, versioned, monitored, and able to wait forty days without holding a thread.

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

*Figure 6.3 — Encore's refund process as an explicit model. Everything folklore choreography hides is visible: the human step with an SLA, the retrying PSP call, the business rule at re-listing. The engine emits events at every transition — orchestrated inside, choreographed at the edges, which is the mature hybrid.*

The dividing line, restated as doctrine: **choreograph the propagation of facts; orchestrate processes with names, owners, and deadlines.** And two anti-patterns to patrol for: the *event chain monolith* — six services that must fire in exact sequence for anything to work, i.e., lockstep coupling wearing async clothes — and *event spaghetti*, where nobody can say what happens after `SeatSold` without grepping four repos. The cure for both is the same: an event catalog (AsyncAPI-documented, discoverable) and explicit process models for anything with a name.

**Recap.** Folklore workflows fail the "where is it stuck?" test. Engines make processes explicit, waitable, and versioned. Hybrid is the end state: orchestrated cores, event-driven edges, and a catalog so the topology is knowable.

**Exercise 6.4.** Name one process at your work that has a business name ("onboarding," "settlement") but no explicit model — only code reacting to code. What would its Figure 6.3 diagram reveal?

### 6.5 Flow — Streams as Products

The last move is a promotion: from events as integration plumbing to **streams as products** — discoverable, documented, schema-governed, SLO-carrying assets that teams *subscribe to* the way they call APIs. Encore's `ticket-sales.v2` stream has an owner, a contract, a lag SLO, and three consumers the producer has never met; when a data-science team builds demand forecasting in Chapter 12, they subscribe — no meetings, no export jobs. This is the bridge this chapter lays toward Chapter 9 (data mesh is this idea at analytical scale) and Chapter 14 (the platform serves streams the way it serves compute). Interoperability standards — CloudEvents for envelopes, AsyncAPI for contracts — keep the product promise portable across brokers and clouds.

**Recap.** Streams with owners, contracts, and SLOs are products; subscription replaces coordination. This is the seed of data mesh and a core platform service.

**Exercise 6.5.** If your most valuable internal data flowed as a product-grade stream tomorrow, which team would subscribe first, and what would they stop asking you for?

### Kata: The Event Backbone

> **Your brief: "Loop."** Food-delivery startup, 30 engineers. Orders flow: placed → restaurant accepts → courier assigned → picked up → delivered (or any of five failure exits). Today it runs on synchronous calls and a nightly CSV to analytics; couriers' apps poll every 5 seconds and the restaurant tablet misses updates. New asks: live order tracking, courier surge-pricing (needs 10-minute demand windows), a refund process with human review, and a fraud team that wants to "see everything, later."

**Deliverables:**

1. **Event catalog** — the domain events with payload philosophy per event (Figure 6.1) and schema-evolution rules.
2. **Topology** — brokers/logs, partition keys with ordering rationale, consumer groups; where CQRS projections serve the tracking screens.
3. **Process model** — the refund workflow, Figure 6.3 grade, orchestration engine at the core, events at the edges.
4. **Delivery honesty** — for courier assignment: the at-least-once story, the idempotency mechanism, and what the courier sees on a duplicate.
5. **One ADR** — polling → push migration for courier apps, losses included.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Fact vs. command | Are events past-tense facts, or RPC wearing a costume? |
| Ordering by design | Does every ordering guarantee trace to a partition key choice? |
| Effect honesty | Is exactly-once claimed anywhere delivery crosses a system boundary? |
| Named processes | Does everything with a business name have an explicit, ownable model? |

#### Where you now stand

You can design facts, own truths in logs, process them in motion, and give processes engines and names. The next chapter turns to the boundary where your system meets everyone else's — the API: the promise you publish, version, defend, and operate. Events organize your inside; APIs are your outside.

### References

- Adam Bellemare — [*Building Event-Driven Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-event-driven-microservices/9798341622180/) O'Reilly, 2025.
- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) O'Reilly, 2025.
- Bernd Rücker — [*Practical Process Automation*](https://www.oreilly.com/library/view/practical-process-automation/9781492061441/). O'Reilly, 2021.
- Gwen Shapira, Todd Palino, Rajini Sivaram, Krit Petty — [*Kafka: The Definitive Guide*, 2nd ed.](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/) O'Reilly, 2021.
- James Urquhart — [*Flow Architectures*](https://www.oreilly.com/library/view/flow-architectures/9781492075882/). O'Reilly, 2021.
- Tyler Akidau, Slava Chernyak, Reuven Lax — [*Streaming Systems*](https://www.oreilly.com/library/view/streaming-systems/9781491983867/). O'Reilly, 2018.
- Ben Stopford — [*Designing Event-Driven Systems*](https://www.confluent.io/resources/ebook/designing-event-driven-systems/). Confluent/O'Reilly, 2018 — free ebook.
- Gregor Hohpe, Bobby Woolf — [*Enterprise Integration Patterns*](https://www.enterpriseintegrationpatterns.com/). Addison-Wesley, 2003.

---

## Chapter 7: API Architecture — Contracts, Traffic, and Evolution {#ch7}

> An API is a promise made to strangers. Architecture is deciding which promises you can keep.


Encore is about to do something irreversible: publish an API. Venues want to embed ticket sales; resale partners want inventory feeds; a festival's app wants checkout inside their own brand. The moment the first partner ships against `api.encore.com`, Encore acquires consumers it cannot see, cannot version by email, and cannot break without consequences measured in contracts and lawyers.

That is what makes API architecture its own discipline rather than "REST conventions." Internal seams (Chapters 5–6) connect teams who share a Slack; APIs connect strangers across trust and time. This chapter covers the full arc: designing contracts that model the business honestly, evolving them without breakage, operating them as traffic infrastructure, securing them against an internet that will absolutely try, and running the whole thing as a product. The platform lens runs throughout: an API program is the first platform most companies ever build, whether they notice or not.

### 7.1 Designing APIs

#### Model the business, not the database

The beginner's API is the database with URLs: `GET /tables/orders?join=...`. The architect's API models the *domain's affordances* — what a consumer may meaningfully do: browse events, hold seats, purchase, refund. The test: could a partner integrate without a diagram of your schema? Three design decisions carry most of the weight:

**Resources and workflows.** Nouns get resources (`/events/{id}/seats`); multi-step business processes get *workflow resources* rather than abused verbs. Encore's seat hold — a temporary claim with a five-minute TTL — becomes `POST /holds` returning a hold resource with an expiry, not a `?action=lock` bolted onto a seat. Long-running operations return `202 Accepted` plus a status resource to poll — never a connection held open in hope.

**Errors as contract.** Partners integrate against your failures more than your successes. Structured error bodies (RFC 9457 problem details), stable machine-readable codes, and the golden rule: an error must tell the caller *whose move it is* — fix your request, retry later, or give up.

**Idempotency keys.** Chapter 4's duty, formalized at the edge: `POST /purchases` accepts an `Idempotency-Key`; retries replay the stored outcome instead of double-charging. No money-touching API ships without it.

#### Choosing the protocol like an adult

| | REST/HTTP+JSON | gRPC | GraphQL |
|---|---|---|---|
| Sweet spot | public APIs, broad reach | internal service-to-service, low latency | client-driven aggregation, many UIs |
| Typing | schema by discipline (OpenAPI) | strict, compiled | strict schema, flexible queries |
| Caching | HTTP-native, superb | roll your own | hard (POST-shaped) |
| Client diversity | anyone with curl | generated stubs | needs tooling investment |
| Failure surface | familiar | deadline/cancel built in | one endpoint, complex authz per field |

*Figure 7.1 — The protocol decision, arbitrated as always by characteristics. Encore's answer is boringly correct: REST for the public API (reach, cacheability), gRPC where Chapter 5's services chat on the hot path, GraphQL nowhere — until Chapter 8 gives its BFFs a reason.*

Contract-first is the working method regardless of protocol: the OpenAPI (or AsyncAPI, for Chapter 6's streams) document is written, reviewed, and linted *before* code, because the contract outlives every implementation that serves it.

**Recap.** APIs model affordances, not tables; workflows get resources; errors and idempotency are contract, not garnish. Protocol choice is a characteristics decision, and the contract document precedes the code.

**Exercise 7.1.** Design the resource and verb set for Encore's seat hold → purchase flow, including the 402-decline and hold-expiry errors. Whose move is it after each?

### 7.2 Evolution and Compatibility

#### Breaking changes are a tax on strangers

Chapter 5's expand–contract discipline returns with higher stakes: internal consumers redeploy weekly; the festival app ships through app-store review and may pin your API for a year. The constitution:

- **Additive forever.** New optional fields, new endpoints, new enum values (announced as open sets) — free.
- **Never repurpose.** Changing a field's meaning is worse than removing it: removal fails loudly, repurposing corrupts quietly.
- **Tolerant readers on both sides.** Consumers ignore unknowns; providers treat absent-new-fields as defaults.
- **Version as last resort.** A `v2` is not a release cadence; it is an admission that expand–contract failed. When needed: URL-versioned (`/v2/`), both live, migration funnel measured, `v1` sunset with dates in writing (`Deprecation` and `Sunset` headers, dashboards of laggard partners, and a human on the phone for the last three).

Hypermedia earns its pragmatic mention here: links in responses (`"cancel": {"href": ...}`) let servers move workflows without breaking clients that follow links instead of hardcoding paths. Ideology optional; the evolvability is real, and Encore uses it exactly where workflows are likeliest to change.

**Contract tests as border control.** The provider's CI replays every registered consumer's expectations (Chapter 5's machinery, now including *external* partners' published usage) — so "would v-next break the resale partner?" is a red build on Tuesday, not an outage on Friday.

**Recap.** Additive-only is the default physics; repurposing is the cardinal sin; v2 is a confession with a funnel and a sunset date. Links buy workflow evolvability; contract tests turn breakage into CI signal.

**Exercise 7.2.** Encore must split `price` into `base_price` + `fees` (regulatory). Design the no-break migration: field strategy, timeline, and what the last unmigrated partner experiences at sunset.

### 7.3 API Traffic Management

#### The gateway earns its place at the edge

Public traffic enters through an **API gateway**, and the design question is what belongs there. The clean rule: *cross-cutting yes, business logic no* — authentication, rate limiting, quotas, caching, request shaping, canary routing live at the edge; anything that knows what a "seat" is belongs in services.

> **The new-ESB trap.** Every gateway product will happily host routing rules that transform payloads, orchestrate calls, and accrete business logic — congratulations, you have rebuilt the enterprise service bus and must now deploy your middleware to change your product. If a gateway config change requires a domain expert's review, logic has leaked upward.

North–south (edge) traffic is the gateway's job; east–west (service-to-service) belongs to Chapter 5's mesh — same mechanics, different trust context; collapsing the two couples your partner surface to your internal topology.

<pre class="mermaid">
flowchart LR
    p([Partners & apps]) --> gw["Gateway<br/><small>authn · quotas · rate limits · canary</small>"]
    gw --> bff["BFFs (Chapter 8)"]
    gw --> pub["Public API services"]
    subgraph internal["Internal — mesh territory (mTLS, retries, telemetry)"]
        pub --> inv["Inventory"] & ord["Orders"]
        bff --> inv
    end
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class gw hot
</pre>

*Figure 7.2 — Edge vs. interior. The gateway speaks to strangers about quotas; the mesh speaks to family about retries. Different conversations, different machinery.*

**Rate limiting as fairness engineering.** Per-partner quotas (the contract), burst allowances (token buckets), and — Encore's specialty — *event-scoped* limits during on-sales so one partner's enthusiastic polling cannot starve another's checkout. Limits are documented, returned in headers (`RateLimit-*`), and enforced with `429 + Retry-After`: predictable rejection is a feature; mysterious slowness is a support ticket.

**Releases at the edge.** Canary by header, partner tier, or percentage; shadow traffic (mirror production requests to v-next, discard responses) as the highest-fidelity test ever invented — Section 7.2's contract tests catch semantic breaks, shadows catch performance ones.

**Recap.** Gateways own cross-cutting edge concerns and must be defended against becoming ESBs; mesh owns the interior. Rate limits are contracts with headers. Canary and shadow traffic make API releases observable experiments.

**Exercise 7.3.** List everything your current edge (gateway, LB, nginx) does. Sort into "cross-cutting" and "knows the domain." The second column is your leak inventory.

### 7.4 API Security

#### The internet is a hostile integration partner

Encore's API now fronts money and scarce inventory — precisely what OWASP's API Top 10 describes being looted. The architecture-level defenses:

**OAuth 2.x / OIDC, cast correctly.** Fans in apps: authorization-code + PKCE. Partners' servers: client-credentials with scoped, short-lived tokens. Nobody: passwords in API calls, long-lived static keys in mobile binaries. Scopes model *affordances* (`holds:write`, `events:read`) — Section 7.1's design vocabulary becoming the authorization vocabulary is not a coincidence; it is the sign both were modeled on the domain.

**Tokens without folklore.** JWTs: short-lived, audience-bound, algorithm-pinned, verified at the gateway *and* relied upon downstream via the mesh's identity (defense in depth, Chapter 10's zero-trust preview). Opaque tokens + introspection where revocation latency matters more than validation cost.

**The Top-10 habits.** The two that eat ticketing companies: *broken object-level authorization* — `GET /orders/{id}` must check the caller owns order `{id}`, on every object, every time (the gateway cannot do this; only the service knows) — and *unrestricted resource consumption* — which for Encore includes bots enumerating seat holds to lock inventory, why Bot Screening (Chapter 2) sits in front of exactly this API. Both become fitness functions: authorization tests per endpoint in CI, abuse scenarios in the load suite.

**Recap.** Right OAuth flow per audience; scopes model affordances; JWTs short, bound, and pinned. Object-level authorization is the service's burden and the auditor's first question. Abuse resistance is load-tested, not assumed.

**Exercise 7.4.** For `GET /holds/{id}`: enumerate every caller class (fan, partner, support tool) and write the object-level rule each must satisfy. Now check — where in your design is that rule *enforced*?

### 7.5 Running an API Program

An API with users is a product with a roadmap, whether staffed as one or not. The program disciplines: **developer experience** as conversion funnel (time-to-first-successful-call under ten minutes: instant sandbox keys, copy-paste quickstarts, docs generated from the OpenAPI contract so they cannot drift); **governance as linting** — style rules (naming, pagination, error shape) enforced by spectral-style checks in CI, so consistency across teams' APIs comes from tooling, not review meetings (Chapter 5's paved road, applied to contracts); and **lifecycle honesty** — every endpoint has an owner, a tier, an SLO, and a deprecation policy from birth. Encore's API portal is, quietly, its first platform product: self-service onboarding, golden-path contracts, guardrails in CI. Chapters 13 and 14 will scale that pattern from one surface to the whole company.

**Recap.** DX is measured in minutes-to-first-call; governance ships as lint rules; every endpoint is born with owner, SLO, and an exit policy. The API program is platform thinking in miniature.

**Exercise 7.5.** Time a colleague (or yourself, honestly) from zero to first successful call against your team's API. Every minute past ten, name the friction that spent it.

### Kata: The Public API

> **Your brief: "Atlas."** A freight-visibility company: shippers embed tracking into their portals. Assets: container positions (updated ~hourly), customs status (event-driven, from Chapter 6-style streams), ETA predictions (ML, revised continuously). Consumers: five enterprise shippers (SLA contracts, SOC2 questionnaires), ~200 mid-market integrators (self-service), and one giant retailer that "will send 50× everyone else's traffic and negotiate like it." Regulatory note: customs data is per-country restricted.

**Deliverables:**

1. **Contract** — OpenAPI sketch: resources for shipments, positions, customs events, ETAs; error catalog with whose-move-is-it semantics; webhook or stream design for push consumers.
2. **Evolution policy** — additive rules, the ETA-model-v2 migration plan, sunset mechanics.
3. **Edge design** — Figure 7.2-grade diagram; per-tier quotas including the retailer problem; canary strategy.
4. **Security architecture** — flows per consumer class, scope model, the object-level rule for per-country customs data, and its enforcement point.
5. **Program sheet** — DX funnel targets, three lint rules you'd enforce from day one, and each endpoint's tier/SLO.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Affordance modeling | Could a shipper integrate without seeing your schema? |
| Stranger-proof evolution | Does the ETA v2 plan survive a consumer who ignores your emails for a year? |
| Fairness engineering | Does the retailer's 50× live within designed limits, or negotiated exceptions? |
| Enforcement placement | Is every authorization rule enforced where the knowledge lives? |

#### Where you now stand

You can promise carefully, evolve without breakage, and operate the edge as infrastructure and product. But every response you now serve ends its journey somewhere this book has not yet looked: a browser, a phone, a screen a human is staring at. The frontend has its own architecture — rendering economics, composition at team scale, its own security perimeter — and pretending it is "just the view layer" is how decomposed backends get undone by page one. Chapter 8: UI architecture.

### References

- Mike Amundsen — [*RESTful Web API Patterns and Practices Cookbook*](https://www.oreilly.com/library/view/restful-web-api/9781098106737/). O'Reilly, 2022.
- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- JJ Geewax — [*API Design Patterns*](https://www.manning.com/books/api-design-patterns). Manning, 2021.
- Arnaud Lauret — [*The Design of Web APIs*, 2nd ed.](https://www.manning.com/books/the-design-of-web-apis) Manning.

---

## Chapter 8: UI and Frontend Architecture {#ch8}

> Users never see your architecture. They see the pixels it earned them.


Here is an uncomfortable audit: Encore's backend now boasts extracted services, an event backbone, and a hardened API — and a fan on a phone in a stadium parking lot still waits four seconds for the seat map. Every characteristic Chapter 1 promised — elasticity, availability, speed — is ultimately *experienced* in a browser or an app, and the frontend has quietly become its own architectural domain: with rendering economics, composition models, state disciplines, and a security perimeter that backend thinking maps onto badly.

This chapter treats the frontend at the architect's altitude. Not React-vs-whatever — framework debates age like fish — but the decisions underneath any framework: where rendering happens, how frontend code scales with *teams*, where the frontend–backend seam sits, and what the AI era does to the interface itself. The habit to bring: the frontend is not the end of the pipeline; it is the part of the system your users actually run.

### 8.1 Rendering Architectures

#### Where the pixels come from is an architecture decision

Every page answers one question: is HTML assembled on the client, on a server, or ahead of time? The spectrum, with its economics:

| Strategy | HTML assembled | First paint | Freshness | Server cost | Fits |
|---|---|---|---|---|---|
| **CSR** (SPA) | in the browser | slow (bundle first) | live | tiny | logged-in tools, editors |
| **SSR** | per request | fast | live | per-request | personalized, SEO-critical pages |
| **SSG** | at build time | fastest | stale until rebuild | ~zero | marketing, docs |
| **ISR / SSG+revalidate** | build + timed refresh | fastest | minutes-stale | tiny | catalogs, listings |
| **Islands / partial hydration** | server, JS only where needed | fast | mixed | small | content pages with pockets of app |
| **Edge SSR** | per request, near the user | fast globally | live | per-request | personalized + global |

*Figure 8.1 — The rendering menu. The architect's move is refusing to buy one row for the whole product: rendering is chosen per page class, exactly as Chapter 4 bought consistency per invariant.*

Run Encore through it. The **event catalog** — read by millions, changed weekly — is ISR: static speed, minutes of staleness the business already accepted in Chapter 4's cache table. The **seat map** during an on-sale — personal, live, interactive — is CSR inside an SSR shell, fed by real-time updates (Section 8.4). **Checkout** — personalized, SEO-irrelevant, correctness-critical — is SSR, minimal JavaScript, no cleverness near money. Three page classes, three rows, one product.

Underneath every row sits the CDN, which deserves a paragraph rather than a footnote. Static acceleration is nearly free performance: the ISR'd catalog and every bundle live at the edge, so a global tour announcement is served meters from the fan, not continents. Dynamic acceleration — running rendering or personalization itself at the edge — earns its keep only when the data it needs is *also* edge-readable; an edge function that phones home per request has merely moved the latency, with a markup. Encore's rule: cache at the edge aggressively, compute at the edge sparingly, and keep the seat map's truth at home.

#### Performance is a characteristic with a name

Core Web Vitals (loading, interactivity, visual stability) are Chapter 1 characteristics wearing Google's naming: measurable, business-correlated (conversion drops per 100 ms are the most replicated result in web commerce), and budgetable. The discipline is **performance budgets as fitness functions**: the CI fails when the checkout bundle exceeds 150 KB or LCP regresses past 2 s on a mid-tier phone profile — because entropy always wins against intentions, and never against a red build.

**Recap.** Rendering is chosen per page class from a priced menu; Encore uses three strategies on one product. Web vitals are architectural characteristics; budgets in CI are their fitness functions.

**Exercise 8.1.** Classify five screens of a product you know into Figure 8.1's rows. Which screen is currently bought from the wrong row, and what is it costing?

### 8.2 Structuring the Frontend

#### Team-scale, not component-scale

Frontend codebases fail at the same scale backends do: the moment several teams share one. The structural toolkit mirrors Chapter 2's, one level down. The **design system** — tokens, components, patterns with an owner and a versioning policy — is the frontend's shared kernel: the one dependency every team accepts in exchange for coherence (kept *thin*, per Chapter 3's shared-kernel rule — absorb business components and it becomes a coordination chokepoint). **Module boundaries** inside the app follow bounded contexts, not technical layers — `catalog/`, `checkout/`, `organizer/` — each owning its routes, state, and API calls, enforced by the cycle-detection fitness functions the Chapter 2 monolith ran; a monorepo makes enforcement cheap, at the price of build tooling someone must own.

#### State: the frontend's hardest problem, demystified

Most frontend complexity is state handled without a taxonomy. There are only three kinds, and they want different machinery:

| Kind | Examples | Right machinery |
|---|---|---|
| **Local UI state** | open modal, input draft | component state; nothing fancier |
| **Server cache** | events, seats, orders — *the backend's truth, borrowed* | query cache with staleness policy (stale-while-revalidate) |
| **Genuine global client state** | auth session, cart-in-progress, theme | small explicit store |

*Figure 8.2 — The state taxonomy. The classic disaster is one global store holding all three: server truth goes stale in it, UI trivia churns it, and every component couples to everything. Most "global state" is server cache in denial — treat it as the caching problem Chapter 4 already taught, staleness policy and all.*

Data fetching completes the module: request **waterfalls** (component renders → fetches → child renders → fetches...) are the frontend's sequential-call latency sin from Chapter 4, and the cures rhyme — declare data needs at the route level, fetch in parallel, prefetch on intent (hover, viewport). The seat map that took four seconds? Three sequential waterfalls and an unbudgeted bundle. Now you know the audit.

**Recap.** Design system as thin shared kernel; module boundaries along contexts with enforced rules; state sorted into three kinds with server-cache treated as caching, not global state. Waterfalls are sequential calls wearing JSX.

**Exercise 8.2.** Open your product's slowest screen and trace its requests. Draw the waterfall. Which fetches could be parallel or prefetched, and what route-level declaration would do it?

### 8.3 Micro-Frontends and Composition

#### The honest question: how many teams?

Micro-frontends promise team-independent frontend deployment — Chapter 5's argument one layer up, with the same prerequisite: a *team-coordination problem, measured in waiting*. One team? Pure cost. Encore's nine teams with two frontend-heavy ones? A modular monolith frontend (Section 8.2 boundaries, one deploy) serves fine, with one exception worth its price: the **organizer portal** — different users, different release cadence, different risk tolerance than the fan storefront — ships as a separate application behind the same design system. That is micro-frontends at its most defensible: split along *experience* seams, not component seams.

For organizations that do need runtime composition, the menu with prices: **build-time packages** (a library wearing the name — re-couples deploys), **runtime module federation** (true independence; version discipline required), **iframes** (bulletproof isolation, miserable seams), **edge-side composition** (strong for content, weak for rich interaction). Every runtime option pays three taxes the monolith frontend never sees: payload duplication, UX consistency drift, and a *shell* — the router/auth/composition layer, now a product needing an owner (Chapter 14 will name it: platform).

> **The distributed monolith, browser edition.** If your micro-frontends must release together because they share state shape, route contracts, or a redux store — you have the deployment independence of a monolith plus the payload of a federation. The Chapter 5 test applies verbatim: can this piece ship alone, unannounced?

**Recap.** Micro-frontends are bought with team-scale coordination pain, split along experience seams. Runtime composition taxes payload, consistency, and demands an owned shell. Most products deserve a modular monolith frontend and one honest exception.

**Exercise 8.3.** Count the frontend teams touching your main app and their release collisions last quarter. Verdict: modular monolith, one split, or federation — and which seam?

### 8.4 The Frontend–Backend Seam

#### BFFs: one experience, one aggregator

Chapter 5 warned against the screen that calls nine services; the **backend-for-frontend** is the standing answer. Each *experience* — fan app, organizer web, partner embed — gets its own thin aggregation layer, owned by the frontend team that consumes it: it fans out to services (in parallel — it exists to kill client-visible waterfalls), shapes responses to screen needs, and holds the tokens so the browser doesn't have to (Section 8.5 will thank it).

<pre class="mermaid">
flowchart LR
    fan([Fan app]) --> fbff["Fan BFF<br/><small>owned by fan-web team</small>"]
    org([Organizer web]) --> obff["Organizer BFF"]
    fbff --> cat["Catalog"] & inv["Inventory"] & ord["Orders"]
    obff --> cat & ana["Analytics"]
    inv -. "SSE: seat updates" .-> fan
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class fbff,obff hot
</pre>

*Figure 8.3 — BFFs per experience. Ownership is the subtle part: the BFF belongs to the frontend team, because it changes at the screen's cadence, not the services'. A shared "general-purpose BFF" is just an API gateway growing business logic — Chapter 7's ESB trap, one floor up.*

GraphQL earns its Chapter 7 rain check here: when many screens need flexible slices of many services, a federated graph *is* a BFF strategy — typed, client-driven, cache-normalized — at the price of per-field authorization and an owned graph. Encore's two experiences don't justify it; forty screens across six teams would.

**Real-time and the optimistic contract.** The seat map wants server push: SSE for one-way streams (seat availability — Encore's choice: HTTP-native, proxy-friendly, auto-reconnecting), WebSockets when the client talks back. Behind both stands Chapter 6's event backbone — the browser is simply the last subscriber. One honesty note: every open connection is *state*, so the socket-holding tier is not Section 4.3's stateless fleet — keep it thin, separate, and reconnect-tolerant, and the stateless rules still govern everything behind it. And because Chapter 4's physics reaches fingertips: **optimistic UI** applies local effect immediately, reconciles on the server's answer, and must *design the apology* — the fan who tapped a seat that was gone gets an instant, graceful "taken — here are three nearby," not a spinner and a shrug.

**Recap.** BFFs are per-experience, frontend-owned, waterfall-killing aggregators; GraphQL is a BFF strategy for many-screen scale. Real-time UIs are event subscribers; optimistic UI is eventual consistency with manners.

**Exercise 8.4.** Design the optimistic flow for Encore's seat tap: local effect, reconciliation, and the apology path. What does the fan see at 200 ms, 800 ms, and on conflict?

### 8.5 Security, Accessibility, and AI Interfaces

#### The browser is a hostile runtime you don't control

Frontend security inverts backend instincts: your code executes beside adversarial code, in an environment the user extends with plugins you've never heard of. The load-bearing decisions: **token custody** — access tokens in JavaScript-readable storage are XSS loot; Encore's BFFs hold the tokens and give browsers only `HttpOnly`, `Secure`, same-site session cookies (the BFF earning its keep twice); **Content-Security-Policy** as the browser's execution allowlist — deployed in report-only first, then enforced, turning "any injected script runs" into "nothing unvetted runs"; and the standing rule that *rendering user content is code execution until proven otherwise* — sanitization is a library choice, not a homemade regex.

**Accessibility as characteristic, not sprint task.** Like security, a11y is architectural because retrofits fail: semantic structure, keyboard paths, and contrast tokens live in the design system (one fix, every team) and in CI checks — Encore's seat map ships with a keyboard/screen-reader seat picker *designed*, not patched, because a fan who can't operate the picker in 90 seconds of on-sale isn't inconvenienced; they're excluded.

**The AI-era interface.** Chapter 12 will build model-backed features; the frontend meets them first. Three patterns to hold: **streamed responses** (tokens render as they arrive — perceived latency is the only latency users feel; the SSE machinery from Section 8.4 reused verbatim); **generative UI discipline** (model output renders into *vetted components* — cards, lists, forms — never raw HTML: injection isn't just a security issue now, it's a correctness one); and **human-in-the-loop affordances** (AI-suggested actions arrive as *proposals with visible undo*, because trust is a UX property before it is a model property).

**Recap.** BFF-held tokens + CSP + sanitization form the browser perimeter; a11y lives in the design system and CI or nowhere; AI features stream into vetted components with undo as a first-class affordance.

**Exercise 8.5.** Audit any form you own: where do tokens live, what does CSP allow, what renders user input? Three answers, three possible incidents.

### Kata: The Storefront

> **Your brief: "Bloom."** A florist marketplace: 2,000 independent shops, buyers mostly arriving from search and Instagram links (SEO and first-paint decisive), a shop-owner portal (orders, arrangements, deliveries) used all day on tablets, and same-day delivery tracking that changes minute-to-minute. Eight engineers: six product, two "the ones who like frontend." Mother's Day is Bloom's on-sale: 30× traffic, 70% of it first-time visitors on phones.

**Deliverables:**

1. **Rendering matrix** — every page class mapped to Figure 8.1's rows, with the Mother's Day column: what stays fast when traffic is 30×?
2. **Structure plan** — module boundaries, the state taxonomy applied (what is server cache? what is genuinely global?), and two performance budgets with CI enforcement.
3. **Composition verdict** — buyer storefront vs. shop portal: one app, two apps, or federation? Argued from team count, not fashion.
4. **Seam design** — BFF(s) with ownership, the delivery-tracking push channel, and the optimistic flow for "claim this delivery slot."
5. **One ADR** — token custody and CSP posture for a site embedding shop-owner-authored content.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Per-class rendering | Does Mother's Day traffic hit static/ISR paths, or servers? |
| State honesty | Is anything global that is really server cache? |
| Team-scale sizing | Is the composition answer sized to eight engineers? |
| Perimeter placement | Could an XSS in a shop's bio reach a buyer's session? |

#### Where you now stand

The pixels now have an architecture: rendering bought per page, state sorted, seams owned, perimeter drawn. Behind every screen you've built, though, stands the question this book has deferred twice already: who owns the *data* — operationally, analytically, and at the scale where every team wants everyone else's tables. Chapter 9: data architecture, from distributed ownership to the data mesh.

### References

- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Michael Geers — [*Micro Frontends in Action*](https://www.manning.com/books/micro-frontends-in-action). Manning, 2020.
- Ilya Grigorik — [*High Performance Browser Networking*](https://hpbn.co/). O'Reilly, 2013 — free online.

---

## Chapter 9: Data Architecture — From Distributed Data to Data Mesh {#ch9}

> Code is what a system does; data is what it knows. Split the doing, and the knowing demands a constitution.


Decomposition, this book has repeatedly promised, sets teams free. Data is where the promise gets audited. The moment Chapter 5 made every service's database private, three old comforts died quietly: the cross-domain `JOIN`, the all-embracing transaction, and the analyst's beloved "one big database where everything lives." Encore's teams now ship independently — and the finance report that once was one query is suddenly a distributed-systems problem with a deadline.

This chapter rebuilds data architecture for the decomposed world, in two movements. First, the *operational* half: who owns which data, how services answer joined-up questions without re-coupling, and what replaces the transactions we gave up. Second, the *analytical* half: why the centralized warehouse pipeline breaks at organizational scale, and how the data mesh — domain ownership, data as a product, self-service platform, federated governance — applies this book's own logic to analytics. The through-line: every data problem here is an *ownership* problem before it is a technology problem.

### 9.1 Data Ownership in Distributed Systems

#### One writer per table, and the three hard cases

The baseline rule is Chapter 3's aggregate discipline at fleet scale: **every table has exactly one owning service; only the owner writes.** Reads are negotiable (Section 9.2); writes never are — a table with two writers is two services sharing one undeclared contract, deployable only together. Real domains produce three ownership shapes: **single** (Catalog owns events — trivial, and most of your data), **common** (everyone "needs" audit records — solve with one owning service and an API, or events into an owned store; never a shared table), and **joint** — two services legitimately claiming one concept, the genuinely hard case. Encore's: who owns a *sale*? Orders (the workflow) and Finance (the ledger) both have claims. The senior resolution is usually a **split by meaning**: the *sale-as-process* belongs to Orders; the *sale-as-accounting-fact* belongs to Finance, populated by `SaleCompleted` events. One word, two models, two owners — Chapter 3's bounded-context lesson, now applied to storage.

Ownership settled, each owner still chooses its store — an access-pattern decision, not a fashion one:

| Store family | Buy it for | It punishes |
|---|---|---|
| Relational | invariants, joins, transactions — the default until proven otherwise | massive write fan-out |
| Document | read-mostly aggregates fetched whole | cross-document invariants, ad-hoc joins |
| Key-value | extreme simple-op throughput (sessions, holds) | any query beyond the key |
| Column-family | append-heavy volume with known query paths | flexible queries, transactions |
| Graph | relationship-first questions (fraud rings) | everything else |

Encore runs relational for Orders and the ledger (the invariants live there), key-value for the Gate's holds, and resists a fifth engine until a real query demands it. The senior failure is rarely the wrong row; it is five different rows for one team's whims.

#### What replaced the transaction

For workflows spanning owners, Chapter 5's sagas carry the how; this module adds the *consistency patterns* underneath, in rising order of decoupling: **background sync** (batch reconciliation — Encore's nightly finance close; embarrassingly effective), **orchestrated** (the saga's explicit process), and **event-based** (owners react to facts — the default for propagation). And one pattern to refuse: two-phase commit across services. 2PC buys atomicity by making every participant hostage to the slowest and the deadest; in a world of independent deploys and Chapter 4 physics, it converts partial failure into total unavailability — the trade running exactly backward.

> **Eventual consistency is a business conversation, not an apology.** "The dashboard trails reality by up to a minute" is a *requirement statement* the business can price. Chapter 4 taught the spectrum; this module's job is pinning each cross-owner flow to a rung — with the stakeholder's signature, not the engineer's guess.

**Recap.** One writer per table, always; common data gets an owner, joint data gets split by meaning. Sagas, events, and humble batch replace 2PC, which is refused on principle. Staleness is negotiated with the business, per flow.

**Exercise 9.1.** Find a table (or concept) in your world with two writers. Split it by meaning: name the two models, their owners, and the event that connects them.

### 9.2 Distributed Data Access

#### Answering questions nobody owns

The fan's account page needs orders + tickets + refund status: three owners, one screen. The access menu, priced:

| Pattern | Mechanism | Freshness | Bill |
|---|---|---|---|
| **API composition** | call each owner, join in the BFF | live | latency stacks (Chapter 4 tails); fine for 2–3 owners |
| **Replicated read model** | subscribe to owners' events, keep a local copy shaped for your queries | seconds-stale | you now run a projection (Chapter 6's CQRS, cross-service) |
| **Data domain / shared read store** | several services share a *read-only* store fed by owners | seconds-stale | shared schema governance returns |
| **CDC-fed cache** | change-data-capture streams into a query store | seconds-stale | pipeline to operate; schema coupling to guard |

*Figure 9.1 — The access menu. Composition for screens, replicated read models for query-heavy needs, CDC for eventifying the reluctant. The pattern that is missing is the point: reaching into another service's tables — reads today become joins tomorrow become "why can't they change their schema" forever.*

The load-bearing idea is the middle rows: **the query moves to a copy shaped for it, and the copy is fed by contracts** (events, CDC-with-published-schema), never by trespass. Encore's account page: a replicated read model in the Fan-BFF's keeping, subscribed to three owners' streams — page loads in one query, owners evolve freely, staleness declared at "seconds," signed off by product.

One unglamorous discipline completes the module, because every owner eventually changes its own schema *under traffic*. Zero-downtime migration is expand–contract wearing database clothes, four phases, each reversible until the last: **expand** (add the new shape; old code ignores it), **dual-write** (new code writes both; old readers undisturbed), **backfill** (migrate history in throttled, verified batches), **contract** (switch reads, watch a full business cycle, then drop the old shape — the only irreversible rung, climbed last). Encore's `price` → `base_price` + `fees` split (Chapter 7's regulatory change) ran this ladder over three weeks — boring, observable, reversible until the last rung. The boringness is the achievement.

**Recap.** Cross-owner questions get copies fed by contracts: composition for shallow joins, projections for deep ones, CDC for legacy. Direct foreign reads are the coupling you'll regret at the next schema change.

**Exercise 9.2.** Take your product's heaviest cross-domain screen. Which row of Figure 9.1 serves it today? Which *should* — and what contract would feed the copy?

### 9.3 Analytical Architectures

#### The pipeline that breaks at org-scale

Analytics has its own architectural lineage: the **warehouse** (structured, governed, SQL truth), the **lake** (everything raw, schema-on-read, cheap), and the **lakehouse** (open table formats bringing warehouse discipline to lake storage — the current default). Any of them can store Encore's data. What breaks at scale is not storage but the *operating model* wrapped around it: a central data team extracting from every domain's databases through pipelines they must maintain but whose sources they don't control. Every upstream schema change breaks a pipeline the domain team never sees; every new question queues behind a team that understands the tables but not the ticketing business. The central team becomes what Chapter 5 called the coordination machine — a monolith made of ETL. Two structural repairs precede any mesh talk: **streaming analytics** (Chapter 6's backbone feeding dashboards continuously — the nightly CSV was a batch apology for missing events) and **data contracts** — published schemas with compatibility guarantees on every analytical feed, turning "your change broke finance's dashboard" from a Friday surprise into a failed CI check on the *producer's* build. Contracts move breakage to where the knowledge lives; that principle is about to become a whole architecture.

**Recap.** Lakehouse is the storage default; the real failure is organizational — central pipelines coupling to schemas they don't own. Streaming feeds and producer-side contracts are the repairs that scale.

**Exercise 9.3.** Trace one dashboard at your work back to its sources. How many schema changes away is its breakage, and who finds out first — the changer or the dashboard's owner?

### 9.4 Data Mesh

#### The book's own logic, applied to analytics

Read the mesh's four principles as this chapter's greatest hits reassembled: **domain ownership** (the ticketing team owns ticketing's analytical data — Conway, Chapter 3); **data as a product** (streams with owners, contracts, SLOs — Section 6.5, now with discoverability and documentation); **self-service platform** (domains can't each build lakehouse plumbing — a platform makes publishing a data product as easy as deploying a service; Chapter 14's thesis, arriving early); **federated computational governance** (global rules — privacy, identifiers, quality metadata — enforced *as code in the platform*, not as a committee's memos; Chapter 5's paved road, data edition).

A data product, concretely, is not a table with good intentions:

<pre class="mermaid">
flowchart LR
    src[["Operational events<br/>(Chapter 6 backbone)"]] --> code
    subgraph dp["Data product: ticket-sales (owner: Ticketing team)"]
        direction TB
        code["Transformation code"] --> s[("port — stream:<br/>sales events")] & t[("port — table:<br/>daily aggregates")]
        meta["Contract · SLOs · lineage · docs"]
    end
    s --> bi([Dashboards]) & ds([Data science])
    t --> fin([Finance close])
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class code hot
    classDef store fill:#d9f6ff,stroke:#0b7ecb,color:#1b1f3b
    class s,t store
    classDef meta fill:#f6f8fb,stroke:#c6cdd6,stroke-dasharray:4 3,color:#1b1f3b
    class meta meta
</pre>

*Figure 9.2 — Anatomy of a data product: code, ports, and contract travel together under one owner. Consumers subscribe to ports; nobody subscribes to somebody's tables. The unit of analytical architecture stops being "the warehouse" and becomes this.*

Honesty clause, as always: the mesh is an org-scale answer to an org-scale problem. Encore at nine teams adopts the *principles* — contracts, product thinking, two or three real data products — without the full federated apparatus. The mesh's machinery is bought the way microservices were in Chapter 5: with measured coordination pain, prerequisites first.

**Recap.** Mesh = ownership + product discipline + platform + governance-as-code — decomposition's logic reaching analytics. The data product (code + ports + contract, one owner) is the new unit. Adopt principles at any scale; buy machinery with pain.

**Exercise 9.4.** Sketch Figure 9.2 for the most-asked-about data in your company: owner, ports, contract, first three subscribers. What committee does this diagram dissolve?

### 9.5 The Self-Service Data Platform

The mesh stands or falls on its platform plane — and so does Chapter 12. What domains must be able to do *without tickets*: declare a product (scaffold, registry entry, catalog listing), publish ports (stream + table from one definition), inherit governance (PII detection, retention, access policies applied by the platform, not by memory), and observe (freshness, quality, lineage dashboards for free). This is Chapter 14's golden-path pattern with data-shaped paving stones — build it once, and the third data product costs a sprint instead of a quarter.

The closing bridge is the reason this module exists: **AI eats from here.** Chapter 12's feature pipelines and retrieval corpora are *consumers of data products* — demand forecasting subscribes to `ticket-sales`; the support assistant's RAG corpus is built from the `support-cases` product, inheriting its contract, lineage, and access rules. Teams that skipped this chapter's discipline meet it again as "why does the model train on stale, unowned, permission-less data" — the same lesson at a higher invoice.

**Recap.** The platform makes the right data behavior the cheap behavior: declare, publish, inherit, observe. AI systems are data-product consumers; their quality is bounded by this module.

**Exercise 9.5.** List the manual steps between "team has valuable data" and "another team uses it safely" at your company. Each step is either platform backlog or permanent tax.

### Kata: The Freight Ledger

> **Your brief: "Cargo."** A freight forwarder, 14 years old: one Oracle schema, 1,100 tables, a 22-person central data team drowning in 400 nightly ETL jobs. Domains: bookings, customs, fleet, billing. Fresh pain: billing disputes need booking + customs + GPS history joined within minutes (today: next morning); a new ML team wants two years of clean movement history; customs data is per-country restricted (Chapter 7's Atlas would nod); and the CFO has banned "another warehouse rewrite."

**Deliverables:**

1. **Ownership map** — the four domains' data, three joint-ownership conflicts resolved by split-by-meaning.
2. **Operational access design** — the dispute screen served by Figure 9.1's menu, with declared staleness and its business sign-off.
3. **Two data products** — Figure 9.2 anatomy for `shipment-movements` and `customs-status`, including the per-country access rule *as platform-enforced policy*.
4. **Migration path** — from 400 ETL jobs toward contracts and products without a big bang: first two pipelines strangled, producer-side CI contracts introduced where.
5. **One ADR** — "why the central data team becomes a platform team," losses included.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Ownership first | Is every technology choice downstream of a named owner? |
| Contract placement | Does producer CI, not consumer mornings, catch breakage? |
| Regulated data | Is the country restriction enforced in the platform, or in hope? |
| No big bang | Could the CFO stop funding at any month and keep the value shipped so far? |

#### Where you now stand

Data now has owners, contracts, products, and a platform to serve them — and twice this chapter leaned on rules like "per-country access, enforced as code" while deferring the discipline behind them. That discipline is next. Chapter 10 draws the trust boundaries, threat-models the flows you've built across eight chapters, and makes security what it must be in the cloud era: an architectural characteristic with fitness functions, not a questionnaire at the end.

### References

- Adam Bellemare — [*Building an Event-Driven Data Mesh*](https://www.oreilly.com/library/view/building-an-event-driven/9781098127596/). O'Reilly, 2023.
- Zhamak Dehghani — [*Data Mesh: Delivering Data-Driven Value at Scale*](https://www.oreilly.com/library/view/data-mesh/9781492092384/). O'Reilly, 2022.
- Ian Gorton — [*Foundations of Scalable Systems*](https://www.oreilly.com/library/view/foundations-of-scalable/9781098106058/). O'Reilly, 2022.
- Joe Reis, Matt Housley — [*Fundamentals of Data Engineering*](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/). O'Reilly, 2022.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Ralph Kimball, Margy Ross — [*The Data Warehouse Toolkit*, 3rd ed.](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit:+The+Definitive+Guide+to+Dimensional+Modeling,+3rd+Edition-p-9781118530801) Wiley, 2013.

---

## Chapter 10: Security Architecture and Zero Trust {#ch10}

> Attackers don't respect your diagrams. Draw the ones they do: the trust boundaries.


Nine chapters in, Encore has services, streams, APIs, BFFs, and data products — and, therefore, an attack surface it never sat down to design. That is the normal condition of software: functionality is architected, security is accreted. This chapter reverses the order for good. Security here is an architectural characteristic from Chapter 1's table — designed in, traded off explicitly, verified by fitness functions — not a compliance questionnaire administered after the fact.

Two convictions organize everything. First: **the architect is a defender**, because the decisions that determine defensibility — where trust boundaries sit, what identity a workload carries, which data lives where — are architecture decisions; by the time a security team reviews them, they are expensive facts. Second: **the perimeter is dead**, and its successor, zero trust, is not a product but an architectural stance: no network location confers trust; every request authenticates, every access is authorized, every actor — human or workload — has an identity. The chapter is defensive by design: its deliverables are threat models, boundary diagrams, and security ADRs — no exploits, only the mindset that anticipates them.

### 10.1 Thinking Like a Defender

#### Threat modeling: engineering, not paranoia

The core practice fits in four questions asked of any design: *What are we building? What can go wrong? What are we doing about it? Did it work?* The middle two get method. STRIDE gives "what can go wrong" a checklist — Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege — walked over a data-flow diagram. Run it on Encore's crown jewel, the on-sale:

| STRIDE | On-sale threat | Design answer (not a product name) |
|---|---|---|
| Spoofing | bots impersonating fans at the Gate | Bot Screening before the queue; device attestation |
| Tampering | hold-TTL manipulation to lock inventory | server-authoritative TTLs; signed hold tokens |
| Repudiation | "I never bought this" disputes | Chapter 6's event ledger as audit trail |
| Info disclosure | seat-map probing reveals sales velocity to scalpers | rate-limited, coarsened availability responses |
| DoS | the on-sale *is* a voluntary DDoS; attackers add to it | Chapter 4's shedding + Gate; upstream scrubbing |
| Elevation | fan token used against organizer endpoints | audience-bound tokens; per-service authorization |

*Figure 10.1 — STRIDE over the on-sale. Notice how many mitigations are prior chapters' patterns wearing security hats: the ledger, the Gate, load shedding. Good architecture and defensible architecture are mostly the same drawings.*

Threat modeling is done *at design time, by the designing team, on the C4 diagrams they already have* — an hour per significant change, not a quarterly ceremony. The architect's addition to those diagrams: **trust boundaries** — lines where the level of trust changes (internet→gateway, service→PSP, everything→database) — because every boundary crossing is where STRIDE questions concentrate. And since not everything can be defended equally: **data classification** (public / internal / confidential / regulated) decides where the armor goes. Encore's classes: seat maps are public; sales velocity is confidential (scalpers pay for it); payment data is regulated — and by architecture (tokenization at the PSP boundary, Chapter 3's ACL doing security duty) Encore *never possesses* card numbers, which is the finest kind of security: the data you don't hold cannot leak.

**Recap.** Four questions, STRIDE for the second, run by builders on existing diagrams. Trust boundaries concentrate the questions; classification allocates the armor; the best control is not holding the data at all.

**Exercise 10.1.** Draw your system's context diagram and add the trust boundaries. At each crossing, ask one STRIDE letter's question. Which crossing has no answer today?

### 10.2 Zero Trust and Identity

#### Identity is the new perimeter

The castle model — hard shell, soft interior — died of its own success condition: one phished credential inside the wall and the attacker walks laterally through implicit trust. Zero trust's tenets, distilled from NIST SP 800-207 into architecture: **verify explicitly** (every request, from anywhere), **least privilege** (access to the resource, not the network), **assume breach** (design blast radii, not just walls). Concretely, three identity planes:

**Humans.** OIDC/SSO with MFA, short sessions, and — the architectural part — *roles modeled on the domain*: Chapter 7's scopes (`holds:write`) and Chapter 13's tenant claims are authorization vocabulary designed alongside the API, not bolted on by an admin console.

**Workloads.** The under-built plane. Every service gets a cryptographic identity (SPIFFE-style: `spiffe://encore/inventory`), mTLS everywhere (Chapter 5's mesh finally shows its security face — identity and encryption as *infrastructure policy*, not per-team diligence), and authorization between services: Inventory accepts `reserve` calls from Orders and the Gate, and *no one else*, as declared policy. Lateral movement dies in policy, not in hope.

**Networks, demoted but not dismissed.** Segmentation survives as defense-in-depth: private subnets, no public database endpoints, controlled egress (exfiltration's chokepoint — the least glamorous control with the best incident-review record).

<pre class="mermaid">
flowchart LR
    gw["Gateway<br/><small>fan/partner tokens verified</small>"] --> ord["Orders<br/><small>id: spiffe://encore/orders</small>"]
    ord -- "mTLS + policy:<br/><small>orders may reserve</small>" --> inv["Inventory"]
    bot["Bot Screening"] -- "policy: may query risk only" --> inv
    ana["Analytics"] -. "policy: no path to Inventory<br/><small>(reads events instead)</small>" .-> inv
    classDef ok fill:#f38b1c,stroke:#f38b1c,color:#fff
    classDef deny fill:#fdeef2,stroke:#c66,color:#933
    class gw,ord,inv,bot ok
    class ana deny
</pre>

*Figure 10.2 — Service-to-service authorization as declared policy. The dotted line is the diagram's whole point: Analytics has no path to Inventory — it learns from the event stream, which is least privilege expressed as architecture (Chapter 6 was a security chapter in disguise).*

**Recap.** Trust attaches to verified identity, never to network position. Humans get SSO+MFA with domain-modeled roles; workloads get cryptographic identity, mesh-enforced mTLS, and explicit call policies; networks stay as depth, with egress control as the sleeper hit.

**Exercise 10.2.** Pick two services you run. Write the call-policy sentence for each ("X accepts A from B and C"). Is that sentence enforced anywhere, or is it currently a hope?

### 10.3 Securing the Stack

Four disciplines cover the stack's remaining altitude, each with one architectural core:

**Secrets: short-lived beats well-hidden.** The mature posture is not better vaults but *fewer long-lived secrets*: workload identity (Section 10.2) exchanges for short-lived, auto-rotated credentials; humans get just-in-time access with expiry. A leaked credential that dies in fifteen minutes is an incident; one that lives for years is a career.

**Data protection: encryption is a key-management problem.** TLS everywhere and encrypted storage are table stakes; the architecture lives in the keys — KMS-managed, per-classification (Section 10.1's classes becoming key policies), rotated, and with envelope encryption for anything regulated. "We encrypt everything" means little; "here is who can use which key, and here is the log" means everything.

**Supply chain: your dependencies are your code.** The modern breach arrives in a `package.json` as often as a port scan. Architectural controls: lockfiles + provenance verification, image signing with admission enforcement (unsigned doesn't deploy — a fitness function), SBOMs for the "are we exposed?" hour, and build pipelines treated as production systems (SLSA's actual point) — because the pipeline that can deploy anything is, to an attacker, the most valuable service you run.

**Events and APIs: the seams stay sealed.** Chapter 7's object-level authorization and abuse limits; Chapter 6's streams get schema-validated, signed-where-disputed events and replay protection via idempotency keys — the duty that keeps paying dividends.

**Recap.** Prefer expiring credentials to hidden ones; architect keys, not just ciphers; treat the build pipeline as production and dependencies as code; keep the seams sealed with the disciplines earlier chapters installed.

**Exercise 10.3.** Inventory your three longest-lived credentials (age, blast radius, rotation story). Design the short-lived replacement for the worst one.

### 10.4 Isolation and Multi-Tenancy

#### Blast radius is a design variable

Assume-breach thinking asks of every component: *when* this is compromised, what does the attacker hold? Isolation is the discipline of making that answer small. Tenant isolation models (Chapter 13 will build on these): **silo** (per-tenant stacks — smallest blast radius, largest bill), **pool** (shared everything, isolation by row-level policy and tenant-scoped tokens — efficient, and one missing `WHERE tenant_id` from disaster; the mitigation is *centralizing* that predicate in the platform layer, never per-query diligence), **bridge** (pooled compute, siloed data — the common compromise). Encore runs pooled with two silo exceptions demanded by classification: the ledger and Bot Screening's risk data.

Two modern isolation frontiers: **sandboxing untrusted execution** (webhooks, partners' code, and — arriving with Chapter 12 — AI-generated actions: gVisor/Firecracker-class boundaries, egress-controlled, because "it's just a webhook handler" is how supply chains fall), and **the AI-era surfaces** previewed now so Chapter 12 inherits vocabulary: prompt injection (untrusted text steering a model that holds credentials), retrieval leakage (RAG answering across permission boundaries — Chapter 9's access rules must survive *inside* the corpus), and model exfiltration. The pattern that governs all three: the model is an *untrusted execution environment fed by untrusted input* — sandbox its tools, scope its retrieval, filter its output.

**Compliance as architecture.** Audit trails (the event ledger again), data residency (EU events' data in EU regions — a partitioning-key decision from Chapter 4, made compliance-critical), retention as *lifecycle policy in the platform*, and least-privilege evidence generated from Section 10.2's policies rather than assembled in spreadsheet archaeology. When compliance is architected, the audit is a report; when it isn't, it's a quarter. The frameworks themselves — SOC 2, ISO 27001 and kin — reduce, architecturally, to one demand: *prove your controls ran*. That reframes them as evidence-automation problems: access reviews generated from Section 10.2's policies, change history from the GitOps log, incident response from the postmortem archive — controls that emit their own receipts because the paved road logs by construction. Regulated data classes (health, payments, minors') are boundary-drawing forces like Chapter 3's language shifts: where the regulation changes, a boundary usually belongs, keeping constrained data — and its audits — in the smallest blast radius.

**Recap.** Choose silo/pool/bridge per data classification, centralize tenant predicates, sandbox anything that executes strangers' intent — models included. Compliance stops being paperwork exactly when its evidence is emitted by the architecture.

**Exercise 10.4.** For one shared (pooled) store you operate: where does the tenant/user scoping predicate live? Count the code paths that must remember it. Design the version where one layer remembers for everyone.

### 10.5 Security as a Platform Capability

The fleet-scale truth, one last time: seventy teams cannot each be excellent at Sections 10.1–10.4, and memos don't compile. Security scales the way everything in this book scales — through the **paved road**: golden-path templates born with mTLS, workload identity, scoped credentials, and hardened bases; **policy as code** at admission and in CI ("no public buckets," "unsigned images don't run," "every endpoint declares its authorization rule"); and **security fitness functions** — dependency and secret scans, authorization tests per endpoint, the chaos-style drill that proves the breaker *and* the boundary. The security team's role inverts from gate to *paver*: they build the road and investigate the exceptions, and the exception path is priced, logged, and owned (Chapter 5's governance, hardest edition). The metric that matters: on the paved road, the secure way is the *easy* way — measured, as ever, by what teams do at 5 p.m. on a Friday.

**Recap.** Paved roads, admission-time policy, and fitness functions make security ambient; the security team paves and audits exceptions instead of gating everything; Friday-afternoon behavior is the metric.

**Exercise 10.5.** Name the last security requirement your org delivered by memo. Sketch its paved-road version: template default + policy check + the priced exception path.

### Kata: The Threat Model

> **Your brief: "Remedy."** A telehealth platform: video consultations, e-prescriptions, lab results. Actors: patients (mobile), clinicians (web), pharmacy partners (API), one insurance integration (SFTP, because insurance). Data: health records (regulated, seven-year retention), prescriptions (regulated, fraud-attractive), video (ephemeral by promise). Twenty-five engineers, pooled multi-tenant SaaS, one production cluster. A recent pentest found: long-lived DB credentials in three services, no service-to-service authorization, and a webhook endpoint that accepts unauthenticated pharmacy callbacks "temporarily, since 2023."

**Deliverables:**

1. **Boundary diagram** — C4 context + containers with trust boundaries and data classifications marked.
2. **Threat model** — STRIDE table for the two crown jewels: e-prescription issuance and lab-result delivery.
3. **Zero-trust migration plan** — workload identity, mTLS, and call policies sequenced across a live system; the three pentest findings remediated *architecturally* (not patched).
4. **Isolation verdict** — silo/pool/bridge per data class, with the video-ephemerality promise made enforceable.
5. **Two security ADRs** — the webhook redesign; the residency/retention architecture — losses in ink.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Boundary literacy | Do the diagrams show where trust changes, or just where boxes sit? |
| Architectural remediation | Do fixes remove classes of bugs, or instances? |
| Least-privilege evidence | Could the auditor's access question be answered from policy, today? |
| Paved-road thinking | Will the twenty-sixth engineer be secure by default, or by onboarding lecture? |

#### Where you now stand

Security is now a designed property with drawings, policies, and tests. What remains conspicuously undrawn is the ground all of it runs on: the clusters, functions, pipelines, and pagers — and the economics of keeping them alive at 3 a.m. and under budget. Chapter 11: cloud-native operations, where architecture meets the invoice and the on-call rotation.

### References

- Sheen Brisals, Luke Hedger — [*Serverless Development on AWS*](https://www.oreilly.com/library/view/serverless-development-on/9781098141929/). O'Reilly, 2024.
- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Razi Rais, Christina Morillo, Evan Gilman, Doug Barth — [*Zero Trust Networks*, 2nd ed.](https://www.oreilly.com/library/view/zero-trust-networks/9781492096580/) O'Reilly, 2024.
- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Heather Adkins, Betsy Beyer, et al. — [*Building Secure and Reliable Systems*](https://sre.google/books/). O'Reilly/Google, 2020 — free online.
- Tanya Janca — [*Alice and Bob Learn Application Security*](https://www.wiley.com/en-us/Alice+and+Bob+Learn+Application+Security-p-9781119687405). Wiley, 2020.
- Adam Shostack — [*Threat Modeling: Designing for Security*](https://www.wiley.com/en-us/Threat+Modeling:+Designing+for+Security-p-9781118809990). Wiley, 2014.

---

## Chapter 11: Cloud-Native Operations — Serverless, Kubernetes, and SRE {#ch11}

> Architecture that cannot be operated is fiction with diagrams.


Every chapter so far has ended where the interesting part begins for someone else: the system, designed, must now run — at 3 a.m., during the on-sale, within a budget someone signs. This chapter is about that someone being you. Operations is not what happens after architecture; it is architecture's feedback loop, the place where trade-offs stop being tables and start being invoices and pages.

Three questions organize the chapter. *Where should each workload run* — the container/serverless decision, made per workload like every other choice in this book? *How does change reach production safely* — infrastructure as code, GitOps, progressive delivery? And *how do we know it's working* — observability grown into SRE practice, with cost as a first-class signal rather than finance's problem. Encore, as ever, supplies the worked examples, including one uncomfortable bill.

### 11.1 Cloud Execution Models

#### The spectrum, priced in responsibility

Execution models differ in one currency: how much undifferentiated machinery you still own.

| Model | You own | You've shed | Fits |
|---|---|---|---|
| VMs | OS up | hardware | legacy, special kernels |
| Containers on Kubernetes | images, manifests, cluster policy | machines, scheduling | steady services, rich ecosystems |
| Serverless functions | code + configuration | servers, scaling, idle cost | spiky, event-shaped work |
| Managed services (queues, DBs, gateways) | configuration | the entire service | everything that isn't your differentiator |

*Figure 11.1 — The responsibility spectrum. The default reads bottom-up: managed first, functions for the spiky, containers for the steady, VMs under protest. Differentiation is the tiebreaker — Chapter 3's subdomain table again: core deserves your operational attention; generic deserves a managed service.*

Kubernetes, seen from the architect's altitude, is a declarative reconciliation engine — you state desired state, it converges reality — and that model (not the YAML) is why it won: self-healing, bin-packing, and an extension ecosystem. Its price is a *platform's* worth of complexity that someone must own; Kubernetes without a platform team is a hobby with an on-call rotation. Serverless inverts the cost curve: zero idle spend, instant scale, per-invocation billing — with cold starts, execution caps, and the discipline of statelessness as the fine print. The architect's job is matching curves to workloads: Encore's Catalog (steady, latency-sensitive) lives in containers; the Sale Gate — near-zero traffic for weeks, then 500× for minutes — is serverless's textbook case, and running it as always-on containers would mean paying for the spike's capacity every quiet Tuesday.

**Recap.** Own less by default; buy managed for generic, functions for spiky, containers for steady. Kubernetes is a reconciliation model with a platform-sized bill; serverless is a cost curve with fine print. Match per workload, not per fashion.

**Exercise 11.1.** Take three workloads you know. For each: traffic shape (steady/spiky/scheduled), latency tolerance, and the Figure 11.1 row it *should* occupy. Note any current mismatch and its monthly cost in idle capacity or ops effort.

### 11.2 Delivery Infrastructure

#### The environment is code, and git is the control plane

Two disciplines turn infrastructure from artisanal to industrial. **Infrastructure as code**: every cluster, queue, and permission declared in versioned files — reviewable, diffable, reproducible; the console is for looking, never for changing (the 2 a.m. console fix that saves the night and haunts the quarter is how snowflakes are born). **GitOps** closes the loop: agents continuously reconcile the cluster to the repository, so git *is* the deployment mechanism, the audit log, and — via `git revert` — the rollback story. Drift becomes visible instead of legendary.

On this substrate, Chapter 5's progressive delivery gets its infrastructure teeth: canaries promoted automatically on SLO health (Section 11.3's error budgets doing the judging), feature flags separating deploy from release, and ephemeral preview environments per pull request — the pattern that quietly kills both "works on my machine" and the shared-staging queue. The scoreboard for all of it is the **four key metrics** — deployment frequency, lead time, change-failure rate, time-to-restore — which measure the *system's* delivery health, not any team's virtue, and which correlate with business outcomes better than any architecture diagram ever has. Encore's dashboard shows them per service; when lead time creeps up, that is architectural feedback (coupling returning, tests slowing) wearing an operational costume.

**Recap.** IaC makes environments reproducible; GitOps makes git the control plane and revert the rollback; previews replace staging queues; canaries answer to error budgets. The four key metrics are the delivery scoreboard and an architectural early-warning system.

**Exercise 11.2.** Measure your four key metrics for last month, however roughly. Which is worst, and is its cause operational (pipeline, approvals) or architectural (coupling, test depth)?

### 11.3 Observability and SRE

#### From "is it up?" to "why is it weird?"

Chapter 5 installed the instruments — logs, metrics, traces, correlation IDs. SRE practice turns them into a decision system. The chain: **SLI** (what users experience, measured: "seat-map p99 latency"), **SLO** (the promise: "≤ 800 ms, 99.9% of a rolling 28 days"), **error budget** (the arithmetic complement: 0.1% ≈ 40 minutes/month of allowed badness). The budget is the masterstroke, because it converts the eternal speed-vs-stability argument into policy that needs no meeting:

<pre class="mermaid">
flowchart LR
    b{"Error budget<br/>remaining?"} -- "yes" --> ship["Ship features<br/><small>canaries promote, flags open</small>"]
    b -- "burning fast" --> slow["Slow down<br/><small>canaries hold, risky flags freeze</small>"]
    b -- "exhausted" --> harden["Reliability work only<br/><small>until budget recovers</small>"]
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class b hot
</pre>

*Figure 11.2 — The error budget as automatic policy. Nobody argues about whether to ship; the budget already decided. Product and reliability stop being departments and become two hands on one dial.*

Alerting inherits the philosophy: page on *symptoms* (SLO burn rate — users are hurting) and never on causes (CPU is high — maybe fine, maybe Tuesday); everything else is a dashboard for business hours. An on-call rotation paged only when users hurt, with a runbook per alert, is sustainable; one paged on causes burns out precisely the engineers who wrote the most instrumentation. And when things break anyway: **blameless postmortems** whose real product is architectural feedback — Encore's retry-storm outage (Chapter 4) produced not "be more careful" but retry budgets in the mesh defaults, a Chapter-1-style fitness function, and a better Tuesday. Incidents are the system tuition; postmortems are collecting the education.

**Recap.** SLIs measure experience, SLOs promise it, error budgets arbitrate speed vs. stability automatically. Page on symptoms, dashboard the causes, runbook every page. Postmortems convert incidents into architecture.

**Exercise 11.3.** Write the SLI/SLO/budget triple for your product's most user-visible operation. Then check last month's alerts: how many were symptoms vs. causes?

### 11.4 Cost, Capacity, and Sustainability

#### The invoice is a telemetry stream

In the cloud, every architectural decision bills monthly — which makes cost an operational *signal*, not an accounting afterthought. FinOps for architects reduces to three moves. **Unit economics**: raw spend is noise; spend per business unit is signal. (One line item deserves standing suspicion: egress — the classic invoice ambush, priced per byte leaving, which quietly converts a chatty cross-region design into a subscription to your own data.) Encore's number is *cost per ticket sold* — when it drifts from €0.11 to €0.19, something architectural happened (a chatty new service, an unindexed query, logging gone verbose), and the graph says so before the CFO does. **Cost as fitness function**: budgets per service with CI-time estimation on infrastructure diffs and alerts on drift — the same governance pattern, currency edition. **Capacity honesty**: autoscaling is not a strategy but a mechanism; the strategy is knowing your ceilings (that database connection pool from Chapter 4), load-testing to them, and pre-scaling for the known spikes (Encore schedules its on-sales; ops warms the pools — elasticity plus a calendar beats elasticity alone).

Serverless gets the sharp version of the lesson: per-invocation pricing means the cost curve *is* the traffic curve — brilliant for the Gate's spikes, ruinous for a chatty always-on workload where the same math runs backward (Encore's bill: a metrics poller invoking a function every 200 ms — €9,000/month to ask "anything new?" — moved to a container for the price of lunch). The rule: serverless when idle-heavy or spike-shaped; containers when busy-steady; *arithmetic, not allegiance*. Sustainability, the emerging column in the same table, mostly rides efficiency's coattails — right-sizing, spot capacity for interruptible work, region choice where latency permits — the rare virtue that lowers the bill as it lowers the carbon.

**Recap.** Track cost per business unit and alert on drift; estimate cost at review time like any other characteristic. Autoscaling needs known ceilings and a calendar. Serverless-vs-container is arithmetic on traffic shape; sustainability mostly is efficiency.

**Exercise 11.4.** Define your product's unit cost (per order, per user-day, per API call). Pull two months of data and compute it. What architectural event explains the biggest wiggle?

### 11.5 Operability by Design

The closing move gathers the chapter into a design-time discipline. **Production readiness** becomes a checklist any service answers before first deploy — SLOs declared? runbooks written? scaling ceilings known? dashboards wired? cost budget set? backup *restore* tested (a backup never restored is a hope with storage costs)? — not as bureaucracy but as the operational twin of Chapter 1's characteristics worksheet. **Testing meets cloud reality**: local fidelity has limits, especially serverless — so contract tests around managed services, ephemeral environments for integration, and Section 11.2's canaries as the final examiner. Before the closing thesis, the discipline this chapter cannot skip: **surviving a region**. Two numbers turn disaster recovery from a document into architecture — **RTO** (how long until service returns) and **RPO** (how much data you may lose) — and they are Chapter 1 characteristics with invoices attached: each order of magnitude tighter multiplies cost. Encore's ledger: the catalog tolerates an hour and loses nothing; the seat ledger tolerates minutes and may lose *zero* — the tightest constraint, not the average, sizes the strategy. The strategies are two, priced by Chapter 4's consistency budget. **Active–passive** — one region serves, a replica region follows — is simpler and cheaper, and its RPO is exactly your replication lag; failover is a rehearsed promotion. **Active–active** — both regions serve — buys seconds of RTO at the price Chapter 4 named: cross-region writes are either slow (synchronous) or conflicted (asynchronous), so Encore runs active–active for reads and *pins each event's writes to a home region* — partition keys doing geography. **Data residency** stacks a legal force on top: EU fans' data stays in the EU by law — a context boundary drawn by regulators. None of it is real until practiced: **game days** — deliberate failovers on calm Tuesdays — are DR's fitness function; a failover you have never run is a hope with a runbook. Encore drills quarterly — the drill that went badly taught more than the three that went well.

**Lifecycle honesty**: runtimes, base images, and dependencies age like fruit, not wine; upgrading is scheduled maintenance owned like features (the platform's automation in Chapter 14 will make it ambient). The module's — and chapter's — thesis in one line: *operability is a property you design, then verify with fitness functions, exactly like every other characteristic since Chapter 1.* And with that, a door opens this chapter cannot walk through alone: everything here — golden pipelines, SLO tooling, cost dashboards, readiness checks — wants to be *productized* so seventy teams get it for free. Hold that thought two chapters.

**Recap.** Readiness is a pre-deploy worksheet; restores are tested, not assumed; canaries examine what local tests cannot; upgrades are owned work. Operability is a designed, verified characteristic.

**Exercise 11.5.** Run the readiness checklist against a service you own today. Every "no" is either this sprint's work or an accepted risk — write down which.

### Kata: The Locker Network

> **Your brief: "Relay."** A parcel-locker network: 40,000 lockers across three countries, each phoning home over flaky cellular (opens, deposits, alarms), a courier app, a consumer pickup app, and carrier integrations. Traffic: steady trickle from lockers, evening pickup peaks, Black-Friday-week 20×. A hardware quirk: lockers batch-retry after connectivity gaps — a regional cellular outage ending means 3,000 lockers reconnecting *at once*. Eighteen engineers, two countries' worth of on-call grumbling, cloud bill growing 8%/month with revenue growing 3%.

**Deliverables:**

1. **Execution-model map** — Figure 11.1 rows for: locker ingestion, courier/consumer APIs, carrier batch jobs, alarm processing. The reconnection-storm design named explicitly.
2. **Delivery design** — GitOps layout, preview-environment story, and the canary policy for firmware-adjacent services where rollback is slow.
3. **SRE pack** — SLI/SLO/budget for pickup availability; the symptom alert set; the runbook skeleton for "regional cellular outage."
4. **Cost intervention** — define Relay's unit cost; three hypotheses for the 8%-vs-3% divergence and the telemetry that would confirm each.
5. **One ADR** — buffer-and-shed design for the reconnection storm, losses in ink.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Shape matching | Does each workload's execution model match its traffic shape, with arithmetic? |
| Storm authorship | Is the 3,000-locker reconnection designed for, or discovered annually? |
| Budget governance | Does the error budget, not a manager, decide when firmware canaries promote? |
| Unit economics | Is the cost divergence diagnosed with a business denominator, or hand-waving? |

#### Where you now stand

You can place workloads, industrialize delivery, promise reliability arithmetically, and read the invoice as telemetry. The next chapter takes the book's boldest turn: systems whose central component is *probabilistic* — where "correct" becomes a distribution, testing becomes evaluation, and a new class of security surface walks in speaking natural language. Chapter 12: architecting AI systems.

### References

- Sheen Brisals, Luke Hedger — [*Serverless Development on AWS*](https://www.oreilly.com/library/view/serverless-development-on/9781098141929/). O'Reilly, 2024.
- Brendan Burns — [*Designing Distributed Systems*, 2nd ed.](https://www.oreilly.com/library/view/designing-distributed-systems/9781098156343/) O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- J.R. Storment, Mike Fuller — [*Cloud FinOps*, 2nd ed.](https://www.oreilly.com/library/view/cloud-finops-2nd/9781492098348/) O'Reilly, 2023.
- Brendan Burns, Joe Beda, Kelsey Hightower, Lachlan Evenson — [*Kubernetes: Up and Running*, 3rd ed.](https://www.oreilly.com/library/view/kubernetes-up-and/9781098110192/) O'Reilly, 2022.
- Christian Ciceri, Dave Farley, et al. — [*Software Architecture Metrics*](https://www.oreilly.com/library/view/software-architecture-metrics/9781098112226/). O'Reilly, 2022.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — [*The DevOps Handbook*, 2nd ed.](https://itrevolution.com/product/the-devops-handbook-second-edition/) IT Revolution, 2021.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy (eds.) — [*Site Reliability Engineering*](https://sre.google/sre-book/table-of-contents/). O'Reilly/Google, 2016 — free online.
- Gene Kim, Kevin Behr, George Spafford — [*The Phoenix Project*](https://itrevolution.com/product/the-phoenix-project/). IT Revolution, 2013.
- Charity Majors, Liz Fong-Jones, George Miranda — [*Observability Engineering*, 2nd ed.](https://www.oreilly.com/library/view/observability-engineering-2nd/9781098179915/) O'Reilly.

---

## Chapter 12: Architecting AI Systems — LLMs, RAG, and Agents {#ch12}

> The model is the least important part of your AI system, and the only part everyone talks about.


Eleven chapters of this book share one silent assumption: components are deterministic. Call Inventory twice with the same input, get the same answer. That assumption dies here. A model-backed component returns *plausible distributions* — usually right, occasionally weird, never guaranteed — and this changes testing (into evaluation), latency (into token economics), and security (into linguistics). What does not change is everything else, which is this chapter's actual thesis: AI systems are ordinary distributed systems with one extraordinary component, and the architects who succeed with them are the ones who bring Chapters 1–11 along instead of forgetting them in the excitement.

Encore has real AI ambitions to anchor us: demand forecasting for organizers (classic ML), a support assistant that knows Encore's policies and the fan's actual order (RAG), and — most ambitiously — an agent that can *do* things: rebook a ticket, process a refund within policy. The treatment is vendor-neutral: models improve monthly, but the architecture around them is what you'll still own in five years.

### 12.1 AI in the System Topology

#### A component with a probabilistic contract

Place the model on the C4 diagram like anything else, then read its contract honestly: inputs are unbounded natural language, outputs are likely-but-not-guaranteed, latency is seconds and token-proportional, and cost is *per call* — a pricing model no other component has. Each clause bends an old rule: probabilistic output demands validation and fallbacks (Section 12.4); token latency demands streaming (Chapter 8 predicted this); per-call pricing makes caching and routing *economic* decisions (Section 12.5).

Integration topology comes in three maturities. **Direct calls** (each service hits a provider SDK): fine for one feature, then keys, versions, and costs scatter. **The AI gateway** — one internal service owning provider credentials, model routing, caching, rate limits, cost attribution, and audit — is the pattern Encore adopts the week it has two AI features (it is Chapter 7's gateway lesson, respoken: cross-cutting concerns centralize; the gateway must never grow *prompts*, which are business logic). **The router** adds capability tiers: cheap-fast models for classification and extraction, frontier models for the hard 10% — most workloads are tier-one wearing tier-three invoices.

Classic ML keeps its seat: forecasting, ranking, and fraud scoring remain trained-model territory with their own discipline — feature pipelines (consumers of Chapter 9's data products, as promised), model registries with versioned lineage, and the online/offline skew problem: the feature computed overnight in a warehouse and the "same" feature computed at request time drift apart silently; the architectural cure is *one definition, two serving speeds* — a feature store or shared transformation code, never two implementations of one idea.

**Recap.** The model is a component with an honest, unusual contract. Centralize provider concerns in a gateway (never prompts); route by capability tier; keep classic ML's feature discipline — one definition across offline and online.

**Exercise 12.1.** For an AI feature you know (or Encore's support assistant): write its contract as Chapter 7 would — inputs, outputs, latency, cost per call, and the three failure modes a caller must handle.

### 12.2 Retrieval-Augmented Generation

#### Grounding is a data pipeline, not a prompt trick

A base model knows the internet's past and nothing about *your* refund policy or order #881. RAG closes the gap by retrieving relevant private context and placing it in the prompt — which means RAG quality is decided in a *data pipeline* long before any model sees a token:

<pre class="mermaid">
flowchart LR
    src[["Data products<br/><small>policies · orders · FAQs (Chapter 9)</small>"]] --> chunk["Chunking<br/><small>semantic units, not page breaks</small>"]
    chunk --> emb["Embedding"] --> idx[("Vector + keyword index")]
    q([Fan's question]) --> qr["Query rewrite<br/><small>+ fan's context</small>"] --> idx
    idx -- "top-k candidates" --> rr["Reranker"] -- "best 3–5" --> llm["Model<br/><small>answer with citations</small>"]
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class idx,rr hot
</pre>

*Figure 12.1 — The RAG pipeline. The highlighted stages are where quality is won: hybrid (vector + keyword) retrieval, because embeddings miss exact codes and names that keyword search catches; and reranking, because the cheap first pass optimizes recall while the reranker buys precision. The model merely phrases what retrieval found.*

Two architectural commitments distinguish production RAG from demos. First, **the corpus is a data product** — Chapter 9's anatomy verbatim: owned, contracted, freshness-SLO'd, lineage-tracked. When Encore's refund policy changes, the corpus re-ingests within the hour *because a pipeline subscribed to the policy product*, not because someone remembered. Second, **permissions survive retrieval**:

> **The retrieval-leakage trap.** An index built from documents with access rules, queried without them, answers anyone's question with everyone's data — the support assistant happily quoting another fan's order. Access filtering must be *structural* — permission metadata on every chunk, filters applied inside the retrieval query — never left to the model's discretion. The model has no discretion; it has probabilities. (Chapter 10 called this shot.)

Grounding has three competing mechanisms, and the decision deserves a table rather than a fashion:

| | RAG | Fine-tuning | Long context |
|---|---|---|---|
| Knowledge freshness | minutes (re-ingest) | stale at training time | fresh per request |
| Citations | native | none | possible, weak |
| Per-user permissions | enforced in retrieval | permission-blind | must filter what you stuff |
| Unit cost | pipeline + small prompts | training runs + hosting | tokens × every request |
| Right for | facts that change and must be attributed | style, format, domain voice | small stable corpora, one-off analysis |

RAG is Encore's default for facts; fine-tuning earns its keep for tone; long context is the expensive convenience that stops scaling exactly when adoption starts.

**Recap.** RAG is a data pipeline with a model at the end: hybrid retrieval + reranking decide quality; the corpus is an owned data product; permissions are enforced in the query, structurally. Fine-tune for tone, retrieve for truth.

**Exercise 12.2.** Design the corpus for Encore's support assistant: which three data products feed it, each one's freshness SLO, and the permission metadata a chunk of order history must carry.

### 12.3 Agentic Architectures

#### The loop that acts

An agent is a model in a loop with tools: observe, decide, call a tool, read the result, repeat until done. That loop is an *orchestration problem* — Chapter 6 built the vocabulary — with one alarming novelty: the workflow is chosen at runtime by a probabilistic component. Treat it accordingly:

| Agent element | Its Chapter 1–11 ancestor | The AI-era twist |
|---|---|---|
| Tools | APIs with contracts (Chapter 7) | described in language; *the description is the interface* |
| Loop control | workflow engine (Chapter 6) | steps are proposed, not scripted — so bound them |
| State/memory | context + stores | the context window is a budget, curated not accumulated |
| Failure containment | timeouts, budgets (Chapter 4) | step caps, token budgets, spend ceilings |
| Authority | authorization (Chapter 10) | *the agent's identity, not the user's God-token* |

*Figure 12.2 — Agents as distributed systems with a probabilistic scheduler. Every row is an old discipline with a new clause; teams that skip the left column rediscover it in incident reviews.*

Encore's rebooking agent, designed by the table: tools are the *existing* APIs (`holds:write`, `refunds:request` — Chapter 7's scopes become the agent's permission vocabulary); the loop runs inside a workflow engine with step and token budgets; and authority follows one bright line — **read freely, write within policy, and cross-policy actions summon a human**. The refund beyond €200 does not fail; it *escalates*, arriving as a proposal with evidence for one-click approval (Chapter 8's human-in-the-loop affordances, now load-bearing). Sandboxing (Chapter 10) applies in full: an agent is untrusted execution steered by untrusted input; its tools run least-privileged, its egress is scoped, and prompt-injected instructions in a fan's message meet the same wall any attacker would. Multi-agent topologies — planner/executor, specialist pools — are microservices logic applied to cognition: split when a single context degrades (too many tools, mixed concerns), and not before; a fleet of agents without boundaries is event spaghetti that bills by the token.

**Recap.** Agents are orchestration with runtime-chosen steps: real engines, real budgets, tool contracts as carefully written as APIs. Authority is scoped and escalation is designed. Split into multiple agents for the reasons you'd split services — never for spectacle.

**Exercise 12.3.** Specify the rebooking agent's tool list: name, scope, read-or-write class, and the policy line above which each write escalates to a human.

### 12.4 Quality, Safety, and Security

#### Evaluation is the new testing

A probabilistic component cannot be unit-tested into confidence; it is *evaluated*: a golden set of real cases (Encore: two hundred anonymized support conversations with known-good outcomes), scored per release — exact checks where possible (did the cited order exist? was the refund within policy?), model-graded rubrics where judgment is required (with the judge itself spot-audited; LLM-as-judge is a measurement instrument, and instruments get calibrated). The evals run in CI like any fitness function: a prompt change, model upgrade, or retrieval tweak that drops the score *fails the build*. This single habit — evals as regression gates — separates teams that improve steadily from teams that oscillate between demos.

Guardrails wrap the runtime in layers, none sufficient alone: **structured outputs** (schema-constrained responses, validated like any API payload — the cheapest, most reliable guardrail); **input/output filtering** (injection heuristics inbound; PII and policy screens outbound); **grounding checks** (answers must cite retrieved sources; uncited claims degrade to "let me connect you with support" — the designed apology, Chapter 8 taught the manners). Security inherits Chapter 10's frame with the new attack surface named: prompt injection is untrusted input becoming instructions — mitigated by privilege separation (Section 12.3's scoped tools), never by politeness in the system prompt; and the STRIDE table gets rerun over every AI feature, because "Information disclosure" now includes *the model summarizing what it should not have retrieved* (Section 12.2's structural filters are the answer, again). Monitoring completes the loop: drift dashboards (topic mix, escalation rate, groundedness sampled in production) — and **model-call tracing**: every inference logged with what the model was shown, which chunks retrieval supplied, which tools it invoked, and what it answered, because "why did it say that?" is unanswerable without the trace. The corpus, the users, and the upstream model all change under you — Chapter 11's observability, plus a quality dimension no latency graph shows.

**Recap.** Golden sets + calibrated judges + CI gates make quality a regression-tested property. Guardrails layer: schemas first, filters and grounding checks after. Injection is defeated by privilege separation, not prompt courtesy. Production quality is monitored like latency.

**Exercise 12.4.** Draft ten golden cases for the support assistant, including two adversarial ones (an injection attempt; a question whose correct answer is "I can't help with that"). Define pass criteria for each.

### 12.5 Operating AI at Scale

The invoice arrives token-denominated, and Chapter 11's disciplines apply with new arithmetic. **Unit economics**: Encore tracks *AI cost per resolved conversation* — model spend ÷ resolutions — and watches the denominator as closely as the numerator (a cheaper model that resolves less is a false economy the ratio catches). The cost levers, in order of leverage: **routing** (the two-tier insight from Section 12.1 — classify-and-route sends 80% of turns to a model a tenth the price), **caching** (semantic caches for repeated questions; prompt-prefix caching for the shared system context — Chapter 4's staleness discipline, token edition), **budgeting** (per-feature spend ceilings with graceful degradation to templated answers — Chapter 4's load shedding, token-priced). **Latency** is perceived through Chapter 8's lens: stream everything, prefetch retrieval while the user types, and measure time-to-first-token, which is the number users feel. **Multi-tenancy** previews Chapter 13 with teeth: per-tenant isolation of prompts, corpora, and *spend* — one tenant's runaway agent must throttle inside its own budget, not everyone's — and tenant data never crosses corpus boundaries, structurally. The through-line of the whole chapter, one last time: nothing here required forgetting the first eleven chapters; every AI-scale problem yielded to an old discipline with new units.

**Recap.** Track cost per resolved outcome; route by tier, cache by meaning, budget with graceful degradation. Stream for perceived latency. Tenant boundaries cover prompts, corpora, and spend.

**Exercise 12.5.** Estimate the support assistant's economics: turns per conversation, tokens per turn, tier mix, cost per resolution — then compute what the routing layer is worth per month at 50,000 conversations.

### Kata: The Firm's Memory

> **Your brief: "Archivist."** An AI knowledge assistant for a 900-lawyer firm. Corpus: forty years of briefs, contracts, and memos — *privileged*, matter-scoped (a lawyer may only see matters they're staffed on), some under ethical walls (two teams at the same firm on opposite sides of adjacent matters). Asks: research Q&A with citations, first-draft generation in the firm's style, and an agent filing court-deadline reminders into calendars. Hard constraints: no client data may train or leave for third-party models without contract cover; the managing partner wants "provable" answer provenance; billing wants AI cost per matter.

**Deliverables:**

1. **Topology** — gateway/router design, tier strategy, and the on-prem vs. API model decision as an ADR with data-governance losses in ink.
2. **RAG design** — Figure 12.1 pipeline with matter-scoping and ethical walls as *structural* retrieval filters; corpus-as-data-product sheet with freshness SLOs.
3. **Agent spec** — the deadline agent's tools, scopes, budgets, and escalation lines (what may it write to a partner's calendar unasked?).
4. **Eval pack** — fifteen golden cases including two ethical-wall probes and one injection attempt hidden in a document; CI gate policy.
5. **Economics sheet** — cost per matter instrumentation and the router's projected savings.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Structural permissions | Could any prompt, however crafted, cross an ethical wall? |
| Provenance | Is every answer's citation checkable by a skeptical partner? |
| Contained authority | What is the worst thing the agent can do unsupervised — and was that chosen? |
| Honest economics | Does the cost model survive 10× adoption without surprising billing? |

#### Where you now stand

You can place a probabilistic component into a deterministic discipline: gateway'd, grounded, budgeted, evaluated, and contained. Encore, meanwhile, has quietly become something more than a product — venues now ask to run *their own* Encore. Selling one system to many customers is its own architecture, with its own physics of isolation, tiering, and cost attribution. Chapter 13: multi-tenant SaaS.

### References

- Chip Huyen — [*AI Engineering*](https://www.oreilly.com/library/view/ai-engineering/9781098166298/). O'Reilly, 2025.
- Jay Alammar, Maarten Grootendorst — [*Hands-On Large Language Models*](https://www.oreilly.com/library/view/hands-on-large-language/9781098150952/). O'Reilly, 2024.
- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Adam Bellemare — [*Building an Event-Driven Data Mesh*](https://www.oreilly.com/library/view/building-an-event-driven/9781098127596/). O'Reilly, 2023.
- Cathy Chen, Niall Richard Murphy, Kranti Parisa, D. Sculley, Todd Underwood — [*Reliable Machine Learning*](https://www.oreilly.com/library/view/reliable-machine-learning/9781098106218/). O'Reilly, 2022.
- Chip Huyen — [*Designing Machine Learning Systems*](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/). O'Reilly, 2022.
- Current provider architecture guidance and practitioner literature — this domain outruns books; the disciplines above are what persists.

---

## Chapter 13: Multi-Tenant SaaS Architecture {#ch13}

> One system, many customers, and every customer convinced it was built for them alone.


Encore's inbound email changed the company: a national venue chain wants "Encore, but ours" — their brand, their data, their compliance regime, running on Encore's machinery. This is the SaaS turn, and it is not a deployment detail. Multi-tenancy is a *defining architectural constraint*: one system serving many customers, with isolation, fairness, and per-tenant economics designed in from the first line — because every one of those properties, retrofitted, costs ten times what it costs designed.

This chapter is the full treatment, and it is deliberately the penultimate chapter of the book: a SaaS product is a platform with billing attached, and every mechanism built here — the control plane, self-service onboarding, tenant-aware operations — is the same machinery Chapter 14 generalizes to internal platforms. The word "tenant" touches identity (Chapter 10), partitioning (Chapter 4), cost (Chapter 11), even AI spend (Chapter 12): not a feature — a dimension that runs through everything.

### 13.1 The SaaS Mindset

#### Two planes, three models

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
    classDef plane fill:#fff4e6,stroke:#f38b1c,stroke-width:2px,color:#1b1f3b
    class cp plane
</pre>

*Figure 13.1 — The two planes. Everything the next four modules build is one of these boxes. Companies that skip the control plane still have one — made of runbooks, spreadsheets, and a heroic ops engineer named something like Dana.*

Within the application plane, tenants deploy on a spectrum of three models: **silo** (each tenant their own stack — maximum isolation, maximum cost, compliance's darling), **pool** (shared everything, tenancy by scoping — one deployment, ruthless efficiency, Chapter 10's isolation stakes), and **bridge** (pooled compute, siloed data — the workhorse compromise). The senior insight: this is a *per-tenant, per-tier* decision, not a company decision — and Section 13.5 will price it accordingly.

**Recap.** Control plane manages tenants; application plane serves them; the control plane is the new crown jewel. Silo, pool, and bridge are a menu, chosen per tier — not an identity.

**Exercise 13.1.** Inventory what your company would need in a control plane today: how many of Figure 13.1's five boxes currently exist as software, and how many as Dana?

### 13.2 Tenant Lifecycle

#### Onboarding is architecture, identity is destiny

A tenant's life begins at onboarding, and onboarding quality is measured the way Chapter 7 measured DX: *time from signature to first sale*. For Encore's self-service tier that must be minutes — which means onboarding is an automated, observable workflow (Chapter 6's engine, verbatim: provision → configure → seed → verify, with compensation for the partial failures that absolutely will happen), not a checklist in Confluence. The enterprise tier adds steps — SSO federation, custom domains, data residency — but the *same* pipeline runs them, because a hand-crafted enterprise tenant is a snowflake you will re-create wrongly in every disaster-recovery drill.

Identity does the daily work. The rule that prevents a category of catastrophe: **tenancy is resolved at authentication and carried in the token** — the fan logs in, the token says `tenant: venue-chain-a`, and every downstream service, query, and event scopes by claim. The alternatives (tenant from URL parsing, from lookup tables consulted per request, from "the service knows") all eventually serve one tenant another tenant's data on a Tuesday. Routing follows the same token: subdomain (`tickets.venuechain.com`) or path-based entry resolves to tenant context at the edge, and from the gateway inward, *tenant context propagates like Chapter 5's correlation ID* — in every call, every event, every log line. When context arrives everywhere, per-tenant everything (metrics, limits, bills) becomes a query instead of a project.

**Recap.** Onboarding is a compensating workflow measured in minutes-to-first-value, identical across tiers. Tenancy lives in the token from authentication onward and propagates like a correlation ID — making the rest of this chapter queryable.

**Exercise 13.2.** Sketch Encore's self-service onboarding as a Chapter 6 process model: steps, compensations, and the verification that flips a tenant to "live."

### 13.3 Building Multi-Tenant Services

#### Tenant-aware without tenant-riddled

The application plane's code-quality battle is keeping tenancy *ambient* rather than epidemic. The failure mode: `if (tenant.tier == "enterprise")` sprinkled through business logic until no path is testable. The discipline: tenancy is resolved once (Section 13.2's token), enforced in shared infrastructure layers, and expressed in business code as *configuration, not conditionals* — Encore's seat-hold TTL is a per-tenant config value, not a branch.

Data partitioning applies Chapter 4's machinery with a tenant key:

| Scheme | Mechanics | Blast radius | Bill |
|---|---|---|---|
| Pooled tables | `tenant_id` column + row-level policy | one missing predicate | cheapest, easiest ops |
| Schema-per-tenant | one DB, N schemas | schema drift at N | middling both |
| Database-per-tenant | full separation | smallest | migrations × N, connection sprawl |

*Figure 13.2 — Partitioning schemes. The pooled row's risk column is why Chapter 10 insisted the tenant predicate be centralized — in the ORM layer, row-level security, or the data-access library — so ten thousand queries rely on one guarded implementation, not ten thousand memories.*

Isolation must then survive *runtime*: tenant-scoped credentials (the request's DB session can only see its tenant's rows — defense below the application), and **noisy-neighbor fairness**, which for Encore is existential: one tenant's on-sale *is* a Chapter 4 spike aimed at shared infrastructure. The answer stack: per-tenant rate limits and concurrency quotas at the edge, fair queueing in shared workers, and the Gate's admission control now *tenant-aware* — plus the bridge-model escape hatch of moving a chronically hot tenant to dedicated capacity, at a price Section 13.5 will name.

At scale the isolation instruments consolidate into the **cell**: a complete, self-contained instance of the application plane — its own compute, stores, queues — serving a fixed subset of tenants, the control plane routing each tenant to exactly one. Cells are Chapter 4's bulkhead grown to full size: the unit of blast radius (a bad deploy or poison-pill tenant takes down one cell, not the product), of scale (add cells, not heroics), and of operations (canary a cell, drain a cell, game-day a cell). **Shuffle sharding** sharpens the fairness story: assign each tenant to a small random *combination* of resources, and two tenants rarely share their whole footprint — a noisy neighbor degrades slivers of many tenants' capacity instead of everything for a few. The menu, complete:

| Model | Blast radius | Cost efficiency | Fits |
|---|---|---|---|
| Pool | everything | best | self-service tiers, with Section 13.3's discipline |
| Bridge | shared compute, siloed data | good | mid-tier |
| Cell | one cell's tenants | good at scale | pooled tiers past the first serious incident |
| Silo | one tenant | worst | compliance-bound enterprise |

Encore's endgame runs pooled cells of ~50 venues each, silo'd stacks for the chain — and the control plane, which was always the tenants' map, becomes the cell router too.

**Recap.** Resolve tenancy once, enforce it in layers, express it as config. Choose partitioning per blast-radius budget; centralize the predicate; scope runtime credentials. Fairness is engineered with quotas and fair queues — and priced when quotas aren't enough.

**Exercise 13.3.** Grep (mentally or actually) a codebase you know for tier/tenant conditionals in business logic. Redesign the worst one as configuration.

### 13.4 SaaS on Real Stacks

The models of Section 13.1 land differently on the two dominant substrates. **Kubernetes SaaS**: namespace-per-tenant with quotas and network policies gives bridge-grade isolation in one cluster; silo tiers get dedicated node pools or clusters; the noisy-neighbor tools are the scheduler's (requests/limits, priority classes). **Serverless SaaS**: per-invocation isolation comes free, making pooled compute safer by default; concurrency limits per tenant become the fairness lever; and per-invocation billing makes *cost attribution nearly exact* — the property Chapter 11's FinOps discipline now depends on. Encore runs the pattern this chapter has been converging on: pooled serverless for the self-service five hundred, bridge on Kubernetes for mid-tier, silo'd stacks for the venue chain whose auditors require it.

Operations gains a dimension: dashboards, alerts, and SLOs all grow a *tenant axis* (Section 13.2's propagated context paying out). The on-call question stops being "is the system up?" and becomes "is it up *for whom*?" — because a pooled system at 99.99% can be serving one tenant pure errors, invisibly, if nobody slices by tenant. Per-tenant health, per-tenant error budgets for the paying tiers, and support tooling that reconstructs *this tenant's* experience are what "tenant-aware operations" means when the pager goes off.

**Recap.** Kubernetes buys isolation with namespaces and schedulers; serverless buys it per-invocation with exact cost attribution. Mixed substrates per tier is the mature answer. Every operational artifact — dashboard, SLO, alert — grows a tenant dimension, or incidents hide inside averages.

**Exercise 13.4.** Take one alert your team owns. Rewrite it tenant-sliced: what threshold, per whom, and what would last month have shown that the averaged version hid?

### 13.5 The Business of Multi-Tenancy

#### Tiers are architecture with a price list

Tiering is where Section 13.1's menu meets the CFO: architecture and packaging co-designed. Encore's sheet:

| Tier | Deployment | Isolation | SLO | AI features | Price logic |
|---|---|---|---|---|---|
| Self-service | pooled serverless | row + quota | 99.9% shared | shared budget, capped | efficient by design |
| Professional | bridge (pooled compute, own DB) | data silo | 99.95%, own error budget | own AI budget | margin from pooling, comfort from silo |
| Enterprise | silo | full stack | contractual, tenant-sliced | dedicated corpus + spend | the isolation *is* the product |

*Figure 13.3 — Tiering as co-design. Read it with Chapter 11's eyes: each row is only priceable because per-tenant cost is measurable — metering (requests, storage, AI tokens per tenant) is the control-plane service that keeps margins from being folklore.

Enterprise tiers gate on a checklist that looks like features and lands like architecture. **SSO** (SAML/OIDC federation) means tenant-configurable identity providers — Section 13.2's identity plane grows per-tenant trust configuration. **SCIM provisioning** means the customer's HR system creates and revokes your users — an inbound API into your identity model, with all of Chapter 7's contract discipline. **Audit logs** become a *product surface*: tenant-visible, exportable, immutable — the Chapter 6 ledger wearing a customer-facing UI. **Customer-managed keys** (BYOK) push Chapter 10's key hierarchy to its limit: the tenant holds the root, and revoking it must actually render their data unreadable — crypto-shredding as a contractual feature. **Per-tenant rate limits and SLOs** turn Section 13.3's fairness machinery into line items on a contract. Together they make "enterprise-ready" an architecture milestone, not a pricing toggle — the venue chain's security questionnaire arrived before their signature did.*

Two closing motions complete the chapter. **Migration** — taking single-tenant software multi-tenant — runs the strangler discipline of Chapter 3: tenant context introduced at the edge first (every request tagged, even with one tenant), the tenant predicate centralized, data consolidated pooled-ward tier by tier, silo customers moved last or never; the big-bang rewrite to multi-tenancy has a casualty list long enough to constitute its own literature. And **GenAI multi-tenancy** — Chapter 12's preview, now doctrine: tenant boundaries extend through prompts (no cross-tenant context assembly, structurally), corpora (per-tenant indexes or tenant-filtered retrieval — the venue chain's sales data must be unreachable from a rival's assistant, by construction), and spend (per-tenant AI budgets metered like any resource, because an unmetered AI feature is a margin leak wearing a demo). Tenancy, as promised, turned out to be a dimension of everything.

**Recap.** Tiers map deployment models to price points, and metering makes the mapping honest. Migrate by strangling tenancy inward from the edge. AI features inherit tenant boundaries across prompts, corpora, and spend — structurally, like everything else in this chapter.

**Exercise 13.5.** Draft your product's Figure 13.3 sheet, real or hypothetical. Which cell can you not fill because the metering doesn't exist? That cell is control-plane backlog.

### Kata: The Studio Suite

> **Your brief: "Metronome."** Beloved studio-management software (bookings, invoicing, class schedules) for music schools — currently *installed per customer*: 180 on-prem/VPS installations, each its own version, backed up by email reminders. The founders want SaaS: keep the 180 (some contractually on-prem for two more years), add self-service signup for small studios, and land "Allegro" — a 90-school national chain demanding SSO, data residency in-country, and a contractual SLA. Twelve engineers. The codebase assumes one tenant so thoroughly that the database is named after the customer.

**Deliverables:**

1. **Two-plane design** — Figure 13.1 control plane scoped to twelve engineers: which boxes are built, bought, or Dana-for-now (explicitly).
2. **Tier sheet** — Figure 13.3 for self-service, standard, Allegro, and the legacy on-prem tail; deployment model and metering per tier.
3. **Migration plan** — from 180 snowflakes to tenancy: edge-tagging first, predicate centralization, data consolidation order, and what "reversible" means at each step.
4. **Fairness & isolation** — the September-enrollment spike (every school's on-sale, same week): quotas, fair queues, and Allegro's contractual protection.
5. **One ADR** — "Allegro: silo or bridge?" — with the margin math and the ops bill in ink.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Control-plane realism | Is the plane sized to twelve engineers, with honest Dana-boxes? |
| Token-borne tenancy | Does tenant context flow from auth to logs, or from URL parsing and hope? |
| Migration reversibility | Can any consolidation step roll back without restoring from the email backups? |
| Priced isolation | Does Allegro's tier price its blast radius, or subsidize it? |

#### Where you now stand

You can serve many masters from one system: planes split, tenants tokenized, fairness engineered, tiers priced. Now step back and look at what Encore has accumulated across thirteen chapters — golden paths, an event backbone, data products, paved-road security, SLO tooling, an AI gateway, a control plane. Some company builds and runs that machinery *for its own teams*. At Encore's size, that company is Encore itself. The final chapter names the discipline: platform engineering — and hands you the capstone.

### References

- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Gregor Hohpe — [*Cloud Strategy*](https://leanpub.com/cloudstrategy). Leanpub, 2020.
- Martin L. Abbott, Michael T. Fisher — [*The Art of Scalability*, 2nd ed.](https://www.informit.com/store/art-of-scalability-scalable-web-architecture-processes-9780134032801) Addison-Wesley, 2015.

---

## Chapter 14: Platform Engineering and the Capstone {#ch14}

> The best architecture is the one other teams build great things on without asking you anything.


Encore is now 400 engineers in 40 teams, and its most important customer is one it never signed: its own engineering organization. Every chapter of this book left machinery behind — enforced boundaries, an event backbone, API golden paths, data products, paved-road security, SLO tooling, an AI gateway, a tenant control plane — and someone must now own, productize, and evolve that machinery so forty teams get it without forty implementations. That someone is the platform, and designing it is the discipline this entire book has been converging on.

Why is platform architecture the *destination*? Because it is architecture applied to architecture: your users are engineers, your product is their velocity, your API is a golden path, and every trade-off you've learned reappears one level up. This chapter teaches the discipline — and then hands you the capstone: a complete platform design, defended the way you have defended everything since Chapter 1, decision by decision, loss by loss.

### 14.1 Why Platforms

#### Cognitive load is the resource being architected

The problem statement is arithmetic. A stream-aligned team shipping ticketing features must, without a platform, *also* master: cluster config, pipeline plumbing, observability wiring, secret rotation, schema registries, cost dashboards, threat models, AI gateways. That stack exceeds any team's cognitive budget — so teams either sink into it (velocity dies), skip it (Chapter 10 shudders), or solve it forty divergent ways (both, plus an audit). An **internal developer platform** is the deliberate answer: a curated product that absorbs the undifferentiated stack behind self-service interfaces, so product teams spend their cognition on the business.

The operating model matters more than the software: **platform as a product**. Product teams are *customers* — voluntary users to be won, not conscripts to be mandated. That single stance generates the discipline: talk to users, measure adoption, publish a roadmap, start from the **thinnest viable platform** (the paved road for the most painful mile — at Encore, "new service to production": template, pipeline, observability, identity, one command) and earn the right to grow. The anti-patterns are all failures of this stance:

| Anti-pattern | Mechanism of failure |
|---|---|
| Mandate platform | forced adoption hides product failure until the reorg |
| Ivory-tower platform | built from imagined needs; meets its first user at launch; dies of surprise |
| Ticket-queue "platform" | absorbs work instead of automating it; becomes the bottleneck it replaced |
| Kitchen-sink platform | says yes to everything; owned by no coherent thesis; unmaintainable |

*Figure 14.1 — Four ways platforms die. All four are cured by the same medicine: real customers, voluntary adoption, measured value, thin start.*

**Recap.** Platforms exist to return cognitive load to the business. Platform-as-product — voluntary customers, measured adoption, thinnest-viable start — is the operating model; the anti-patterns are what happens without it.

**Exercise 14.1.** List everything a new service at your company needs before it serves production traffic safely. Time-estimate the list for a team doing it alone. That number is the platform's business case, or its absence.

### 14.2 Platform Anatomy

#### Golden paths on a self-service control plane

The platform's product surface is the **golden path**: an opinionated, supported, self-service route through a common need. Anatomy of Encore's "new service" path: a template (service skeleton with Chapter 5's contracts, Chapter 10's identity, Chapter 11's observability pre-wired), a provisioning workflow (pipeline, dashboards, on-call rotation, cost budget — created, not documented), a registry entry (ownership, tier, SLOs — the service catalog that answers "who owns this?" at 3 a.m.), and a scorecard (production-readiness, Chapter 11, now continuously graded). Underneath, the platform is *architecturally* Chapter 13's lesson applied inward: a **control plane** managing internal tenants — the teams — over the planes this book built one by one:

<pre class="mermaid">
flowchart TB
    teams(["40 product teams — the platform's tenants"]) --> paths["Golden paths & self-service portal"]
    paths --> cp["Platform control plane<br/><small>provisioning · registry · scorecards · metering</small>"]
    cp --> c["Compute & delivery<br/><small>Ch. 11</small>"] & e["Event backbone<br/><small>Ch. 6</small>"] & d["Data products<br/><small>Ch. 9</small>"] & a["API & UI paths<br/><small>Ch. 7·Ch. 8</small>"] & s["Security guardrails<br/><small>Ch. 10</small>"] & ai["AI gateway<br/><small>Ch. 12</small>"]
    classDef hot fill:#f38b1c,stroke:#f38b1c,color:#fff
    class cp hot
</pre>

*Figure 14.2 — The platform as the book's index page. Nothing in the bottom row is new; the platform's contribution is the middle: one control plane making it all self-service, registered, and metered — Chapter 13's machinery with teams for tenants.*

Team topology follows Chapter 5's physics: a platform group sized honestly (the industry's rough band: 5–10% of engineering), structured as product teams per plane, with *enabling* interactions — embedding with customers to smooth paths — and one bright line: the platform runs the roads; it never takes the wheel of a product team's service. The moment platform engineers operate product services, the pager teaches ownership backward.

**Recap.** Golden paths are the product: template + workflow + registry + scorecard. The platform is a control plane over the planes of Chapters 6–12, run by a right-sized product organization that paves roads and refuses to drive.

**Exercise 14.2.** Design the golden path for the need Exercise 14.1 surfaced: what does the template contain, what does provisioning create, and what one command runs it?

### 14.3 Governance as Code

#### The paved road patrols itself

Forty autonomous teams and no review board: governance must be *ambient*. The mechanism has been accumulating since Chapter 1, and here it becomes the operating system. **Fitness functions** grade every service continuously — boundary rules (Ch. 2), contract compatibility (Ch. 5), security posture (Ch. 10), SLO and cost health (Ch. 11), eval scores (Ch. 12) — rolled into the scorecard, visible to the team and its leadership alike. **Policy as code** enforces the non-negotiables at admission and in CI: unsigned images don't run, endpoints declare authorization, PII fields carry classifications. And the **exception path** is designed, not discovered: leave the paved road freely, with the deviation priced, logged, owned, and time-boxed — freedom with a ledger, replacing both the ivory tower's "no" and the wild west's silence.

Governance includes governing *the platform itself*: platform APIs are Chapter 7 promises to internal strangers (versioned, expand–contract, contract-tested against every consuming team), and **deprecation is a product motion** — a migration campaign with tooling, dashboards of laggards, white-glove help for the last three teams, and a real sunset date. A platform that never retires anything becomes a museum that pages; the archived-not-deleted rule from Chapter 1's ADRs scales to whole capabilities.

**Recap.** Scorecards + policy-as-code + a priced exception path replace review boards. The platform's own APIs live under the strictest contract discipline in the company, and deprecation campaigns — tooling, funnels, dates — are how it stays alive.

**Exercise 14.3.** Write three policy-as-code rules your organization would enforce at admission today if it could, and one current rule you would *demote* to advisory. Defend the demotion.

### 14.4 Architecting When Code Is Cheap

#### The inversion the preface promised

This book opened with a claim it now owes you an answer to: code has never been cheaper to produce, and coherence has never been more expensive. Here is the answer. When an agent can regenerate a service overnight, the scarce artifacts are no longer implementations — they are the *steering* artifacts this book has been accumulating since Chapter 1: the ADRs that say why, the module boundaries that say where, the contracts that say what, and the fitness functions that say *still true*. Architecture stops being the plan for writing code and becomes the interface through which you direct code you will never read line by line.

Encore lived the inversion on a Tuesday. A coding agent, pointed at a well-specified backlog, rebuilt the Notification service overnight — new framework, better retry semantics, forty files nobody hand-typed. It shipped safely not because anyone reviewed forty files, but because everything that mattered was machine-checkable before breakfast: the consumer contracts still passed, the boundary rules still held (no imports into Inventory's internals, no foreign table reads), the security posture scanned clean on the golden path's checks, and the SLO canary promoted it like any other change. The interesting question was never "is this code good?" but "do the boundaries, contracts, and evals still hold?" — and that question had automated answers.

Three practical shifts follow, each landing on machinery you already own:

**Decision records become agent context.** An ADR corpus was always the team's memory; now it is also the *prompt*. Agents assembling changes read the decisions, the constraints, and the consequences rows — which means writing them clearly is no longer documentation hygiene but direct control input. The second law compounds: the *why*, recorded, now steers the how at generation time. A vague ADR used to cost an argument; it now costs a confidently wrong implementation by Thursday.

**Review economics invert.** When implementation was expensive, review meant reading the code; when implementation is cheap and voluminous, human attention must move up the stack — to the boundary, the contract diff, the eval delta, the ADR the change claims to implement. The Chapter 5 pyramid gets a new layer: humans review *decisions and interfaces*; CI reviews everything else, or nobody does. A team that insists on hand-reading generated volume simply becomes the bottleneck its agents route around — usually by merging tired.

**Governance becomes the load-bearing wall.** Section 14.3's machinery — fitness functions, policy-as-code, scorecards — was built to let forty teams move safely. It turns out to be exactly the machinery that lets forty teams *and their agents* move safely: boundary checks, contract tests, and evals in CI are the only reviewers that scale with generation speed. The paved road stops being a convenience and becomes the thing standing between velocity and entropy.

> **Erosion at generation speed.** The failure mode has a shape: a thousand commits, each locally plausible, each passing its tests, collectively dissolving the architecture — boundaries fuzzed by helpful little imports, contracts widened by accommodating little fields, until the modular monolith is just a monolith again and nobody typed a line of it. Erosion is not new; the *rate* is. The countermeasure stack is this book in miniature: boundaries enforced by machines (Chapter 2), contracts tested per change (Chapter 5), evals gating behavior (Chapter 12), scorecards surfacing drift (Section 14.3) — and an architect who reads trend lines, not diffs.

What does not change matters as much: the trade-offs are still yours. No agent owns the consequences row; no eval decides which characteristics should drive Encore's next year. Cheap code raises the value of exactly the judgment this book trained — which is why this section lives in the platform chapter: the platform is where judgment is encoded once and enforced everywhere.

**Recap.** When code is cheap, ADRs, boundaries, contracts, and fitness functions become the steering interface — written for humans and read by machines. Review moves up the stack; governance-as-code becomes the wall that holds at generation speed.

**Exercise 14.4.** Take one recent AI-assisted change in your codebase (or imagine the Notification rebuild). List what was machine-checked before merge and what only a human could have caught. The second list is your erosion surface — name the check that would shrink it.

### 14.5 Platform Strategy and the Elevator

#### The map, the money, and the message

The platform consumes real budget in service of indirect value, which makes strategy and communication survival skills. Three instruments:

**The map.** Wardley-style situational awareness in one habit: place each capability on an evolution axis — genesis, custom, product, commodity — and let position dictate posture. Commodities (clusters, queues, registries): *buy or adopt*, differentiate never. Encore's genuine customs: the Gate's fairness engineering, ticketing's domain paths. The classic failure is inverted posture — hand-rolling a commodity (artisanal Kubernetes) while buying the differentiator — Chapter 3's investment table, drawn at company scale.

**The money.** The platform's business case is Chapter 11's arithmetic applied to itself: lead-time deltas, incident deltas, unit-cost deltas, onboarding time — measured before and after each path ships. "Developer experience" is the feeling; the *numbers* are what renew funding.

**The message.** The architect-elevator skill: the same platform decision must be spoken at every floor — to engineers as golden paths and guardrails, to directors as delivery predictability, to the CFO as unit economics, to the board as "we ship in days what peers ship in quarters." Riding the elevator — engine room to penthouse and back, translating without distorting — is not a soft skill appended to the technical ones; at platform scale it *is* the deciding skill.

And beneath all three, systems thinking: adoption is a feedback loop (good paths → users → feedback → better paths), and stalls are diagnosed at the loop's weakest arc — usually feedback, which is why the platform team's calendar contains more user interviews than the product teams'. The leverage point is rarely more features; it is more listening.

#### The craft: reviews without theater

The last instrument in the kit: the lightweight design review. The format that survives real calendars is the **RFC loop** — a one-to-three-page written proposal (context, options, chosen trade-offs, ADR-ready), circulated asynchronously, commented in writing, decided visibly, archived forever. No committee, no slideware; the document *is* the meeting, and the archive becomes Section 14.4's agent context for free. For bigger decisions, borrow ATAM's spine without its ceremony — walk the design against the driving characteristics, one probing question each:

| Characteristic | The reviewer's question |
|---|---|
| The driving "-ilities" | Which decision serves each — and what did it cost? |
| Failure | What breaks first at 10×, and what does the user see? |
| Change | Where does next year's most likely change land — one component or five? |
| Security | Where does trust change hands, and who checked? |
| Cost | What is the unit economics of this design at success-scale? |
| Exit | Which decisions are one-way doors, and are they marked? |

An hour, one page, six questions — repeated per significant change, it outperforms the quarterly architecture board it replaces.

**Recap.** Map capabilities to buy/build postures; fund the platform with before/after numbers, not vibes; speak every floor's language without forking the truth. Adoption is a loop — fix the listening before the features. Reviews are one-page RFCs plus six characteristic-driven questions, not theater.

**Exercise 14.5.** Take one internal capability your company hand-rolls. Place it on the evolution axis, then write its two-sentence justification — or its two-sentence migration plan to a commodity.

### Kata: The Capstone — Meridian

Everything since Chapter 1 was practice for this.

> **Your brief: "Meridian."** A B2B logistics company: 40 product teams (520 engineers), one aging monolith carrying 60% of revenue, 190 services of wildly varying vintage carrying the rest. Known pains: four-week lead time for a new service; three security postures discovered in the last audit; every team runs its own CI; data science can't get clean data; two teams have built shadow AI gateways; the CTO has funded a platform organization — you — for 36 engineers, with board attention and eighteen months of patience. Meridian also sells a customer-facing API and is mid-flight on a multi-tenant "Meridian for Carriers" product. And two of its recent acquisitions you have already met: **Cargo**, Chapter 9's freight forwarder, and **Relay**, Chapter 11's locker network — their architectures arrive with the deal, incident history and all.

**Deliverables — the full architect's dossier:**

1. **Platform strategy** — Wardley-postured capability map; the thinnest viable platform chosen from Meridian's pains, with the first three golden paths sequenced by measured pain.
2. **Platform architecture** — Figure 14.2-grade design: control plane, planes, registry, scorecards; C4 diagrams with trust boundaries (Chapter 10 is watching).
3. **Golden-path specifications** — the "new service" and "new data product" paths end to end: template contents, provisioning workflow, guardrails inherited, one-command experience.
4. **Governance design** — the fitness-function catalog, three admission policies, the priced exception path, and the deprecation playbook for the 190-service long tail.
5. **Migration roadmap** — monolith strategy (Chapter 3's honesty: what strangles, what stays), shadow-AI-gateway consolidation, the carrier-product's tenancy machinery converging with the internal control plane, and onboarding plans that bring Cargo's data products and Relay's ingestion fleet onto the platform's paths — your own kata answers from Chapters 9 and 11 are admissible evidence.
6. **The economics** — platform team structure for 36 engineers, the before/after metrics that renew funding at month 18, and unit-economics instrumentation.
7. **The elevator narrative** — one page, four floors: the same platform, spoken to engineers, directors, CFO, and board.

**Rubric — the book's final examination:**

| Criterion | The question to ask yourself |
|---|---|
| Trade-off provenance | Does every major decision name what it costs, in ink, ADR-style? |
| Thinness discipline | Does the platform start where Meridian bleeds, or where platforms are fashionable? |
| Inherited rigor | Do the paths carry Chapters 5–13's disciplines by default — contracts, identity, SLOs, tenancy, eval gates? |
| Voluntary physics | Would a skeptical team lead adopt path one — and what number convinces their director? |
| The elevator test | Could the CFO's page and the engineer's page describe the same platform to a stranger? |

#### Where you now stand — a graduation note

Fourteen chapters ago, this book began with a claim: architecture is a stream of trade-offs made under uncertainty, recorded honestly. You now hold the full chain — characteristics to styles to boundaries to distribution to fleets to events to promises to pixels to data to defense to operations to intelligence to tenancy to platforms — and the habit that binds it: *name what it costs, in ink.*

That habit is worth naming one last time — Section 14.4 turned it into a working method — because the era you are graduating into runs on generated abundance. Code has never been cheaper to produce, and coherence has never been more expensive. What the tools generate is the *how* — faster than any of us. What they do not generate is the thing this book trained: the *why*, held accountable — which trade-off, for which characteristic, at what cost, written down where the next person can find it. Systems fail at the seams, and seams are drawn by judgment. That judgment is now yours: practiced on Encore, tested on a dozen katas, defended at Meridian.

Go draw good boundaries. And write down why.

### References

- Camille Fournier, Ian Nowland — [*Platform Engineering*](https://www.oreilly.com/library/view/platform-engineering/9781098153632/). O'Reilly, 2024.
- Diana Montalion — [*Learning Systems Thinking*](https://www.oreilly.com/library/view/learning-systems-thinking/9781098151324/). O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Christian Ciceri, Dave Farley, et al. — [*Software Architecture Metrics*](https://www.oreilly.com/library/view/software-architecture-metrics/9781098112226/). O'Reilly, 2022.
- Neal Ford, Rebecca Parsons, Patrick Kua, Pramod Sadalage — [*Building Evolutionary Architectures*, 2nd ed.](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/) O'Reilly, 2022.
- Will Larson — [*Staff Engineer: Leadership Beyond the Management Track*](https://staffeng.com/book/). 2021 — largely free online.
- Gregor Hohpe — [*The Software Architect Elevator*](https://www.oreilly.com/library/view/the-software-architect/9781492077534/). O'Reilly, 2020.
- Eben Hewitt — [*Technology Strategy Patterns*](https://www.oreilly.com/library/view/technology-strategy-patterns/9781492040866/). O'Reilly, 2018.
- Donella H. Meadows — [*Thinking in Systems: A Primer*](https://www.chelseagreen.com/product/thinking-in-systems/). Chelsea Green, 2008.
- Matthew Skelton, Manuel Pais — [*Team Topologies*, 2nd ed.](https://itrevolution.com/product/team-topologies-second-edition/) IT Revolution.
- Simon Wardley — [*Wardley Maps*](https://learnwardleymapping.com/book/). Free online, CC BY-SA.
