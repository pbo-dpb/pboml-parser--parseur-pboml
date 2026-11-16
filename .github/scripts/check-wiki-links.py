#!/usr/bin/env python3
"""Check that every relative link between wiki pages points to an existing page
(and, when present, to an existing heading anchor).

Usage: python3 .github/scripts/check-wiki-links.py [wiki_dir]
Exits with status 1 if any broken link is found.
"""
import glob
import os
import re
import sys
import urllib.parse

wiki_dir = sys.argv[1] if len(sys.argv) > 1 else "wiki"
files = glob.glob(os.path.join(wiki_dir, "*.md"))
pages = {os.path.splitext(os.path.basename(f))[0] for f in files}


def slugify(heading):
    """Approximate GitHub's heading-anchor algorithm."""
    heading = heading.strip().lower()
    heading = re.sub(r"[`*_]", "", heading)
    heading = re.sub(r"[^\w\- ]", "", heading, flags=re.UNICODE)
    return heading.replace(" ", "-")


anchors = {}
for f in files:
    with open(f, encoding="utf-8") as fh:
        text = fh.read()
    anchors[os.path.splitext(os.path.basename(f))[0]] = {
        slugify(h) for h in re.findall(r"^#+\s+(.*)$", text, re.MULTILINE)
    }

broken = []
for f in files:
    with open(f, encoding="utf-8") as fh:
        text = fh.read()
    for link in re.findall(r"\]\(\./([^)\s]+)\)", text):
        page, _, anchor = link.partition("#")
        page = urllib.parse.unquote(page)
        if page.endswith(".md"):
            page = page[:-3]
        if page not in pages:
            broken.append(f"{os.path.basename(f)}: missing page -> {link}")
        elif anchor and urllib.parse.unquote(anchor) not in anchors[page]:
            broken.append(f"{os.path.basename(f)}: missing anchor -> {link}")

if broken:
    print("Broken wiki links found:")
    print("\n".join(f"  - {b}" for b in broken))
    sys.exit(1)

print(f"All wiki links OK ({len(files)} pages checked).")
