# Course 12: Architecting AI Systems: LLMs, RAG, and Agents

## Description

AI workloads are now a standard part of the architect's portfolio, and they bend every rule learned so far: non-deterministic components, quality measured statistically rather than with pass/fail tests, latency and cost profiles dominated by model inference, and new security surfaces like prompt injection. This course teaches the architecture of AI-infused systems: where models sit in a system topology, retrieval-augmented generation as the workhorse pattern for grounding LLMs in private data, agentic architectures with tool use and orchestration loops, and the evaluation-driven development loop that replaces traditional QA for probabilistic components. Classic ML serving (feature pipelines, model registries, online/offline skew) is covered as the foundation that GenAI systems still rest on.

The treatment is deliberately vendor-neutral and trade-off driven: buy vs. host, model routing across capability tiers, caching and batching for cost control, guardrails and human-in-the-loop patterns for risk control, and observability for token-level economics. The course connects backward to earlier material — RAG corpora are data products (Course 9), AI security extends zero trust (Course 10), inference is a capacity problem (Course 11) — and forward to the capstone, where AI capabilities become another paved-road service the platform offers to product teams.

**References:** current practitioner literature and provider architecture guidance (this domain moves faster than books); [*Building Multi-Tenant SaaS Architectures*](https://www.oreilly.com/library/view/building-multi-tenant-saas/9781098140632/) (Golding)

## Table of Contents

### Module 1: AI in the System Topology
- The AI-infused system: models as components with probabilistic contracts
- Classic ML serving: feature pipelines, registries, online/offline skew, drift
- LLM integration patterns: direct call, gateway, router across model tiers
- Build vs. buy vs. host: capability, cost, latency, and data-governance trade-offs

### Module 2: Retrieval-Augmented Generation
- Why RAG: grounding, freshness, and access control vs. fine-tuning
- Ingestion architecture: chunking, embeddings, vector and hybrid search
- Retrieval quality: reranking, query rewriting, metadata filtering
- The RAG corpus as a data product: contracts, lineage, permissions

### Module 3: Agentic Architectures
- Tool use and function calling; the agent loop as an orchestration problem
- Single agent vs. multi-agent topologies; workflow engines vs. free-running loops
- State, memory, and context management as architectural concerns
- Failure containment: timeouts, budgets, sandboxing, human-in-the-loop gates

### Module 4: Quality, Safety, and Security
- Evaluation-driven development: golden sets, LLM-as-judge, regression evals in CI
- Guardrails: input/output filtering, structured outputs, policy enforcement
- AI security: prompt injection, data exfiltration, model misuse — threat modeling AI features
- Responsible deployment: monitoring for drift, bias, and degraded behavior

### Module 5: Operating AI at Scale
- Inference economics: token costs, caching, batching, model routing
- Latency architecture: streaming responses, speculative and parallel calls
- Multi-tenant AI: isolation of prompts, corpora, and spend per tenant
- Graded project: architecture for an AI assistant over private enterprise data — topology, RAG design, eval plan, threat model, and cost model
