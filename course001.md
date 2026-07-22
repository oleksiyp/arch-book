# Course 1: Foundations of Modern Software Architecture

> "All architecture is design but not all design is architecture." — Grady Booch

## Welcome

Every discipline has a moment when it stops being a bag of techniques and becomes a way of seeing. For software architecture, that moment comes when you stop asking *"which technology should I use?"* and start asking *"what am I trading away?"* This course is about reaching that moment deliberately rather than by scar tissue.

We will follow one company from its first architectural sketch to its first defensible design: **Encore**, a startup selling tickets to live concerts. Encore is small enough to hold in your head and treacherous enough to be interesting — when a major artist announces a tour, Encore's traffic multiplies five-hundred-fold in minutes; every seat must be sold exactly once; and the bots arrive before the fans do. By the end of the course you will have derived Encore's driving characteristics, drawn its first diagrams, and written the decision records that a real team could pick up and build from. Every later course in this specialization repeats this loop at greater depth; here, we learn the loop itself.

A note on what you will *not* find: no UML, no grand up-front blueprints, no pretense that architecture is something you finish. Modern architecture is a stream of decisions made under uncertainty, recorded honestly, and revisited without shame.

---

## Module 1: What Software Architecture Is Today

### The building metaphor, and why we must abandon it

For decades we explained software architecture by analogy to buildings: the architect draws, the builders build, the structure stands. It is a comforting story, and almost entirely wrong. Buildings do not double their occupancy overnight because an artist announced a tour. Buildings are not rebuilt every week by the people living in them. The defining property of software is that it is *soft* — and an architecture that ignores this is a monument, not a system.

So we need a better definition. Modern practice describes an architecture as the combination of four things:

| Dimension | What it captures | Encore example |
|---|---|---|
| **Architectural characteristics** | The "-ilities" the system must exhibit | Survive a 500× on-sale spike |
| **Architectural decisions** | The rules and constraints, with their rationale | "Seat inventory is owned by exactly one service" |
| **Logical components** | The building blocks and their responsibilities | Seat Inventory, Order, Bot Screening |
| **Architectural style** | The overall shape the components live in | To be decided — that's Course 2 |

None of these four is optional, and none alone is the architecture. A pile of microservices with no recorded decisions is as fragile as a beautiful decision log describing a system nobody built.

### Architecture and design: a spectrum, not a wall

Where does architecture end and design begin? The honest answer: nowhere. There is a spectrum, and every decision sits somewhere along it.

<svg viewBox="0 0 640 120" style="max-width:640px;width:100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spectrum from architecture to design">
  <defs>
    <linearGradient id="spec" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6c2bd9"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="20" y="45" width="600" height="18" rx="9" fill="url(#spec)"/>
  <text x="20" y="30" font-family="sans-serif" font-size="13" fill="#5a23c8" font-weight="bold">more architectural</text>
  <text x="620" y="30" font-family="sans-serif" font-size="13" fill="#0b7ecb" font-weight="bold" text-anchor="end">more design</text>
  <line x1="60" y1="63" x2="60" y2="80" stroke="#5a23c8" stroke-width="2"/>
  <text x="60" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">choice of style</text>
  <line x1="240" y1="63" x2="240" y2="80" stroke="#5a23c8" stroke-width="2"/>
  <text x="240" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">sync vs. async</text>
  <line x1="420" y1="63" x2="420" y2="80" stroke="#0b7ecb" stroke-width="2"/>
  <text x="420" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">library choice</text>
  <line x1="580" y1="63" x2="580" y2="80" stroke="#0b7ecb" stroke-width="2"/>
  <text x="580" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">class naming</text>
</svg>

*Figure 1 — The architecture–design spectrum. Ask three questions of any decision: how strategic is it, how costly to reverse, how significant are its trade-offs? The higher the answers, the further left it sits — and the more it deserves analysis and a written record.*

Choosing between a queue and a topic for Encore's order events? Strategic, hard to reverse once ten consumers depend on it, heavy trade-offs — architectural. Naming the `OrderPlaced` class? Move on with your life.

### The two laws

Everything in this specialization rests on two laws, and the first is the closest thing our field has to physics:

> **First Law of Software Architecture.** Everything in software architecture is a trade-off. If you think you have found something that isn't, you haven't yet identified the trade-off.

> **Second Law of Software Architecture.** *Why* a decision was made is more important than *how* it was implemented. The code shows the how; only you can preserve the why.

The first law is why this course teaches analysis rather than answers: any book that tells you "microservices are better" (or worse) is selling you half a trade-off. The second law is why Module 4 makes you write things down: six months from now, the cleverest design with a forgotten rationale is indistinguishable from a mistake.

### Meet Encore

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
    classDef system fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    classDef external fill:#e8e8ee,stroke:#9aa,color:#333
    class fan,org person
    class encore system
    class psp,wallet external
</pre>

*Figure 2 — Encore's system context: two kinds of users, two external dependencies, one system whose insides we haven't decided yet. Notice how much this diagram refuses to say — that restraint is deliberate, and Module 4 explains it.*

### The architect, then and now

One more recalibration before we begin working. The architect of the old caricature sat above the team, produced documents, and departed before the consequences arrived. The modern architect is embedded: close enough to the code to feel the consequences of their decisions, senior enough to own trade-offs that span teams. And increasingly, the modern architect thinks in *platforms* — systems whose users are other engineering teams. That idea is the destination of this entire specialization; keep it in peripheral vision throughout.

**Recap.** Architecture = characteristics + decisions + components + style. Architecture and design differ by degree (strategy, reversibility, significance of trade-offs), not kind. Everything is a trade-off; the *why* outlives the *how*.

**Exercise 1.1.** Take a system you know. Write down one decision from it that sits at the far architectural end of the spectrum and one from the far design end. For the architectural one: what was traded away?

---

## Module 2: Architectural Characteristics

### The vocabulary of "-ilities"

Requirements tell you what a system must *do*. Architectural characteristics tell you what it must *be* — available, scalable, secure, testable, affordable. They are the dimensions along which architectures succeed or fail, and they come in four families:

| Family | Concern | Examples |
|---|---|---|
| **Operational** | How the system behaves while running | availability, elasticity, performance, recoverability |
| **Structural** | How the code sustains change | modularity, maintainability, testability, deployability |
| **Process** | How teams and the system co-evolve | agility, upgradeability, learnability |
| **Cross-cutting** | Constraints spanning everything | security, privacy, accessibility, cost, sustainability |

Two of these deserve a modern emphasis the older literature underplays. **Security** is a first-class characteristic from day one — bolting it on later is how breaches are architected. **Cost** is likewise a characteristic, not an accounting afterthought: in the cloud, every architectural decision has a monthly invoice attached.

### Listening for characteristics

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

### The discipline of choosing few

Here is the uncomfortable arithmetic: every characteristic you commit to trades against the others. Optimize for elasticity and you complicate testability. Chase five nines and cost explodes. A system designed to exhibit twenty characteristics exhibits none of them well — this is the first law compounding.

The working discipline: **pick the seven or fewer that would sink the business if missed**, and let the rest be merely adequate. For Encore: elasticity, availability-under-peak, data integrity, security/fairness, deployability, cost, observability. Everything else — internationalization, portability, offline support — is explicitly *not driving* the architecture, and writing that down is as valuable as the list itself.

One preview: in later courses these characteristics stop being adjectives and become *fitness functions* — automated checks that continuously verify the architecture still exhibits them. "Survives a 500× spike" will become a load test that runs before every release. Hold that thought; Course 14 turns it into a way of governing whole platforms.

**Recap.** Characteristics are the system's *be*, not its *do*. They hide in business sentences; translation is a skill. Security and cost are first-class. Choose ≤ 7 drivers and name what you're *not* optimizing for.

**Exercise 2.1.** Interview a colleague about their product for ten minutes. Extract five candidate characteristics from what they say — then cut two, and defend the cuts.

---

## Module 3: Modularity and Logical Components

### Thinking in components

Between "the system" and "the classes" lies the level where architecture actually happens: **logical components** — named building blocks with responsibilities, independent of how they will be deployed. Getting these right matters more than any technology choice, because component boundaries become team boundaries, deployment boundaries, and eventually — if you decompose — service boundaries. Modules 2 and 3 are two halves of one motion: characteristics tell you what the system must be; components give you the shape that can be it.

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

*Figure 3 — Encore's first-cut logical components. Solid arrows are the purchase path; the dotted arrow hints that analytics should learn about sales without sitting inside the sale — a distinction that will matter enormously in Courses 4 and 6.*

Look at how the characteristics shaped the cut. Sale Gate exists as a separate component *only because* of the 500× spike — a calmer business would fold it away. Seat Inventory is small and lonely *because* data integrity wants one owner for seat state. The component diagram is the characteristics list, drawn.

> **The entity trap.** The seductive wrong turn is to name components after database nouns: User Manager, Event Manager, Ticket Manager. Entities are what a system *stores*; components are what a system *does*. An architecture of Managers is a database wearing a trench coat — and every workflow will smear across all of them.

### Coupling, cohesion, and the shape of change

Two old words measure whether your boundaries are good. **Cohesion**: do the things inside a component belong together? **Coupling**: how many other components feel it when one changes? The practical test is the *shape of change*: a good boundary means a typical business change lands inside one component; a bad boundary means every change is a committee meeting. When Encore adds "presale codes for fan clubs," that should touch Sale Gate and little else. If it touches five components, the boundaries — not the developers — are at fault.

Finally, keep logical and physical architecture distinct in your mind. These eight components might deploy as one process, three, or eight — that is a *separate decision*, with its own trade-offs, made in Course 2 and revisited for the rest of the specialization. Fusing "component" with "service" in your head is how systems end up with a network call inside every function.

**Recap.** Components are found through workflows and actor/actions, shaped by characteristics, and named for behavior, not data. Judge boundaries by the shape of change. Logical structure and physical deployment are different decisions.

**Exercise 3.1.** Encore adds gift cards. Which components change? If your answer exceeds two, propose a better boundary.

---

## Module 4: Communicating Architecture — C4 and ADRs

### Diagrams that respect their readers

An architecture that lives in your head is a rumor. The modern standard for drawing systems is the **C4 model** — four zoom levels, each answering one question for one audience:

| Level | Name | Answers | Audience |
|---|---|---|---|
| 1 | System Context | What is this, and what does it touch? | everyone, including non-technical |
| 2 | Container | What are the deployable pieces? | engineers, ops, security |
| 3 | Component | What lives inside each piece? | the owning team |
| 4 | Code | How is a component built? | rarely worth drawing — it rots fastest |

Figure 2 was a Level 1; Figure 3 sketches Level 3 territory. The genius of C4 is what each level *omits*: the context diagram doesn't know what a queue is, and the container diagram doesn't know class names. Every element a diagram omits is a promise it keeps forever — recall how little Figure 2 dared to claim.

Three habits separate diagrams that communicate from diagrams that decorate. **Title every diagram with a question it answers** ("How does a fan's payment flow?"), and delete anything not helping answer it. **Label arrows with verbs** — an unlabeled arrow between Order and Payment could mean five different things, four of which will be assumed by somebody. **Keep diagrams as code** (Mermaid, Structurizr) so they live in the repository, diff in reviews, and update with the system instead of fossilizing in a wiki.

### Decisions that survive their authors

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

*Figure 4 — An ADR's life. Even rejected records earn their keep: "we considered sharding and declined, here's why" saves the next person a week.*

One audience note, in the spirit of the architect elevator: the same decision reads differently on different floors. Engineers get the ADR; executives get one sentence of outcome and risk ("fans will queue briefly so the site cannot crash during our biggest sales moments"). Writing both versions is not spin — it is translation, and it is the architect's job.

**Recap.** C4 gives four zoom levels; power comes from what each omits. Diagrams live in the repo as code, titled with questions, arrows labeled. ADRs preserve the why, admit their losses, and are superseded rather than rewritten.

**Exercise 4.1.** Write the ADR for a decision your team made and never recorded. Show it to whoever argued the other side — the consequences row isn't done until they agree it's fair.

---

## Module 5: Trade-Off Analysis and Your First Kata

### Anatomy of a trade-off

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

*Figure 5 — Two honest options. Neither is wrong; that's what makes it architecture.*

| Concern | Queues (A) | Topic (B) |
|---|---|---|
| Adding a fourth consumer | Order must change | just subscribe — Order never knows |
| Payload discipline | tailored per consumer | one schema; risk fields leak to all readers |
| Per-consumer monitoring | natural (queue depth each) | needs consumer-group tooling |
| Coupling | Order knows every consumer | consumers invisible to producer |
| Security | need-to-know by construction | broad read access to one stream |

Now — and this is the heart of the method — *return to Module 2's characteristics and let them arbitrate*. Encore expects new consumers soon (organizer payouts, a recommendation engine): that favors B. But fairness data in Bot Screening's payload is sensitive, and B shows it to every subscriber: that favors A. A defensible resolution: topic for the broad `OrderPlaced` fact, one dedicated queue for the sensitive risk payload — and an ADR recording exactly why, with the losses in ink. The generic answer does not exist; the *Encore* answer does. Trade-off analysis is not a table of pros and cons — it is pros and cons *weighed by the characteristics you committed to*.

### The kata

An architectural kata is practice under realistic constraints: a business brief, a time box, and defense of your choices before peers — the tradition Module 5 of every course in this specialization builds on.

> **Your brief: "Curtain Call."** A regional theater chain (12 venues) wants season subscriptions, seat selection, member presales, and a waitlist for sold-out shows. Two-person engineering team. Modest but loyal traffic — except the annual holiday show, which sells out in an hour. The CFO's phrase: "we cannot afford drama, in either sense."

**Deliverables:**

1. **Driving characteristics** — at most seven, each traced to a sentence in the brief, plus one candidate you explicitly declined.
2. **Logical components** — a table and a diagram, derived by workflow or actor/action. No Managers.
3. **Three ADRs** for your most significant decisions, consequences honest.
4. **A context diagram** in the spirit of Figure 2.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Traceability | Does every characteristic point at a sentence in the brief? |
| Boundary quality | Does a typical change land in one component? |
| ADR honesty | Would the losing side of each argument sign the consequences row? |
| Restraint | Curtain Call is not Encore — a design that could serve Ticketmaster has failed the CFO. |

### Where you now stand

You can hear characteristics inside business sentences, shape components around them, weigh options with the first law, and record the results so they outlive you. What you cannot yet do is name the overall *shape* — whether Encore should be a modular monolith, a service-based system, or something more exotic. That vocabulary of styles, and the judgment of when each fits, is Course 2.

---

## References

- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) O'Reilly, 2025.
- Raju Gandhi, Mark Richards, Neal Ford — [*Head First Software Architecture*](https://www.oreilly.com/library/view/head-first-software/9781098134341/). O'Reilly, 2024.
- Jacqui Read — [*Communication Patterns*](https://www.oreilly.com/library/view/communication-patterns/9781098140533/). O'Reilly, 2023.
- Gregor Hohpe — [*The Software Architect Elevator*](https://www.oreilly.com/library/view/the-software-architect/9781492077534/). O'Reilly, 2020.

**Further reading:**

- John Ousterhout — [*A Philosophy of Software Design*](https://web.stanford.edu/~ouster/cgi-bin/aposd.php). Yaknyam Press, 2021.
- David Thomas, Andrew Hunt — [*The Pragmatic Programmer*, 20th Anniversary ed.](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) Addison-Wesley, 2019.
- Titus Winters, Tom Manshreck, Hyrum Wright — [*Software Engineering at Google*](https://abseil.io/resources/swe-book). O'Reilly, 2020 — free online.
