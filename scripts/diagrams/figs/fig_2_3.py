"""Figure 2.3: Encore's chosen shape, a modular monolith plus an on-sale quantum."""
from html import escape

from dg import Diagram
from registry import figure


class LineLegendDiagram(Diagram):
    """Diagram whose legend also takes ('line:<kind>', text): a connector with no arrowhead.
    Same strip as Diagram._legend otherwise."""

    def _legend(self):
        if not self.legend_items:
            return ""
        y = self.h - 28
        out = [f'<line class="dg-rule" x1="24" y1="{y - 12}" x2="{self.w - 24}" y2="{y - 12}"/>']
        x = 24
        for kind, text in self.legend_items:
            if kind.startswith(("arrow:", "line:")):
                parts = kind.split(":")
                k, dashed = parts[1], len(parts) > 2
                cls = f"dg-a dg-a-{k}" + (" dg-dash" if dashed else "")
                marker = f' marker-end="url(#{self.slug}-m-{k})"' if parts[0] == "arrow" else ""
                out.append(f'<line class="{cls}" x1="{x}" y1="{y + 4}" x2="{x + 24}" y2="{y + 4}"{marker}/>')
                x += 32
            elif kind in ("start", "end"):
                out.append(f'<circle class="dg-start" cx="{x + 6}" cy="{y + 4}" r="5"/>')
                x += 16
            else:
                dash = ' stroke-dasharray="4,3"' if kind == "optional" else ""
                out.append(f'<rect class="dg-n dg-n-{kind}" x="{x}" y="{y - 1}" width="16" height="10" rx="2"{dash}/>')
                x += 22
            out.append(f'<text class="dg-legend" x="{x}" y="{y + 7}">{escape(text)}</text>')
            x += int(len(text) * 5.6) + 28
        assert x <= self.w + 4, f"legend too wide: {x} > {self.w}"
        return "\n".join(out)


@figure
def fig_2_3():
    d = LineLegendDiagram(
        "fig-2-3", 864, 448, "Encore's chosen shape",
        "Sale Gate and Bot Screening form a separately deployed on-sale quantum that scales to the spike; the "
        "quantum admits fans at a sustainable rate into Encore's modular monolith, one deployment in which Order works "
        "with Event Catalog, Seat Inventory, Payment Integration and Notification and feeds Sales Analytics.")
    H = 56
    r1, r2, r3 = 64, 176, 288
    G, O, C2 = 48, 352, 648
    GW, OW, CW = 176, 160, 168
    # zones
    d.zone(24, 152, 232, 216, "ON-SALE QUANTUM · OWN DEPLOYMENT")
    d.zone(320, 40, 520, 328, "ENCORE MODULAR MONOLITH · ONE DEPLOYMENT")
    # connectors
    d.path([(G + GW // 2, r2 + H), (G + GW // 2, r3)])
    # quantum to quantum: the on-sale deployment admits fans into the monolith as a whole
    d.path([(256, 260), (320, 260)], label="ADMITS AT SAFE RATE")
    d.path([(O + OW // 2, r2), (O + OW // 2, r1 + H)], arrow=False)
    d.path([(O + OW // 2, r2 + H), (O + OW // 2, r3)], arrow=False)
    d.path([(O + OW, 188), (568, 188), (568, 92), (C2, 92)], arrow=False)
    d.path([(O + OW, 204), (C2, 204)], arrow=False)
    d.path([(O + OW, 220), (584, 220), (584, 316), (C2, 316)], dashed=True, label="SALES FACTS", at=1, side="right")
    # nodes
    d.node(G, r2, GW, H, "Sale Gate", "scales to the spike", "focal")
    d.node(G, r3, GW, H, "Bot Screening", "risk signals", "focal")
    d.node(O, r1, OW, H, "Event Catalog", "events · seats")
    d.node(O, r2, OW, H, "Order", "purchase flow")
    d.node(O, r3, OW, H, "Notification", "tickets · email")
    d.node(C2, r1, CW, H, "Seat Inventory", "holds · sales", "store")
    d.node(C2, r2, CW, H, "Payment Integration", "PSP integration")
    d.node(C2, r3, CW, H, "Sales Analytics", "dashboards", "store")
    d.legend([("focal", "Elasticity outlier, scaled apart"), ("backend", "Module"), ("store", "Owns data"),
              ("arrow:muted", "Call"), ("line:muted", "In-process link"), ("arrow:muted:dashed", "Fact, not a call")])
    return d
