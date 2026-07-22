# Course 8: UI and Frontend Architecture

> Users never see your architecture. They see the pixels it earned them.

## Welcome

Here is an uncomfortable audit: Encore's backend now boasts extracted services, an event backbone, and a hardened API — and a fan on a phone in a stadium parking lot still waits four seconds for the seat map. Every characteristic Course 1 promised — elasticity, availability, speed — is ultimately *experienced* in a browser or an app, and the frontend has quietly become its own architectural domain: with rendering economics, composition models, state disciplines, and a security perimeter that backend thinking maps onto badly.

This course treats the frontend at the architect's altitude. Not React-vs-whatever — framework debates age like fish — but the decisions underneath any framework: where rendering happens, how frontend code scales with *teams*, where the frontend–backend seam sits, and what the AI era does to the interface itself. The habit to bring: the frontend is not the end of the pipeline; it is the part of the system your users actually run.

## Module 1: Rendering Architectures

### Where the pixels come from is an architecture decision

Every page answers one question: is HTML assembled on the client, on a server, or ahead of time? The spectrum, with its economics:

| Strategy | HTML assembled | First paint | Freshness | Server cost | Fits |
|---|---|---|---|---|---|
| **CSR** (SPA) | in the browser | slow (bundle first) | live | tiny | logged-in tools, editors |
| **SSR** | per request | fast | live | per-request | personalized, SEO-critical pages |
| **SSG** | at build time | fastest | stale until rebuild | ~zero | marketing, docs |
| **ISR / SSG+revalidate** | build + timed refresh | fastest | minutes-stale | tiny | catalogs, listings |
| **Islands / partial hydration** | server, JS only where needed | fast | mixed | small | content pages with pockets of app |
| **Edge SSR** | per request, near the user | fast globally | live | per-request | personalized + global |

*Figure 1 — The rendering menu. The architect's move is refusing to buy one row for the whole product: rendering is chosen per page class, exactly as Course 4 bought consistency per invariant.*

Run Encore through it. The **event catalog** — read by millions, changed weekly — is ISR: static speed, minutes of staleness the business already accepted in Course 4's cache table. The **seat map** during an on-sale — personal, live, interactive — is CSR inside an SSR shell, fed by real-time updates (Module 4). **Checkout** — personalized, SEO-irrelevant, correctness-critical — is SSR, minimal JavaScript, no cleverness near money. Three page classes, three rows, one product.

### Performance is a characteristic with a name

Core Web Vitals (loading, interactivity, visual stability) are Course 1 characteristics wearing Google's naming: measurable, business-correlated (conversion drops per 100 ms are the most replicated result in web commerce), and budgetable. The discipline is **performance budgets as fitness functions**: the CI fails when the checkout bundle exceeds 150 KB or LCP regresses past 2 s on a mid-tier phone profile — because entropy always wins against intentions, and never against a red build.

**Recap.** Rendering is chosen per page class from a priced menu; Encore uses three strategies on one product. Web vitals are architectural characteristics; budgets in CI are their fitness functions.

**Exercise 1.1.** Classify five screens of a product you know into Figure 1's rows. Which screen is currently bought from the wrong row, and what is it costing?

## Module 2: Structuring the Frontend

### Team-scale, not component-scale

Frontend codebases fail at the same scale backends do: the moment several teams share one. The structural toolkit mirrors Course 2's, one level down. The **design system** — tokens, components, patterns with an owner and a versioning policy — is the frontend's shared kernel: the one dependency every team accepts in exchange for coherence (and, like every shared kernel from Course 3, it must stay *thin*; a design system that absorbs business components becomes a coordination chokepoint with a style guide). **Module boundaries** inside the app follow bounded contexts, not technical layers — `catalog/`, `checkout/`, `organizer/`, each owning its routes, state, and API calls, with the same cycle-detection fitness functions the Course 2 monolith ran. The monorepo makes boundaries cheap to enforce and refactors atomic; its price is build tooling that someone must own.

### State: the frontend's hardest problem, demystified

Most frontend complexity is state handled without a taxonomy. There are only three kinds, and they want different machinery:

| Kind | Examples | Right machinery |
|---|---|---|
| **Local UI state** | open modal, input draft | component state; nothing fancier |
| **Server cache** | events, seats, orders — *the backend's truth, borrowed* | query cache with staleness policy (stale-while-revalidate) |
| **Genuine global client state** | auth session, cart-in-progress, theme | small explicit store |

*Figure 2 — The state taxonomy. The classic disaster is one global store holding all three: server truth goes stale in it, UI trivia churns it, and every component couples to everything. Most "global state" is server cache in denial — treat it as the caching problem Course 4 already taught, staleness policy and all.*

Data fetching completes the module: request **waterfalls** (component renders → fetches → child renders → fetches...) are the frontend's sequential-call latency sin from Course 4, and the cures rhyme — declare data needs at the route level, fetch in parallel, prefetch on intent (hover, viewport). The seat map that took four seconds? Three sequential waterfalls and an unbudgeted bundle. Now you know the audit.

**Recap.** Design system as thin shared kernel; module boundaries along contexts with enforced rules; state sorted into three kinds with server-cache treated as caching, not global state. Waterfalls are sequential calls wearing JSX.

**Exercise 2.1.** Open your product's slowest screen and trace its requests. Draw the waterfall. Which fetches could be parallel or prefetched, and what route-level declaration would do it?

## Module 3: Micro-Frontends and Composition

### The honest question: how many teams?

Micro-frontends promise team-independent frontend deployment — Course 5's argument, one layer up. The honest prerequisite is also the same: a *team-coordination problem, measured in waiting*. One team? The pattern is pure cost. Encore's nine teams with two frontend-heavy ones? A modular monolith frontend (Module 2 boundaries, one deploy) serves fine, with one exception worth its price: the **organizer portal** — different users, different release cadence, different risk tolerance than the fan storefront — ships as a separate application behind the same design system. That is micro-frontends at its most defensible: split along *experience* seams, not component seams.

For organizations that do need runtime composition, the menu with prices: **build-time packages** (simple, but re-couples deploys — a library, not a micro-frontend), **runtime module federation** (true independent deploys; shared-dependency version discipline required), **iframes** (bulletproof isolation, miserable UX seams), **edge-side composition** (assemble at the CDN; strong for content, weak for rich interaction). Every runtime option pays three taxes the monolith frontend never sees: payload duplication (N teams' frameworks unless federated carefully), UX consistency drift (the design system becomes load-bearing), and a *shell* — the router/auth/composition layer that is now a product needing an owner (Course 14 will recognize it as platform).

> **The distributed monolith, browser edition.** If your micro-frontends must release together because they share state shape, route contracts, or a redux store — you have the deployment independence of a monolith plus the payload of a federation. The Course 5 test applies verbatim: can this piece ship alone, unannounced?

**Recap.** Micro-frontends are bought with team-scale coordination pain, split along experience seams. Runtime composition taxes payload, consistency, and demands an owned shell. Most products deserve a modular monolith frontend and one honest exception.

**Exercise 3.1.** Count the frontend teams touching your main app and their release collisions last quarter. Verdict: modular monolith, one split, or federation — and which seam?

## Module 4: The Frontend–Backend Seam

### BFFs: one experience, one aggregator

Course 5 warned against the screen that calls nine services; the **backend-for-frontend** is the standing answer. Each *experience* — fan app, organizer web, partner embed — gets its own thin aggregation layer, owned by the frontend team that consumes it: it fans out to services (in parallel — it exists to kill client-visible waterfalls), shapes responses to screen needs, and holds the tokens so the browser doesn't have to (Module 5 will thank it).

<pre class="mermaid">
flowchart LR
    fan([Fan app]) --> fbff["Fan BFF<br/><small>owned by fan-web team</small>"]
    org([Organizer web]) --> obff["Organizer BFF"]
    fbff --> cat["Catalog"] & inv["Inventory"] & ord["Orders"]
    obff --> cat & ana["Analytics"]
    inv -. "SSE: seat updates" .-> fan
    classDef hot fill:#6c2bd9,stroke:#6c2bd9,color:#fff
    class fbff,obff hot
</pre>

*Figure 3 — BFFs per experience. Ownership is the subtle part: the BFF belongs to the frontend team, because it changes at the screen's cadence, not the services'. A shared "general-purpose BFF" is just an API gateway growing business logic — Course 7's ESB trap, one floor up.*

GraphQL earns its Course 7 rain check here: when many screens need flexible slices of many services, a federated graph *is* a BFF strategy — typed, client-driven, cache-normalized — at the price of per-field authorization and an owned graph. Encore's two experiences don't justify it; forty screens across six teams would.

**Real-time and the optimistic contract.** The seat map wants server push: SSE for one-way streams (seat availability — Encore's choice: HTTP-native, proxy-friendly, auto-reconnecting), WebSockets when the client talks back. Behind both stands Course 6's event backbone — the browser is simply the last subscriber. And because Course 4's physics reaches fingertips: **optimistic UI** applies local effect immediately, reconciles on the server's answer, and must *design the apology* — the fan who tapped a seat that was gone gets an instant, graceful "taken — here are three nearby," not a spinner and a shrug.

**Recap.** BFFs are per-experience, frontend-owned, waterfall-killing aggregators; GraphQL is a BFF strategy for many-screen scale. Real-time UIs are event subscribers; optimistic UI is eventual consistency with manners.

**Exercise 4.1.** Design the optimistic flow for Encore's seat tap: local effect, reconciliation, and the apology path. What does the fan see at 200 ms, 800 ms, and on conflict?

## Module 5: Security, Accessibility, and AI Interfaces

### The browser is a hostile runtime you don't control

Frontend security inverts backend instincts: your code executes beside adversarial code, in an environment the user extends with plugins you've never heard of. The load-bearing decisions: **token custody** — access tokens in JavaScript-readable storage are XSS loot; Encore's BFFs hold the tokens and give browsers only `HttpOnly`, `Secure`, same-site session cookies (the BFF earning its keep twice); **Content-Security-Policy** as the browser's execution allowlist — deployed in report-only first, then enforced, turning "any injected script runs" into "nothing unvetted runs"; and the standing rule that *rendering user content is code execution until proven otherwise* — sanitization is a library choice, not a homemade regex.

**Accessibility as characteristic, not sprint task.** Like security, a11y is architectural because retrofits fail: semantic structure, keyboard paths, and contrast tokens live in the design system (one fix, every team) and in CI checks — Encore's seat map ships with a keyboard/screen-reader seat picker *designed*, not patched, because a fan who can't operate the picker in 90 seconds of on-sale isn't inconvenienced; they're excluded.

**The AI-era interface.** Course 12 will build model-backed features; the frontend meets them first. Three patterns to hold: **streamed responses** (tokens render as they arrive — perceived latency is the only latency users feel; the SSE machinery from Module 4 reused verbatim); **generative UI discipline** (model output renders into *vetted components* — cards, lists, forms — never raw HTML: injection isn't just a security issue now, it's a correctness one); and **human-in-the-loop affordances** (AI-suggested actions arrive as *proposals with visible undo*, because trust is a UX property before it is a model property).

**Recap.** BFF-held tokens + CSP + sanitization form the browser perimeter; a11y lives in the design system and CI or nowhere; AI features stream into vetted components with undo as a first-class affordance.

**Exercise 5.1.** Audit any form you own: where do tokens live, what does CSP allow, what renders user input? Three answers, three possible incidents.

## Kata: The Storefront

> **Your brief: "Bloom."** A florist marketplace: 2,000 independent shops, buyers mostly arriving from search and Instagram links (SEO and first-paint decisive), a shop-owner portal (orders, arrangements, deliveries) used all day on tablets, and same-day delivery tracking that changes minute-to-minute. Eight engineers: six product, two "the ones who like frontend." Mother's Day is Bloom's on-sale: 30× traffic, 70% of it first-time visitors on phones.

**Deliverables:**

1. **Rendering matrix** — every page class mapped to Figure 1's rows, with the Mother's Day column: what stays fast when traffic is 30×?
2. **Structure plan** — module boundaries, the state taxonomy applied (what is server cache? what is genuinely global?), and two performance budgets with CI enforcement.
3. **Composition verdict** — buyer storefront vs. shop portal: one app, two apps, or federation? Argued from team count, not fashion.
4. **Seam design** — BFF(s) with ownership, the delivery-tracking push channel, and the optimistic flow for "claim this delivery slot."
5. **One ADR** — token custody and CSP posture for a site embedding shop-owner-authored content.

**Rubric:**

| Criterion | The question your reviewer asks |
|---|---|
| Per-class rendering | Does Mother's Day traffic hit static/ISR paths, or servers? |
| State honesty | Is anything global that is really server cache? |
| Team-scale sizing | Is the composition answer sized to eight engineers? |
| Perimeter placement | Could an XSS in a shop's bio reach a buyer's session? |

### Where you now stand

The pixels now have an architecture: rendering bought per page, state sorted, seams owned, perimeter drawn. Behind every screen you've built, though, stands the question this specialization has deferred twice already: who owns the *data* — operationally, analytically, and at the scale where every team wants everyone else's tables. Course 9: data architecture, from distributed ownership to the data mesh.

## References

- James Gough, Daniel Bryant, Matthew Auburn — [*Mastering API Architecture*](https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/). O'Reilly, 2022.
- Sam Newman — [*Building Microservices*, 2nd ed.](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) O'Reilly, 2021.

**Further reading:**

- Michael Geers — [*Micro Frontends in Action*](https://www.manning.com/books/micro-frontends-in-action). Manning, 2020.
- Ilya Grigorik — [*High Performance Browser Networking*](https://hpbn.co/). O'Reilly, 2013 — free online.
