# Course 6: Event-Driven Architecture and Streaming Systems

## Description

Event-driven architecture is the backbone of modern digital infrastructure — the style behind real-time commerce, logistics, fraud detection, and the data pipelines feeding AI systems. This course teaches events as the fundamental unit of both communication and state: designing events and schemas, choosing brokers and topologies, event sourcing and CQRS, deterministic and stateful stream processing, and the consistency realities (out-of-order delivery, exactly-once mythology, eventual consistency) that architects must design around rather than wish away.

The course also covers long-running business processes: workflow engines, process orchestration, and the pragmatic balance between choreographed events and orchestrated processes for automation that spans services, humans, and time. Students study "flow" as an emerging property of enterprises — composable event streams as products — which sets up both the data mesh course and the platform capstone, where event infrastructure becomes a self-service platform capability.

**References:** [*Building Event-Driven Microservices*](https://www.oreilly.com/library/view/building-event-driven-microservices/9798341622180/) (Bellemare), [*Practical Process Automation*](https://www.oreilly.com/library/view/practical-process-automation/9781492061441/) (Rücker), [*Flow Architectures*](https://www.oreilly.com/library/view/flow-architectures/9781492075882/) (Urquhart), [*Fundamentals of Software Architecture*](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) (Richards & Ford)

## Table of Contents

### Module 1: Event-Driven Fundamentals
- Why event-driven: decoupling in time, space, and load
- Events vs. commands vs. queries; notification vs. event-carried state transfer
- Broker and mediator topologies; when each wins
- Designing events: granularity, schemas, data contracts, schema evolution

### Module 2: Event Streams as State
- The log as the source of truth; Kafka-class systems' storage model
- Event sourcing: rebuilding state, snapshots, upcasting
- CQRS: separated read models, projection lag, and honest complexity accounting
- Integrating with existing systems: change data capture, outbox pattern

### Module 3: Stream Processing
- Producer/consumer basics; consumer groups, partitions, ordering guarantees
- Deterministic processing: watermarks, late events, reprocessing
- Stateful streaming: joins, aggregations, state stores
- Delivery semantics: at-least-once reality and idempotent design

### Module 4: Workflows and Process Automation
- Long-running processes across services, humans, and time
- Orchestration with workflow engines vs. choreography with events
- Saga implementation revisited: process managers in practice
- Anti-patterns: distributed monolith by event chain, event spaghetti

### Module 5: Flow — Streams as Products
- The event-driven enterprise: streams as composable, discoverable products
- Evaluating the streaming ecosystem; interoperability and standards (CloudEvents, AsyncAPI)
- Graded project: design the event backbone for a case-study business, including schemas, topology, and one orchestrated process
