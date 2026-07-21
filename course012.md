# Course 12: Architecting AI Systems — LLMs, RAG, and Agents

> The model is the least important part of your AI system, and the only part everyone talks about.

## Welcome

Eleven courses of this specialization share one silent assumption: components are deterministic. Call Inventory twice with the same input, get the same answer. That assumption dies here. A model-backed component returns *plausible distributions* — usually right, occasionally weird, never guaranteed — and this changes testing (into evaluation), latency (into token economics), and security (into linguistics). What does not change is everything else, which is this course's actual thesis: AI systems are ordinary distributed systems with one extraordinary component, and the architects who succeed with them are the ones who bring Courses 1–11 along instead of forgetting them in the excitement.

Encore has real AI ambitions to anchor us: demand forecasting for organizers (classic ML), a support assistant that knows Encore's policies and the fan's actual order (RAG), and — most ambitiously — an agent that can *do* things: rebook a ticket, process a refund within policy. The treatment is vendor-neutral: models improve monthly, but the architecture around them is what you'll still own in five years.

## Module 1: AI in the System Topology

### A component with a probabilistic contract

Place the model on the C4 diagram like anything else, then read its contract honestly: inputs are unbounded natural language, outputs are likely-but-not-guaranteed, latency is seconds and token-proportional, and cost is *per call* — a pricing model no other component has. Each clause bends an old rule: probabilistic output demands validation and fallbacks (Module 4); token latency demands streaming (Course 8 predicted this); per-call pricing makes caching and routing *economic* decisions (Module 5).

Integration topology comes in three maturities. **Direct calls** (each service hits a provider SDK): fine for one feature, then keys, versions, and costs scatter. **The AI gateway** — one internal service owning provider credentials, model routing, caching, rate limits, cost attribution, and audit — is the pattern Encore adopts the week it has two AI features (it is Course 7's gateway lesson, respoken: cross-cutting concerns centralize; the gateway must never grow *prompts*, which are business logic). **The router** adds capability tiers: cheap-fast models for classification and extraction, frontier models for the hard 10% — most workloads are tier-one wearing tier-three invoices.

Classic ML keeps its seat: forecasting, ranking, and fraud scoring remain trained-model territory with their own discipline — feature pipelines (consumers of Course 9's data products, as promised), model registries with versioned lineage, and the online/offline skew problem: the feature computed overnight in a warehouse and the "same" feature computed at request time drift apart silently; the architectural cure is *one definition, two serving speeds* — a feature store or shared transformation code, never two implementations of one idea.

**Recap.** The model is a component with an honest, unusual contract. Centralize provider concerns in a gateway (never prompts); route by capability tier; keep classic ML's feature discipline — one definition across offline and online.

**Exercise 1.1.** For an AI feature you know (or Encore's support assistant): write its contract as Course 7 would — inputs, outputs, latency, cost per call, and the three failure modes a caller must handle.

## Module 2: Retrieval-Augmented Generation

### Grounding is a data pipeline, not a prompt trick

A base model knows the internet's past and nothing about *your* refund policy or order #881. RAG closes the gap by retrieving relevant private context and placing it in the prompt — which means RAG quality is decided in a *data pipeline* long before any model sees a token:

<pre class="mermaid">
flowchart LR
    src[["Data products<br/><small>policies · orders · FAQs (Course 9)</small>"]] --> chunk["Chunking<br/><small>semantic units, not page breaks</small>"]
    chunk --> emb["Embedding"] --> idx[("Vector + keyword index")]
    q([Fan's question]) --> qr["Query rewrite<br/><small>+ fan's context</small>"] --> idx
    idx -- "top-k candidates" --> rr["Reranker"] -- "best 3–5" --> llm["Model<br/><small>answer with citations</small>"]
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class idx,rr hot
</pre>

*Figure 1 — The RAG pipeline. The highlighted stages are where quality is won: hybrid (vector + keyword) retrieval, because embeddings miss exact codes and names that keyword search catches; and reranking, because the cheap first pass optimizes recall while the reranker buys precision. The model merely phrases what retrieval found.*

Two architectural commitments distinguish production RAG from demos. First, **the corpus is a data product** — Course 9's anatomy verbatim: owned, contracted, freshness-SLO'd, lineage-tracked. When Encore's refund policy changes, the corpus re-ingests within the hour *because a pipeline subscribed to the policy product*, not because someone remembered. Second, **permissions survive retrieval**:

> **The retrieval-leakage trap.** An index built from documents with access rules, queried without them, answers anyone's question with everyone's data — the support assistant happily quoting another fan's order. Access filtering must be *structural* — permission metadata on every chunk, filters applied inside the retrieval query — never left to the model's discretion. The model has no discretion; it has probabilities. (Course 10 called this shot.)

Why RAG before fine-tuning: retrieval updates in minutes, cites its sources, respects per-user permissions, and costs a pipeline; fine-tuning bakes knowledge into weights — stale on arrival, uncitable, permission-blind — and earns its keep for *style and format*, not facts.

**Recap.** RAG is a data pipeline with a model at the end: hybrid retrieval + reranking decide quality; the corpus is an owned data product; permissions are enforced in the query, structurally. Fine-tune for tone, retrieve for truth.

**Exercise 2.1.** Design the corpus for Encore's support assistant: which three data products feed it, each one's freshness SLO, and the permission metadata a chunk of order history must carry.

## Module 3: Agentic Architectures

### The loop that acts

An agent is a model in a loop with tools: observe, decide, call a tool, read the result, repeat until done. That loop is an *orchestration problem* — Course 6 built the vocabulary — with one alarming novelty: the workflow is chosen at runtime by a probabilistic component. Treat it accordingly:

| Agent element | Its Course 1–11 ancestor | The AI-era twist |
|---|---|---|
| Tools | APIs with contracts (Course 7) | described in language; *the description is the interface* |
| Loop control | workflow engine (Course 6) | steps are proposed, not scripted — so bound them |
| State/memory | context + stores | the context window is a budget, curated not accumulated |
| Failure containment | timeouts, budgets (Course 4) | step caps, token budgets, spend ceilings |
| Authority | authorization (Course 10) | *the agent's identity, not the user's God-token* |

*Figure 2 — Agents as distributed systems with a probabilistic scheduler. Every row is an old discipline with a new clause; teams that skip the left column rediscover it in incident reviews.*

Encore's rebooking agent, designed by the table: tools are the *existing* APIs (`holds:write`, `refunds:request` — Course 7's scopes become the agent's permission vocabulary); the loop runs inside a workflow engine with step and token budgets; and authority follows one bright line — **read freely, write within policy, and cross-policy actions summon a human**. The refund beyond €200 does not fail; it *escalates*, arriving as a proposal with evidence for one-click approval (Course 8's human-in-the-loop affordances, now load-bearing). Sandboxing (Course 10) applies in full: an agent is untrusted execution steered by untrusted input; its tools run least-privileged, its egress is scoped, and prompt-injected instructions in a fan's message meet the same wall any attacker would. Multi-agent topologies — planner/executor, specialist pools — are microservices logic applied to cognition: split when a single context degrades (too many tools, mixed concerns), and not before; a fleet of agents without boundaries is event spaghetti that bills by the token.

**Recap.** Agents are orchestration with runtime-chosen steps: real engines, real budgets, tool contracts as carefully written as APIs. Authority is scoped and escalation is designed. Split into multiple agents for the reasons you'd split services — never for spectacle.

**Exercise 3.1.** Specify the rebooking agent's tool list: name, scope, read-or-write class, and the policy line above which each write escalates to a human.

## Module 4: Quality, Safety, and Security

### Evaluation is the new testing

A probabilistic component cannot be unit-tested into confidence; it is *evaluated*: a golden set of real cases (Encore: two hundred anonymized support conversations with known-good outcomes), scored per release — exact checks where possible (did the cited order exist? was the refund within policy?), model-graded rubrics where judgment is required (with the judge itself spot-audited; LLM-as-judge is a measurement instrument, and instruments get calibrated). The evals run in CI like any fitness function: a prompt change, model upgrade, or retrieval tweak that drops the score *fails the build*. This single habit — evals as regression gates — separates teams that improve steadily from teams that oscillate between demos.

Guardrails wrap the runtime in layers, none sufficient alone: **structured outputs** (schema-constrained responses, validated like any API payload — the cheapest, most reliable guardrail); **input/output filtering** (injection heuristics inbound; PII and policy screens outbound); **grounding checks** (answers must cite retrieved sources; uncited claims degrade to "let me connect you with support" — the designed apology, Course 8 taught the manners). Security inherits Course 10's frame with the new attack surface named: prompt injection is untrusted input becoming instructions — mitigated by privilege separation (Module 3's scoped tools), never by politeness in the system prompt; and the STRIDE table gets rerun over every AI feature, because "Information disclosure" now includes *the model summarizing what it should not have retrieved* (Module 2's structural filters are the answer, again). Monitoring completes the loop: drift dashboards (topic mix, escalation rate, groundedness sampled in production), because the corpus, the users, and the upstream model all change under you — Course 11's observability, plus a quality dimension no latency graph shows.

**Recap.** Golden sets + calibrated judges + CI gates make quality a regression-tested property. Guardrails layer: schemas first, filters and grounding checks after. Injection is defeated by privilege separation, not prompt courtesy. Production quality is monitored like latency.

**Exercise 4.1.** Draft ten golden cases for the support assistant, including two adversarial ones (an injection attempt; a question whose correct answer is "I can't help with that"). Define pass criteria for each.

## Module 5: Operating AI at Scale

The invoice arrives token-denominated, and Course 11's disciplines apply with new arithmetic. **Unit economics**: Encore tracks *AI cost per resolved conversation* — model spend ÷ resolutions — and watches the denominator as closely as the numerator (a cheaper model that resolves less is a false economy the ratio catches). The cost levers, in order of leverage: **routing** (the two-tier insight from Module 1 — classify-and-route sends 80% of turns to a model a tenth the price), **caching** (semantic caches for repeated questions; prompt-prefix caching for the shared system context — Course 4's staleness discipline, token edition), **budgeting** (per-feature spend ceilings with graceful degradation to templated answers — load shedding, Course 4, wearing a beret). **Latency** is perceived through Course 8's lens: stream everything, prefetch retrieval while the user types, and measure time-to-first-token, which is the number users feel. **Multi-tenancy** previews Course 13 with teeth: per-tenant isolation of prompts, corpora, and *spend* — one tenant's runaway agent must throttle inside its own budget, not everyone's — and tenant data never crosses corpus boundaries, structurally. The through-line of the whole course, one last time: nothing here required forgetting the first eleven courses; every AI-scale problem yielded to an old discipline with new units.

**Recap.** Track cost per resolved outcome; route by tier, cache by meaning, budget with graceful degradation. Stream for perceived latency. Tenant boundaries cover prompts, corpora, and spend.

**Exercise 5.1.** Estimate the support assistant's economics: turns per conversation, tokens per turn, tier mix, cost per resolution — then compute what the routing layer is worth per month at 50,000 conversations.

## Kata: The Firm's Memory

> **Your brief: "Archivist."** An AI knowledge assistant for a 900-lawyer firm. Corpus: forty years of briefs, contracts, and memos — *privileged*, matter-scoped (a lawyer may only see matters they're staffed on), some under ethical walls (two teams at the same firm on opposite sides of adjacent matters). Asks: research Q&A with citations, first-draft generation in the firm's style, and an agent filing court-deadline reminders into calendars. Hard constraints: no client data may train or leave for third-party models without contract cover; the managing partner wants "provable" answer provenance; billing wants AI cost per matter.

**Deliverables:**

1. **Topology** — gateway/router design, tier strategy, and the on-prem vs. API model decision as an ADR with data-governance losses in ink.
2. **RAG design** — Figure-1 pipeline with matter-scoping and ethical walls as *structural* retrieval filters; corpus-as-data-product sheet with freshness SLOs.
3. **Agent spec** — the deadline agent's tools, scopes, budgets, and escalation lines (what may it write to a partner's calendar unasked?).
4. **Eval pack** — fifteen golden cases including two ethical-wall probes and one injection attempt hidden in a document; CI gate policy.
5. **Economics sheet** — cost per matter instrumentation and the router's projected savings.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Structural permissions | Could any prompt, however crafted, cross an ethical wall? |
| Provenance | Is every answer's citation checkable by a skeptical partner? |
| Contained authority | What is the worst thing the agent can do unsupervised — and was that chosen? |
| Honest economics | Does the cost model survive 10× adoption without surprising billing? |

### Where you now stand

You can place a probabilistic component into a deterministic discipline: gateway'd, grounded, budgeted, evaluated, and contained. Encore, meanwhile, has quietly become something more than a product — venues now ask to run *their own* Encore. Selling one system to many customers is its own architecture, with its own physics of isolation, tiering, and cost attribution. Course 13: multi-tenant SaaS.

## References

- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- Adam Bellemare — [*Building an Event-Driven Data Mesh*](https://www.oreilly.com/library/view/building-an-event-driven/9781098127596/). O'Reilly, 2023.
- Current provider architecture guidance and practitioner literature — this domain outruns books; the disciplines above are what persists.
