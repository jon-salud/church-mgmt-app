Open `index.html` in your browser to preview the modal theme demo.

Quick start:

1. Open file directly: open `docs/modal-theme-preview/index.html` in your browser.
2. Or serve with a local static server from the repo root:

```bash
# from repo root
python3 -m http.server 8000
# then open http://localhost:8000/docs/modal-theme-preview/index.html
```

This demo shows:
- Light / Dark theme toggle (data-theme switching)
- Modal size variants: `sm`, `md`, `lg`, `xl`, `full`
- CRUD modal examples: Create, Edit (larger form), Delete confirmation
- Accessible behaviors: Escape-to-close, overlay click close (disabled for destructive), and a lightweight focus trap.

Interactive controls you can play with:
- **Font size**: use the Font select to change base font size (Small, Default, Large, XL).
- **Color presets**: choose a theme preset (Original, Vibrant Blue, Teal Accent, Warm Accent, High Contrast) and click `Apply` to change primary / destructive tokens live.
- **Theme toggle**: switch between light and dark modes with `Toggle Dark`.

If you'd like, I can also add individual color pickers to tweak each token, or convert this into a small React playground so changes persist in URL params.

If you'd like a React/Next page instead (integrated with `web/`), tell me and I will scaffold that next.
