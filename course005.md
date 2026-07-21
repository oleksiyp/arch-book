# Course 5: Microservices: Building, Operating, Succeeding

## Description

This course is an honest, end-to-end treatment of microservices — the dominant distributed style of the last decade and the one most often done badly. Students learn to model services around bounded contexts, choose communication styles (synchronous vs. asynchronous, orchestration vs. choreography), manage workflows and distributed transactions with sagas, and handle the hard operational realities: independent deployability, contract testing, progressive delivery, observability, and securing service-to-service traffic. The course leans on trade-off analysis throughout: microservices buy organizational scalability and independent evolution at a steep operational price, and students learn to compute whether that price is worth paying.

Equally important, the course covers the socio-technical half that decides success: "you build it, you run it" ownership, paved-road enablement, governance without central bottlenecks, and the organizational prerequisites without which microservices reliably fail. This module is a deliberate bridge to the platform capstone — the observation that microservices at scale *require* a platform is one of the specialization's central arguments.

**Primary sources:** *Building Microservices, 2nd ed.* (Newman), *Enabling Microservice Success* (Watt), *Software Architecture: The Hard Parts* (Ford, Richards, Sadalage, Dehghani)

## Table of Contents

### Module 1: Modeling and Communication
- What microservices are (and the problems they actually solve)
- Modeling services on bounded contexts; information hiding
- Communication styles: request/response vs. event-driven; sync vs. async
- Service granularity: disintegrators and integrators revisited
- The "are microservices right for you?" assessment

### Module 2: Workflow, Transactions, and Contracts
- Orchestration vs. choreography; hybrid workflows
- Sagas: compensation, state machines, and the eight transactional saga patterns
- Contract coupling: schemas, consumer-driven contracts, versioning
- Code reuse trade-offs: shared libraries, sidecars, service templates

### Module 3: Delivery: Build, Deploy, Test
- Independent deployability as the prime directive
- CI/CD for many services; progressive delivery (canary, blue-green, feature flags)
- The test pyramid for distributed systems; contract and end-to-end testing limits
- From monitoring to observability: logs, metrics, traces, correlation

### Module 4: Production Realities
- Resiliency applied: applying Course 4 patterns to service meshes
- Securing microservices: service identity, mTLS, secret management (preview of Course 9)
- Scaling: the four axes; data scaling handoffs to Course 8
- UI composition: BFFs and micro-frontends in brief

### Module 5: The Organization That Microservices Require
- "You build it, you run it" and active service ownership
- Conway's Law in practice: stream-aligned teams and enabling teams
- Governance and standardization: golden paths instead of review boards
- Why microservices at scale demand a platform (bridge to Course 13)
- Graded exercise: microservice adoption assessment for a case-study company
