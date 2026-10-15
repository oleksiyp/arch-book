"""Figure 3.2: Encore's context map."""
from figs.fig_2_3 import LineLegendDiagram
from registry import figure


@figure
def fig_3_2():
    d = LineLegendDiagram(
        "fig-3-2", 864, 468, "Encore's context map",
        "Three core contexts, On-Sale Admission, Seat Inventory and Ticketing, and Orders and Payments, are "
        "partners; Event Catalog supplies On-Sale Admission as customer and supplier; Seat Inventory publishes "
        "ticket events to Support and Refunds as an open-host service; and the external payment provider "
        "reaches Orders and Payments only through an anticorruption layer.")
    H = 56
    L, M, R = 24, 332, 696
    LW, MW, RW = 144, 200, 144
    rA, rB, rC = 40, 192, 344
    lc, mc, rc = L + LW // 2, M + MW // 2, R + RW // 2
    yB = rB + 32
    # connectors (partnership has no direction)
    d.path([(L + LW, yB), (M, yB)], arrow=False)
    d.label_at("PARTNERSHIP", (L + LW + M) / 2, yB, side="above")
    d.label_at("EVOLVE TOGETHER", (L + LW + M) / 2, yB, side="below")
    d.path([(M + MW, yB), (R, yB)], arrow=False)
    d.label_at("PARTNERSHIP", (M + MW + R) / 2, yB, side="above")
    d.label_at("ONE SALE, ONE TRANSACTION", (M + MW + R) / 2, yB, side="below")
    my = (rA + H + rB) / 2
    d.path([(lc, rA + H), (lc, rB)])
    d.label_at("CUSTOMER–SUPPLIER", lc, my - 8, horizontal=False, side="right")
    d.label_at("CATALOG SERVES ADMISSION", lc, my + 8, horizontal=False, side="right")
    d.path([(rc, rA + H), (rc, rB)], kind="accent")
    d.label_at("ANTICORRUPTION LAYER", rc, my - 8, horizontal=False, side="left", kind="accent")
    d.label_at("PSP MODEL KEPT OUTSIDE", rc, my + 8, horizontal=False, side="left")
    my2 = (rB + H + rC) / 2
    d.path([(mc, rB + H), (mc, rC)])
    d.label_at("OPEN-HOST SERVICE", mc, my2 - 8, horizontal=False, side="right")
    d.label_at("PUBLISHED TICKET EVENTS", mc, my2 + 8, horizontal=False, side="right")
    # nodes
    d.node(L, rA, LW, H, "Event Catalog", None, "backend", tag="SUPPORTING")
    d.node(R, rA, RW, H, "Payment provider", "external PSP", "external", tag="GENERIC")
    d.node(L, rB, LW, H, "On-Sale Admission", None, "backend", tag="CORE")
    d.node(M, rB, MW, H, "Seat Inventory & Ticketing", None, "backend", tag="CORE")
    d.node(R, rB, RW, H, "Orders & Payments", "ACL translator", "focal", tag="CORE")
    d.node(M, rC, MW, H, "Support & Refunds", None, "backend", tag="SUPPORTING")
    d.legend([("backend", "Context"), ("focal", "ACL owner"), ("external", "Outside party"),
              ("line:muted", "Partnership"), ("arrow:muted", "Upstream to downstream"),
              ("arrow:accent", "Anticorruption layer")])
    return d
