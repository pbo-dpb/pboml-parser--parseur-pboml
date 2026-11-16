# Editor Architecture

How the visual editor (`<pboml-parser edit="true">`) is put together, and how it changes a `PBOMLDocument`.

***
🌐  English • [Français](./FR:-Dev-Editor-Architecture) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## Guiding principle: edit the model directly

The editor has **no separate store** and keeps no copy of the document. Every editor component receives model instances (`PBOMLDocument`, `Slice`, `DataTable`, …) as props and **changes them directly**. Vue's deep reactivity then:

- re-renders the editor and the slice previews, and
- triggers the deep watcher in `Editor.vue`, which dispatches `pboml-editor-document-updated` with `pbomlDocument.serialize()` as its detail.

**Host pages persist the document by listening to that event.** (The in-editor *Download* button in `EditorPreviews.vue` is currently commented out.)

Slice editors still use `update:*` events in some places (`update:modelValue`, `update:datatable`). The handler, defined in the slice model's `_buildEditorInputVnodes()`, simply assigns the value back to the model.

## Startup

```
App.ce.vue
 ├─ payload present? → PBOMLDocument → <Editor>
 └─ no payload       → <FilePicker>
                          ├─ "new from scratch" → new PBOMLDocument([{ pboml: { version: "1.0.0" } }])
                          └─ FilePickerInput: .yaml file, or PDF with PBOML in its Subject metadata (pdf-lib)
```

`Editor.vue` and `FilePicker.vue` are loaded with `defineAsyncComponent`, so renderer-only pages never download editor code.

## Layout

```
Editor.vue
 ├─ "unlocked content" warning banner (if any slice/annotation has state._unlocked)
 ├─ tabs: Content | Meta | Advanced                     + EditorPreviews (preview / enhanced preview)
 ├─ Content → EditorMainContent.js
 │    ├─ tabs: Slices | Annotations • Structure        + TOC toggle
 │    ├─ Slices      → EditorSlices.js
 │    │                 SliceStager (+)  → SliceEditor  → SliceStager (+) → SliceEditor …
 │    ├─ Annotations → AnnotationsEditor.js → AnnotationEditor.js
 │    └─ Structure   → StructureEditor.js → StructureTree + StructureImporter
 ├─ Meta     → DocumentMetaEditor.js (title, id)
 └─ Advanced → EditorAdvanced.vue → YamlEditor.vue ("Commit changes")
```

## Slice editing lifecycle

### 1. Creating a slice – `SliceStager.vue`

The ⊕ button between slices opens a `<dialog>` with one button per slice type. On click:

1. "Advanced" types (**Bitmap, LaTeX, HTML**) ask for confirmation first (`advanced_slice_warning`).
2. `new SliceClass({})` is created with `id = crypto.randomUUID()` and `state._unlocked = true`.
3. Bitmap, SVG, Table, HTML and Chart slices get `presentation = "figure"`.
4. `new` is emitted, and `EditorSlices` calls `pbomlDocument.addSlice(slice, index)`.

### 2. The frame – `editors/SliceEditor.js`

Every slice in the editor goes through `slice.renderEditingVnode()`, which wraps it in `SliceEditor`. Its rendering depends on `state`:

| State | Rendering |
|:-|:-|
| `_unlocked === false` | A read-only, scaled-down **EN \| FR preview**, made inert. Only the lock toggle on the left is active. |
| `_unlocked === true` | A `<fieldset>` with a toolbar (delete, duplicate, move ↑↓, source code, preview, metadata) and one of the three contexts below. |

| Context (mutually exclusive) | Component |
|:-|:-|
| `isPreviewing = "en" \| "fr"` | `Renderer.methods.renderSliceAsVnode(slice, lang)` |
| `isEditingSourceCode` | `SliceSourceCodeEditor.vue` – YAML textarea of `slice.toArray()` |
| default | `slice.__buildEditorsVnode()` – the form |

`resetSliceState()` clears all three flags before switching to another context.

### 3. The form – `Slice.__buildEditorsVnode()`

The form is built by the **model**, not by the editor component:

```
SlicePresentationEditor   (presentation: none | figure | aside | aside-2)
SliceReferenceEditor      (referenced_as)
SliceLabelEditor          (label)
SliceIdEditor             (id)
choices ? ChoiceRenderer : this._buildEditorInputVnodes()   ← type-specific editor
SliceMetasEditor          (alts, sources, notes)
```

The first four only show their inputs when `state.isEditingMeta` is true (the "metadata" toolbar button). Each subclass overrides `_buildEditorInputVnodes()` to add its own editor from `src/editors/`. `HeadingSlice` overrides `__buildEditorsVnode()` completely, because headings have no label, presentation or metas.

### 4. Read-only slices

Every type-specific editor checks `slice.readonly` first. If it is true, the editor shows the "read-only slice" message and an EN/FR preview instead of inputs.

### 5. Locking (`LockStateToggler`)

`state._unlocked` is a **workflow flag**. It is saved in the YAML so that unfinished slices stay visibly "open" from one session to the next. `Editor.vue` shows a warning banner while anything is unlocked. Annotations have the same flag.

### 6. Source code editing – `SliceSourceCodeEditor.vue`

It shows `yaml.dump(slice.toArray())`, validates the YAML while you type, warns if `type` changes, and on *Apply* runs:

```js
Object.assign(props.slice, yaml.load(code.value));
```

> ⚠️ This is a **shallow assign onto the existing instance**. Nested models are **not** rebuilt. For example, editing a table's `variables`/`content` here only sets plain properties on the slice. The slice's `datatable` (which the renderer and `toArray()` actually use) does not change, so those edits are lost. For data-heavy slices, prefer *Advanced → Code* (which re-parses the whole document) or the dedicated editors.

## Document-level editing

### Advanced → Code (`EditorAdvanced.vue` + `YamlEditor.vue`)

Shows the full serialized document in a textarea and validates it with `yaml.loadAll` while you type. *Commit changes* runs `PBOMLDocument.initFromYaml()` and replaces `this.$root.pbomlDocument`. This is the safest way to make structural changes by hand.

### Structure importer (`StructureImporter.vue`)

It bootstraps a document's **skeleton** from an existing EN and FR source (Markdown pasted in, or a `.docx` file converted with **mammoth** → HTML → `HtmlMarkdownConverter`/Turndown):

| Markdown token | Result |
|:-|:-|
| `heading` | `HeadingSlice` with `level = depth - 1` and its text |
| `paragraph` (consecutive ones merged) | Empty `MarkdownSlice` |
| `table` | Empty `TableSlice`, presentation `figure` |
| `image` | Empty `SvgSlice`, presentation `figure` |
| level-0 heading titled exactly `Notes` | Everything after it is read as annotations (`list_item`, id taken from the leading `N.`, Word's `[↑]` back-link removed) |

EN and FR structures are matched **by position**. A type or heading-level mismatch is flagged (`state._structureImporterError`). When both languages match, heading texts are merged and the heading is locked. Everything else is created **unlocked**, so authors can see what still needs content. The new slices and annotations are **appended** to the document.

For Word files, `StructureImporterDocxPicker.vue` also removes everything before the "Highlights / Faits saillants" H1 of PBO report templates.

### Annotations editor

`AnnotationsEditor.js` inserts new (unlocked) annotations at a given position. A **"keep organized"** toggle renumbers ids sequentially (`id = i + 1`) and makes ids read-only. It is turned on automatically when the existing ids are already consecutive integers. Remember that Markdown references (`[^id]`) are **not** rewritten when ids change. `AnnotationEditor.js` edits one annotation (EN/FR content, `content_type`), with the same lock pattern as slices.

## Previews

- **Preview** (`EditorPreviews.vue`) – a full-screen `<dialog>` with the read-only `Renderer`, with EN/FR tabs.
- **Enhanced preview** – opens a pop-up window, loads the component script from `window.pbomlParserScriptUrl`, and adds two `<pboml-parser>` elements (EN, FR) side by side. It updates their `payload` attribute (base64) as the document changes.

## Reusable inputs (`components/Editor/Inputs/`)

| Component | Purpose |
|:-|:-|
| `BilingualInput.vue` | EN + FR text fields bound to an `{en, fr}` object (optional `inputSize: "lg"` for textareas). |
| `MarkdownTextarea.vue` / `MarkdownInput.vue` | Markdown text input (with a paste-as-plain-text helper). |
| `BigRadioInput.vue`, `RadioInput.vue`, `SelectInput.vue`, `CheckboxInput.vue`, `NumberInput.vue`, `SingleInput.vue` | Generic form controls. |
| `BibtexTextarea.vue` | BibTeX input for annotations. |
| `ChoiceRenderer.js` | Renders `slice.choices` as a radio group of live previews. Selecting one copies its keys onto the slice. |

## Localization of the editor

The editor interface uses **`document.documentElement.lang`** (the host page's language) and `src/editor-strings.js`. It does **not** use the component's `language` prop. Authors always edit both languages side by side.

## Known quirks

- `LockStateToggler` builds its id as `` `toggle-lock-` - crypto.randomUUID() `` (subtraction, not concatenation), so the id is always `NaN`.
- `PBOMLDocument.duplicateSlice()` always appends the copy at the **end** of the document, not right after the original.
- `EditorAdvanced.handleSave()` replaces `this.$root.pbomlDocument`. Inside a custom element, `$root` is the `App.ce.vue` instance. This works today but depends on that component structure.
