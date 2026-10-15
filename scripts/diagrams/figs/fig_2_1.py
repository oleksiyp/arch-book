"""Figure 2.1: the style catalog on its two generating axes (a quadrant chart)."""
from html import escape

from dg import Diagram, label_width, NAME_CH
from registry import figure

# plot area: x 0..1 -> 112..752, y 0..1 -> 448..48 (every 0.05 step lands on the 4px grid)
X0, X1, Y0, Y1 = 112, 752, 448, 48
CX, CY = (X0 + X1) // 2, (Y0 + Y1) // 2


def px(x):
    return int(round(X0 + x * (X1 - X0)))


def py(y):
    return int(round(Y0 - y * (Y0 - Y1)))


def mlabel(d, text, cx, y, cls="dg-label"):
    """Masked mono label centred on cx, mask top at y (12px tall)."""
    w = label_width(text)
    d.extra.append(f'<rect class="dg-mask" x="{cx - w / 2:g}" y="{y}" width="{w}" height="12" rx="2"/>'
                   f'<text class="{cls}" x="{cx:g}" y="{y + 9}">{escape(text)}</text>')


def point(d, x, y, name, place="above"):
    """A style: an r=4 dot with its name on a paper mask above or below."""
    cx, cy = px(x), py(y)
    w = int(len(name) * NAME_CH * 0.86 + 12 + 3) // 4 * 4
    ty = cy - 20 if place == "above" else cy + 8
    d.extra.append(f'<circle class="dg-start" cx="{cx}" cy="{cy}" r="4"/>'
                   f'<rect class="dg-mask" x="{cx - w / 2:g}" y="{ty}" width="{w}" height="14" rx="2"/>'
                   f'<text class="dg-name" x="{cx}" y="{ty + 11}">{escape(name)}</text>')


@figure
def fig_2_1():
    d = Diagram("fig-2-1", 864, 532, "The style catalog on two axes",
                "Quadrant chart placing eight architecture styles by code partitioning, technical to domain, and "
                "deployment, monolithic to distributed: layered, microkernel and pipeline are classic monoliths; "
                "modular monolith is a domain-partitioned monolith; service-based, microservices and space-based "
                "are domain-partitioned and distributed; event-driven sits on the dividing line; and the "
                "technical-plus-distributed quadrant is empty.")
    # the lonely quadrant: technical partitioning, distributed deployment
    d.zones.append(f'<rect class="dg-n dg-n-focal" x="{X0}" y="{Y1}" width="{CX - X0}" height="{CY - Y1}" rx="6"/>')
    # quadrant frames
    for qx, qy in ((CX, Y1), (X0, CY), (CX, CY)):
        d.zones.append(f'<rect class="dg-zone" x="{qx}" y="{qy}" width="{CX - X0}" height="{CY - Y1}" rx="6"/>')
    # axes: four rays from the centre, double-ended
    d.path([(CX, CY), (X0 - 8, CY)])
    d.path([(CX, CY), (X1 + 8, CY)])
    d.path([(CX, CY), (CX, Y1 - 8)])
    d.path([(CX, CY), (CX, Y0 + 8)])
    # axis end labels
    mlabel(d, "TECHNICAL PARTITIONING", X0 + 80, CY + 8)
    mlabel(d, "DOMAIN PARTITIONING", X1 - 72, CY + 8)
    mlabel(d, "DISTRIBUTED DEPLOYMENT", CX, Y1 - 36)
    mlabel(d, "MONOLITHIC DEPLOYMENT", CX, Y0 + 20)
    # quadrant names
    mlabel(d, "TECHNICAL + DISTRIBUTED", (X0 + CX) // 2, Y1 + 16, "dg-label dg-l-accent")
    d.note((X0 + CX) // 2, Y1 + 120, "nearly always a mistake", anchor="middle")
    mlabel(d, "DOMAIN + DISTRIBUTED", (CX + X1) // 2, Y1 + 16)
    mlabel(d, "CLASSIC MONOLITHS", (X0 + CX) // 2, Y0 - 28)
    mlabel(d, "DOMAIN-PARTITIONED MONOLITHS", (CX + X1) // 2, Y0 - 28)
    # the styles, at the source's coordinates
    point(d, 0.2, 0.25, "Layered")
    point(d, 0.35, 0.3, "Microkernel")
    point(d, 0.3, 0.15, "Pipeline", "below")
    point(d, 0.75, 0.25, "Modular monolith")
    point(d, 0.7, 0.65, "Service-based")
    point(d, 0.85, 0.9, "Microservices", "below")
    point(d, 0.5, 0.85, "Event-driven")
    point(d, 0.55, 0.78, "Space-based", "below")
    d.legend([("start", "Architecture style"), ("focal", "Lonely quadrant: distribution costs, no benefits")])
    return d
