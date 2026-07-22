# Course 10: Security Architecture and Zero Trust

> Attackers don't respect your diagrams. Draw the ones they do: the trust boundaries.

## Welcome

Nine courses in, Encore has services, streams, APIs, BFFs, and data products — and, therefore, an attack surface it never sat down to design. That is the normal condition of software: functionality is architected, security is accreted. This course reverses the order for good. Security here is an architectural characteristic from Course 1's table — designed in, traded off explicitly, verified by fitness functions — not a compliance questionnaire administered after the fact.

Two convictions organize everything. First: **the architect is a defender**, because the decisions that determine defensibility — where trust boundaries sit, what identity a workload carries, which data lives where — are architecture decisions; by the time a security team reviews them, they are expensive facts. Second: **the perimeter is dead**, and its successor, zero trust, is not a product but an architectural stance: no network location confers trust; every request authenticates, every access is authorized, every actor — human or workload — has an identity. The course is defensive and design-oriented throughout: the deliverables are threat models, boundary diagrams, and security ADRs. No exploits are taught here; what is taught is the mindset that anticipates them.

## Module 1: Thinking Like a Defender

### Threat modeling: engineering, not paranoia

The core practice fits in four questions asked of any design: *What are we building? What can go wrong? What are we doing about it? Did it work?* The middle two get method. STRIDE gives "what can go wrong" a checklist — Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege — walked over a data-flow diagram. Run it on Encore's crown jewel, the on-sale:

| STRIDE | On-sale threat | Design answer (not a product name) |
|---|---|---|
| Spoofing | bots impersonating fans at the Gate | Bot Screening before the queue; device attestation |
| Tampering | hold-TTL manipulation to lock inventory | server-authoritative TTLs; signed hold tokens |
| Repudiation | "I never bought this" disputes | Course 6's event ledger as audit trail |
| Info disclosure | seat-map probing reveals sales velocity to scalpers | rate-limited, coarsened availability responses |
| DoS | the on-sale *is* a voluntary DDoS; attackers add to it | Course 4's shedding + Gate; upstream scrubbing |
| Elevation | fan token used against organizer endpoints | audience-bound tokens; per-service authorization |

*Figure 1 — STRIDE over the on-sale. Notice how many mitigations are prior courses' patterns wearing security hats: the ledger, the Gate, load shedding. Good architecture and defensible architecture are mostly the same drawings.*

Threat modeling is done *at design time, by the designing team, on the C4 diagrams they already have* — an hour per significant change, not a quarterly ceremony. The architect's addition to those diagrams: **trust boundaries** — lines where the level of trust changes (internet→gateway, service→PSP, everything→database) — because every boundary crossing is where STRIDE questions concentrate. And since not everything can be defended equally: **data classification** (public / internal / confidential / regulated) decides where the armor goes. Encore's classes: seat maps are public; sales velocity is confidential (scalpers pay for it); payment data is regulated — and by architecture (tokenization at the PSP boundary, Course 3's ACL doing security duty) Encore *never possesses* card numbers, which is the finest kind of security: the data you don't hold cannot leak.

**Recap.** Four questions, STRIDE for the second, run by builders on existing diagrams. Trust boundaries concentrate the questions; classification allocates the armor; the best control is not holding the data at all.

**Exercise 1.1.** Draw your system's context diagram and add the trust boundaries. At each crossing, ask one STRIDE letter's question. Which crossing has no answer today?

## Module 2: Zero Trust and Identity

### Identity is the new perimeter

The castle model — hard shell, soft interior — died of its own success condition: one phished credential inside the wall and the attacker walks laterally through implicit trust. Zero trust's tenets, distilled from NIST SP 800-207 into architecture: **verify explicitly** (every request, from anywhere), **least privilege** (access to the resource, not the network), **assume breach** (design blast radii, not just walls). Concretely, three identity planes:

**Humans.** OIDC/SSO with MFA, short sessions, and — the architectural part — *roles modeled on the domain*: Course 7's scopes (`holds:write`) and Course 13's tenant claims are authorization vocabulary designed alongside the API, not bolted on by an admin console.

**Workloads.** The under-built plane. Every service gets a cryptographic identity (SPIFFE-style: `spiffe://encore/inventory`), mTLS everywhere (Course 5's mesh finally shows its security face — identity and encryption as *infrastructure policy*, not per-team diligence), and authorization between services: Inventory accepts `reserve` calls from Orders and the Gate, and *no one else*, as declared policy. Lateral movement dies in policy, not in hope.

**Networks, demoted but not dismissed.** Segmentation survives as defense-in-depth: private subnets, no public database endpoints, controlled egress (exfiltration's chokepoint — the least glamorous control with the best incident-review record).

<pre class="mermaid">
flowchart LR
    gw["Gateway<br/><small>fan/partner tokens verified</small>"] --> ord["Orders<br/><small>id: spiffe://encore/orders</small>"]
    ord -- "mTLS + policy:<br/><small>orders may reserve</small>" --> inv["Inventory"]
    bot["Bot Screening"] -- "policy: may query risk only" --> inv
    ana["Analytics"] -. "policy: no path to Inventory<br/><small>(reads events instead)</small>" .-> inv
    classDef ok fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    classDef deny fill:#e8e8ee,stroke:#c66,color:#933
    class gw,ord,inv,bot ok
    class ana deny
</pre>

*Figure 2 — Service-to-service authorization as declared policy. The dotted line is the diagram's whole point: Analytics has no path to Inventory — it learns from the event stream, which is least privilege expressed as architecture (Course 6 was a security course in disguise).*

**Recap.** Trust attaches to verified identity, never to network position. Humans get SSO+MFA with domain-modeled roles; workloads get cryptographic identity, mesh-enforced mTLS, and explicit call policies; networks stay as depth, with egress control as the sleeper hit.

**Exercise 2.1.** Pick two services you run. Write the call-policy sentence for each ("X accepts A from B and C"). Is that sentence enforced anywhere, or is it currently a hope?

## Module 3: Securing the Stack

Four disciplines cover the stack's remaining altitude, each with one architectural core:

**Secrets: short-lived beats well-hidden.** The mature posture is not better vaults but *fewer long-lived secrets*: workload identity (Module 2) exchanges for short-lived, auto-rotated credentials; humans get just-in-time access with expiry. A leaked credential that dies in fifteen minutes is an incident; one that lives for years is a career.

**Data protection: encryption is a key-management problem.** TLS everywhere and encrypted storage are table stakes; the architecture lives in the keys — KMS-managed, per-classification (Module 1's classes becoming key policies), rotated, and with envelope encryption for anything regulated. "We encrypt everything" means little; "here is who can use which key, and here is the log" means everything.

**Supply chain: your dependencies are your code.** The modern breach arrives in a `package.json` as often as a port scan. Architectural controls: lockfiles + provenance verification, image signing with admission enforcement (unsigned doesn't deploy — a fitness function), SBOMs for the "are we exposed?" hour, and build pipelines treated as production systems (SLSA's actual point) — because the pipeline that can deploy anything is, to an attacker, the most valuable service you run.

**Events and APIs: the seams stay sealed.** Course 7's object-level authorization and abuse limits; Course 6's streams get schema-validated, signed-where-disputed events and replay protection via idempotency keys — the duty that keeps paying dividends.

**Recap.** Prefer expiring credentials to hidden ones; architect keys, not just ciphers; treat the build pipeline as production and dependencies as code; keep the seams sealed with the disciplines earlier courses installed.

**Exercise 3.1.** Inventory your three longest-lived credentials (age, blast radius, rotation story). Design the short-lived replacement for the worst one.

## Module 4: Isolation and Multi-Tenancy

### Blast radius is a design variable

Assume-breach thinking asks of every component: *when* this is compromised, what does the attacker hold? Isolation is the discipline of making that answer small. Tenant isolation models (Course 13 will build on these): **silo** (per-tenant stacks — smallest blast radius, largest bill), **pool** (shared everything, isolation by row-level policy and tenant-scoped tokens — efficient, and one missing `WHERE tenant_id` from disaster; the mitigation is *centralizing* that predicate in the platform layer, never per-query diligence), **bridge** (pooled compute, siloed data — the common compromise). Encore runs pooled with two silo exceptions demanded by classification: the ledger and Bot Screening's risk data.

Two modern isolation frontiers: **sandboxing untrusted execution** (webhooks, partners' code, and — arriving with Course 12 — AI-generated actions: gVisor/Firecracker-class boundaries, egress-controlled, because "it's just a webhook handler" is how supply chains fall), and **the AI-era surfaces** previewed now so Course 12 inherits vocabulary: prompt injection (untrusted text steering a model that holds credentials), retrieval leakage (RAG answering across permission boundaries — Course 9's access rules must survive *inside* the corpus), and model exfiltration. The pattern that governs all three: the model is an *untrusted execution environment fed by untrusted input* — sandbox its tools, scope its retrieval, filter its output.

**Compliance as architecture.** Audit trails (the event ledger again), data residency (EU events' data in EU regions — a partitioning-key decision from Course 4, made compliance-critical), retention as *lifecycle policy in the platform*, and least-privilege evidence generated from Module 2's policies rather than assembled in spreadsheet archaeology. When compliance is architected, the audit is a report; when it isn't, it's a quarter.

**Recap.** Choose silo/pool/bridge per data classification, centralize tenant predicates, sandbox anything that executes strangers' intent — models included. Compliance stops being paperwork exactly when its evidence is emitted by the architecture.

**Exercise 4.1.** For one shared (pooled) store you operate: where does the tenant/user scoping predicate live? Count the code paths that must remember it. Design the version where one layer remembers for everyone.

## Module 5: Security as a Platform Capability

The fleet-scale truth, one last time: seventy teams cannot each be excellent at Modules 1–4, and memos don't compile. Security scales the way everything in this specialization scales — through the **paved road**: golden-path templates born with mTLS, workload identity, scoped credentials, and hardened bases; **policy as code** at admission and in CI ("no public buckets," "unsigned images don't run," "every endpoint declares its authorization rule"); and **security fitness functions** — dependency and secret scans, authorization tests per endpoint, the chaos-style drill that proves the breaker *and* the boundary. The security team's role inverts from gate to *paver*: they build the road and investigate the exceptions, and the exception path is priced, logged, and owned (Course 5's governance, hardest edition). The metric that matters: on the paved road, the secure way is the *easy* way — measured, as ever, by what teams do at 5 p.m. on a Friday.

**Recap.** Paved roads, admission-time policy, and fitness functions make security ambient; the security team paves and audits exceptions instead of gating everything; Friday-afternoon behavior is the metric.

**Exercise 5.1.** Name the last security requirement your org delivered by memo. Sketch its paved-road version: template default + policy check + the priced exception path.

## Kata: The Threat Model

> **Your brief: "Remedy."** A telehealth platform: video consultations, e-prescriptions, lab results. Actors: patients (mobile), clinicians (web), pharmacy partners (API), one insurance integration (SFTP, because insurance). Data: health records (regulated, seven-year retention), prescriptions (regulated, fraud-attractive), video (ephemeral by promise). Twenty-five engineers, pooled multi-tenant SaaS, one production cluster. A recent pentest found: long-lived DB credentials in three services, no service-to-service authorization, and a webhook endpoint that accepts unauthenticated pharmacy callbacks "temporarily, since 2023."

**Deliverables:**

1. **Boundary diagram** — C4 context + containers with trust boundaries and data classifications marked.
2. **Threat model** — STRIDE table for the two crown jewels: e-prescription issuance and lab-result delivery.
3. **Zero-trust migration plan** — workload identity, mTLS, and call policies sequenced across a live system; the three pentest findings remediated *architecturally* (not patched).
4. **Isolation verdict** — silo/pool/bridge per data class, with the video-ephemerality promise made enforceable.
5. **Two security ADRs** — the webhook redesign; the residency/retention architecture — losses in ink.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Boundary literacy | Do the diagrams show where trust changes, or just where boxes sit? |
| Architectural remediation | Do fixes remove classes of bugs, or instances? |
| Least-privilege evidence | Could the auditor's access question be answered from policy, today? |
| Paved-road thinking | Will the twenty-sixth engineer be secure by default, or by onboarding lecture? |

### Where you now stand

Security is now a designed property with drawings, policies, and tests. What remains conspicuously undrawn is the ground all of it runs on: the clusters, functions, pipelines, and pagers — and the economics of keeping them alive at 3 a.m. and under budget. Course 11: cloud-native operations, where architecture meets the invoice and the on-call rotation.

## References

- Sheen Brisals, Luke Hedger — [*Serverless Development on AWS*](https://www.oreilly.com/library/view/serverless-development-on/9781098141929/). O'Reilly, 2024.
- Tod Golding — [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/). O'Reilly, 2024.
- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.

**Further reading:**

- Razi Rais, Christina Morillo, Evan Gilman, Doug Barth — [*Zero Trust Networks*, 2nd ed.](https://www.oreilly.com/library/view/zero-trust-networks/9781492096580/) O'Reilly, 2024.
- Heather Adkins, Betsy Beyer, et al. — [*Building Secure and Reliable Systems*](https://sre.google/books/). O'Reilly/Google, 2020 — free online.
- Tanya Janca — [*Alice and Bob Learn Application Security*](https://www.wiley.com/en-us/Alice+and+Bob+Learn+Application+Security-p-9781119687405). Wiley, 2020.
- Adam Shostack — [*Threat Modeling: Designing for Security*](https://www.wiley.com/en-us/Threat+Modeling:+Designing+for+Security-p-9781118809990). Wiley, 2014.
