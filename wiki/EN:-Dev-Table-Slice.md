# Table Slice — Developer Reference

> Author-facing reference: [Table Slice](./EN:-Table-Slice)

***
🌐  English • [Français](./FR:-Dev-Table-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `table` |
| Model | `src/models/contents/TableSlice.js` → `DataTable/DataTable.js`, `DataTableVariable.js`, `DataTableEntry.js`, `DataTableEntryGroup.js` |
| HTML renderer | `src/Renderers/Html/TableSliceHtmlRenderer.js` (delegates to `DataTable.renderReadonlyVnode()`) |
| Editor | `src/editors/TableSliceEditor.js` → `components/Editor/DataTableEditor/*` |
| In the slice stager | Yes (default presentation `figure`) |
| Shares its data model with | [Chart slice](./EN:-Dev-Chart-Slice) (`datatable` charts) |

## The key idea: a transposed table

`DataTable` is a **variable-oriented** model:

- `variables` is an **ordered map** `key → variable definition`. **Each variable becomes one row** of the rendered HTML table.
- `content` is an **array of entries**. Each entry is an object `{ variableKey: value, … }` and **becomes one column**.
- `entrygroups` groups consecutive **entries (columns)** under a shared header with `colspan`.

```yaml
- type: table
  presentation: figure
  label: { en: Vehicle prices, fr: Prix des véhicules }
  presentation_style: accounting      # table-wide default: prose | accounting
  entrygroups:                        # optional super-header over entries
    - { label: { en: "2022", fr: "2022" }, span: 2 }
    - { label: { en: "2026", fr: "2026" }, span: 2 }
  variables:
    vehicle:                          # ← row 1 (descriptive → in <thead>)
      label: { en: Cars, fr: Voitures }
      is_descriptive: true
    price:                            # ← row 2
      label: { en: Price, fr: Prix }
      type: number
      unit: { en: "$", fr: "$" }
  content:                            # ← one object per column
    - { vehicle: { en: BEV, fr: VÉB }, price: 52000 }
    - { vehicle: { en: ICE, fr: VMC }, price: 38000 }
    - { vehicle: { en: BEV, fr: VÉB }, price: 47000, emphasize: true }
    - { vehicle: { en: ICE, fr: VMC }, price: 40000 }
```

> 📝 The author-facing page describes each `content` object as "a row" and `group` as a multi-level **header**. In the HTML the code actually produces, entries are **columns**, and `group` creates a **row group** (a left-hand cell with `rowspan`). Keep this in mind when you compare the two pages or update the author page.

For a table slice, the `DataTable` fields sit **directly on the slice** (`variables`, `content`, `presentation_style`, `entrygroups`). A chart slice puts them under a `datatable:` key.

```js
// TableSlice constructor
this.datatable = new DataTable(payload);              // reads payload.variables, payload.content, …
this.datatable.state.caption = this.labelStrings;     // used for the screen-reader <caption>
```

## Model reference

### `DataTable`

| Field | Default | Notes |
|:-|:-|:-|
| `variables` | `{}` | `DataTableVariable` instances, keyed. Insertion order = row order. |
| `content` | `[]` | `DataTableEntry` instances. Non-iterable values are ignored. |
| `entrygroups` | `[]` | `DataTableEntryGroup` instances. |
| `presentation_style` | `prose` | `prose` (centred cells) or `accounting` (tabular, slashed zero, right-aligned). |
| `state.caption` | `null` | Runtime only. |

Useful helpers: `descriptiveVariableKeyPair` / `descriptiveVariableKey` (the **first** variable with `is_descriptive`), `groupsMapForLanguage()`, `getWholeTableUnitForLanguage()` (returns the only unit when all non-descriptive variables share one), `deleteVariableWithKey()`.

### `DataTableVariable` (one per row)

| Field | Default | Effect |
|:-|:-|:-|
| `label` | – | Row header (Markdown). |
| `type` | `markdown` | `markdown` (value is `{en, fr}` or a string), `number` (formatted with `Intl.NumberFormat(lang)`), `separator` (full-width divider row, no cells). Other values: shown as-is. |
| `is_descriptive` | – | Cells become `<th>`. The **first block of consecutive** descriptive variables goes into `<thead>`. |
| `group` | `null` | `{en, fr}`. Consecutive variables with the same group get a merged row-group cell. The group column only appears when there is more than one group. |
| `unit` | `null` | `{en, fr}`. Shown in the row header, or above the table if it is the only unit used in the table. |
| `emphasize` | `false` | Highlights the whole row. |
| `presentation_style` | `inherit` | `inherit` / `prose` / `accounting`; `inherit` uses the table's value. |
| `level` | `0` | Indentation (↳ icon plus a screen-reader message); visual styles exist for 1 to 4. |
| `readonly` | – | Passed through. |
| `skip_chart`, `chart_type`, `tension` | `false`, `bar`, `0` | Chart-only; see [Chart slice](./EN:-Dev-Chart-Slice). |

`DataTableVariable.generateUniqueDataTableVariableId(label, others, group)` builds a key from `group + label` (lowercase, only `[_a-z0-9]`) and adds random letters at the front until the key starts with a letter, is unique, and does not clash with an entry property (`emphasize`, `tension`, `skip_chart`).

### `DataTableEntry` (one per column)

Every key of the payload is copied onto the instance (the variable values). It also has three **reserved** formatting properties: `emphasize` (highlight the column), `skip_chart` and `tension`. Defaults are removed on `toArray()`.

> Because entry properties and variable keys share the same object, a variable must never be named `emphasize`, `skip_chart` or `tension`.

### `DataTableEntryGroup`

`{ label: {en, fr}, span: int = 1 }`. Groups are laid out left to right. The sum of the spans should equal `content.length`, but this is **not validated**.

## Rendering (`DataTable.renderReadonlyVnode`)

```
[unit line]         (aria-hidden, only when the whole table has one unit)
<div overflow-x-auto>
  <table table-fixed>
    <caption sr-only>   label strings + unit
    <colgroup>          only when entrygroups exist
    <thead>
      [entry-group super row]
      one <tr> per variable in the first descriptive block
    <tbody> per variable group
      <tr> [group <th rowspan>] <th variable header> <td|th per entry> …
```

- Empty cells (`null`/`undefined`, `NaN`, empty string) render an `sr-only` "Blank cell" label on a grey background.
- On large screens (`window.innerWidth >= 1024`, **checked once when the module loads**) column widths are set: the header column gets 1/3 (or 1/6 with groups), and the entries share the remaining 2/3.
- Row headers are `sticky` so they stay visible when the table scrolls horizontally.
- `TableSliceHtmlRenderer.renderAsVnode()` adds `break-inside-avoid-page` to the wrapper for printing.

## Editing (`DataTableEditor`)

`TableSliceEditor` mounts `DataTableEditor`, which has four tabs:

| Tab | Component | What it does |
|:-|:-|:-|
| Visual | `DataTableVisualEditor.js` | Spreadsheet-like grid: edit cells, add/delete entries (columns), toggle the entry's `emphasize` (and `skip_chart` for charts). |
| Variables | `DataTableVariablesEditor.vue` → `DataTableVariableEditor.js` | Add, remove and reorder variables; edit `type`, `presentation_style`, `label`, `group`, `unit`, `emphasize`, `is_descriptive`, `level` (and `chart_type`, `tension`, `skip_chart` when `showChartProperties`). |
| Display | `DataTableDisplayEditor/*.vue` | Sub-tabs *General* (table `presentation_style`), *Variables* (per-variable display) and *Data* (entry groups). |
| Import | `DataTableImporter.js` | Paste Markdown/HTML tables (EN and FR) and build a `DataTable`. |

### Importer details

- The input is parsed to HTML with `MarkdownDriver.parseGenericMarkdown()`. Then each `<td>/<th>` is converted back to Markdown with Turndown, so **formatting such as bold is kept** in the cell.
- *Variables on first row / first column* decides the orientation. The first row (or column) becomes `is_descriptive`.
- *Use line break for group name*: a header cell `Group\nLabel` is split into `group` + `label`.
- *Merge* (the default when the table already has variables) runs `lodash.merge(existing.toArray(), imported.toArray())`. Otherwise the imported table replaces the existing one.
- Imported values are **always text** (`markdown` type). Numbers, dashes and decimal places are kept exactly as written (`tests/components/Editor/DataTableEditor/DataTableImporter.test.js`).
- On *Import*, `update:datatable` is emitted and `TableSlice` assigns the new `DataTable`.

## Serialization

`TableSlice.toArray()` = `super.toArray()` + `variables`, `content`, `presentation_style`, `entrygroups` from `datatable.toArray()`. Defaults (`presentation_style: prose`, empty `entrygroups`, variable defaults, empty `{en:"", fr:""}` objects) are removed.

## Known quirks and limitations

- **Source code editing does not update the data**: `SliceSourceCodeEditor` runs `Object.assign` on the slice, but rendering and serialization read `slice.datatable`, which is not rebuilt. Use *Advanced → Code* or the DataTable editor instead.
- `isLg` is computed when the module is first imported, so resizing the window or rotating a tablet does not change column widths until the page reloads.
- In `DataTableVariable.getTableCellVnode()`, empty cells check `this.shouldEmphasizeCell` (which is never defined) instead of the local `shouldEmphasizeCell`. As a result, empty cells in emphasized rows or columns never get the darker grey.
- Only the **first** `is_descriptive` variable is used by `descriptiveVariableKeyPair` (charts' x axis). For `<thead>`, only the first block of consecutive descriptive variables is used; descriptive variables further down stay in `<tbody>`.
- `entrygroups` spans are not checked against the number of entries.
- Variable keys are object keys: renaming a variable means rewriting every entry.
