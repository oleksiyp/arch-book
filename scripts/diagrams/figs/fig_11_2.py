"""Figure 11.2 — the error budget as automatic policy."""
from html import escape

from dg import Diagram
from registry import figure


def _diamond(d, cx, cy, hw, hh, lines, kind="focal"):
    """A decision diamond (local primitive): paper mask, styled polygon, centred name lines."""
    assert all(v % 4 == 0 for v in (cx, cy, hw, hh))
    pts = f"{cx},{cy - hh} {cx + hw},{cy} {cx},{cy + hh} {cx - hw},{cy}"
    out = [f'<polygon class="dg-mask" points="{pts}"/>',
           f'<polygon class="dg-n dg-n-{kind}" points="{pts}"/>']
    y0 = cy + 4 - (len(lines) - 1) * 8
    for i, t in enumerate(lines):
        out.append(f'<text class="dg-name" x="{cx}" y="{y0 + i * 16}">{escape(t)}</text>')
    d.nodes.append("\n".join(out))


@figure
def fig_11_2():
    d = Diagram("fig-11-2", 864, 356, "The error budget as automatic policy",
                "The remaining error budget decides the release posture: with budget left, ship features "
                "as canaries promote and flags open; when it is burning fast, slow down as canaries hold and "
                "risky flags freeze; when it is exhausted, do reliability work only until the budget recovers.")
    CX, CY, HW, HH = 176, 168, 96, 60
    X, W, H = 504, 280, 56
    r1, r2, r3 = 40, 140, 240
    d.path([(CX, CY - HH), (CX, r1 + H // 2), (X, r1 + H // 2)], label="YES", at=1)
    d.path([(CX + HW, CY), (X, CY)], label="BURNING FAST")
    d.path([(CX, CY + HH), (CX, r3 + H // 2), (X, r3 + H // 2)], label="EXHAUSTED", at=1)
    _diamond(d, CX, CY, HW, HH, ["Error budget", "remaining?"])
    d.node(X, r1, W, H, "Ship features", "canaries promote, flags open")
    d.node(X, r2, W, H, "Slow down", "canaries hold, risky flags freeze")
    d.node(X, r3, W, H, "Reliability work only", "until budget recovers")
    d.legend([("focal", "The budget decides"), ("backend", "Release posture"),
              ("arrow:muted", "Budget state")])
    return d
