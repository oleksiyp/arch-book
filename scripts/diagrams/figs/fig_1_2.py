"""Figure 1.2: Encore's system context."""
from dg import Diagram
from registry import figure


@figure
def fig_1_2():
    d = Diagram("fig-1-2", 864, 292, "Encore's system context",
                "Fans browse, queue and buy, and organizers manage events, all through Encore, a single system "
                "whose insides are not yet decided; Encore charges cards through a payment provider and issues "
                "tickets to mobile wallets.")
    H = 56
    L, LW = 24, 176          # people
    C, CW = 352, 160         # the system
    R, RW = 664, 176         # outside parties
    r1, r2 = 48, 176
    y1, y2 = r1 + H // 2, r2 + H // 2
    # connectors (before boxes)
    d.path([(L + LW, y1), (C, y1)], label="BROWSES · QUEUES · BUYS")
    d.path([(L + LW, y2), (C, y2)], label="MANAGES EVENTS")
    d.path([(C + CW, y1), (R, y1)], kind="link", label="CHARGES CARDS")
    d.path([(C + CW, y2), (R, y2)], kind="link", label="ISSUES TICKETS")
    # nodes
    d.node(L, r1, LW, H, "Fan", "finds events, buys tickets", "input")
    d.node(L, r2, LW, H, "Organizer", "creates events, tracks sales", "input")
    d.node(C, r1, CW, r2 + H - r1, "Encore", "ticketing platform", "focal")
    d.node(R, r1, RW, H, "Payment Provider", "card processing", "external")
    d.node(R, r2, RW, H, "Mobile Wallets", "ticket delivery", "external")
    d.legend([("input", "People"), ("focal", "The system"), ("external", "Outside party"),
              ("arrow:muted", "Interaction"), ("arrow:link", "Call to an outside party")])
    return d
