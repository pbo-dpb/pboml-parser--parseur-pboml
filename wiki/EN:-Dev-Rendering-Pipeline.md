# Rendering Pipeline

How a `PBOMLDocument` becomes HTML in read-only (renderer) mode.

***
🌐  English • [Français](./FR:-Dev-Rendering-Pipeline) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## Overview

```
Renderer.js (Vue component)
 ├─ header: document type, title (h1), localized release date      (skipped if standalone)
 ├─ for each slice (or group of slices sharing `referenced_as`)
 │    getSliceRenderer(slice)
 │      → slice.constructor.rendererObjectForSliceRendererType("html")
 │      → new Renderers/Html/<Name>.js(slice)
 │    renderer.renderAsVnode(language)
 │      ├─ getSliceWrapperVnode()   <section> | <figure> | <aside>
 │      └─ buildVnodes()
 │           ├─ _renderLabelTitleVnode()   h2 / header / figcaption
 │           ├─ renderReadonlyVnode()      ← implemented by each slice type
 │           └─ _renderMetaVnodes()        alts (collapsible), sources, notes
 ├─ <Annotations>                                                  (endnotes)
 └─ footer: copyright • document id                               (skipped if standalone)

mounted/updated → AnnotationAnchorsRenderer replaces [^id] with links
mounted         → RendererIntersectionManager observes each slice
```

## Renderer selection

Each slice model class has a static method:

```js
static rendererObjectForSliceRendererType(rendererType) {
  switch (rendererType) {
    case "html": return "TableSliceHtmlRenderer";
  }
  return super.rendererObjectForSliceRendererType(rendererType);
}
```

`Renderer.js` loads every file in `src/Renderers/Html/*.js` at build time (`import.meta.glob(..., { eager: true })`) and creates the renderer from **the file name**. The string returned above must therefore match a file name in `src/Renderers/Html/`. The class name inside the file does not matter (it is a default export).

The `"html"` argument is meant to allow other output formats (DOCX, PDF) later. Today only HTML renderers exist.

## `SliceHtmlRenderer` (base class)

`src/Renderers/Html/SliceHtmlRenderer.js` gives every slice type a consistent frame:

| Method | Responsibility |
|:-|:-|
| `getSliceWrapperVnode(lang)` | Picks the wrapper element and its styles from `presentation`: `null` → `<section>`, `figure` → `<figure>` (gradient card), `aside` / `aside-2` → `<aside>` (blue card; `aside-2` adds a left border). Sets `id = slice.anchor`, `aria-labelledby`, and `hidden print:flex` for `print_only`. |
| `_renderLabelTitleVnode(lang)` | Shows the label (with `referenced_as` in front, joined by an en-dash) as `<h2>`, `<header>` (when a presentation is set) or `<figcaption>` (when `figure`). Skipped if `display_label` is false or there is no label in that language. |
| `renderReadonlyVnode(lang)` | **Override this.** Returns the slice body. |
| `_renderMetaVnodes(lang)` | Alts in a `<details>`, then Sources and Notes as `<dl>` blocks. Each entry is rendered as Markdown. |
| `renderAsVnode(lang, wrap = true)` | Wrapper + `buildVnodes()`. |
| `buildVnodes(lang, skipTitle)` | `[label, body, metas]`. |

### Grouping by `referenced_as`

When **consecutive** slices have the same `referenced_as` in the current language (for example "Table 3"), `Renderer.js` puts them in a **single wrapper**, built from the first slice's presentation. Only the first slice's title is shown. This is how a figure can be made of a heading, a chart and a Markdown note, for example.

## Markdown

All Markdown goes through `src/MarkdownDriver.js`:

1. `document.pbomlCallbacks.beforeMarkdownRendering(md)` (if the host page defines it)
2. `marked` (GFM; `parseInline` when `shouldRenderInline(true)` is set)
   - **KaTeX** math through `marked-katex-extension`, output as MathML, inline delimiter `$$`
   - **linkify-it** (only when `shouldConvertUrls()` is called; annotations use it)
3. `DOMPurify.sanitize()` (skipped when `NODE_ENV === "test"`)
4. A fiscal-year fix: `>2023-24<` becomes `2023&shy;-24` with `hyphenate-character: ''`, so Firefox does not break the line at the dash
5. `document.pbomlCallbacks.afterMarkdownRendering(html)` (the result is **not** sanitized again)

Containers that hold Markdown output usually have the `pboml-prose` class. The annotation anchor pass relies on this class (see below).

## Annotations

- `components/Renderer/Annotations.js` renders an `<aside role="note">` with an `<ol>` of every annotation. The item that matches `location.hash` is highlighted and gets a "back to content" link.
- `AnnotationAnchorsRenderer` runs **after** Vue has updated the DOM. It looks for the literal text `[^{id}]` inside every `.pboml-prose` element and replaces it with a `<sup><a role="doc-noteref">` link built by `Annotation.getAnchorDomElement()`.

> This is a DOM post-processing step and works around Vue. The source code itself says it should eventually be replaced by a Markdown extension. Because of this, references inside Shadow DOM content (HTML, SVG, LaTeX slices) or outside `.pboml-prose` containers are **not** linked.

## Shadow DOM renderers

Three slice types render their payload in a **Shadow DOM**, so author styles cannot leak into the host page and the reverse:

| Component | Used by | Notes |
|:-|:-|:-|
| `components/SvgRenderer.js` | SVG slice | `DOMPurify.sanitize()` then `innerHTML`. |
| `components/HtmlRenderer.js` | HTML slice | DOMPurify; Twind (Tailwind at runtime) styles added with `adoptedStyleSheets` unless `remove_default_styles` is set; optional author `css`. |
| `components/LaTeXRenderer.js` | LaTeX slice | `latex.js` `HtmlGenerator`; its stylesheet and scripts are loaded from jsDelivr. |

All three rebuild the shadow root on `mounted` and `updated`.

## Charts

`ChartSliceHtmlRenderer` loads one of two Chart.js wrappers asynchronously, inside a `<Suspense>`:

- `Grapher/DataTableGrapher.js` – for `datatable` charts
- `Grapher/ArrayTableGrapher.js` – for the older `arraytable` charts

Both use `Grapher/ChartJsMixin.js` (canvas, dark mode, bottom legend, no animation, `EquidistantColorPalette`). Details: [Chart Slice (developer)](./EN:-Dev-Chart-Slice).

## Navigation, scrolling and the TOC

- Content lives inside a shadow root, so the browser's native `#hash` scrolling does not work. `App.ce.vue` listens to `hashchange` and `pbomlnavigate` and calls `scrollIntoView()` itself (after 850 ms on first load or in the editor, 10 ms otherwise).
- `RendererIntersectionManager` uses an `IntersectionObserver` (threshold 1.0) on each slice and dispatches `pboml-renderer-intersection-visible` with the slice anchor.
- `components/Toc/Toc.js` builds a tree from heading slices with `level < 3`. If the document has no such headings, it lists labelled slices instead. It highlights the visible item when it receives that event.

## Print

`src/print.css` is imported with `@import … print`. Renderers use Tailwind `print:` variants a lot (for example `break-inside-avoid`, and `print:flex` for `print_only` slices).

## Localized strings

`src/renderer-strings.js` holds the few strings the renderer needs (`Text version`, `Blank cell`, `Figure`, `Aside`, …) in `en` and `fr`. Some labels are still hard-coded in English, for example `Source(s)` / `Note(s)` in `SliceHtmlRenderer` and the `Notes` heading in `Annotations.js`.

## Known quirks

- `RendererIntersectionManager.startObservingForSlice()` never saves its observers in `this.observers`, so `stopObserving()` does nothing. The observers stay alive after the component is unmounted.
- `ChartSliceHtmlRenderer.renderAltsVnodes()` passes `language` as the third argument of `renderMetaVnodes(label, content, collapsible)`. It works only because a language string is truthy.
- `src/Renderers/Html/HtmlSliceHtmlRenderer.js` exports a class named `SvgSliceHtmlRenderer` (copy/paste). It is harmless, because renderers are looked up by file name, but it is confusing in stack traces.
