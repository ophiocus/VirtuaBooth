# VirtuaBooth architecture

A single-page three.js showroom: one WebGL canvas, a GLTF stage, and a small
state/animation engine driven by DOM menu interactions. No framework — vanilla
ES modules bundled by Vite.

## Module graph

Two `<script type="module">` entries in `index.html`:

| Module                 | Role                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| `js/raspberry-pi-5.js` | **Entry / heartbeat.** Boots the scene, owns the `animate()` loop.               |
| `js/main.js`           | DOM wiring: menu checkboxes, gear toggle, the canvas colour `Picker`.            |
| `js/src/context.js`    | **`Context`** — central config + runtime state store (`get`, `coords`, `add()`). |
| `js/src/project.js`    | **`Project`** — scene/camera/renderer/lights/GLTF/skydome/water setup.           |
| `js/src/handlers.js`   | **`Handlers`** — the interaction + animation engine.                             |

`Context`, `Handlers`, and `Project` are IIFE singletons. They also self-attach
to `window` (`window.gltf_context`, `window.Handlers`, plus `gltf_controls` /
`gltf_renderer` / `THREE_camera` debug handles).

### Cross-module coupling (intentional, flagged for refactor)

`main.js` and the inline `onclick="Handlers.…"` attributes in `index.html`
consume `Handlers` as a **window global** rather than via import. This is why
`eslint.config.js` declares `Handlers`/`Context`/`Project` as globals.
Decoupling this into real imports is a tracked roadmap item.

## The heartbeat

`animate()` in `raspberry-pi-5.js` runs every frame via `requestAnimationFrame`:

```
clock.getDelta() → mixer.update() → tweenGroup.update() → controls.update()
→ Project.render() (custom render stack, e.g. water) → renderer.render()
```

`mixer`, `controls`, and `renderer` resolve from async load promises and are
swapped in on the first frame they become available. The whole body is wrapped
in try/catch so a transient missing dependency doesn't kill the loop.

> **Note:** `requestAnimationFrame` is paused by the browser when the tab is
> backgrounded/hidden. Headless verification must therefore drive
> `tweenGroup.update(t)` + `mixer.update()` manually with advancing time.

## Animation engine

Two cooperating queues live on `Context.get.config`:

- **`animStack`** — GLTF clip actions ("action strip"), driven by
  `Handlers.animationAnim()`. Polymorphic on argument type: a string plays one
  clip; an array enqueues a sequence (clip names _or_ callbacks); an object is a
  config marker (`{ concurrent }`).
- **`tweenStack`** — camera/property tweens, driven by `Handlers.tweeningTween()`
  → `simpleTween()`. Each tween is `[target, toVector, durationMs?, callback?]`.

Both support **concurrent** (drain the whole queue at once) vs **sequential**
(each item's `onComplete` triggers the next) via a leading `{ concurrent: bool }`
marker. `simpleTween` guards against that marker reaching it as a non-tweenable
target.

### tween.js v25 battle scar

tween.js v25 **no longer auto-registers tweens to a global group**. A tween must
opt into a `Group`, and that group must be advanced each frame. VirtuaBooth
creates one shared `TWEEN.Group` in `raspberry-pi-5.js`, shares it via
`Context`, registers every tween into it (`new TWEEN.Tween(target, group)`), and
calls `tweenGroup.update(undefined, false)` in the loop (`false` = auto-remove
finished tweens). Miss any of these and **all** camera/scene animation silently
stalls.

## Scene-transition state machine

`Handlers.sceneStageAnim(stage)` orchestrates a "complicated animation": lock
controls → raise subject to a safe height → despawn current stage props (reverse
spawn anims) → swap skybox → spawn new stage props → reposition camera/target →
unlock controls.

It is guarded by `config.sceneCurrentAnimation`: set to the target stage at the
start and reset to `''` only when the final `setTarget` tween completes. **If
that reset never fires, every subsequent transition is blocked** — exactly the
class of bug the tween-group fix resolved.

## Build & deploy

`npm run build` = `vite build` (→ `dist/`, with a stable `vendor` chunk and
`console`/`debugger` dropped) + `jsdoc` (→ `dist/docs/`). Pushing `master` runs
`.github/workflows/deploy.yml`: lint → format check → build → force-push `dist/`
to the `ophiocus.github.io` Pages repo via an SSH deploy key.

## Assets

`public/{gltf,hdri,textures}` (Vite serves `public/` at site root). Skybox HDRIs
and the stage GLTF are referenced by absolute path (`/hdri/…`, `/gltf/…`); names
are configured in `Context.get.config.skydome` and `props`.
