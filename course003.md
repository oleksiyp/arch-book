# Course 3: Domain-Driven Design and System Decomposition

## Description

Where do service boundaries come from? This course teaches strategic domain-driven design as the primary decomposition tool of the modern architect. Students learn to map business domains into subdomains (core, supporting, generic), draw bounded contexts, build ubiquitous languages, and choose context-mapping relationships (partnership, customer–supplier, anticorruption layer, open-host service). Tactical DDD — aggregates, entities, value objects, domain events — is covered at the depth an architect needs to review designs, with emphasis on aggregates as consistency boundaries, which becomes essential in the event-driven and data courses.

The second half applies decomposition to the hardest real-world case: an existing system. Students learn migration patterns — strangler fig, branch by abstraction, parallel run — and database decomposition techniques, along with the honest economics of when to leave a monolith alone. Conway's Law and team topologies are treated as design inputs, not afterthoughts: boundaries that fight the organization lose. The course closes by connecting bounded contexts to platform thinking — well-drawn contexts are what make a system *platformizable* later.

**Primary sources:** *Learning Domain-Driven Design* (Khononov), *Monolith to Microservices* (Newman), *Software Architecture: The Hard Parts* Part I (Ford, Richards, Sadalage, Dehghani)

## Table of Contents

### Module 1: Strategic Design
- Subdomains: core, supporting, generic — and why the distinction drives investment
- Bounded contexts and ubiquitous language
- Context mapping: partnership, shared kernel, customer–supplier, conformist, ACL, OHS
- EventStorming as a discovery workshop

### Module 2: Tactical Design for Architects
- Entities, value objects, and aggregates as consistency boundaries
- Domain events and eventual consistency between aggregates
- Domain services, application layers, and hexagonal/ports-and-adapters structure
- When tactical DDD is overkill: transaction scripts and active record, honestly

### Module 3: Decomposition Drivers and Granularity
- Granularity disintegrators: change rate, scalability, fault tolerance, security, data
- Granularity integrators: transactions, workflow coupling, data relationships
- Component-based decomposition patterns
- Conway's Law and team topologies as boundary constraints

### Module 4: Decomposing Existing Systems
- Should you? The migration decision and its economics
- Strangler fig, branch by abstraction, parallel run, decorating collaborator
- Splitting the database: shared tables, views, change data capture, tracer writes
- Growing pains: ownership, breaking changes, reporting

### Module 5: Decomposition Kata
- EventStorming a realistic domain (logistics or fintech brief)
- Producing a context map with justified relationships
- Migration plan for a given legacy monolith, with sequencing and risk register
