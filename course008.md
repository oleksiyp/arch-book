# Course 8: Data Architecture: From Distributed Data to Data Mesh

## Description

Data is where distributed architectures get hard and stay hard. This course covers the operational side first: data ownership per service, polyglot persistence, distributed transactions and their alternatives, eventual consistency as a business conversation, and the data access patterns (replication, views, CQRS read models, data sidecars) that let decomposed systems answer joined-up questions. Students work through the granularity and ownership decisions from *The Hard Parts* with the database decomposition techniques to execute them.

The second half addresses analytical data in a decentralized world. Traditional warehouse and lake architectures are contrasted with **data mesh**: domain-owned data products, event streams as the transport, federated computational governance, and the self-service data platform that makes decentralized ownership viable. The platform framing is explicit — data mesh is platform architecture applied to analytics, and its self-service platform plane is studied as a direct rehearsal for the capstone. AI workloads appear as a forcing function: feature pipelines and retrieval corpora are downstream consumers that make data quality and contracts non-negotiable.

**Primary sources:** *Building an Event-Driven Data Mesh* (Bellemare), *Software Architecture: The Hard Parts* Part II (Ford, Richards, Sadalage, Dehghani), *Foundations of Scalable Systems* Part III (Gorton)

## Table of Contents

### Module 1: Data Ownership in Distributed Systems
- Data ownership: single, common, and joint-ownership scenarios
- Polyglot persistence: choosing stores by access pattern
- Distributed transactions: why 2PC is (almost) always wrong; sagas revisited
- Eventual consistency patterns: background sync, orchestrated, event-based

### Module 2: Distributed Data Access
- Interservice queries: API composition and its limits
- Replicated caching, data domains, and data sidecars
- CQRS read models as integration surfaces
- Change data capture and the outbox pattern in production

### Module 3: Analytical Architectures
- Warehouse, lake, lakehouse: what each solves and where each strains
- The centralization failure mode: data team as bottleneck
- Streaming analytics: real-time pipelines feeding dashboards and models
- Data contracts: schemas, quality guarantees, and breaking-change discipline

### Module 4: Data Mesh
- The four principles: domain ownership, data as a product, self-service platform, federated computational governance
- Event streams as the data product transport
- Designing data products: ports, discoverability, SLOs, lineage
- Federated governance: policy as code across domains

### Module 5: The Self-Service Data Platform
- Platform plane architecture: infrastructure, product developer, and consumer planes
- Feeding AI: feature pipelines and retrieval corpora as data products (bridge to Course 11)
- Graded project: data architecture for a case-study company — ownership map, two data products, and a governance policy set
