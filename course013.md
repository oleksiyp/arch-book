# Course 13: Multi-Tenant SaaS Architecture

## Description

Software-as-a-Service is where most modern architectures ultimately earn revenue, and multi-tenancy is its defining constraint: one system, many customers, with isolation, fairness, and per-tenant economics designed in rather than bolted on. This course gives the full treatment of multi-tenant architecture: the SaaS mindset and the control plane / application plane split, deployment models (silo, pool, bridge) and how to mix them per tier, tenant onboarding and identity, tenant-aware routing, data partitioning, and — the topic that decides whether a SaaS business survives its first enterprise customer — tenant isolation and noisy-neighbor management.

The course is deliberately placed just before the platform capstone because a SaaS product *is* a platform with billing attached: the control plane, self-service onboarding, and tenant-aware operations built here are the same machinery the capstone generalizes to internal platforms. Concrete architectures are studied on both Kubernetes and serverless stacks, and the course closes with the commercial realities — tiering strategies, per-tenant cost visibility, migrating an existing single-tenant product to SaaS, and multi-tenant GenAI features where prompts, corpora, and spend must all be isolated per tenant.

**References:** [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/) (Golding), [*Enabling Microservice Success*](https://www.oreilly.com/library/view/enabling-microservice-success/9781098130787/) (Wells)

## Table of Contents

### Module 1: The SaaS Mindset
- What makes SaaS different: one system, many customers, continuous operation
- Control plane vs. application plane — the fundamental split
- Multi-tenant fundamentals: what "tenant" touches (identity, data, compute, cost)
- Deployment models: silo, pool, bridge — trade-offs and mixing per tier

### Module 2: Tenant Lifecycle
- Onboarding as architecture: frictionless, automated, observable
- Tenant identity and authentication; mapping tenants into tokens
- Tenant management and configuration; tenant context propagation
- Tenant-aware routing: subdomain, path, and claim-based strategies

### Module 3: Building Multi-Tenant Services
- Designing services that are tenant-aware without tenant-riddled code
- Data partitioning: pooled tables, schema-per-tenant, database-per-tenant
- Tenant isolation: runtime enforcement, scoped credentials, blast-radius thinking
- Noisy neighbors: throttling, fairness, and workload partitioning

### Module 4: SaaS on Real Stacks
- Kubernetes SaaS: namespaces, quotas, and isolation patterns on EKS-class platforms
- Serverless SaaS: per-function isolation, concurrency limits, cost attribution
- Tenant-aware operations: per-tenant health, metrics, and support tooling
- Per-tenant cost: measuring, attributing, and acting on unit economics

### Module 5: The Business of Multi-Tenancy
- Tiering strategies: mapping business tiers to architecture (silo premium, pooled standard)
- Migration: taking a single-tenant product to multi-tenant SaaS without stopping the world
- SaaS anywhere: extending SaaS into customer environments
- GenAI and multi-tenancy: isolating prompts, retrieval corpora, and AI spend per tenant
- Graded project: multi-tenant architecture for a case-study product — deployment model per tier, isolation design, onboarding flow, and cost-attribution plan
