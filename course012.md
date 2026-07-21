# Course 12: Platform Architecture and Platform Engineering (Capstone)

## Description

This is the destination of the specialization. Everything learned so far — styles, decomposition, distributed systems, events, APIs, data, security, operations, AI — converges in the discipline of **platform architecture**: designing systems whose users are other engineering teams. Students learn the anatomy of an internal developer platform (golden paths, self-service infrastructure, platform APIs, scorecards), the platform-as-product operating model (platform teams serve customers, not tickets), and governance delivered as paved roads and policy-as-code rather than review boards. Evolutionary architecture completes the picture: fitness functions and architectural metrics become the platform's automated guardrails, letting hundreds of teams move fast inside safe boundaries.

The course then extends platform thinking outward to **multi-tenant SaaS platforms** — deployment models, tenant onboarding, isolation, tiering, and tenant-aware operations — treating commercial SaaS as platform architecture with billing attached. A strategy module gives architects the tools to justify and steer platform investment: technology strategy patterns, the architect-elevator skill of connecting the engine room to the boardroom, and systems thinking for the feedback loops that make platforms succeed or stall. The capstone project synthesizes the entire specialization: students design a complete platform for a case-study company — golden paths, platform APIs, event and data infrastructure, security guardrails, AI services, migration strategy, and an executive narrative — reviewed against the trade-off discipline built across all eleven prior courses.

**Primary sources:** *Building Multi-Tenant SaaS Architectures* (Golding), *Building Evolutionary Architectures* (Ford, Parsons, Kua, Sadalage), *Software Architecture Metrics* (Ciceri et al.), *The Software Architect Elevator* (Hohpe), *Technology Strategy Patterns* (Hewitt), *Learning Systems Thinking* (Montalion), *Enabling Microservice Success* (Watt)

## Table of Contents

### Module 1: Why Platforms
- From projects to products to platforms: the consolidation of everything before
- Internal developer platforms: golden paths, self-service, cognitive-load reduction
- Platform-as-product: customers, adoption curves, and the thinnest viable platform
- Anti-patterns: mandate-driven platforms, ivory-tower platforms, platform-as-ticket-queue

### Module 2: Platform Anatomy
- Platform APIs and control planes; everything-as-a-service internally
- Golden paths in practice: templates, scaffolding, scorecards, service catalogs
- Composing prior courses into planes: compute (Course 10), events (6), data (8), APIs (7), AI services (11)
- Governance as code: fitness functions, policy engines, automated guardrails
- Architectural metrics: modularity maturity, four key metrics, goal-question-metric

### Module 3: Multi-Tenant SaaS Platforms
- The SaaS mindset; control plane vs. application plane
- Deployment models: silo, pool, bridge; tiering strategies
- Onboarding, identity, tenant routing, and tenant-aware operations
- Isolation and noisy-neighbor management; per-tenant cost and GenAI tenancy
- Migration strategies: taking an existing product to multi-tenant SaaS

### Module 4: Platform Strategy and Leadership
- Technology strategy patterns: Wardley-style situational awareness, build-vs-buy, bet sizing
- The architect elevator: selling options, executive narratives, riding between floors
- Systems thinking: feedback loops, leverage points, and why platform adoption stalls
- Evolving the platform: deprecation, migration campaigns, avoiding zombie systems

### Module 5: Capstone Project
- Brief: a scaling company with 40 product teams, a legacy monolith, new AI ambitions, and compliance pressure
- Deliverables: platform architecture (C4), golden-path definitions, event/data/AI service design, security guardrail set, fitness-function suite, migration roadmap, and a 10-minute executive presentation
- Peer review against the specialization rubric: every decision defended as a trade-off, every claim measurable
