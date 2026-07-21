# Course 9: Security Architecture and Zero Trust

## Description

In the cloud era, security is an architectural characteristic, not a compliance checkbox — and the architect, not a downstream security team, makes most of the decisions that determine whether a system is defensible. This course teaches secure-by-design thinking: threat modeling as a routine design activity, trust boundaries as first-class architectural elements, and the zero-trust model — never trust the network, always verify identity — as the organizing principle for modern system security. Students learn workload identity, mTLS and service-to-service authorization, secret management, supply-chain integrity (dependencies, images, provenance), and multi-tenant isolation models, all applied to the microservice, API, and event-driven architectures from earlier courses.

The course is defensive and design-oriented: the deliverables are threat models, trust-boundary diagrams, and security ADRs, not exploits. Cloud provider security primitives (IAM, network segmentation, KMS) are covered at the pattern level so the material transfers across AWS, GCP, and Azure. The closing module positions security as a platform capability — paved-road security, where the platform makes the secure path the easy path — which is a load-bearing pillar of the capstone.

**Primary sources:** *Building Microservices* ch. 11 (Newman), *Mastering API Architecture* Part III (Gough, Bryant, Auburn), *Building Multi-Tenant SaaS Architectures* ch. 9 (Golding), *Serverless Development on AWS* ch. 4 (Sbarski et al.), plus current NIST zero-trust and OWASP guidance

## Table of Contents

### Module 1: Thinking Like a Defender
- Security as an architectural characteristic; CIA triad in trade-off language
- Threat modeling: STRIDE, attack trees, and lightweight "evil brainstorming"
- Trust boundaries on C4 diagrams; data classification driving design
- Risk-based prioritization: what you protect first and why

### Module 2: Zero Trust and Identity
- Perimeter security's failure; zero-trust principles (NIST SP 800-207 essentials)
- Human identity: OIDC, SSO, MFA at the architecture level
- Workload identity: SPIFFE-style identities, mTLS, service authorization policies
- Network segmentation: VPCs, private endpoints, egress control

### Module 3: Securing the Stack
- Secrets management: vaults, rotation, short-lived credentials
- Data protection: encryption at rest/in transit/in use; key management patterns
- Supply chain: dependency scanning, image signing, SBOMs, provenance (SLSA)
- Event and API security: signed events, replay protection, OWASP API Top 10 recap

### Module 4: Isolation and Multi-Tenancy
- Tenant isolation models: silo, pool, bridge — and their blast radii
- Sandboxing untrusted workloads; AI-era concerns: prompt injection surfaces, model and data exfiltration (bridge to Course 11)
- Compliance as architecture: audit trails, data residency, least privilege at scale

### Module 5: Security as a Platform Capability
- Paved-road security: golden paths, policy as code, guardrails not gates
- Security fitness functions in the pipeline
- Graded project: full threat model and security architecture (diagrams + ADRs) for the Course 5 case-study system
