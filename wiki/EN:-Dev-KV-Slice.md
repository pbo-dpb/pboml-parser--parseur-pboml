# Key-Value (KV List) Slice — Developer Reference

> Author-facing reference: [KV Slice](./EN:-KV-Slice)

***
🌐  English • [Français](./FR:-Dev-KV-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `kvlist` |
| Model | `src/models/contents/KvListSlice.js` + `src/models/contents/KvListVariablePair.js` |
| HTML renderer | `src/Renderers/Html/KvListSliceHtmlRenderer.js` (the actual markup comes from `KvListVariablePair`) |
| Editor | `src/editors/KvSliceEditor.js` |
| In the slice stager | Yes |
| Default presentation | none |

## Model

```yaml
- type: kvlist
  prototype:
    key:
      type: markdown            # markdown | number | (anything else = raw)
      label: { en: Measure, fr: Mesure }
    value:
      type: markdown
      label: { en: Cost, fr: Coût }
    display_labels: true        # show "MEASURE • " before each key/value
  content:
    - key:   { content: { en: "Option A", fr: "Option A" } }
      value: { content: { en: "$1.2 billion", fr: "1,2 milliard $" } }
    - key:   { content: { en: "Option B", fr: "Option B" } }
      value: { content: { en: ["$300M", "over 5 years"], fr: ["300 M$", "sur 5 ans"] } }
```

### `KvListSlice`

| Property | Notes |
|:-|:-|
| `prototype.key/value.type` | Decides how the content is rendered (see below). |
| `prototype.key/value.label` | `{en, fr}`; shown when `display_labels` is true, and used as headings in the editor. |
| `prototype.display_labels` | Coerced to a boolean. Serialized only when `true`. |
| `content` | Array of `KvListVariablePair`. A non-array value becomes `[]`. |

Methods: `appendKvEntry()` and `removeKvEntry(entry)` (used by the editor).

### `KvListVariablePair`

| Property | Notes |
|:-|:-|
| `key.content`, `value.content` | Usually `{en, fr}`. A language value may be an **array**: its items are rendered separately and joined with a `•` separator. |
| `display_labels` | Read from the pair if present, otherwise inherited from the prototype. **Not serialized** (see quirks). |
| `prototype` | Back-reference to the slice's prototype. |

### Rendering by type (`renderKeyOrValueContentToHtml`)

| `type` | Rendering |
|:-|:-|
| `markdown` | `MarkdownDriver.render(value[lang] ?? value)` (errors → empty string). |
| `number` | `Intl.NumberFormat(lang).format(value)`. |
| other / missing | `value[lang] ?? value`, inserted as raw HTML. |

## Rendering

```html
<dl class="flex flex-col gap-2">
  <div class="border-l-2 pl-2">
    <dt>[LABEL •] <span class="pboml-prose">key</span></dt>
    <dd>[LABEL •] <span class="pboml-prose">value</span></dd>
  </div>
  …
</dl>
```

Keys are bold. Labels are uppercase and small. Both spans carry `pboml-prose`, so annotation references work in keys and values.

## Editing

`KvSliceEditor`:

- With **metadata editing** on: `BilingualInput`s for the key and value labels, and a *display labels* checkbox.
- One block per pair: a delete 🗑️ button and two `BilingualInput`s (key, value). The headings come from the prototype labels (default "Key • Clé" / "Value • Valeur").
- ➕ adds an empty pair.

The editor always uses `BilingualInput`, whatever the prototype `type` is. There is no number input and no editor for array values.

## Known quirks and limitations

- **Shared default objects for new pairs.** In `KvListVariablePair`'s constructor (no payload), `{ ...defaultStructures }[type]` copies only the **outer** object. Every new pair's `key.content` **and** `value.content` therefore point to the **same** `{en: "", fr: ""}` object (and the same one is reused for later pairs). The editor replaces the whole object on input (`entry.key.content = value`), which hides the problem in practice. Code that changes `content.en` in place would update several pairs at once.
- The default for `value.content` is chosen from `prototype.key.type` instead of `prototype.value.type` (copy/paste).
- A pair-level `display_labels` override is read but never written back by `toArray()`, so it is lost on save.
- Array values are rendered, but the visual editor has no dedicated input for them (`BilingualInput` expects strings). Edit them through source code.
- `KvListSliceHtmlRenderer.js` declares an unused module-level `language` constant.
