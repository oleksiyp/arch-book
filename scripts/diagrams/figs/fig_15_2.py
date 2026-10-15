"""Figure 15.2 — the platform as the book's index page."""
from html import escape

from dg import Diagram
from registry import figure


@figure
def fig_15_2():
    d = Diagram("fig-15-2", 864, 408, "The platform as the book's index page",
                "Forty product teams use golden paths and a self-service portal on a platform control plane "
                "for provisioning, registry, scorecards and metering, which manages the capabilities built in "
                "earlier chapters: compute and delivery, the event backbone, data products, API and UI paths, "
                "security guardrails and the AI gateway.")
    CX = 432
    W, G, X0 = 124, 16, 20
    caps = [("Compute", "& delivery · Ch. 11"), ("Event backbone", "Ch. 6"), ("Data products", "Ch. 9"),
            ("API & UI paths", "Ch. 7 · Ch. 8"), ("Security", "guardrails · Ch. 10"), ("AI gateway", "Ch. 12")]
    d.path([(CX, 76), (CX, 108)])
    d.path([(CX, 160), (CX, 192)])
    for i in range(6):
        cx = X0 + i * (W + G) + W // 2
        d.path([(cx, 264), (cx, 296)])
    d.node(272, 24, 320, 52, "40 product teams", "the platform's tenants", "input")
    d.node(272, 108, 320, 52, "Golden paths", "self-service portal")
    # control plane: a wide focal bar with two sublabel lines (written out, node() has one)
    x, y, w, h = 20, 192, 824, 72
    d.nodes.append("\n".join([
        f'<rect class="dg-mask" x="{x}" y="{y}" width="{w}" height="{h}" rx="6"/>',
        f'<rect class="dg-n dg-n-focal" x="{x}" y="{y}" width="{w}" height="{h}" rx="6"/>',
        f'<text class="dg-name" x="{CX}" y="{y + 26}">Platform control plane</text>',
        f'<text class="dg-sub" x="{CX}" y="{y + 42}">{escape("provisioning · registry · scorecards · metering")}</text>',
        f'<text class="dg-sub" x="{CX}" y="{y + 56}">{escape("Ch. 14’s pattern, teams as tenants")}</text>']))
    for i, (name, sub) in enumerate(caps):
        d.node(X0 + i * (W + G), 296, W, 52, name, sub)
    d.legend([("input", "Tenants"), ("backend", "Path or capability"), ("focal", "The platform's contribution"),
              ("arrow:muted", "Uses / manages")])
    return d
