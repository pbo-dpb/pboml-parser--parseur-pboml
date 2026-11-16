# Developer Guide

This section of the wiki is for **developers who work on the PBOML parser/editor codebase**. If you write PBOML documents, start with [Anatomy of a PBOML document](./EN:-Anatomy-of-a-PBOML-document) and the slice reference pages instead.

***
🌐  English • [Français](./FR:-Guide-du-developpeur)
***

## What this project is

The project ships **one web component**, `<pboml-parser>`, that does two jobs:

| Mode | How it is activated | What it does |
|:-|:-|:-|
| **Renderer** | default | Parses a PBOML (YAML) payload and renders it as accessible, bilingual HTML. |
| **Editor** | `edit="true"` attribute | Loads a visual editor (lazily, as a separate chunk) that lets authors build and modify a PBOML document, then export it. |

A second, smaller web component, `<pboml-toc>`, renders a table of contents for the same payload.

Both are Vue 3 components compiled as **custom elements** (`defineCustomElement`) and registered in `src/main.js`.

## Big picture

```
           YAML string / base64 data URL
                        │
                        ▼
   ┌──────────────────────────────────────────┐
   │ App.ce.vue  (<pboml-parser>)             │
   │  js-yaml.loadAll() → new PBOMLDocument() │
   └──────────────────────────────────────────┘
                        │  PBOMLDocument (models/)
          ┌─────────────┴─────────────┐
          ▼                           ▼
  Renderer (read-only)          Editor (edit="true")
  components/Renderer/          components/Editor/
          │                           │
          ▼                           ▼
  Renderers/Html/*SliceHtmlRenderer   editors/*SliceEditor
  (one per slice type)                (one per slice type)
          │                           │
          └──── shared helpers ───────┘
     MarkdownDriver · DataTable · Grapher (Chart.js)
                        │
                        ▼
      PBOMLDocument.serialize() → YAML (export)
```

The codebase is organized around three layers:

1. **Model** (`src/models/`) – Plain JavaScript classes. `PBOMLDocument` holds document metadata, a list of `Slice` subclasses and a list of `Annotation`s. Every model knows how to build itself from a YAML payload (constructor) and how to turn itself back into a plain object (`toArray()`). See [Document model and parsing](./EN:-Dev-Document-Model-and-Parsing).
2. **Renderers** (`src/Renderers/Html/`, `src/components/Renderer/`) – Classes that turn a slice into Vue vnodes. The model chooses its renderer through `rendererObjectForSliceRendererType("html")`. See [Rendering pipeline](./EN:-Dev-Rendering-Pipeline).
3. **Editors** (`src/editors/`, `src/components/Editor/`) – Vue components that change the model directly. Vue reactivity re-renders previews and fires a `pboml-editor-document-updated` event on every change. See [Editor architecture](./EN:-Dev-Editor-Architecture).

## Directory map

| Path | Contents |
|:-|:-|
| `src/main.js` | Registers the `pboml-parser` and `pboml-toc` custom elements. Exposes `window.pbomlParserScriptUrl`, which the enhanced preview window uses. |
| `src/App.ce.vue` | Root of `<pboml-parser>`. Decodes the payload, builds the `PBOMLDocument`, picks Renderer / Editor / FilePicker, handles hash navigation and watches the `payload` attribute for changes. |
| `src/Toc.ce.vue` | Root of `<pboml-toc>`. |
| `src/models/PBOMLDocument.js` | Document model, slice factory (`provisionSliceFromPayload`), serialization. |
| `src/models/Annotation.js` | Footnote/endnote model (markdown or BibTeX). |
| `src/models/contents/` | `Slice` base class and one subclass per slice type, plus the shared `DataTable/` and `ArrayTable/` models. |
| `src/Renderers/Html/` | `SliceHtmlRenderer` base class and one HTML renderer per slice type. |
| `src/components/Renderer/` | The `Renderer` Vue component, annotation rendering and the intersection observer. |
| `src/components/Grapher/` | Chart.js wrappers that draw chart slices. |
| `src/components/Editor/` | The editor shell, tabs, inputs, DataTable editor, structure importer, previews. |
| `src/editors/` | `SliceEditor` (the frame around every slice in edit mode) and one editor per slice type. |
| `src/MarkdownDriver.js` | Turns Markdown into HTML (marked + KaTeX + DOMPurify + host callbacks). |
| `src/HtmlMarkdownConverter.js` | Turns HTML into Markdown (Turndown). Used when importing Word documents. |
| `src/Callbacks.js` | Optional hooks the host page can define on `document.pbomlCallbacks`. |
| `src/editor-strings.js`, `src/renderer-strings.js` | EN/FR user interface strings. |
| `tests/` | Vitest suites (run through Vite+) and YAML samples. |

## Tooling

| Task | Command |
|:-|:-|
| Install | `pnpm install` |
| Dev server (HTTPS, port 8080) | `pnpm run dev` |
| Unit tests (Vitest, `happy-dom`) | `pnpm run test` |
| Production build | `pnpm run build` |

- The build uses **Vite+** (`vp`) with `@vitejs/plugin-vue` set to `customElement: true`, Tailwind CSS v4 and a basic SSL plugin.
- The build has four entry points: `src/main.js`, `index.html`, `index.fr.html` and `editor.html`. A `manifest.json` is generated, and host pages use it to find the current bundle (see the README).
- The **`compile-and-release`** GitHub workflow is run by hand (`workflow_dispatch`). It builds, copies `dist/.vite/manifest.json` to `dist/manifest.json`, publishes a `latest` release with `dist.zip`, uploads `dist/` to S3 and invalidates CloudFront.

### Local entry pages

| Page | Purpose |
|:-|:-|
| `index.html` / `index.fr.html` | Renderer with no payload (useful with a payload injected from DevTools). |
| `editor.html` | `<pboml-parser edit="true">` – opens the file picker, then the editor. |
| `tests.html` | Manual test page. |

## Embedding contract (summary)

| Attribute | Type | Meaning |
|:-|:-|:-|
| `payload` | string | Raw PBOML YAML, or `data:text/yaml;base64,…`. In renderer mode, changes to this attribute are watched (debounced by 500 ms) and the document is re-parsed. |
| `edit` | any | When present (truthy), loads the editor. |
| `standalone` | any | Hides the header (type, title, date) and footer (copyright, id). |
| `prefix` | string | Prefix for every generated id and anchor. Required when several documents are on the same page. |
| `language` | string | `en` or `fr`. Defaults to `<html lang>`. |

**Events dispatched on `document`:**

| Event | Detail | When |
|:-|:-|:-|
| `pboml-editor-document-updated` | `{ pbomlDocument: <serialized YAML> }` | Any deep change to the document in the editor. |
| `pboml-renderer-intersection-visible` | `{ anchor }` | A slice is fully visible in the viewport (used by the TOC to highlight the current section). |
| `pbomlnavigate` (on `window`) | anchor string | Navigation to a slice when `location.hash` is used for SPA routing. |

**Host hooks** (`document.pbomlCallbacks`):

- `beforeMarkdownRendering(markdown) → markdown`
- `afterMarkdownRendering(html) → html` (the returned HTML is rendered **without further sanitization**)

> ⚠️ Only trusted content should be passed to the component. Markdown output is sanitized with DOMPurify, but some paths (for example document `title`/`type`/`copyright`, which are inserted with `innerHTML`) are not.

## Slice types at a glance

| YAML `type` | Model | HTML renderer | Editor | Developer page |
|:-|:-|:-|:-|:-|
| `heading` | `HeadingSlice` | `HeadingSliceHtmlRenderer` | `HeadingSliceEditor` | [Heading](./EN:-Dev-Heading-Slice) |
| `markdown` | `MarkdownSlice` | `MarkdownSliceHtmlRenderer` | `MarkdownSliceEditor` | [Markdown](./EN:-Dev-Markdown-Slice) |
| `table` | `TableSlice` (+ `DataTable`) | `TableSliceHtmlRenderer` | `TableSliceEditor` | [Table](./EN:-Dev-Table-Slice) |
| `chart` | `ChartSlice` (+ `DataTable` or `ArrayTable`) | `ChartSliceHtmlRenderer` | `ChartSliceEditor` | [Chart](./EN:-Dev-Chart-Slice) |
| `svg` | `SvgSlice` | `SvgSliceHtmlRenderer` | `SvgSliceEditor` | [SVG](./EN:-Dev-SVG-Slice) |
| `bitmap` | `BitmapSlice` | `BitmapSliceHtmlRenderer` | `BitmapSliceEditor` | [Bitmap](./EN:-Dev-Bitmap-Slice) |
| `html` | `HtmlSlice` | `HtmlSliceHtmlRenderer` | `HtmlSliceEditor` | [HTML](./EN:-Dev-HTML-Slice) |
| `kvlist` | `KvListSlice` (+ `KvListVariablePair`) | `KvListSliceHtmlRenderer` | `KvSliceEditor` | [KV list](./EN:-Dev-KV-Slice) |
| `LaTeX` | `LaTeXSlice` | `LaTeXSliceHtmlRenderer` | `LaTeXSliceEditor` | [LaTeX](./EN:-Dev-LaTeX-Slice) |

> Slice `type` values are **case-sensitive**: `LaTeX` must be written exactly that way. Any unknown type is **silently dropped** at parse time.

## Developer pages

* [Document model and parsing](./EN:-Dev-Document-Model-and-Parsing)
* [Rendering pipeline](./EN:-Dev-Rendering-Pipeline)
* [Editor architecture](./EN:-Dev-Editor-Architecture)
* [Adding a new slice type](./EN:-Dev-Adding-a-Slice-Type)
