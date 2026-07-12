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

- Replace every `.ph` placeholder (marked `TODO(assets)` in `index.html`):
  hero screenshot, harbor teaser, maker photo, `assets/og.png`.
- Swap the styled store badge for the official App Store badge asset and
  the real listing URL (`TODO(launch)` markers).
- Add the custom domain: a `CNAME` file here + DNS at the registrar.
