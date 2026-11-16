# Heading Slice — Developer Reference

> Author-facing reference: [Heading Slice](./EN:-Heading-Slice)

***
🌐  English • [Français](./FR:-Dev-Heading-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `heading` |
| Model | `src/models/contents/HeadingSlice.js` |
| HTML renderer | `src/Renderers/Html/HeadingSliceHtmlRenderer.js` |
| Editor | `src/editors/HeadingSliceEditor.js` |
| In the slice stager | Yes |
| Default presentation | none |
| Used by | Table of contents (`Toc.js`), structure importer |

## Model

```yaml
- type: heading
  level: 1            # 0-based; default 0
  referenced_as: { en: "1.1", fr: "1.1" }   # optional, shown before the text
  content:
    en: Overview of Proposed Spending
    fr: Aperçu des dépenses proposées
```

| Property | Parsing |
|:-|:-|
| `content` | Normalized to `{en, fr}`. |
| `level` | `payload.level ? payload.level : 0`, so any falsy value becomes `0`. |
| Common `Slice` fields | Parsed by `super()`, but `label`, `display_label` and `presentation` are **removed** on serialization. |

`toArray()` deletes `display_label`, `label` and `presentation`, and writes `content` and `level`.

## Rendering

```js
const headingElType = `h${2 + this.slice.level}`;   // level 0 → <h2>
```

- `<h1>` is reserved for the document title (rendered by `Renderer.js`).
- Tailwind classes by level: `0` → `text-3xl` + border, `1` → `text-2xl` + border, `2` → `text-xl` + light border, `3` → light border only.
- `content[lang]` is rendered as **inline Markdown** (`md.shouldRenderInline(true)`), so emphasis, links and inline math work.
- `referenced_as[lang]`, if set, is shown in a dimmed `<span>` before the text.
- The heading still gets the standard wrapper (`<section id="{anchor}">`) from `SliceHtmlRenderer.renderAsVnode()`. The base class's label and meta blocks are still evaluated. They are normally empty, but a hand-written `label` or `notes` on a heading **would** be rendered.

## Editing

`HeadingSlice` **overrides `__buildEditorsVnode()`**. Instead of the full metadata form, it shows only:

1. `SliceReferenceEditor` (`referenced_as`)
2. `HeadingSliceEditor`:
   - a `BigRadioInput` with the choices `H1 → 0`, `> H2 → 1`, `>> H3 → 2`, `>>> H4 → 3`. The value is stored with `parseInt`.
   - a `BilingualInput` for `content`.

There is no presentation, label, id or metas editor for headings.

## Table of contents and structure

- `Toc.js` builds its tree from heading slices with `level < 3`, so level `3` headings never appear in the TOC.
- The structure importer creates headings from Markdown `#` tokens (`level = depth - 1`). A level-0 heading titled exactly `Notes` switches the importer to annotation mode.

## Known quirks and limitations

- **Editor labels vs. HTML levels**: the editor calls level `0` "H1", but it is rendered as `<h2>` (and level `3` "H4" as `<h5>`). This is intentional (the document title is the real `<h1>`), but it can confuse authors comparing with Word.
- **Out-of-range levels** are not validated. `level: 4` renders an unstyled `<h6>`. `level: 5` or more produces an invalid element name (`h7`…), and the heading effectively disappears. The existing author page says "won't render anything" for unsupported values, which matches what users see.
- `display_label`, `label`, `presentation`, `sources`, `notes` and `alts` are accepted at parse time but are not editable. `sources`/`notes`/`alts` are still written back by `toArray()` if present.
- The heading content is plain inline Markdown with **no annotation linking**: the heading `<span>` is not a `.pboml-prose` container, so `[^1]` is not turned into a link.
