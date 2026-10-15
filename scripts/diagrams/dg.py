"""Book diagrams in the diagram-design system (github.com/cathrynlavery/diagram-design),
skinned for this book.

Every figure is hand-laid out in figures.py with these primitives and written to
_includes/diagrams/<slug>.svg, which the book includes in place of a Mermaid block.
Colours are CSS classes (dg-*), defined once in assets/css/style.scss for the light
and dark themes, so one SVG follows the reader's theme.

Rules carried over from the skill: every coordinate on a 4px grid; orthogonal
connectors only, bends r=8; arrows drawn before boxes; every arrow label on an opaque
mask, 8px clear of its line; at most two accent elements per figure; legend as a strip
at the bottom; <title> and <desc> first, with per-figure IDs.
"""
from html import escape

R = 8  # bend radius
MONO_CH = 5.4   # 8px mono, uppercase, tracked: width per character
NAME_CH = 7.2   # 12px sans 600: width per character
SUB_CH = 5.6    # 9px mono: width per character


def label_width(text):
    return int(len(text) * MONO_CH + 10 + 3) // 4 * 4


class Diagram:
    def __init__(self, slug, width, height, title, desc):
        self.slug, self.w, self.h = slug, width, height
        self.title, self.desc = title, desc
        self.zones, self.arrows, self.labels, self.nodes, self.extra, self.legend_items = [], [], [], [], [], []

    # ---- nodes -------------------------------------------------------------------------
    def node(self, x, y, w, h, name, sub=None, kind="backend", tag=None):
        """kind: focal | backend | store | external | input | optional"""
        assert all(v % 4 == 0 for v in (x, y, w, h)), (name, x, y, w, h)
        assert len(name) * NAME_CH <= w - 12, f"name too wide: {name!r} in {w}px"
        if sub:
            assert len(sub) * SUB_CH <= w - 12, f"sublabel too wide: {sub!r} in {w}px"
        cx = x + w // 2
        dash = ' stroke-dasharray="4,3"' if kind == "optional" else ""
        out = [f'<rect class="dg-mask" x="{x}" y="{y}" width="{w}" height="{h}" rx="6"/>',
               f'<rect class="dg-n dg-n-{kind}" x="{x}" y="{y}" width="{w}" height="{h}" rx="6"{dash}/>']
        if tag:
            tw = int(len(tag) * 5.2 + 10 + 3) // 4 * 4
            out.append(f'<rect class="dg-tagbox dg-t-{kind}" x="{x + 8}" y="{y + 6}" width="{tw}" height="12" rx="2"/>')
            out.append(f'<text class="dg-tag dg-t-{kind}" x="{x + 8 + tw / 2:g}" y="{y + 15}">{escape(tag)}</text>')
        if sub:
            ny = y + h // 2 + (2 if not tag else 6)
            out.append(f'<text class="dg-name" x="{cx}" y="{ny}">{escape(name)}</text>')
            out.append(f'<text class="dg-sub" x="{cx}" y="{ny + 15}">{escape(sub)}</text>')
        else:
            out.append(f'<text class="dg-name" x="{cx}" y="{y + h // 2 + 4 + (4 if tag else 0)}">{escape(name)}</text>')
        self.nodes.append("\n".join(out))

    def state(self, x, y, w, h, name, sub=None, kind="backend"):
        """A state: like a node, rx=8, no tag."""
        assert all(v % 4 == 0 for v in (x, y, w, h)), (name, x, y, w, h)
        assert len(name) * NAME_CH <= w - 12, f"name too wide: {name!r} in {w}px"
        cx = x + w // 2
        out = [f'<rect class="dg-mask" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>',
               f'<rect class="dg-n dg-n-{kind}" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>']
        if sub:
            out.append(f'<text class="dg-name" x="{cx}" y="{y + h // 2 - 2}">{escape(name)}</text>')
            out.append(f'<text class="dg-sub" x="{cx}" y="{y + h // 2 + 12}">{escape(sub)}</text>')
        else:
            out.append(f'<text class="dg-name" x="{cx}" y="{y + h // 2 + 4}">{escape(name)}</text>')
        self.nodes.append("\n".join(out))

    def start(self, cx, cy):
        self.nodes.append(f'<circle class="dg-start" cx="{cx}" cy="{cy}" r="6"/>')

    def end(self, cx, cy):
        self.nodes.append(f'<circle class="dg-end-ring" cx="{cx}" cy="{cy}" r="8"/>'
                          f'<circle class="dg-start" cx="{cx}" cy="{cy}" r="5"/>')

    def zone(self, x, y, w, h, label):
        lw = label_width(label)
        self.zones.append(
            f'<rect class="dg-zone" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>'
            f'<rect class="dg-mask" x="{x + 12}" y="{y - 6}" width="{lw}" height="12" rx="2"/>'
            f'<text class="dg-eyebrow" x="{x + 12 + lw / 2:g}" y="{y + 3}">{escape(label)}</text>')

    # ---- connectors --------------------------------------------------------------------
    def path(self, pts, kind="muted", dashed=False, label=None, at=None, side="above", arrow=True):
        """Orthogonal polyline through pts with r=8 bends. kind: muted | accent | link.
        label goes on segment `at` (index, default the longest), above/below a horizontal
        segment or left/right of a vertical one."""
        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
            assert x1 == x2 or y1 == y2, f"diagonal segment {pts}"
        d = [f"M {pts[0][0]},{pts[0][1]}"]
        for i in range(1, len(pts) - 1):
            (x0, y0), (x1, y1), (x2, y2) = pts[i - 1], pts[i], pts[i + 1]
            ux0 = (x1 > x0) - (x1 < x0); uy0 = (y1 > y0) - (y1 < y0)
            ux1 = (x2 > x1) - (x2 < x1); uy1 = (y2 > y1) - (y2 < y1)
            d.append(f"L {x1 - ux0 * R},{y1 - uy0 * R}")
            d.append(f"Q {x1},{y1} {x1 + ux1 * R},{y1 + uy1 * R}")
        d.append(f"L {pts[-1][0]},{pts[-1][1]}")
        cls = f"dg-a dg-a-{kind}" + (" dg-dash" if dashed else "")
        marker = f' marker-end="url(#{self.slug}-m-{kind})"' if arrow else ""
        self.arrows.append(f'<path class="{cls}" d="{" ".join(d)}"{marker}/>')
        if label:
            segs = list(zip(pts, pts[1:]))
            if at is None:
                at = max(range(len(segs)), key=lambda i: abs(segs[i][0][0] - segs[i][1][0]) + abs(segs[i][0][1] - segs[i][1][1]))
            (x1, y1), (x2, y2) = segs[at]
            self.label_at(label, (x1 + x2) / 2, (y1 + y2) / 2, horizontal=(y1 == y2), side=side, kind=kind)

    def label_at(self, text, mx, my, horizontal=True, side="above", kind="muted"):
        w = label_width(text)
        if horizontal:
            x = mx - w / 2
            y = my - 8 - 12 if side == "above" else my + 8
        else:
            x = mx + 8 if side == "right" else mx - 8 - w
            y = my - 6
        tcls = {"accent": "dg-label dg-l-accent", "link": "dg-label dg-l-link"}.get(kind, "dg-label")
        self.labels.append(f'<rect class="dg-mask" x="{x:g}" y="{y:g}" width="{w}" height="12" rx="2"/>'
                           f'<text class="{tcls}" x="{x + w / 2:g}" y="{y + 9:g}">{escape(text)}</text>')

    def note(self, x, y, text, anchor="start"):
        """A small mono annotation (not an arrow label)."""
        self.extra.append(f'<text class="dg-note" x="{x}" y="{y}" text-anchor="{anchor}">{escape(text)}</text>')

    # ---- legend --------------------------------------------------------------------------
    def legend(self, items):
        """items: (kind, text) with kind a node kind or 'arrow:<kind>[:dashed]'."""
        self.legend_items = items

    def _legend(self):
        if not self.legend_items:
            return ""
        y = self.h - 28
        out = [f'<line class="dg-rule" x1="24" y1="{y - 12}" x2="{self.w - 24}" y2="{y - 12}"/>']
        x = 24
        for kind, text in self.legend_items:
            if kind.startswith("arrow:"):
                parts = kind.split(":")
                k, dashed = parts[1], len(parts) > 2
                cls = f"dg-a dg-a-{k}" + (" dg-dash" if dashed else "")
                out.append(f'<line class="{cls}" x1="{x}" y1="{y + 4}" x2="{x + 24}" y2="{y + 4}" marker-end="url(#{self.slug}-m-{k})"/>')
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

    # ---- output --------------------------------------------------------------------------
    def svg(self):
        s = self.slug
        markers = "".join(
            f'<marker id="{s}-m-{k}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">'
            f'<polygon class="dg-head dg-head-{k}" points="0 0, 8 3, 0 6"/></marker>'
            for k in ("muted", "accent", "link"))
        body = "\n".join([*self.zones, *self.arrows, *self.labels, *self.nodes, *self.extra, self._legend()])
        # .dg-scroll is the frame that scrolls when a figure is shown at full size on a narrow
        # screen; the zoom button the page adds to .dg-figure stays outside it, so it never scrolls.
        return (f'<div class="dg-figure" data-fig="{s}" style="--dg-w:{self.w}px"><div class="dg-scroll">'
                f'<svg class="dg" viewBox="0 0 {self.w} {self.h}" xmlns="http://www.w3.org/2000/svg" role="img" '
                f'aria-labelledby="{s}-title {s}-desc">\n'
                f'<title id="{s}-title">{escape(self.title)}</title>\n'
                f'<desc id="{s}-desc">{escape(self.desc)}</desc>\n'
                f'<defs>{markers}</defs>\n'
                f'<rect class="dg-paper" width="100%" height="100%" rx="8"/>\n'
                f'{body}\n</svg></div></div>\n')
