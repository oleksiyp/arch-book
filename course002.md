# Course 2: Architecture Styles for the Cloud Era

## Description

This course is a working catalog of the architecture styles that matter today, taught through the lens of trade-off analysis. Students study each style's topology, its characteristic ratings (scalability, deployability, fault tolerance, cost, simplicity), and — critically — when *not* to use it. The catalog is deliberately modern: the modular monolith is treated as a legitimate, often superior starting point rather than a legacy embarrassment; serverless and event-driven topologies are covered as first-class styles; and legacy styles (orchestration-driven SOA, enterprise service bus) appear only as a short cautionary history of why distributed big-ball-of-mud architectures fail.

The through-line is style selection as an economic decision: every style is evaluated by its operational cost profile, its team-topology fit, and its evolvability. Students finish by running structured style-selection exercises on realistic briefs — choosing, justifying, and stress-testing a style against shifting requirements, which prepares them for the decomposition and distributed-systems courses that follow.

**References:** [*Software Architecture Patterns, 2nd ed.*](https://www.oreilly.com/library/view/software-architecture-patterns/9781098134280/) (Richards), [*Fundamentals of Software Architecture*](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) (Richards & Ford), [*Building Evolutionary Architectures*](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/) (Ford, Parsons, Kua, Sadalage)

## Table of Contents

### Module 1: Foundations of Style Analysis
- Partitioning: technical vs. domain; monolithic vs. distributed
- Style characteristic ratings and how to read them
- The fallacies of distributed computing (why distribution is never free)
- A short history: why SOA/ESB failed and what it taught us

### Module 2: Monolithic Styles Done Right
- Layered architecture: strengths, sinkhole anti-pattern, when it wins
- The modular monolith: enforcing module boundaries without a network
- Microkernel architecture: plug-in systems, feature-flag ecosystems
- Pipeline architecture: data transformation and ETL-shaped problems

### Module 3: Distributed Styles
- Service-based architecture: the pragmatic middle ground
- Microservices: topology, granularity, operational cost
- Event-driven architecture: broker and mediator topologies
- Serverless as an architecture style: function topologies and cold-start trade-offs
- Space-based architecture: extreme elasticity for spiky load

### Module 4: Choosing and Evolving a Style
- Decision drivers: domain shape, team topology, operational maturity, cost
- Style migration paths: monolith → modular monolith → services
- Fitness functions for style integrity (cycle detection, dependency rules)
- Evolutionary architecture: building for change as a first requirement

### Module 5: Style Selection Katas
- Three graded katas across contrasting domains (B2B SaaS, real-time consumer, data-heavy analytics)
- Justifying style choice with characteristic ratings and ADRs
- Stress test: requirements change mid-kata — does your style survive?
