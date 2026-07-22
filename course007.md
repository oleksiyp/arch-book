# Course 7: API Architecture — Contracts, Traffic, and Evolution

> An API is a promise made to strangers. Architecture is deciding which promises you can keep.

## Welcome

Encore is about to do something irreversible: publish an API. Venues want to embed ticket sales; resale partners want inventory feeds; a festival's app wants checkout inside their own brand. The moment the first partner ships against `api.encore.com`, Encore acquires consumers it cannot see, cannot version by email, and cannot break without consequences measured in contracts and lawyers.

That is what makes API architecture its own discipline rather than "REST conventions." Internal seams (Courses 5–6) connect teams who share a Slack; APIs connect strangers across trust and time. This course covers the full arc: designing contracts that model the business honestly, evolving them without breakage, operating them as traffic infrastructure, securing them against an internet that will absolutely try, and running the whole thing as a product. The platform lens runs throughout: an API program is the first platform most companies ever build, whether they notice or not.

## Module 1: Designing APIs

### Model the business, not the database

The beginner's API is the database with URLs: `GET /tables/orders?join=...`. The architect's API models the *domain's affordances* — what a consumer may meaningfully do: browse events, hold seats, purchase, refund. The test: could a partner integrate without a diagram of your schema? Three design decisions carry most of the weight:

**Resources and workflows.** Nouns get resources (`/events/{id}/seats`); multi-step business processes get *workflow resources* rather than abused verbs. Encore's seat hold — a temporary claim with a five-minute TTL — becomes `POST /holds` returning a hold resource with an expiry, not a `?action=lock` bolted onto a seat. Long-running operations return `202 Accepted` plus a status resource to poll — never a connection held open in hope.

**Errors as contract.** Partners integrate against your failures more than your successes. Structured error bodies (RFC 9457 problem details), stable machine-readable codes, and the golden rule: an error must tell the caller *whose move it is* — fix your request, retry later, or give up.

**Idempotency keys.** Course 4's duty, formalized at the edge: `POST /purchases` accepts an `Idempotency-Key`; retries replay the stored outcome instead of double-charging. No money-touching API ships without it.

### Choosing the protocol like an adult

| | REST/HTTP+JSON | gRPC | GraphQL |
|---|---|---|---|
| Sweet spot | public APIs, broad reach | internal service-to-service, low latency | client-driven aggregation, many UIs |
| Typing | schema by discipline (OpenAPI) | strict, compiled | strict schema, flexible queries |
| Caching | HTTP-native, superb | roll your own | hard (POST-shaped) |
| Client diversity | anyone with curl | generated stubs | needs tooling investment |
| Failure surface | familiar | deadline/cancel built in | one endpoint, complex authz per field |

*Figure 1 — The protocol decision, arbitrated as always by characteristics. Encore's answer is boringly correct: REST for the public API (reach, cacheability), gRPC where Course 5's services chat on the hot path, GraphQL nowhere — until Course 8 gives its BFFs a reason.*

Contract-first is the working method regardless of protocol: the OpenAPI (or AsyncAPI, for Course 6's streams) document is written, reviewed, and linted *before* code, because the contract outlives every implementation that serves it.

**Recap.** APIs model affordances, not tables; workflows get resources; errors and idempotency are contract, not garnish. Protocol choice is a characteristics decision, and the contract document precedes the code.

**Exercise 1.1.** Design the resource and verb set for Encore's seat hold → purchase flow, including the 402-decline and hold-expiry errors. Whose move is it after each?

## Module 2: Evolution and Compatibility

### Breaking changes are a tax on strangers

Course 5's expand–contract discipline returns with higher stakes: internal consumers redeploy weekly; the festival app ships through app-store review and may pin your API for a year. The constitution:

- **Additive forever.** New optional fields, new endpoints, new enum values (announced as open sets) — free.
- **Never repurpose.** Changing a field's meaning is worse than removing it: removal fails loudly, repurposing corrupts quietly.
- **Tolerant readers on both sides.** Consumers ignore unknowns; providers treat absent-new-fields as defaults.
- **Version as last resort.** A `v2` is not a release cadence; it is an admission that expand–contract failed. When needed: URL-versioned (`/v2/`), both live, migration funnel measured, `v1` sunset with dates in writing (`Deprecation` and `Sunset` headers, dashboards of laggard partners, and a human on the phone for the last three).

Hypermedia earns its pragmatic mention here: links in responses (`"cancel": {"href": ...}`) let servers move workflows without breaking clients that follow links instead of hardcoding paths. Ideology optional; the evolvability is real, and Encore uses it exactly where workflows are likeliest to change.

**Contract tests as border control.** The provider's CI replays every registered consumer's expectations (Course 5's machinery, now including *external* partners' published usage) — so "would v-next break the resale partner?" is a red build on Tuesday, not an outage on Friday.

**Recap.** Additive-only is the default physics; repurposing is the cardinal sin; v2 is a confession with a funnel and a sunset date. Links buy workflow evolvability; contract tests turn breakage into CI signal.

**Exercise 2.1.** Encore must split `price` into `base_price` + `fees` (regulatory). Design the no-break migration: field strategy, timeline, and what the last unmigrated partner experiences at sunset.

## Module 3: API Traffic Management

### The gateway earns its place at the edge

Public traffic enters through an **API gateway**, and the design question is what belongs there. The clean rule: *cross-cutting yes, business logic no* — authentication, rate limiting, quotas, caching, request shaping, canary routing live at the edge; anything that knows what a "seat" is belongs in services.

> **The new-ESB trap.** Every gateway product will happily host routing rules that transform payloads, orchestrate calls, and accrete business logic — congratulations, you have rebuilt the enterprise service bus and must now deploy your middleware to change your product. If a gateway config change requires a domain expert's review, logic has leaked upward.

North–south (edge) traffic is the gateway's job; east–west (service-to-service) belongs to Course 5's mesh — same mechanics, different trust context; collapsing the two couples your partner surface to your internal topology.

<pre class="mermaid">
flowchart LR
    p([Partners & apps]) --> gw["Gateway<br/><small>authn · quotas · rate limits · canary</small>"]
    gw --> bff["BFFs (Course 8)"]
    gw --> pub["Public API services"]
    subgraph internal["Internal — mesh territory (mTLS, retries, telemetry)"]
        pub --> inv["Inventory"] & ord["Orders"]
        bff --> inv
    end
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class gw hot
</pre>

*Figure 2 — Edge vs. interior. The gateway speaks to strangers about quotas; the mesh speaks to family about retries. Different conversations, different machinery.*

**Rate limiting as fairness engineering.** Per-partner quotas (the contract), burst allowances (token buckets), and — Encore's specialty — *event-scoped* limits during on-sales so one partner's enthusiastic polling cannot starve another's checkout. Limits are documented, returned in headers (`RateLimit-*`), and enforced with `429 + Retry-After`: predictable rejection is a feature; mysterious slowness is a support ticket.

**Releases at the edge.** Canary by header, partner tier, or percentage; shadow traffic (mirror production requests to v-next, discard responses) as the highest-fidelity test ever invented — Module 2's contract tests catch semantic breaks, shadows catch performance ones.

**Recap.** Gateways own cross-cutting edge concerns and must be defended against becoming ESBs; mesh owns the interior. Rate limits are contracts with headers. Canary and shadow traffic make API releases observable experiments.

**Exercise 3.1.** List everything your current edge (gateway, LB, nginx) does. Sort into "cross-cutting" and "knows the domain." The second column is your leak inventory.

## Module 4: API Security

### The internet is a hostile integration partner

Encore's API now fronts money and scarce inventory — precisely what OWASP's API Top 10 describes being looted. The architecture-level defenses:

**OAuth 2.x / OIDC, cast correctly.** Fans in apps: authorization-code + PKCE. Partners' servers: client-credentials with scoped, short-lived tokens. Nobody: passwords in API calls, long-lived static keys in mobile binaries. Scopes model *affordances* (`holds:write`, `events:read`) — Module 1's design vocabulary becoming the authorization vocabulary is not a coincidence; it is the sign both were modeled on the domain.

**Tokens without folklore.** JWTs: short-lived, audience-bound, algorithm-pinned, verified at the gateway *and* relied upon downstream via the mesh's identity (defense in depth, Course 10's zero-trust preview). Opaque tokens + introspection where revocation latency matters more than validation cost.

**The Top-10 habits.** The two that eat ticketing companies: *broken object-level authorization* — `GET /orders/{id}` must check the caller owns order `{id}`, on every object, every time (the gateway cannot do this; only the service knows) — and *unrestricted resource consumption* — which for Encore includes bots enumerating seat holds to lock inventory, why Bot Screening (Course 2) sits in front of exactly this API. Both become fitness functions: authorization tests per endpoint in CI, abuse scenarios in the load suite.

**Recap.** Right OAuth flow per audience; scopes model affordances; JWTs short, bound, and pinned. Object-level authorization is the service's burden and the auditor's first question. Abuse resistance is load-tested, not assumed.

**Exercise 4.1.** For `GET /holds/{id}`: enumerate every caller class (fan, partner, support tool) and write the object-level rule each must satisfy. Now check — where in your design is that rule *enforced*?

## Module 5: Running an API Program

An API with users is a product with a roadmap, whether staffed as one or not. The program disciplines: **developer experience** as conversion funnel (time-to-first-successful-call under ten minutes: instant sandbox keys, copy-paste quickstarts, docs generated from the OpenAPI contract so they cannot drift); **governance as linting** — style rules (naming, pagination, error shape) enforced by spectral-style checks in CI, so consistency across teams' APIs comes from tooling, not review meetings (Course 5's paved road, applied to contracts); and **lifecycle honesty** — every endpoint has an owner, a tier, an SLO, and a deprecation policy from birth. Encore's API portal is, quietly, its first platform product: self-service onboarding, golden-path contracts, guardrails in CI. Courses 13 and 14 will scale that pattern from one surface to the whole company.

**Recap.** DX is measured in minutes-to-first-call; governance ships as lint rules; every endpoint is born with owner, SLO, and an exit policy. The API program is platform thinking in miniature.

**Exercise 5.1.** Time a colleague (or yourself, honestly) from zero to first successful call against your team's API. Every minute past ten, name the friction that spent it.

## Kata: The Public API

> **Your brief: "Atlas."** A freight-visibility company: shippers embed tracking into their portals. Assets: container positions (updated ~hourly), customs status (event-driven, from Course 6-style streams), ETA predictions (ML, revised continuously). Consumers: five enterprise shippers (SLA contracts, SOC2 questionnaires), ~200 mid-market integrators (self-service), and one giant retailer that "will send 50× everyone else's traffic and negotiate like it." Regulatory note: customs data is per-country restricted.

**Deliverables:**

1. **Contract** — OpenAPI sketch: resources for shipments, positions, customs events, ETAs; error catalog with whose-move-is-it semantics; webhook or stream design for push consumers.
2. **Evolution policy** — additive rules, the ETA-model-v2 migration plan, sunset mechanics.
3. **Edge design** — Figure-2-grade diagram; per-tier quotas including the retailer problem; canary strategy.
4. **Security architecture** — flows per consumer class, scope model, the object-level rule for per-country customs data, and its enforcement point.
5. **Program sheet** — DX funnel targets, three lint rules you'd enforce from day one, and each endpoint's tier/SLO.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Affordance modeling | Could a shipper integrate without seeing your schema? |
| Stranger-proof evolution | Does the ETA v2 plan survive a consumer who ignores your emails for a year? |
| Fairness engineering | Does the retailer's 50× live within designed limits, or negotiated exceptions? |
| Enforcement placement | Is every authorization rule enforced where the knowledge lives? |

### Where you now stand

You can promise carefully, evolve without breakage, and operate the edge as infrastructure and product. But every response you now serve ends its journey somewhere this specialization has not yet looked: a browser, a phone, a screen a human is staring at. The frontend has its own architecture — rendering economics, composition at team scale, its own security perimeter — and pretending it is "just the view layer" is how decomposed backends get undone by page one. Course 8: UI architecture.

## References

- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- Mike Amundsen — [*RESTful Web API Patterns and Practices Cookbook*](https://www.oreilly.com/library/view/restful-web-api/9781098106737/). O'Reilly, 2022.

**Further reading:**

- Arnaud Lauret — [*The Design of Web APIs*, 2nd ed.](https://www.manning.com/books/the-design-of-web-apis) Manning.
- JJ Geewax — [*API Design Patterns*](https://www.manning.com/books/api-design-patterns). Manning, 2021.
