# AGENTS.md — Working on This Repository

This repo is a 14-course Coursera specialization on software architecture ("Software Architecture in the AI & Cloud Era — The Road to Platform Architecture"). Content lives in `README.md` (index) and `course001.md`–`course014.md`. Source books (PDFs, gitignored) are in `books/`.

## Publishing

- Private repo `oleksiyp/arch-course`; public site at https://oleksiyp.github.io/arch-course/
- Deployed by `.github/workflows/deploy.yml` (Jekyll build → GitHub Pages) on every push to `main`
- Theme: Cayman, customized in `assets/css/style.scss` and `_layouts/default.html`
- Palette: dark navy `#1b1f3b`, violet `#6c2bd9` / `#5a23c8`, cyan `#00c9ff`, link blue `#0b7ecb`

## Content rules

- **No legacy-era material**: no UML, no orchestration-driven SOA/ESB except as brief cautionary history. Diagrams are C4-style, expressed as diagrams-as-code.
- The curriculum arc converges on **platform architecture** (Course 14). Keep forward references ("bridge to Course N") accurate when renumbering.
- Every course file: title, 2-paragraph description, "References" line (TOC-style pages) or closing "References" section (full course texts), 5-module TOC.
- **References are neutral bibliography entries** — author and *title* (plus publisher/year in full course texts), with the title linked to the book's official web page (publisher or oreilly.com catalog). No chapter/part-to-module mappings.
- Security, cloud, and AI concerns are woven throughout, not siloed.

## Illustration strategy

Never commit binary images (PNG/JPG). All visuals are text-authored and rendered in the browser. Choose by case:

### Mermaid — the default for diagrams
The Mermaid loader is site-wide (in `_layouts/default.html`), so any page can use it. **Must** be written as raw HTML blocks:

    <pre class="mermaid">
    flowchart LR
        A[Service] --> B[(Broker)]
    </pre>

Do NOT use fenced ```mermaid code blocks — Jekyll/Rouge renders them as highlighted code instead of diagrams.

Use Mermaid for:
- **System topologies, component relationships, context maps** → `flowchart` (use `subgraph` for boundaries/platforms/bounded contexts)
- **Interactions over time** (API calls, sagas, onboarding flows, agent loops) → `sequenceDiagram`
- **Lifecycles and state** (tenant lifecycle, circuit breaker states, deployment stages) → `stateDiagram-v2`
- **C4 context/container diagrams** → do NOT use Mermaid's `C4Context`/`C4Container` (its renderer overlaps edge labels and scatters nodes). Draw them as `flowchart LR` with C4 semantics: rounded nodes for people, rectangles for systems, `classDef` palette — person `#1b1f3b`, system `#6c2bd9`, external `#e8e8ee` — and verb-labeled edges. See Figure 2 in course001.md for the canonical example.
- **Roadmaps/migration timelines** → `gantt` (sparingly)

Accept Mermaid's auto-layout: don't fight node positions. If a flowchart gets tangled beyond ~15 nodes, split it into two diagrams instead of tweaking.

### Inline SVG — small precise static figures
Hand-written `<svg>` directly in the markdown. Use only when exact geometry or brand styling matters and the figure is small (≤ ~12 shapes): title-card graphics, simple before/after figures, gradient artwork matching the site palette. Beyond that size, hand-coordinate SVG degrades — use Mermaid.

### Canvas + JS — animations and simulations only
`<canvas>` with an inline script, for concepts that are inherently dynamic: load balancing, backpressure, gossip protocols, autoscaling. Use sparingly (at most one per course page); always set a fallback background color and `max-width:100%`.

### General guidance
- Illustrate where a picture beats prose: topologies, flows over time, state machines, layered planes. Don't diagram lists or taxonomies — prose and tables handle those better.
- Keep diagram source semantic (real service names from the course's running example, not Foo/Bar).
- All external libraries load from CDN (jsdelivr) at view time; keep to Mermaid unless there's a strong reason.
