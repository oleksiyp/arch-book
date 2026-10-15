"""Write every figure to _includes/diagrams/<slug>.svg and a preview page.

    python3 scripts/diagrams/build.py [--preview out.html] [slug ...]
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from figures import FIGURES  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "_includes", "diagrams")


def main(argv):
    preview = None
    if "--preview" in argv:
        i = argv.index("--preview")
        preview = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    slugs = argv or list(FIGURES)
    os.makedirs(OUT, exist_ok=True)
    svgs = {}
    for slug in slugs:
        d = FIGURES[slug]()
        svgs[slug] = d.svg()
        with open(os.path.join(OUT, f"{d.slug}.svg"), "w") as f:
            f.write(svgs[slug])
        print("wrote", d.slug)
    if preview:
        css = open(os.path.join(os.path.dirname(__file__), "dg.css")).read()
        cards = "".join(
            f'<section><h2>{s}</h2><div class="pair"><div class="light">{v}</div>'
            f'<div class="dg-dark">{v.replace(f"{s}-", f"{s}-dk-")}</div></div></section>'
            for s, v in svgs.items())
        with open(preview, "w") as f:
            f.write(f"""<meta charset="utf-8"><title>Book Diagrams Preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap">
<style>{css}
body {{ margin: 0; padding: 24px 16px; background: #fff; font: 14px "Open Sans", sans-serif; color: #1b1f3b; }}
section {{ max-width: 1800px; margin: 0 auto 32px; }} h2 {{ font-size: 14px; color: #b23a20; }}
.pair {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 880px), 1fr)); gap: 16px; }}
.dg-dark {{ background: #121623; padding: 8px; border-radius: 8px; }} .light {{ padding: 8px; }}
</style>{cards}""")
        print("preview", preview)


if __name__ == "__main__":
    main(sys.argv[1:])
