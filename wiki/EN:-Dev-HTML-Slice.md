# HTML Slice — Developer Reference

> Author-facing reference: [HTML Slice](./EN:-HTML-Slice)

***
🌐  English • [Français](./FR:-Dev-HTML-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `html` |
| Model | `src/models/contents/HtmlSlice.js` |
| HTML renderer | `src/Renderers/Html/HtmlSliceHtmlRenderer.js` → `src/components/HtmlRenderer.js` |
| Editor | `src/editors/HtmlSliceEditor.js` |
| In the slice stager | Yes, marked **advanced**; default presentation `figure` |
| Runtime styling | `@twind/core` + `twind.config.js` (Tailwind preset + typography) |

## Model

```yaml
- type: html
  remove_default_styles: false   # default false; true = no Tailwind/Twind in the shadow root
  css: |                          # optional author stylesheet, scoped to the shadow root
    .highlight { color: rebeccapurple; }
  content:
    en: "<p class='text-lg'>Hello <span class='highlight'>world</span></p>"
    fr: "<p class='text-lg'>Bonjour <span class='highlight'>le monde</span></p>"
```

| Property | Default | Notes |
|:-|:-|:-|
| `content` | – | `{en, fr}` HTML fragments. |
| `css` | `null` | One stylesheet shared by both languages. |
| `remove_default_styles` | `false` | Any truthy value becomes `true`. |

`toArray()` removes `css` and `remove_default_styles` when they equal `HtmlSlice.defaults` (loose `==` comparison, so an empty `css` string is removed too).

## Rendering (`components/HtmlRenderer.js`)

On every `mounted`/`updated`:

1. Create a wrapper `<div>` and attach an **open Shadow DOM**.
2. Inside, create a `<div>` with prose classes (`prose dark:prose-invert max-w-none`, horizontally scrollable tables, …).
3. `innerHTML = DOMPurify.sanitize(content[lang])`. Scripts and event handlers are removed.
4. Build `adoptedStyleSheets`:
   - unless `remove_default_styles` is set: a Twind sheet (`cssom(new CSSStyleSheet())`) plus `observe(tw, shadowRoot)`, so **Tailwind utility classes used in the HTML are generated on demand**;
   - if `css` is set: a `CSSStyleSheet` filled with `replaceSync(DOMPurify.sanitize(css))`.
5. Replace the component's root children with the wrapper.

A missing language renders a ⚠️ placeholder.

## Editing

`HtmlSliceEditor`:

- EN and FR `<textarea>`s (monospace), applied on `change` (blur), not on every keystroke.
- When **metadata editing** is on: a *remove default styles* checkbox and a CSS textarea (an empty value is stored as `null`).

There is no WYSIWYG mode. Previews come from the standard slice preview or the enhanced preview.

## Security notes

- This is the most powerful slice type. It is flagged *advanced* in the stager for that reason.
- DOMPurify removes scripts, but the HTML can still contain links, forms, images from any origin, and so on. Treat HTML slices as **trusted author content**.
- Running `DOMPurify.sanitize()` on **CSS** is not a CSS sanitizer. It mostly protects against `</style>`-style breakouts. Do not rely on it to block `url()` requests or other CSS-based tricks.

## Known quirks and limitations

- The renderer file exports a class named `SvgSliceHtmlRenderer` (copy/paste). It works because lookup is by file name.
- Annotation references (`[^1]`) in HTML content are **not** linked (Shadow DOM, no `.pboml-prose`).
- Headings inside the HTML are not seen by the TOC.
- Twind's generated CSS can differ slightly from the Tailwind v4 build used by the rest of the component.
- The shadow root is rebuilt on every Vue update of the component, so any interactive state inside it (scroll position, open `<details>`) is lost.
