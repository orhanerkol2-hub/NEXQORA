# NEXQORA — one-page corporate site

Static, dependency-free corporate site; no build step.

```
index.html      structure + both language versions (data-en / data-de)
styles.css      design system, 12-column grid, responsive rules
script.js       language switch, mobile menu, entrance transitions, contact form
favicon.svg     Q signet
impressum.html  legal notice
datenschutz.html privacy notice
assets/fonts/   locally hosted Manrope and Material Symbols fonts
```

## Preview

```bash
python3 -m http.server 8767 --bind 127.0.0.1
```

Then open the printed URL (defaults to http://localhost:4321). Any static server works.

## Design system

| Token | Value | Use |
|---|---|---|
| Warm porcelain | `#F3F0E9` | page background |
| Nexqora obsidian | `#121518` | text, dark sections, footer |
| Quiet graphite | `#394046` | secondary text |
| Soft stone | `#C9C4BA` | hero Q outline, supporting surfaces |
| Mist grey | `#DDE0DC` | supporting surfaces |
| Muted bronze | `#9B876A` | CTA, Q tail in the wordmark, contact links only |

Typography is locally hosted Manrope (weights 300–600). Dividers are 1px at 13% obsidian
on light and 16% porcelain on dark. All tokens live in `:root` in `styles.css`.

## Language

Every translatable node carries `data-en` and `data-de`; `script.js` swaps `textContent`
(or the attribute named in `data-i18n-attr`, used for `<meta>` and `aria-label`).
The browser language determines the initial language. Switching language changes the
current document only; no preference is stored in the browser.

## Contact form

There is no backend. On submit the form opens the visitor's mail client with a prefilled
message to `contact@nexqora.de` — nothing is stored or sent by the page. To use a real
endpoint, point `form.action` at it and remove the `submit` handler in `script.js`.

## GitHub Pages

The repository is configured for `nexqora.de` through the root-level `CNAME` file.
Publish the `main` branch from `/(root)` in GitHub Pages.
