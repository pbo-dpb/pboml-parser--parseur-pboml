# Document Model and Parsing

How a YAML payload becomes a `PBOMLDocument`, and how that document is turned back into YAML.

***
🌐  English • [Français](./FR:-Dev-Document-Model-and-Parsing) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## Parsing flow

```
payload (attribute)
  │  starts with "data:text/yaml;base64," ? → Buffer.from(…, "base64")
  ▼
yaml.loadAll(string)          // js-yaml: one entry per "---" document
  ▼
new PBOMLDocument(documents, prefix)
  ├─ find the main document: the first one with a `pboml` key
  ├─ validate pboml.version === "1.0.0"
  ├─ read `document` metadata
  ├─ slices → PBOMLDocument.provisionSliceFromPayload() for each
  ├─ annotations → new Annotation() for each, sorted by id (numeric-aware)
  └─ keep the other YAML documents in `otherDocuments`
```

The same flow is used by:

- `App.ce.vue` → `loadDocumentFromPayload()` (renderer and editor),
- `Toc.ce.vue`,
- `FilePickerInput.vue` (when the user opens a `.yaml` file, or a PDF whose **Subject** metadata holds PBOML),
- `PBOMLDocument.initFromYaml(yaml, prefix)` (the editor's *Advanced → Code* tab).

## Validation and errors

`PBOMLDocument`'s constructor throws an `Error` whose message comes from `PBOMLDocument.errors.js`:

| Condition | Message key |
|:-|:-|
| No YAML document at all | `fileIsEmpty` |
| No document has a `pboml` key | `pbomlIsUndefined` |
| `pboml: null` | `pbomlIsNull` |
| `pboml.version` is `null` / `""` / not `"1.0.0"` | `versionIsNull` / `versionIsEmptyString` / `versionIsNotSupported` |
| `slices` is neither an array, an object nor null | `slicesIsNotArrayOrObject` |
| `annotations` is neither an array, an object nor null | `annotationsIsNotArrayOrObject` |

Lenient behaviours to be aware of:

- `slices` and `annotations` may be **objects** (keyed maps); only their values are used.
- A slice with an **unknown `type`** makes `provisionSliceFromPayload()` return `undefined`, and the slice is filtered out **without any warning**.
- Malformed slice content does not throw at parse time. It usually fails later, at render time (and renderers often show a ⚠️ placeholder).

These cases are covered by `tests/models/PBOMLDocument.test.js` using the samples in `tests/samples/`.

## `PBOMLDocument`

| Property | Source | Notes |
|:-|:-|:-|
| `pbomlVersion` | `pboml.version` | Always `"1.0.0"` today. |
| `id` | `document.id` | Used as the download file name (`{id}.pboml.yaml`) and shown in the footer. |
| `release_date` | `document.release_date` | Converted to a `Date`. `localizedReleaseDate` formats it for `en-CA` / `fr-CA`. |
| `title`, `type`, `copyright` | `document.*` | Localized `{en, fr}` objects. |
| `user_data` | `document.user_data` | Free-form; passed through untouched. |
| `slices` | `slices` | Array of `Slice` subclasses. |
| `annotations` | `annotations` | Array of `Annotation`, sorted by id. |
| `otherDocuments` | other `---` documents | Preserved and re-emitted on serialization. |
| `state.prefix` | constructor argument | Copied to every slice and annotation. |

### Slice factory

```js
static provisionSliceFromPayload(element) {
  switch (element.type) {
    case "bitmap":   return new BitmapSlice(element);
    case "chart":    return new ChartSlice(element);
    case "heading":  return new HeadingSlice(element);
    case "html":     return new HtmlSlice(element);
    case "kvlist":   return new KvListSlice(element);
    case "LaTeX":    return new LaTeXSlice(element);
    case "markdown": return new MarkdownSlice(element);
    case "svg":      return new SvgSlice(element);
    case "table":    return new TableSlice(element);
  }
}
```

After building a slice, the document sets `state.sequence` (1-based position), `state.prefix`, `state.canMoveUp` and `state.canMoveDown`.

### Structural operations (used by the editor)

| Method | Effect |
|:-|:-|
| `addSlice(slice, index?)` | Inserts the slice (or appends it), recomputes positions and scrolls to it. |
| `duplicateSlice(slice)` | Re-provisions from `slice.toArray()` and **appends it to the end** of the document. |
| `deleteSlice(slice)` | Removes the slice at `state.sequence - 1`, then scrolls to the nearest slice. |
| `moveSlice(slice, "up"\|"down")` | Swaps the slice with its neighbour. |
| `resetSlicesMoveability()` | Recomputes `sequence`, `canMoveUp` and `canMoveDown` for every slice. |
| `scrollToSliceAtIndex(i)` | Sets `location.hash` to the slice anchor, or dispatches `pbomlnavigate` if the hash looks like SPA routing. |

## The `Slice` base class

`src/models/contents/Slice.js` handles the fields shared by most slice types (see the author-facing [Slice Objects](./EN:-Slice-Objects) page):

| Field | Default | Notes |
|:-|:-|:-|
| `id` | – | New slices from the editor get `crypto.randomUUID()`. |
| `type` | – | Overwritten by each subclass constructor. |
| `readonly` | `false` | Editors show a read-only preview instead of inputs. |
| `display_label` | `true` | |
| `presentation` | `null` | `null`, `figure`, `aside` or `aside-2`. |
| `print_only` | `false` | Rendered with `hidden print:flex`. |
| `choices` | – | When present, the editor shows a radio list of alternative versions instead of the slice editor (see `ChoiceRenderer`). |
| `referenced_as`, `label` | `{en, fr}` | `labelStrings` combines them for captions. |
| `sources`, `notes`, `alts` | `[]` | Arrays of `{en, fr}` Markdown strings. |
| `content` | – | Shape depends on the subclass. |
| `state._unlocked` | `false` | Editor lock state. **Serialized** under `state._unlocked` when true. |

Other `state` keys (`isEditingSourceCode`, `isEditingMeta`, `isPreviewing`, `sequence`, `prefix`, `canMoveUp`, `canMoveDown`) exist only at runtime.

### Anchors

```
slice.anchor = `${prefix ? prefix + "-" : ""}${type}-${sequence}`
// e.g. "table-12", or "doc2-table-12" with a prefix
```

Anchors depend on **position**, so they change when slices are moved. Links that need to stay stable should not rely on them.

### Serialization (`toArray()`)

`Slice.toArray()` builds a plain object, then:

1. removes keys whose value equals a default (`presentation: null`, `readonly: false`, `display_label: true`, `print_only: false`),
2. drops `null` values (empty `sources`/`notes`/`alts` and empty `referenced_as`),
3. adds `state: { _unlocked: true }` when the slice is unlocked.

Subclasses call `super.toArray()` and then add or override their own keys.

`PBOMLDocument.serialize()` dumps the main document plus `otherDocuments` with `yaml.dump()`, joined by `---\n`. The main document is rebuilt from the model, so **unknown top-level keys of the main document are lost**, except inside `document.user_data`.

## Annotations

`src/models/Annotation.js`

| Field | Default | Notes |
|:-|:-|:-|
| `id` | – | Referenced from Markdown as `[^id]`. |
| `content_type` | `markdown` | `markdown` or `bibtex`. |
| `content` | `{en, fr}` | Markdown, or a BibTeX entry. |
| `state._unlocked` | `false` | Serialized when true. |

- `annotationAnchor` → `[prefix_]antn_{id}`; the anchor of each reference is `ref_{annotationAnchor}_{n}`.
- Markdown annotations are rendered with `MarkdownDriver`, with URL linkification turned on.
- BibTeX annotations are rendered asynchronously by `AnnotationBibtex` using **citation-js**, in APA style with `en-CA` / `fr-CA` locale. If parsing fails, the raw content is shown in red monospace.

See also: [Rendering pipeline → Annotations](./EN:-Dev-Rendering-Pipeline#annotations).

## Round-trip guarantees (and gaps)

The editor relies on `toArray()` → `provisionSliceFromPayload()` round trips (for example in `duplicateSlice`). Known gaps:

- **Chart slices**: `ChartSlice.toArray()` puts the `DataTable` **instance** in the output instead of `datatable.toArray()`. `js-yaml` then dumps all of its own properties, including runtime ones (`state.caption`, each variable's `key`, default values). See [Chart Slice (developer)](./EN:-Dev-Chart-Slice#known-quirks-and-limitations).
- **Main document keys** other than `pboml`, `document`, `slices` and `annotations` are dropped.
- **Unknown `document.*` keys** are dropped (only `id`, `release_date`, `title`, `type`, `copyright` and `user_data` are kept). For example, `document.form` in the test samples does not survive a round trip.
- `type` in `document` is always serialized as `{en, fr}`, even if it was missing.
