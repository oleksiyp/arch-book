# Test: JavaScript-Generated Visuals

This page tests ways to get "images" on the site without any actual image files. Everything below is generated in the browser from text — which means it can be authored and edited as plain code, version-controlled, and rendered crisply at any resolution. This is exactly how modern architecture documentation works: diagrams-as-code instead of exported PNGs that rot the moment the system changes.

## Option 1: Mermaid — diagrams from text

Mermaid turns a short text description into a rendered diagram at page load. This is the workhorse for architecture content: flowcharts, sequence diagrams, state machines, even C4 diagrams.

<pre class="mermaid">
flowchart LR
    U[User] --> GW[API Gateway]
    GW --> S1[Order Service]
    GW --> S2[Catalog Service]
    S1 --> K[(Event Broker)]
    K --> S3[Billing Service]
    K --> DP[Data Products]
    subgraph Platform
        GW
        K
    end
</pre>

<pre class="mermaid">
sequenceDiagram
    participant Team as Product Team
    participant IDP as Internal Dev Platform
    participant Cloud
    Team->>IDP: request service from golden path
    IDP->>Cloud: provision (IaC, guardrails applied)
    Cloud-->>IDP: endpoints + dashboards
    IDP-->>Team: ready in minutes, secure by default
</pre>

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
</script>

## Option 2: Inline SVG — no JavaScript at all

SVG is just markup, so it can live directly in the Markdown file. Perfect for simple, precise figures.

<svg viewBox="0 0 560 150" style="max-width:560px;width:100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6c2bd9"/>
      <stop offset="1" stop-color="#00c9ff"/>
    </linearGradient>
  </defs>
  <rect x="10" y="30" width="150" height="60" rx="10" fill="url(#hdr)"/>
  <text x="85" y="65" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14">Monolith</text>
  <path d="M170 60 H 230" stroke="#5a23c8" stroke-width="3" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="#5a23c8"/>
    </marker>
  </defs>
  <rect x="240" y="10" width="130" height="40" rx="8" fill="#1b1f3b"/>
  <text x="305" y="35" text-anchor="middle" fill="white" font-family="sans-serif" font-size="13">Service A</text>
  <rect x="240" y="70" width="130" height="40" rx="8" fill="#1b1f3b"/>
  <text x="305" y="95" text-anchor="middle" fill="white" font-family="sans-serif" font-size="13">Service B</text>
  <rect x="400" y="40" width="150" height="60" rx="10" fill="#0b7ecb"/>
  <text x="475" y="75" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14">Platform</text>
  <path d="M380 30 C 400 30, 390 60, 400 60" stroke="#0b7ecb" stroke-width="2" fill="none"/>
  <path d="M380 90 C 400 90, 390 80, 400 80" stroke="#0b7ecb" stroke-width="2" fill="none"/>
</svg>

## Option 3: Canvas — fully programmatic drawing

A `<canvas>` element plus a script gives complete freedom: generated art, animations, interactive simulations.

<canvas id="net" width="560" height="200" style="max-width:100%;border-radius:8px"></canvas>
<script>
(function () {
  const c = document.getElementById('net'), x = c.getContext('2d');
  const N = 26, nodes = [];
  for (let i = 0; i < N; i++) {
    nodes.push({
      px: Math.random() * c.width, py: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6
    });
  }
  function tick() {
    x.fillStyle = '#1b1f3b';
    x.fillRect(0, 0, c.width, c.height);
    for (const n of nodes) {
      n.px += n.vx; n.py += n.vy;
      if (n.px < 0 || n.px > c.width) n.vx *= -1;
      if (n.py < 0 || n.py > c.height) n.vy *= -1;
    }
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.px - b.px, a.py - b.py);
      if (d < 90) {
        x.strokeStyle = 'rgba(0,201,255,' + (1 - d / 90) * 0.7 + ')';
        x.beginPath(); x.moveTo(a.px, a.py); x.lineTo(b.px, b.py); x.stroke();
      }
    }
    for (const n of nodes) {
      x.fillStyle = '#00c9ff';
      x.beginPath(); x.arc(n.px, n.py, 2.5, 0, 7); x.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();
</script>

That's it — a distributed system that never stops moving, much like production.
