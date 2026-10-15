# Software Architecture in the AI & Cloud Era

*The road to platform architecture.*

<small>© 2026 Oleksiy Pylypenko · Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — share and adapt freely, non-commercially, with attribution. Source on [GitHub](https://github.com/oleksiyp/arch-book).</small>

## Preface

AI tools now write working code faster than any of us can type it. What they cannot supply is the judgment around that code: which quality matters most, which trade-off buys it, at what cost, and where the decision is written down for the person who comes next. Fred Brooks, in 1986, separated the essential complexity of software, which lives in the problem itself, from the accidental complexity we add in expressing it. Our new tools are remarkably good at the accidental kind; the essential kind remains, and it is now a larger share of the work. Systems usually fail at the boundaries between components and between teams, and drawing those boundaries is a judgment call. As code gets cheaper, judgment becomes the scarce part of the work.

This book teaches that judgment to engineers who have started making architecture decisions, from first sketch to company-wide platform. Frameworks change every few years, as a city's shopfronts change with each generation of tenants while the street plan underneath endures, and so each chapter is built around the decisions beneath them: how to hear quality attributes in business sentences, where to draw boundaries that survive a reorganization, what a network call costs, when events beat calls, how to promise an API to strangers, what security means once the perimeter is gone, what a model-backed component does to testing, and why it all converges on platforms (systems whose users are other engineering teams).

I have left out UML and enterprise service buses on purpose; both belong to the field's history more than to its present practice. Here, diagrams are code, decisions are records, and architecture is a continuing stream of trade-offs, made under uncertainty, written down and revisited when the facts change. A decision that was never written down cannot be revisited, only rediscovered, and usually at a bad moment.

### Influences & Attribution

No book about architecture is written from nothing, and much of this one's method comes from others. Chapters 1–2 (the two laws, the characteristics taxonomy, the style ratings, katas as practice) follow Mark Richards and Neal Ford's *Fundamentals of Software Architecture*. Chapter 3's granularity forces are adapted from *Software Architecture: The Hard Parts*. Chapter 14 follows Tod Golding's multi-tenant model. The book also draws on Eric Evans (domain-driven design), Sam Newman (microservices), Martin Kleppmann (data-intensive systems), Michael Nygard (architecture decision records), Simon Brown (the C4 model), Matthew Skelton and Manuel Pais (team topologies), Zhamak Dehghani (data mesh), Simon Wardley (evolution mapping), Google's SRE books, and Martin Fowler's pattern vocabulary throughout. Each chapter's references point to the original works, which are always the better read.

Several terms used here as common vocabulary have specific coiners, and a vocabulary that forgets its origins soon forgets its meanings: architectural katas (Ted Neward), golden path (Spotify), paved road (Netflix), STRIDE (Microsoft), ATAM (the SEI), PACELC (Daniel Abadi), sagas (Garcia-Molina and Salem), backend-for-frontend (SoundCloud, popularized by Sam Newman), prompt injection (Simon Willison) and shuffle sharding (AWS).

### Authorship & Disclaimer

Written and directed by Oleksiy Pylypenko, with AI assistance (Anthropic's Claude). The judgment in it comes from twenty-plus years of practice: platform engineering inside a large bank, API architecture in fintech, and a decade of maintaining a widely used open-source library. The author chose the thesis, the structure, the examples, and the trade-offs; edited every chapter; and takes responsibility for every claim — errors included. The content is provided as-is, without warranty of any kind: educational material, not professional advice for any specific system. The license's full disclaimer of warranties applies.

## How to Read This Book

One company runs through all 15 chapters: **Encore**, a startup selling concert tickets, whose traffic can rise 500× in minutes when a tour is announced. Encore is small enough to hold in your head and troubled enough to be interesting. It starts with nine engineers and ends with 400, running its own platform. Each concept is applied to Encore before it is generalized, because an idea we have watched work, or fail, in a particular system is easier to trust and to question.

Each chapter closes with a **kata**: a practice brief for a different company, with its own scale and constraints, and a rubric to check your work against. As with a musician's scales, the value lies in repetition where mistakes are cheap. Every section has short exercises, best done against a system you know. Each chapter's references list the field's standard books; those marked *free online* cost nothing.

## The Arc

**Foundations (Chapters 1–3):** how architects think — trade-offs, characteristics, modern styles, domain-driven boundaries.

**The distributed core (Chapters 4–9):** the technical backbone — distributed systems, microservices, events and streaming, APIs, user interfaces, data.
{: .flush}

**The modern era (Chapters 10–12):** security and zero trust, cloud-native operations and SRE, AI systems.
{: .flush}

**The destination (Chapters 13–15):** the economics of buy versus build, multi-tenant SaaS, and platform engineering — where everything converges, and where the capstone awaits.
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
13. [Buy, Build, and the Economics of Dependence](#ch13)
14. [Multi-Tenant SaaS Architecture](#ch14)
15. [Platform Engineering and the Capstone](#ch15)

---

## Chapter 1: Foundations of Modern Software Architecture {#ch1}

> "All architecture is design but not all design is architecture." — Grady Booch


Every discipline reaches a moment when it stops being a bag of techniques and becomes a way of seeing. For software architecture, that moment comes when we stop asking *"which technology should I use?"* and start asking *"what am I trading away?"*

**Encore**, our companion for all 15 chapters, sells tickets to live concerts. It is a modest business with an immodest problem. When a major artist announces a tour, Encore's traffic rises 500× in minutes; every seat must be sold exactly once; and the bots arrive before the fans do.

---

### 1.1 What Software Architecture Is Today

#### Why the building metaphor fails {#the-building-metaphor-and-why-we-must-abandon-it}

For most of our field's short history we have explained software architecture by analogy to buildings: the architect draws, the builders build, and the structure stands. It is a comforting story, and it misleads at exactly the point that matters most. A building does not double its occupancy overnight because an artist announced a tour, and its residents do not rebuild it every week while living in it.

One lesson from buildings does carry over, and it comes from Stewart Brand's *How Buildings Learn* (1994). Brand, drawing on the architect Frank Duffy's idea of shearing layers, described a building as a set of layers that change at different rates: the site almost never, the structure rarely, the furniture constantly. A building whose fast layers are bound to its slow ones makes every small change expensive. Software has the same layering, except that every layer moves faster, and the parts of a system we call architectural are simply its slowest layers, the ones we would least like to move. Where the metaphor finally fails is in its sense of time. A cathedral is eventually finished; a software system never is, and so its architecture must be designed for change.

What, then, is an architecture? Modern practice describes it as the combination of four things:

| Dimension | What it captures | Encore example |
|---|---|---|
| **Architectural characteristics** | The "-ilities" the system must exhibit | Survive a 500× on-sale spike |
| **Architectural decisions** | The rules and constraints, with their rationale | "Seat inventory is owned by exactly one service" |
| **Logical components** | The building blocks and their responsibilities | Seat Inventory, Order, Bot Screening |
| **Architectural style** | The overall shape the components live in | To be decided in Chapter 2 |

All four are needed, and each is hollow without the others. Microservices with no recorded decisions are as fragile as a decision log for a system nobody built.

#### Architecture and design as a spectrum {#architecture-and-design-a-spectrum-not-a-wall}

There is no line where architecture ends and design begins, although much effort has gone into drawing one. Every decision sits somewhere on a spectrum between the two, and what we want to know about a decision is how far along it lies.

<svg viewBox="0 0 640 120" style="max-width:640px;width:100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="specTitle specDesc">
  <title id="specTitle">The architecture–design spectrum</title>
  <desc id="specDesc">A horizontal gradient bar from "more architectural" (left) to "more design" (right), with markers at: choice of style, sync vs. async, library choice, class naming.</desc>
  <defs>
    <linearGradient id="spec" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d9482b"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="20" y="45" width="600" height="18" rx="9" fill="url(#spec)"/>
  <text x="20" y="30" font-family="sans-serif" font-size="13" fill="#b23a20" font-weight="bold">more architectural</text>
  <text x="620" y="30" font-family="sans-serif" font-size="13" fill="#0b7ecb" font-weight="bold" text-anchor="end">more design</text>
  <line x1="60" y1="63" x2="60" y2="80" stroke="#b23a20" stroke-width="2"/>
  <text x="60" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">choice of style</text>
  <line x1="240" y1="63" x2="240" y2="80" stroke="#b23a20" stroke-width="2"/>
  <text x="240" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">sync vs. async</text>
  <line x1="420" y1="63" x2="420" y2="80" stroke="#0b7ecb" stroke-width="2"/>
  <text x="420" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">library choice</text>
  <line x1="580" y1="63" x2="580" y2="80" stroke="#0b7ecb" stroke-width="2"/>
  <text x="580" y="97" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">class naming</text>
</svg>

*Figure 1.1 — The architecture–design spectrum, from choice of style to class naming. The further left a decision sits, the more it deserves analysis and a written record.*

Three questions place any decision on the spectrum: how strategic is it, how costly is it to reverse, and how significant are its trade-offs? The higher the answers, the further left it sits.

Choosing between a queue and a topic for Encore's order events is architectural: it is strategic, it becomes hard to reverse once 10 consumers depend on it, and it is full of trade-offs, which Section 1.5 works through in detail. Naming the `OrderPlaced` class is design: if the name proves wrong, an afternoon of refactoring repairs it, and so the right amount of deliberation is about a minute. What separates the two is the price of being wrong.

#### The two laws

The book rests on two laws from Richards and Ford:

> **First Law of Software Architecture** (Richards & Ford). Everything in software architecture is a trade-off. If you think you have found something that isn't, you haven't yet identified the trade-off.

> **Second Law of Software Architecture** (Richards & Ford). *Why* a decision was made is more important than *how* it was implemented.

The code shows how; only people and their written records keep the why. The conviction behind the second law is older than the law itself. When Dewayne Perry and Alexander Wolf set out foundations for the study of software architecture in 1992, they described an architecture as a set of elements, their form, and the *rationale* for them; of those three, rationale is the one our industry has most consistently failed to keep. The second edition of Richards and Ford's book adds a third law, which Figure 1.1 already illustrates: most architecture decisions sit on a spectrum between two extremes.

The first law is why this book teaches analysis instead of verdicts. Anyone who says microservices are better (or worse) is describing half a trade-off, and the missing half is usually the one you will pay for. The second law is why Section 1.4 insists on writing decisions down. Memory is a poor archive. Six months later, a clever design whose rationale nobody remembers looks exactly like a mistake, and someone well-meaning will set about correcting it.

#### Encore, our running example

Fans browse listings, join an on-sale when tickets drop, pick seats, and pay. Event organizers create events and watch sales dashboards. Payments run through an external provider, and tickets are delivered to fans' phones.

{% include diagrams/fig-1-2.svg %}

*Figure 1.2 — Encore's system context: two kinds of users, two external dependencies, and one system whose internals are still undecided. The diagram leaves out a great deal on purpose; Section 1.4 explains why that restraint is a strength.*

#### The architect, then and now

The architect of the old caricature sat above the team, produced documents, and left before the consequences arrived. The modern architect is embedded, close enough to the code to feel their decisions and senior enough to own trade-offs that span teams. The role has moved from the drawing office to the building site, and it is better for the move.

Increasingly, that architect thinks in *platforms*, systems whose users are other engineering teams. Platform architecture is where this book ends. Along the way, keep hold of a conviction I have come to value above any technique: systems are built by people, out of decisions, and both outlive the code.

**Recap.** An architecture is its characteristics, decisions, components, and style, and none of the four stands alone. Architecture and design differ in degree, judged by strategy, reversibility, and the weight of the trade-offs. Everything is a trade-off, and why a decision was made matters more than how.

**Exercise 1.1.** Take a system you know. Write down one decision from it that sits at the far architectural end of the spectrum and one from the far design end. For the architectural one, what was traded away?

---

### 1.2 Architectural Characteristics

#### The vocabulary of "-ilities"

Requirements say what a system must *do*; architectural characteristics say what it must *be*: available, scalable, secure, testable, affordable. The distinction is easy to state and surprisingly easy to lose, because a system can meet every functional requirement on a quiet Tuesday afternoon and still fail its business on the one evening that matters. This book sorts characteristics into four families, adapted from Richards and Ford (who group them as operational, structural, cloud, and cross-cutting):

| Family | Concern | Examples |
|---|---|---|
| **Operational** | How the system behaves while running | availability, elasticity, performance, recoverability |
| **Structural** | How the code sustains change | modularity, maintainability, testability, deployability |
| **Process** | How teams and the system co-evolve | agility, upgradeability, learnability |
| **Cross-cutting** | Constraints spanning everything | security, privacy, accessibility, cost, sustainability |

Older literature underplays two of these. Security belongs in the first design, because adding it later means reworking boundaries drawn without it, rather like adding fire stairs to a building whose floors are already poured. Cost counts too. In the cloud every architectural decision shows up on the monthly invoice, so an architect who ignores cost has not avoided the decision; they have handed it to the finance department, which will make it later and less gently.

#### Listening for characteristics

Nobody hands you a list. Characteristics are buried in what the business says, usually in words that sound nothing like "-ilities," and so the architect's first skill is translation. The work resembles a physician's: the patient describes symptoms, and the physician listens for the condition behind them. The resemblance holds further than we might like, since founders, like patients, are eloquent about what hurts and rarely know its cause. Listen to Encore's founders:

| The founders say... | The architect hears... |
|---|---|
| "When a top artist drops tickets, traffic is 500× normal for 10 minutes." | **Elasticity**: the *speed* of scaling as well as its size |
| "If we're down during an on-sale, it's front-page news." | **Availability**, precisely when load is worst |
| "We can never sell the same seat twice." | **Data integrity**: consistency where it counts |
| "Bots buy out shows before real fans get in." | **Security** and *fairness*, a composite worth naming |
| "We're a team of nine and we ship weekly." | **Deployability**, **testability**, **simplicity** |
| "Margins are thin; the platform can't eat them." | **Cost** as a standing constraint |
| "Last on-sale went wrong and we heard about it from fans on social media first." | **Observability**: knowing before customers tell you |

An adjective cannot be tested, and "highly available" is a hope that can never fail a build. So we write each driver as a measurable scenario, in the style of the Software Engineering Institute's quality-attribute scenarios: *"During a 500× on-sale, 99.9% of admitted fans complete checkout within 3 s."* It names the stimulus, the conditions, and the response we will be held to, and Chapter 11 builds Encore's service-level objectives (SLOs) from scenarios like it.

Nobody asked for portability across cloud providers, and nobody needs the seat map to render in 4 ms. Fred Brooks, in "No Silver Bullet" (1986), separated the *essential* complexity of a problem from the *accidental* complexity we bring to it. Encore's 500× spike is essential; no design makes it go away. Portability that nobody requested would be accidental complexity of the purest kind, because we would have introduced it ourselves. A characteristic with no business sentence behind it is overengineering, however diligent it feels.

#### The discipline of choosing few

Every characteristic we commit to trades against the others. Elasticity complicates testability, because a system that reshapes itself under load is hard to reproduce on a developer's machine; five nines of availability makes cost climb steeply, because each extra nine is bought with redundancy. A system designed for 20 characteristics delivers none of them well, which is simply the first law, compounded. An orchestra in which every instrument plays at full volume makes only noise; the melody is heard because the other parts agree to accompany it.

So we pick the seven or fewer that would sink the business if missed, and let the rest be adequate (the accompaniment must still play in tune). For Encore, the seven are elasticity, availability-under-peak, data integrity, security and fairness, deployability, cost, and observability. Testability and simplicity survive inside deployability, because a team of nine cannot ship weekly without them. Everything else, such as internationalization, portability, and offline support, is explicitly *not driving* the architecture, and writing that down matters as much as the list, because the omissions are where future arguments will begin.

Later chapters turn these characteristics into *fitness functions*, automated checks that the architecture still has them. "Survives a 500× spike" becomes a load test run before every release, and Chapter 15 uses fitness functions to govern whole platforms. A characteristic that is checked every week stays true; one that is merely written down drifts.

**Recap.** Characteristics describe what the system must be, and we find them by translating what the business says. Security and cost count from the first design. We choose seven drivers or fewer, state each as a measurable scenario, and record what we are not optimizing for.

**Exercise 1.2.** Interview a colleague about their product for 10 minutes. Extract five candidate characteristics from what they say, then cut two and defend the cuts.

---

### 1.3 Modularity and Logical Components

#### Thinking in components

Between the whole system and its classes sits the level where most architecture work happens: **logical components**, named building blocks with responsibilities, independent of how they will be deployed. Component boundaries matter more than any technology choice, because they rarely stay logical for long. They become team boundaries, then deployment boundaries and, if you decompose, service boundaries. Melvin Conway observed in 1968 that organizations which design systems tend to produce designs that copy their own communication structures, an observation we now call Conway's law. Later practitioners turned the law around, shaping teams deliberately to get the architecture they wanted; the move, named at ThoughtWorks and popularized by *Team Topologies*, is called the inverse Conway maneuver. Either way, the boundaries we draw on a whiteboard and the boundaries between teams do not stay independent for long.

Two complementary techniques find them, and it pays to use both, because each sees what the other misses.

**The workflow approach** walks the system's main journeys and names what each step needs. A fan's on-sale journey: browse the catalog, join the queue when sales open, pass the bot check, pick seats, pay, and receive the ticket.

**The actor/action approach** lists each actor and what they do, then groups the actions. Organizers create events and watch dashboards; fans do everything in the journey above; the payment provider calls back with results.

Run both over Encore, reconcile what they find, and this component set settles out:

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

{% include diagrams/fig-1-3.svg %}

*Figure 1.3 — Encore's first-cut logical components. Sale Gate, Order, and Payment Integration form the purchase path. The dashed arrow shows analytics learning about sales from outside the purchase path, a distinction on which Chapters 4 and 6 depend.*

The characteristics shaped this cut. Sale Gate exists only because of the 500× spike; a business with calmer traffic would not need it. Seat Inventory is small and isolated because data integrity needs one owner for seat state, and ownership is easiest to defend when the owner has nothing else to do. Read the last column of the table again and you will see that a good component set is the characteristics list, drawn.

> **The entity trap.** The tempting wrong turn is to name components after database nouns: User Manager, Event Manager, Ticket Manager. Entities are what a system *stores*; components are what it *does*. An architecture of Managers is a database wearing a trench coat, and every workflow smears across all of them.

#### Coupling, cohesion, and the shape of change

Two old terms from the structured design of the 1970s measure boundaries. **Cohesion** is the degree to which the things inside a component belong together. **Coupling** is the degree to which a change in one component forces changes in others. Herbert Simon described the same property in "The Architecture of Complexity" (1962): complex systems that endure tend to be *nearly decomposable*, their parts interacting strongly within and weakly between, as a living cell does.

In 1972 David Parnas argued that a system should be divided along the design decisions most likely to change, each module hiding one such decision from the rest. From that criterion follows our practical test, the *shape of change*. With good boundaries, a typical business change lands inside one component. When Encore adds presale codes for fan clubs, the change should touch Sale Gate and little else. If it touches five components, fix the boundaries before blaming the developers.

Keep logical and physical architecture apart, in your diagrams and in your head. These eight components might deploy as one process, three, or eight; that is a separate decision, with trade-offs of its own, made in Chapter 2 and revisited throughout the book. Treating every component as a service is how systems end up with a network call inside every function.

**Recap.** We find components through workflows and actor/actions, let the characteristics shape them, and name them for what they do. Good boundaries are cohesive within and loosely coupled between, so that a typical change lands in one component. How components deploy is a separate decision, and keeping it separate is half the discipline.

**Exercise 1.3.** Encore adds gift cards. Which components change? If more than two, propose a better boundary.

---

### 1.4 Communicating Architecture — C4 and ADRs

#### Diagrams with the C4 model {#diagrams-that-respect-their-readers}

An architecture that exists only in people's heads cannot be checked; each teammate carries a slightly different version, and nobody discovers the differences until they collide in code. Philippe Kruchten's 4+1 view model (1995) taught us that no single picture serves every reader. The modern standard for drawing systems, Simon Brown's **C4 model**, cuts the problem differently, into four zoom levels, each answering one question for one audience.

| Level | Name | Answers | Audience |
|---|---|---|---|
| 1 | System Context | What is this, and what does it touch? | everyone, including non-technical |
| 2 | Container | What are the deployable pieces? | engineers, ops, security |
| 3 | Component | What lives inside each piece? | the owning team |
| 4 | Code | How is a component built? | rarely worth drawing; it goes stale fastest |

The levels work the way a road atlas does, moving from country to region to city street, with each map useful precisely because it leaves out the detail of the next. Figure 1.2 is a Level 1 diagram. Figure 1.3 is a logical component view of the whole system; C4's Level 3 applies once containers exist, with one diagram per container. A diagram cannot be wrong about what it omits, so Figure 1.2 will stay accurate as Encore's internals change. Here the analogy breaks: an atlas is printed once for territory that barely moves, and ours moves every week.

That is why three habits help. Title each diagram with the question it answers ("How does a fan's payment flow?") and delete anything that does not help answer it. Label arrows with verbs; an unlabeled arrow between Order and Payment could mean five different things, and each reader will assume a different one. Keep diagrams as code (Mermaid, Structurizr) so they live in the repository, diff in reviews, and change with the system instead of going stale in a wiki.

#### Architecture decision records {#decisions-that-survive-their-authors}

The second law tells us that the why is the most valuable thing we produce; the **architecture decision record (ADR)** is how we keep it. Michael Nygard's format has five sections (title, status, context, decision, consequences). Richards and Ford add a compliance section saying how the decision will be checked, which this book calls *Governance*. An ADR is one page, numbered, and immutable except for its status:

| Section | Encore's ADR-007 |
|---|---|
| **Title** | Virtual waiting room in front of seat selection |
| **Status** | Accepted |
| **Context** | On-sales bring 500× traffic in minutes. Direct load would down Seat Inventory exactly when availability matters most. Fans expect fairness; bots try to skip lines. |
| **Decision** | All on-sale traffic passes through a queue-based waiting room (Sale Gate) that admits users at Seat Inventory's sustainable rate. |
| **Consequences** | Fans wait (mitigated: accurate queue position). Sale Gate is a new critical path and alone must handle raw spikes. Gains: Seat Inventory sized for admitted flow, not peaks; a single fairness point; a natural place for bot screening. |
| **Governance** | Pre-release load test replays the worst on-sale ×2; alert if p99 admission latency exceeds budget. |

Read the consequences row again. It lists losses as well as gains, in plain words. An ADR that lists no losses is advertising, and by the first law it is also wrong.

ADRs are never edited to look right in hindsight. A reversed decision gets a new ADR that supersedes the old one, and the old record remains, much as strata remain in a cliff face, showing what the ground looked like when each layer was laid down. That record stops teams from re-arguing settled questions, and from repeating mistakes whose reasoning has been forgotten.

{% include diagrams/fig-1-4.svg %}

*Figure 1.4 — An ADR's life, from proposal to acceptance or rejection, then supersession. Rejected records are useful too: "we considered sharding and declined, here's why" saves the next person a week.*

The same decision reads differently on different floors of an organization. Gregor Hohpe, in *The Software Architect Elevator* (2020), pictures the architect riding between the penthouse, where strategy is set, and the engine room, where systems are built. Engineers get the ADR; executives get one sentence of outcome and risk: "fans will queue briefly so the site cannot crash during our biggest sales moments." Writing that sentence, faithful to the ADR, is translation rather than spin, and part of the architect's job.

Coding agents are now a third, peculiarly literal reader. ADRs and diagrams in the repository become their context. An agent follows a recorded boundary and crosses an unrecorded one without warning, because it has no hallway conversations from which to learn the rules nobody wrote down. An assistant can draft an ADR in seconds; the consequences still need an owner who will live with them.

**Recap.** C4 gives four zoom levels, each useful for what it leaves out. Diagrams live in the repository as code, titled with questions, with labeled arrows. ADRs preserve the why, state their losses plainly, and are superseded rather than rewritten.

**Exercise 1.4.** Write the ADR for a decision your team made and never recorded. Show it to whoever argued the other side. The consequences row is done only when they agree it is fair.

---

### 1.5 Trade-Off Analysis in Practice

#### Anatomy of a trade-off

Let us now practice the first law deliberately, on a decision small enough to see whole. When a fan completes a purchase, three components must learn about it: Notification (send the ticket), Sales Analytics (update dashboards), and Bot Screening (learn purchase patterns). Order can tell each consumer through a dedicated **queue**, or publish once to a shared **topic**.

{% include diagrams/fig-1-5a.svg %}

{% include diagrams/fig-1-5b.svg %}

*Figure 1.5 — Two viable options: a queue per consumer, or one shared topic. Neither is wrong in general, which is why the choice needs analysis.*

| Concern | Queues (A) | Topic (B) |
|---|---|---|
| Adding a fourth consumer | Order must change | just subscribe; Order never knows |
| Payload discipline | tailored per consumer | one schema; risk fields leak to all readers |
| Per-consumer monitoring | natural (queue depth each) | lag per consumer group (most brokers expose it) |
| Coupling | Order knows every consumer | consumers invisible to producer |
| Security | need-to-know by construction | broad read access to one stream |

Here is the heart of the method: we return to the characteristics committed to in Section 1.2 and let them arbitrate. Encore expects new consumers soon (organizer payouts, a recommendation engine), which favors B. But the fairness data in Bot Screening's payload is sensitive, and B shows it to every subscriber, which favors A.

A defensible resolution uses both: a topic for the broad `OrderPlaced` fact, one dedicated queue for the sensitive risk payload, and an ADR recording why. The hybrid has a price of its own, as the first law promised it would. Order now publishes twice, and a crash between the two sends leaves one consumer uninformed, so both publishes must go through a transactional outbox (Chapter 6).

There is no generic answer to the question of queue or topic, only an Encore answer. Trade-off analysis weighs pros and cons by the characteristics a system has committed to, and so another company, looking at exactly the same table, could reasonably choose differently. The table is the same for everyone; the weights belong to the business.

**Recap.** We state the options fairly, tabulate what each costs, and let the committed characteristics break the tie. The resolution earns an ADR, and whatever new risks it introduces go into the consequences row, where the next architect will find them.

**Exercise 1.5.** Pick a messaging or integration choice in a system you know and redo the queue/topic table for it. Which characteristic broke the tie, and what did the winning option cost?

---

### Kata: Curtain Call

Every chapter closes with an architectural kata. The word comes from the martial arts, where a kata is a form rehearsed until the movements become judgment; ours is practice under realistic constraints, with a business brief, a time box, and a defense of your choices before peers.

> **Your brief: "Curtain Call."** A regional theater chain (12 venues) wants season subscriptions, seat selection, member presales, and a waitlist for sold-out shows. Two-person engineering team. Modest but loyal traffic, except the annual holiday show, which sells out in an hour. The CFO's phrase: "we cannot afford drama, in either sense."

**Deliverables:**

1. **Driving characteristics** — at most seven, each traced to a sentence in the brief, plus one candidate you explicitly declined.
2. **Logical components** — a table and a diagram, derived by workflow or actor/action. No Managers.
3. **Three ADRs** for your most significant decisions, with the losses stated in each consequences row.
4. **A context diagram** in the spirit of Figure 1.2.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Traceability | Does every characteristic point at a sentence in the brief? |
| Boundary quality | Does a typical change land in one component? |
| ADR honesty | Would the losing side of each argument sign the consequences row? |
| Context clarity | Does the context diagram show only the people, the outside systems, and Curtain Call itself? |
| Restraint | Is the design sized for Curtain Call? One that could serve Ticketmaster has failed the CFO. |

#### Where you now stand

You can now hear characteristics in business sentences, shape components around them, weigh options with the first law, and record the reasoning so that it outlives the conversation that produced it. What you cannot yet do is name the overall *shape*: whether Encore should be a modular monolith, a service-based system, or something more exotic. Mary Shaw and David Garlan's *Software Architecture: Perspectives on an Emerging Discipline* (1996) offered one of the field's first systematic catalogs of such shapes, and the catalog has grown since. Chapter 2 supplies that vocabulary of styles and the judgment of when each fits.

---

### References

- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/). O'Reilly, 2025.
- Raju Gandhi, Mark Richards, Neal Ford — [*Head First Software Architecture*](https://www.oreilly.com/library/view/head-first-software/9781098134341/). O'Reilly, 2024.
- Jacqui Read — [*Communication Patterns*](https://www.oreilly.com/library/view/communication-patterns/9781098140533/). O'Reilly, 2023.
- John Ousterhout — [*A Philosophy of Software Design*](https://web.stanford.edu/~ouster/cgi-bin/aposd.php). Yaknyam Press, 2021.
- Gregor Hohpe — [*The Software Architect Elevator*](https://www.oreilly.com/library/view/the-software-architect/9781492077534/). O'Reilly, 2020.
- Titus Winters, Tom Manshreck, Hyrum Wright — [*Software Engineering at Google*](https://abseil.io/resources/swe-book). O'Reilly, 2020 — free online.
- David Thomas, Andrew Hunt — [*The Pragmatic Programmer*, 20th Anniversary ed.](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/). Addison-Wesley, 2019.
- Michael Keeling — [*Design It!*](https://pragprog.com/titles/mkdsa/design-it/). Pragmatic Bookshelf, 2017.
- George Fairbanks — [*Just Enough Software Architecture*](https://www.georgefairbanks.com/book/). Marshall & Brewer, 2010.
- Simon Brown — [*Software Architecture for Developers*](https://c4model.com/). Leanpub; the C4 model site — free online.
- Michael Nygard — [*Documenting Architecture Decisions*](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). Cognitect, 2011 — free online.

---

## Chapter 2: Architecture Styles for the Cloud Era {#ch2}

> A style is not a destination; it is a bet about which changes will come.


Chapter 1 left Encore with its characteristics and its components, and with one question deliberately unanswered: what overall *shape* should the system take? An **architecture style** is a named, recurring arrangement of components and the connections between them, together with the constraints on how they may be combined. Mary Shaw and David Garlan cataloged the first such styles in the early 1990s, and in doing so gave the field a vocabulary for talking about shape at all. Choosing a style is the largest decision we make about a system. It fixes how components are packaged, how they talk, and which characteristics come cheap and which come dear.

Every style below comes with its costs attached, and the monolith, an insult for a decade, gets a fair hearing. Style selection is an economic decision before it is a technical one, made per system and revisited when the business changes, as it always does.

### 2.1 Foundations of Style Analysis

#### Two axes that classify styles {#two-axes-that-generate-the-catalog}

The catalog of styles looks like a menagerie until we see the two axes behind it. The first is partitioning: is the code split *technically*, by layer (presentation, business, persistence), or *by domain*, by business capability (orders, inventory, payments)? The second is deployment: does the system ship as *one unit* or *many*? Crossing them gives four quadrants:

{% include diagrams/fig-2-1.svg %}

*Figure 2.1 — The style catalog on its two generating axes. The top-left quadrant, distributed but technically partitioned, is nearly empty because it is nearly always a mistake: services sliced by layer must all change together, so you pay distribution's costs and collect none of its benefits. Event-driven sits on the line because its event processors can be sliced either way. Axes after Richards & Ford.*

The industry built that empty quadrant at scale in the 2000s and called it service-oriented architecture (SOA). Its intentions were good, but orchestration-driven SOA cut systems into technical strata (service buses, orchestration engines, "business services" shared by everything), and so changing one business feature meant coordinating five teams and a middleware committee. Parnas's criterion from Chapter 1 explains the failure. A module should hide a decision likely to change, and in a business system the decisions most likely to change are business rules. A layer hides none of them; each rule is smeared across every stratum, and each stratum belongs to a different team.

Our field tends to repeat its history in new clothes. A microservices estate sliced by layer, or one that routes every call through a shared orchestration hub, is SOA again in smaller containers. The lesson fits in a sentence: *partition by domain, or every change becomes a negotiation.*

#### Reading a style's ratings {#reading-a-styles-price-tag}

The six core styles are rated one to five stars for deployability, elasticity, fault tolerance, simplicity, cost and data consistency. Read the stars as you would a used-car listing: accurate about relative differences, silent about your situation. Five stars for elasticity are no bargain for a system whose load never moves. The ratings become decisions only when set against *your* driving characteristics from Chapter 1.

Behind every distributed rating sit the eight fallacies of distributed computing (the network is *not* reliable, latency is *not* zero, bandwidth is *not* infinite, and so on). They have outlived the technologies they were written about. Chapter 4 treats them properly. Until then, assume every arrow that crosses a process boundary costs latency and adds a way to fail, whether or not anyone drew it.

**Recap.** Two axes, partitioning and deployment, generate the catalog. SOA's failure taught the industry to partition by domain, because only domain boundaries hide the decisions that actually change. Star ratings are relative prices, and they mean something only when weighed against your own characteristics.

**Exercise 2.1.** Place the last three systems you worked on in Figure 2.1's quadrants. If any sat in the top left, estimate what it cost.

### 2.2 Monolithic Styles Done Right

#### Layered architecture and the sinkhole anti-pattern {#the-layered-default-and-its-sinkhole}

The layered monolith (presentation on top of business on top of persistence) is where most systems begin, because it matches how a single team thinks. Its lineage is distinguished: Edsger Dijkstra's THE multiprogramming system (1968) was built as a stack of levels, each presenting a simpler machine to the one above. Its ratings: simplicity ★★★★★, cost ★★★★★, elasticity ★★, data consistency ★★★★★.

Its typical failure is the *architecture sinkhole*, a request that passes through every layer without any layer doing work. When most requests are sinkholes, the layers have become ceremony.

#### The modular monolith {#the-modular-monolith-one-deployment-real-boundaries}

A modular monolith partitions by *domain* (modules for Catalog, Orders, Inventory) inside one deployable. Each module owns its tables, and modules talk only through declared interfaces. The compiler and build system enforce what a network otherwise would, at in-process latency and with no extra infrastructure.

Think of an apartment building. The units share a foundation, a roof and the utilities, yet the walls between units are real, and a fire in one should not reach the next. Microservices are a street of detached houses, each with its own foundation. The analogy breaks at a telling point: a concrete wall stays put unattended, while a wall between modules stands only as long as something keeps checking it.

So the hard part is enforcement, because any module is one careless import away from reaching into another. Chapter 1's fitness functions do the enforcing:

| Boundary rule | Enforced by |
|---|---|
| Module A may not import module B's internals | dependency-analysis test in continuous integration (CI), failing the build |
| No module reads another module's tables | schema ownership and SQL lint in CI |
| No dependency cycles between modules | cycle-detection fitness function |
| Public module APIs are explicit | build-system visibility (exported packages only) |

Off-the-shelf tools cover most stacks: ArchUnit or Spring Modulith on the Java Virtual Machine (JVM), NetArchTest in .NET, Packwerk in Ruby, import-linter in Python, and dependency-cruiser for JavaScript and TypeScript. Their value lies in running on every commit, long after the people who drew the boundaries have moved on. *A modular monolith without automated boundary enforcement is an ordinary monolith with better intentions.*

#### Microkernel and pipeline architectures {#microkernel-and-pipeline-shapes-for-specific-problems}

Two more monolithic styles fit narrower problems, and fit them well. The **microkernel**, a minimal core plus plug-ins, borrows its name from operating systems, where how little belongs in the kernel has been argued for decades. It suits products built around extension: IDEs, browsers, payment processors with per-country rules, add-on marketplaces.

The **pipeline**, filters connected by pipes, suits transformation work: extract, transform, load (ETL) jobs, media processing and compiler-like flows. Its best-known form is the Unix pipe, added in 1973 at Doug McIlroy's urging, which let small programs that each did one thing be joined into larger ones. Each filter knows only its input and output, and that ignorance is what makes it reusable.

A problem has a shape of its own, and the style should echo it. A marketplace product forced into layers, or a workflow product forced into plug-ins, ends up fighting its own domain.

**Recap.** The layered style is a reasonable place to begin and a poor place to stay; sinkholes signal layers that no longer earn their keep. The modular monolith gives domain partitioning without distribution, provided automated checks enforce its boundaries. Microkernel and pipeline fit specific problem shapes.

**Exercise 2.2.** Sketch Encore's eight components (Section 1.3) as modules of a modular monolith. Which two module boundaries would you enforce first, and with what check?

### 2.3 Distributed Styles

#### Service-based architecture {#service-based-the-pragmatic-middle}

Service-based architecture splits the system into a handful of coarse domain services, typically 4 to 12, which usually share one database. In my judgment it is the most underrated style in the catalog: major domains deploy and fail independently, while the system keeps one database's consistency and one operations team's workload. It resembles a town of a few districts, each rebuilt on its own schedule, all drawing on one water main.

The shared database is that water main. It remains a single point of failure and couples every service to each schema change, so watch it as services multiply. Its card (elasticity ★★★, deployability ★★★★, cost ★★★★, data consistency ★★★★★) is remarkably balanced, and it makes the style the right first distributed step for many systems.

#### Microservices {#microservices-maximum-decoupling-maximum-invoice}

Microservices take domain partitioning to its limit: many small services, each owning its data and deploying on its own. Every rating that concerns independence rises to five stars, and simplicity and cost fall to one; the falling ratings are the price of the rising ones, paid in network calls, distributed data and operational machinery.

The real prerequisite is organizational: many teams that need to move without coordinating. Conway's law, from Chapter 1, tells us a system copies its builders' communication structure, and microservices are what that structure looks like when there are many autonomous teams. Communication paths multiply with team size (Brooks's arithmetic, Chapter 5), yet nine people have only 36 pairs between them, which a daily standup covers. A team of nine has no coordination problem worth microservices' price. Chapter 5 covers the style in full. The short version: *microservices solve a scaling problem you measure in teams.*

#### Event-driven and space-based architectures {#event-driven-and-space-based-styles-for-motion-and-spikes}

Event-driven architecture connects components with *events* instead of calls: producers announce facts, consumers react, and nobody waits. A nerve carries a signal to one destination, as a call does; a hormone enters the bloodstream, every cell with the right receptor responds, and the gland never learns who listened. Event-driven systems are endocrine, and they can be as hard to diagnose as a hormonal disorder, since cause and symptom may sit in different organs.

Its two topologies differ in who controls the flow. In the **broker** topology, events pass between processors through a broker with no coordinator, which maximizes decoupling but hides the end-to-end flow. In the **mediator** topology, a coordinator drives the workflow, buying visibility and control at the cost of a central hub.

Fault tolerance and elasticity are excellent, but answering *"what happens after X?"* means tracing events through several consumers. Chapter 6 is about doing this well.

Space-based architecture removes the database bottleneck. Processing units keep working state in replicated in-memory grids, and the database becomes an eventually updated system of record. It exists for extreme, spiky, write-heavy load such as flash sales, auctions and betting, and its price is the hardest data-consistency reasoning in the catalog: when two replicas disagree about the last seat, no database stands by to settle it.

#### Serverless and cell-based architectures {#serverless-and-cells-cloud-native-shapes}

Two cloud-born shapes cut across the catalog. **Serverless** (functions and fully managed services) is more a cost curve than a partitioning: you pay per invocation and nothing at idle, and the system scales as fast as the platform can start instances, metered by the millisecond. The fine print is cold starts, execution time limits and stateless units. It suits spiky, event-shaped work; Chapter 11 weighs it against containers.

**Cell-based architecture** runs several complete, independent copies of a system, each serving a fixed slice of users. A bad deploy or a runaway workload takes down one cell and leaves the others running, as a ship's watertight bulkheads confine a breach to one compartment. Cells protect only if nothing they share, such as a routing layer or control plane, carries the failure across. Cells limit blast radius on top of whatever style you chose; Chapter 14 builds on them.

#### The styles, side by side

| | Layered | Modular monolith | Service-based | Microservices | Event-driven | Space-based |
|---|---|---|---|---|---|---|
| Deployability | ★★ | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★ |
| Elasticity | ★★ | ★★ | ★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| Fault tolerance | ★ | ★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ |
| Simplicity | ★★★★★ | ★★★★ | ★★★ | ★ | ★★ | ★ |
| Cost | ★★★★★ | ★★★★★ | ★★★★ | ★ | ★★★ | ★★ |
| Data consistency | ★★★★★ | ★★★★★ | ★★★★★ | ★★ | ★★ | ★★ |

*Figure 2.2 — Relative ratings of the six core styles. Compare whole columns: none is all stars, which is the first law in table form. Ratings adapted from Richards & Ford; the data-consistency row and several cells are this book's own judgment.*

**Recap.** Service-based is the balanced middle. Microservices buy independence for many teams at the highest operational price, worth paying only when the teams exist. Event-driven trades end-to-end visibility for decoupling, and space-based trades simple consistency for surviving spikes. Serverless and cells are a cost curve and a blast-radius limit laid over whichever style we choose.

**Exercise 2.3.** Using Figure 2.2 and Encore's seven characteristics from Chapter 1, eliminate three styles for Encore *before* reading Section 2.4. Write one sentence per elimination.

### 2.4 Choosing a Style

#### Encore's style decision, worked through {#the-decision-worked-honestly}

Style selection applies Chapter 1's method to the biggest decision. Line up five drivers: **domain shape** (how many naturally separate capabilities?), **team topology** (how many teams must move independently?), **operational maturity** (who carries the pager, and how good are they?), **characteristic outliers** (which components need very different ratings?) and **cost ceiling**.

Encore has nine engineers on one team, so microservices would solve a problem it does not have. Its steady traffic is modest, so space-based architecture would cost money every day and almost never pay off. And yet one outlier stands out: the on-sale spike. Sale Gate needs elasticity ★★★★★ while the rest of the system needs ★★. One style for everything would mean either starving Sale Gate or making the organizer dashboards elastic enough for a stampede they will never see.

The way out is to see that a style decision need not cover the whole system. The unit of style is the **architecture quantum**, a term coined in *Building Evolutionary Architectures* and sharpened in *Software Architecture: The Hard Parts*. An architecture quantum is the smallest part of a system that can be deployed on its own and still work. It carries its own code, data and characteristics, is highly cohesive inside, and has no synchronous dependencies outside.

Characteristics belong to quanta. "How elastic is Encore?" has no single answer; the useful question is "which quantum?" The ratings, drivers and selection method all apply per quantum, so one system can contain a modular-monolith quantum and a serverless quantum, each rated on its own card. A hospital works this way: the wards are planned for a steady load, while the emergency department has its own entrance and triage and is designed for surges, and nobody rebuilds the maternity ward to emergency standards. The analogy breaks at staffing: a hospital's surge capacity is slow to add, whereas Encore's is compute, rented by the minute. Encore's answer:

{% include diagrams/fig-2-3.svg %}

*Figure 2.3 — Encore's chosen shape: a modular monolith serves the steady majority, and the on-sale quantum (Sale Gate and Bot Screening) is extracted and scaled independently. The characteristic outlier drove the style decision.*

In the architecture decision record (ADR), the consequences row says Encore accepts a network boundary, with its fallacies, around exactly one quantum, so it can scale that quantum 500× without paying to scale the other six components. Bot Screening sits in that quantum even though security drives it, because every fan is screened before admission and it takes the full spike too. The boundary falls where the founders' sentence about 500× traffic lands on the component list.

**Recap.** The drivers are domain shape, team topology, operational maturity, characteristic outliers and cost ceiling. Style is chosen per architecture quantum, so the steady parts of a system need not pay for the volatile ones. Encore keeps a modular monolith for the steady majority and extracts only the on-sale quantum, accepting one network boundary to scale it alone.

**Exercise 2.4.** Write Encore's style ADR (Figure 2.3) in the Chapter 1 format. The consequences row must name at least two real losses.

<h3 id="25-styles-are-bets--hedge-them">2.5 Hedging Style Decisions</h3>

Every style is a bet about which changes will come, and a prudent architect hedges. Keep domain boundaries clean *inside* whatever you build: a modular monolith splits along its module boundaries far more cheaply than a tangled one, though transactions that span modules still have to be unwound (Chapter 9). Automate the boundary checks so the option to split stays open. A clean boundary is an option bought in advance, cheap to hold and dear to buy at the moment you need it.

Re-run the decision when its inputs change: the team count doubles, an outlier characteristic appears, or the company makes an acquisition. The path from monolith to modular monolith to service-based and perhaps to microservices lets each step wait until a real pressure demands it and pays for it. John Gall observed in *Systemantics* (1975) that a complex system that works has grown from a simple system that worked; the migration path turns that observation into a plan.

> **The résumé trap.** The most common style-selection error is optimizing for the architect's next job instead of the business's next year. If your justification cites companies a thousand times your size, you are imitating companies whose problems you do not have.

**Recap.** Hedge the style decision three ways: keep domain boundaries clean inside whatever you build, automate the checks that guard them, and re-run the decision when its inputs change. Take each migration step only when a measured pressure demands it, and justify a style with your own drivers.

**Exercise 2.5.** For the ADR you wrote in Exercise 2.4, list three events that would force Encore to re-run the style decision (for example, the team count doubling). For each, name the metric or signal that would tell you it has happened, and the style change it would most likely trigger.

### Kata: Style Selection — Three Briefs

The three briefs have three different correct answers, which is the point of setting them side by side. For each, deliver its driving characteristics (no more than seven), the chosen style per quantum, a diagram at the level of Figure 2.3, and one ADR.

> **Kata A: "Ledgerline."** Business-to-business (B2B) invoicing software as a service (SaaS). 40,000 small-business customers, steady daytime load, five-person team, revenue depends on being *boringly* reliable. Finance-grade consistency. The CTO's phrase: "we sell trust, not fireworks."

> **Kata B: "Pulse."** Live audience-reaction app for TV shows. Zero traffic 20 hours a day; 2 million concurrent users for 90 seconds when a host says "vote now." A team of 12 engineers. Losing 2% of votes is acceptable; being slow is fatal.

> **Kata C: "Argus."** Analytics product ingesting retail sensor feeds continuously; customers run heavy ad-hoc queries each morning. Data volume grows 10× yearly; the ingest must never pause. Three teams, 20 engineers in all.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Arbitration | Did the characteristics decide, and not the ratings table alone? |
| Quantum thinking | Were outliers extracted rather than the whole system upgraded? |
| Economics | Does the operations bill fit the team that pays it? |
| The stress test | Halfway through, each brief doubles its team and adds one characteristic: Ledgerline must keep EU customers' data in the EU, Pulse must prove every counted vote was cast by a real viewer, and Argus's biggest customer demands queries over data less than a minute old. Does your style survive, or did it assume nothing would change? |

#### Where you now stand

You can name the styles, price them, and choose one per quantum with the characteristics as arbiter. You cannot yet draw the *internal* boundaries that make any of them work: where one module ends, the next begins, and why the line falls there. That is a question about the business itself, and its discipline, domain-driven design, is the subject of Chapter 3.

### References

- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/). O'Reilly, 2025.
- Neal Ford, Rebecca Parsons, Patrick Kua, Pramod Sadalage — [*Building Evolutionary Architectures*, 2nd ed.](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/). O'Reilly, 2022.
- Mark Richards — [*Software Architecture Patterns*, 2nd ed.](https://www.oreilly.com/library/view/software-architecture-patterns/9781098134280/). O'Reilly, 2022.
- Len Bass, Paul Clements, Rick Kazman — [*Software Architecture in Practice*, 4th ed.](https://www.informit.com/store/software-architecture-in-practice-9780136886099). Addison-Wesley, 2021.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Martin Fowler — [*Patterns of Enterprise Application Architecture*](https://www.informit.com/store/patterns-of-enterprise-application-architecture-9780321127426). Addison-Wesley, 2002.
- Amazon Web Services — [*Reducing the Scope of Impact with Cell-Based Architecture*](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html). AWS Well-Architected whitepaper, 2023 — free online.

---
## Chapter 3: Domain-Driven Design and System Decomposition {#ch3}

> Boundaries drawn from the org chart last a reorg; boundaries drawn from the domain last a decade.


Chapter 2 ended with a promise: styles need boundaries, and boundaries need a source. The most reliable source is the business domain, because it changes more slowly than either the technology we build on or the organization that does the building. Domain-driven design (DDD), the discipline Eric Evans set out in 2003, is often mistaken for a catalog of code patterns. At heart it is a discipline of listening for the places where words change meaning (one department's "order" is another's "shipment request") and drawing boundaries there, instead of along the lines the database diagram suggests.

The idea is older than DDD. In *Notes on the Synthesis of Form* (1964), Christopher Alexander argued that a hard design problem becomes tractable only when we find the clusters of requirements that interact richly within and sparsely between, clusters the problem already contains and that we must discover instead of impose. DDD applies that argument to software, with the business's own language as the instrument of discovery.

Chapter 1 decomposed Encore by intuition; this time we use a method. Then we take the more common case: an inherited system, tangled and profitable, that we must reshape while it keeps running. Most writing about architecture imagines that systems are born; most architecture work is done on systems that were inherited.

### 3.1 Strategic Design

#### Core, supporting, and generic subdomains {#not-all-of-your-system-deserves-your-best-people}

The first strategic act is a humbling one: admitting that your domain is not uniformly interesting. DDD sorts it into three kinds of subdomain, and the sorting tells you where to invest:

| Subdomain kind | Definition | Encore | Investment posture |
|---|---|---|---|
| **Core** | Where you beat competitors; changes constantly | Fair, bot-resistant on-sale admission; real-time seat inventory | Best engineers, custom-built, evolve aggressively |
| **Supporting** | Necessary, specific to you, not differentiating | Event catalog, organizer dashboards | Build simply; keep adequate |
| **Generic** | Everyone needs it; solved industry-wide | Payments, email/wallet delivery, auth | Buy or adopt; innovate here only if it becomes your differentiator |

*Figure 3.1 — Subdomain classification as capital allocation. The classic failure is inverted investment: a brilliant in-house auth system beside an on-sale flow that falls over, which is gold-plated plumbing in a house whose roof leaks.*

A city planner would recognize the exercise. A city zones its land because each district deserves a different kind of attention: the civic center gets the architects and the stone, the warehouse district gets sound roofs and good roads, and the water comes from a utility that already runs it well. The analogy holds as long as we remember that cities rezone slowly and businesses do not. What is core today may be generic in five years, once a vendor sells it, so expect to redraw the map.

The classification is relative to the business: payments are generic for Encore and core for a payment provider. Some subdomains sit on the border, and auth is one. Encore buys it, but identity feeds bot resistance, so the sign-up and risk signals around it get closer review than the rest of the generic column. Border cases earn their keep by forcing us to say exactly which part of a subdomain differentiates us.

#### Bounded contexts {#bounded-contexts-where-words-change-meaning}

Listen to Encore's people say "ticket." To Sales it is inventory with a price; to the fan's phone, a QR code with an entry right; to Support, a case number about a refund. Build one Ticket model to serve all three and you get a familiar monster: 40 fields, half of them nullable, whose meaning depends on who is asking.

We have built that monster before, at enterprise scale. Many service-oriented architecture (SOA) programs of the early 2000s began with a *canonical data model*, one company-wide definition of Customer or Order, and spent years in committee trying to make one word mean one thing everywhere. The lesson they paid for is where DDD begins: a model is useful because it is partial.

A **bounded context** is a boundary inside which each word has exactly one meaning and one model. In the Ticketing context, "ticket" means entry right; in Support, it means case. Evans called the shared vocabulary inside such a boundary the *ubiquitous language*, a promise that a word means the same thing in conversation, in documents and in code. Contexts give the modules of Chapter 2's modular monolith, and any services later extracted from them, their *semantic* justification. You find a boundary where two colleagues use one word and mean two things. A bounded context is, quite simply, the place where a word stops traveling.

#### Context mapping {#context-mapping-the-politics-between-boundaries}

Contexts must still talk to one another, and how they relate is an architectural decision with names:

{% include diagrams/fig-3-2.svg %}

*Figure 3.2 — Encore's context map. The anticorruption layer (ACL) around Payments matters most: the payment provider's model of the world stops there and is translated into Encore's terms, so moving to a new payment service provider (PSP) touches one translator in Orders & Payments and nothing else. On-Sale Admission is the Sale Gate of Chapters 1–2; Bot Screening, Notifications, and Sales Analytics are omitted for readability.*

Four relationships cover most cases. A **partnership** ties two contexts' success together; it is expensive in coordination, so we keep it for links between core contexts. In a **customer–supplier** relationship, the downstream context's needs shape the upstream's roadmap. An **open-host service** publishes one stable protocol for every consumer, as Seat Inventory & Ticketing does with its ticket events. An **anticorruption layer** translates a vendor's or legacy system's model so that it stays at the border instead of colonizing yours.

The ACL is the pattern you will reuse most; expect to build one in nearly every year of your career. Notice that all four patterns name relationships between *teams*, which is why the heading speaks of politics. Encore's nine engineers are still one team, so for now the map records intent. The labels become binding on the day the team splits.

Context maps are discovered in workshops, not designed at desks. **EventStorming**, Alberto Brandolini's format, works well: business people and engineers stand at a long wall, placing orange stickies for domain events (`SeatReserved`, `PaymentFailed`, `TicketIssued`) in time order until clusters and shifts in language show where the boundaries lie. One afternoon surfaces what requirement documents hide for months. Domain Storytelling, where people narrate concrete scenarios as pictographic stories, suits rooms that find a timeline too abstract.

Beforehand, large language models (LLMs) can scan support tickets, docs, and code to flag words used in two senses and draft a first event timeline. Treat that as a hypothesis. Only the domain experts at the wall know which sense of "ticket" the business actually depends on.

**Recap.** Classifying subdomains tells us where to spend our best people and where to buy. A bounded context is a boundary of language, with one meaning and one model per word, found by listening for the moment a word changes sense. A context map names how contexts relate, and the ACL keeps foreign models at the border.

**Exercise 3.1.** Find a word at your company that means different things to two departments. Sketch the two models it implies. Where does the boundary fall?

### 3.2 Tactical Design for Architects

#### Aggregates as consistency boundaries {#aggregates-consistency-has-a-size}

Within a context, the tactical concept architects need most is the **aggregate**: a cluster of objects that changes as a unit to guard an invariant that must *never* be violated, even for a millisecond. Everything about an aggregate follows from its invariant; without one, it is only a convenient grouping.

Encore's most important invariant is that *a seat is never sold twice*. Guarding it requires one event's seats to change together as they are reserved, released, and sold. So the aggregate is **EventSeating** for a single event: one transactional boundary, one lock scope, one source of truth for whether seat 14B is free.

That size is a choice, and choices have prices. "Never sold twice" on its own needs only a per-seat guard. Encore draws the boundary around the whole seat map because other rules span seats: no orphaned single seats between bookings, and a per-fan ticket limit per event. The price is contention. A stadium-sized on-sale funnels every seat write through one lock scope, and the Sale Gate's metering absorbs only part of it. Teams that hit this limit partition the aggregate by section and accept that cross-section rules become after-the-fact checks.

A civil engineer would see the aggregate as the segment of a bridge deck between two expansion joints: rigid within, free to move without cracking its neighbors. The segment length is set by what must stay rigid together. Lengthen it and the structure cracks under its own stresses, which in software we feel as lock contention; shorten it and the rigidity we needed is gone.

> **Aggregates are consistency boundaries, not object graphs.** The beginner's aggregate is everything reachable from Event (seating, orders, refunds, analytics), which makes a lock the size of the business. The architect's aggregate is the *smallest* cluster that guards the invariant. Everything else learns about changes afterward, through domain events.

An aggregate should be exactly as large as its invariant, and the work lies in being honest about which invariants are real.

Those changes travel as **domain events**, the second tactical concept architects need. When EventSeating sells a seat, it emits `SeatSold`. Ticketing issues the entry right, Notifications delivers it to the fan's wallet, and Analytics reacts later still. (The order commits in the same transaction as the seat, for reasons Section 3.3 explains.) Between aggregates, consistency is eventual, a bargain the business struck knowingly: Encore's finance team reconciles daily and never expected microsecond truth. Chapter 6 develops the idea in full.

#### When tactical design pays off {#the-honesty-clause}

Tactical DDD (aggregates, entities, value objects, domain services, ports and adapters) pays off only in complex domains. In Brooks's terms from Chapter 1, the patterns help tame essential complexity in a core domain, and in a simple one they *are* the accidental complexity. Encore's Notifications context sends emails; a transaction script and a queue serve it better than a domain model.

Applied everywhere, tactical patterns let supporting subdomains spend the budget the core needed, and they do it respectably, one well-made value object at a time. In my experience, the mark of a senior designer is knowing where to leave them out.

**Recap.** The aggregate is the smallest cluster that guards a real invariant, and so it sizes our transactions, our locks and, eventually, our service boundaries. Between aggregates, domain events carry the changes, under an eventual consistency the business has accepted. Tactical patterns belong in complex core domains.

**Exercise 3.2.** Name the strongest invariant in a system you know. What is the *smallest* aggregate that can guard it? What guards it today, and is that bigger?

### 3.3 Granularity — Forces That Split and Forces That Bind

Bounded contexts give candidate boundaries; granularity forces decide how far to split. **Disintegrators** push pieces apart and **integrators** pull them together, and architecture happens where the two collide. The table adapts *Software Architecture: The Hard Parts* (whose four integrators are database transactions, workflow, shared code, and data relationships); the rows on teams, deploy cadence, and the aggregate's lock are this book's.

| Disintegrators (split when...) | Integrators (merge when...) |
|---|---|
| pieces change at different rates | a workflow needs them in one transaction |
| one piece needs extreme scale (Sale Gate) | they chat constantly (latency on every call) |
| one piece must not take others down | they share data that cannot be teased apart |
| pieces need different security postures | the team is too small to operate more pieces |
| different teams own them | consistency demands one lock (the aggregate) |
| one piece deploys far more often | they share code that must change in lockstep |

*Figure 3.3 — The granularity tug-of-war: forces that justify a split against forces that resist it. Run every proposed split through both columns; a split justified only by fashion loses to any integrator.*

A real Encore argument shows the table at work. In a design review, someone proposes splitting Seat Inventory from Order "for cleanliness," which should give us pause, because cleanliness appears in neither column. The integrators object first. Reserving a seat and creating the order are two steps of one user action: a fan picks a seat and buys it in one breath. The components call each other constantly, so the split turns every reservation into a network call on Encore's hottest path, a cost Chapter 4 prices. The sale is also one business transaction: seat and order commit together or are carefully unwound, so the split would replace a local transaction with a saga.

Given their honest turn, the disintegrators have little to say. Nearly every sales feature Encore has shipped touched both pieces, so their rates of change match. Neither needs extra scale, because the Gate already meters admission upstream and both see the same smoothed flow. Separating them contains no failures: if one is down, the other has nothing useful to do. No disintegrator applies and three integrators do, so they stay together. The proposal is archived with its reasoning as a rejected architecture decision record (ADR), the habit Chapter 1 started.

Conway's law, from Chapter 1, decides whether a split that does go ahead survives. A boundary that needs two teams to ship one feature costs two backlogs, two sprint plans, and a negotiation every time, and within a year the organization removes that friction by erasing the boundary, whatever the diagrams say. Coordination cost behaves like water against a dam, finding every crack nobody owns. The org chart is a poor *source* of boundaries, but it always gets a vote on whether they last.

So we shape teams to the boundaries we want, using Conway's tendency in reverse; that later idea, the "inverse Conway maneuver," is Chapter 5's. Team topology belongs among the decomposition forces from the start.

**Recap.** Granularity is a balance of forces. Every split must name its disintegrator and hold up against the integrators. Team structure then decides whether it lasts.

**Exercise 3.3.** Take the most recently split (or proposed-split) service at your work. Which disintegrator justified it? Which integrators were ignored, and what did that cost?

### 3.4 Decomposing Existing Systems

#### The economics of decomposition {#first-the-economics}

Encore is fortunate: it is young. The system you are more likely to be handed is nine years old, profitable, and critical to the business. First decide whether to decompose it at all. Do it when the monolith measurably blocks the business: deploys collide weekly, one component's scaling needs starve the rest, teams sit idle in merge queues. Don't do it because the code is ugly (refactor it), because hiring slides say "microservices," or because the monolith is merely old. A system that has been profitable for nine years has survived nine years of the business changing its mind, and that is not a defect.

I have sat in more than one meeting where a rewrite was pitched as a migration; the giveaway is that nobody can state the coordination pain in minutes per week. A tangled monolith split that way becomes tangled services with a network in between: you keep every problem and add latency, partial failure, and an operations bill. Fred Brooks warned in *The Mythical Man-Month* (1975) of the second-system effect, the tendency of a designer's second system to be overloaded with every idea deferred from the first. The grand rewrite is that effect at the scale of an organization.

Between leaving it alone and extracting services sits the option that is right more often than either: modularize in place. Carve the monolith into Chapter 2's modular-monolith shape, enforce the module boundaries in the build (ArchUnit, Spring Modulith, and Packwerk are common tools), and extract services later along the boundaries that have held. A boundary that has survived a year of real change inside one process has earned the right to become a network boundary.

#### The strangler fig and its companion patterns

When decomposition is justified, the main pattern is the **strangler fig**: grow the new system around the old one, move traffic over one capability at a time, and let the old code fall out of use. Martin Fowler named it in 2004 after the strangler figs of the Queensland rainforest, which grow down around a host tree and stand on their own long after the host has gone.

{% include diagrams/fig-3-4.svg %}

*Figure 3.4 — The strangler fig: a routing facade sends each capability to the old system or the new. Any capability behind it can move without users noticing, and a routing rule reverses each move, so rollback is a config change.*

The image teaches the essential point: the host keeps carrying load while the replacement grows, and nothing is ever unsupported. It breaks in one place that matters. A real fig cannot hand a branch back to its host; our facade can, and every move is a rule we can revert. That reversibility turns a migration from a gamble into a sequence of small, recoverable steps.

Two companion patterns cover the risky middle. **Branch by abstraction** (an interface inside the monolith, with old and new implementations behind a toggle) works when you cannot intercept traffic at the edge. **Parallel run** (both implementations execute, results are compared, and the old one stays authoritative) fits when correctness matters more than speed. A new seat allocator, for instance, should run beside the old one for two weeks of real on-sales before anyone trusts it.

**Recap.** Decompose for measured business pain, never for looks, and consider modularizing in place first. A strangler fig with a routing facade makes migration incremental and, unlike its namesake, reversible; branch by abstraction and parallel run reduce the risk in between.

**Exercise 3.4.** For a monolith you know, name the first capability you would extract. Which disintegrator justifies it, and what would its routing rule look like?

<h3 id="35-the-database-is-the-hardest-part">3.5 Decomposing the Database</h3>

Splitting code is the easier half. The shared database is where migrations stall, because it is the part of the monolith that remembers every shortcut ever taken. It yields only to a sequence. First give each context its own *schema*, which sets ownership on paper. Next replace cross-context joins with API calls or replicated read models. Then move the data: **change data capture** (CDC) streams every write from the old store to the new one while reads migrate gradually.

Engineers who underpin an occupied building work the same way, replacing the foundation one section at a time so that every part of the load always rests on exactly one support. Throughout our migration, likewise, exactly one store is authoritative for each piece of data. Instead of application dual-writes, which drift unnoticed, flip write ownership in one reversible step, and keep the old store fed by CDC or an outbox (Chapter 6) running in reverse, so falling back loses nothing.

Expect unpleasant discoveries: reports that joined everything, consumers nobody declared, "temporary" direct-table access from 2019. Each is a dependency the database had been keeping quietly, and each must be untangled before the split can finish, which is why Section 3.3's "shared data" integrator deserves its full weight *before* you split.

**Recap.** The database splits last: by schema, then API, then CDC, with one authoritative store at every step and a write-ownership flip you can undo.

**Exercise 3.5.** For the capability you chose in Exercise 3.4, which tables does it share with the rest of the monolith, who else reads them, and which store would be authoritative on the day you flip writes?

### Kata: Harvest

> **Your brief: "Harvest."** A farm-to-restaurant marketplace, eight years old, one Rails monolith, 26 engineers in four teams. Farmers list weekly harvests; restaurants order by Thursday; routes are planned Friday; trucks roll Saturday 4 a.m. Deploys are frozen Wednesday–Saturday because *nobody is sure what touches routing*. The delivery-routing team wants to rewrite in place; the CTO wants "microservices like Uber"; the CFO wants neither to cost anything. Logistics is the differentiator; listings are commodity; payments are Stripe.

**Deliverables:**

1. **Subdomain classification** — core / supporting / generic, one sentence of investment posture each.
2. **Context map** — with named relationships; at least one ACL, justified.
3. **Granularity verdicts** — three proposed splits run through the Figure 3.3 force table; at least one *rejected*.
4. **Migration plan** — first extraction, strangler sequence, database strategy, and what "reversible" means at each step.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Language evidence | Are boundaries justified by shifts in meaning, not table names? |
| Investment sanity | Does core get the talent; does generic get bought? |
| Force honesty | Did any split survive that names no disintegrator? |
| Reversibility | At every migration step, what is the undo, and is it a routing rule or a rewrite? |

#### Where you now stand

You can now find boundaries the business will respect, size the pieces by the forces that act on them, and reshape a running system without stopping it. What we have allowed ourselves to ignore is what happens *between* the pieces once a network separates them: latency, partial failure, and the loss of the single transaction. Chapter 4 takes up that physics, and the engineering that copes with it.

### References

- Matthew Skelton, Manuel Pais — [*Team Topologies*, 2nd ed.](https://itrevolution.com/product/team-topologies-second-edition/). IT Revolution, 2025.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Vlad Khononov — [*Learning Domain-Driven Design*](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/). O'Reilly, 2021.
- Alberto Brandolini — [*Introducing EventStorming*](https://leanpub.com/introducing_eventstorming). Leanpub.
- Stefan Hofer, Henning Schwentner — [*Domain Storytelling*](https://domainstorytelling.org/). Addison-Wesley, 2021.
- Sam Newman — [*Monolith to Microservices*](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/). O'Reilly, 2019.
- Martin Fowler — [*StranglerFigApplication*](https://martinfowler.com/bliki/StranglerFigApplication.html). martinfowler.com — free online.
- Martin Fowler — [*Refactoring*, 2nd ed.](https://www.informit.com/store/refactoring-improving-the-design-of-existing-code-9780134757599). Addison-Wesley, 2018.
- Scott Wlaschin — [*Domain Modeling Made Functional*](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/). Pragmatic Bookshelf, 2018.
- Vaughn Vernon — [*Implementing Domain-Driven Design*](https://www.informit.com/store/implementing-domain-driven-design-9780133039894). Addison-Wesley, 2013.
- Michael Feathers — [*Working Effectively with Legacy Code*](https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055). Prentice Hall, 2004.
- Eric Evans — [*Domain-Driven Design: Tackling Complexity in the Heart of Software*](https://www.informit.com/store/domain-driven-design-tackling-complexity-in-the-heart-9780321125217). Addison-Wesley, 2003.

---

## Chapter 4: Distributed Systems Foundations for Architects {#ch4}

> Distribution is not an upgrade; it is a mortgage. This chapter is the amortization table.


Extracting Sale Gate in Chapter 2 and drawing context boundaries in Chapter 3 bought Encore teams that move on their own schedules and a front door that scales apart from the rooms behind it. The price was a network between components that once shared an address space, and with it a set of rules no framework repeals. Messages get lost, arrive twice, or arrive late. Clocks disagree. Half of a system can die while the other half carries on, perfectly cheerful. Leslie Lamport once defined a distributed system as one in which the failure of a computer you didn't even know existed can render your own computer unusable, and anyone who has carried a pager will recognize the joke as a specification.

The network brings a new species of complexity, best sorted with Brooks's distinction from Chapter 1. Some of it is essential. Encore must absorb a 500× spike within minutes, no single machine can do that, and so distribution belongs to the problem itself. Much of the rest is accidental, the residue of defaults nobody chose and of remote calls written as though they were local. Architects who cannot tell them apart build systems that work in demos and fail on Saturdays.

An architect need not implement consensus, but must predict behavior at 10× load with half the network gone, read vendors' consistency claims with informed skepticism, and design failure behavior in advance instead of discovering it. Encore's first real outage arrives in Section 4.4, and like most outages it is self-inflicted.

### 4.1 The Physics of Distribution

#### The eight fallacies of distributed computing {#the-eight-famous-lies}

The eight fallacies of distributed computing took shape at Sun Microsystems in the 1990s: Peter Deutsch is usually credited with the first seven around 1994, building on notes by Bill Joy and Tom Lyon, and James Gosling with the eighth a few years later. They are errors of convenience, assumptions our programming models invite.

The remote procedure call, in the classic form Andrew Birrell and Bruce Nelson gave it in 1984, made a call to another machine look like a local one, and a generation of middleware was built on that pleasant illusion. In 1994 Jim Waldo and colleagues at Sun argued in "A Note on Distributed Computing" that latency, partial failure and concurrency make a remote object a different kind of thing, and that hiding the difference only postpones the bill. A microservice invoked through a generated client that looks like an ordinary method is the same illusion in newer clothes.

So we read the fallacies as an invoice, each line a cost Encore pays whether or not it budgeted for it.:

| The lie | What it costs Encore |
|---|---|
| The network is reliable | Every Gate→Inventory call needs a deliberately chosen timeout and retry policy |
| Latency is zero | A seat-map render making 30 sequential cross-region calls spends its whole latency budget on the speed of light |
| Bandwidth is infinite | Shipping the full seating map on every update saturates the network during an on-sale |
| The network is secure | The subject of Chapter 10 |
| Topology doesn't change | Deploys, autoscaling, and failovers reshuffle addresses hourly |
| There is one administrator | The payment service provider's (PSP's) maintenance window is not on Encore's calendar |
| Transport cost is zero | Serialization and Transport Layer Security (TLS) handshakes are real CPU on the hot path |
| The network is homogeneous | A fan on stadium Wi-Fi is part of Encore's distributed system |

*Figure 4.1 — The eight fallacies, each priced in Encore's terms. The first two drive most of this chapter.*

#### Time, ordering, and idempotency {#time-ordering-and-the-duty-of-idempotency}

In one process, "before" and "after" are facts. Across machines they become claims that can conflict: clocks drift, messages race along different routes, and log timestamps from two servers cannot settle which event came first. Lamport's 1978 paper "Time, Clocks, and the Ordering of Events in a Distributed System" made the point precise. The only order we can trust across machines is the one carried by the messages themselves, which is to say causality, and the wall clock is at best a hint.

A large orchestra lives with a version of this problem: sound takes a perceptible moment to cross the stage, so players keeping time by ear would drift apart, and so everyone follows the conductor, whose beat travels by light. Software has its own conductors: sequence numbers, version counters, and single-writer ownership, in which exactly one component orders the changes to a piece of state. Chapter 3's aggregates, with one owner per invariant, already work this way. The analogy breaks where software is harsher: a conductor does not freeze mid-phrase and resume convinced the orchestra is still following, and Section 4.2 shows what we do when ours does.

Repetition must be designed for too. An operation is *idempotent* when applying it twice leaves the system in the same state as applying it once.

> **The duty of idempotency.** Any operation that crosses a network will eventually be retried, by your code, a proxy, or a double-clicking fan, so it must be safe to apply twice. "Charge card for order 123" double-charges on a retry; "charge order 123's single charge-intent" does not. Build idempotency into the first version, because retrofitting it means finding every caller that assumed it was there.

#### Tail latency {#tails-not-averages}

Averages comfort the people who compute them; users feel the tail. Jeffrey Dean and Luiz André Barroso named this "the tail at scale" in 2013, and its arithmetic is unforgiving: tails compound. A page that fans out to 10 services, each with a 1-in-100 chance of a 2-second stall, stalls on roughly one page load in 10. At Encore's on-sale rates, a 99th-percentile latency (p99) of 2 s means thousands of fans watching spinners in the minute that matters most. So we budget latency at p99, and we treat every fan-out as a multiplier on the tail.

Budgets need prices. A structural engineer knows the strength of steel without looking it up, and these orders of magnitude are the material properties of our trade:

| Operation (2026) | Order of magnitude |
|---|---|
| Function call, same process | ~10 ns |
| Local solid-state drive (SSD) read | ~100 µs |
| Round trip, same availability zone (AZ) | 0.1–1 ms |
| Round trip, cross-region, same continent | 10–50 ms |
| Round trip, intercontinental | 70–250 ms |
| Object-store read (first byte) | 20–100 ms |
| Large language model (LLM) inference — first token / each token | 200–2,000 ms / 10–50 ms |

Hence Encore's rule: a seat-map render may spend a few same-AZ round trips, never a cross-region one, and never waits on a model. An arrow costs nothing to draw; this table is what it costs to run.

**Recap.** The network breaks eight common assumptions, and Encore pays for each with timeouts, retries, and restraint in what it sends. Order across machines must be designed, and every retryable operation is idempotent from the first version. Latency is budgeted at p99, where fan-out quietly multiplies it.

**Exercise 4.1.** Find one non-idempotent network operation in a system you know (a payment, an email, a counter). Describe how it fires twice and the smallest fix.

### 4.2 State — Replication, Partitioning, Consistency

#### Replication and partitioning {#copies-and-slices}

State is the part of a system that resists distribution, and it scales along only two axes. **Replication** makes copies, to survive machine death and to serve hot reads. Encore's catalog is the textbook case: written weekly, read millions of times an hour on tour-announcement day.

**Partitioning (sharding)** makes slices. When writes outgrow one machine, data splits by a key that should spread load evenly and keep each request on one shard. A city library does both: it places a copy of the season's popular novel in every branch, and it sends the law collection to one building and the music scores to another. Keying seats by `event_id` puts each on-sale on one shard's fast path and concentrates its whole load there, like a whole town wanting the same book from the same branch on the same morning. Encore accepts that knowingly, because the Gate meters admission first (Section 4.3 has the numbers).

Replication's price is the gap between copies. The leader acknowledges a write, a follower answers the next read, and a fan who just bought a ticket finds "my tickets" empty. Nothing crashed; the follower has not caught up. The library analogy fails here, since a borrower can see that a copy is out on loan, while a stale replica answers with complete confidence.

#### Consistency models {#the-consistency-menu}

A *consistency model* is a contract between a data store and its clients about which values a read may return after a write. Vendors bury these contracts in appendices; we read them as a menu with prices:

<svg viewBox="0 0 640 110" style="max-width:640px;width:100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="consTitle consDesc">
  <title id="consTitle">The consistency spectrum</title>
  <desc id="consDesc">A horizontal gradient bar from stronger consistency (slower, coordination-hungry) to weaker (faster, available), with markers at: linearizable, causal, read-your-writes, eventual.</desc>
  <defs>
    <linearGradient id="cons" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d9482b"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="20" y="40" width="600" height="16" rx="8" fill="url(#cons)"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" fill="#b23a20" font-weight="bold">stronger — slower, coordination-hungry</text>
  <text x="620" y="26" font-family="sans-serif" font-size="13" fill="#0b7ecb" font-weight="bold" text-anchor="end">weaker — faster, available</text>
  <line x1="70" y1="56" x2="70" y2="72" stroke="#b23a20" stroke-width="2"/>
  <text x="70" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">linearizable</text>
  <line x1="260" y1="56" x2="260" y2="72" stroke="#b23a20" stroke-width="2"/>
  <text x="260" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">causal</text>
  <line x1="420" y1="56" x2="420" y2="72" stroke="#0b7ecb" stroke-width="2"/>
  <text x="420" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">read-your-writes</text>
  <line x1="570" y1="56" x2="570" y2="72" stroke="#0b7ecb" stroke-width="2"/>
  <text x="570" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">eventual</text>
</svg>

*Figure 4.2 — The consistency spectrum, from linearizable to eventual. Encore buys a different level for each invariant: seat allocation is linearizable, ticket lists are read-your-writes, and view counters are eventual.*

CAP (consistency, availability, partition tolerance) began as Eric Brewer's turn-of-the-millennium conjecture and was proven as a theorem by Seth Gilbert and Nancy Lynch in 2002. It says only that during a partition, each *operation* must either refuse to answer (keeping consistency) or answer with possibly stale data (keeping availability). That is a far narrower claim than the "pick two" slogan it travels under. PACELC (if partitioned, availability or consistency; else, latency or consistency), from Daniel Abadi, adds the everyday clause: even without a partition, stronger consistency usually costs latency.

At Encore, a seat sale chooses consistency and shows "high demand, retrying"; a catalog browse always chooses availability. A database serving both must let Encore choose *per operation*. Put that requirement on the first line of any storage evaluation: it disqualifies half the candidates before the demos start.

The strong end rests on consensus, where a majority of machines must agree; Lamport's Paxos is the classic protocol, and Raft (Diego Ongaro and John Ousterhout, 2014) the one designed to be understood. An architect needs three facts. Clusters have odd sizes, because a majority of four is no more tolerant of failure than a majority of three. A leader's failover pause is your write downtime. Quorums spanning regions pay an intercontinental round trip on *every write*. Spanner-style databases serve strongly consistent reads locally, but no product offers fast, globally consistent writes.

Leadership also expires. A leader that stalls (a garbage-collection pause, a virtual-machine migration, a network blip) can go on *believing* it leads after a successor is elected, and its late writes silently corrupt data. **Leases** give leadership an expiry that must be renewed. **Fencing tokens** stamp every write with the leader's term, and storage rejects terms older than the newest it has seen. Encore's seat shards write with fenced terms, so a stale leader's writes bounce. The internals can stay with the database authors; the architect carries one question into every review: *what stops yesterday's leader from writing today?*

**Recap.** Replicate for reads and survival; partition for writes, with keys that spread load and keep each flow on one shard. Consistency is bought per invariant and paid for in latency, so pin each invariant to a consistency level before evaluating storage. I have watched teams do it the other way round and let the vendor's marketing choose.

**Exercise 4.2.** List four data items in a system you know. Assign each the weakest consistency level the business tolerates, then name the level your current database delivers.

### 4.3 Scalable Service Architectures

#### A reference architecture for scale {#the-reference-shape}

Scalable request-serving systems have a recurring pattern, because they face recurring forces, and most converge on it:

{% include diagrams/fig-4-3.svg %}

*Figure 4.3 — The workhorse topology: clients, a load balancer, stateless instances, a distributed cache, a queue with its workers, and the primary store. Highlighted: stateless instances behind the balancer (any instance serves any request) and the queue (which turns spikes into schedules).*

**Statelessness** makes the left half elastic. Session state lives in the cache or a token, never in instance memory, so scaling means adding instances and losing one costs nothing.

**Caching** buys read scale at the price of staleness and invalidation. A morning newspaper is a cache, printed once and stale by afternoon, a bargain we accept for the news and never for a bank balance. Cache-aside with time-to-live (TTL) expiry covers most needs, provided you declare *per item* how stale is acceptable: minutes for Encore's catalog, never for seat availability. Encore caches the seat map's geometry but never which seats are free.

**The queue** matters most, and it is older than the web; mainframe transaction monitors were deferring work decades ago. A synchronous call needs the callee alive *now*; a queued message needs it alive *eventually*. With ticket issuance behind a queue, Encore's spike becomes a backlog that drains in minutes unnoticed, since fans already got "purchase confirmed" from the one step that had to be synchronous.

The kata will demand capacity arithmetic, so here it is for Encore. At the worst on-sale, 2,000 fans/sec want in. Each admitted fan drives ~3 seat-map reads and ~1 reservation attempt, so full admission would mean 6,000 reads/sec and 2,000 serialized writes/sec against Seat Inventory. One shard sustains ~10,000 reads/sec but only ~1,500 ordered reservations/sec, so *writes* size the system.

Seats are keyed by `event_id` (Section 4.2), so one on-sale lives on one shard, and more shards cannot raise its ceiling. The Gate admits at most ~1,200 fans/sec per event, keeping that shard below 80% of its write capacity. Extra shards (four, for headroom) serve *concurrent* on-sales. An event too big for one shard would split by section, losing its single ordered path. Three lines of multiplication move the design review from adjectives to numbers.

> **Queueing intuition.** Little's law (items in the system equal arrival rate times time in the system), proved by John Little in 1961, gives the work in flight. In a simple single-server model, waiting time grows roughly as 1/(1 − utilization). At 50% load the wait is about one service time; at 90%, about nine; as load approaches 100% it grows without bound, and above about 80% every burst turns into a long queue. On a motorway near capacity, one driver touches the brakes and a jam forms from nothing. That knee is why Section 4.4 makes load shedding mandatory: refusing work above it keeps the work below it flowing.

**Scatter/gather** fans a request out and assembles the answers, so it runs at the speed of the slowest shard (Section 4.1's tail math). Three Kubernetes-native patterns, catalogued by Brendan Burns, complete the vocabulary: a **sidecar** (per-instance helper for TLS or telemetry), an **ambassador** (local proxy for remote services), and an **adapter** (uniform interface over diverse services). Chapter 5 packages them as the "service mesh."

The reference shape assumes that clients ask. When the server must *tell* (live scores, queue positions, "your seat is gone"), the shape needs a push tier: gateway instances holding long-lived WebSocket or Server-Sent Events connections, fed by a pub/sub fan-out. Size it by open connections and messages per second instead of requests per second, and plan for reconnect storms. A stadium empties at once at the final whistle, and a million clients that drop together reconnect together.

**Recap.** A stateless tier, a cache, and a queue form the reference architecture; push-heavy systems add a connection tier. Staleness is declared item by item. Queues turn spikes into backlogs, so placing the async boundary is an architectural decision.

**Exercise 4.3.** Redraw Figure 4.3 for Encore's purchase flow. Mark exactly which arrow is the synchronous "moment of truth," and explain why everything else can queue.

### 4.4 Resilience Engineering

#### Anatomy of Encore's first outage {#anatomy-of-a-self-inflicted-outage}

Encore's first big on-sale after the extraction. The PSP slows from 200 ms to 8 s. Order threads pile up waiting and exhaust the pool. Health checks share that pool, so they fail too. The autoscaler, trying to help, adds instances, which open *more* connections to the struggling PSP. Client timeouts fire and *retry*, tripling the load. Payments still limp through, but Encore is down.

Read the chain again: no component failed. Each did what its defaults said, and each default was reasonable alone; it was their composition that brought the site down. A default is a decision someone else made for a situation they never imagined. Resilience engineering replaces those inherited decisions with deliberate ones and breaks the chain at every link:

| Link in the chain | The breaker |
|---|---|
| Waiting forever on a slow call | **Timeouts** — aggressive, budgeted end-to-end (the fan's 3 s budget gives ~800 ms to the PSP); a timed-out charge is *unknown*, so retry only with the same idempotency key and reconcile via the PSP's status API |
| Retries amplifying load | **Backoff + jitter**, retry *budgets* (retries never exceed ~10% of traffic), retries at one layer only (three layers retrying three times each is 27× load), idempotency prerequisite |
| Slowness spreading between dependencies | **Bulkheads** — separate pools per dependency; PSP's pool drains, seat-viewing's doesn't |
| Hammering a dying dependency | **Circuit breaker** — fail fast, probe gently, recover automatically |
| Load exceeding capacity | **Load shedding & backpressure** — reject early and cheaply, with a clear answer; that is the Gate's whole job |

*Figure 4.4 — Each link of the outage chain has a named countermeasure. None is exotic, and one missing countermeasure lets the cascade through.*

Several of these names come from older engineering. A ship's bulkheads divide the hull into watertight compartments so that one breach floods one section. The *Titanic* had them, but they did not rise high enough, and as the bow sank, water spilled over each into the next. A thread pool shared with health checks is that kind of bulkhead. The circuit breaker, a name Michael Nygard brought to software in *Release It!* (2007), improves on the household panel: it tests the line itself and closes again once the danger has passed.

{% include diagrams/fig-4-5.svg %}

*Figure 4.5 — The circuit breaker's three states: closed, open and half-open. An open breaker stops threads piling up behind a slow call and lets the dependency recover.*

Recovery has its own trap. When a dependency returns, every breaker closes, every queued retry fires, and every cache is cold, so the returning load can knock it down again. A system stuck in this loop after the trigger is gone is *metastable* (the term comes from Nathan Bronson and colleagues, 2021). Grid operators know it well: reconnecting a whole district after a blackout would start every refrigerator at once and trip the supply again, so they restore load in blocks. We break the loop the same way, by ramping traffic back gradually, warming caches before reopening, and letting half-open breakers admit only a trickle of probes.

**Recap.** Cascades come from components following their defaults. We break every link with timeouts, budgeted retries, bulkheads, breakers, and load shedding. A timed-out side effect is unknown until reconciled, and a recovering dependency comes back gradually.

**Exercise 4.4.** For your system's most important synchronous dependency, write down its timeout, its retry budget, whether it has a separate pool and a breaker, and what users see when it is down. Every blank is work for your next sprint.

### 4.5 Degradation and Chaos

**Graceful degradation** is failure behavior designed beforehand. When a hospital loses mains power, the generators carry the operating theaters while the cafeteria waits, because someone decided before the storm what matters most. Encore makes that kind of decision about its PSP. When the provider goes down, Encore keeps accepting orders, Seat Inventory holds the seats, and cards are charged once the provider recovers.

The costs are part of the design. Some cards decline after the fan saw a confirmation, seats sit held for people who may never pay, and bots reserve free holds. So Encore bounds the hold window, caps pending holds per verified fan, and releases unpaid seats through Chapter 5's saga compensation. Sales continue under "your card will be charged shortly," and the outage is soon forgotten, which is the highest compliment a degraded mode can receive.

**Chaos testing** turns all of this into Chapter 1's fitness functions. Netflix's Chaos Monkey made the practice famous in the early 2010s, but its spirit is as old as the fire drill, which proves the stairwells on a calm day. For Encore that means killing an instance, injecting 5 s of PSP latency in staging, and asserting that the breakers open and the queues drain. A resilience pattern you have never watched fire is a guess.

**Recap.** Degradation is designed in advance, and its costs (late declines, held seats, abuse) are bounded on purpose. Chaos experiments turn resilience from a claim into a tested property.

**Exercise 4.5.** Pick one dependency your product cannot work without. Write the degraded behavior users would see during a one-hour outage, what it costs the business, and the chaos experiment that would prove it works.

### Kata: Beacon

> **Your brief: "Beacon."** Live-score platform for a football league. 2 million concurrent fans on match days (35 million peak during cup finals), each expecting score updates within 2 s of the referee's whistle. Near-zero traffic between matches. A betting-partner API has a *hard* requirement: odds-relevant events (goals, red cards) must be delivered in order, with exactly-once effect, with p99 < 500 ms. Fifteen engineers. Cloud budget: "startup, not sovereign wealth fund."
>
> *Hint:* "exactly-once effect" means at-least-once delivery plus idempotent consumers; Section 6.3 treats it in full. The fan-facing tier is a push tier (Section 4.3).

**Deliverables:**

1. **Capacity model** — a table of reads/sec and writes/sec at match peak and final peak, the fan-out factor per score update, and the arithmetic that sizes the fan-facing tier.
2. **Topology** — a diagram like Figure 4.3, marking the synchronous moment(s) of truth, every queue, and every cache with its declared staleness.
3. **Consistency ledger** — for fan scores vs. betting events: consistency level, ordering strategy, idempotency mechanism.
4. **Failure-mode analysis** — for instance death, stats-provider stall, and region loss: the designed behavior and the chaos experiment that proves it.
5. **Two architecture decision records (ADRs)** — the load-shedding policy for final-day overload, and the betting-API delivery design.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Arithmetic | Does the capacity model survive multiplication, or is it guesswork with units? |
| Tail budgets | Are latency promises stated at p99 and budgeted per hop? |
| Two-speed design | Are fans (eventual, cheap) and bookmakers (ordered, exact) served by *different* machinery? |
| Failure authorship | Is behavior under failure designed and chaos-tested, or inherited from defaults? |
| Overload policy | Does the load-shedding ADR say which traffic is shed first on final day, and what those fans see? |

#### Where you now stand

You now have the network's false assumptions, the price list of consistency, the reference topology, and the resilience chain. What remains is running a *fleet* of such services, each modeled, contracted, deployed, observed, and owned by a team that answers the pager. That is the subject of Chapter 5.

### References

- Martin Kleppmann, Chris Riccomini — [*Designing Data-Intensive Applications*, 2nd ed.](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/). O'Reilly, 2025.
- Brendan Burns — [*Designing Distributed Systems*, 2nd ed.](https://www.oreilly.com/library/view/designing-distributed-systems/9781098156343/). O'Reilly, 2024.
- Unmesh Joshi — [*Patterns of Distributed Systems*](https://martinfowler.com/books/patterns-distributed.html). Addison-Wesley, 2023.
- Ian Gorton — [*Foundations of Scalable Systems*](https://www.oreilly.com/library/view/foundations-of-scalable/9781098106058/). O'Reilly, 2022.
- Roberto Vitillo — [*Understanding Distributed Systems*, 2nd ed.](https://leanpub.com/understanding-distributed-systems). Leanpub, 2022.
- Alex Petrov — [*Database Internals*](https://www.oreilly.com/library/view/database-internals/9781492040330/). O'Reilly, 2019.
- Nathan Bronson, Aleksey Charapko, Abutalib Aghayev, Timothy Zhu — [*Metastable Failures in Distributed Systems*](https://sigops.org/s/conferences/hotos/2021/papers/hotos21-s11-bronson.pdf). HotOS, 2021 — free online.
- Michael T. Nygard — [*Release It!*, 2nd ed.](https://pragprog.com/titles/mnee2/release-it-second-edition/). Pragmatic Bookshelf, 2018.
- Jeffrey Dean, Luiz André Barroso — [*The Tail at Scale*](https://research.google/pubs/the-tail-at-scale/). Communications of the ACM, 2013 — free online.
- Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy (eds.) — [*Site Reliability Engineering*, Chapter 22: "Addressing Cascading Failures"](https://sre.google/sre-book/addressing-cascading-failures/). O'Reilly, 2016 — free online.
- Eric Brewer — [*CAP Twelve Years Later: How the "Rules" Have Changed*](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/). IEEE Computer, 2012 — free online.
- Daniel Abadi — [*Consistency Tradeoffs in Modern Distributed Database System Design*](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf). IEEE Computer, 2012 — free online.

---

## Chapter 5: Microservices — Building, Operating, Succeeding {#ch5}

> Microservices are an organizational technology that happens to run on computers.


Encore has grown. Three years after Chapter 1, it has 70 engineers in nine teams, and the modular monolith that served nine people so well has become a machine for coordination: deploy trains, freeze windows, and teams waiting on teams. Fred Brooks saw the shape of this in *The Mythical Man-Month* (1975): the paths of communication within a group grow roughly as the square of its size, so adding people adds conversation faster than it adds work. Microservices exist to let many teams change one product *without asking each other's permission*, which is to say, to reduce the number of conversations a single change requires. Request volume and résumé fashion are weak reasons by comparison.

Every benefit is paid for in operational complexity (the first law, at fleet prices). Many teams pay full price for a distributed monolith: services so coupled they deploy in lockstep, with every cost and no benefit. We have been here before. The service-oriented architecture (SOA) of the 2000s, as Chapter 2 told, promised independent services and often delivered a middleware committee instead. Microservices relearn SOA's lessons with smaller pieces, and the first lesson is that independence must be designed; it cannot be declared.

### 5.1 Modeling and Communication

#### Designing for independent deployment {#independence-is-the-unit-of-correctness}

A microservice is an independently deployable unit of business capability. Independence is decided long before anything is deployed, when we model the services. Services cut along Chapter 3's bounded contexts can change alone because the business boundaries they follow are real. Services cut by entity ("User service," "Ticket service": Chapter 1's entity trap at fleet scale) or by layer send every business change on a tour through three repos and two teams' sprint planning.

A city of neighborhoods, each with its own shops and school, keeps daily life close to home; a city zoned by function, every bakery in one district and every house in another, puts everyone on the road each morning. Services cut by entity build the second city, and its traffic is network calls. Here the analogy breaks in our favor: streets are poured in concrete, while service boundaries can be redrawn, at a price.

Encore's cut reads like its context map: On-Sale Admission (the Sale Gate), Seat Inventory & Ticketing, Catalog, Orders & Payments, Support, Notifications, and Bot Screening. Sales Analytics stays an event consumer (Chapter 9) that no service calls. Chapter 1's eight components, remapped through Chapter 3's bounded contexts, become seven services, truer for three years of watching where the business actually bends.

Seven stream-aligned teams each own one service, one team runs the platform, and one builds the fan app. No service is shared between teams; a service with two owners has, in practice, none. Seat Inventory and Orders, which Chapter 3 kept in one deployable, now have separate teams, so their one-transaction guarantee moves into the saga in Section 5.2. An organizational decision has reappeared as a technical one.

**Information hiding**, Parnas's criterion from Chapter 1, completes the modeling rule. A service's database is the largest decision it hides, private the way a class's fields are private. Once two services share tables, they deploy together for good. Leaving a shared schema is the hardest part of a migration. Give every table exactly one writing service first, then bridge with views or change data capture (CDC) while the data moves (Chapter 9). In my experience most distributed monoliths are born in a shared database, long before anyone draws a service diagram.

#### The communication decision

Every link between services uses one of three modes, and because the choice is made again for every link, it pays to have a default:

| Mode | When it's right | Standing cost |
|---|---|---|
| Synchronous request/response | Caller cannot proceed without the answer (reserve seat) | Temporal coupling; availability multiplies (Chapter 4) |
| Asynchronous events | Others must *learn*, not approve (`SeatSold` → analytics, email) | Eventual consistency; visibility work |
| Orchestrated workflow | Multi-step process needing an accountable owner | The orchestrator to run and monitor |

*Figure 5.1 — Three communication modes, each with its use and its standing cost. Default to events for facts, synchronous calls for moments of truth and orchestration for named processes. Encore has very few moments of truth; Exercise 4.3 asked you to find the main one, seat reservation.*

Beneath the table lies a simpler distinction. A synchronous call asks, and the caller waits; an event tells, and the publisher moves on. Most of what Encore's services need from one another is of the second kind, and a fleet that asks when it could tell builds chains of waiting.

**Recap.** Services are bounded contexts made deployable, and their independence is won or lost at modeling time. Databases are private. The communication mode is chosen link by link, and most of Encore's links carry facts, which events serve best.

**Exercise 5.1.** Take two services (real or from Encore) and list every way a change in one forces a deploy of the other. Name each coupling: schema, timing, shared library. Which would you sever first?

### 5.2 Workflow, Transactions, and Contracts

#### Sagas {#the-saga-transactions-without-the-transaction}

Buying a ticket spans two services and an external provider. Seat Inventory & Ticketing reserves the seat and later issues the ticket; Orders & Payments charges the card through the payment service provider (PSP). No database transaction spans all three. The answer is the **saga**, which Hector Garcia-Molina and Kenneth Salem described in 1987 for long-lived transactions inside a single database, and which waited the better part of three decades for microservices to make it famous: a sequence of local transactions, each with a *compensating* action that runs if a later step fails.

A traveler booking a flight, a hotel and a car from three companies works the same way. If the car cannot be had, nobody turns back the clock; the traveler cancels the hotel and claims a refund on the flight, under each company's fees. Compensation is a business act, and the person who knows what a cancellation ought to cost is rarely the engineer writing the code.

{% include diagrams/fig-5-2.svg %}

*Figure 5.2 — An orchestrated saga compensating a declined card. Compensation cannot undo the decline, which has already happened; it is a forward action that restores business sense, so it is designed with the business rather than invented in code review.*

Steps before the *pivot* (the point of no return, here the successful charge) must be compensatable. Steps after it, like issuing the ticket, must be retriable until they succeed. The pivot is the saga's keystone: until it is set, the stones can be lifted away one by one, and once it is set, the only work left is to finish the arch. Every step and compensation must also be idempotent (Chapter 4), because the orchestrator will retry them.

Sagas also leak. A database transaction is *isolated*, its work hidden from others until it commits; a saga gives that up, since each local commit is visible at once. So other fans watch seat 14B sit "held" for a purchase that has already failed, until the compensation lands. Three techniques contain this, chosen per step; the seat map uses all three. A **semantic lock** is a pending status readers must honor, so the map shows "being purchased." **Commutative updates** are safe in any order, so interleaving cannot corrupt state. **Re-read-and-verify** has the final step re-check its assumptions, treating earlier reads as stale.

In orchestration, one accountable owner drives the steps, as a conductor does. In choreography, each service reacts to the previous one's event, like dancers on each other's cues: no bottleneck, but the dance as a whole is written down nowhere. Encore orchestrates money-touching flows with deadlines and dunning (the scheduled retries and reminders that chase a failed payment) and choreographs the propagation of facts. The orchestrator is usually a durable-execution engine (Temporal, AWS Step Functions and similar) that persists every step, so workflows survive crashes and redeploys. Chapter 6 covers both styles.

#### Service contracts {#contracts-the-boundaries-constitution}

Independent deployment ends the day service A's release breaks service B. A contract between services is closer to a treaty than to a function signature, an agreement between parties who cannot be made to move together. Schemas must be explicit and evolve by **expand–contract**: add optional fields freely; remove a field or change its meaning only after every consumer has migrated. Engineers widen a busy bridge the same way, demolishing nothing until the traffic has moved.

Consumers must be **tolerant readers** that ignore unknown fields, a descendant of Postel's robustness principle, whose price Chapter 7 weighs. With **consumer-driven contract tests**, each consumer publishes what it relies on and providers run those expectations in continuous integration (CI), so "did we break anyone?" becomes a test failure instead of a meeting.

A shared "common model" library couples every service that imports it. SOA's canonical data model (Chapter 3) showed that a model everyone shares, no one can change. Share primitives and protocols; keep domain models inside their services.

**Recap.** Sagas replace distributed transactions with compensations designed with the business. Encore orchestrates accountable processes and choreographs facts. Expand–contract schemas, tolerant readers and consumer contracts in CI keep services independently deployable.

**Exercise 5.2.** Design the saga for Encore's *refund*: payment reversal, seat re-listing if more than 48 h remain before showtime, and ticket invalidation. Which step is the point of no return? What compensates a failure after it?

### 5.3 Delivery — Build, Test, Observe

#### Making deployment routine {#deployment-as-a-non-event}

A healthy fleet deploys without drama; nobody talks about deployments anymore. Each service has its own pipeline from commit to production in under an hour, with no coordination, train or freeze.

**Progressive delivery** removes the remaining fear. A canary takes a few percent of traffic and widens step by step, and automated rollback fires when its error rate or latency diverges from the baseline. Like the bird miners once carried underground, it exists to fail first and small, though its traffic belongs to real fans, which is why the rollback is automatic. Feature flags **decouple deploy from release**, making shipping code and enabling behavior separate decisions for separate roles. Encore ships the new seat picker dark (deployed, flag off) on Tuesday, enables it for 5% on Thursday, and nobody works the weekend.

#### Testing a fleet of services {#testing-a-fleet-without-lying-to-yourself}

Mike Cohn's test pyramid still holds, at distributed prices. Unit tests stay cheap and plentiful. Service tests (one service, stubbed neighbors) carry most of the confidence. Contract tests (Section 5.2) guard every boundary. End-to-end tests across many services are slow, flaky and politically expensive, since each failure starts a debate about whose service is to blame; keep a handful of *journeys* (fan buys ticket) and push everything else down the pyramid.

Below the pyramid sits **testing in production**. Contract tests check the shape of messages but not their meaning, and no staging environment reproduces a Friday on-sale, so the canary, kept small, is the final integration check. Synthetic buyers run the real purchase path hourly against a hidden test event with sandbox payments. They never hold a real seat or skew a dashboard, and they catch failures staging never will.

#### From monitoring to observability

Monitoring answers known questions ("is CPU high?"). Observability answers new ones ("why have Dutch fans' payments been slow since 14:02?"). The word comes from control theory, where Rudolf Kálmán gave it a precise meaning around 1960: whether a system's internal state can be inferred from its outputs. A service is observable when an engineer can work out what it is doing, and why, from what it already emits, without shipping new code to ask. That rests on **structured, correlated logs**, **metrics** for cheap aggregates and alerting, and **traces**, which record a call's path through every service. Without traces, debugging a fleet is guesswork.

The architect builds all three into the service templates (Section 5.5), so that every new service inherits them. Trace context (the `traceparent` header from the World Wide Web Consortium, or W3C, carried by OpenTelemetry instrumentation) starts at the edge and travels through every hop, including queue message headers and saga steps. Any Encore engineer can then follow order #881 across seven services at 3 a.m. without waking anyone.

**Recap.** Each service has its own pipeline, and canaries with feature flags make deploys boring and reversible. Most confidence comes from service and contract tests, end-to-end tests cover a few journeys, and production testing is deliberate and isolated. Every service propagates trace context.

**Exercise 5.3.** How long does a merged commit in your system take to reach production, and how many people touch it? If it is more than an hour or more than one person, name the one constraint you would remove first.

### 5.4 Production Realities

Four concerns decide whether the fleet holds up in production. Each gets its own chapter later; what they share is the demand for uniformity.

**Resilience, aggregated.** Chapter 4's chain-breakers must now exist uniformly: a bulkhead missing in one service is a hole in everyone's hull. A **service mesh** moves timeouts, retries, mutual Transport Layer Security (mTLS) and telemetry into its proxies (per-pod sidecars or, increasingly, sidecar-less node proxies), so resilience becomes fleet policy instead of the diligence of nine teams. A city lays water mains instead of trusting each household to dig a safe well. But plumbing cannot fix a house's wiring: retries still belong in one layer, under a budget, and no mesh makes a non-idempotent call safe to retry. A mesh is heavy machinery, but at Encore's scale resilience by memo is worse.

**Security, previewed.** Every service boundary is an attack surface, and "internal" is not a trust level (Chapter 4's fallacies of distributed computing). Each service gets its own identity, mTLS on every connection and least-privilege credentials (Chapter 10).

**Scaling, per service.** The Sale Gate scales to 400 instances on Friday while Support idles on 2. Each service scales on its own, and the decisions become routine.

**UIs and backends-for-frontends.** The frontend must not undo the decomposition by having one screen call nine services. A **backend-for-frontend (BFF)**, owned by the frontend team, aggregates calls for one experience, such as the fan app or the organizer web (Chapter 8).

**Recap.** Fleet properties must be uniform: mesh-enforced resilience, an identity for every service, per-service scaling, and BFFs in front of the UI. They belong in infrastructure, where no team has to remember them.

**Exercise 5.4.** Pick two services in your organization. Do they handle timeouts, retries and TLS the same way? If not, their resilience depends on each team's diligence; sketch what moving it into infrastructure would take.

### 5.5 The Organization That Microservices Require

#### Conway's law as a design tool {#conways-law-is-a-design-tool}

Mel Conway made the observation in 1968: organizations produce designs that copy their own communication structures. Team boundaries and service boundaries are one drawing seen twice, and when they disagree, the org chart wins. Conway described a tendency; using it deliberately, shaping teams first to obtain the architecture we want, came much later as the "inverse Conway maneuver," named at ThoughtWorks and popularized by Skelton and Pais's *Team Topologies*. Encore's team map was drawn to match its service map, so Conway's force works for the architecture.

What works is what Skelton and Pais call **stream-aligned teams**, which build, run and carry the pager for their services; the pager is the shortest feedback loop an organization has. Around them, a **platform** (Chapters 11 and 15) turns shared burdens (pipelines, observability, mesh, golden-path templates) into paved roads, keeping each stream team's cognitive load manageable. Every concern the platform absorbs is room returned to the business problem.

**Governance without a review board.** Central approval boards recreate the coordination microservices exist to remove; a board that approves every service is a monolith rebuilt out of meetings. Encore uses paved roads and fitness functions instead. The golden-path template makes the right thing the easy thing, and automated checks (Chapter 1's governance, now fleet-wide) catch drift. A team may deviate if it pays for and owns the result. Encore's rule of thumb: you may leave the paved road whenever you are prepared to build your own.

#### Deciding whether to adopt microservices {#the-adoption-question-asked-out-loud}

> **Microservices are a prerequisite-gated purchase.** Ask four questions, in order. (1) Do you have a *team-coordination* problem, measured in waiting? (2) Are your domain boundaries stable enough to cut along (Chapter 3 done properly)? (3) Can you operate a fleet (observability, on-call, automated deploys) or fund a platform that can? (4) Can leadership accept team autonomy, including its mistakes? With four yeses, proceed incrementally, strangler-style. With any no, a modular monolith with enforced boundaries gives most of the benefit at a fraction of the cost and keeps the option open.

The order matters, as in medicine: first whether the ailment is present, then whether the anatomy is understood, and only then whether the hospital can operate. The fourth is most often answered too quickly: autonomy withdrawn after the first bad release leaves only its burdens. A modular monolith, chosen deliberately, is no defeat. It keeps the boundaries and defers the network until the organization can afford it.

**Recap.** Stream-aligned teams own their services from build to pager, and a platform absorbs the shared burden. Governance runs on paved roads and fitness functions instead of meetings. Adoption requires coordination pain, stable boundaries, operational capability and leadership's acceptance of autonomy; without all four, the modular monolith is the wiser purchase.

**Exercise 5.5.** Answer the four adoption questions for your organization in writing, with evidence. Which "yes" is really a "hope"?

### Kata: The Adoption Verdict

> **Your brief: "Grainhouse."** A 60-developer software group at a grocery chain: one twelve-year-old monolith (stores, warehouse, e-commerce, loyalty), a release train every three weeks, and six teams whose features queue behind each other. E-commerce loses money every release freeze. The CEO read an airline magazine and wants "microservices by Q3." The warehouse module is stable and well liked; loyalty changes weekly; the database is one schema with 700 tables and no owners.

**Deliverables:** (1) the four-question adoption verdict, with evidence from the brief; (2) if yes-with-conditions — the first two extractions, chosen by coordination pain and by how few tables and calls cross the boundary, with a strangler plan and a table-ownership plan for the tables they touch; (3) the communication design for the extracted pieces (Figure 5.1 discipline); (4) the *organizational* prerequisites: what Grainhouse must build or hire before service #1 ships; (5) one architecture decision record (ADR): "why we are not extracting the warehouse."

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Verdict honesty | Did evidence, not the CEO's magazine, decide? |
| Pain-first sequencing | Do extractions target measured waiting, not interesting code? |
| Prerequisite realism | Is the platform/on-call/contract tooling funded before the fleet grows? |
| Restraint | Is anything explicitly *left in the monolith*, with pride? |

#### Where you now stand

We can now cut services along real business boundaries, define their contracts, deliver and observe them, and organize teams so the structure holds. Since Section 5.1, though, one piece has been taken on trust: the events that let services learn facts without asking, the fleet's nervous system. Chapter 6 covers event-driven architecture and streaming.

### References

- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/). O'Reilly, 2021.
- Nicole Forsgren, Jez Humble, Gene Kim — [*Accelerate*](https://itrevolution.com/product/accelerate/). IT Revolution, 2018.
- Chris Richardson — [*Microservices Patterns*](https://www.manning.com/books/microservices-patterns). Manning, 2018.
- Jez Humble, David Farley — [*Continuous Delivery*](https://www.informit.com/store/continuous-delivery-reliable-software-releases-through-9780321601919). Addison-Wesley, 2010.
- Matthew Skelton, Manuel Pais — [*Team Topologies*, 2nd ed.](https://itrevolution.com/product/team-topologies-second-edition/). IT Revolution, 2025.
- Charity Majors, Liz Fong-Jones, George Miranda — [*Observability Engineering*](https://www.oreilly.com/library/view/observability-engineering/9781492076438/). O'Reilly, 2022.
- David L. Parnas — [*On the Criteria To Be Used in Decomposing Systems into Modules*](https://dl.acm.org/doi/10.1145/361598.361623). Communications of the ACM, 1972.
- Melvin E. Conway — [*How Do Committees Invent?*](https://www.melconway.com/Home/Committees_Paper.html). Datamation, 1968 — free online.
- Hector Garcia-Molina, Kenneth Salem — [*Sagas*](https://dl.acm.org/doi/10.1145/38713.38742). ACM SIGMOD, 1987.

---

## Chapter 6: Event-Driven Architecture and Streaming Systems {#ch6}

> A call asks permission; an event states a fact. Systems built on facts age better.


Every chapter so far has leaned on a quiet promise: that services can *learn* things without asking. Purchase facts reached analytics in Chapter 1's trade-off, `SeatSold` crossed bounded contexts in Chapter 3, and the same events drove Chapter 5's sagas. In event-driven architecture, software announces facts and whoever cares reacts. The style runs most of today's payment, fraud, and data-pipeline infrastructure, including the pipelines behind Chapter 12's AI systems.

Events also fail differently from calls. A slow call is visible. A badly designed event topology fails silently: effects applied twice, facts out of order, workflows nobody can trace. Replacing calls with events does not remove complexity; it moves it out of the call stack, where our tools can see it, into the space between services, where mostly they cannot. Event design therefore deserves the care of API design, because an event's consumers are strangers to its producer.

### 6.1 Event-Driven Fundamentals

#### Events, commands, and the direction of authority

A **command** asks a specific receiver to do something, and the receiver may refuse ("reserve seat 14B"). An **event** states that something *happened*: it is in the past tense, owned by its producer, and cannot be refused (`SeatSold`). The distinction sounds merely grammatical, but here grammar encodes authority. A command leaves the sender in charge of intent; an event leaves each *consumer* in charge of its own reaction.

The difference is that between a letter and a newspaper. A letter is addressed and awaits a reply; a newspaper is published to readers its editors never meet. The analogy breaks at one instructive point. A newspaper can quietly amend yesterday's story, but a published event cannot be recalled; a mistaken fact is answered only by a later fact that compensates for it, which is exactly the move Chapter 5's sagas make.

Seat Inventory doesn't know Notifications exists. When the organizer-payouts service ships next quarter, it subscribes to `SeatSold` without Seat Inventory changing a line. This is Parnas's criterion from Chapter 1 carried to the scale of a whole system: the producer hides not only its implementation but the very existence of its consumers. Every decoupling benefit of events comes from that ignorance, and so does the debugging pain of Section 6.4. A producer that knows nothing of its consumers can never be broken by them, and can never tell you what they did.

#### What goes inside an event {#what-rides-inside-the-event}

Payload is the most consequential small decision in the style, because it decides whether the decoupling we have just admired is real. Martin Fowler named the first two options, "event notification" and "event-carried state transfer"; delta events are a common third:

| Pattern | Payload | Buys you | Bills you |
|---|---|---|---|
| **Notification** | just "it happened" + ID | tiny, never stale | every consumer calls back → hidden sync coupling |
| **Event-carried state transfer** | the relevant facts | consumers self-sufficient, producer stays quiet | schema discipline; payload bloat temptation |
| **Delta** | what changed | compact streams | consumers must replay history to know state |

*Figure 6.1 — Three payload philosophies, with what each buys and what it bills. Default to event-carried state with a curated payload: only the fields consumers need. An event schema is an API, and Chapter 5's expand–contract rules apply unchanged.*

The notification pattern fails subtly. An event that says only "order 881 changed" looks perfectly decoupled on a diagram, yet every consumer must then call the producer to learn *what* changed, all at once, and during an on-sale that is when Seat Inventory can least afford it. The coupling was never removed, only hidden behind an asynchronous first step.

Two more rules make event design contract design. Events describe *the domain*, never the producer's implementation: `SeatSold`, never `SeatRowUpdated`. A row update leaks the shape of a table, precisely the kind of volatile decision Parnas would have us hide. And schemas evolve additively, with a schema registry enforcing compatibility in continuous integration (CI), so that no producer can break a stranger by accident.

**Recap.** A command requests and may be refused; an event declares a fact and leaves the reaction to its consumers. The payload decides how real that decoupling is, and event-carried state with curated fields is the default. Event schemas are APIs and evolve under expand–contract rules.

**Exercise 6.1.** Take one message in a system you know: is it a command dressed as an event (`SendEmailRequested`)? If so, who is *actually* in charge, and what event would describe what really happened?

### 6.2 Event Streams as State

#### The log: a database turned inside out

A queue forgets a consumed message. A **log**, the abstraction behind Kafka, keeps it: an append-only, ordered, replayable record in which each consumer holds its own cursor. Databases have long kept such logs internally to recover after a crash. Jay Kreps and Martin Kleppmann saw that the log, buried inside the database as an implementation detail, could be turned outward and shared by a whole system; they call it the database turned inside out. A new consumer can arrive years later and replay history, and analytics can reprocess old data with better logic. The stream becomes a record of the business as well as a transport.

How far back you can replay is a retention decision with a storage bill. Kafka keeps seven days by default; longer history means tiered or object storage, compacted topics for latest-state streams, or a lakehouse sink such as Iceberg tables. The queue–log line has also blurred: Pulsar and Kafka's newer share groups ("queues for Kafka") offer queue-style consumption on a log.

At the limit you reach **event sourcing**, where the events *are* the state. Encore's Seat Inventory stops storing "14B: sold" and stores the ledger (`Reserved(14B)`, `Expired(14B)`, `Sold(14B)`). It derives current state by replay, with snapshots for speed. A bank balance works the same way, as the sum of a journal, and Luca Pacioli described double-entry bookkeeping in 1494, some five centuries before software gave the ledger a pattern name.

The ledger lives in an **event store**, which a broker cannot replace: a broker fans facts out to readers, while an event store guards one aggregate's history against concurrent writers. The write model reads one aggregate's stream and appends with an expected-version check, so two concurrent buyers of 14B collide safely: the second append finds the stream has moved on, and fails. KurrentDB (formerly EventStoreDB) or a plain Postgres table does this, then publishes to the broker for everyone else.

For audited, disputed ticket sales, the ledger answers what a state table cannot: *when* did 14B sell, after how many failed holds, in what order during the rush? The cost is append-only thinking, upcasting old events as schemas evolve, and a separate path for current-state queries, which is the job of Command Query Responsibility Segregation (CQRS).

#### CQRS {#cqrs-two-models-one-truth}

CQRS splits the write model (aggregates guarding invariants, as in Chapter 3) from read models: projections built *from the events*, each shaped for one kind of question. Bertrand Meyer's command–query separation, from *Object-Oriented Software Construction* (1988), asked that a method either change state or answer a question, never both; Greg Young's CQRS lifts that discipline from the method to the model. Each side is then shaped for its own job.

{% include diagrams/fig-6-2.svg %}

*Figure 6.2 — CQRS fed by an event log: one write model appends, and read models are projected from the log. The log is the system of record; a projection with the wrong shape is rebuilt from the log with new code. The lag between write and projection is Chapter 4's replication lag in domain terms, so set a target for it and alert on it.*

Projections are disposable in a way few read schemas have ever been. A projection is only an opinion about the log, and a wrong opinion can be formed again from the same evidence.

> **Where CQRS pays.** Event sourcing with CQRS means two models, projection infrastructure, and replay tooling. Encore uses it for Seat Inventory, which is audit-critical, contended, and queried in many shapes, and *nowhere else*. Using it everywhere would repeat Chapter 3's mistake with tactical domain-driven design (DDD).

**The transactional outbox.** A service that updates its database and then publishes an event has a classic bug: it saves the change and crashes before the event goes out. Two systems cannot be updated atomically without a distributed transaction, so the outbox declines to try. The service writes the state change and the outgoing event (into an outbox table) in one local transaction, and a relay publishes from there at least once, so consumers must still be idempotent. When two actions cannot be made atomic, make one of them a durable record of the intention to perform the other.

**Change data capture (CDC)** reads the database's own log, so systems that have never heard of events can produce them. CDC is often the outbox relay itself. Raw table CDC emits row changes (`SeatRowUpdated` by another name), so curate its output into domain events before anyone subscribes, or the legacy schema becomes a public contract by accident.

> **The right to be forgotten vs. the ledger.** A fan demands erasure under the General Data Protection Regulation (GDPR) or a similar law, but the ledger's value is that it never forgets. Three design moves reconcile the two obligations.
>
> **Crypto-shredding** encrypts each person's fields with a per-subject key; erasure deletes the key and leaves unreadable ciphertext in an intact log. **Keeping personally identifiable information (PII) out of the payload** means events carry stable pseudonymous IDs while personal data lives in one mutable, erasable store. The ledger records forever that `fan-8812` bought seat 14B; who `fan-8812` *is* stays deletable. **Retention windows** suit streams that never needed permanent history.
>
> Encore combines the first two: the audit ledger survives disputes, and the person can still disappear. Erasure must reach every copy: CQRS projections, analytics tables, caches, backups, and training sets hold decrypted personal data. Projections rebuild without the subject; backups and datasets need their own expiry or the same per-subject key. Key management becomes critical infrastructure, since a lost key store is an accidental mass erasure.

**Recap.** A log keeps what a queue discards, so new consumers can replay history. Seat Inventory takes the idea to its end: its ledger, guarded by an event store, is the source of truth, and CQRS derives one disposable projection per question. The outbox commits the state change and the event in one local transaction; a relay (often CDC) publishes at least once.

**Exercise 6.2.** Name one entity in your world whose *history* answers questions its current state cannot. What would its event ledger contain?

### 6.3 Stream Processing

#### Partitions, ordering, and delivery guarantees {#partitions-ordering-and-the-delivery-truth}

At scale the log must partition, and **order is guaranteed within a partition only**, which makes the partition key a domain decision. Picture a multilane highway: cars in one lane cannot overtake one another, so their order holds, while the lanes together carry far more than one road could. Encore keys its streams by concert, using the `event_id` column from Section 4.2, where "event" has its ticketing sense of a show on sale rather than a message. Each on-sale is strictly ordered while thousands run in parallel. Consumer groups divide partitions among instances, giving horizontal scale with per-key order.

The highway also shows the price: a slow truck holds up its whole lane. Keying by concert limits each on-sale to one consumer, so Chapter 4's hot-shard trade-off applies to the stream too. The tour everyone wants gets one lane, however wide the road.

Between independent systems, *exactly-once delivery does not exist*; failures and retries make delivery at-least-once. This is the old two generals problem, not a gap better tools will close: a sender that hears no acknowledgment cannot know whether its message arrived, and must risk either loss or a duplicate. Well-built systems choose the duplicate and achieve an **exactly-once effect**: at-least-once delivery with idempotent consumers (Chapter 4's duty, now compulsory). Kafka transactions and Flink provide exactly-once semantics inside their own transactional boundary. That guarantee is real, and it ends the moment the pipeline calls an external payment service provider (PSP).

**Poison messages.** One record a consumer cannot process blocks every event behind it for that on-sale, so decide per stream. Most streams retry a few times, then park the record in a **dead-letter queue** (or a retry topic) and move on, giving up order for that key. Seat Inventory cannot skip a record, since a skipped `Sold` could sell a seat twice: it halts the partition and pages a human. **Consumer lag** is the core health signal; it shows a stuck partition before fans notice.

#### Time and state in stream processing {#time-and-state-in-motion}

Stream processors compute *while data flows*, so fraud scores arrive while they can still stop a purchase. Two problems make this hard.

**Time.** As Lamport showed (Chapter 4), a distributed system has no single "now" on which all its parts agree. In practice, event time and processing time diverge (stadium Wi-Fi, mobile retries). An astronomer corrects for old starlight exactly, because light travels at a known speed; a purchase delayed in a crowded stadium has no such constant, so windows need watermarks, which declare how long to wait for stragglers, and a policy for records that arrive later still. A watermark is a judgment rather than a measurement, and should be recorded as one.

**State.** A bot check such as "more than five purchases in 10 minutes" must remember, so stateful processors keep local, changelogged, partitioned state, rebuilt on failover and recomputed when the logic changes.

Because the log is replayable (Section 6.2), Encore can *reprocess*: run version 2 of its fraud logic over last month's on-sales and compare the verdicts with version 1 before switching.

**Recap.** The partition key sets the ordering scope, so we choose it from the domain. Exactly-once exists only as an effect: at-least-once delivery with idempotent consumers. Event-time windows need watermarks, stateful processors need rebuildable state, and a replayable log makes reprocessing routine.

**Exercise 6.3.** What is the natural partition key of your busiest data flow, and what ordering does the business actually require? Are the two compatible today?

### 6.4 Workflows and Process Automation

#### Workflow engines for long-running processes {#processes-with-names-deserve-engines}

Choreography's weakness shows the day someone asks *"where is order #881 stuck?"* If the workflow exists only as five services reacting to each other's events, the question has no owner and no screen. A murmuration of starlings turns beautifully with no one in charge, but we give an airport's landing sequence to air traffic control, which knows where every aircraft is and why it waits. Starlings never account for a lost bird; Encore's support team must account for a lost refund.

For long-running, accountable processes (refunds with approval steps, payouts with dunning, anything with humans and deadlines), Encore uses **process orchestration**: Chapter 5's saga orchestrator becomes a workflow engine, and the process is *modeled explicitly*, versioned, monitored, and able to wait 40 days without holding a thread.

These are Chapter 5's durable-execution engines, such as Temporal, Restate, Camunda, and AWS Step Functions. Code-first engines need deterministic workflow code so they can replay it, and the hard part of versioning is changing a process while thousands of instances are mid-flight. The process engines of 2000s service-oriented architecture often became central brains that absorbed the services' logic, and the microservices movement later summed up the lesson as "smart endpoints and dumb pipes," the phrase James Lewis and Martin Fowler popularized in 2014. A workflow engine should own a process's sequence and its waiting, and leave the business rules in the services it calls.

{% include diagrams/fig-6-3.svg %}

*Figure 6.3 — Encore's refund process as an explicit model. It shows what choreography hides: the human step with a service-level agreement (SLA), the ticket revoked before money moves, the retrying PSP call and its exit when retries run out, and the business rule at re-listing. The engine emits events at every transition, so the process is orchestrated inside and choreographed at the edges.*

Chapter 5's dividing line still holds: choreograph the propagation of facts, and orchestrate processes with names, owners, and deadlines. Two anti-patterns cross it. The *event chain monolith* is six services that must fire in exact sequence for anything to work: lockstep coupling that happens to be asynchronous. *Event spaghetti* means nobody can say what happens after `SeatSold` without grepping four repos. Both are cured by an explicit model for every named process and an event catalog with contracts in AsyncAPI, the OpenAPI equivalent for events. A process with a name in the business deserves a model in the code.

**Recap.** If nobody can answer "where is it stuck?", the workflow needs an explicit model in an engine that makes it visible, versioned, and able to wait for weeks, while the business rules stay in the services. Aim for orchestrated cores, event-driven edges, and a catalog that makes the topology knowable.

**Exercise 6.4.** Name one process at your work with a business name ("onboarding," "settlement") but no explicit model, only code reacting to code. What would its Figure 6.3 reveal?

<h3 id="65-flow--streams-as-products">6.5 Streams as Products</h3>

A stream can also be run as a **product**: discoverable, documented, schema-governed, and backed by a service-level objective (SLO), so teams *subscribe to* it the way they call an API. Encore's `ticket-sales.v2` stream has an owner, a contract, a lag SLO, and three consumers the producer has never met. When a data-science team builds demand forecasting in Chapter 12, it subscribes without meetings or export jobs. CloudEvents (for the envelope) and AsyncAPI (for the contract) keep such streams portable across brokers and clouds.

The idea's ancestor is the Unix pipe of Chapter 2, which let small programs be joined without negotiating with one another. A stream run as a product is that composability at the scale of an organization, with an owner and a contract added because the two ends now belong to different teams.

James Urquhart calls this world of subscribable, composable streams *flow*. Chapter 9's data mesh applies the idea to analytical data, and Chapter 15's platform serves streams the way it serves compute.

**Recap.** A stream with an owner, a contract, and an SLO is a product, and subscribing to it replaces coordination meetings. Data mesh (Chapter 9) and the platform (Chapter 15) build on it.

**Exercise 6.5.** If your most valuable internal data flowed as a product-grade stream tomorrow, which team would subscribe first, and what would they stop asking you for?

### Kata: The Event Backbone

> **Your brief: "Loop."** Food-delivery startup, 30 engineers. Orders move from placed to restaurant accepted, courier assigned, picked up, and delivered, or take one of five failure exits. Today it runs on synchronous calls and a nightly CSV to analytics; couriers' apps poll every 5 seconds, and the restaurant tablet misses updates. New asks: live order tracking, courier surge pricing (needs 10-minute demand windows), a refund process with human review, and a fraud team that wants to "see everything, later."

**Deliverables:**

1. **Event catalog** — the domain events, each with its payload philosophy (Figure 6.1), and schema-evolution rules.
2. **Topology** — brokers or logs, partition keys with ordering rationale, consumer groups, and where CQRS projections serve the tracking screens.
3. **Process model** — the refund workflow at Figure 6.3 grade: orchestration engine at the core, events at the edges.
4. **Delivery guarantees** — for courier assignment: the at-least-once story, the idempotency mechanism, and what the courier sees on a duplicate.
5. **One architecture decision record (ADR)** — the polling-to-push migration for courier apps, losses included.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Fact vs. command | Are events past-tense facts, or remote calls in disguise? |
| Ordering by design | Does every ordering guarantee trace to a partition key choice? |
| Exactly-once claims | Is exactly-once claimed anywhere delivery crosses a system boundary? |
| Named processes | Does everything with a business name have an explicit, ownable model? |
| Time windows | Do the 10-minute demand windows use event time, a declared watermark, and a late-data policy? |
| Push migration | Does the ADR say what courier apps lose by dropping polling, and how a missed push is recovered? |

#### Where you now stand

You can now design events as contracts, keep history in logs, process streams as they flow, and give named processes an engine that can account for them. The next chapter turns to the boundary where your system meets everyone else's: the API, which you publish, version, defend, and operate.

### References

- Adam Bellemare — [*Building Event-Driven Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-event-driven-microservices/9798341622180/). O'Reilly, 2025.
- Mark Richards, Neal Ford — [*Fundamentals of Software Architecture*, 2nd ed.](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/). O'Reilly, 2025.
- Bernd Rücker — [*Practical Process Automation*](https://www.oreilly.com/library/view/practical-process-automation/9781492061441/). O'Reilly, 2021.
- Gwen Shapira, Todd Palino, Rajini Sivaram, Krit Petty — [*Kafka: The Definitive Guide*, 2nd ed.](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/). O'Reilly, 2021.
- James Urquhart — [*Flow Architectures*](https://www.oreilly.com/library/view/flow-architectures/9781492075882/). O'Reilly, 2021.
- Tyler Akidau, Slava Chernyak, Reuven Lax — [*Streaming Systems*](https://www.oreilly.com/library/view/streaming-systems/9781491983867/). O'Reilly, 2018.
- Ben Stopford — [*Designing Event-Driven Systems*](https://www.confluent.io/resources/ebook/designing-event-driven-systems/). Confluent/O'Reilly, 2018 — free online.
- Martin Fowler — ["What do you mean by 'Event-Driven'?"](https://martinfowler.com/articles/201701-event-driven.html). martinfowler.com, 2017 — free online.
- Jay Kreps — ["The Log: What every software engineer should know about real-time data's unifying abstraction"](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying). LinkedIn Engineering, 2013 — free online.
- Gregor Hohpe, Bobby Woolf — [*Enterprise Integration Patterns*](https://www.enterpriseintegrationpatterns.com/). Addison-Wesley, 2003.

---

## Chapter 7: API Architecture — Contracts, Traffic, and Evolution {#ch7}

> An API is a promise made to strangers. Architecture is deciding which promises you can keep.


Encore is about to do something it cannot undo: publish an API. Venues want to embed ticket sales, resale partners want inventory feeds, and a festival wants checkout in its own app. Each request is reasonable, and each opens a door that will not easily close. Once the first partner ships against `api.encore.com`, Encore has consumers it cannot see, and breaking them ends in contracts and lawyers.

The internal boundaries of Chapters 5 and 6 connect teams who share a Slack workspace and can be reasoned with over lunch; a public API connects strangers across a trust boundary, for years. It is also the first platform most companies build, whether they notice or not.

The idea is old. Parnas's criterion from Chapter 1 hid each volatile decision behind an interface, and in the late 1980s Bertrand Meyer recast the interface as a *contract*, with obligations on both sides. What has changed is the audience: a class has callers fixable by the same team, while a public API has callers we will never meet, built against our promises on schedules we do not control. That is this chapter's essential complexity.

### 7.1 Designing APIs

#### Modeling APIs on the business domain {#model-the-business-not-the-database}

A beginner's API is the database with URLs (`GET /tables/orders?join=...`). It exports the most volatile thing we own, the shape of our tables, to the people least able to absorb its changes. An architect's API models what a consumer may meaningfully do: browse events, hold seats, purchase, refund. I call these the domain's *affordances*, borrowing the designer's word for what an object invites us to do with it: a door handle affords pulling, and `POST /holds` affords claiming a seat. The test: could a partner integrate without a diagram of your schema? Four decisions carry most of the weight.

**Resources and workflows.** Nouns become resources (`/events/{id}/seats`); multi-step processes become *workflow resources*. Encore's seat hold, a temporary claim with a five-minute time to live (TTL), is `POST /holds`, returning a hold resource with an expiry, instead of `?action=lock` on a seat. The difference only looks cosmetic. A hold that is a resource can be read, canceled, audited and authorized; a hold that is the side effect of a query parameter can merely be hoped about. Long-running operations return `202 Accepted` with a status resource to poll.

**Errors as contract.** Partners code against your failures more than your successes, because the happy path is written once and the failure paths are where their support tickets live. Error bodies use the problem-details format of Request for Comments (RFC) 9457 with stable machine-readable codes, and tell the caller *whose move it is*: fix the request, retry later, or give up.

**Idempotency keys.** Chapter 4's duty applies at the edge, across the least reliable network in the system. `POST /purchases` accepts an `Idempotency-Key`. A retry replays the stored outcome instead of charging twice; a reused key with a different payload gets an error. The header is still an Internet Engineering Task Force (IETF) draft, but no API that touches money ships without the pattern.

**Collections and push.** Lists page by opaque cursor, since offsets skip and repeat rows during an on-sale's inserts, and the server caps page size. Push consumers get webhooks with their own contract: signed payloads, at-least-once delivery with backoff, an event ID the receiver deduplicates on, and a replay endpoint for the partner who was down all weekend, because sooner or later one will be.

#### Choosing a protocol {#choosing-the-protocol-like-an-adult}

| | REST/HTTP+JSON | gRPC | GraphQL |
|---|---|---|---|
| Sweet spot | public APIs, broad reach | internal service-to-service, low latency | client-driven aggregation, many UIs |
| Typing | schema by discipline (OpenAPI) | strict, compiled | strict schema, flexible queries |
| Caching | HTTP-native, excellent | roll your own | harder: persisted queries (GET-cacheable) or normalized client caches |
| Client diversity | anyone with curl | generated stubs; browsers need gRPC-Web or Connect | needs tooling investment |
| Failure surface | familiar | deadline/cancel built in | one endpoint, complex authorization per field |

*Figure 7.1 — The protocol decision, made on characteristics. Encore uses REST for the public API (reach, cacheability), gRPC where internal services talk on the hot path, and GraphQL nowhere; Chapter 8 shows the scale at which a backend-for-frontend (BFF) layer would justify it.*

Encore's answer is unglamorous, and I count that in its favor: strangers arrive with every HTTP client ever written. Whatever the protocol, the OpenAPI document (or AsyncAPI, for Chapter 6's streams) is written, reviewed and linted before code, because it outlives every implementation. Railways replace their locomotives by the generation while the gauge between the rails stays; a contract is the gauge of an API. The analogy breaks in one instructive place: a railway that regauges a line owns every train on it, and we own none of our clients.

**Recap.** A good API models the domain's affordances: workflows such as a seat hold become resources, failures say whose move it is, and idempotency keys belong to the contract. The protocol follows the characteristics, and the contract comes before the code because it will outlive the code.

**Exercise 7.1.** Design the resources and verbs for Encore's seat-hold-to-purchase flow, including the card-declined (402) and hold-expired errors. Whose move is it after each?

### 7.2 Evolution and Compatibility

#### Breaking changes and versioning {#breaking-changes-are-a-tax-on-strangers}

Chapter 5's expand–contract discipline returns with higher stakes. Internal consumers redeploy weekly; the festival app ships through app-store review and may pin your API for a year.

In my experience, longer. I maintain MockK, an open-source mocking library used across a great many Kotlin and Android builds. Delete one convenience overload and the issue tracker fills with strangers' broken builds. Hyrum Wright, an engineer at Google, lent his name to the general lesson: with enough users, every observable behavior of an interface will be depended on by somebody, whatever the documentation promised. A public API is everything its consumers can observe, which is always more than we wrote down. Encore's public API follows four rules:

- **Additive forever.** New optional fields, endpoints and enum values (announced as open sets) cost consumers nothing.
- **Never repurpose.** Changing a field's meaning is worse than removing it: a removal fails loudly, a repurposed field corrupts data silently.
- **Tolerant readers on both sides.** Consumers ignore unknown fields; providers treat missing new fields as defaults.
- **Version as last resort.** A `v2` usually means expand–contract ran out of room, occasionally a real remodel of the domain. Stripe pins each client to a dated version and transforms responses on the server; some APIs put the version in a header or media type. Encore uses the URL (`/v2/`) because partners can see, route and log it. Both stay live while Encore measures the migration funnel, then `v1` retires with dates in writing: `Deprecation` (RFC 9745) and `Sunset` (RFC 8594) headers, a dashboard of lagging partners, and a person on the phone for the last three.

The third rule descends from Jon Postel's robustness principle in the early Internet protocol specifications: be conservative in what you send and liberal in what you accept. Protocol designers have since learned its price, for a receiver that accepts anything teaches senders that anything is acceptable, and yesterday's tolerance hardens into tomorrow's obligation. So our tolerance is narrow: ignore the unrecognized, default the missing, refuse the malformed.

Roy Fielding's 2000 dissertation, which defined REST, made links central to the style; much of the industry kept his URLs and quietly dropped the links. Links in responses (`"cancel": {"href": ...}`) let the server move a workflow without breaking clients that follow links instead of hardcoding paths, and Encore uses them where workflows are likeliest to change.

**Contract tests at the border.** The provider's continuous integration (CI) pipeline replays the expectations of every registered consumer, including the few external partners who publish their usage (Chapter 5's machinery). For the rest, OpenAPI breaking-change diffing (such as oasdiff) and replay of sampled partner traffic stand in. A change that would break the resale partner fails the build on Tuesday instead of causing an outage on Friday.

**Recap.** Evolving an API among strangers means keeping old promises while making new ones. Changes are additive, and a field's meaning never changes. A `v2` is a last resort with a migration funnel and a sunset date, and contract tests turn breakage into a failing build before it becomes a partner's outage.

**Exercise 7.2.** Regulation requires Encore to split `price` into `base_price` and `fees`. Design a migration that breaks no one: field strategy, timeline, and what the last unmigrated partner sees at sunset.

### 7.3 API Traffic Management

#### The API gateway {#the-gateway-earns-its-place-at-the-edge}

Public traffic enters through an **API gateway**, which takes cross-cutting concerns: authentication, rate limiting, quotas, caching, request shaping and canary routing. Anything that knows what a seat is belongs in a service.

A medieval town's gatekeeper checked who entered and collected the toll; he did not tell the bakers how to bake. A gateway should know who is calling and how often, never what they are buying. The analogy fails at the walls: a modern system has a gate but no wall worth trusting, so every service inside still checks credentials, as Section 7.4 insists.

> **The new-ESB trap.** Every gateway product will happily host rules that transform payloads, orchestrate calls and collect business logic. Then you have rebuilt the enterprise service bus (ESB), and product changes mean redeploying middleware. If a gateway config change needs a domain expert's review, logic has leaked.

Chapter 2 told how SOA's buses went this way. The gateway is the same temptation with a friendlier configuration language, and the old lesson holds: keep the intelligence in the endpoints and the pipes ordinary.

The gateway handles north–south traffic across the edge; east–west traffic between services belongs to Chapter 5's mesh. The mechanics are similar but the trust differs, and merging them couples the partner-facing surface to Encore's internal topology.

{% include diagrams/fig-7-2.svg %}

*Figure 7.2 — Edge vs. interior. The gateway alone handles north–south traffic: authentication, quotas, rate limits and canaries for outside callers. The mesh around every service handles east–west traffic: mutual TLS (mTLS), retries and telemetry. The mechanics are similar; the trust is not.*

**Rate limiting as fairness engineering.** A bridge's posted load limit is part of its engineering: chosen, published and enforced, so that no driver learns the capacity by experiment. Each partner gets a contractual quota and a burst allowance (a token bucket). During on-sales Encore adds *event-scoped* limits, so one partner's polling cannot starve another's checkout. Limits are documented, returned in `RateLimit` and `RateLimit-Policy` headers (per the IETF draft), and enforced with `429` and `Retry-After`: a predictable rejection beats unexplained slowness.

**Releases at the edge.** The gateway canaries by header, partner tier or percentage. Shadow traffic mirrors production requests to the next version and discards its responses. On a money API, mirror only reads or send shadowed writes to stubbed payment and inventory sinks: a mirrored purchase is a second charge and a second hold. Section 7.2's contract tests catch semantic breaks; shadows catch performance ones.

**Recap.** The gateway owns what every caller shares and leaves the domain to the services; the day it learns what a seat is, it starts becoming an ESB. The mesh owns the interior. Rate limits are published contracts, and canary and shadow traffic let us watch a release before strangers feel it.

**Exercise 7.3.** List everything your edge (gateway, load balancer, nginx) does, sorted into "cross-cutting" and "knows the domain." The second column is leaked logic.

### 7.4 API Security

#### Securing a public API {#the-internet-is-a-hostile-integration-partner}

Encore's API now fronts money and scarce inventory, the assets the Open Worldwide Application Security Project (OWASP) API Security Top 10 is about. The internet is a hostile integration partner, and it reads your documentation more carefully than your friends do. Saltzer and Schroeder's design principles, which Chapter 10 takes up, include *least privilege* and *complete mediation*, the checking of every access to every object. Three defenses that apply them belong in the architecture.

**OAuth 2.0 and OpenID Connect (OIDC), cast correctly.** Follow the OAuth Security Best Current Practice (RFC 9700, 2025), which OAuth 2.1 consolidates. Fans' apps use the authorization-code flow with Proof Key for Code Exchange (PKCE). Partners' servers use the client-credentials flow with scoped, short-lived tokens, authenticated by `private_key_jwt` or mutual TLS (RFC 8705) instead of shared secrets, and sender-constrained with Demonstrating Proof of Possession (DPoP, RFC 9449) where theft would be costly. Passwords in API calls and long-lived keys in mobile binaries are out. Scopes name affordances (`holds:write`, `events:read`), reusing Section 7.1's design vocabulary for authorization, so least privilege means granting the smallest set of affordances a caller needs.

**Tokens.** JSON Web Tokens (JWTs) are short-lived, audience-bound, algorithm-pinned and verified at the gateway. Encore, of all businesses, should recognize a plain bearer token: it is a paper concert ticket, admitting whoever holds it. DPoP turns it into a named ticket checked against identification at the door. The end user's claims travel downstream (a forwarded token, or RFC 8693 token exchange) alongside the mesh's workload identity. The mesh proves *which service* is calling; only the user's claims say *who* the request is for (defense in depth, previewing Chapter 10's zero trust). Opaque tokens with introspection fit where revocation latency matters more than validation cost.

**The Top 10 for ticketing.** Two entries hit ticketing hardest. The first is *broken object-level authorization*: `GET /orders/{id}` must check that the caller owns order `{id}`, on every object and every request. This is complete mediation at its most concrete, and the gateway cannot do it. Only the service that owns the object can say who owns it.

The second is *unrestricted access to sensitive business flows* (API6 in the 2023 list): for Encore, bots mass-creating seat holds to lock up inventory, each request well-formed and authenticated, and the whole of them an attack. That is why Bot Screening (Chapter 1) sits in front of this API. Its neighbor, *unrestricted resource consumption*, covers the polling floods that per-partner quotas absorb. All three become fitness functions, per-endpoint authorization tests in CI and abuse scenarios in the load suite.

**Recap.** API security applies two old principles with new machinery. Each audience gets its own OAuth flow, scopes grant the least set of affordances, and JWTs are short-lived, bound and pinned. Object-level checks belong to the service, which alone knows who owns what, and abuse resistance is load-tested.

**Exercise 7.4.** For `GET /holds/{id}`, list every caller class (fan, partner, support tool) and the object-level rule each must satisfy. Where in your design is each rule enforced?

### 7.5 Running an API Program

An API with users is a product with a roadmap, staffed as one or not. A product must be found, learned and trusted by people who owe it nothing, and Encore's program rests on three disciplines.

**Developer experience (DX)** is a conversion funnel with a target of under 10 minutes to first successful call: instant sandbox keys, copy-paste quickstarts, and docs generated from the OpenAPI contract so they cannot drift.

**Governance ships as linting.** Rules for naming, pagination and error shape run as Spectral-style checks in CI, so consistency comes from tooling instead of review meetings (Chapter 5's paved road, applied to contracts). The aim is a shared vocabulary instead of a master planner, so that many teams' endpoints compose into one surface a partner learns once.

**Lifecycle discipline** means every endpoint is born with an owner, a tier, a service-level objective (SLO) and a deprecation policy.

Encore's API portal, with self-service onboarding, golden-path contracts and guardrails in CI, is quietly its first platform product; Chapters 14 and 15 scale that pattern to the whole company. AI agents calling these APIs as tools (Chapter 12) inherit the same contracts, scopes and quotas as their permissions and budgets.

At a treasury-software company I led an API-first turn run as an internal startup. I wrote the first guidelines (89 rules, RFC-style, argued line by line), the linting behind them and a fair share of the early contracts, and spent as much time pitching as coding. Adoption came slowly, then culturally: after more than 1,000 pull requests and about 200 contracts, the company built contract-first by default. Review comments and lunch conversations did more than the style guide, because a rule becomes a habit only when someone explains why it exists.

**Recap.** An API program is a product discipline. DX is counted in minutes to first call, governance ships as lint rules that give many teams one vocabulary, and every endpoint is born with an owner, an SLO and a deprecation policy. The API portal is Encore's first platform product.

**Exercise 7.5.** Time a colleague, or yourself, from zero to first successful call against your team's API. Name the friction behind every minute past 10.

### Kata: The Public API

> **Your brief: "Atlas."** A freight-visibility company whose shippers embed its tracking. Assets: container positions (updated roughly hourly), customs status (event-driven, from Chapter 6-style streams), and estimated-time-of-arrival (ETA) predictions (ML, revised continuously; a v2 model with a different confidence-interval shape ships in six months). Consumers: five enterprise shippers with service-level agreements (SLAs) and SOC 2 questionnaires, about 200 self-service mid-market integrators, and one giant retailer that "will send 50× everyone else's traffic and negotiate like it." Regulatory note: a shipper may see customs status only for countries where it is the importer of record.

**Deliverables:**

1. **Contract** — OpenAPI sketch: resources for shipments, positions, customs events and ETAs; an error catalog with whose-move semantics; push design (webhooks or streams).
2. **Evolution policy** — additive rules, the ETA-model-v2 migration plan, sunset mechanics.
3. **Edge design** — a diagram like Figure 7.2; per-tier quotas, including the retailer; canary strategy.
4. **Security architecture** — flows per consumer class, scope model, and the object-level rule for per-country customs data with its enforcement point.
5. **Program sheet** — DX funnel targets, three lint rules you'd enforce from day one, and each endpoint's tier and SLO.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Affordance modeling | Could a shipper integrate without seeing your schema? |
| Stranger-proof evolution | Does the ETA v2 plan survive a consumer who ignores your emails for a year? |
| Fairness engineering | Does the retailer's 50× fit within designed limits, or only negotiated exceptions? |
| Enforcement placement | Is every authorization rule enforced where the knowledge lives? |
| Program as product | Could a mid-market integrator reach a first successful call in 10 minutes without talking to you? |

#### Where you now stand

You can now design contracts, evolve them without breaking strangers, and run the edge as infrastructure and product. Every response still ends on a browser or phone screen, which the book has not yet examined. The frontend has its own architecture (rendering economics, composition across teams, a security perimeter), and treating it as "just the view layer" undoes a well-decomposed backend on the first page. That is Chapter 8.

### References

- Mike Amundsen — [*RESTful Web API Patterns and Practices Cookbook*](https://www.oreilly.com/library/view/restful-web-api/9781098106737/). O'Reilly, 2022.
- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- JJ Geewax — [*API Design Patterns*](https://www.manning.com/books/api-design-patterns). Manning, 2021.
- James Higginbotham — [*Principles of Web API Design*](https://www.informit.com/store/principles-of-web-api-design-modernizing-apis-for-9780137355631). Addison-Wesley, 2021.
- Arnaud Lauret — [*The Design of Web APIs*, 2nd ed.](https://www.manning.com/books/the-design-of-web-apis). Manning.
- OWASP — [*API Security Top 10*](https://owasp.org/API-Security/editions/2023/en/0x11-t10/). OWASP Foundation, 2023 — free online.
- IETF — [RFC 9700: *Best Current Practice for OAuth 2.0 Security*](https://www.rfc-editor.org/rfc/rfc9700). 2025 — free online.
- IETF — [RFC 9457: *Problem Details for HTTP APIs*](https://www.rfc-editor.org/rfc/rfc9457). 2023 — free online.
- Brandur Leach — [*APIs as infrastructure: future-proofing Stripe with versioning*](https://stripe.com/blog/api-versioning). Stripe, 2017 — free online.

---
## Chapter 8: UI and Frontend Architecture {#ch8}

> Users never see your architecture. They see the pixels it earned them.


Encore now has extracted services, an event backbone and a hardened API, yet a fan on a phone in a stadium parking lot still waits four seconds for the seat map, and from where that fan sits none of our backend work has happened at all. Every characteristic Chapter 1 promised (elasticity, availability, speed) is finally experienced in a browser or an app. The frontend is an architectural domain in its own right, with its own rendering costs, composition models, state and security perimeter, and the habits we formed on the backend map onto it badly.

Our field has swung between thin and thick clients for half a century. Terminals displayed what a central machine sent them; client-server desktops took the logic home; the early web made the browser a thin terminal again; the single-page application made it thick once more; and today's frameworks are carrying rendering back to the server, a little sheepishly, under new names. Each swing answered the economics of its moment, and none was final. Frameworks change every few years, but the decisions underneath them last longer: where rendering happens, how frontend code scales with teams, where the frontend meets the backend, and what AI features do to the interface.

### 8.1 Rendering Architectures

#### Choosing a rendering strategy {#where-the-pixels-come-from-is-an-architecture-decision}

Every page's HTML must be assembled somewhere: on the client, on a server, or ahead of time, before anyone asks for it. The options run from client-side rendering (CSR), the model behind the single-page application (SPA), through server-side rendering (SSR) and static site generation (SSG) to incremental static regeneration (ISR) and its newer relatives. Figure 8.1 lists them with what each one costs ("SEO" is search-engine optimization).

| Strategy | HTML assembled | First paint | Freshness | Server cost | Fits |
|---|---|---|---|---|---|
| **CSR** (SPA) | in the browser | slow (bundle first) | live | tiny | logged-in tools, editors |
| **SSR** | per request | fast | live | per-request | personalized, SEO-critical pages |
| **SSG** | at build time | fastest | stale until rebuild | ~zero | marketing, docs |
| **ISR / SSG+revalidate** | build + timed or on-demand (tag) revalidation | fastest | seconds-to-minutes stale | tiny | catalogs, listings |
| **Streaming SSR / server components** | server renders and streams; client JS only for interactive parts | fast, progressive | live | per-request | app-like pages that still need fast first paint |
| **Islands / partial hydration** | server, JS only where needed | fast | mixed | small | content pages with pockets of app |
| **Edge SSR** | per request, near the user | fast globally | live | per-request | personalized + global |

*Figure 8.1 — The rendering menu, from client-side rendering to edge SSR, with what each strategy costs and where it fits. Rendering is chosen per page class, the way Chapter 4 chose consistency per invariant; no single row should cover a whole product. (ISR is Next.js's name for the idea; other frameworks ship it under other names.)*

A restaurant kitchen works the same way. Some dishes are prepared the night before, some are cooked to order, and no sensible kitchen does everything one way; which dish goes to which station depends on how often it changes and how much the guest cares that it is fresh.

Encore uses three rows. The **event catalog**, read by millions and changed weekly, is ISR, with the minutes of staleness Section 4.3 already accepted for it. The on-sale **seat map** combines public geometry, live availability and a personal selection, three kinds of data that age at very different rates, so it is CSR inside an SSR shell, fed by real-time updates (Section 8.4). **Checkout** is SSR with minimal JavaScript. Being personalized and irrelevant to search, it might have been CSR, but it is where the money moves: server-rendered forms ship less code to weak phones, fail in fewer ways and still submit if the bundle never loads. Near the money, the dull technology is the brave choice.

Every row sits on the content delivery network (CDN). Static acceleration is nearly free: the ISR catalog and every bundle are cached at the edge, near every fan. Rendering at the edge pays off only when its data is readable there too; an edge function that calls the origin per request has not removed the distance, only added a hop in front of it. Encore caches at the edge aggressively, computes there sparingly, and keeps authoritative seat state at the origin.

#### Core Web Vitals and performance budgets {#performance-is-a-characteristic-with-a-name}

Perceived speed was studied long before the web. Robert Miller's 1968 paper on response time in conversational computing asked how long a person will wait before the conversation with a machine breaks down; the machines have changed far more than the people. Core Web Vitals are Google's measures of loading speed, interactivity and visual stability: **LCP** (largest contentful paint, the moment the page's main content appears), **INP** (interaction to next paint, which replaced first input delay in 2024) and **CLS** (cumulative layout shift). Google rates a page "good" when its 75th-percentile visit reaches LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1.

They are Chapter 1 characteristics in a browser's clothes: measurable, tied to revenue (vendor and retailer studies repeatedly report conversion losses from added latency, though the figures vary widely) and budgetable. **Performance budgets** in continuous integration (CI) are their fitness functions: the build fails when the checkout bundle exceeds 150 KB of compressed JavaScript, or when LCP regresses past 2 s on a mid-tier phone profile. Performance is rarely lost in one dramatic decision; it is lost a dependency at a time, each defensible on its own, and a budget turns that drift into a red build on the day it happens. CI catches regressions in the lab; real-user monitoring at p75 on phones shows what fans actually got.

**Recap.** No rendering strategy suits a whole product, so we choose per page class, and Encore runs three side by side. Web vitals are architectural characteristics, and CI budgets are the fitness functions that stop them eroding one dependency at a time.

**Exercise 8.1.** Classify five screens of a product you know into Figure 8.1's rows. Which screen uses the wrong row, and what does that cost?

### 8.2 Structuring the Frontend

#### Structuring the codebase for teams {#team-scale-not-component-scale}

Frontend codebases fail at the same point backends do, when several teams share one, and the structural tools mirror Chapter 2's.

The **design system** (tokens, components and patterns, with an owner and a versioning policy) is the frontend's shared kernel, the one dependency every team accepts for a consistent product. It is a small pattern language for screens, in Christopher Alexander's sense (Chapter 15), with one difference: Alexander's patterns were adapted by each builder on site, whereas a design system is owned centrally and so inherits a central owner's queue. Chapter 3's rule applies: keep it thin. Once it absorbs business components, every team's change waits on its owners, and the kernel has become a committee.

**Module boundaries** follow bounded contexts instead of technical layers: `catalog/`, `checkout/` and `organizer/`, each owning its routes, state and API calls. Folders named for layers sort code by what it is; folders named for contexts sort it by why it changes, which is Parnas's criterion from Chapter 1. They are enforced by the Chapter 2 monolith's cycle-detection fitness functions, because a boundary nobody checks is a suggestion. A monorepo makes enforcement cheap, but its build tooling needs an owner.

#### Frontend state {#state-the-frontends-hardest-problem-demystified}

Most frontend complexity is state handled without a taxonomy, and much of it is accidental in Brooks's sense, produced by treating different kinds of data as one. There are three kinds, each with its own machinery:

| Kind | Examples | Right machinery |
|---|---|---|
| **Local UI state** | open modal, input draft | component state; nothing fancier |
| **Server cache** | events, seats, orders (*the backend's data, borrowed*) | query cache with staleness policy (stale-while-revalidate) |
| **Genuine global client state** | auth session, cart-in-progress, theme | small explicit store |

*Figure 8.2 — The state taxonomy: local UI state, server cache and genuine global client state, each with its own machinery. The classic failure is one global store holding all three: server data goes stale, UI details churn it, and every component couples to every other. Most "global state" is server cache, governed by Chapter 4's caching rules and staleness policy.*

The middle row is where the confusion lives. The seats and orders a frontend holds are borrowed copies of data owned elsewhere, and they begin to age the moment they arrive. Seen that way, the questions are Chapter 4's (how stale may this be, and who says when it changed?), and much hand-built synchronization turns out to have been a cache that did not know its own name. Dijkstra's separation of concerns does the rest: separated, each kind is simple enough to reason about.

A request **waterfall** (a component renders, then fetches, then its child renders and fetches in turn) is Chapter 4's sequential-call latency hidden inside component code, with the same fixes: declare data needs at the route level, fetch in parallel, and prefetch on intent (hover, scrolling into view). A frontend can be slow without any one component being slow. Encore's four-second seat map had two causes, neither visible from inside a component: a three-deep waterfall and an unbudgeted bundle.

**Recap.** The design system is a thin shared kernel, and module boundaries follow bounded contexts under enforced rules. State falls into three kinds, and server cache is handled as caching. Waterfalls are sequential network calls that component code hides from its authors.

**Exercise 8.2.** Trace the requests of your product's slowest screen and draw the waterfall. Which fetches could run in parallel or be prefetched, and what route-level declaration would do it?

### 8.3 Micro-Frontends and Composition

#### Deciding on micro-frontends {#the-honest-question-how-many-teams}

Micro-frontends let teams deploy parts of the frontend independently. That is Chapter 5's argument one layer up, with its prerequisite: a team-coordination problem measured in waiting. With one frontend team they are pure cost. Encore, with nine teams, two of them frontend-heavy, doesn't clear the bar; a modular monolith frontend with Section 8.2's boundaries and one deploy serves it, and I would want to see release collisions counted over a quarter before advising otherwise.

The one exception is the **organizer portal**. It has different users, release schedule and risk tolerance from the fan storefront, so it ships as a separate application on the same design system. That is two applications split where the user experiences separate, the easiest split to defend because the seam existed before we drew it, as a city's residential and industrial districts share roads and building codes without pretending to be one neighborhood.

Composing a single frontend from independently deployed pieces offers four options. **Build-time packages** are libraries: teams share code, but every change couples the deploys together again. **Runtime module federation** gives real independence and demands strict version discipline in return. **Iframes** isolate completely and integrate poorly. **Edge-side composition** works for content pages and poorly for rich interaction. None of this is new: the portal servers of the early 2000s assembled pages from independently developed portlets and met the same inconsistent look and duplicated weight, because the difficulty lies in composition itself.

Every runtime option has three costs that a monolith frontend avoids. Payloads duplicate, because each piece brings its own framework. Look and behavior drift, because only the goodwill of their teams makes the pieces match. And someone must build the *shell* that owns routing, authentication and composition, a product with an owner instead of a folder in the codebase. Chapter 15 calls it the platform.

> **The distributed monolith, browser edition.** Micro-frontends that must release together because they share a state shape, route contracts or a Redux store have a monolith's release coupling and a federation's payload. Apply the Chapter 5 test: can this piece ship alone, unannounced?

**Recap.** Micro-frontends pay off only when team coordination already causes waiting, and they split best where user experiences separate. Runtime composition costs payload and consistency and needs an owned shell. Most products need a modular monolith frontend and at most one split.

**Exercise 8.3.** Count the frontend teams touching your main app and their release collisions last quarter. Choose a modular monolith, one split or federation, and name the split line.

### 8.4 The Frontend–Backend Seam

#### Backends for frontends {#bffs-one-experience-one-aggregator}

Chapter 5 warned against the screen that calls nine services; the **backend-for-frontend** (BFF) is the standard fix. Each experience (fan app, organizer web, partner embed) gets a thin aggregation layer owned by its frontend team. The BFF calls services in parallel so the client sees no waterfall, shapes responses to each screen, and holds the access tokens so the browser doesn't have to (Section 8.5).

{% include diagrams/fig-8-3.svg %}

*Figure 8.3 — One BFF per experience, owned by the frontend team because it changes at the pace of its screens. A shared "general-purpose BFF" is an API gateway accumulating business logic, Chapter 7's enterprise service bus (ESB) trap one layer up. Seat updates reach the browser through a thin real-time edge, never straight from Inventory.*

Sharing one BFF across experiences looks like reuse, but a layer that serves everyone's screens eventually holds everyone's business logic. That is Chapter 2's SOA story in miniature. An aggregator should be thin enough that its owners could rewrite it in a week.

GraphQL, deferred in Chapter 7, belongs here. When many screens need flexible slices of many services, a federated graph is a BFF strategy: typed, shaped by client queries and normalized in the client cache, at the cost of per-field authorization and an owned graph. Encore's two experiences don't justify it; 40 screens across six teams would.

**Native apps change the timing.** A web deploy replaces every client within minutes; a store release reaches phones over days, and old app versions keep calling for years from the pockets of fans who never update anything. The fan BFF therefore versions its responses the way Chapter 7 versions public APIs, tracks which app versions still send traffic, and keeps a forced-upgrade floor for the day an old client becomes a liability. A native app is a public API consumer that happens to be our own code.

**Real-time updates.** The seat map needs server push: Server-Sent Events (SSE) for one-way streams, or WebSockets when the client also sends. Encore uses SSE for seat availability because it runs over plain HTTP, passes through proxies and reconnects automatically. The browser is the last subscriber of Chapter 6's event backbone. Every open connection is state, so connections live in Section 4.3's push tier, kept thin, separate and reconnect-tolerant; the stateless rules govern everything behind it.

**Optimistic UI.** The client applies a tap locally at once, reconciles when the server answers, and needs a designed failure path: a fan who tapped a seat that was already gone instantly sees it is taken, with three nearby seats offered. An optimistic interface is a promise made before the facts are in, and it must be designed around the moment it is broken.

**Recap.** Each experience gets its own thin, frontend-owned BFF that aggregates service calls in parallel; GraphQL is a BFF strategy for many-screen products. Native clients make the seam a contract measured in years. Real-time UIs subscribe to the event backbone, and optimistic UI is eventual consistency with a designed conflict path.

**Exercise 8.4.** Design the optimistic flow for Encore's seat tap: local effect, reconciliation and the conflict path. What does the fan see at 200 ms, at 800 ms and on conflict?

### 8.5 Security, Accessibility, and AI Interfaces

#### Securing the browser {#the-browser-is-a-hostile-runtime-you-dont-control}

Frontend security reverses backend instincts. On the server we own the machine; in the browser our code runs beside adversarial code, extended with plugins we've never heard of, like a stall in a market where any neighbor may reach across the counter. We cannot control the market, so we decide what we leave within reach. Three decisions matter.

**Token custody.** Access tokens in JavaScript-readable storage are what cross-site scripting (XSS) steals. Encore's BFFs hold the tokens and give browsers only `HttpOnly`, `Secure`, same-site session cookies. That stops token theft but not session riding (injected script calling the BFF as the user), so CSP matters as much. Cookie sessions also bring back cross-site request forgery (CSRF), so state-changing requests carry an anti-CSRF token. Each defense closes one door and props open another.

**Content Security Policy (CSP).** CSP is the browser's execution allowlist. Encore runs it in report-only mode first, to learn what the site actually loads, then enforces it so only vetted scripts run.

**Sanitization.** Rendering user content is code execution until proven otherwise. Sanitize with an established library; a homemade regex misses cases its author never imagined and an attacker eventually will.

**Accessibility as a characteristic.** Accessibility, like security, is architectural because retrofits fail. Curb cuts are cheap to pour with a new sidewalk and expensive to cut into an old one, and they serve strollers and suitcases as well as the wheelchairs they were built for. The usual target is Web Content Accessibility Guidelines (WCAG) 2.2 AA, and in the EU it is law: the European Accessibility Act has applied to e-commerce, ticketing included, since June 28, 2025. Semantic structure, keyboard paths and contrast tokens live in the design system, where one fix reaches every team, and in CI checks. Automated checks catch a minority of issues, so manual screen-reader testing stays on the release checklist. Encore's seat map has a keyboard and screen-reader picker designed in from the start: a fan who can't operate it in the 90 seconds of an on-sale is shut out.

**The AI-era interface.** The frontend meets Chapter 12's model-backed features first, through three patterns. *Streamed responses*: tokens render as they arrive, because users judge speed by when output starts, as Miller's work would predict. The machinery is Section 8.4's streaming over HTTP, usually a `fetch` stream, since the browser's `EventSource` cannot send a POST. *Generative UI discipline*: model output is untrusted input, like user content. It renders through an allowlist of vetted components (cards, lists, forms), never as raw HTML, and the page never auto-loads URLs or images the model emits, since a prompt-injected image link can exfiltrate data just by being fetched. *Human-in-the-loop affordances*: AI-suggested actions arrive as proposals with a visible undo. Users trust what they can reverse, and I suspect the undo button will do more for trust in these systems than the next improvement in the models behind them.

**Recap.** BFF-held tokens, CSP and library sanitization form the browser perimeter, each covering a gap the others leave. Accessibility lives in the design system and CI, poured with the sidewalk. AI features stream into vetted components, with undo designed in.

**Exercise 8.5.** For one web app you own: where do its tokens live, what does its CSP allow, and which components render user-supplied content? For each answer, name the incident it permits.

### Kata: The Storefront

> **Your brief: "Bloom."** A florist marketplace: 2,000 independent shops, buyers mostly arriving from search and Instagram links (so SEO and first paint decide), a shop-owner portal (orders, arrangements, deliveries) used all day on tablets, and same-day delivery tracking that changes minute by minute. Eight engineers: six product, two "the ones who like frontend." Mother's Day is Bloom's on-sale: 30× traffic, 70% of it first-time visitors on phones.

**Deliverables:**

1. **Rendering matrix** — every page class mapped to Figure 8.1's rows, with a Mother's Day column: what stays fast at 30× traffic?
2. **Structure plan** — module boundaries, the state taxonomy applied (what is server cache? what is global?), and two performance budgets with CI enforcement.
3. **Composition verdict** — buyer storefront vs. shop portal: one app, two apps or federation? Argue from team count.
4. **Seam design** — BFF(s) with ownership, the delivery-tracking push channel, and the optimistic flow for "claim this delivery slot."
5. **One architecture decision record (ADR)** — token custody and CSP posture for a site embedding shop-owner-authored content.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Per-class rendering | Does Mother's Day traffic hit static/ISR paths, or servers? |
| State classification | Is anything global that is really server cache? |
| Team-scale sizing | Is the composition answer sized to eight engineers? |
| Optimistic conflicts | When two buyers claim the same delivery slot, what does the loser see, and when? |
| Perimeter placement | Could an XSS in a shop's bio reach a buyer's session? |

#### Where you now stand

The frontend now has rendering chosen per page class, sorted state, owned BFFs and a perimeter around a runtime we do not control. Behind every screen stands a question deferred twice already: who owns the data? The answer differs for operational and analytical data, and it gets hard once every team wants every other team's tables. Chapter 9 answers it, from distributed ownership to the data mesh.

### References

- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Michael Geers — [*Micro Frontends in Action*](https://www.manning.com/books/micro-frontends-in-action). Manning, 2020.
- Ilya Grigorik — [*High Performance Browser Networking*](https://hpbn.co/). O'Reilly, 2013 — free online.
- Luca Mezzalira — [*Building Micro-Frontends*](https://www.oreilly.com/library/view/building-micro-frontends/9781492082989/). O'Reilly, 2021.
- Google — [*Web Vitals*](https://web.dev/articles/vitals). web.dev, continuously updated — free online.
- Jason Miller, Addy Osmani — [*Rendering on the Web*](https://web.dev/articles/rendering-on-the-web). web.dev, 2019 — free online.
- Sam Newman — [*Backends For Frontends*](https://samnewman.io/patterns/architectural/bff/). samnewman.io, 2015 — free online.
- W3C — [*Web Content Accessibility Guidelines (WCAG) 2.2*](https://www.w3.org/TR/WCAG22/). W3C Recommendation, 2023 — free online.
- OWASP — [*Cross Site Scripting Prevention Cheat Sheet*](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html). OWASP Foundation, continuously updated — free online.

---

## Chapter 9: Data Architecture — From Distributed Data to Data Mesh {#ch9}

> Code is what a system does; data is what it knows. Split the doing, and the knowing demands a constitution.


Decomposition sets teams free, and data is where that promise is audited. When Chapter 5 made every service's database private, three old comforts quietly disappeared: the cross-domain `JOIN`, the transaction that spans everything, and the analyst's "one big database where everything lives." Encore's teams now ship independently, and the finance report that used to be one query has become a distributed-systems problem with a deadline.

It helps to remember what we gave up. Edgar Codd's 1970 paper introducing the relational model spoke of "large shared data banks," and for decades the shared database sat at the quiet center of enterprise systems, every application reading and writing the same tables. It was a triumph of abstraction and, as Chapter 5 found, a coupling so deep that no team could change its schema without negotiating with every other. We have traded one shared truth for many owned ones, and must now pay for the trade with our eyes open.

The *operational* half of data architecture covers who owns which data, how services answer joined-up questions without coupling again, and what replaces the lost transactions. The *analytical* half covers why the central warehouse pipeline breaks as the organization grows, and what the data mesh does about it. I have come to believe that each is an ownership problem before it is a technology problem.

### 9.1 Data Ownership in Distributed Systems

#### One writer per table {#one-writer-per-table-and-the-three-hard-cases}

The baseline rule is Chapter 3's aggregate discipline across the fleet: **every table has exactly one owning service, and only the owner writes to it.** Reads can be negotiated (Section 9.2); writes cannot. A table with two writers is two services sharing an undeclared contract, and since neither can change the table's meaning without the other's consent, they deploy only together.

A land registry is a useful picture. Banks, surveyors and tax offices all keep copies of what it says, but only the registry records a transfer; its authority comes from being the one place where a change becomes true. The analogy breaks on tempo (a registry changes slowly and by ceremony, a table many times a second), but the principle survives the change of speed.

*The Hard Parts* names three ownership shapes. **Single** ownership, one service owning a concept outright as Catalog owns events, covers most data and is easy. **Common** ownership covers data every service needs, such as audit records: give it one owning service behind an API, or feed events into an owned store, but never fall back on a shared table that belongs to everyone and therefore to no one.

**Joint** ownership, two services with legitimate claims on one concept, is the hard case. Who owns a *sale* at Encore? Orders runs the workflow; Finance runs the ledger service, split out of Chapter 5's Orders & Payments as accounting grew. The usual resolution is a **split by meaning**: the *sale as process* belongs to Orders, and the *sale as accounting fact* belongs to Finance, populated from `SaleCompleted` events. One word gets two models and two owners, which is Chapter 3's bounded-context lesson applied to storage. When two teams quarrel over a noun, the noun usually means two things.

With ownership settled, each owner chooses its store by access pattern rather than by fashion:

| Store family | Buy it for | It punishes |
|---|---|---|
| Relational | invariants, joins, transactions; the default until proven otherwise | massive write fan-out |
| Document | read-mostly aggregates fetched whole | cross-document invariants, ad-hoc joins |
| Key-value | extreme simple-op throughput (sessions, holds) | any query beyond the key |
| Column-family | append-heavy volume with known query paths | flexible queries, transactions |
| Graph | relationship-first questions (fraud rings) | everything else |

Encore runs relational databases for Orders and the ledger, where the invariants live, and key-value for Seat Inventory's holds (the five-minute time-to-live (TTL) claims). A third engine waits until a real query needs one. The common failure is more stores than anyone can operate well; every database a team adopts is a pet it must feed for years.

#### Consistency without distributed transactions {#what-replaced-the-transaction}

Chapter 5's sagas run workflows that span owners. Beneath them sit three consistency patterns, in rising order of decoupling. **Background sync** is batch reconciliation, such as Encore's nightly finance close: unfashionable and, for the right flow, embarrassingly effective. **Orchestrated** consistency is the saga's explicit process. **Event-based** consistency has owners react to facts; it is the default for propagation, published through Chapter 6's transactional outbox so the state change and its event commit together.

Encore refuses two-phase commit (2PC) across services. The transaction, as Jim Gray and his colleagues developed it in the 1970s, is one of our field's great abstractions, letting a programmer pretend that a set of changes happens all at once or not at all; inside one database the pretense is cheap. Across services it is not: 2PC ties every participant's availability to the coordinator and the slowest peer, and a coordinator failure leaves participants blocked with locks held. With independent deploys and Chapter 4's network latencies, that trade is wrong. Pat Helland made the broader case in "Life beyond Distributed Transactions" (2007): systems that must scale almost without limit are built from entities that are transactional inside and talk to one another through messages. Encore keeps atomic transactions inside one owner's database and lets messages carry the rest.

> **Eventual consistency is a business conversation, not an apology.** "The dashboard trails reality by up to a minute" is a *requirement statement* the business can price. Each cross-owner flow gets a point on Chapter 4's consistency spectrum, signed off by the stakeholder instead of guessed by the engineer.

**Recap.** Every table has one writer, the place where its changes become true. Common data gets an owner; joint data is split by meaning. Sagas, events and humble batch reconciliation replace cross-service 2PC. Staleness is agreed with the business, flow by flow, instead of assumed by whoever writes the code.

**Exercise 9.1.** Find a table (or concept) in your world with two writers. Split it by meaning: name the two models, their owners and the event connecting them.

### 9.2 Distributed Data Access

#### Querying across services {#answering-questions-nobody-owns}

The fan's account page needs orders, tickets and refund status: three owners, one screen, and a question no service owns. The options, each with its bill:

| Pattern | Mechanism | Freshness | Bill |
|---|---|---|---|
| **API composition** | call each owner, join in the backend for frontend (BFF) | live | latency stacks (Chapter 4 tails); fine for 2–3 owners |
| **Replicated read model** | subscribe to owners' events, keep a local copy shaped for your queries | seconds-stale | you now run a projection (Chapter 6's command query responsibility segregation (CQRS), cross-service) |
| **Shared read store** | several services read one store that owners feed; only owners write | seconds-stale | shared schema governance returns |
| **Change data capture (CDC) cache** | the database's change stream feeds a query store | seconds-stale | pipeline to operate; schema coupling to guard |

*Figure 9.1 — The access menu: composition for screens, replicated read models for query-heavy needs, CDC for owners that don't publish events. The missing row is reading another service's tables, because today's reads become tomorrow's joins and the owner's schema is frozen.*

In the last three rows, **the query moves to a copy shaped for it, and contracts feed the copy** (events, or CDC with a published schema). A library catalog works the same way: a copy of facts about the books, arranged for readers' questions and kept current as books arrive and leave. It may trail the shelves a little, and readers accept that rather than search the stacks by hand.

Encore's account page is a replicated read model in the Fan-BFF, subscribed to three owners' streams. It loads in one query, the owners change schemas freely, and product signed off on "seconds" of staleness. The Fan-BFF team now runs the projection, so the price falls on the team that wanted the query, which is where it belongs.

*The Hard Parts* also names a **data domain**: a schema that a few closely related services all read and write. That is deliberate joint ownership, and those services then deploy together, so keep it to a small cluster that changes in step anyway.

Owners also change their schemas under traffic. Engineers replacing a bridge on a road that cannot close build the new span beside the old, move traffic across, and demolish the old span only once the new one has proved itself. Zero-downtime migration does the same to a database, applying expand–contract in four phases, each reversible except the last. **Expand** adds the new shape, which old code ignores. **Dual-write** has new code write both shapes while old readers carry on. **Backfill** migrates history in throttled, verified batches. **Contract** switches reads, watches a full business cycle, then drops the old shape. Encore split `price` into `base_price` and `fees` (Chapter 7's regulatory change) this way over three weeks, without incident. The best migration is the one nobody remembers.

**Recap.** Cross-owner questions are answered from copies fed by contracts: composition for shallow joins, projections for deep ones, CDC for owners that don't publish events. Reading another service's tables couples you to its schema, and owners change schemas by expand–contract, reversible until the last step.

**Exercise 9.2.** Take your product's heaviest cross-domain screen. Which row of Figure 9.1 serves it today? Which *should*, and what contract would feed the copy?

### 9.3 Analytical Architectures

#### Why central data pipelines break at scale {#the-pipeline-that-breaks-at-org-scale}

Analytics has its own lineage. The **warehouse**, shaped in the 1990s by Bill Inmon and, with dimensional modeling, by Ralph Kimball, is structured, governed and queried in SQL. The **lake** stores everything raw and cheaply, applying schema on read. The **lakehouse**, the current default, brings warehouse discipline to lake storage through open table formats. In practice that means Apache Iceberg or Delta Lake tables behind a shared catalog, queryable in place by most warehouse engines. Any of the three can store Encore's data, which tells us where *not* to look for the failure.

What breaks is the operating model around the storage. A central data team extracts from every domain's databases through pipelines it maintains but whose sources it doesn't control. Each upstream schema change breaks a pipeline the domain team never sees. New questions queue behind a team that knows the tables but not the ticketing business. The central team becomes what Chapter 5 called the coordination machine: a monolith of extract, transform, load (ETL) jobs, with one backlog for every analytical question.

We have seen this shape before. The data-processing departments of the mainframe era kept a queue of report requests, and the integration teams of the service-oriented architecture (SOA) years kept a queue of changes to the enterprise service bus. Each time a central group owned plumbing between domains it did not understand, and the queue outgrew the group. The technology changed; the bottleneck stayed wherever ownership was missing.

Two repairs come before any talk of a mesh. The first is **owner-published feeds**: analytics reads the events owners publish on Chapter 6's backbone instead of scraping their tables. Stream them where freshness matters; much analytics can stay batch; there is no virtue in paying for seconds when the question is asked monthly.

The second is **data contracts**: published schemas with compatibility guarantees on every analytical feed. "Your change broke finance's dashboard" stops being a Friday surprise and becomes a failed continuous integration (CI) check on the *producer's* build, while the change can still be reconsidered. CI needs them machine-readable, for example in the Open Data Contract Standard (ODCS, from the Linux Foundation's Bitol project). Contracts move breakage to the team that knows the schema, the principle Section 9.4 follows to its conclusion.

**Recap.** The lakehouse is the storage default; the failure is organizational: central pipelines coupled to schemas they don't own, behind one team's backlog. The repairs are owner-published feeds, streamed where freshness justifies it, and producer-side contracts.

**Exercise 9.3.** Trace one dashboard at your work back to its sources. How many schema changes could break it, and who finds out first: whoever made the change, or the dashboard's owner?

### 9.4 Data Mesh

#### Domain ownership for analytical data {#the-books-own-logic-applied-to-analytics}

Zhamak Dehghani described the data mesh in 2019, and each of its four principles restates an earlier chapter. **Domain ownership**: each domain team owns its analytical data, as Orders owns `ticket-sales` (Conway's law, Chapter 3). **Data as a product**: Section 6.5's streams with owners, contracts and service-level objectives (SLOs), plus discoverability and documentation, since a product nobody can find is not yet a product. **Self-service platform**: a platform makes publishing a data product as easy as deploying a service, so domains don't each build lakehouse plumbing (Chapter 15's thesis, arriving early). **Federated computational governance**: global rules for privacy, identifiers and quality metadata, enforced *as code in the platform* instead of in a committee's memos; Chapter 5's paved road, laid for data.

"Federated" is the right word, and the chapter's epigraph leans on it. In a federation, states govern themselves on most matters while accepting a small body of law that binds them all. The mesh asks domains to govern their own data under a short constitution on identifiers, privacy and quality, which the platform enforces. A constitution works only when it is short enough to obey and enforced by something sturdier than goodwill.

A data product packages much more than a table:

{% include diagrams/fig-9-2.svg %}

*Figure 9.2 — Anatomy of a data product: code, ports and contract travel together under one owner. Consumers subscribe to ports, never to someone's tables, and the data product replaces "the warehouse" as the unit of analytical architecture.*

The data product is information hiding carried into analytics. Parnas's criterion from Chapter 1 asked each module to hide a decision likely to change; the data product hides its storage, pipelines and internal schema behind ports and a contract, so the owner can rebuild the inside without asking consumers' permission. Only the promise must hold still.

The mesh solves a large-organization problem, and its machinery is sized accordingly. Encore, at nine teams, adopts the *principles* (contracts, product thinking, two or three real data products) without the full federated apparatus, which waits, as microservices did in Chapter 5, for measured coordination pain and the prerequisites. Gartner's 2022 Hype Cycle for Data Management rated data mesh "obsolete before plateau," and many adopters kept the principles while scaling back the full operating model. I read that as a verdict on the operating model more than on the ideas: machinery built for a very large organization feels like bureaucracy to nine teams.

**Recap.** Data mesh applies decomposition to analytics through domain ownership, product discipline, a self-service platform and governance as code. The data product (code, ports and contract under one owner) is the new unit, hiding its insides as a good module does. Adopt the principles at any scale and the machinery only when coordination pain is measured.

**Exercise 9.4.** Sketch Figure 9.2 for your company's most-asked-about data: owner, ports, contract, first three subscribers. Which committee would it make unnecessary?

### 9.5 The Self-Service Data Platform

The mesh stands or falls on its platform. Domains must be able to do four things *without filing tickets*: declare a product (scaffold, registry entry, catalog listing); publish ports (a stream and a table from one definition); inherit governance (detection of personally identifiable information (PII), retention and access policies, all applied by the platform); and observe (freshness, quality and lineage dashboards for free).

Governance must reach every copy. Section 9.2 creates copies on purpose, so a fan's erasure request must propagate to every port, projection and table, through platform-driven deletes on the table format or Chapter 6's crypto-shredding. A rule that binds the original but not its copies is hardly a rule. This is Chapter 15's golden-path pattern applied to data: with it, the third data product costs a sprint instead of a quarter.

AI depends on this platform. Chapter 12's feature pipelines and retrieval corpora are *consumers of data products*. Demand forecasting subscribes to `ticket-sales`. The support assistant's retrieval-augmented generation (RAG) corpus is built from the `support-cases` product and inherits its contract, lineage and access rules. Teams that skip this discipline meet it later, at higher cost, as a model trained on stale data with no owner and no access rules. A model is no more trustworthy than its data, and the data no more trustworthy than the ownership behind it.

**Recap.** The platform makes correct data handling the cheapest option: declare, publish, inherit, observe. AI systems consume data products, so their quality is bounded by those products.

**Exercise 9.5.** List the manual steps at your company between "a team has valuable data" and "another team uses it safely." Mark each as platform backlog or a cost you will keep paying.

### Kata: The Freight Ledger

> **Your brief: "Cargo."** A freight forwarder, 14 years old: one Oracle schema, 1,100 tables, a 22-person central data team drowning in 400 nightly ETL jobs. Domains: bookings, customs, fleet, billing. Fresh pain: billing disputes need booking, customs and GPS history joined within minutes (today: next morning); a new ML team wants two years of clean movement history; customs data is restricted per country (compare Chapter 7's Atlas); and the CFO has banned "another warehouse rewrite."

**Deliverables:**

1. **Ownership map** — the four domains' data, three joint-ownership conflicts resolved by split-by-meaning.
2. **Operational access design** — the dispute screen served by Figure 9.1's menu, with declared staleness and its business sign-off.
3. **Two data products** — Figure 9.2 anatomy for `shipment-movements` and `customs-status`, including the per-country access rule *as platform-enforced policy*.
4. **Migration path** — from 400 ETL jobs toward contracts and products without a big bang: which two pipelines are strangled first, and where producer-side CI contracts are introduced first.
5. **One architecture decision record (ADR)** — "why the central data team becomes a platform team," losses included.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Ownership first | Is every technology choice downstream of a named owner? |
| Contract placement | Does producer CI catch breakage, or consumers the next morning? |
| Regulated data | Is the country restriction enforced by the platform, or by memory? |
| No big bang | Could the CFO stop funding at any month and keep the value shipped so far? |

#### Where you now stand

Data now has owners, contracts, products and a platform to serve them. This chapter leaned on policies enforced as code (privacy, erasure, per-country access) without covering the security discipline behind them, a debt the careful reader will have noticed. Chapter 10 pays it: it draws the trust boundaries, threat-models the flows built across nine chapters, and treats security as an architectural characteristic with fitness functions instead of a questionnaire at the end.

### References

- Adam Bellemare — [*Building an Event-Driven Data Mesh*](https://www.oreilly.com/library/view/building-an-event-driven/9781098127596/). O'Reilly, 2023.
- Jacek Majchrzak, Sven Balnojan, Marian Siwiak — [*Data Mesh in Action*](https://www.manning.com/books/data-mesh-in-action). Manning, 2023.
- Zhamak Dehghani — [*Data Mesh: Delivering Data-Driven Value at Scale*](https://www.oreilly.com/library/view/data-mesh/9781492092384/). O'Reilly, 2022.
- Zhamak Dehghani — [*How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh*](https://martinfowler.com/articles/data-monolith-to-mesh.html). martinfowler.com, 2019 — free online.
- Ian Gorton — [*Foundations of Scalable Systems*](https://www.oreilly.com/library/view/foundations-of-scalable/9781098106058/). O'Reilly, 2022.
- Joe Reis, Matt Housley — [*Fundamentals of Data Engineering*](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/). O'Reilly, 2022.
- Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani — [*Software Architecture: The Hard Parts*](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/). O'Reilly, 2021.
- Bitol — [*Open Data Contract Standard*, v3](https://bitol-io.github.io/open-data-contract-standard/). Linux Foundation AI & Data — free online.
- Ralph Kimball, Margy Ross — [*The Data Warehouse Toolkit*, 3rd ed.](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit:+The+Definitive+Guide+to+Dimensional+Modeling,+3rd+Edition-p-9781118530801). Wiley, 2013.

---

## Chapter 10: Security Architecture and Zero Trust {#ch10}

> Attackers don't respect your diagrams. Draw the ones they do: the trust boundaries.


Nine chapters in, Encore has services, streams, APIs, backends for frontends (BFFs), and data products, and with them an attack surface that nobody sat down to design. That is the ordinary condition of software: we design functionality on purpose, and security accumulates around it afterward, like silt around a pier. Here we reverse the order and treat security as one of Chapter 1's architectural characteristics, designed in, traded off explicitly, and verified by fitness functions.

The architect is a defender, whether or not the title says so: trust boundaries, workload identity, and data placement are architecture decisions, and by the time a security team reviews them the concrete has set. Meanwhile the network perimeter no longer protects anything worth protecting. Its successor, **zero trust**, is an architectural stance, which is to say something no vendor can ship to you: no network location confers trust, every request is authenticated and authorized, and every actor, human or workload, carries an identity. The work products are threat models, boundary diagrams, and security architecture decision records (ADRs). Exploit techniques are out of scope; we are concerned with the shape of the building and leave the craft of picking its locks to others.

### 10.1 Thinking Like a Defender

#### Threat modeling {#threat-modeling-engineering-not-paranoia}

Threat modeling is ordinary engineering judgment applied to an adversary instead of to gravity or load, and its core fits in Adam Shostack's four questions, asked of any design: *What are we building? What can go wrong? What are we doing about it? Did it work?* The middle two need a method, because "what can go wrong" asked without structure produces either a shrug or an endless list.

Microsoft's STRIDE turns the open question into a checklist (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege), walked over a data-flow diagram. Here it is over Encore's crown jewel, the on-sale:

| STRIDE | On-sale threat | Design answer |
|---|---|---|
| Spoofing | bots impersonating fans at the Gate | Bot Screening before the queue; device attestation |
| Tampering | hold time-to-live (TTL) manipulation to lock inventory | server-authoritative TTLs; signed hold tokens |
| Repudiation | "I never bought this" disputes | Chapter 6's event ledger as audit trail, plus per-order authentication evidence (strong customer authentication or 3-D Secure result, device, session) |
| Information disclosure | seat-map probing reveals sales velocity to scalpers | rate-limited, coarsened availability responses |
| Denial of service | the on-sale *is* a voluntary distributed denial of service (DDoS); attackers add to it | Chapter 4's load shedding and the Gate; upstream scrubbing |
| Elevation of privilege | fan token used against organizer endpoints | audience-bound tokens; per-service authorization |

*Figure 10.1 — STRIDE over the on-sale. Many of the mitigations are patterns from earlier chapters reused as security controls: the ledger, the Gate, load shedding. Good architecture and defensible architecture turn out to be mostly the same drawings.*

The ledger we built for correctness settles disputes; the Gate we built for elasticity stands first against an attacker riding the spike. Security, approached architecturally, is often a matter of noticing which existing walls already bear the load.

The designing team runs the threat model itself, on the C4 diagrams it already has, at about an hour per significant change; a review weeks later catches mistakes only after they have been built upon. The architect's contribution to those diagrams is the **trust boundary**, a line on a diagram where the level of trust changes: internet to gateway, service to payment service provider (PSP), anything to database. The STRIDE questions concentrate wherever a request crosses such a line, as a customs officer's attention concentrates at the border.

No organization can defend everything equally, so **data classification** (public, internal, confidential, regulated) decides where the defenses go. At Encore, seat maps are public, sales velocity is confidential because scalpers pay for it, and payment data is regulated. Encore never holds card numbers at all: the PSP tokenizes them at its own boundary, and so Chapter 3's anticorruption layer (ACL) around Payments now does security work as well as translation. Data you don't hold cannot leak.

Compliance scope shrinks but remains: an injected script can still skim the checkout page that hosts the PSP's payment fields, so its scripts stay under a Content Security Policy and integrity monitoring, the controls added in version 4.x of the Payment Card Industry Data Security Standard (PCI DSS). Moving a liability across a boundary is a fine strategy, provided we remember that the boundary remains ours to guard.

**Recap.** The team that builds the system asks Shostack's four questions on the diagrams it already has, with STRIDE giving shape to the second. Trust boundaries show us where to ask; classification shows us where to spend. The strongest control for sensitive data is the humblest: not storing it.

**Exercise 10.1.** Draw your system's context diagram and mark the trust boundaries. At each crossing, ask one STRIDE letter's question. Which crossing has no answer today?

### 10.2 Zero Trust and Identity

#### Identity as the perimeter {#identity-is-the-new-perimeter}

For a long time we defended systems as medieval towns did, with a wall. The castle model (hard shell, soft interior) assumed that whoever stood inside was a citizen. Then the town grew past its walls, as towns do: laptops went home, services moved to other people's data centers. More decisively, the model fails on its own terms. Once one phished credential is inside the wall, implicit trust lets the attacker move laterally to anything, and the wall meant to keep enemies out now shelters them from scrutiny.

The replacement has a short history. John Kindervag, then an analyst at Forrester, gave it the name "zero trust" around 2010, and Google's BeyondCorp, described publicly in 2014 showed that a large company could run without a privileged internal network. The deeper principles are older still. In 1975 Jerome Saltzer and Michael Schroeder, drawing heavily on their experience with Multics, set down design principles for protection that included *least privilege* and *complete mediation*, the requirement that every access to every object be checked. Zero trust is largely those principles, rediscovered after a few decades of believing a firewall could stand in for them.

Today the stance is stated as three tenets, as Microsoft distills them in line with the National Institute of Standards and Technology's (NIST) SP 800-207. **Verify explicitly**: authenticate and authorize every request, from anywhere. **Least privilege**: grant access to the resource, never to the network. **Assume breach**: design small blast radii as well as strong walls. The analogy I find most useful is biological: the immune system checks identity everywhere, in the bloodstream as much as at the skin. It breaks where an immune system learns by painful trial, whereas we must declare our defenses in advance.

The tenets apply across three identity planes.

**Humans.** People sign in through OpenID Connect (OIDC) single sign-on (SSO) with phishing-resistant multi-factor authentication (MFA), meaning passkeys or FIDO2 keys, because SMS codes can be phished and push approvals get accepted out of sheer fatigue. Sessions stay short. That much is hygiene, bought off the shelf. The architectural work is roles modeled on the domain: Chapter 7's scopes (`holds:write`) are authorization vocabulary, designed with the API by the people who know what a hold is. Chapter 14 adds tenant claims to the same vocabulary.

**Workloads.** Most organizations under-build this plane, perhaps because workloads never complain about having too much power. Every service gets a SPIFFE-style (Secure Production Identity Framework for Everyone) cryptographic identity, such as `spiffe://encore/inventory`. Chapter 5's service mesh enforces mutual TLS (mTLS) everywhere, so identity and encryption become infrastructure policy that no team has to remember. Services also authorize one another by declared policy: Inventory accepts `reserve` calls from Orders and from no one else. An attacker who compromises Analytics, therefore, finds no route into Inventory, because no route was ever drawn.

**Networks, as a second layer.** Segmentation remains, demoted to defense in depth: private subnets, no public database endpoints, and controlled egress. Egress control, the chokepoint for exfiltration, is the least glamorous of these and the one breach postmortems keep wishing had been in place.

{% include diagrams/fig-10-2.svg %}

*Figure 10.2 — Service-to-service authorization as declared policy. The dotted line marks the call that policy denies: Analytics has no path to Inventory and learns from the event stream instead. Least privilege here is expressed as architecture, which is why Chapter 6's event backbone is a security control too.*

Analytics never needed to call Inventory; it needed to *know* what Inventory had done, and the stream already told it. A boundary drawn well for one reason tends to serve several.

**Recap.** Trust attaches to verified identity, never to network position, which is Saltzer and Schroeder's complete mediation, applied at last to the network. Humans get SSO with MFA and domain-modeled roles. Workloads get cryptographic identity, mesh-enforced mTLS, and explicit call policies. Networks remain a second layer, with egress control doing much of the work.

**Exercise 10.2.** For two services you run, write the call-policy sentence ("X accepts A from B and C"). Is it enforced anywhere?

### 10.3 Securing the Stack

Four disciplines cover the rest of the stack, each with one architectural core beneath much operational detail.

**Secrets: fewer and shorter-lived.** When secrets leak, the instinct is to buy a better vault, yet having fewer long-lived secrets helps more: a secret that expires soon is worth little to the thief. Workloads exchange their identity (Section 10.2) for short-lived, automatically rotated credentials, and humans get just-in-time access that expires on its own. A leaked credential that expires in 15 minutes is an incident; one that lives for years is a breach nobody has found yet.

**Data protection: encryption is a key-management problem.** Transport Layer Security (TLS) everywhere and encrypted storage are the baseline. Encryption moves the question of who can read the data to the keys, and the design work moves with it. Keys are held in a key management service (KMS), separated by data class (Section 10.1's classes become key policies), rotated, and protected with envelope encryption for anything regulated. Who can use which key should be answerable from a policy and a log, never from someone's memory.

**Supply chain: dependencies are your code.** In his 1984 Turing Award lecture, "Reflections on Trusting Trust," Ken Thompson showed that a compromised compiler could insert a backdoor into programs whose source code was perfectly clean. His moral, that you cannot fully trust code you did not create yourself, read for decades like a puzzle and reads now like a forecast. A growing share of breaches arrive through a dependency instead of an open port, as the 2024 xz backdoor and the 2025 self-spreading npm worms showed.

The supply-chain controls are lockfiles with provenance verification; image signing with admission enforcement, so that an unsigned image doesn't deploy (a fitness function); software bills of materials (SBOMs), so that "are we exposed?" takes an hour to answer; and build pipelines run as production systems, which is the point of the Supply-chain Levels for Software Artifacts (SLSA) framework. To an attacker, a pipeline that can deploy anything is the most valuable service you run.

**Events and APIs: the earlier controls hold.** APIs keep Chapter 7's object-level authorization and abuse limits. Chapter 6's streams get schema-validated events, signatures where authorship may be disputed, and replay protection from a nonce and timestamp inside the signed payload. Idempotency keys absorb benign duplicates, but they offer no defense against deliberate replay, since an attacker can simply mint a fresh key.

**Recap.** We prefer credentials that expire over credentials that are merely hidden. We design who can use each key and log every use. We run the build pipeline as production and treat dependencies as our own code, as Thompson warned. We keep the event and API controls of Chapters 6 and 7 in force.

**Exercise 10.3.** List your three longest-lived credentials with their age, blast radius, and rotation story. Design the short-lived replacement for the worst one.

### 10.4 Isolation and Multi-Tenancy

#### Designing for blast radius {#blast-radius-is-a-design-variable}

Assume breach asks a sobering question of every component: *when* this is compromised, what does the attacker hold? Isolation keeps the answer small. Building codes treat fire the same way, dividing a building into compartments on the expectation that a fire will start somewhere and must not spread everywhere. Simon's near-decomposability from Chapter 1 says it in another key: a compromised part is a failure with intent, and weak coupling between parts contains it.

Multi-tenant software as a service (SaaS) asks an old question again at cloud scale: how to let many users share one machine without reading one another's work. For tenants, Tod Golding's work and AWS's SaaS guidance give us the vocabulary that Chapter 14 builds on. **Silo** gives each tenant its own stack: the smallest blast radius and the largest bill. **Pool** shares everything and isolates tenants by row-level policy and tenant-scoped tokens. It is efficient, and it is one missing `WHERE tenant_id` away from a cross-tenant leak, so the predicate belongs in the platform layer instead of in every query. **Bridge** mixes the two layer by layer, most often pooled compute over siloed data.

Encore has no tenants yet, but it already isolates by data class. The ledger and Bot Screening's risk data sit in their own cloud accounts, under their own keys, as their classification requires.

Two isolation problems are new, and the first is **sandboxing untrusted execution**. Partners' code, plugins, and (from Chapter 12) AI-generated actions run behind gVisor- or Firecracker-class boundaries with controlled egress. Outbound webhooks need egress control too. A customer-supplied callback URL pointing at an internal address is the classic server-side request forgery (SSRF) hole, in which our server is persuaded to fetch what the attacker cannot reach.

The second is **the AI-era attack surface**, named here so that Chapter 12 can use the vocabulary. *Prompt injection* is untrusted text steering a model that holds credentials. *Retrieval leakage* is retrieval-augmented generation (RAG) answering across permission boundaries, so Chapter 9's access rules must also hold inside the corpus. *Exfiltration* leaves through the model's output or its tool calls; the Open Worldwide Application Security Project (OWASP) Top 10 for Large Language Model (LLM) Applications calls these risks excessive agency and sensitive-information disclosure. One rule covers all three: treat the model as an untrusted execution environment fed by untrusted input, which means we sandbox its tools, scope its retrieval, and filter its output. A model is a gifted and suggestible colleague, and we should give it exactly the keys we would give such a colleague on their first day.

**Compliance as architecture.** Several compliance requirements are architecture decisions in legal clothing. Audit trails come from the event ledger. Data residency pins EU fans' personal data to EU regions whatever country the show is in, which is a shard-placement decision on Chapter 4's partitioning, now carrying legal weight. Retention becomes lifecycle policy in the platform. Least-privilege evidence is generated from Section 10.2's policies instead of being assembled by hand in spreadsheets. Audit preparation then means running reports instead of collecting screenshots for weeks.

Frameworks such as SOC 2 (System and Organization Controls) and ISO 27001 ask for more than evidence: ISO 27001 requires a managed risk process, and a SOC 2 Type I report checks only the design of controls. Their heaviest recurring demand on the architecture, though, is proof that the controls actually ran, and that is an evidence-automation problem. Access reviews come from Section 10.2's policies, change history from the deployment repository's log (Chapter 11's GitOps practice), and incident records from the postmortem archive. Because the paved road logs by construction, its controls produce their own evidence. A control that leaves no record will, sooner or later, be indistinguishable from a control that never existed.

Regulated data classes (health, payments, minors' data) draw boundaries much as Chapter 3's shifts in language do. Where the regulation changes, a boundary usually belongs, so that constrained data and its audits stay inside the smallest possible blast radius.

**Recap.** We isolate by data classification now, and choose among silo, pool, and bridge once there are tenants, keeping scoping predicates in one central place. We sandbox anything that runs code or actions from outside, models included. We generate compliance evidence from policies, deployment logs, and postmortems.

**Exercise 10.4.** For one pooled store you operate, find where the tenant or user scoping predicate lives and count the code paths that must remember it. Design the version where one layer remembers for everyone.

### 10.5 Security as a Platform Capability

Nine teams, each with a product to build, cannot each master Sections 10.1–10.4, and a memo enforces nothing. Security scales the way Chapter 5's other fleet concerns scale, through the **paved road**:

- **Golden-path templates** that start with mTLS, workload identity, scoped credentials, and hardened base images.
- **Policy as code** at admission and in continuous integration (CI): "no public buckets," "unsigned images don't run," "every endpoint declares its authorization rule."
- **Security fitness functions**: dependency and secret scans, per-endpoint authorization tests, and a chaos-style drill that tests the security boundary alongside Chapter 4's circuit breaker.
- **A priced exception path.** Teams may leave the road, but the exception is logged, owned, and costs them something, as in Chapter 5's governance.

Saltzer and Schroeder, among their 1975 principles, included one they called *psychological acceptability*: protection mechanisms must be easy enough to use that people apply them routinely and correctly. The paved road is its modern form. City planners know that people walk where the path is convenient whatever the signs say, and the wise ones pave the paths people already take. A security architecture that people must remember to obey will be obeyed on good days.

The security team's role changes accordingly. It stops approving every change, a role that made teams expert at getting past it, and builds the road and investigates the exceptions. The measure of success is whether the secure way has also become the easiest one, and the honest test is what a team does when it ships at 5 p.m. on a Friday.

**Recap.** Paved-road templates, admission-time policy, and security fitness functions make the secure path the default, Saltzer and Schroeder's psychological acceptability in modern dress. The security team builds the road and audits the exceptions instead of gating every change.

**Exercise 10.5.** Name the last security requirement your organization delivered by memo. Sketch its paved-road version: a template default, a policy check, and a priced exception path.

### Kata: The Threat Model

> **Your brief: "Remedy."** A telehealth platform: video consultations, e-prescriptions, lab results. Actors: patients (mobile), clinicians (web), pharmacy partners (API), one insurance integration (SFTP, because insurance). Data: health records (regulated, seven-year retention), prescriptions (regulated, fraud-attractive), video (ephemeral by promise). The team: 25 engineers running one pooled multi-tenant deployment for 60 clinic groups on one production cluster. A recent penetration test found long-lived database credentials in three services, no service-to-service authorization, and a webhook endpoint that accepts unauthenticated pharmacy callbacks "temporarily, since 2023."

**Deliverables:**

1. **Boundary diagram** — C4 context and container diagrams with trust boundaries and data classifications marked.
2. **Threat model** — STRIDE table for the two crown jewels: e-prescription issuance and lab-result delivery.
3. **Zero-trust migration plan** — workload identity, mTLS, and call policies sequenced across a live system, with the three penetration-test findings remediated *architecturally*.
4. **Isolation verdict** — silo, pool, or bridge per data class, with the video-ephemerality promise made enforceable.
5. **Two security ADRs** — the webhook redesign and the residency and retention architecture, each stating plainly what it gives up.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Boundary literacy | Do the diagrams show where trust changes, or just where boxes sit? |
| Threat coverage | Does every STRIDE row name a design answer, or only a threat? |
| Architectural remediation | Do fixes remove classes of bugs, or instances? |
| Enforceable promises | Is "video is ephemeral" a mechanism with a deletion path and evidence, or a sentence in the privacy policy? |
| Least-privilege evidence | Could the auditor's access question be answered from policy, today? |
| Paved-road thinking | Will the 26th engineer be secure by default, or by onboarding lecture? |

#### Where you now stand

Security is now a designed property of Encore, with drawings, policies, and tests of its own. Still undrawn is the ground all of it runs on: clusters, functions, pipelines, and pagers, and the cost of keeping them running at 3 a.m. and within budget. Chapter 11 turns to cloud-native operations, where architecture meets the invoice and the on-call rotation.

### References

- Scott Rose, Oliver Borchert, Stu Mitchell, Sean Connelly — [*NIST SP 800-207: Zero Trust Architecture*](https://csrc.nist.gov/pubs/sp/800/207/final). NIST, 2020 — free online.
- OWASP GenAI Security Project — [*OWASP Top 10 for LLM Applications*](https://genai.owasp.org/llm-top-10/). OWASP, 2025 — free online.
- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Razi Rais, Christina Morillo, Evan Gilman, Doug Barth — [*Zero Trust Networks*, 2nd ed.](https://www.oreilly.com/library/view/zero-trust-networks/9781492096580/) O'Reilly, 2024.
- Daniel Feldman, Emily Fox, Evan Gilman, et al. — [*Solving the Bottom Turtle: A SPIFFE Way to Establish Trust in Your Infrastructure via Universal Identity*](https://spiffe.io/book/). SPIFFE project, 2020 — free online.
- OpenSSF — [*SLSA: Supply-chain Levels for Software Artifacts*, v1.0](https://slsa.dev/spec/v1.0/). OpenSSF, 2023 — free online.
- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- OWASP API Security Project — [*OWASP API Security Top 10*](https://owasp.org/API-Security/). OWASP, 2023 — free online.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Ross Anderson — [*Security Engineering*, 3rd ed.](https://www.cl.cam.ac.uk/~rja14/book.html) Wiley, 2020 — chapters free online.
- Heather Adkins, Betsy Beyer, et al. — [*Building Secure and Reliable Systems*](https://sre.google/books/). O'Reilly/Google, 2020 — free online.
- Tanya Janca — [*Alice and Bob Learn Application Security*](https://www.wiley.com/en-us/Alice+and+Bob+Learn+Application+Security-p-9781119687405). Wiley, 2020.
- Adam Shostack — [*Threat Modeling: Designing for Security*](https://www.wiley.com/en-us/Threat+Modeling:+Designing+for+Security-p-9781118809990). Wiley, 2014.

---

## Chapter 11: Cloud-Native Operations — Serverless, Kubernetes, and SRE {#ch11}

> Architecture that cannot be operated is fiction with diagrams.


Every chapter so far has stopped at the point where, for someone else, the real work begins. The system we designed must now run: at 3 a.m., in the middle of an on-sale, within a budget that someone has to sign. In this chapter that someone is you. Operations is not what happens after architecture; it is architecture's feedback loop, the place where the trade-offs we drew as tables in earlier chapters come back to us as invoices and pages.

Three questions follow: where each workload should run, how change reaches production safely, and how we know the system works, which brings in site reliability engineering (SRE) and cost. Encore supplies the examples, including one bill that nobody enjoyed reading.

I spent years as a platform tech lead in a large bank, moving a platform with over a million users toward the cloud. The migrations that worked were never lift-and-shift. Each cloud version had to solve a problem the on-premises version could not, or it had no reason to exist. Asking what the new runtime actually fixes told us more than any capacity spreadsheet.

### 11.1 Cloud Execution Models

#### Execution models and what you still operate {#the-spectrum-priced-in-responsibility}

Execution models differ mainly in one currency: how much undifferentiated machinery you still own. By *undifferentiated* I mean work that must be done well for the system to run but that no customer will ever choose Encore for doing well, such as patching an operating system or upgrading a cluster.

| Model | You own | You've shed | Fits |
|---|---|---|---|
| Virtual machines (VMs) | OS up | hardware | legacy, special kernels |
| Containers on Kubernetes | images, manifests, cluster policy | machines, scheduling | steady services, rich ecosystems |
| Serverless containers, autopilot Kubernetes (Cloud Run, Fargate, GKE Autopilot, EKS Auto Mode) | images, service config | nodes, cluster upgrades, most scaling | container workloads without a platform team |
| Serverless functions | code + configuration | servers, scaling, idle cost | spiky, event-shaped work |
| Managed services (queues, databases, gateways) | configuration | the entire service | everything that isn't your differentiator |

*Figure 11.1 — The responsibility spectrum. Read the default bottom-up: managed services first, functions for spiky work, containers for steady work (on a managed runtime before a self-run cluster), VMs only when nothing else fits. Differentiation breaks ties, as in Chapter 3's subdomain table: core subdomains get your operational attention, generic ones a managed service.*

The table hides an old idea. In 1961 John McCarthy suggested that computing might one day be organized as a public utility, sold by the unit like water or electricity, and the time-sharing systems of that decade were a first step toward it. MIT's Compatible Time-Sharing System let many users share one expensive machine while each believed, more or less, that it was theirs, and Multics later set out to be exactly such a utility. The bottom rows of Figure 11.1 are that idea made ordinary. The analogy with a city's water supply teaches something real: nobody digs a well when the main is reliable, and nobody should run their own message broker when a managed queue will do. It breaks because water is identical from every tap, whereas each managed service has its own limits, failure modes and pricing quirks, and those become part of your architecture whether you read the fine print or not.

Kubernetes is best understood as a declarative reconciliation engine: you state the desired state, and it converges reality toward it, as a thermostat holds a room at a set temperature without being told how. Kubernetes descends from Borg, Google's internal cluster manager, and the model (more than any particular YAML) is why it won: self-healing, bin-packing and a large ecosystem of extensions all follow from the loop. Its price is a platform's worth of complexity that someone must own, and for most product teams that complexity is accidental in Brooks's sense from Chapter 1, since it is no part of selling tickets. Self-managed Kubernetes without a platform team is a hobby with an on-call rotation. The managed middle row removes most of that work, so it is the sensible start for most teams in 2026.

Serverless functions invert the cost curve: zero idle spend, fast scale-out and billing per invocation. The fine print covers cold starts, execution time limits, statelessness and scaling that is fast but finite. AWS Lambda, for example, adds about 1,000 concurrent executions per function every 10 seconds, within an account-wide quota.

The architect's job is to match curves to workloads. Encore's Catalog is steady and latency-sensitive, so it runs in containers. The Sale Gate idles between on-sales and then takes 500× its normal load for minutes, so its stateless admission edge suits serverless, with queue positions held in a managed store. The ramp must still fit the scaling limits, and cold starts arrive at the worst moment, so Encore pre-warms capacity (provisioned concurrency, which is idle spend again) before each scheduled on-sale. That still costs less than keeping the spike's capacity in always-on containers through every quiet day.

**Recap.** We own as little as we can: managed services for generic work, functions for spiky work, containers for steady work. Kubernetes is a reconciliation model that repays its complexity only when a platform team owns it, and serverless is a cost curve that comes with scaling limits and cold starts. The choice is made per workload, by the shape of its traffic.

**Exercise 11.1.** Take three workloads you know. For each, note its traffic shape (steady, spiky or scheduled), latency tolerance and the Figure 11.1 row it should occupy. Record any mismatch and its monthly cost in idle capacity or operations effort.

### 11.2 Delivery Infrastructure

#### Infrastructure as code and GitOps {#the-environment-is-code-and-git-is-the-control-plane}

The first discipline is **infrastructure as code** (IaC): every cluster, queue and permission is declared in versioned files, so it can be reviewed before it changes, diffed while it changes and rebuilt after a disaster. In this discipline the console is for looking, never for changing. That sounds pedantic until a console fix at 2 a.m. saves the night, goes unrecorded and leaves behind a snowflake environment, one that exists nowhere but in the running system and causes trouble for the rest of the quarter. A building whose wiring no longer matches its drawings is safe until the day an electrician trusts the drawings, and an environment that no longer matches its code fails in the same way.

The second discipline, **GitOps**, closes the loop. Agents continuously reconcile the running cluster to what the repository declares, which is the Kubernetes idea from Section 11.1 applied one level up. Git thereby becomes three things at once: the deployment mechanism, the audit log and, through an ordinary `git revert`, the rollback for configuration and stateless services. Schema migrations and data changes are the exception, because revert cannot undo them, so they ship as expand-then-contract steps that are safe to leave in place. Drift stops being folklore and becomes a diff anyone can read.

On this base, Chapter 5's progressive delivery becomes automatic. Canaries are promoted when their service level indicators (SLIs) match the baseline's, and Section 11.3's error budget sets how much risk rollouts may take. Feature flags separate deploying code from releasing behavior. Preview environments per pull request end both "works on my machine" and the queue for shared staging.

The **DevOps Research and Assessment (DORA) metrics** score the result. *Accelerate* introduced four: deployment frequency, lead time, change-failure rate and time-to-restore. DORA has since renamed the last *failed deployment recovery time*, added *deployment rework rate*, and grouped the five into throughput and instability. They measure the delivery system as a whole, not the virtue of any one team, and DORA's research links them to organizational performance.

Encore's dashboard shows them per service, and a creeping lead time is read as architectural feedback. When a change that shipped in a day takes a week, the engineers have rarely grown slower; more often coupling has crept back, or tests have slowed. Operational symptoms are often architectural causes seen from a distance.

**Recap.** IaC makes environments reproducible, and GitOps makes git the control plane and `git revert` the rollback, for everything except data. Preview environments replace the queue for shared staging, and canaries answer to their baseline and the error budget. DORA metrics score the delivery system and flag architectural problems early.

**Exercise 11.2.** Measure your DORA metrics for last month, however roughly. Which is worst, and is its cause operational (pipeline, approvals) or architectural (coupling, test depth)?

### 11.3 Observability and SRE

#### Observability signals, SLOs, and incidents {#from-is-it-up-to-why-is-it-weird}

Chapter 5 installed the instruments: logs, metrics, traces and correlation IDs. In 2026 the default way to emit them is **OpenTelemetry**, the vendor-neutral standard that lets Encore instrument its services once and change backends without touching service code. This is Parnas's information hiding from Chapter 1 applied to telemetry: the backend is a decision likely to change, so the instrumentation hides it.

Site reliability engineering, the practice Google began building in 2003, turns signals into decisions through a short chain of definitions. A **service level indicator (SLI)** is a measurement of what users experience, expressed as a ratio of good events to all events: "the share of seat-map requests served in ≤ 800 ms." A **service level objective (SLO)** is the promise made about that ratio over a window: "99.9% over a rolling 28 days." The **error budget** is the complement of the promise, here 0.1%, which is about 1 slow or failed request in 1,000, or roughly 40 minutes of full-outage equivalent per 28 days.

The budget is the clever part. Product and operations teams have always argued about whether to ship faster or to stabilize, and the argument was usually won by seniority or stamina. The error budget settles it by policy instead:

{% include diagrams/fig-11-2.svg %}

*Figure 11.2 — The error budget as automatic policy. The budget, not a meeting, decides whether to ship, so product and reliability turn one shared dial instead of arguing.*

An error budget is a reliability target that admits its own imperfection, which is what makes it useful. A target of 100% forbids every change, since every change carries risk; 99.9% grants a measured allowance of failure to spend on progress.

Alerting follows the same logic. We page on *symptoms*, such as an SLO burn rate showing that users are affected, and only rarely on causes, such as high CPU, which may be fine. The exceptions are causes that make harm imminent and certain: a disk filling within hours, a certificate about to expire, a failed backup. Everything else goes on a dashboard for business hours. A smoke detector that sounds for every warm oven is soon unplugged. A rotation paged only when users are affected, with a runbook for each alert, is sustainable. One paged on causes burns out the engineers who instrumented the most, a cruel reward for diligence.

When things break anyway **blameless postmortems** feed back into the architecture. Aviation learned long ago that punishing pilots teaches people to hide mistakes, and software has borrowed the lesson. Encore's retry-storm outage (Chapter 4) produced retry budgets in the mesh defaults and a Chapter 1-style fitness function, so the next storm is prevented without asking anyone to be more careful. An incident is tuition the system has already paid, and the postmortem is how we collect the education.

AI assistants now correlate alerts, summarize traces, draft timelines and suggest the matching runbook step. We should treat them as Chapter 12 will treat any agent: read access by default, and a human approving any action that changes production.

**Recap.** SLIs measure what users experience, SLOs set the target, and the error budget turns the old argument between speed and stability into policy. We page on symptoms, with a runbook for each page, and keep causes on dashboards. Postmortems are worth holding only if they end in architectural changes.

**Exercise 11.3.** Write the SLI, SLO and error budget for your product's most user-visible operation. Then count last month's alerts: how many fired on symptoms, and how many on causes?

### 11.4 Cost, Capacity, and Sustainability

#### Cost as telemetry {#the-invoice-is-a-telemetry-stream}

In the cloud every architectural decision is billed monthly, so cost is an operational signal and not merely an accounting afterthought. FinOps (the practice of managing cloud spend) gives architects three moves.

**Unit economics.** Raw spend is noise, because it rises with success as readily as with waste; spend per business unit is signal. Encore tracks *cost per ticket sold*. When it drifts from €0.11 to €0.19, something architectural has happened (a chatty new service, an unindexed query, logging grown verbose), and the graph shows it before the CFO asks. Two line items deserve standing suspicion. Egress is priced per byte leaving, so a chatty cross-region design pays repeatedly to move its own data. Log and trace volume is often one of the larger items on the bill, so sampling and retention are design decisions with a price.

**Cost as a fitness function.** Give each service a budget, estimate the cost of infrastructure diffs at continuous integration (CI) time and alert on drift. This is the book's usual governance pattern, measured in currency, and it moves the conversation about cost from month's end to the pull request, while the decision is still cheap to change.

**Capacity planning.** Autoscaling is a mechanism. The strategy is knowing your ceilings (the order service's thread pool from Chapter 4), load-testing up to them and pre-scaling for the spikes you can foresee. Encore schedules its on-sales, so operations warms the pools in advance. A city adds trains by reading the fixture list, not by waiting for the stadium crowd.

With per-invocation pricing the cost curve is the traffic curve, which suits the Gate's spikes and punishes any busy, always-on workload, where the same arithmetic runs in reverse. Encore's bill made this concrete. A metrics forwarder ran as a function invoked once per datapoint, about 2,000 times a second, around the clock: roughly 5 billion invocations a month. At list prices, request fees plus 100 ms of 1 GB compute per call came to about €9,000 a month for work that never idled. Moved to two small always-on containers that batch the datapoints, it costs a few hundred euros. Nobody had been foolish; the function was the obvious tool when the forwarder was small, and the traffic grew past the shape it was priced for. Serverless fits idle-heavy or spike-shaped work, and containers fit busy, steady work. The choice between them is arithmetic, and arithmetic has no loyalties.

Sustainability mostly follows from efficiency. Right-sizing, spot capacity for interruptible work and region choice where latency permits lower the carbon and the bill together, one of the rare cases where virtue and economy point the same way.

**Recap.** We track cost per business unit, alert on drift and estimate cost at review time, as we would any other characteristic. Autoscaling needs known ceilings and a calendar. The choice between serverless and containers is arithmetic on traffic shape, and sustainability mostly comes with efficiency.

**Exercise 11.4.** Define your product's unit cost (per order, per user-day or per API call). Compute it over two months of data. Which architectural event explains the biggest swing?

### 11.5 Operability by Design

Werner Vogels, describing Amazon's practice in a 2006 interview, summed it up as "you build it, you run it"; the corollary for architects is that operability is decided at design time, like availability or security.

**Production readiness** is a checklist every service answers before its first deploy: SLOs declared, runbooks written, scaling ceilings known, dashboards wired, a cost budget set, and a backup *restore* tested. A backup never restored is a hope with storage costs. The checklist is the operational counterpart of Chapter 1's shortlist of driving characteristics.

**Testing in the cloud.** Local fidelity has limits, especially for serverless, whose quotas and managed neighbors no laptop reproduces. Contract tests cover the managed services, ephemeral environments handle integration, and Section 11.2's canaries are the final check, against real traffic.

**Lifecycle maintenance.** Runtimes, base images and dependencies go stale, and they age like fruit, not wine. Lehman's laws of software evolution, which Chapter 13 takes up, predict as much. Upgrades are scheduled work, owned like features; Chapter 15's platform automation will make them routine.

#### Surviving a regional outage {#surviving-a-region}

Two numbers turn disaster recovery (DR) from a document into architecture. The **recovery time objective (RTO)** is how long the business can tolerate before service returns; the **recovery point objective (RPO)** is how much recently written data it can tolerate losing. They are Chapter 1 characteristics with a price attached, and each order of magnitude tighter multiplies that price.

Encore's Catalog can be down for an hour and lose its last few minutes of edits. The seat ledger can be down only for minutes and must lose *nothing*, because a lost write there is a seat sold twice or a fan charged for nothing. The tightest constraint sizes the strategy, as a bridge is designed for its heaviest load and not for Tuesday's traffic.

Chapter 4's consistency trade-offs price the two strategies. **Active–passive** (one region serves, a replica follows) is simpler and cheaper; with asynchronous replication its RPO is the replication lag, and failover is a rehearsed promotion of the replica. **Active–active** (both regions serve) buys an RTO of seconds, but cross-region writes are then either slow (synchronous) or conflicted (asynchronous), a choice imposed by the speed of light and the possibility of partition. Encore therefore runs active–active for reads and *pins each event's writes to a home region*, applying Chapter 4's partition keys to geography.

For the seat ledger's zero RPO, each write commits synchronously to a second copy before it is acknowledged, across zones in the home region and to a standby in a second region, so every seat write pays one cross-region round trip. When a home region fails, that event's writes pause until the standby is promoted, which is where the ledger spends its minutes of RTO.

**Data residency** adds a legal constraint. EU law restricts transfers of personal data out of the European Economic Area (EEA), and contracts or sector rules often require in-EU storage outright. That puts a context boundary along regulators' lines; some of the most durable boundaries in a system are drawn by lawyers.

**Game days**, deliberate failovers on a quiet day, are the fitness function for DR, because a failover you have never run is a guess. A game day cannot prove that recovery will work, but it reliably shows where it will not, which is the next best thing. Encore drills quarterly, and the drill that went badly taught more than the three that went well.

The thesis of the chapter fits in one line: *operability is a property you design, then verify with fitness functions, like every other characteristic since Chapter 1.* Golden pipelines, SLO tooling, cost dashboards and readiness checks should become a product every team gets for free, which is Chapter 15's subject.

**Recap.** Readiness is a checklist answered before the first deploy, and it includes a restore that has actually been tested. Canaries check what local tests cannot, and upgrades are owned work. RTO and RPO size the DR strategy, the tightest constraint governs it, and only game days prove it.

**Exercise 11.5.** Run the readiness checklist against a service you own today. Each "no" is either this sprint's work or an accepted risk; write down which.

### Kata: The Locker Network

> **Your brief: "Relay."** A parcel-locker network: 40,000 lockers across three countries, each reporting opens, deposits and alarms over flaky cellular, plus a courier app, a consumer pickup app and carrier integrations. Traffic is a steady trickle from lockers, with evening pickup peaks and 20× load in Black Friday week. Lockers batch-retry after connectivity gaps, so when a regional cellular outage ends, 3,000 lockers reconnect *at once*. Relay has 18 engineers, on-call complaints in two countries, and a cloud bill growing 8% a month while revenue grows 3%.

**Deliverables:**

1. **Execution-model map** — Figure 11.1 rows for locker ingestion, courier and consumer APIs, carrier batch jobs and alarm processing, with the reconnection-storm design named explicitly.
2. **Delivery design** — GitOps layout, the preview-environment approach, and the canary policy for firmware-adjacent services where rollback is slow.
3. **SRE pack** — SLI, SLO and error budget for pickup availability; the symptom alert set; the runbook skeleton for "regional cellular outage."
4. **Cost intervention** — Relay's unit cost, three hypotheses for the gap between 8% and 3% growth, and the telemetry that would confirm each.
5. **One architecture decision record (ADR)** — the buffer-and-shed design for the reconnection storm, with its losses in ink.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Shape matching | Does each workload's execution model match its traffic shape, with arithmetic? |
| Storm authorship | Is the 3,000-locker reconnection designed for, or discovered annually? |
| Budget governance | Does the error budget, not a manager, decide when firmware canaries promote? |
| Unit economics | Is the cost divergence diagnosed with a business denominator, or hand-waving? |
| Slow-rollback delivery | Do firmware-adjacent services get a canary policy that assumes rollback takes days, and do preview environments work without real lockers? |
| Losses in ink | Does the ADR say which locker events may be delayed or dropped during the storm, and for how long? |

#### Where you now stand

You can now place workloads on the responsibility spectrum, automate delivery, set reliability targets with arithmetic and read the invoice as telemetry. Chapter 12 turns to systems whose central component is *probabilistic*. There "correct" becomes a distribution, testing becomes evaluation, and natural-language input opens a new class of security risk.

### References

- Charity Majors, Liz Fong-Jones, George Miranda — [*Observability Engineering*, 2nd ed.](https://www.oreilly.com/library/view/observability-engineering-2nd/9781098179915/). O'Reilly, 2026.
- Kief Morris — [*Infrastructure as Code*, 3rd ed.](https://www.oreilly.com/library/view/infrastructure-as-code/9781098150341/). O'Reilly, 2025.
- Sheen Brisals, Luke Hedger — [*Serverless Development on AWS*](https://www.oreilly.com/library/view/serverless-development-on/9781098141929/). O'Reilly, 2024.
- Brendan Burns — [*Designing Distributed Systems*, 2nd ed.](https://www.oreilly.com/library/view/designing-distributed-systems/9781098156343/). O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- J.R. Storment, Mike Fuller — [*Cloud FinOps*, 2nd ed.](https://www.oreilly.com/library/view/cloud-finops-2nd/9781492098348/). O'Reilly, 2023.
- Brendan Burns, Joe Beda, Kelsey Hightower, Lachlan Evenson — [*Kubernetes: Up and Running*, 3rd ed.](https://www.oreilly.com/library/view/kubernetes-up-and/9781098110192/). O'Reilly, 2022.
- Christian Ciceri, Dave Farley, et al. — [*Software Architecture Metrics*](https://www.oreilly.com/library/view/software-architecture-metrics/9781098112226/). O'Reilly, 2022.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — [*The DevOps Handbook*, 2nd ed.](https://itrevolution.com/product/the-devops-handbook-second-edition/). IT Revolution, 2021.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/). O'Reilly, 2021.
- Brendan Gregg — [*Systems Performance*, 2nd ed.](https://www.brendangregg.com/systems-performance-2nd-edition-book.html). Addison-Wesley, 2020.
- Alex Hidalgo — [*Implementing Service Level Objectives*](https://www.oreilly.com/library/view/implementing-service-level/9781492076803/). O'Reilly, 2020.
- Betsy Beyer, Niall Richard Murphy, David K. Rensin, Kent Kawahara, Stephen Thorne (eds.) — [*The Site Reliability Workbook*](https://sre.google/workbook/table-of-contents/). O'Reilly/Google, 2018 — free online.
- Nicole Forsgren, Jez Humble, Gene Kim — [*Accelerate*](https://itrevolution.com/product/accelerate/). IT Revolution, 2018.
- Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy (eds.) — [*Site Reliability Engineering*](https://sre.google/sre-book/table-of-contents/). O'Reilly/Google, 2016 — free online.
- Gene Kim, Kevin Behr, George Spafford — [*The Phoenix Project*](https://itrevolution.com/product/the-phoenix-project/). IT Revolution, 2013.

---

## Chapter 12: Architecting AI Systems — LLMs, RAG, and Agents {#ch12}

> The model is the least important part of your AI system, and the only part everyone talks about.


The first 11 chapters share one quiet assumption: components are deterministic. Call Inventory twice with the same input and you get the same answer. A model-backed component breaks that assumption by design. It is usually right and never guaranteed, so three familiar disciplines shift: testing becomes evaluation, latency becomes a matter of tokens, and security must contend with instructions hidden in plain language. Everything else carries over, and that is the argument of this chapter. An AI system is an ordinary distributed system with one extraordinary component, and those who succeed with it bring the first 11 chapters along.

In Brooks's terms from Chapter 1, the model removes much accidental complexity (nobody hand-writes a parser for free-form refund requests any more), but its behavior is a distribution rather than a function, a new complexity we must contain before it leaks into the rest of the system.

Encore has three AI ambitions: demand forecasting for organizers (classic machine learning, ML), a support assistant that knows Encore's policies and the fan's actual order (retrieval-augmented generation, RAG), and an agent that rebooks tickets or processes refunds within policy. The treatment is vendor-neutral. Models change monthly, and the architecture around them is what Encore will still own in five years.

### 12.1 AI in the System Topology

#### Models as probabilistic components {#a-component-with-a-probabilistic-contract}

On the C4 diagram the model is a component like any other, and we read its contract honestly: unbounded natural-language input, likely but unguaranteed output, latency in seconds that grows with tokens, and cost per token, so one call can cost 100× another. Each clause bends an old rule. Probabilistic output needs validation and fallbacks (Section 12.4). Token latency needs streaming, as Chapter 8 predicted. Token pricing makes caching and routing economic decisions (Section 12.5).

Such a component behaves less like a library than like a gifted consultant who has read everything, never says "I don't know," and bills by the word. We would not send their memo to customers unread, yet we would hire them. The architecture is the set of arrangements that lets us use the talent while containing the confidence.

Integration matures in three steps. **Direct calls** to a provider's software development kit (SDK) work for one feature, and then keys, versions and costs scatter. **The AI gateway** is one internal service that owns provider credentials, model routing, caching, rate limits, cost attribution and audit. Encore adopts it the week it has a second AI feature, because cross-cutting concerns centralize (Chapter 7). **The router** adds capability tiers: cheap, fast models for classification and extraction, and frontier models for the hard minority. Most of Encore's workloads were cheap-tier problems paying frontier-tier prices.

The gateway never holds prompts, because prompts are business logic, and we have seen this film before, in the enterprise service buses of Chapter 2. Chapter 6's maxim holds: smart endpoints and dumb pipes. The AI gateway is a pipe; the day it decides what the support assistant should say, it becomes a bus again.

Classic ML keeps its place. Forecasting, ranking and fraud scoring stay with trained models, fed by Chapter 9's data products, with versions and lineage in a model registry. Their named hazard is *online/offline skew*: a feature computed overnight in the warehouse drifts from the "same" feature computed at request time, because one idea was implemented twice. The fix is one definition served at two speeds, through a feature store or shared transformation code. This is Parnas's criterion from Chapter 1 in another costume: a decision likely to change should live in exactly one place.

**Recap.** The model is a component with an unusual contract, and the architecture around it exists to honor that contract. Provider concerns gather in a gateway that routes by capability tier and, unlike the service bus before it, holds no prompts. Classic ML keeps one definition of each feature, used both offline and online.

**Exercise 12.1.** For an AI feature you know, or Encore's support assistant, write its contract the way Chapter 7 would: inputs, outputs, latency, cost per call and the three failure modes a caller must handle.

### 12.2 Retrieval-Augmented Generation

#### Grounding as a data pipeline {#grounding-is-a-data-pipeline-not-a-prompt-trick}

A general-purpose model knows its training data's past and nothing about Encore's refund policy or order #881. RAG retrieves relevant private context and places it in the prompt, so its quality is decided in a data pipeline long before the model sees a token:

{% include diagrams/fig-12-1.svg %}

*Figure 12.1 — The RAG pipeline. Quality is decided at the highlighted stages: hybrid (vector and keyword) retrieval, because embeddings miss exact codes and names that keyword search catches; and reranking, because the cheap first pass optimizes recall and the reranker adds precision. The model only phrases what retrieval found.*

Think of the model as an eloquent speaker and retrieval as the librarian who prepares the notes. An orator handed the wrong file delivers a polished, confident and wrong address. But a librarian also knows which stacks are closed to which readers, and the model knows nothing of the kind: whatever is in the notes, it will use. The analogy breaks precisely where the danger lies.

In agentic retrieval the same pipeline runs as a tool that an agent calls repeatedly, reformulating as it goes. The rules below still hold, because every call hits the same governed, permission-filtered index.

Two commitments separate production RAG from a demo. First, **the corpus is a data product** in Chapter 9's sense: owned, contracted, lineage-tracked and held to a freshness service-level objective (SLO). When Encore's refund policy changes, a pipeline subscribed to the policy product re-ingests it within the hour without anyone having to remember. Second, **permissions survive retrieval**:

> **The retrieval-leakage trap.** An index built from documents with access rules, queried without them, answers anyone's question with everyone's data: the support assistant quotes another fan's order. Filtering must be structural, with permission metadata on every chunk and filters inside the retrieval query, never left to the model. The model has no discretion; it has probabilities. Chapter 10 predicted this.

Grounding has three competing mechanisms, and the choice deserves a table rather than a fashion:

| | RAG | Fine-tuning | Long context |
|---|---|---|---|
| Knowledge freshness | minutes (re-ingest) | stale at training time | fresh per request |
| Citations | native | none | supported by some providers |
| Per-user permissions | enforced in retrieval | permission-blind | must filter what you stuff |
| Unit cost | pipeline + small prompts | training runs + hosting | tokens × every request; cached-prefix pricing cuts repeat cost sharply |
| Right for | facts that change and must be attributed | style, format, domain voice | small stable corpora, one-off analysis |

RAG is Encore's default for facts, and fine-tuning is reserved for tone. Facts absorbed in training are frozen and blind to who is asking, the worst combination for a changing refund policy and an order history that belongs to one fan. Long context is a genuine convenience, but it scales poorly with corpus size and per-user permissions, even with caching. Retrieve for truth; tune for tone.

**Recap.** RAG is a data pipeline with a model at the end, and the model is only as good as its notes. Hybrid retrieval and reranking decide quality, the corpus is an owned data product, and the retrieval query, not the model, enforces permissions. Encore fine-tunes only for tone.

**Exercise 12.2.** Design the corpus for Encore's support assistant: the three data products that feed it, the freshness SLO of each, and the permission metadata a chunk of order history must carry.

### 12.3 Agentic Architectures

#### The agent loop {#the-loop-that-acts}

An agent is a model in a loop with tools: observe, decide, call a tool, read the result, repeat. In Chapter 6's terms that is orchestration, with one alarming novelty: a probabilistic component chooses the workflow at runtime. Each element therefore needs a limit, and each turns out to have an ancestor we already know how to discipline:

| Agent element | Its Chapter 1–11 ancestor | The AI-era twist |
|---|---|---|
| Tools | APIs with contracts (Chapter 7) | described in language; *the description is the interface* |
| Loop control | workflow engine (Chapter 6) | steps are proposed at runtime, so bound them |
| State/memory | context + stores | the context window is a budget; curate it instead of letting it accumulate |
| Failure containment | timeouts, budgets (Chapter 4) | step caps, token budgets, spend ceilings |
| Authority | authorization (Chapter 10) | *a delegated, down-scoped credential naming both the agent and the fan it acts for; never the user's full token, never a blanket service account* |

*Figure 12.2 — Agents as distributed systems with a probabilistic scheduler: each row pairs an agent element with the older discipline it descends from and the new clause it adds. Teams that skip the middle column tend to rediscover it in incident reviews.*

A jazz soloist chooses each note in the moment, yet the performance holds because the chord changes and form are fixed in advance and shared by the band. The agent's tools, budgets and authority are that form. The analogy stops comforting us at one point: a soloist who wanders off the changes produces an awkward bar, whereas an agent that wanders off its policy produces a refund, and refunds do not resolve back to the tonic.

Tool interfaces now have a standard. The **Model Context Protocol (MCP)** defines how agents discover, read and call tools, and agent-to-agent protocols such as Agent2Agent (A2A) do the same between agents. Encore exposes its scoped APIs as an internal MCP server behind the AI gateway. Third-party MCP servers are supply-chain dependencies (Chapter 10): pin and review them, and treat their tool descriptions as untrusted input, since a poisoned description is a prompt injection that ships with the tool. Thompson's warning from Chapter 10 applies with new force: a tool description is code of a peculiarly persuasive kind, because the model reads it as instruction.

Encore's rebooking agent is designed by the table. Its tools are the existing APIs, `holds:write` and `refunds:request`, so Chapter 7's scopes become its permission vocabulary. OAuth token exchange, defined in Request for Comments (RFC) 8693, gives it a short-lived token for this fan's orders only, so a confused or manipulated agent cannot touch anyone else's. Its loop runs inside a workflow engine with step and token budgets.

The agent's authority follows one bright line: it reads freely, writes within policy, and sends anything beyond policy to a human. It never decides refund policy itself. `refunds:request` starts Chapter 6's refund workflow (Figure 6.3), which auto-approves under €80 with more than 48 hours to showtime and routes everything else to Review. There the agent's request arrives as a proposal with evidence, ready for one-click approval, and Chapter 8's human-in-the-loop affordances become load-bearing. I have come to believe that an agent's authority should be no larger than the worst outcome we would be willing to explain to the customer it affected.

Sandboxing (Chapter 10) applies in full. An agent is untrusted execution steered by untrusted input, so its tools run least-privileged, its network egress is scoped, and instructions injected into a fan's message hit the same wall as any attacker's.

Multi-agent topologies, such as a planner with executors or a pool of specialists, follow microservice logic: split when one context degrades from too many tools or mixed concerns, and not before. Agents obey the arithmetic of Brooks's communication paths from Chapter 5, and every handoff is a place where context is lost or misread. A fleet of agents without boundaries is event spaghetti that bills by the token.

**Recap.** Agents are orchestration whose steps are chosen at runtime, so they need workflow engines, budgets and tool contracts written as carefully as APIs. Authority is delegated, scoped to one fan, and bounded by a designed escalation to a human. Encore splits agents only for the reasons it would split services.

**Exercise 12.3.** Specify the rebooking agent's tool list: each tool's name, scope, read-or-write class and the policy line above which a write escalates to a human.

### 12.4 Quality, Safety, and Security

#### Evaluation and guardrails {#evaluation-is-the-new-testing}

Dijkstra remarked, around 1970, that testing can show the presence of bugs but never their absence. We have lived with that limit because a passing test at least passes every time; a probabilistic component removes even that comfort. Unit tests cannot establish confidence in it, and so it is *evaluated*, against a golden set of real cases on every release. Encore's set is 200 anonymized support conversations with known-good outcomes. We use exact checks wherever the facts allow (did the cited order exist, was the refund within policy) and model-graded rubrics where judgment is needed. A large language model (LLM) acting as judge is a measurement instrument, so we spot-audit it for calibration.

Civil engineers know this problem well. Concrete is a variable material, so nobody proves each batch; engineers test samples and accept the pour if the results fall within a statistical tolerance. Evaluation applies the same idea to language. The evals run in continuous integration (CI) like any fitness function: a prompt change, model upgrade or retrieval tweak that drops the score beyond a set tolerance fails the build. Because the component is nondeterministic, we run each case several times and gate on the confidence interval, or the gate turns flaky and is quietly ignored. Agents need one more layer, **trajectory evals**: did the agent call the right tools, in a sensible order and within budget, even when its final answer happened to be right? This habit separates teams that improve steadily from teams that lurch from demo to demo.

Runtime guardrails come in layers, none sufficient alone, much as a body defends itself with skin, then innate immunity, then the slower adaptive response. **Structured outputs**, validated against a schema like any API payload, are the cheapest and most reliable layer. **Input and output filtering** screens for injection inbound and for personally identifiable information (PII) and policy violations outbound. **Grounding checks** require answers to cite retrieved sources. An uncited claim degrades to "let me connect you with support," Chapter 8's designed apology.

Security keeps Chapter 10's frame. Prompt injection is untrusted input turned into instructions, and it arrives through retrieved documents and tool results as often as through the fan's own message. The long-distance telephone network of the 1960s and 1970s carried its control tones on the same line as the caller's voice, so anyone who could whistle the right tone could command the switch. SQL injection repeated the mistake by mixing code and data in one string. A language model has no separate channel for instructions at all, which is why injection today can be contained but not reliably prevented. Privilege separation through Section 12.3's scoped tools is the base layer. A guardrail that lives only in the system prompt is a polite request, and a request can be countermanded by the next paragraph the model reads.

Scopes still leave a gap: an injected request that stays inside policy, such as a €79 refund, passes every check. So every Encore flow breaks at least one leg of what Simon Willison calls the "lethal trifecta": private data, untrusted content and a channel to send data out. Chapter 10's STRIDE threat model is rerun over every AI feature, because information disclosure now includes the model summarizing what it should never have retrieved, which Section 12.2's structural filters prevent.

In production, dashboards track topic mix, escalation rate and sampled groundedness. **Model-call tracing** records what the model was shown, which chunks retrieval supplied, which tools it invoked and what it answered; without it, "why did it say that?" has no answer. Encore emits the traces with OpenTelemetry's generative-AI semantic conventions, into the same pipeline as every other span. The corpus, the users and the upstream model all drift, so Chapter 11's observability gains a quality dimension.

**Recap.** Golden sets, calibrated judges and CI gates make quality a regression-tested property, judged statistically. Guardrails layer from schemas to filters to grounding checks. Privilege separation and a broken lethal trifecta contain injection, which no prompt wording can prevent. Production quality is monitored like latency.

**Exercise 12.4.** Draft 10 golden cases for the support assistant, including 2 adversarial ones: an injection attempt, and a question whose correct answer is "I can't help with that." Define pass criteria for each.

### 12.5 Operating AI at Scale

#### Cost, latency, and tenant boundaries

The invoice arrives in tokens, and Chapter 11's disciplines apply with new arithmetic. Metering by the token brings the habit of asking what each call is worth. For **unit economics**, Encore tracks AI cost per resolved conversation (model spend divided by resolutions) and watches the denominator as closely as the numerator, because a cheaper model that resolves fewer conversations can cost more per resolution. A ratio is harder to fool than a total. The levers, in order of leverage:

- **Routing.** Section 12.1's two tiers. At Encore, classify-and-route sent most turns (about 80%) to a model roughly a tenth the price.
- **Caching.** Prompt-prefix caching for the shared system context. Semantic caches only for non-personalized questions, keyed by permission scope, with a similarity threshold tuned against the golden set. Otherwise the cache hands one fan's order answer to another, Section 12.2's leakage trap entering by a side door. This is Chapter 4's staleness discipline, in tokens.
- **Budgeting.** Per-feature spend ceilings that degrade gracefully to templated answers: Chapter 4's load shedding, priced in tokens.

**Latency** is about perception, as Chapter 8 showed. An answer whose first words appear at once feels fast however long it takes to finish, so Encore streams everything, prefetches retrieval while the user types, and measures time-to-first-token, the number users feel.

**Multi-tenancy** previews Chapter 14. Building codes put fire walls between apartments so that a fire burns out where it started; once Encore has tenants, prompts, corpora and spend are walled off the same way, and a runaway agent is throttled inside its own tenant's budget. The index keeps tenant data within corpus boundaries, and no prompt can override it, because the wall is in the structure and not in the instructions.

Nothing in this chapter required us to forget the first 11. Every AI-scale problem yielded to an old discipline with new units.

**Recap.** Encore measures cost per resolved outcome, routes by tier, caches prefixes freely and meanings only within a permission scope, and degrades gracefully at budget limits. It streams for perceived latency and walls off prompts, corpora and spend per tenant.

**Exercise 12.5.** Estimate the support assistant's economics: turns per conversation, tokens per turn, tier mix and cost per resolution. Then compute what the routing layer is worth per month at 50,000 conversations.

### Kata: The Firm's Memory

> **Your brief: "Archivist."** An AI knowledge assistant for a 900-lawyer firm, over 40 years of privileged briefs, contracts and memos. Access is matter-scoped (a lawyer sees only the matters they are staffed on), and some matters sit behind ethical walls (two teams at the same firm on opposite sides of adjacent matters). Asks: research Q&A with citations, first drafts in the firm's style, and an agent that files court-deadline reminders into calendars. Hard constraints: no client data may be used for training or sent to a third-party model without contractual cover; the managing partner wants "provable" answer provenance; billing wants AI cost per matter.

**Deliverables:**

1. **Topology** — gateway and router design, tier strategy, and the on-prem vs. API model decision as an architecture decision record (ADR) that states the data-governance losses plainly.
2. **RAG design** — the Figure 12.1 pipeline with matter scoping and ethical walls as structural retrieval filters, plus a corpus-as-data-product sheet with freshness SLOs.
3. **Agent spec** — the deadline agent's tools, scopes, budgets and escalation lines (what may it write to a partner's calendar unasked?).
4. **Eval pack** — 15 golden cases including 2 ethical-wall probes and 1 injection attempt hidden in a document, plus the CI gate policy.
5. **Economics sheet** — cost-per-matter instrumentation and the router's projected savings.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Structural permissions | Could any prompt, however crafted, cross an ethical wall? |
| Provenance | Can a skeptical partner check every answer's citation? |
| Contained authority | What is the worst thing the agent can do unsupervised, and did you choose that limit? |
| Realistic economics | Does the cost model survive 10× adoption without surprising billing? |

#### Where you now stand

You can now place a probabilistic component inside a deterministic discipline: behind a gateway, grounded, budgeted, evaluated and contained. Many of this chapter's choices were one question in different clothes: host the model or rent the API, build the gateway or buy it, run the vector store or subscribe to one. The book has answered that question in passing since Chapter 3, and the AI stack raises it sharply enough that Chapter 13 takes it on directly as the economics of buy versus build.

### References

- Chip Huyen — [*AI Engineering*](https://www.oreilly.com/library/view/ai-engineering/9781098166298/). O'Reilly, 2025.
- Jay Alammar, Maarten Grootendorst — [*Hands-On Large Language Models*](https://www.oreilly.com/library/view/hands-on-large-language/9781098150952/). O'Reilly, 2024.
- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Sebastian Raschka — [*Build a Large Language Model (From Scratch)*](https://www.manning.com/books/build-a-large-language-model-from-scratch). Manning, 2024.
- Adam Bellemare — [*Building an Event-Driven Data Mesh*](https://www.oreilly.com/library/view/building-an-event-driven/9781098127596/). O'Reilly, 2023.
- Cathy Chen, Niall Richard Murphy, Kranti Parisa, D. Sculley, Todd Underwood — [*Reliable Machine Learning*](https://www.oreilly.com/library/view/reliable-machine-learning/9781098106218/). O'Reilly, 2022.
- Chip Huyen — [*Designing Machine Learning Systems*](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/). O'Reilly, 2022.
- Anthropic — [*Building Effective Agents*](https://www.anthropic.com/engineering/building-effective-agents). 2024 — free online.
- Open Worldwide Application Security Project (OWASP) — [*Top 10 for LLM Applications*](https://genai.owasp.org/llm-top-10/). 2025 edition — free online.
- Model Context Protocol — [*Specification*](https://modelcontextprotocol.io/specification). Living standard — free online.
- OpenTelemetry — [*Semantic Conventions for Generative AI*](https://opentelemetry.io/docs/specs/semconv/gen-ai/). Living standard — free online.
- Patrick Lewis et al. — [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401). NeurIPS, 2020 — free online.
- Simon Willison — [*The lethal trifecta for AI agents*](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/). 2025 — free online.

---

## Chapter 13: Buy, Build, and the Economics of Dependence {#ch13}

> Build what makes you different; buy what makes you the same.

Every earlier chapter has made this decision at least once. Chapter 1 handed payments to a provider. Chapter 3 told us to buy the generic subdomains and put the best people on the core. Chapter 11 said to own less by default, and Chapter 12 weighed hosting a model against renting an API. The decision keeps returning because it is, I have come to believe, the most consequential choice an architect makes over and over again, and until now this book has treated it in asides.

It is an old question. At the 1968 NATO software engineering conference, Doug McIlroy argued for an industry of mass-produced software components, so that programmers might assemble systems instead of writing every routine afresh. Brooks, in "No Silver Bullet" (Chapter 1), named buying as the most radical attack on software's essential difficulty: the cheapest program to build is the one we never build at all. What has changed since is the size of the menu and the speed at which its prices and positions shift.

Encore's queue for one quarter holds four of these decisions. Should it replace the homegrown catalog search with a search product, or keep tuning it? Adopt a fraud-detection vendor, or keep Bot Screening in-house? Host an open-weights model for the support assistant, or stay on the API? It will buy a status page, obviously, but the useful question is which decisions are obvious, and why. Answering well takes a vocabulary for the options, a map for their timing, a full ledger of their costs, and a process that outlasts a hallway argument.

### 13.1 The Decision Space

"Build versus buy" frames the choice as a binary, and the framing hides the options in between. There are at least four, and they differ in two quantities that move in opposite directions: what you own, and what you owe.

| Option | You own | You owe |
|---|---|---|
| **Build** | everything: behavior, roadmap, data | everything: maintenance forever, opportunity cost now |
| **Adopt** (open source) | your deployment, your patches | operations, upgrades, community citizenship |
| **Buy** (product, self-run) | your configuration and data | licenses, operations, upgrades, integration |
| **Rent** (software as a service, SaaS) | your data, if the contract says so | subscription, trust, an exit plan |

Read down the table and each step from build toward rent trades control for relief: we own less of the system's future, we owe less of its upkeep, and what we owe shifts from labor to trust. *Dependence*, as this chapter uses the word, is the condition in which part of our system's behavior, cost or future is decided by someone we do not employ. None of the four options escapes it, since even a build depends on its builders staying; they differ in whom we depend on, and on what terms.

Economists reached this question before we did. Ronald Coase asked in "The Nature of the Firm" (1937) why companies make some things and buy others, and his answer turned on the costs of transacting: finding a supplier, negotiating, and enforcing the agreement. In software those transaction costs are integration, governance and exit, which are exactly the costs that build-versus-buy debates leave out.

The first filter is Chapter 3's differentiation test. A capability that makes Encore win, such as fair on-sale admission or bot resistance, deserves ownership, because owning it is the point. A capability everyone needs and no customer picks Encore for (auth, email, payments, status pages) deserves the thinnest commitment available. A band works the same way: it writes its own songs, because the songs are why anyone comes, and it rents the PA system, because no fan ever bought a ticket for the cabling. The analogy breaks because software's parts are less separable than a band's, and a rented component can shape the song more than any amplifier would. The hard cases sit in the middle: capabilities that matter but do not differentiate, where all four options compete.

Run Encore's queue through the filter. Bot Screening is core, so Encore keeps building it, but the build can sit on a purchase: Encore rents commodity bot signals at the edge (device reputation, known-bad networks) and owns the fairness policy that turns them into admission decisions. The options compose, and the layer worth owning is usually the thin one on top, where the judgment lives. The status page is generic, so Encore rents one. Catalog search matters (fans who cannot find the show cannot buy the ticket), but nobody chooses Encore for its search box, so it lands in the middle. The AI stack lands there twice: the model, and everything around it. The filter decided none of these; it sorted them by how much deliberation each deserves.

**Recap.** Build, adopt, buy and rent are points on a scale of what we own against what we owe, and none of them escapes dependence. The differentiation test sorts capabilities into those we own, those we rent, and a middle that deserves deliberation.

**Exercise 13.1.** List the last five capability decisions your organization made, consciously or by default. Which of the four options did each land on, and did anyone apply a differentiation test first?

### 13.2 Evolution and the Map

The differentiation test takes a photograph, but capabilities move. Simon Wardley observed, and Chapter 15 applies to whole platforms, that every capability travels the same road, in a predictable direction if not at a predictable speed: **genesis** (novel, experimental, nobody sells it), **custom** (understood, hand-built by those who need it), **product** (competing vendors, feature checklists), and **commodity** (undifferentiated, priced per unit, boring). The posture that wins at one stage loses at the next, so a decision that was right when made can become wrong while nobody touches it.

{% include diagrams/fig-13-1.svg %}

*Figure 13.1 — The evolution road from genesis to commodity, with the winning posture at each stage. The failure mode is posture lag: still hand-building what became a product years ago, or renting what should differentiate you.*

Electricity traveled this road. Early industrial factories often ran their own generating plants, because there was no reliable alternative; once the grid matured, a private dynamo was an expense with no advantage. The analogy holds for the direction of travel and breaks on interfaces. One utility's kilowatt-hour is interchangeable with another's, while a software product brings its own data model, API and opinions, so a software commodity is rarely as fungible as current in a wire (Section 13.4).

Two consequences follow. First, **decisions have expiry dates**. A gateway a company built in 2015 was a reasonable custom-stage decision. Once competing products matured, the same code became posture lag, which we can define as the gap between the stage a capability has reached and the stage our posture toward it still assumes. Posture lag is hard to see from inside, because undifferentiated maintenance still looks like an asset and still feels like craftsmanship. So write the expiry into the architecture decision record (ADR) when deciding: "revisit when two credible products exist."

Second, **new capabilities appear on top of old commodities**, each commodity becoming the floor for a new genesis. Large language model (LLM) inference is a custom-stage capability running on commodity compute, which is why a hosting decision that looked settled is open again. The map does not decide for us; it tells us when a decision we thought finished has started to move.

This settles Encore's search question. Search engines became products a decade ago, and a purpose-built one will outpace Encore's index, tuned by two engineers, on features and upkeep. Buying still has costs: keeping the index in sync with the catalog, relevance tuning for artist names and misspellings that needs one engineer's ongoing attention, and an exit through Encore's own search interface. Encore buys, keeps one engineer on relevance, and moves the other to the on-sale.

**Recap.** Capabilities travel from genesis through custom and product to commodity, and the winning posture changes at each stage. Every decision carries an expiry date against posture lag, and the map tells us when to revisit it.

**Exercise 13.2.** Place your organization's five biggest homegrown systems on the evolution road. For any in product or commodity territory, name what keeping them costs per year.

<h3 id="133-the-honest-economics">13.3 The Economics of Build and Buy</h3>

Build estimates run low because teams price the *construction* and forget the *ownership*. Robert Glass's widely cited estimate puts maintenance at 40% to 80% of software cost, about 60% on average, and that cost arrives after the builders have moved on. Meir Lehman, who began by studying the growth of IBM's OS/360, gave the reason a name in the laws of software evolution he formulated in the 1970s: a program in use must be continually adapted, or it becomes progressively less useful. Software in service is less like a finished bridge than a garden, which declines the season we stop tending it. Every system we build is a pension we have promised to pay.

Then add the quieter lines: our best engineers doing undifferentiated work, the bus factor of a system three people understand, and harder hiring for a stack nobody else runs. A competent team can build nearly anything; the question is whether we want to be paying for it in year six.

Buy estimates run low elsewhere. Integration is never the demo: it covers identity, data flows, failure modes, and every point where the product's model meets ours. Lock-in accumulates (Section 13.4). Prices rise once we have integrated, and vendors get acquired, retire products, or fold.

So the buy-side ADR needs a line that enthusiasm usually leaves out: **the exit plan**. What leaves with us (data, configuration, operational know-how), and how long would leaving take? Chapter 3's anticorruption layer (ACL) matters most here. It is Parnas's criterion from Chapter 1 applied to a contract: the decision most likely to change, which vendor we use, is hidden behind one translation layer that keeps the vendor's model out of our core and the vendor replaceable.

Open source is the middle path, and I have spent a decade on its far side. MockK is other people's adopt decision. They got a mocking library with no license fee, no vendor, and the option to fork. They also got, without a contract naming it, a dependency on one maintainer's weekends. Good adoption budgets for that: pin versions, track the project's health as you would a vendor's balance sheet, and contribute fixes upstream, which is partly citizenship and partly the cheapest insurance in software.

Licenses change too. Elasticsearch, Terraform, and Redis all relicensed away from open source, and community forks (OpenSearch, OpenTofu, Valkey) became the exit. Note who owns the copyright, because a single-vendor project can change its terms in a release note.

Both ledgers need due diligence. For adopted code, keep a software bill of materials (SBOM), and watch health signals such as release cadence, maintainer count, and the Open Source Security Foundation (OpenSSF) Scorecard. For vendors, read the security attestations (a SOC 2 report or equivalent) before signing, because their breach becomes our incident.

AI coding assistants have made *construction* markedly cheaper, so "we could build this in a sprint" is truer than it was. They do far less for *ownership*: the on-call, the upgrades, the security patches, and the one person who understands the design. When construction gets cheaper and ownership does not, ownership becomes a larger share of the total, and the year-six question matters more. Code has become cheap to write; it has not become cheap to keep.

**Recap.** Building is priced at construction but paid for in ownership, because software in use must keep changing. Buying is priced at the subscription but paid for in integration and exit. Every buy-side ADR carries an exit plan, and every adoption budgets for the maintainer's weekends.

**Exercise 13.3.** Take one system your team built more than three years ago. Estimate what fraction of its lifetime cost was the initial build. Would you build it again today, and if not, what is the exit plan?

### 13.4 Lock-In and the Special Cases

Lock-in is best treated as a cost to measure before we buy. The useful question is what the lock costs to open, and its kinds have different escapes:

| Lock-in | Mechanism | Escape |
|---|---|---|
| **Data gravity** | your data lives there, and moving it costs money and risk | continuous export, open formats, tested restores |
| **Interface** | proprietary APIs threaded through your code | the ACL: one translation layer instead of a thousand call sites |
| **Egress** | moving data out is priced per byte | know the number before signing; since 2024 the big three clouds waive egress for customers who leave, and in the EU the Data Act bans switching and exit-egress charges from January 2027 |
| **Skills** | the team's expertise is vendor-shaped | hire for fundamentals; train for products |
| **Contract** | terms that punish exactly the growth you want | negotiate exit terms and price caps while you are small |
| **Behavioral** | prompts and evals tuned to one model's quirks | an eval suite that turns a model switch into a test run |

Most of these escapes are cheap when taken early and dear when taken late. An export pipeline built on day one costs a few days; the same pipeline built during a pricing dispute costs a quarter and is negotiated from weakness. Lock-in settles like sediment, a little with every integration, and nobody notices the riverbed rising until a boat runs aground.

Building wins in three cases. The first is when the capability *is* the differentiation; nobody buys their core. The second is when the terms are unacceptable and no vendor will change them, as with regulated data that has nowhere compliant to go. The third is scale. Renting means paying someone else's margin, and past a certain volume that margin would fund a team of our own. The repatriation stories the industry retells are real but rare, because most companies never reach that volume. Run your own numbers.

The AI stack is the live case from Chapter 12. Renting the model API buys frontier quality and no serving operations. The price is per token, scales linearly with traffic, and comes with a data-governance question, and we still own the evals, the rate limits, and the model retirements that arrive on the provider's schedule. Hosting open weights buys control, data residency, and a flatter cost curve. Its price is GPUs we pay for whether or not they are busy, an inference platform someone must run, and a model that trails the frontier.

The arithmetic is the one the time-sharing era of Chapter 11 taught: renting wins while use is occasional, and owning wins once the machine would be kept busy. The crossover depends on utilization. Steady, high-volume, narrow workloads (classifying every support message, say) can justify hosting. Spiky or quality-sensitive ones, such as the hard minority that Chapter 12's router sends to frontier models, rarely do. Model serving is also moving from custom toward commodity unusually fast, which argues for thin commitments and revisit dates measured in quarters. In a market moving this quickly, the most valuable property of a decision is how cheaply it can be undone.

**Recap.** Lock-in is a cost to measure, and it comes in six kinds (data, interface, egress, skills, contract, behavioral), each with its own escape, most of them cheapest when taken early. Building wins for differentiators, unacceptable terms, and scale. The AI stack calls for thin commitments revisited quarterly.

**Exercise 13.4.** For your most important vendor dependency, write the exit plan that does not yet exist: what leaves with you, through which interface, and in how many weeks? Which of the six kinds of lock-in would hurt most?

### 13.5 Running the Decision

A decision that exists only in a meeting does not outlast it. So we record it as an ADR, as this book has since Chapter 1, with two mandatory sections. The **exit plan**, because dependence without an exit is surrender. The **expiry date**, because capabilities keep moving (Section 13.2).

In some industries the exit plan is a legal duty. The EU's Digital Operational Resilience Act (DORA), in force for financial entities since January 2025, requires documented exit strategies for information and communication technology (ICT) providers that support critical functions.

Time-box the evaluation as a proof of concept with a calendar and success criteria, so it cannot drift into a shadow project. Score reversibility and spend deliberation in proportion. A rented status page is a revolving door; a data platform is a one-way gate.

These decisions are also political, because they move budgets, headcount, and pride. I once led the retirement of a home-built API gateway in favor of a market product. The map made the call obvious in an afternoon; making it real took a chief product and technology officer's sign-off, four architecture-board sessions, and a year of engineering beside the teams, including tens of thousands of lines of integration and Kubernetes-operator code before the old gateway could be switched off. Retiring a system is a construction project of its own, and it deserves to be planned and staffed as one.

Nobody defended the old gateway on its merits. People defended what it represented: work they were proud of, expertise they held, and a decision that had been right when it was made. That last point deserves respect, because posture lag is rarely anyone's mistake; it is what a good decision becomes when the world moves and the decision does not. Calling the gateway bad would have lost the argument. What won it was the evolution map, the maintenance ledger, and an exit plan, presented patiently to every audience. Buying still meant work: it traded undifferentiated maintenance for integration, and the exit plan stays in case that trade ever turns.

**Recap.** Record the decision as an ADR with an exit plan and an expiry date. Evaluate in a time-boxed proof of concept and deliberate in proportion to how hard the choice is to reverse. Argue with the map and the ledger, and leave people's past work out of it.

**Exercise 13.5.** Draft a one-page ADR for a buy-versus-build decision your organization is currently avoiding, including the two mandatory sections. Whose pride does it threaten, and what does the map say to them?

### Kata: Compass

> **Your brief: "Compass."** A 40-engineer logistics startup routing same-day deliveries in three cities. The quarter's decision list: authentication (homegrown, passwords and all), package search for the support team (SQL `LIKE` queries), payments (one processor, hardcoded), and route optimization, the thing customers actually pay for (the founder's algorithm, which beats every vendor they have benchmarked). The chief technology officer's constraint: "we can staff exactly one build."

**Deliverables:**

1. **Evolution map** — all four capabilities placed on the genesis-to-commodity road, with a posture per position.
2. **The ledger** — for each capability, the full build cost (construction *and* ownership) against the full buy cost (integration *and* exit), in order-of-magnitude numbers.
3. **Four ADRs** — each with the two mandatory sections: exit plan and expiry date.
4. **The one build** — which capability gets the staffing, defended against the differentiation test.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Posture honesty | Is anything hand-built in commodity territory, or rented in core territory? |
| Ledger completeness | Does every build estimate include year-six maintenance, and every buy estimate the exit? |
| Exit realism | Could the payments exit plan actually execute in the stated weeks? |
| The one build | Did route optimization get the build? If not, what beat the differentiator? |

#### Where you now stand

You can sort capabilities by differentiation, time decisions with the map, keep both ledgers, and run the decision as a process with an exit and an expiry. Meanwhile venues now ask to run *their own* Encore. Selling into another organization's buy-versus-build decision needs its own architecture, with problems of isolation, tiering, and cost attribution. Chapter 14 builds it: multi-tenant SaaS.

### References

- Gregor Hohpe — [*Cloud Strategy*](https://leanpub.com/cloudstrategy). Leanpub, 2020.
- Robert L. Glass — [*Facts and Fallacies of Software Engineering*](https://www.informit.com/store/facts-and-fallacies-of-software-engineering-9780321117427). Addison-Wesley, 2002.
- Eben Hewitt — [*Technology Strategy Patterns*](https://www.oreilly.com/library/view/technology-strategy-patterns/9781492040866/). O'Reilly, 2018.
- Simon Wardley — [*Wardley Maps*](https://learnwardleymapping.com/book/) — free online.
- Martin Fowler — [*Utility vs Strategic Dichotomy*](https://martinfowler.com/bliki/UtilityVsStrategicDichotomy.html) — free online.

---

## Chapter 14: Multi-Tenant SaaS Architecture {#ch14}

> One system, many customers, and every customer convinced it was built for them alone.


An inbound email changed the company. A national venue chain wants "Encore, but ours": their brand, their data, their compliance regime, all running on Encore's machinery. This is the software-as-a-service (SaaS) turn, and it reaches far past deployment. Multi-tenancy is a *defining architectural constraint*: one system serves many customers, and isolation, fairness and per-tenant economics cost far more to retrofit than to design in.

None of this is new. Multi-tenant SaaS is Chapter 11's computer utility in commercial form, and the time-sharing pioneers' problems (protecting one user from another, dividing a scarce machine fairly, billing each for what they consumed) are this chapter's problems, now spread across fleets of machines.

A SaaS product is a platform with billing attached, so the control plane, self-service onboarding and tenant-aware operations built here are what Chapter 15 generalizes to internal platforms. The tenant also reaches into identity (Chapter 10), partitioning (Chapter 4), cost (Chapter 11) and AI spend (Chapter 12). Tenancy is less a component than a dimension, and it passes through everything.

### 14.1 The SaaS Mindset

#### Control plane, application plane, and deployment models {#two-planes-three-models}

Tod Golding organizes SaaS around a single split, and everything after it hangs from it. The **application plane** is the ticketing machinery that tenants use: catalogs, queues, seat maps, orders. The **control plane** is the machinery that *manages tenants*: onboarding, identity, configuration, billing and per-tenant operations. It offers no tenant-facing features, and yet every tenant's onboarding, every invoice and every support case passes through it.

A city offers a fair picture. The application plane is the streets, shops and homes where life happens; the control plane is city hall, with its land registry, permits and utility meters. Nobody moves to a city for its registry, but a city without one cannot say who lives where, who owes what, or whose water to shut off. The analogy breaks usefully: a registry changes slowly, by paperwork, while a control plane must answer "whose request is this?" within milliseconds, on every request.

{% include diagrams/fig-14-1.svg %}

*Figure 14.1 — The two planes, with the control plane's five services beside the application plane they manage. Companies that skip the control plane still have one, made of runbooks, spreadsheets, and a heroic ops engineer named something like Dana.*

Within the application plane, tenants are deployed on one of three models. Chapter 10 introduced them as isolation choices, in the silo/pool/bridge vocabulary of Golding and AWS's SaaS guidance. **Silo** is a stack per tenant. **Pool** is one shared deployment, with every request scoped by tenant. **Bridge** (close to what Golding calls *mixed mode*) mixes the two layer by layer, most often pooled compute over siloed data.

The choice among them belongs to a tenant and a tier, and Encore will run all three at once; Section 14.5 prices each. A company that declares itself "a pool shop" or "a silo shop" has turned a trade-off into an identity, and identities are much harder to revise than decisions.

**Recap.** The control plane manages tenants and the application plane serves them; the first is as much a part of the product as the second, though no tenant ever sees it. Silo, pool and bridge are a menu chosen per tier, and one company can run all three.

**Exercise 14.1.** Inventory what your company would need in a control plane today. How many of Figure 14.1's five boxes exist as software, and how many as Dana?

### 14.2 Tenant Lifecycle

#### Onboarding and tenant identity {#onboarding-is-architecture-identity-is-destiny}

A tenant's life begins at onboarding, and we measure onboarding the way Chapter 7 measured developer experience (DX): as *time from signature to first sale*. For Encore's self-service tier that time must be minutes. Minutes take an automated, observable workflow on Chapter 6's engine (provision, configure, seed, verify), with compensation for the partial failures that will certainly happen. A checklist in Confluence cannot do it, because it depends on a person who is awake and undistracted.

The enterprise tier adds steps, among them single sign-on (SSO) federation, custom domains and data residency, but the same pipeline runs them. It is tempting to hand-build the big customer's environment, because the deal is large. Yet a hand-built enterprise tenant is a one-off, and one-offs are what disaster-recovery drills rebuild wrongly, from someone's half-remembered notes. Data residency is a placement the control plane records at onboarding: the tenant's region and cell, and therefore where its logs, backups and AI calls may go. Recorded once, it can be enforced everywhere; remembered by people, it will eventually be forgotten by one of them.

The same pipeline owns the rest of the tenant's life. **Tier changes** move a tenant between deployment models (pool to silo when a busy venue upgrades, and back when it downgrades) as a planned, verified data migration. **Suspension** blocks access without deleting anything, for unpaid invoices or security holds. **Offboarding** exports the tenant's data in a documented format, deletes every copy, and produces the deletion evidence the customer's auditors will ask for. A system that designs only for a tenant's birth will improvise everything after it.

Identity does the daily work, under one rule that prevents a whole category of catastrophe: **tenancy is resolved once, at the edge, and carried as trusted context from there on.** A venue's staff belong to one tenant, so their token carries it: the box-office manager logs in and the token says `tenant: venue-chain-a`. A fan buys from many venues, so the fan's token proves only who they are. The storefront (`tickets.venuechain.com`) sets the tenant, and the gateway checks identity and tenant together before anything else runs.

*Complete mediation*, Saltzer and Schroeder's principle from Chapter 10, requires every access to every object to be checked for authority. Resolving tenancy at the edge makes that principle practical across many services, because the check has one place to live and everything downstream relies on its outcome.

The failure mode is downstream code deciding tenancy for itself, by parsing IDs out of URLs, consulting lookup tables on each request, or simply assuming that "the service knows." Each is locally reasonable, and together they give the system as many definitions of tenancy as it has services, one of which will sooner or later serve a tenant another's data. From the gateway inward, therefore, tenant context propagates as Chapter 5's correlation ID does: in every call, every event and every log line. When the context arrives everywhere, per-tenant metrics, limits and bills cease to be projects and become queries over data Encore already has.

**Recap.** Onboarding is a compensating workflow, identical across tiers and measured in minutes to first sale, and the same pipeline carries a tenant through tier changes, suspension and offboarding. Tenancy is resolved once at the edge (from the staff token, or from the storefront for fans) and propagates like a correlation ID, making the rest of this chapter measurable.

**Exercise 14.2.** Sketch Encore's self-service onboarding as a Chapter 6 process model: the steps, their compensations, and the verification that flips a tenant to "live."

### 14.3 Building Multi-Tenant Services

#### Tenant context in shared services {#tenant-aware-without-tenant-riddled}

In the application plane, the danger is gradual: `if (tenant.tier == "enterprise")` scattered through business logic, one reasonable exception at a time, until no path can be tested with confidence. Each branch is a small piece of accidental complexity, in Brooks's sense, and they compound, because each one multiplies the paths a test must cover. Instead, tenancy is resolved once (at Section 14.2's edge), enforced in shared infrastructure layers, and expressed in business code as *configuration*. Encore's seat-hold time to live (TTL) is a per-tenant config value; the code reads it, with no tier branch around it. This is Parnas's criterion from Chapter 1 applied to tenancy: the way tiers differ is a design decision likely to change, so we hide it behind one interface instead of letting it leak into every function.

Data partitioning applies Chapter 4's machinery with a tenant key:

| Scheme | Mechanics | Blast radius | Bill |
|---|---|---|---|
| Pooled tables | `tenant_id` column + row-level policy | one missing predicate | cheapest, easiest ops |
| Schema-per-tenant | one DB, N schemas | schema drift at N | middling on both |
| Database-per-tenant | full separation | smallest | migrations × N, connection sprawl |

*Figure 14.2 — Partitioning schemes. The pooled row's blast radius is why Chapter 10 insisted the tenant predicate be centralized in the object-relational mapping (ORM) layer, row-level security, or the data-access library: 10,000 queries then rely on one guarded implementation instead of 10,000 developers' memories.*

A forgotten `WHERE` clause is a very small mistake for so large a consequence, and a guarantee that depends on every developer remembering something, every time, is only a hope with good manners. Tenant-scoped credentials put a floor under the application: the request's database session sees only its tenant's rows, whatever the code above it forgets. In Postgres-style row-level security, two details decide whether that floor holds. The application's role must not own the tables (or the policy must be forced on owners), and the tenant setting must be scoped to the transaction with `SET LOCAL` instead of being left on a pooled connection for the next request to inherit. Both are the kind of detail that passes every test with one tenant and fails, quietly, with two.

**Noisy-neighbor fairness** is existential for Encore, because one tenant's on-sale is a Chapter 4 spike aimed at shared infrastructure. Anyone who has lived in an apartment building knows the problem: one neighbor's party becomes everyone's evening. Buildings answer with quiet hours and thicker walls, and so does Encore. The rules are per-tenant rate limits and concurrency quotas at the edge, fair queueing in shared workers, and the Gate's admission control made tenant-aware. When the rules fall short, the bridge model provides the thicker walls, moving a chronically busy tenant to dedicated capacity at a price Section 14.5 names.

At scale these tools combine into the **cell**: a complete, self-contained instance of the application plane, with its own compute, stores and queues, serving a fixed subset of tenants. The control plane routes each tenant to exactly one cell. A cell is Chapter 4's bulkhead at full size: it is the unit of blast radius (a bad deploy or a poison-pill tenant takes down one cell, and the product stays up), the unit of scale (Encore grows by adding cells instead of enlarging one), and the unit of operations (we canary, drain or run a game day on one cell at a time). Here the image falters, because cells share a control plane, an identity provider and a deploy pipeline, and a failure in any of those crosses every bulkhead at once. Cells contain the application plane's failures and leave the control plane's to us.

**Shuffle sharding**, an AWS technique described by Colm MacCárthaigh, improves fairness further. Each tenant is assigned a small random *combination* of resources, so two tenants rarely share their whole footprint, and a noisy neighbor degrades a sliver of many tenants' capacity instead of all of a few tenants'.

A cell can hold pooled or bridged tenants (Golding treats a similar unit as a *pod*). The menu, with cells as the unit that scales it:

| Model | Blast radius | Cost efficiency | Fits |
|---|---|---|---|
| Pool | compute and data: every tenant in the deployment | best | self-service tiers, with this section's discipline |
| Bridge | compute: every tenant; data: one tenant | good | mid-tier |
| Pool or bridge, in cells | one cell's tenants | good at scale | pooled tiers past the first serious incident |
| Silo | one tenant | worst | compliance-bound enterprise |

*Figure 14.3 — Deployment models by blast radius. Cells shrink the pooled row's worst case from every tenant to one cell's tenants, without paying silo prices.*

Encore's end state has three shapes. Its 500 self-service venues run pooled, in serverless cells of about 50 venues each. Professional tenants run bridged, in Kubernetes cells where compute is shared and each tenant has its own database. The venue chain runs in its own siloed stack. The control plane, which records where every tenant lives, becomes the cell router: the city's registry now directs its traffic too.

**Recap.** We resolve tenancy once, enforce it in shared layers, and express the differences between tiers as configuration. We choose partitioning by the blast radius we can afford, centralize the tenant predicate, and scope credentials to the tenant. Quotas and fair queues provide fairness, cells contain failures, and a tenant that outgrows them pays for dedicated capacity.

**Exercise 14.3.** Search a codebase you know for tier or tenant conditionals in business logic. Redesign the worst one as configuration.

### 14.4 SaaS on Real Stacks

The models of Section 14.1 land differently on the two dominant substrates, and Encore's end state uses both: serverless cells for self-service and Kubernetes cells for the professional tier.

**Kubernetes SaaS.** A namespace per tenant, with quotas and network policies, gives soft isolation, since tenants still share a kernel and a cluster control plane. A namespace is a partition wall of plasterboard: enough to separate trusted neighbors, and no defense against one with a hammer. Hostile or regulated tenants need sandboxed runtimes, virtual clusters or dedicated clusters. Silo tiers get dedicated node pools or clusters, and the noisy-neighbor tools are the scheduler's requests, limits and priority classes.

**Serverless SaaS.** Isolation is per execution environment, and because warm environments are reused across invocations, pooled functions must keep no tenant state in globals; a variable that outlives one request is a message left for whichever tenant arrives next. AWS Lambda's tenant isolation mode (2025) goes further, dedicating execution environments to a tenant ID passed at invocation. Per-tenant concurrency limits are the fairness lever. Billing is per invocation, but a pooled function still needs tenant-tagged metering before Chapter 11's cloud financial operations (FinOps) reports can attribute cost per tenant.

Operations gains a dimension as well. Dashboards, alerts and service-level objectives (SLOs) all grow a *tenant axis*, cheap to add because Section 14.2's propagated context is already in every log line. On call, the question shifts from "is the system up?" to "is it up *for whom*?" A pooled system at 99.99% can be serving one tenant nothing but errors, and nobody will see it unless metrics are sliced by tenant. Averages are kind to systems and cruel to the customers hidden inside them. So Encore tracks per-tenant health and per-tenant error budgets for its paying tiers, and its support tooling reconstructs one tenant's experience.

**Recap.** Kubernetes namespaces give soft isolation, and hard isolation requires sandboxes or separate clusters. Serverless isolates per execution environment, but per-tenant cost still needs tenant-tagged metering. Encore runs both, and slices every dashboard, SLO and alert by tenant so that incidents cannot hide inside averages.

**Exercise 14.4.** Take one alert your team owns and rewrite it per tenant: what threshold, for which tenants, and what would last month's data have shown that the averaged version hid?

### 14.5 The Business of Multi-Tenancy

#### Tiers and pricing {#tiers-are-architecture-with-a-price-list}

Tiering is where Section 14.1's menu meets the chief financial officer (CFO), and where architecture and packaging must be designed together. Encore's tier sheet:

| Tier | Deployment | Isolation | SLO | AI features | Price logic |
|---|---|---|---|---|---|
| Self-service | pool, in serverless cells of ~50 venues | row + quota | 99.9% shared | shared budget, capped | efficient by design |
| Professional | bridge, in Kubernetes cells (pooled compute, own DB) | data silo | 99.95%, own error budget | own AI budget | margin from pooling, comfort from silo |
| Enterprise | silo | full stack | contractual, tenant-sliced | dedicated corpus + spend | the isolation *is* the product |

*Figure 14.4 — Tiering as co-design. Read it with Chapter 11 in mind: a row can be priced only because per-tenant cost is measurable. Metering (requests, storage, and AI tokens per tenant) is the control-plane service that turns margins from folklore into numbers.*

Enterprise deals depend on a checklist that reads like features and is really architecture. **SSO** through Security Assertion Markup Language (SAML) or OpenID Connect (OIDC) federation means per-tenant identity providers and per-tenant trust configuration in Section 14.2's identity layer. **System for Cross-domain Identity Management (SCIM) provisioning** lets the customer's HR system create and revoke accounts in Encore, an inbound API into Encore's identity model that needs all of Chapter 7's contract discipline. **Audit logs** become a product surface, tenant-visible, exportable and immutable: the Chapter 6 ledger given a customer-facing UI.

**Customer-managed keys** come as bring your own key (BYOK) or, when the key never leaves the customer's own key service, hold your own key (HYOK). Both push Chapter 10's key hierarchy to its limit. The tenant controls the root, and revoking it must make their data unreadable in every derived copy as well (caches, search indexes, backups, AI embeddings). That is crypto-shredding offered as a contractual feature, and it obliges us to know where every copy of a tenant's data lives. **Per-tenant rate limits and SLOs** turn Section 14.3's fairness machinery into line items in a contract. No pricing toggle delivers any of this. The venue chain's security questionnaire arrived before its signature did, and it read like a structural survey of the building they were about to move into.

**Migration.** Moving single-tenant software to multi-tenancy follows Chapter 3's strangler approach, where order matters more than speed. Tenant context goes in at the edge first, so every request carries a tenant tag while there is still only one tenant; the tag costs almost nothing and makes every later step observable. Next the tenant predicate is centralized. Then data consolidates toward the pool tier by tier, with silo customers moving last or never. A big-bang rewrite would stake every customer on one cutover.

**Generative AI (GenAI) multi-tenancy.** Chapter 12 previewed this, and here it becomes doctrine: tenant boundaries extend through prompts, corpora and spend. Prompt-building code must make cross-tenant context structurally impossible, because a prompt is another query, and a model uses whatever context it is handed. Corpora need per-tenant indexes or tenant-filtered retrieval, so that the venue chain's sales data cannot reach a rival's assistant by any path. Spend needs per-tenant AI budgets metered like any other resource, because an unmetered AI feature demos well and leaks margin in production. Tenancy, as promised, is a dimension of everything, the newest things included.

**Recap.** Tiers map deployment models to price points, and per-tenant metering makes the prices defensible. We migrate by introducing tenancy at the edge and working inward, step by reversible step. AI features inherit tenant boundaries across prompts, corpora and spend, held by structure like everything else in this chapter.

**Exercise 14.5.** Draft your product's version of Figure 14.4, real or hypothetical. Which cell can you not fill because the metering doesn't exist? That cell belongs on the control-plane backlog.

### Kata: The Studio Suite

> **Your brief: "Metronome."** Beloved studio-management software (bookings, invoicing, class schedules) for music schools, currently *installed per customer*: 180 on-prem and virtual private server (VPS) installations, each on its own version, backed up by email reminders. The founders want SaaS: keep the 180 (some contractually on-prem for two more years), add self-service signup for small studios, and land "Allegro," a 90-school national chain demanding single sign-on (SSO), in-country data residency, and a contractual service-level agreement (SLA). The team is 12 engineers. The codebase assumes one tenant so thoroughly that the database is named after the customer.

**Deliverables:**

1. **Two-plane design** — Figure 14.1's control plane scoped to 12 engineers: which boxes are built, which are bought, and which are explicitly left to Dana for now.
2. **Tier sheet** — Figure 14.4 for self-service, standard, Allegro, and the legacy on-prem tail, with the deployment model and metering for each tier.
3. **Migration plan** — from 180 one-off installations to tenancy: edge tagging first, then predicate centralization and the data consolidation order, with what "reversible" means at each step.
4. **Fairness & isolation** — the September enrollment spike (every school's on-sale in the same week): quotas, fair queues, and Allegro's contractual protection.
5. **One architecture decision record (ADR)** — "Allegro: silo or bridge?", with the margin math and the operations cost written out.

**Rubric:**

| Criterion | The question to ask yourself |
|---|---|
| Control-plane realism | Is the plane sized to 12 engineers, with the Dana boxes named openly? |
| Edge-resolved tenancy | Is tenancy resolved once at the edge and carried to every log line, or re-derived from URLs downstream? |
| Migration reversibility | Can any consolidation step roll back without restoring from the email backups? |
| Priced isolation | Does Allegro's tier price its blast radius, or subsidize it? |
| Spike fairness | Does the September spike stay inside each school's quota, with Allegro protected by contract rather than luck? |

#### Where you now stand

You can now serve many customers from one system: the planes split, tenancy resolved at the edge, fairness engineered and tiers priced. Now look at what Encore has built for itself across 14 chapters, and ask who runs it for the teams that use it. The question has this chapter's shape, with Encore's own engineers as the tenants. The final chapter answers it with platform engineering and hands you the capstone.

### References

- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Martin L. Abbott, Michael T. Fisher — [*The Art of Scalability*, 2nd ed.](https://www.informit.com/store/art-of-scalability-scalable-web-architecture-processes-9780134032801). Addison-Wesley, 2015.
- Amazon — [*The Amazon Builders' Library*](https://aws.amazon.com/builders-library/) — free online.
- Colm MacCárthaigh — [*Workload isolation using shuffle-sharding*](https://aws.amazon.com/builders-library/workload-isolation-using-shuffle-sharding/). The Amazon Builders' Library — free online.
- AWS — [*Reducing the Scope of Impact with Cell-Based Architecture*](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html). AWS Well-Architected whitepaper — free online.
- AWS — [*Tenant isolation* (AWS Lambda Developer Guide)](https://docs.aws.amazon.com/lambda/latest/dg/tenant-isolation.html). AWS, 2025 — free online.

---

## Chapter 15: Platform Engineering and the Capstone {#ch15}

> The best architecture is the one other teams build great things on without asking you anything.


Encore, which had nine teams in Chapter 5, now has 400 engineers in 40 teams, and its most important customer is one it never signed: its own engineering organization. Every chapter left machinery behind: enforced boundaries, an event backbone, API golden paths, data products, paved-road security, service-level objective (SLO) tooling, an AI gateway and a tenant control plane. The platform team must own that machinery and evolve it, so that 40 teams receive it without 40 implementations.

Platform architecture is architecture applied to architecture. Its users are engineers, its product is their delivery speed, its API is a golden path, and every trade-off of the earlier chapters returns one level up, where it is harder to see and dearer to get wrong. The capstone asks for a complete platform design, defended decision by decision with each cost named, as you have defended everything since Chapter 1.

### 15.1 Why Platforms

#### Cognitive load {#cognitive-load-is-the-resource-being-architected}

Without a platform, a stream-aligned team shipping ticketing features must also master cluster configuration, pipelines, observability wiring, secret rotation, schema registries, cost dashboards, threat models and AI gateways. No team can hold all of that. *Cognitive load*, a term Skelton and Pais borrowed from John Sweller's educational psychology, is the amount of a domain a team must keep in mind to change its software safely. It is finite, and every concern a team carries is paid for out of the attention it would otherwise give its business. So teams sink into the stack and stop shipping, skip it and reopen the gaps Chapter 10 closed, or solve it 40 different ways and get both problems plus an audit finding.

Brooks's distinction from Chapter 1 returns here in a new costume. To a ticketing team, the fairness of an on-sale is essential complexity; it is the problem the team exists to solve. Secret rotation is real work that someone must do well, but it is accidental to ticketing, and a team that carries it is carrying someone else's luggage. An **internal developer platform** is a curated product that absorbs this undifferentiated stack behind self-service interfaces, so product teams spend their attention on the business.

The operating model matters more than the software. Under **platform as a product**, product teams are customers who may choose the platform or decline it, and so it has to win them, as any product must. That stance generates a whole discipline: the platform team talks to users, measures adoption, publishes a roadmap and starts from what Skelton and Pais call the **thinnest viable platform**, the paved road for the most painful mile. At Encore that mile is "new service to production": template, pipeline, observability and identity behind one command.

Landscape designers call the bare tracks people wear across a lawn, when the walkway goes somewhere they do not want to go, *desire paths*. Some planners wait a season and pave where the grass dies. A platform team can do the same, because the workarounds product teams have already built (the shared script, the copied pipeline, the wiki page everyone bookmarks) show where the road ought to run. The analogy fails in one respect: grass records footsteps for free, whereas a platform team has to go out and ask.

Voluntary adoption has a limit, and it is worth drawing precisely. **Guardrails** are few and mandatory: signed images, declared authorization, cost ceilings and the other rules of Section 15.3. **Paths** are many and voluntary: templates, pipelines and portals that a team may leave if it will carry the load itself. The platform imposes guardrails and wins adoption of paths. A platform that mandates its paths has stopped listening, and one that leaves its guardrails optional has stopped governing.

My clearest experience of voluntary adoption is a small one. At a bank hackathon I built a retrospective tool in a few days. Nobody mandated it. It spread team by team until 10,000 employees had used it, and it outlived my tenure by years on a trickle of maintenance. Tools that win their users on merit tend to survive their authors. Platforms need the same discipline at 100 times the stakes.

Each anti-pattern below breaks this stance, in four quite different ways:

| Anti-pattern | Mechanism of failure |
|---|---|
| Mandated platform | forced adoption hides product failure until the reorg |
| Ivory-tower platform | built from imagined needs; meets its first real user at launch and doesn't fit |
| Ticket-queue "platform" | absorbs work instead of automating it; becomes the bottleneck it replaced |
| Kitchen-sink platform | says yes to everything; has no coherent purpose or owner; unmaintainable |

*Figure 15.1 — Four ways platforms die. Each is avoided the same way: real customers, voluntary adoption, measured value and a thin start.*

**Recap.** A platform takes undifferentiated, accidental work off product teams, so their limited attention goes to the business. Its operating model is platform as a product: voluntary customers, measured adoption and a thinnest-viable start, with a few mandatory guardrails beside paths that must be earned. The four anti-patterns are what happens without it.

**Exercise 15.1.** List everything a new service at your company needs before it can safely serve production traffic. Estimate how long a team would take to do it alone. That estimate is the platform's business case, or its absence.

### 15.2 Platform Anatomy

#### Golden paths and the self-service control plane {#golden-paths-on-a-self-service-control-plane}

The platform's product surface is the **golden path**: an opinionated, supported, self-service route through a common need. It is opinionated because it makes choices a team would otherwise have to research, supported because someone answers when it breaks, and self-service because using it takes no ticket and no meeting. Encore's "new service" path has four parts:

- A template: a service skeleton with Chapter 5's contracts, Chapter 10's identity and Chapter 11's observability already wired in.
- A provisioning workflow that creates the pipeline, dashboards, on-call rotation and cost budget instead of documenting them.
- A registry entry recording ownership, tier and SLOs. These entries form the service catalog that answers "who owns this?" at 3 a.m.
- A scorecard that grades Chapter 11's production-readiness checks continuously.

A jazz quartet playing a standard shares the chord changes, and because nobody renegotiates the key at every chorus, each player's attention goes into what they play over them. A golden path is the changes: a shared structure that frees invention for the work that matters. The analogy breaks at the moment of departure. A soloist who leaves the changes may be admired for it; a team that leaves the path has simply taken on the load the path used to carry.

Christopher Alexander's *A Pattern Language* (1977) gave builders a vocabulary of 253 patterns, each a recurring problem paired with the core of its solution. A golden path is a pattern made executable. A pattern written as prose asks every reader to implement it again; a golden path implements it once.

Architecturally, the platform turns Chapter 14 inward: a **control plane** whose tenants are the teams, over the planes this book built one at a time:

{% include diagrams/fig-15-2.svg %}

*Figure 15.2 — The platform as the book's index page. Nothing in the bottom row is new. What the platform adds is the middle row: one control plane that makes everything below it self-service, registered and metered, using Chapter 14's machinery with teams as the tenants.*

This is hierarchy doing its old work. The planes have not become simpler; their complexity now sits behind a small set of requests, and only the platform team has to look beneath them.

Most of these boxes can be bought or adopted (Chapter 13's ledger, applied to the platform). Backstage (or a commercial portal such as Port or Cortex) typically carries the catalog, templates and scorecards. Crossplane or Kratix expose the control plane as declarative, Kubernetes-style APIs, and Open Policy Agent (OPA) Gatekeeper or Kyverno enforce admission policy. The Cloud Native Computing Foundation's (CNCF) Platform Engineering Maturity Model measures how far along you are. Encore writes the glue and the golden-path content.

Following Chapter 5's team topology, a common rule of thumb sizes the platform group at 5–10% of engineering, organized as product teams, one per plane. Conway's law then works in our favor, because the seams between teams fall along the seams between planes; arranging teams deliberately for that result is what later writers named the inverse Conway maneuver. Platform engineers embed with customers through *enabling* interactions to smooth the paths. One line is fixed: the platform runs the roads and never operates a product team's service. Once platform engineers carry the pager for product services, product teams stop learning to own them.

**Recap.** Golden paths are the product, each a pattern made executable: a template, a provisioning workflow, a registry entry and a scorecard. The platform is a control plane over the planes of Chapters 6–12, run by a right-sized product organization that never operates product services.

**Exercise 15.2.** Design the golden path for the need from Exercise 15.1: what the template contains, what provisioning creates and which single command runs it.

### 15.3 Governance as Code

#### Governance that runs itself {#the-paved-road-patrols-itself}

Governance at this scale meets a problem of arithmetic before one of policy. A review board that examines a few designs a week could keep pace with nine teams; with 40 it becomes a bottleneck or a rubber stamp. So with 40 autonomous teams and no review board, governance has to run inside normal work, using machinery built up since Chapter 1.

**Fitness functions** grade every service continuously: boundary rules (Chapter 2), contract compatibility (Chapter 5), security posture (Chapter 10), SLO and cost health (Chapter 11) and eval scores (Chapter 12). Results roll up into the scorecard, visible to the team and its leadership, so a team learns of its drift from a dashboard before it learns of it from an incident.

**Policy as code** enforces the non-negotiables at admission and in continuous integration (CI). Unsigned images don't run, endpoints declare their authorization, and personally identifiable information (PII) fields carry classifications.

After the Great Fire of 1666, London was rebuilt under rules that required brick and stone in place of timber. The rules were few, they concerned what could burn, and they left the shape of each house to its owner, which is the economy admission policies should aim for. The analogy breaks at the inspection: a city inspects a building once, while our services are rebuilt many times a day, so the inspection must be automated or it will not happen.

The **exception path** is designed in advance. Teams may leave the paved road, but each deviation is priced, logged, owned and time-boxed. That is freedom with a ledger, and it replaces both the ivory tower's blanket "no" and unrecorded drift. It also teaches the platform team: when the same exception is requested a third time, it is a missing path.

Governance covers the platform too. Its APIs are Chapter 7 promises to internal strangers: versioned, changed by expand–contract and contract-tested against every consuming team. **Deprecation** runs as a campaign: migration tooling, a dashboard of laggard teams, hands-on help for the last three and a real sunset date. A platform that never retires anything becomes a museum that pages. The archived-not-deleted rule for Chapter 1's architecture decision records (ADRs) scales to whole capabilities: the capability goes, and the record of why it existed stays.

**Recap.** Review boards cannot keep pace with 40 teams, so scorecards, policy as code and a priced exception path take their place. The platform's own APIs carry the company's strictest contract discipline, and deprecation campaigns with tooling, laggard dashboards and sunset dates retire what it no longer needs.

**Exercise 15.3.** Write three policy-as-code rules your organization would enforce at admission today if it could. Name one current rule you would *demote* to advisory, and justify it.

### 15.4 Architecting When Code Is Cheap

#### What changes when code is cheap {#the-inversion-the-preface-promised}

The preface argued that as code gets cheaper, judgment becomes the scarce part of the work. When an agent can regenerate a service overnight, implementations are no longer scarce. The scarce artifacts are the steering ones built since Chapter 1: ADRs that say why, module boundaries that say where, contracts that say what, and fitness functions that confirm it all still holds. Architecture becomes how we direct code nobody reads line by line.

The cost of producing code has collapsed before. When the first FORTRAN compiler shipped in 1957, programmers gradually stopped reading the machine code it produced, and the profession moved its attention up a level. The parallel breaks here. A compiler is deterministic and its behavior is specified; an agent is neither, so our trust in its output must rest on checks of behavior, boundaries and contracts, never on the generator itself.

Encore saw this on a Tuesday. A coding agent working from a well-specified backlog rebuilt the Notification service overnight: a new framework, better retry semantics and 40 files nobody typed or read in full. Most of what mattered was machine-checked before breakfast. The consumer contracts passed. The boundary rules held: no calls outside the published contracts, no reads of another service's tables. Security checks were clean, and the SLO canary promoted the build like any other change.

The checks missed one thing: the new retry semantics could send a fan the same ticket twice. One engineer spent 20 minutes on that change alone and added a spec-level idempotency test before merging. That morning has the shape of the work to come: machinery vouched for nearly everything, and one human judgment, in the one place no check reached, stood between a fan and a duplicate ticket.

Four shifts follow, each landing on machinery Encore already has.

**Decision records become agent context.** An ADR corpus was always the team's memory; now it is also the prompt. Agents read the decisions, constraints and consequences, so a clear ADR is a direct control input. That is the second law at generation time: the recorded *why* steers the *how*. A vague ADR used to cost an argument; now it costs a confidently wrong implementation by Thursday.

**Review economics invert.** When implementation was expensive, review meant reading the code. Now human attention moves up to the boundary, the contract diff, the eval delta and the ADR the change claims to implement. Chapter 5's testing pyramid gains a human layer: people review decisions, interfaces and any behavior no check covers yet. CI reviews everything else, or nobody does. A team that hand-reads generated volume becomes a bottleneck and ends up rubber-stamping.

**Governance becomes the main safeguard.** Section 15.3's machinery, built to let 40 teams move safely, now has to cover *their agents* too, and it can, because boundary checks, contract tests and evals in CI are the only reviewers that scale with generation speed. The paved road becomes what keeps high-volume change from eroding the architecture.

**Agents are tenants too.** A coding agent that opens pull requests, provisions environments or queries production data is a platform user. It gets its own workload identity and scoped credentials (Chapter 10), a sandbox, quotas and metered spend. It reaches the golden paths through machine interfaces, such as the platform's APIs or Model Context Protocol (MCP) tools, in place of the portal. Like any user of a shared machine, an agent needs an account, a quota and a bill. An agent on a human's credentials with no path of its own repeats Chapter 12's direct-call stage one level down: scattered keys, unattributed cost.

> **Erosion at generation speed.** Picture 1,000 commits, each plausible and each passing its tests, that together dissolve the architecture. Helpful imports blur boundaries and accommodating fields widen contracts, until the modular monolith is just a monolith again and nobody typed a line of it. The countermeasures are this book in miniature: boundaries enforced by machines (Chapter 2), contracts tested on every change (Chapter 5), evals gating behavior (Chapter 12), scorecards surfacing drift (Section 15.3), and an architect who reads trend lines instead of diffs.

Erosion itself is old. Perry and Wolf (Chapter 1) named it in 1992, distinguishing *erosion*, the violation of an architecture, from *drift*, an insensitivity to it that makes violations easy. Fred Brooks, in *The Mythical Man-Month* (1975), called conceptual integrity the most important consideration in system design and feared what many hands would do to it. We now have many hands that are not hands at all, and they work through the night. Only the rate is new, and a rate can only be met by machinery that keeps the same pace.

The trade-offs stay with you. No agent owns an ADR's consequences, and no eval decides which characteristics should drive Encore's next year. Cheap code makes judgment more valuable, and the platform is where judgment is encoded once and enforced everywhere. When writing code costs almost nothing, what remains is the cost of being wrong about it.

**Recap.** When code is cheap, ADRs, boundaries, contracts and fitness functions become the steering interface, read by humans and machines. Human review moves up to decisions, interfaces and unchecked behavior; governance as code checks the rest at the speed the code arrives. Agents get identities, quotas and paths like any other tenant.

**Exercise 15.4.** Take one recent AI-assisted change in your codebase (or the Notification rebuild). List what was machine-checked before merge and what only a human could have caught. The second list is your erosion surface; name the check that would shrink it.

### 15.5 Platform Strategy and the Elevator

#### The map, the money, and the message

The platform spends real budget for indirect value. Its benefits show up in other teams' numbers and its costs in its own, so strategy and communication decide whether it survives.

**The map.** Place the platform's capabilities on Chapter 13's evolution road (genesis, custom, product, commodity) and let each stage set the posture. Commodities such as clusters, queues and registries are bought or adopted, never differentiated on. Encore's genuinely custom capabilities are the Gate's fairness engineering and ticketing's domain paths. The classic failure is Figure 13.1's posture lag at company scale: hand-rolling a commodity (artisanal Kubernetes) while buying the differentiator.

**The money.** The business case is Chapter 11's arithmetic applied to the platform: changes in lead time, incidents, unit cost and onboarding time, measured before and after each path ships. Most often these are the DevOps Research and Assessment (DORA) delivery metrics plus a developer-experience survey in the SPACE (satisfaction, performance, activity, communication, efficiency) or DevEx style. Developer experience is how the paths feel; the numbers renew funding.

Expect mixed numbers at first. In DORA's 2024 report, platform users reported higher productivity while throughput and change stability *dropped*, by roughly 8% and 14%, plausibly from extra handoffs and pipeline steps. The right response is to plan for that dip, not to explain it away. A case that promises only upside will be refuted by its own dashboards.

**The message.** The architect-elevator skill states the same platform decision on every floor: to engineers as golden paths and guardrails, to directors as delivery predictability, to the CFO as unit economics, and to the board as "we ship in days what peers ship in quarters." Each version is true and none is the whole truth; the skill lies in choosing the true part each audience can act on. Translating between engine room and penthouse without distortion is part of the technical job; at platform scale it often decides the funding.

One floor is a classroom. The gateway migration of Chapter 13 took hold only when I started teaching it: 20 short sessions over two weeks and a dozen hands-on exercises, after which the team ran the new platform without me. I now treat teaching as part of the job. An architect who cannot teach a decision remains its only operator.

Under all three sits systems thinking. Donella Meadows argued that a system's behavior arises from its feedback structure, and adoption is a feedback loop: good paths attract users, users give feedback, and feedback improves the paths. When adoption stalls, the weak link is usually feedback, which is why a platform team's calendar holds more user interviews than a product team's.

#### Architecture reviews {#the-craft-reviews-without-theater}

The last instrument is the lightweight design review. The format that survives real calendars is the **request for comments (RFC) loop**: a proposal of one to three pages (context, options, chosen trade-offs, ready to become an ADR), circulated asynchronously, commented on in writing, decided visibly and archived permanently. No committee, no slides. The document is the meeting, and the archive becomes Section 15.4's agent context for free.

Steve Crocker circulated the first Request for Comments in 1969 among the people building the ARPANET, choosing the modest title to invite discussion instead of claiming authority. Keep that tone: an RFC that reads as a verdict gets silence, and silence is the one review outcome nobody learns from.

For bigger decisions, borrow the spine of the Software Engineering Institute's (SEI) Architecture Tradeoff Analysis Method (ATAM) without its ceremony: walk the design through the driving characteristics, one probing question each:

| Characteristic | The reviewer's question |
|---|---|
| The driving "-ilities" | Which decision serves each, and what did it cost? |
| Failure | What breaks first at 10×, and what does the user see? |
| Change | Where does next year's most likely change land: one component or five? |
| Security | Where does trust change hands, and who checked? |
| Cost | What are the unit economics of this design at success scale? |
| Exit | Which decisions are one-way doors, and are they marked? |

Run on every significant change, this one-hour, one-page, six-question review beats the quarterly architecture board it replaces, chiefly because it happens while the decision can still change.

**Recap.** Place each capability on the evolution road and buy or build accordingly. Fund the platform with before-and-after numbers, the uncomfortable ones included, and describe it in each floor's language without changing the facts. Teach what you build, and fix the feedback loop before adding features. Design reviews are one-page RFCs that invite comment, plus six characteristic-driven questions.

**Exercise 15.5.** Take one internal capability your company hand-rolls. Place it on the evolution road, then write a two-sentence justification for keeping it, or a two-sentence plan to migrate it to a commodity.

### Kata: The Capstone — Meridian

Everything since Chapter 1 was practice for this.

> **Your brief: "Meridian."** A B2B logistics company: 40 product teams (520 engineers), one aging monolith carrying 60% of revenue, and 190 services of widely varying age carrying the rest. Known pains: a four-week lead time for a new service; three security postures found in the last audit; every team runs its own CI; data science can't get clean data; two teams have built shadow AI gateways. The CTO has funded a platform organization of 36 engineers (you), with board attention and 18 months of patience. Meridian also sells a customer-facing API and is midway through a multi-tenant "Meridian for Carriers" product. You have met two of its recent acquisitions: **Cargo**, Chapter 9's freight forwarder, and **Relay**, Chapter 11's locker network. Their architectures arrive with the deal, incident history and all.

**Deliverables — the full architect's dossier:**

1. **Platform strategy** — a Wardley-postured capability map; the thinnest viable platform chosen from Meridian's pains, with the first three golden paths sequenced by measured pain.
2. **Platform architecture** — a design as detailed as Figure 15.2: control plane, planes, registry, scorecards; C4 diagrams with trust boundaries (Chapter 10).
3. **Golden-path specifications** — the "new service" and "new data product" paths end to end: template contents, provisioning workflow, inherited guardrails, one-command experience.
4. **Governance design** — the fitness-function catalog, three admission policies, the priced exception path, and the deprecation playbook for the long tail of 190 services.
5. **Migration roadmap** — the monolith strategy (per Chapter 3: what gets strangled, what stays), shadow-AI-gateway consolidation, the carrier product's tenancy machinery converging with the internal control plane, and plans to bring Cargo's data products and Relay's ingestion fleet onto the platform's paths. Your kata answers from Chapters 9 and 11 are admissible evidence.
6. **The economics** — the platform team structure for 36 engineers, the before-and-after metrics that renew funding at month 18, and unit-economics instrumentation.
7. **The elevator narrative** — one page, four floors: the same platform described to engineers, directors, the CFO and the board.

**Rubric — the book's final examination:**

| Criterion | The question to ask yourself |
|---|---|
| Trade-off provenance | Does every major decision name its cost in writing, ADR-style? |
| Thinness discipline | Does the platform start where Meridian hurts most, or where platforms are fashionable? |
| Inherited rigor | Do the paths carry the disciplines of Chapters 5–14 by default: contracts, identity, SLOs, tenancy, eval gates? |
| Voluntary physics | Would a skeptical team lead adopt path one, and what number convinces their director? |
| The elevator test | Could a stranger tell that the CFO's page and the engineer's page describe the same platform? |

#### Where you now stand — a graduation note

The preface made a second claim: architecture is a continuing stream of trade-offs, made under uncertainty, written down and revisited when the facts change. You now hold the full chain, from characteristics through styles, boundaries, distribution, fleets, events, promises, pixels, data, defense, operations, intelligence, economics and tenancy to platforms, and the habit that ties it together: *name what it costs, in ink.*

Looking back along that chain, I see one adversary in every chapter: complexity, some of it essential to the problem and much of it of our own making. The weapons never changed. We abstracted, so a team could use what it did not need to understand; we decomposed, so a change would land in one place; and we built hierarchies, so 40 teams could stand on a control plane without seeing what lies beneath it.

The tools now produce the *how*, faster than any of us. They do not produce the *why* with someone accountable for it: which trade-off, for which characteristic, at what cost, written down where the next person can find it. Systems fail at their boundaries, and boundaries are drawn by judgment. That judgment is now yours, practiced on Encore, tested on 14 katas and defended at Meridian.

Go draw good boundaries. And write down why.

### References

- Google Cloud DORA — [*Accelerate State of DevOps Report 2024*](https://dora.dev/research/2024/dora-report/). Google Cloud, 2024 — free online.
- Camille Fournier, Ian Nowland — [*Platform Engineering*](https://www.oreilly.com/library/view/platform-engineering/9781098153632/). O'Reilly, 2024.
- Diana Montalion — [*Learning Systems Thinking*](https://www.oreilly.com/library/view/learning-systems-thinking/9781098151324/). O'Reilly, 2024.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Christian Ciceri, Dave Farley, et al. — [*Software Architecture Metrics*](https://www.oreilly.com/library/view/software-architecture-metrics/9781098112226/). O'Reilly, 2022.
- Neal Ford, Rebecca Parsons, Patrick Kua, Pramod Sadalage — [*Building Evolutionary Architectures*, 2nd ed.](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/). O'Reilly, 2022.
- Will Larson — [*Staff Engineer: Leadership Beyond the Management Track*](https://staffeng.com/book/). Self-published, 2021 — free online.
- Gregor Hohpe — [*The Software Architect Elevator*](https://www.oreilly.com/library/view/the-software-architect/9781492077534/). O'Reilly, 2020.
- Will Larson — [*An Elegant Puzzle: Systems of Engineering Management*](https://press.stripe.com/an-elegant-puzzle). Stripe Press, 2019.
- Eben Hewitt — [*Technology Strategy Patterns*](https://www.oreilly.com/library/view/technology-strategy-patterns/9781492040866/). O'Reilly, 2018.
- Donella H. Meadows — [*Thinking in Systems: A Primer*](https://www.chelseagreen.com/product/thinking-in-systems/). Chelsea Green, 2008.
- Matthew Skelton, Manuel Pais — [*Team Topologies*, 2nd ed.](https://itrevolution.com/product/team-topologies-second-edition/). IT Revolution, 2025.
- Simon Wardley — [*Wardley Maps*](https://learnwardleymapping.com/book/) — free online.
