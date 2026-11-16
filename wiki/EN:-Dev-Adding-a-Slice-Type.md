# Adding a New Slice Type

A checklist of every place a slice type has to be registered. Use an existing simple type (for example `MarkdownSlice` or `LaTeXSlice`) as a template.

***
🌐  English • [Français](./FR:-Dev-Adding-a-Slice-Type) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

In the steps below, `Foo` is the class prefix and `foo` the YAML type.

## 1. Model – `src/models/contents/FooSlice.js`

```js
import { h, defineAsyncComponent } from "vue";
import Slice from "./Slice";

export default class FooSlice extends Slice {
  constructor(payload) {
    super(payload);
    this.content = { en: payload.content?.en, fr: payload.content?.fr };
    this.type = "foo";                       // must match the YAML `type`
  }

  _buildEditorInputVnodes() {
    const vnodes = super._buildEditorInputVnodes();
    vnodes.push(h(defineAsyncComponent(() => import("../../editors/FooSliceEditor.js")), {
      slice: this,
      "onUpdate:modelValue": (value) => { this.content = value; },
    }));
    return vnodes;
  }

  toArray() {
    const array = super.toArray();
    array.content = { en: this.content?.en, fr: this.content?.fr };
    return array;
  }

  static rendererObjectForSliceRendererType(rendererType) {
    switch (rendererType) {
      case "html": return "FooSliceHtmlRenderer";   // = file name in src/Renderers/Html/
    }
    return super.rendererObjectForSliceRendererType(rendererType);
  }
}
```

Rules:

- **Always** call `super(payload)` and `super.toArray()`, so the common fields (label, presentation, metas, `_unlocked`…) keep working.
- Normalize localized values to `{en, fr}` in the constructor.
- Have `toArray()` return **plain data only**. Call `.toArray()` on nested models; do not put the instances themselves in the output (see the Chart slice quirk).
- Remove default values from the output so the YAML stays small (see `HtmlSlice.defaults`).

## 2. Factory – `src/models/PBOMLDocument.js`

Import the class and add a `case "foo": return new FooSlice(element);` to `provisionSliceFromPayload()`. **If you skip this, `foo` slices are silently dropped when a document is loaded.**

## 3. HTML renderer – `src/Renderers/Html/FooSliceHtmlRenderer.js`

```js
import { h } from "vue";
import SliceHtmlRenderer from "./SliceHtmlRenderer";

export default class FooSliceHtmlRenderer extends SliceHtmlRenderer {
  renderReadonlyVnode(language) {
    return h("div", { class: "pboml-prose", innerHTML: /* … */ "" });
  }
}
```

- The **file name** must match the string returned by `rendererObjectForSliceRendererType("html")`. `Renderer.js` finds it through `import.meta.glob`.
- Add the `pboml-prose` class to containers that hold Markdown output if annotation references (`[^id]`) should be linked inside them.
- Load heavy dependencies with `defineAsyncComponent` so they stay out of the main bundle (see the LaTeX and Chart renderers).
- Untrusted HTML or SVG should go through DOMPurify, ideally inside a Shadow DOM (see `components/HtmlRenderer.js`).

## 4. Editor – `src/editors/FooSliceEditor.js`

Follow the existing pattern:

```js
export default {
  props: ["slice"],
  setup(props, { emit }) {
    if (props.slice.readonly) { /* "read-only" message + EN/FR previews */ }
    return () => h(/* inputs bound to props.slice, emitting update:modelValue */);
  },
};
```

## 5. Slice stager – `src/components/Editor/SliceStager/SliceStager.vue`

- Import the model and add an entry to `buttons` (`{ label, type, advanced? }`).
- Add it to the list that defaults to `presentation = "figure"` if relevant.

## 6. Strings – `src/editor-strings.js`

Add, for **both** `en` and `fr`:

- `slice_type_foo` (label shown in the stager and in the slice frame legend)
- `slice_type_abbrev_foo` (short label; every existing type defines one, so add it for consistency)
- any editor-specific strings.

## 7. Optional integrations

| Feature | Where |
|:-|:-|
| Table of contents | `components/Toc/Toc.js` (only headings and labelled slices are listed today) |
| Structure importer | `StructureImporter.vue → walkThroughMarkdown()` |
| Print styles | `src/print.css` |

## 8. Tests and samples

- Add a sample `tests/samples/foo0.yaml`.
- Add a parse test (and a `toArray()` → re-parse round-trip test) under `tests/models/`.
- Run `pnpm run test`.

## 9. Documentation

- An author-facing page `EN:-Foo-Slice` / `FR:-Foo-Slice` (fields, examples).
- A developer page `EN:-Dev-Foo-Slice` / `FR:-Dev-Foo-Slice` (this section).
- Link both from `Home`, `FR:-Accueil`, the [Developer Guide](./EN:-Developer-Guide) table, and the `type` list in [Slice Objects](./EN:-Slice-Objects).
