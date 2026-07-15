# keel-website

The one-page site for Keel, the subscription and split-payment tracker for
iPhone. Plain HTML, CSS and a little vanilla JS: no framework, no build
step, nothing to maintain.

## Languages

English lives at the root; full localized pages live in `fr/`, `de/`,
`pl/` and `it/` (linked via the header switcher + `hreflang` tags). All
pages share `styles.css` and `script.js`; the strings that script.js
GENERATES (tour totals, chart windows, donut slices…) come from an inline
`window.KEEL_I18N` object each localized page defines before loading the
script — English is the built-in fallback. When copy changes at the root,
carry the change into the four localized pages (and their `KEEL_I18N`
block if it's a generated string). Legal pages stay English for now; the
localized footers label them "(EN)".

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8080
```

## Deploy

GitHub Pages, serving `main` at the repository root
(Settings > Pages > Deploy from a branch > `main` / `/ (root)`).
`.nojekyll` keeps Pages from running the files through Jekyll.

## Before launch

- Drop the real images into `assets/` with these exact names (the pages
  pick them up automatically; until then a labelled placeholder shows):
  - `screen-upcoming.png` — the Payments/Upcoming screenshot (hero device)
  - `screen-harbor.png` — the harbor screenshot (feature card)
  - `maker.jpg` — the maker photo (About section)
  - `og.png` — the social card (a generated one exists; replace at will)
- Swap the styled store badge for the official App Store badge asset and
  the real listing URL (`TODO(launch)` markers).
- Custom domain: DONE — `keel-app.ch` (`CNAME` file here; DNS at
  Infomaniak: four A records on `@` to the GitHub Pages IPs + `www`
  CNAME to `kaz-ookid.github.io`; HTTPS enforced in the Pages settings).
