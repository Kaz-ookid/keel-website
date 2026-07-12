# keel-website

The one-page site for Keel, the subscription and split-payment tracker for
iPhone. Plain HTML, CSS and a little vanilla JS: no framework, no build
step, nothing to maintain.

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
- Add the custom domain: a `CNAME` file here + DNS at the registrar.
