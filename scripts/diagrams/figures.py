"""The book's figures, hand-laid out with dg.py. Run build.py to write _includes/diagrams/.

The three pilot figures live here; every other figure is its own module in figs/,
which registers itself with @figure.
"""
import importlib
import os
import pkgutil
from html import escape

from dg import Diagram, label_width
from registry import FIGURES, figure
from seqkit import actor, lifeline, activation, message


# ---------------------------------------------------------------------------- Figure 1.3
@figure
def fig_1_3(d=None):
    d = Diagram("fig-1-3", 864, 404, "Encore's first-cut logical components",
                "Fans browse the event catalog and join an on-sale through the Sale Gate, which screens bots "
                "and admits fans to Order; Order reserves seats, charges through payments, sends tickets and "
                "feeds sales analytics, which organizers watch along with the catalog they manage.")
    W, H = 120, 56
    A, B, C, D_, E = 24, 200, 376, 552, 728
    R1, R2, R3 = 48, 168, 288
    # connectors (before boxes)
    d.path([(84, R2), (84, 76), (B, 76)], label="BROWSES", at=1)
    d.path([(A + W, 196), (B, 196)], label="JOINS")
    d.path([(260, R2 + H), (260, R3)], label="SCREENS", side="right")
    d.path([(B + W, 196), (C, 196)], kind="accent", label="ADMITS")
    d.path([(436, R2), (436, R1 + H)], label="RESERVES", side="right")
    d.path([(C + W, 184), (D_, 184)], kind="accent", label="CHARGES")
    d.path([(436, R2 + H), (436, R3)], label="SENDS TICKET", side="right")
    d.path([(C + W, 208), (524, 208), (524, 316), (D_, 316)], dashed=True, label="SALES FACTS", at=1, side="right")
    d.path([(E, 316), (D_ + W, 316)], label="WATCHES")
    d.path([(788, R3), (788, 24), (260, 24), (260, R1)], label="MANAGES EVENTS", at=1, side="below")
    # nodes
    d.node(A, R2, W, H, "Fan", "browser · app", "input")
    d.node(E, R3, W, H, "Organizer", "venue staff", "input")
    d.node(B, R1, W, H, "Event Catalog", "events · seats")
    d.node(B, R2, W, H, "Sale Gate", "admission")
    d.node(B, R3, W, H, "Bot Screening", "risk signals")
    d.node(C, R2, W, H, "Order", "purchase flow")
    d.node(C, R1, W, H, "Seat Inventory", "holds · sales", "store")
    d.node(C, R3, W, H, "Notification", "tickets · email")
    d.node(D_, R2, W, H, "Payments", "PSP integration", "external")
    d.node(D_, R3, W, H, "Sales Analytics", "dashboards", "store")
    d.legend([("input", "People"), ("backend", "Component"), ("store", "Owns data"), ("external", "Outside party"),
              ("arrow:accent", "Purchase path"), ("arrow:muted:dashed", "Fact, not a call")])
    return d


# ---------------------------------------------------------------------------- Figure 5.2
@figure
def fig_5_2(d=None):
    d = Diagram("fig-5-2", 864, 444, "A saga compensating a declined card",
                "Orders & Payments reserves seat 14B with Seat Inventory, charges the card through the PSP, "
                "gets a decline, and compensates by releasing the seat, so the order fails and the seat goes "
                "back on sale.")
    O, I, P = 160, 432, 704
    for cx in (O, I, P):
        lifeline(d, cx, 76, 376)
    activation(d, O, 104, 360)
    activation(d, I, 120, 152)
    activation(d, P, 192, 224)
    activation(d, I, 280, 312)
    message(d, O, I, 128, "RESERVE SEAT 14B")
    message(d, I, O, 152, "RESERVED · TTL 5 MIN", dashed=True)
    message(d, O, P, 200, "CHARGE INTENT #881", kind="link")
    message(d, P, O, 224, "DECLINED", dashed=True)
    message(d, O, I, 288, "RELEASE SEAT 14B", kind="accent")
    d.note(I + 12, 308, "compensation: a forward action, not an undo")
    # self-message: order failed
    d.path([(O + 4, 332), (O + 44, 332), (O + 44, 352), (O + 4, 352)], dashed=True)
    d.note(O + 56, 346, "order failed · seat back on sale")
    actor(d, O, 216, "Orders & Payments", "orchestrator", "backend")
    actor(d, I, 216, "Seat Inventory & Ticketing", None, "store")
    actor(d, P, 160, "PSP", "external", "external")
    d.legend([("arrow:muted", "Call"), ("arrow:muted:dashed", "Reply"), ("arrow:link", "External call"),
              ("arrow:accent", "Compensation")])
    return d


# ---------------------------------------------------------------------------- Figure 6.3
@figure
def fig_6_3(d=None):
    d = Diagram("fig-6-3", 864, 572, "Encore's refund process as an explicit model",
                "A refund request is approved automatically under 80 euros and more than 48 hours before the show, "
                "otherwise it goes to a human review; approval revokes the ticket, then the PSP refund retries until "
                "it succeeds or goes to manual resolution, and the seat is re-listed only if the show is more than "
                "48 hours away.")
    W, H = 160, 48
    L, M, R = 40, 352, 664
    r1, r2, r3, r4 = 72, 176, 280, 400
    lc, mc, rc = L + W // 2, M + W // 2, R + W // 2
    d.start(lc, 32)
    d.path([(lc, 38), (lc, r1)], label="FAN REQUESTS REFUND", side="right")
    d.path([(L + W, 96), (M, 96)], label="AUTO · <€80 · >48H")
    d.path([(lc, r1 + H), (lc, r2)], label="OTHERWISE · SLA 24H", side="right")
    d.path([(L + W, 200), (280, 200), (280, 108), (M, 108)], label="APPROVED", at=1, side="right")
    d.path([(lc, r2 + H), (lc, r3)], label="DENIED · REASON", side="right")
    d.path([(lc, r3 + H), (lc, 364)])
    d.end(lc, 372)
    d.path([(mc, r1 + H), (mc, r2)], label="TICKET REVOKED", side="right")
    d.path([(mc, r2 + H), (mc, r3)], label="PSP REFUND · RETRY", side="right")
    d.path([(M + W, 292), (R, 292)], label="RETRIES EXHAUSTED")
    d.path([(mc, r3 + H), (mc, r4)], label=">48H · BACK ON SALE", side="right")
    d.path([(M + W, 316), (584, 316), (584, 412), (R, 412)], label="≤48H · RETIRED", at=1, side="right")
    d.path([(M + W, 432), (R, 432)])
    d.path([(rc, r3 + H), (rc, r4)], label="FINANCE OPS", side="right")
    d.path([(rc, r4 + H), (rc, 484)])
    d.end(rc, 492)
    d.state(L, r1, W, H, "Requested")
    d.state(L, r2, W, H, "Review", "human task", "focal")
    d.state(L, r3, W, H, "Denied")
    d.state(M, r1, W, H, "Approved")
    d.state(M, r2, W, H, "Invalidate ticket")
    d.state(M, r3, W, H, "Reversing", "PSP refund")
    d.state(M, r4, W, H, "Relisting")
    d.state(R, r3, W, H, "Manual resolution", "finance ops", "focal")
    d.state(R, r4, W, H, "Closed")
    d.legend([("start", "Start / end"), ("backend", "State"), ("focal", "Where people step in"),
              ("arrow:muted", "Transition: event · guard")])
    return d


# Every module in figs/ registers its own figures.
_figs = os.path.join(os.path.dirname(__file__), "figs")
for _m in sorted(pkgutil.iter_modules([_figs]), key=lambda m: m.name):
    importlib.import_module(f"figs.{_m.name}")
