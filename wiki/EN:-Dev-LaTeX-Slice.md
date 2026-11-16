# LaTeX Slice — Developer Reference

> There is no author-facing page for this slice type yet. This page documents both the format and the implementation.

***
🌐  English • [Français](./FR:-Dev-LaTeX-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | **`LaTeX`** (case-sensitive: `latex` or `Latex` is silently dropped) |
| Model | `src/models/contents/LaTeXSlice.js` |
| HTML renderer | `src/Renderers/Html/LaTeXSliceHtmlRenderer.js` → `src/components/LaTeXRenderer.js` |
| Editor | `src/editors/LaTeXSliceEditor.js` |
| In the slice stager | Yes, marked **advanced** (asks for confirmation) |
| Default presentation | none |
| Library | [`latex.js`](https://latex.js.org/) |
| Sample | `tests/samples/latex0.yaml` |

## When to use it

Use it for content that needs real LaTeX **documents or environments** (structured equations, `align`, theorem-like blocks, …). For inline or simple display math in normal prose, prefer a [Markdown slice](./EN:-Dev-Markdown-Slice): KaTeX math (`$$…$$`) is lighter and its output follows the page styles.

## Format

```yaml
- type: LaTeX
  label: { en: Model specification, fr: Spécification du modèle }
  content:
    en: |
      \documentclass{article}
      \begin{document}
      The cost is $C = \sum_{t=0}^{T} \frac{c_t}{(1+r)^t}$.
      \end{document}
    fr: |
      \documentclass{article}
      \begin{document}
      Le coût est $C = \sum_{t=0}^{T} \frac{c_t}{(1+r)^t}$.
      \end{document}
```

| Field | Type | Required | Notes |
|:-|:-|:-|:-|
| `type` | string | ✅ | Exactly `LaTeX`. |
| `content` | `{en, fr}` | ✅ | A LaTeX source that `latex.js` can parse. `latex.js` only supports a **subset** of LaTeX and its packages. |
| Common slice fields | | | `label`, `presentation`, `sources`, `notes`, `alts`, … work as for every slice ([Slice Objects](./EN:-Slice-Objects)). |

## Model

The simplest possible slice: `content` is normalized to `{en, fr}` and written back in `toArray()`. Nothing else is specific to this type.

## Rendering (`components/LaTeXRenderer.js`)

```js
const generator = new HtmlGenerator({ hyphenate: false });
const doc = parse(this.payload, { generator });
shadowRoot.append(doc.domFragment());
shadowRoot.append(generator.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/"));
```

- Output goes into a **Shadow DOM**, rebuilt on every `mounted`/`updated`.
- `stylesAndScripts()` adds `<link>`/`<script>` tags that load the **latex.js CSS, fonts and helper scripts from jsDelivr**, pinned to version **0.12.4**.
- Parse errors are caught and logged with `console.error`. The slice then renders **an empty block** (no ⚠️ placeholder).
- The renderer component is loaded asynchronously, so `latex.js` is only downloaded when a document contains a LaTeX slice.

## Editing

`LaTeXSliceEditor` shows two monospace `<textarea>`s (EN, FR). Changes are applied on `change` (when the field loses focus), not while typing. There is no syntax checking in the editor; use the slice preview to check the output.

## Known quirks and limitations

- **Runtime dependency on a CDN.** The bundled pages (`index.html`, `editor.html`) set a strict Content-Security-Policy (`default-src` with no sources; `script-src 'self'`; `style-src 'self' 'unsafe-inline'`). Unless the host page allows jsDelivr, the latex.js stylesheet, fonts and scripts are **blocked**, and the output is unstyled. Self-hosting the latex.js `dist/` assets would remove this dependency.
- **Version mismatch.** `package.json` requires `latex.js ^0.12.6`, but the CDN URL is pinned to `0.12.4`. The JavaScript parser and the CSS can therefore come from different versions.
- Errors are not shown to authors in the editor (only in the console).
- Annotation references (`[^1]`) inside LaTeX output are not linked (Shadow DOM, no `.pboml-prose`).
- Output does not follow the dark theme.
- There is no author-facing wiki page, and `LaTeX` (like `html`) is missing from the *Supported values for the `type` field* table in [Slice Objects](./EN:-Slice-Objects). Consider adding both.
