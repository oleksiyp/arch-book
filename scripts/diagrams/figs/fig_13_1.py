"""Figure 13.1 — the evolution road and the posture per stage."""
from dg import Diagram
from registry import figure


@figure
def fig_13_1():
    d = Diagram("fig-13-1", 864, 172, "The evolution road and the posture per stage",
                "Every capability moves from genesis, where you build because nobody sells it, to custom, where "
                "you build or adopt if it differentiates, to product, where you buy and let vendors compete, to "
                "commodity, where you rent, pay per unit and forget.")
    W, H, Y = 168, 72, 32
    xs = [24, 240, 456, 672]
    for a, b in zip(xs, xs[1:]):
        d.path([(a + W, Y + H // 2), (b, Y + H // 2)])
    d.node(xs[0], Y, W, H, "Genesis", "nobody sells it", "focal", tag="BUILD")
    d.node(xs[1], Y, W, H, "Custom", "differentiate here?", tag="BUILD OR ADOPT")
    d.node(xs[2], Y, W, H, "Product", "let vendors compete", tag="BUY")
    d.node(xs[3], Y, W, H, "Commodity", "pay per unit, forget", tag="RENT")
    d.legend([("focal", "Highlighted stage"), ("backend", "Stage · tag is the winning posture"),
              ("arrow:muted", "Evolves toward")])
    return d
