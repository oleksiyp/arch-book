# Course 7: API Architecture: Contracts, Traffic, and Evolution

## Description

APIs are the connective tissue of every architecture in this specialization — and, increasingly, the product surface of platforms. This course teaches API architecture end to end: designing REST APIs that model resources and workflows honestly, choosing between REST, gRPC, and GraphQL by trade-off rather than fashion, specifying contracts with OpenAPI/AsyncAPI, versioning without breaking consumers, and testing APIs at the contract level. Hypermedia is covered pragmatically as an evolvability technique, not an ideology.

The second half treats APIs as operated infrastructure: gateways and traffic management (rate limiting, authentication offload, canary routing), service mesh vs. gateway responsibilities, API security (OAuth 2.x/OIDC, token handling, the OWASP API Top 10), and running an API program — developer experience, documentation, discoverability, and lifecycle management. The framing throughout is platform-oriented: an API is a promise to other teams, and API management is an early, concrete form of platform thinking.

**Primary sources:** *Mastering API Architecture* (Gough, Bryant, Auburn), *RESTful Web API Patterns and Practices Cookbook* (Amundsen)

## Table of Contents

### Module 1: Designing APIs
- Resource modeling; workflows and long-running operations over HTTP
- REST maturity honestly assessed; when RPC-style is fine
- REST vs. gRPC vs. GraphQL: a trade-off matrix (latency, typing, client diversity, caching)
- Contract-first with OpenAPI; AsyncAPI for event interfaces
- Error design, pagination, idempotency keys, partial responses

### Module 2: Evolution and Compatibility
- Versioning strategies: additive change, tolerant readers, explicit versions
- Hypermedia as an evolvability tool; affordances and link relations
- Deprecation policy and sunset mechanics
- Contract testing in the delivery pipeline

### Module 3: API Traffic Management
- API gateways: responsibilities, topologies, and anti-patterns (the new ESB trap)
- Service mesh vs. gateway: north–south vs. east–west traffic
- Rate limiting, quotas, caching, and traffic shaping
- Release strategies for APIs: canary, shadow traffic, A/B routing

### Module 4: API Security
- OAuth 2.x and OpenID Connect flows for services, SPAs, and machines
- Token formats and handling: JWT pitfalls, opaque tokens, rotation
- The OWASP API Security Top 10, with worked exploits and mitigations
- Zero-trust posture for APIs (bridge to Course 9)

### Module 5: Running an API Program
- APIs as products: developer experience, docs, portals, discoverability
- Governance: style guides, linting, review automation
- Graded project: full API design for a case-study domain — OpenAPI spec, versioning policy, gateway topology, and security ADRs
