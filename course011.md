# Course 11: Cloud-Native Operations — Serverless, Kubernetes, and SRE

> Architecture that cannot be operated is fiction with diagrams.

## Welcome

Every course so far has ended where the interesting part begins for someone else: the system, designed, must now run — at 3 a.m., during the on-sale, within a budget someone signs. This course is about that someone being you. Operations is not what happens after architecture; it is architecture's feedback loop, the place where trade-offs stop being tables and start being invoices and pages.

Three questions organize the course. *Where should each workload run* — the container/serverless decision, made per workload like every other choice in this specialization? *How does change reach production safely* — infrastructure as code, GitOps, progressive delivery? And *how do we know it's working* — observability grown into SRE practice, with cost as a first-class signal rather than finance's problem. Encore, as ever, supplies the worked examples, including one uncomfortable bill.

## Module 1: Cloud Execution Models

### The spectrum, priced in responsibility

Execution models differ in one currency: how much undifferentiated machinery you still own.

| Model | You own | You've shed | Fits |
|---|---|---|---|
| VMs | OS up | hardware | legacy, special kernels |
| Containers on Kubernetes | images, manifests, cluster policy | machines, scheduling | steady services, rich ecosystems |
| Serverless functions | code + configuration | servers, scaling, idle cost | spiky, event-shaped work |
| Managed services (queues, DBs, gateways) | configuration | the entire service | everything that isn't your differentiator |

*Figure 1 — The responsibility spectrum. The default reads bottom-up: managed first, functions for the spiky, containers for the steady, VMs under protest. Differentiation is the tiebreaker — Course 3's subdomain table again: core deserves your operational attention; generic deserves a managed service.*

Kubernetes, seen from the architect's altitude, is a declarative reconciliation engine — you state desired state, it converges reality — and that model (not the YAML) is why it won: self-healing, bin-packing, and an extension ecosystem. Its price is a *platform's* worth of complexity that someone must own; Kubernetes without a platform team is a hobby with an on-call rotation. Serverless inverts the cost curve: zero idle spend, instant scale, per-invocation billing — with cold starts, execution caps, and the discipline of statelessness as the fine print. The architect's job is matching curves to workloads: Encore's Catalog (steady, latency-sensitive) lives in containers; the Sale Gate — near-zero traffic for weeks, then 500× for minutes — is serverless's textbook case, and running it as always-on containers would mean paying for the spike's capacity every quiet Tuesday.

**Recap.** Own less by default; buy managed for generic, functions for spiky, containers for steady. Kubernetes is a reconciliation model with a platform-sized bill; serverless is a cost curve with fine print. Match per workload, not per fashion.

**Exercise 1.1.** Take three workloads you know. For each: traffic shape (steady/spiky/scheduled), latency tolerance, and the Figure-1 row it *should* occupy. Note any current mismatch and its monthly cost in idle capacity or ops effort.

## Module 2: Delivery Infrastructure

### The environment is code, and git is the control plane

Two disciplines turn infrastructure from artisanal to industrial. **Infrastructure as code**: every cluster, queue, and permission declared in versioned files — reviewable, diffable, reproducible; the console is for looking, never for changing (the 2 a.m. console fix that saves the night and haunts the quarter is how snowflakes are born). **GitOps** closes the loop: agents continuously reconcile the cluster to the repository, so git *is* the deployment mechanism, the audit log, and — via `git revert` — the rollback story. Drift becomes visible instead of legendary.

On this substrate, Course 5's progressive delivery gets its infrastructure teeth: canaries promoted automatically on SLO health (Module 3's error budgets doing the judging), feature flags separating deploy from release, and ephemeral preview environments per pull request — the pattern that quietly kills both "works on my machine" and the shared-staging queue. The scoreboard for all of it is the **four key metrics** — deployment frequency, lead time, change-failure rate, time-to-restore — which measure the *system's* delivery health, not any team's virtue, and which correlate with business outcomes better than any architecture diagram ever has. Encore's dashboard shows them per service; when lead time creeps up, that is architectural feedback (coupling returning, tests slowing) wearing an operational costume.

**Recap.** IaC makes environments reproducible; GitOps makes git the control plane and revert the rollback; previews replace staging queues; canaries answer to error budgets. The four key metrics are the delivery scoreboard and an architectural early-warning system.

**Exercise 2.1.** Measure your four key metrics for last month, however roughly. Which is worst, and is its cause operational (pipeline, approvals) or architectural (coupling, test depth)?

## Module 3: Observability and SRE

### From "is it up?" to "why is it weird?"

Course 5 installed the instruments — logs, metrics, traces, correlation IDs. SRE practice turns them into a decision system. The chain: **SLI** (what users experience, measured: "seat-map p99 latency"), **SLO** (the promise: "≤ 800 ms, 99.9% of a rolling 28 days"), **error budget** (the arithmetic complement: 0.1% ≈ 40 minutes/month of allowed badness). The budget is the masterstroke, because it converts the eternal speed-vs-stability argument into policy that needs no meeting:

<pre class="mermaid">
flowchart LR
    b{"Error budget<br/>remaining?"} -- "yes" --> ship["Ship features<br/><small>canaries promote, flags open</small>"]
    b -- "burning fast" --> slow["Slow down<br/><small>canaries hold, risky flags freeze</small>"]
    b -- "exhausted" --> harden["Reliability work only<br/><small>until budget recovers</small>"]
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class b hot
</pre>

*Figure 2 — The error budget as automatic policy. Nobody argues about whether to ship; the budget already decided. Product and reliability stop being departments and become two hands on one dial.*

Alerting inherits the philosophy: page on *symptoms* (SLO burn rate — users are hurting) and never on causes (CPU is high — maybe fine, maybe Tuesday); everything else is a dashboard for business hours. An on-call rotation paged only when users hurt, with a runbook per alert, is sustainable; one paged on causes burns out precisely the engineers who wrote the most instrumentation. And when things break anyway: **blameless postmortems** whose real product is architectural feedback — Encore's retry-storm outage (Course 4) produced not "be more careful" but retry budgets in the mesh defaults, a Course-1-style fitness function, and a better Tuesday. Incidents are the system tuition; postmortems are collecting the education.

**Recap.** SLIs measure experience, SLOs promise it, error budgets arbitrate speed vs. stability automatically. Page on symptoms, dashboard the causes, runbook every page. Postmortems convert incidents into architecture.

**Exercise 3.1.** Write the SLI/SLO/budget triple for your product's most user-visible operation. Then check last month's alerts: how many were symptoms vs. causes?

## Module 4: Cost, Capacity, and Sustainability

### The invoice is a telemetry stream

In the cloud, every architectural decision bills monthly — which makes cost an operational *signal*, not an accounting afterthought. FinOps for architects reduces to three moves. **Unit economics**: raw spend is noise; spend per business unit is signal. Encore's number is *cost per ticket sold* — when it drifts from €0.11 to €0.19, something architectural happened (a chatty new service, an unindexed query, logging gone verbose), and the graph says so before the CFO does. **Cost as fitness function**: budgets per service with CI-time estimation on infrastructure diffs and alerts on drift — the same governance pattern, currency edition. **Capacity honesty**: autoscaling is not a strategy but a mechanism; the strategy is knowing your ceilings (that database connection pool from Course 4), load-testing to them, and pre-scaling for the known spikes (Encore schedules its on-sales; ops warms the pools — elasticity plus a calendar beats elasticity alone).

Serverless gets the sharp version of the lesson: per-invocation pricing means the cost curve *is* the traffic curve — brilliant for the Gate's spikes, ruinous for a chatty always-on workload where the same math runs backward (Encore's bill: a metrics poller invoking a function every 200 ms — €9,000/month to ask "anything new?" — moved to a container for the price of lunch). The rule: serverless when idle-heavy or spike-shaped; containers when busy-steady; *arithmetic, not allegiance*. Sustainability, the emerging column in the same table, mostly rides efficiency's coattails — right-sizing, spot capacity for interruptible work, region choice where latency permits — the rare virtue that lowers the bill as it lowers the carbon.

**Recap.** Track cost per business unit and alert on drift; estimate cost at review time like any other characteristic. Autoscaling needs known ceilings and a calendar. Serverless-vs-container is arithmetic on traffic shape; sustainability mostly is efficiency.

**Exercise 4.1.** Define your product's unit cost (per order, per user-day, per API call). Pull two months of data and compute it. What architectural event explains the biggest wiggle?

## Module 5: Operability by Design

The closing move gathers the course into a design-time discipline. **Production readiness** becomes a checklist any service answers before first deploy — SLOs declared? runbooks written? scaling ceilings known? dashboards wired? cost budget set? backup *restore* tested (a backup never restored is a hope with storage costs)? — not as bureaucracy but as the operational twin of Course 1's characteristics worksheet. **Testing meets cloud reality**: local fidelity has limits, especially serverless — so contract tests around managed services, ephemeral environments for integration, and Module 2's canaries as the final examiner. **Lifecycle honesty**: runtimes, base images, and dependencies age like fruit, not wine; upgrading is scheduled maintenance owned like features (the platform's automation in Course 14 will make it ambient). The module's — and course's — thesis in one line: *operability is a property you design, then verify with fitness functions, exactly like every other characteristic since Course 1.* And with that, a door opens this course cannot walk through alone: everything here — golden pipelines, SLO tooling, cost dashboards, readiness checks — wants to be *productized* so seventy teams get it for free. Hold that thought two courses.

**Recap.** Readiness is a pre-deploy worksheet; restores are tested, not assumed; canaries examine what local tests cannot; upgrades are owned work. Operability is a designed, verified characteristic.

**Exercise 5.1.** Run the readiness checklist against a service you own today. Every "no" is either this sprint's work or an accepted risk — write down which.

## Kata: The Locker Network

> **Your brief: "Relay."** A parcel-locker network: 40,000 lockers across three countries, each phoning home over flaky cellular (opens, deposits, alarms), a courier app, a consumer pickup app, and carrier integrations. Traffic: steady trickle from lockers, evening pickup peaks, Black-Friday-week 20×. A hardware quirk: lockers batch-retry after connectivity gaps — a regional cellular outage ending means 3,000 lockers reconnecting *at once*. Eighteen engineers, two countries' worth of on-call grumbling, cloud bill growing 8%/month with revenue growing 3%.

**Deliverables:**

1. **Execution-model map** — Figure-1 rows for: locker ingestion, courier/consumer APIs, carrier batch jobs, alarm processing. The reconnection-storm design named explicitly.
2. **Delivery design** — GitOps layout, preview-environment story, and the canary policy for firmware-adjacent services where rollback is slow.
3. **SRE pack** — SLI/SLO/budget for pickup availability; the symptom alert set; the runbook skeleton for "regional cellular outage."
4. **Cost intervention** — define Relay's unit cost; three hypotheses for the 8%-vs-3% divergence and the telemetry that would confirm each.
5. **One ADR** — buffer-and-shed design for the reconnection storm, losses in ink.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Shape matching | Does each workload's execution model match its traffic shape, with arithmetic? |
| Storm authorship | Is the 3,000-locker reconnection designed for, or discovered annually? |
| Budget governance | Does the error budget, not a manager, decide when firmware canaries promote? |
| Unit economics | Is the cost divergence diagnosed with a business denominator, or hand-waving? |

### Where you now stand

You can place workloads, industrialize delivery, promise reliability arithmetically, and read the invoice as telemetry. The next course takes the specialization's boldest turn: systems whose central component is *probabilistic* — where "correct" becomes a distribution, testing becomes evaluation, and a new class of security surface walks in speaking natural language. Course 12: architecting AI systems.

## References

- Sheen Brisals, Luke Hedger — [*Serverless Development on AWS*](https://www.oreilly.com/library/view/serverless-development-on/9781098141929/). O'Reilly, 2024.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.
- Sarah Wells — [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/). O'Reilly, 2024.
- Christian Ciceri, Dave Farley, et al. — [*Software Architecture Metrics*](https://www.oreilly.com/library/view/software-architecture-metrics/9781098112226/). O'Reilly, 2022.
- Brendan Burns — [*Designing Distributed Systems*, 2nd ed.](https://www.oreilly.com/library/view/designing-distributed-systems/9781098156343/) O'Reilly, 2024.
