<div align="center">
<pre>
██╗  ██╗███████╗███████╗██╗
██║ ██╔╝██╔════╝██╔════╝██║
█████╔╝ █████╗  █████╗  ██║
██╔═██╗ ██╔══╝  ██╔══╝  ██║
██║  ██╗███████╗███████╗███████╗
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
</pre>

<strong>subscriptions · bills · split payments · one calm place</strong>

<br />

The marketing site for <strong>Keel</strong>, live at <a href="https://keel-app.ch">keel-app.ch</a>.

</div>

<br />

An iPhone app that tracks what actually leaves your accounts: subscriptions,
bills, and the pay-in-4 you forgot about. It knows what is due, from which
account, and what it truly costs once the yearly renewals are smoothed across
the months. Private by architecture: no account, no server, nothing to breach.

This repo is just the website: a single hand-built page, no framework, no build
step, no dependencies. Plain HTML, one stylesheet, one script.

## Layout

```
index.html          English (root)
fr/  de/  pl/  it/   localized pages
styles.css          one stylesheet, shared
script.js           reveals, tour logic, the aura's scroll drift
assets/             icon, social card, screenshots
privacy.html        legal texts
terms.html
CNAME               custom domain
```

## Run it

Open `index.html`, or serve the folder for correct relative paths:

```sh
python -m http.server 8080
```

## Deploy

GitHub Pages from `main` at the repository root, custom domain `keel-app.ch`
(`CNAME`). `.nojekyll` keeps Pages from touching the files. Push to ship.

## Working on it

- **Copy changes** made at the root carry into the four localized pages, and
  into their `KEEL_I18N` block when the string is one the script generates
  (tour totals, chart windows, donut slices).
- **Assets** in `assets/` are picked up by filename; a labelled placeholder
  shows until each one lands (`screen-upcoming.png`, `screen-harbor.png`,
  `maker.jpg`, `og.png`).
- **At launch**: swap the styled store badge for the official App Store asset
  and real listing URL (`TODO(launch)` markers).
