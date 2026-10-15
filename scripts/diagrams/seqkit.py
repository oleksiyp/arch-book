"""Sequence-diagram helpers on top of dg.Diagram."""


def actor(d, cx, w, name, sub=None, kind="backend"):
    d.node(cx - w // 2, 24, w, 48 if not sub else 52, name, sub, kind)


def lifeline(d, cx, top, bottom):
    d.zones.append(f'<line class="dg-lifeline" x1="{cx}" y1="{top}" x2="{cx}" y2="{bottom}"/>')


def activation(d, cx, top, bottom):
    d.extra.insert(0, f'<rect class="dg-activation" x="{cx - 4}" y="{top}" width="8" height="{bottom - top}"/>')


def message(d, x1, x2, y, text, kind="muted", dashed=False):
    """Horizontal message between lifelines, label centred above."""
    off = 4 if x2 > x1 else -4  # stop at the activation bar edge
    d.path([(x1 + off, y), (x2 - off, y)], kind=kind, dashed=dashed)
    d.label_at(text, (x1 + x2) / 2, y, horizontal=True, side="above", kind=kind)


