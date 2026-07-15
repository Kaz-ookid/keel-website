```
██╗  ██╗███████╗███████╗██╗
██║ ██╔╝██╔════╝██╔════╝██║
█████╔╝ █████╗  █████╗  ██║
██╔═██╗ ██╔══╝  ██╔══╝  ██║
██║  ██╗███████╗███████╗███████╗
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
   subscriptions · bills · split payments · one calm place
```

The marketing site for **Keel**, live at **[keel-app.ch](https://keel-app.ch)**.

## What Keel is

An iPhone app that tracks what actually leaves your accounts: subscriptions,
bills, and the pay-in-4 you forgot about. It knows what is due, from which
account, and what it truly costs once the yearly renewals are smoothed across
the months. Private by architecture: no account, no server, nothing to breach.

This repo is just the website. The app lives elsewhere.

## What this repo is

A single page, hand-built. No framework, no build step, no dependencies:
plain HTML, one stylesheet, one script. It clones to a folder and runs.

A few things worth a look if you opened this out of curiosity:

- **An interactive tour** that imports a messy list and walks it through four
  real screens (upcoming, months, categories). It runs on a demo dataset shaped
  exactly like a real one, different entities, same patterns, verified through
  the app's own parser so the numbers actually add up.
- **An ambient aura** drawn entirely in CSS: layered glows that drift, breathe,
  and get stirred by scroll velocity, no canvas, no library. Freezes flat under
  `prefers-reduced-motion`.
- **Five languages** (en · fr · de · pl · it) written to read native, not
  translated. Shared stylesheet and script; each localized page hands the script
  its strings through an inline `window.KEEL_I18N` object, English as fallback.
- **Theme-aware and accessible**: honours light/dark, reduced motion, and
  keyboard focus throughout.

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
