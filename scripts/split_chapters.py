#!/usr/bin/env python3
"""Build-time generator: per-chapter pages, llms mirrors, sitemap.
Run from repo root before the Jekyll build; outputs are not committed."""
import os, re

BASE = "https://oleksiyp.github.io/arch-book"
readme = open("README.md").read()

# full raw-markdown mirror
open("llms-full.txt", "w").write(readme)

parts = re.split(r'\n(?=## Chapter (?:\d+):)', readme)
os.makedirs("chapters", exist_ok=True)
urls = [f"{BASE}/", f"{BASE}/llms.txt", f"{BASE}/llms-full.txt"]
for part in parts[1:]:
    m = re.match(r'## Chapter (\d+): (.*?) \{#ch\d+\}', part)
    n, title = int(m.group(1)), m.group(2)
    safe_title = title.replace('"', "'")
    body = part.split("\n---\n")[0].rstrip()
    page = (f"---\nlayout: default\ntitle: \"Chapter {n}: {safe_title}\"\n"
            f"permalink: /ch/{n}/\n---\n\n"
            f"*[← the whole book on one page](/arch-book/#ch{n})*\n\n{body}\n")
    open(f"chapters/ch{n:02d}.md", "w").write(page)
    urls.append(f"{BASE}/ch/{n}/")

sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sm += [f"  <url><loc>{u}</loc></url>" for u in urls]
sm.append("</urlset>")
open("sitemap.xml", "w").write("\n".join(sm) + "\n")
print(f"generated {len(urls)-3} chapter pages, llms-full.txt, sitemap.xml")
