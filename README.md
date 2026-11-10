
# Shen (Sam) Xie — personal website

Intended URL:) https://samxiexs.github.io/.

## Desktop edition

`index.html` is the default desktop homepage and includes a generated, inert template of the homepage content.
Windows open from this template without fetching `website.html`, including when
opening the desktop directly from disk or after a preview server stops.

After editing homepage content in `website.html`, synchronize and check it:

```sh
python3 scripts/sync-desktop-content.py
python3 scripts/sync-desktop-content.py --check
```

For a local preview (including photography and page navigation):

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/ and keep the server running while browsing.

The classic 98 and Modern layouts share `website.html`. The desktop provides one-click links to either mode; `desktop.html` redirects to the default homepage for existing preview links.
