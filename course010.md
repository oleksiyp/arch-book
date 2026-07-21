# Course 10: Cloud-Native Operations: Serverless, Kubernetes, and SRE

## Description

Architecture that can't be operated is fiction. This course covers the operational half of modern architecture: the cloud execution models (containers and Kubernetes, serverless functions and managed services) and their trade-offs in cost, elasticity, and operational burden; infrastructure as code and GitOps as the delivery substrate; and observability and SRE practice — SLIs, SLOs, error budgets — as the feedback loop that keeps architecture honest. Serverless receives a full treatment as an architectural approach: event-driven function composition, enterprise readiness, testing, cost modeling (the "pay-per-use changes your architecture" argument), and its operational model where most traditional ops work disappears into the provider.

Students also learn evolutionary operations: deployment topologies, progressive delivery at the infrastructure level, capacity and cost architecture (FinOps for architects), and sustainability as an emerging characteristic. The course keeps score with the four key metrics (deployment frequency, lead time, MTTR, change fail rate) and architecture fitness functions, teaching students to treat operability as a designed property. It closes one step short of the capstone: once you can operate one system well, the next question is how to make operability a self-service capability for every team — that is, a platform.

**Primary sources:** *Serverless Development on AWS* (Sbarski, Katzef et al.), *Building Microservices* chs. 8–10 (Newman), *Enabling Microservice Success* Part III (Watt), *Software Architecture Metrics* (Ciceri, Farley et al.), *Designing Distributed Systems* (Burns)

## Table of Contents

### Module 1: Cloud Execution Models
- The spectrum: VMs → containers → Kubernetes → serverless → fully managed
- Kubernetes for architects: what the scheduler gives you and what it costs
- Serverless architecture: functions, managed services, event composition
- Choosing an execution model per workload: latency, burst, cost, team maturity

### Module 2: Delivery Infrastructure
- Infrastructure as code; immutable infrastructure; GitOps
- Environments, ephemeral previews, and configuration architecture
- Progressive delivery: canary, blue-green, feature flags at infra level
- The four key metrics as an architecture scorecard

### Module 3: Observability and SRE
- Logs, metrics, traces; wide events and high-cardinality debugging
- SLIs, SLOs, and error budgets: turning reliability into a decision framework
- Alerting philosophy: symptoms over causes; on-call that doesn't burn people
- Incident response and blameless postmortems as architectural feedback

### Module 4: Cost, Capacity, and Sustainability
- FinOps for architects: unit economics, cost as a fitness function
- Serverless cost modeling: when pay-per-use wins and when it bankrupts you
- Capacity planning and autoscaling architecture
- Sustainability: carbon-aware and efficiency-driven design choices

### Module 5: Operability by Design
- Operational fitness functions and production readiness reviews
- Testing serverless and distributed systems: local reality vs. cloud reality
- Keeping things up to date: dependency, runtime, and platform lifecycle
- Graded project: operations architecture (deployment, observability, SLOs, cost model) for the Course 5 case-study system
