#!/usr/bin/env python3
"""Embed homepage content in the desktop so opening windows needs no fetch.

Run after editing website.html. Use --check to verify the committed snapshot.
"""
import argparse
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- BEGIN GENERATED DESKTOP CONTENT -->'
END = '<!-- END GENERATED DESKTOP CONTENT -->'


def sync(check=False):
    homepage = (ROOT / 'website.html').read_text()
    match = re.search(r'<main\b[^>]*>(.*?)</main>', homepage, re.S)
    if not match:
        raise SystemExit('Cannot find homepage main content')
    content = match.group(1).strip()
    for section in ('about', 'research', 'projects', 'experience'):
        if f'id="{section}"' not in content:
            raise SystemExit(f'Missing homepage section: {section}')
    block = f'{START}\n<template id="desktop-content">\n{content}\n</template>\n{END}'
    path = ROOT / 'index.html'
    old = path.read_text()
    if START in old:
        new = re.sub(re.escape(START) + r'.*?' + re.escape(END), lambda _: block, old, flags=re.S)
    else:
        new = old.replace('</body>', block + '\n</body>')
    if check:
        if new != old:
            raise SystemExit('Desktop content is stale. Run python3 scripts/sync-desktop-content.py')
        print('Desktop content matches website.html.')
    else:
        path.write_text(new)
        print('Embedded homepage content in index.html.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    sync(parser.parse_args().check)
