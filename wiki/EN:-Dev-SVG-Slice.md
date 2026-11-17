# SVG Slice — Developer Reference

> Author-facing reference: [SVG Slice](./EN:-SVG-Slice)

***
🌐  English • [Français](./FR:-Dev-SVG-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `svg` |
| Model | `src/models/contents/SvgSlice.js` |
| HTML renderer | `src/Renderers/Html/SvgSliceHtmlRenderer.js` → `src/components/SvgRenderer.js` |
| Editor | `src/editors/SvgSliceEditor.js` + `src/editors/SvgSliceTools/{SvgFitter,SvgWhiteRemover,SvgSanitizer}.js` |
| In the slice stager | Yes (default presentation `figure`) |
| Created by the structure importer | Yes, as an empty placeholder for each Markdown image |

## Model

```yaml
- type: svg
  presentation: figure
  label: { en: Figure title, fr: Titre de la figure }
  alts:                         # strongly recommended: text alternative
    - { en: "…", fr: "…" }
  content:
    en: "<svg viewBox='0 0 100 50' …>…</svg>"
    fr: "<svg viewBox='0 0 100 50' …>…</svg>"
```

- `content` = `{en, fr}` raw SVG markup (one file per language).
- At construction, `state.renderedAnchorIdPrefix = "svg-slice-render-<random>-"` is generated. It is used to give each rendered `<svg>` root a unique `id`.

## Rendering

`SvgSliceHtmlRenderer.renderReadonlyVnode(lang)`:

1. Throws, and renders a ⚠️ placeholder, if `content[lang]` is missing.
2. Parses the markup with `DOMParser` (`image/svg+xml`).
3. Sets `id = renderedAnchorIdPrefix + lang` on the root and **removes `width` and `height`**, so the SVG scales with its container (the `viewBox` must be present).
4. Passes the `outerHTML` to `components/SvgRenderer.js`, which runs **DOMPurify** and puts the result in a **Shadow DOM** (so styles and ids inside the SVG cannot conflict with the page).

Container classes: `w-full @4xl/slice:w-2/3 self-center dark:invert` (the image takes 2/3 of the width when the slice is wide, and is colour-inverted in dark mode).

## Editing

`SvgSliceEditor` shows two columns (EN | FR). Each has:

| Control | Behaviour |
|:-|:-|
| `.svg` file input | Read with `FileReader.readAsText`; emits `update:modelValue` with the new `{en, fr}`. |
| Preview | Checkerboard background, so transparency is visible; uses the real renderer. |
| *More options* (`Details`) | The three tools below. |
| *Show source* (`Details`) | Textarea with the raw markup (applied on `change`). |

### SVG tools

| Tool | What it actually does |
|:-|:-|
| **Fit** (`SvgFitter`) | Renders the SVG hidden, reads `getBBox()` and rewrites `viewBox` to the drawing's bounding box (removes empty margins). Uses two 200 ms timeouts to wait for layout. |
| **Remove white** (`SvgWhiteRemover`) | Regex replacement of `#FFF…` hex colours with `rgba(255,255,255,0)`. |
| **Sanitize** (`SvgSanitizer`) | Removes `&nbsp;` entities, which make the XML invalid. Despite its name, it does **not** run DOMPurify (rendering does that). |

The tools change `slice.content[lang]` directly instead of emitting events.

## Known quirks and limitations

- **Dark mode inverts every colour** (`dark:invert`), including brand colours and photos embedded in the SVG.
- `SvgWhiteRemover`'s regex `/#F{3,6}/gi` also matches the beginning of colours such as `#FFF000` or `#FFFA`, which leaves invalid colour strings behind. It also ignores `white`, `rgb(255,255,255)`, and so on.
- Removing `width`/`height` without a `viewBox` makes some SVGs collapse to the default size (300×150).
- Annotation references (`[^1]`) inside SVG text are not linked (content is in a Shadow DOM, outside `.pboml-prose`).
