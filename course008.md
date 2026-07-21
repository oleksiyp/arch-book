# Course 8: UI and Frontend Architecture

## Description

The user interface is where architecture meets its users — and over the last decade the frontend has grown an architectural discipline of its own, with rendering strategies, composition models, and performance characteristics that deserve the same trade-off rigor as any backend decision. This course teaches UI architecture at the architect's altitude: choosing rendering models (client-side SPA, server-side rendering, static generation, streaming and islands, edge rendering) per class of page rather than per fashion cycle; treating Core Web Vitals as architectural characteristics with direct business impact; and structuring frontend codebases — design systems, module boundaries, state management — so they scale with the number of teams, not just the number of components.

The second half covers composition at scale and the frontend–backend seam. Micro-frontends get the honest treatment: when team scale genuinely demands runtime composition, and when the pattern is a distributed monolith in the browser. The backend-for-frontend pattern connects this course to the API material of Course 7, browser security (XSS, CSP, token handling) previews Course 10, and a closing module addresses the AI-era interface: conversational UIs, streaming model responses, and generative interface patterns that Course 12 systems require. Throughout, the platform lens applies — design systems and frontend golden paths are among the first platform products most organizations build.

**References:** [*Building Microservices*](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) (Newman), [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/) (Gough, Bryant, Auburn), plus current frontend practitioner literature (rendering patterns, micro-frontends, design systems)

## Table of Contents

### Module 1: Rendering Architectures
- The rendering spectrum: CSR/SPA, SSR, static generation, incremental regeneration
- Streaming SSR, islands, and partial hydration; edge rendering
- Choosing per page class: content, dashboard, transactional flow, real-time view
- Core Web Vitals as architectural characteristics; performance budgets

### Module 2: Structuring the Frontend
- Design systems and component libraries: the frontend's shared kernel
- Module boundaries in frontend code; monorepo strategies and build tooling
- State management architecture: local state, server cache, global state — and why the distinctions matter
- Data fetching patterns: waterfalls, prefetching, suspense-style loading

### Module 3: Micro-Frontends and Composition
- When team scale demands independent frontend deployability — and when it doesn't
- Composition options: build-time packages, runtime module federation, iframes, edge-side includes
- The shell: routing, shared dependencies, design-system versioning
- Honest costs: payload duplication, UX consistency, the distributed monolith in the browser

### Module 4: The Frontend–Backend Seam
- Backend-for-frontend: one experience, one aggregation layer
- GraphQL for UIs: federation, persisted queries, cache normalization
- Real-time UIs: WebSockets, server-sent events, optimistic updates, offline-first
- Multi-platform reality: web, native mobile, and shared contract strategies

### Module 5: Security, Accessibility, and AI Interfaces
- The browser security model: XSS, CSP, token handling (cookies vs. storage), OAuth in SPAs
- Accessibility as an architectural characteristic, not a retrofit
- Conversational and generative UI: streaming AI responses, progressive rendering of model output, human-in-the-loop controls
- Graded project: frontend architecture for the case-study product — rendering matrix per page class, BFF design, composition strategy, and team-scaling plan
