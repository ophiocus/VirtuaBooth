# VirtuaBooth roadmap

Status of the modernization effort and what's next. Done items are kept for
context; open items are roughly priority-ordered.

## Done

- Restored from the dormant source, rebranded, deployed to `ophiocus.github.io`.
- Toolchain: three.js 0.184, tween.js 25, Vite 6, JSDoc 4.0.5 (Node 24 CI).
- Fixed the tween.js v25 group regression (all animations were stalled).
- Bundle code-split (stable `vendor` chunk); `console`/`debugger` stripped in prod.
- `npm audit`: 0 vulnerabilities.
- Engineering baseline: ESLint 9 + Prettier + EditorConfig, CI lint/format gate.
- Functional-parity audit: every handler verified (section tweens, all scene
  transitions, case toggle, feature anims, colour picker) — zero regressions.

## Open — code quality

- **Resolve the 17 ESLint warnings.** Mostly `no-unused-vars` and
  `no-prototype-builtins` (`hasOwnProperty` → `Object.hasOwn`).
- **RectAreaLight is half-wired.** `project.js` imports `RectAreaLightHelper` and
  `RectAreaLightUniformsLib` (both currently unused) and adds a `RectAreaLight`
  without ever calling `RectAreaLightUniformsLib.init()`, so that light does not
  contribute correctly. Either wire up `init()` or remove the light + imports.
- **Decouple the window globals.** Import `Handlers` into `main.js` and replace
  the inline `onclick="Handlers.…"` attributes with `addEventListener` wiring so
  the module graph is explicit and the ESLint global declarations can go away.
  Keep only deliberate debug handles behind a dev flag.

## Open — type safety

- Add a `tsconfig.json` with `checkJs`/`allowJs`/`noEmit` to type-check via the
  existing JSDoc, then a `typecheck` script and CI step. Tighten the JSDoc
  annotations (many `@param` types are loose) until it passes clean.

## Open — testing

- No automated tests yet. Add a headless harness (e.g. Playwright) that drives
  the handlers and asserts state the way the parity audit did manually —
  remember to pump `tweenGroup.update()` since rAF is paused when hidden.

## Open — product direction

- **Parameterize as a reusable showroom template.** Externalize the model,
  scenes, branding, and menu config so the booth can be re-skinned for products
  other than the Raspberry Pi 5.
- Tighten the CI lint gate to `--max-warnings 0` once the warning backlog is clear.
