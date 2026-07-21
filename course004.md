# Course 4: Distributed Systems Foundations for Architects

## Description

Every architecture in this specialization eventually runs on multiple machines, and this course supplies the physics. Students learn the non-negotiables of distributed systems: partial failure, network fallacies, time and ordering, replication and partitioning, consistency models from linearizable to eventual, and the CAP/PACELC trade-offs behind every database marketing page. The treatment is architect-oriented — the goal is to predict system behavior under load and failure and to read a distributed database's documentation with informed skepticism, not to implement consensus from scratch.

The second half turns theory into scalable system design: stateless service tiers, load balancing, distributed caching, asynchronous messaging as the scalability workhorse, and the resilience patterns — timeouts, retries with backoff and jitter, circuit breakers, bulkheads, backpressure, load shedding — that separate systems that degrade gracefully from systems that cascade. Kubernetes-era structural patterns (sidecar, ambassador, adapter, sharded and scatter/gather services) are introduced as reusable vocabulary. Students leave able to design a system for a stated scale target and defend its failure behavior.

**Primary sources:** *Foundations of Scalable Systems* (Gorton), *Designing Distributed Systems* (Burns)

## Table of Contents

### Module 1: The Physics of Distribution
- Partial failure, unreliable networks, and the eight fallacies
- Latency numbers every architect should know; tail latency and percentiles
- Time, clocks, and ordering; idempotency as a design obligation
- Scalability concepts: vertical vs. horizontal, Amdahl's and USL intuition

### Module 2: State: Replication, Partitioning, Consistency
- Replication strategies: leader-based, multi-leader, leaderless
- Partitioning/sharding: keys, rebalancing, hot spots
- Consistency models: linearizable, causal, eventual; CRDTs in brief
- CAP and PACELC as decision tools; consensus (Raft) at architect depth
- Choosing a database by its consistency and partition behavior

### Module 3: Scalable Service Architectures
- Stateless services, load balancing, and session state externalization
- Distributed caching: cache-aside, read-through, invalidation realities
- Asynchronous messaging: queues, competing consumers, delivery guarantees
- Scatter/gather, sharded services, and ownership election
- Sidecar, ambassador, and adapter patterns (the Kubernetes-native toolkit)

### Module 4: Resilience Engineering
- Timeouts, retries, backoff, jitter — and retry storms
- Circuit breakers, bulkheads, and failure isolation
- Backpressure and load shedding; graceful degradation
- Designing for and testing failure: chaos experiments as fitness functions

### Module 5: Scale Design Kata
- Given: product brief with explicit scale and availability targets
- Deliverable: architecture with capacity model, failure-mode analysis, and consistency decisions recorded as ADRs
