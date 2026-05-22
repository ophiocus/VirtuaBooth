# VirtuaBooth

An interactive three.js product showroom — a navigable, animated Raspberry Pi 5
configurator. Pick networking/cooling/storage options, swap cases, and move the
product between environments (grassland, snow, sea), all rendered live in WebGL.

Live: https://ophiocus.github.io · API docs: https://ophiocus.github.io/docs

## Develop

```sh
npm install
npm run dev        # Vite dev server
```

## Build

```sh
npm run build      # Vite build → dist/, then JSDoc → dist/docs/
npm run preview    # serve the production build locally
```

Pushing to `master` triggers the GitHub Actions workflow, which builds and
deploys `dist/` to the `ophiocus.github.io` Pages site.

## Layout

- `index.html` — markup + menu (inline handlers call the `Handlers` module)
- `js/` — source modules (`raspberry-pi-5.js` entry, `src/{context,project,handlers}.js`)
- `css/` — styles
- `public/` — runtime assets (`gltf/`, `hdri/`, `textures/`)
- `jsdoc.conf` — JSDoc config (output to `dist/docs`)

See `js/README.md` for the module/architecture notes (also the JSDoc home page).

## Stack

three.js · @tweenjs/tween.js · Vite · JSDoc
