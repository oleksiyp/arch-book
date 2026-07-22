# Course 4: Distributed Systems Foundations for Architects

> Distribution is not an upgrade; it is a mortgage. This course is the amortization table.

## Welcome

Encore extracted Sale Gate in Course 2 and drew context boundaries in Course 3, and in doing so quietly signed a contract with physics. The moment two components speak over a network, a new set of laws applies: messages get lost, arrive twice, or arrive late; clocks disagree; half of a system can die while the other half keeps cheerfully working. No framework repeals these laws. Architects who don't know them design systems that work in demos and fail on Saturdays.

This course is the physics and the engineering that survives it. The treatment is deliberately architect-shaped: you will not implement a consensus protocol, but you will be able to predict how a system behaves at 10× load and half a network, read a database vendor's consistency claims with a customs officer's eyes, and design the failure behavior instead of discovering it. Encore will have its first real outage in Module 4. It will be self-inflicted, as most are.

## Module 1: The Physics of Distribution

### The eight famous lies

The fallacies of distributed computing are eight assumptions every engineer makes until production removes them. They deserve to be read as a bill of costs:

| The lie | The truth's bill for Encore |
|---|---|
| The network is reliable | Every Gate→Inventory call needs a timeout and a retry policy — designed, not defaulted |
| Latency is zero | A seat-map render that makes 30 sequential calls spends its entire budget on speed-of-light |
| Bandwidth is infinite | Shipping the full seating map on every update melts the on-sale |
| The network is secure | Course 10's entire syllabus |
| Topology doesn't change | Deploys, autoscaling, and failovers reshuffle addresses hourly |
| There is one administrator | The PSP's maintenance window is not on Encore's calendar |
| Transport cost is zero | Serialization and TLS handshakes are real CPU on the hot path |
| The network is homogeneous | The fan on stadium Wi-Fi is part of your distributed system too |

*Figure 1 — Eight assumptions, eight invoices. The first two fund most of this course.*

### Time, ordering, and the duty of idempotency

In one process, "before" and "after" are facts. Across machines they are opinions: clocks drift, messages race, and log timestamps from two servers cannot settle an argument. Two working consequences. First, *order must be designed* where it matters — sequence numbers, versions, single-writer ownership (Course 3's aggregates suddenly look prescient: one owner per invariant is an ordering strategy). Second, and non-negotiable:

> **The duty of idempotency.** Any operation that crosses a network will eventually be retried — by your code, a proxy, or a double-clicking fan. Every such operation must be safe to apply twice. "Charge card for order 123" is a bug; "charge order 123's single charge-intent" is engineering. Idempotency is not a pattern you add later; it is a property you owe from day one.

### Tails, not averages

The last physics lesson is statistical. Users do not experience your average latency; they experience the tail — and tails compound viciously: a page fanning out to 10 services, each with a modest 1-in-100 chance of a 2-second stall, stalls for roughly one page-load in ten. At Encore's on-sale rates, "p99 = 2s" means thousands of fans in molasses at the worst possible minute. Architects budget latency at p99, and treat every fan-out as tail multiplication.

**Recap.** The network lies eight ways; timeouts, retries, and bandwidth discipline are the tax. Order is designed, not assumed. Everything retryable must be idempotent. Latency lives in the tail, and fan-out multiplies it.

**Exercise 1.1.** Find one non-idempotent network operation in a system you know (payment, email, counter). Describe the double-fire scenario and the smallest fix.

## Module 2: State — Replication, Partitioning, Consistency

### Copies and slices

State scales along exactly two axes. **Replication** makes copies — for surviving machine death and for serving hot reads (Encore's catalog: written weekly, read millions of times an hour on tour-announcement day). **Partitioning (sharding)** makes slices — when writes outgrow one machine, data splits by key. Choose keys for even spread and single-shard access: Encore partitioning seats by `event_id` keeps each on-sale on one shard's fast path — and concentrates each on-sale's fury on one shard, a trade-off we accept knowingly (the Gate meters it) rather than discover in an incident review.

Replication's price is the gap between copies. The leader acknowledges a write; a follower answers the next read; the fan who just bought a ticket asks "my tickets?" and sees none. Nothing crashed — the system is merely being honest about light-speed and buffers.

### The consistency menu

What vendors bury in appendices, architects must read as a menu with prices:

<svg viewBox="0 0 640 110" style="max-width:640px;width:100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Consistency spectrum">
  <defs>
    <linearGradient id="cons" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6c2bd9"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="20" y="40" width="600" height="16" rx="8" fill="url(#cons)"/>
  <text x="20" y="26" font-family="sans-serif" font-size="13" fill="#5a23c8" font-weight="bold">stronger — slower, coordination-hungry</text>
  <text x="620" y="26" font-family="sans-serif" font-size="13" fill="#0b7ecb" font-weight="bold" text-anchor="end">weaker — faster, available</text>
  <line x1="70" y1="56" x2="70" y2="72" stroke="#5a23c8" stroke-width="2"/>
  <text x="70" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">linearizable</text>
  <line x1="260" y1="56" x2="260" y2="72" stroke="#5a23c8" stroke-width="2"/>
  <text x="260" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">causal</text>
  <line x1="420" y1="56" x2="420" y2="72" stroke="#0b7ecb" stroke-width="2"/>
  <text x="420" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">read-your-writes</text>
  <line x1="570" y1="56" x2="570" y2="72" stroke="#0b7ecb" stroke-width="2"/>
  <text x="570" y="90" font-family="sans-serif" font-size="11" fill="#333" text-anchor="middle">eventual</text>
</svg>

*Figure 2 — The consistency spectrum. The senior move is refusing to buy one level for the whole system: seat allocation is linearizable; ticket lists are read-your-writes; view counters are eventual. Consistency is purchased per invariant, not per company.*

CAP, correctly read, says only this: when a partition happens (and it will), each *operation* chooses — refuse to answer (consistency) or answer possibly-stale (availability). PACELC adds the everyday clause: even without partitions, stronger consistency costs latency, always. Seat-sale: choose C, proudly show "high demand, retrying." Catalog browse: choose A, always. The database serving both must let you choose *per operation* — that sentence disqualifies half the candidates in any vendor bake-off, which is precisely its value.

Underneath the strong end sits consensus (Raft and kin): machines voting on one truth, majorities required. Architect-level takeaways only: odd cluster sizes, a leader's failover pause is your write downtime, and quorums across regions pay intercontinental round-trips *per write* — which is why "global strongly-consistent and fast" appears only in marketing.

**Recap.** Replicate for reads and survival; partition for writes; choose keys for spread and single-shard flows. Consistency is a per-invariant purchase — pin your invariants to levels before choosing storage.

**Exercise 2.1.** List four data items in a system you know. Assign each the weakest consistency level the business genuinely tolerates — then name which your current database actually delivers.

## Module 3: Scalable Service Architectures

### The reference shape

Most scalable request-serving systems converge on one silhouette, worth having as reflex:

<pre class="mermaid">
flowchart LR
    fans([Clients]) --> lb["Load balancer"]
    lb --> s1["Service instance"] & s2["Service instance"] & s3["..."]
    s1 & s2 --> cache[("Distributed cache")]
    s1 & s2 --> db[("Primary store")]
    s1 & s2 -- "slow/async work" --> q[["Queue"]]
    q --> w1["Workers (scale independently)"]
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class lb,q hot
</pre>

*Figure 3 — The workhorse topology. Its two load-bearing ideas are highlighted: statelessness at the balancer (any instance can serve anyone) and the queue (turning spikes into schedules).*

**Statelessness** is what makes the left half elastic: session state lives in the cache or a token, never in instance memory, so scaling is "add instances" and failure is "who cares." **Caching** buys read scale at a known price — staleness and invalidation. Cache-aside with TTLs covers most needs; the discipline is declaring *per item* how stale is acceptable (catalog: minutes; seat availability: never — cache the map's geometry, never its truth). **The queue** is the deepest idea on the diagram: a synchronous call demands the callee be alive *now*; a queued message asks only that it be alive *eventually*. Ticket-issuance behind a queue turns Encore's spike into a backlog that drains in minutes — invisible, because fans got "purchase confirmed" from the only part that had to be synchronous.

One naming ritual completes the vocabulary: **scatter/gather** (fan out, assemble answers — ruled by the slowest shard, Module 1's tail math), and the Kubernetes-native trio — **sidecar** (per-instance helper for TLS/telemetry), **ambassador** (local proxy for remote things), **adapter** (uniform faces on diverse services). You will meet them wearing a "service mesh" badge in Course 5.

**Recap.** Stateless tier + cache + queue is the reference silhouette. Staleness is declared per item; queues convert spikes into schedules; the async boundary is an architectural decision, not an optimization.

**Exercise 3.1.** Redraw Figure 3 for Encore's purchase flow, marking exactly which arrow is the synchronous "moment of truth" and why everything else can queue.

## Module 4: Resilience Engineering

### Anatomy of a self-inflicted outage

Encore's first big on-sale after extraction. Payment provider slows: 200 ms → 8 s. Order threads pile up waiting; the thread pool exhausts; health checks (same pool) fail; the autoscaler helpfully adds instances, which open *more* connections against the struggling PSP; client timeouts fire and *retry*, tripling load. Payments limp — but Encore is down. Total damage from one slow dependency and default settings.

Read the chain again: no component failed. Every link did its naive best. Resilience is the discipline of breaking this chain at every joint:

| Link in the chain | The breaker |
|---|---|
| Waiting forever on a slow call | **Timeouts** — aggressive, budgeted end-to-end (fan's 3 s budget allocates ~800 ms to PSP) |
| Retries amplifying load | **Backoff + jitter**, retry *budgets* (never >X% of traffic), idempotency prerequisite |
| Slowness spreading between dependencies | **Bulkheads** — separate pools per dependency; PSP's pool drains, seat-viewing's doesn't |
| Hammering a dying dependency | **Circuit breaker** — fail fast, probe gently, recover automatically |
| Load exceeding capacity | **Load shedding & backpressure** — reject early, cheaply, honestly; that is the Gate's whole job |

*Figure 4 — Each link of the outage chain has a named countermeasure. None is exotic; all must be present, because the chain is only as broken as its strongest link.*

<pre class="mermaid">
stateDiagram-v2
    Closed --> Open : failures exceed threshold
    Open --> HalfOpen : cool-down elapses
    HalfOpen --> Closed : probe succeeds
    HalfOpen --> Open : probe fails
    note right of Open : calls fail instantly —\nno threads parked,\ndependency gets air
</pre>

*Figure 5 — The circuit breaker's three states. Its gift is twofold: your threads stop dying in queues, and the struggling dependency gets the quiet it needs to recover.*

Two closing disciplines make resilience real rather than aspirational. **Graceful degradation** is designed beforehand: PSP down → accept orders, hold seats, charge when it recovers ("your card will be charged shortly" kept Encore's rival selling through their PSP's outage; nobody remembers, which is the point). And **chaos testing** turns all of it into Course 1 fitness functions: kill an instance, inject 5 s of PSP latency in staging, assert the breakers open and the queues drain. A resilience pattern you have never watched fire is a rumor.

**Recap.** Cascades are chains of naive best-effort; break every link — timeouts, budgeted retries, bulkheads, breakers, shedding. Degradation is designed in advance. Chaos experiments make resilience a tested property, not a hope.

**Exercise 4.1.** Trace your system's most important synchronous dependency. Answer in writing: timeout? retry budget? separate pool? breaker? what do users see when it's down? Any blank answer is your next sprint.

## Module 5: Scale Design Kata

> **Your brief: "Beacon."** Live-score platform for a football league. 2 M concurrent fans on match days (35 M peak during cup finals), each expecting score updates within 2 seconds of the referee's whistle. Between matches: near-zero traffic. Also: a betting-partner API with a *hard* requirement — odds-relevant events (goals, red cards) must be delivered in order, exactly-once-in-effect, with p99 < 500 ms. Fifteen engineers. Cloud budget: "startup, not sovereign wealth fund."

**Deliverables:**

1. **Capacity model** — a table: reads/sec and writes/sec at match-peak and final-peak, fan-out factor per score update, and the arithmetic that sizes the fan-facing tier.
2. **Topology** — Figure-3-grade diagram; mark the synchronous moment(s) of truth, every queue, every cache with its declared staleness.
3. **Consistency ledger** — for fan scores vs. betting events: consistency level, ordering strategy, idempotency mechanism.
4. **Failure-mode analysis** — three failures (instance death, stats-provider stall, region loss): the designed behavior of each, plus the chaos experiment that proves it.
5. **Two ADRs** — the load-shedding policy for final-day overload, and the betting-API delivery design.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Arithmetic | Does the capacity model survive multiplication, or is it vibes with units? |
| Tail honesty | Are latency promises stated at p99 and budgeted per hop? |
| Two-speed design | Are fans (eventual, cheap) and bookmakers (ordered, exact) served by *different* machinery? |
| Failure authorship | Is behavior under failure designed and chaos-tested, or inherited from defaults? |

### Where you now stand

You hold the physics: lies of the network, the price list of consistency, the reference topology, the resilience chain. What you have not yet done is run a *fleet* of services built this way — modeled, contracted, deployed, observed, and owned by teams who answer pagers. That operational and organizational reality is Course 5: microservices as they are actually lived.

## References

- Brendan Burns — [*Designing Distributed Systems*, 2nd ed.](https://www.oreilly.com/library/view/designing-distributed-systems/9781098156343/) O'Reilly, 2024.
- Ian Gorton — [*Foundations of Scalable Systems*](https://www.oreilly.com/library/view/foundations-of-scalable/9781098106058/). O'Reilly, 2022.

**Further reading:**

- Martin Kleppmann, Chris Riccomini — [*Designing Data-Intensive Applications*, 2nd ed.](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/) O'Reilly, 2025.
- Roberto Vitillo — [*Understanding Distributed Systems*, 2nd ed.](https://leanpub.com/understanding-distributed-systems) Leanpub, 2022.
- Alex Petrov — [*Database Internals*](https://www.oreilly.com/library/view/database-internals/9781492040330/). O'Reilly, 2019.
- Michael T. Nygard — [*Release It!*, 2nd ed.](https://pragprog.com/titles/mnee2/release-it-second-edition/) Pragmatic Bookshelf, 2018.
