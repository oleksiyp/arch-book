"""Figure 1.4: an ADR's life."""
from dg import Diagram
from registry import figure


@figure
def fig_1_4():
    d = Diagram("fig-1-4", 864, 284, "An ADR's life",
                "An architecture decision record is written and proposed for review; the team either accepts it, "
                "and a later ADR may supersede it, or rejects it with reasons, and the rejected record is kept "
                "because it saves the next person from re-arguing the question.")
    W, H = 160, 48
    L, M, R = 40, 352, 664
    r1, r2 = 72, 176
    lc = L + W // 2
    d.start(lc, 32)
    d.path([(lc, 38), (lc, r1)], label="WRITTEN · IN REVIEW", side="right")
    d.path([(L + W, r1 + H // 2), (M, r1 + H // 2)], label="TEAM AGREES")
    d.path([(lc, r1 + H), (lc, r2 + H // 2), (M, r2 + H // 2)], label="WITH REASONS", at=1)
    d.path([(M + W, r1 + H // 2), (R, r1 + H // 2)], label="NEW ADR REPLACES IT")
    d.state(L, r1, W, H, "Proposed")
    d.state(M, r1, W, H, "Accepted")
    d.state(M, r2, W, H, "Rejected", "still worth keeping", "focal")
    d.state(R, r1, W, H, "Superseded")
    d.legend([("start", "Start"), ("backend", "Status"), ("focal", "Kept even when rejected"),
              ("arrow:muted", "Transition: event")])
    return d
