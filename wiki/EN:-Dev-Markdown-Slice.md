# Markdown Slice — Developer Reference

> Author-facing reference: [Markdown Slice](./EN:-Markdown-Slice)

***
🌐  English • [Français](./FR:-Dev-Markdown-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `markdown` |
| Model | `src/models/contents/MarkdownSlice.js` |
| HTML renderer | `src/Renderers/Html/MarkdownSliceHtmlRenderer.js` |
| Editor | `src/editors/MarkdownSliceEditor.js` (uses `components/Editor/Inputs/MarkdownTextarea.vue`) |
| In the slice stager | Yes (first button) |
| Default presentation | none |
| Created by the structure importer | Yes, as an empty placeholder for each run of paragraphs |

The Markdown slice is the simplest slice type and the best template for new ones.

## Model

```yaml
- type: markdown
  content:
    en: "Some **text** with a note[^1] and math $$x^2$$."
    fr: "Du **texte** avec une note[^1] et des maths $$x^2$$."
```

- `content` is normalized to `{en, fr}`.
- `toArray()` = `super.toArray()` + `content: {en, fr}`.
- All common `Slice` fields (label, presentation, sources, notes, alts, …) are supported.

## Rendering

```js
renderReadonlyVnode(language) {
  const md = new MarkdownDriver();
  return h("div", { class: "pboml-prose", innerHTML: md.render(this.slice.content[language]) });
}
```

Everything interesting happens in `MarkdownDriver` (see [Rendering pipeline → Markdown](./EN:-Dev-Rendering-Pipeline#markdown)):

| Feature | Implementation |
|:-|:-|
| GitHub-flavoured Markdown (tables, strikethrough, …) | `marked` with `gfm: true` |
| Math | `marked-katex-extension`, MathML output, inline delimiter **`$$…$$`** |
| Sanitization | DOMPurify (skipped in tests) |
| Host hooks | `document.pbomlCallbacks.before/afterMarkdownRendering` |
| Fiscal-year hyphenation fix | `2023-24` alone in an element gets a soft hyphen |
| Annotation references | `[^id]` is left as text by marked, then replaced by `AnnotationAnchorsRenderer` because the container has the `pboml-prose` class |

Non-string, non-number content (for example a missing language) is rendered as an empty string; no error is thrown.

## Editing

`MarkdownSliceEditor` shows two `MarkdownTextarea`s (EN | FR) side by side. Each change emits `update:modelValue` with a new `{en, fr}` object. The handler in `MarkdownSlice._buildEditorInputVnodes()` assigns it to `slice.content`.

Read-only slices show the standard read-only notice and EN/FR previews.

## Known quirks and limitations

- `marked.use()` is called in **every** `MarkdownDriver` constructor, and `marked` is a module-level singleton, so extensions are registered again and again. Also, as soon as **any** `MarkdownDriver` calls `shouldConvertUrls()` (annotations do), linkification stays on for every later render, including Markdown slices.
- Annotation links are added by DOM post-processing, after Vue renders. Content changed by `afterMarkdownRendering` or rendered outside a `.pboml-prose` container is not processed.
- KaTeX errors are not thrown (`throwOnError: false`). Invalid math is rendered as KaTeX's error output instead.
