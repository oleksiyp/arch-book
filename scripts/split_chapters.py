#!/usr/bin/env python3
"""Build-time generator: per-chapter pages, llms mirrors, sitemap.
Run from repo root before the Jekyll build; outputs are not committed."""
import html, os, re

BASE = "https://oleksiyp.github.io/arch-book"
readme = open("README.md").read()

# full raw-markdown mirror; diagram includes become their title and description, since
# the mirror is plain text and the drawing itself is SVG
def describe(m):
    svg = open(f"_includes/diagrams/{m.group(1)}.svg").read()
    title = re.search(r"<title[^>]*>(.*?)</title>", svg, re.S).group(1)
    desc = re.search(r"<desc[^>]*>(.*?)</desc>", svg, re.S).group(1)
    return f"[Diagram: {html.unescape(title)}. {html.unescape(desc)}]"

open("llms-full.txt", "w").write(re.sub(r"\{% include diagrams/([\w-]+)\.svg %\}", describe, readme))

parts = re.split(r'\n(?=## Chapter (?:\d+):)', readme)
os.makedirs("chapters", exist_ok=True)
urls = [f"{BASE}/", f"{BASE}/llms.txt", f"{BASE}/llms-full.txt"]
for part in parts[1:]:
    m = re.match(r'## Chapter (\d+): (.*?) \{#ch\d+\}', part)
    n, title = int(m.group(1)), m.group(2)
    safe_title = title.replace('"', "'")
    # A chapter runs to the next chapter heading; only its closing rule is dropped. (Cutting at
    # the first "---" lost everything after Chapter 1's first in-chapter rule.)
    body = re.sub(r"\n+---\s*$", "", part.rstrip())
    page = (f"---\nlayout: default\ntitle: \"Chapter {n}: {safe_title}\"\n"
            f"permalink: /ch/{n}/\n---\n\n"
            f"*[← the whole book on one page](/arch-book/#ch{n})*\n\n{body}\n")
    open(f"chapters/ch{n:02d}.md", "w").write(page)
    urls.append(f"{BASE}/ch/{n}/")

urls.append(f"{BASE}/privacy/")

sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sm += [f"  <url><loc>{u}</loc></url>" for u in urls]
sm.append("</urlset>")
open("sitemap.xml", "w").write("\n".join(sm) + "\n")
print(f"generated {len(urls)-4} chapter pages, llms-full.txt, sitemap.xml")
