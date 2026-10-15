"""Figure registry shared by figures.py and figs/*.py."""
FIGURES = {}


def figure(fn):
    """Register a figure builder; its slug is the function name with _ → - (fig_1_3 → fig-1-3)."""
    FIGURES[fn.__name__.replace("_", "-")] = fn
    return fn
