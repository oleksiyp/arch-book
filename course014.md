# Course 14: Platform Engineering and the Capstone

## Description

This is the destination of the specialization. Everything learned so far — styles, decomposition, distributed systems, events, APIs, data, security, operations, AI, multi-tenancy — converges in the discipline of **platform architecture**: designing systems whose users are other engineering teams. Students learn the anatomy of an internal developer platform (golden paths, self-service infrastructure, platform APIs, scorecards), the platform-as-product operating model (platform teams serve customers, not tickets), and governance delivered as paved roads and policy-as-code rather than review boards. Evolutionary architecture completes the toolset: fitness functions and architectural metrics become the platform's automated guardrails, letting many teams move fast inside safe boundaries. A strategy module — the architect elevator, Wardley-style situational awareness, build-vs-buy — equips architects to justify and steer platform investment at the executive level.

Unlike every course before it, this one is mostly *doing*: roughly half the course effort is the capstone project. Students design a complete platform for a scaling case-study company — golden paths, platform APIs, event and data infrastructure, security guardrails, AI services, migration roadmap, and an executive narrative — reviewed against the trade-off discipline built across all thirteen prior courses.

**References:** [*Building Evolutionary Architectures*](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/) (Ford, Parsons, Kua, Sadalage), [*Software Architecture Metrics*](https://www.oreilly.com/library/view/software-architecture-metrics/9781098112226/) (Ciceri et al.), [*The Software Architect Elevator*](https://www.oreilly.com/library/view/the-software-architect/9781492077534/) (Hohpe), [*Technology Strategy Patterns*](https://www.oreilly.com/library/view/technology-strategy-patterns/9781492040866/) (Hewitt), [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/) (Wells); [*Learning Systems Thinking*](https://www.oreilly.com/library/view/learning-systems-thinking/9781098151324/) (Montalion)

## Table of Contents

### Module 1: Why Platforms
- From projects to products to platforms: the consolidation of everything before
- Internal developer platforms: golden paths, self-service, cognitive-load reduction
- Platform-as-product: customers, adoption curves, and the thinnest viable platform
- Anti-patterns: mandate-driven platforms, ivory towers, platform-as-ticket-queue

### Module 2: Platform Anatomy
- Platform APIs and control planes; everything-as-a-service internally
- Golden paths in practice: templates, scaffolding, scorecards, service catalogs
- Composing prior courses into planes: compute (Course 11), events (6), data (9), APIs (7), UI (8), AI services (12), tenancy (13)
- The platform team topology: stream-aligned customers, enabling interactions

### Module 3: Governance as Code
- Evolutionary architecture: fitness functions as automated guardrails
- Policy engines and paved-road security in the platform
- Architectural metrics: four key metrics, modularity maturity, goal-question-metric
- Deprecation and migration campaigns: evolving the platform without zombie systems

### Module 4: Platform Strategy and the Elevator
- Situational awareness: Wardley-style mapping, build-vs-buy, bet sizing
- The architect elevator: selling options, executive narratives, riding between floors
- Adoption dynamics: feedback loops that make platforms flourish or stall
- Making the platform business case: cognitive load, lead time, and unit economics

### Module 5: Capstone Project
- Brief: a scaling company with 40 product teams, a legacy monolith, new AI ambitions, and compliance pressure
- Deliverables: platform architecture (C4 + Mermaid), golden-path definitions, event/data/AI service design, security guardrail set, fitness-function suite, migration roadmap, and a 10-minute executive presentation
- Peer review against the specialization rubric: every decision defended as a trade-off, every claim measurable
