# Chart Slice — Developer Reference

> Author-facing reference: [Chart Slice](./EN:-Chart-Slice)

---

🌐 English • [Français](./FR:-Dev-Chart-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)

---

## At a glance

|                     |                                                                                                                                         |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| YAML `type`         | `chart`                                                                                                                                 |
| Model               | `src/models/contents/ChartSlice.js` + `DataTable/*` **or** `ArrayTable/ArrayTable.js`                                                   |
| HTML renderer       | `src/Renderers/Html/ChartSliceHtmlRenderer.js`                                                                                          |
| Chart.js wrappers   | `src/components/Grapher/DataTableGrapher.js`, `ArrayTableGrapher.js`, `ArrayTableDataSource.js`, `ChartJsMixin.js`, `ColourPalettes.js` |
| Editor              | `src/editors/ChartSliceEditor.js` → `DataTableEditor` (with `showChartProperties: true`)                                                |
| In the slice stager | Yes (default presentation `figure`)                                                                                                     |
| Library             | `chart.js/auto` (v4), `color`                                                                                                           |

## Two data back-ends

```js
// ChartSlice constructor
if (payload.arraytable) this.arraytable = new ArrayTable(payload.arraytable);
else this.datatable = new DataTable(payload.datatable);
```

|                                   | `datatable` (current)                                                                  | `arraytable` (legacy)                                                                                            |
| :-------------------------------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| Data model                        | Same `DataTable` as the [Table slice](./EN:-Dev-Table-Slice), under a `datatable:` key | 2-D array: first row = dataset names, first column = x labels                                                    |
| Localization                      | `{en, fr}` values and labels                                                           | Placeholder strings replaced from `strings.{en,fr}` (`localizeRecursively`)                                      |
| Editable in the visual editor     | ✅                                                                                     | ❌ Preview only. Edit through _Advanced → Code_ (the per-slice source editor does not rebuild the `ArrayTable`). |
| Text alternative ("Text version") | Generated table from `DataTable.renderReadonlyVnode()`                                 | `ArrayTableTable.js`                                                                                             |

> ⚠️ Note how `ArrayTable` is constructed: `ChartSlice` passes `payload.arraytable`, and `ArrayTable`'s constructor then reads `arraytable`, `axes`, `colors`, `strings` and `chart_type(s)` **from that object**. An arraytable chart therefore needs a **nested** object (`arraytable: { arraytable: [[…]], axes, strings, chart_type }`), as shown on the author-facing Chart Slice page.

## `datatable` charts (`DataTableGrapher`)

### Mapping to Chart.js

| DataTable concept                                                                                         | Chart.js                                                                                                                                                                            |
| :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First variable with `is_descriptive: true` (**required**; otherwise the config is `null` and ⚠️ is shown) | x values. Category axis if the variable `type` is `markdown`; **linear** axis with `stepSize` = smallest gap between values otherwise. The variable label becomes the x-axis title. |
| Each other variable with `skip_chart: false`                                                              | One dataset. `label` → legend.                                                                                                                                                      |
| Each entry (`content[i]`) with `skip_chart: false`                                                        | One data point per dataset (`{x, y}`).                                                                                                                                              |
| `variable.chart_type`                                                                                     | Dataset `type` (`bar`, `line`, `scatter`, …).                                                                                                                                       |
| `variable.tension`                                                                                        | `"monotone"` → `cubicInterpolationMode: "monotone"`; a number → `tension`.                                                                                                          |
| `variable.group[lang]`                                                                                    | Dataset `stack` (stacked groups).                                                                                                                                                   |
| `variable.emphasize`                                                                                      | Darker/saturated palette colour for the whole dataset.                                                                                                                              |
| `entry.emphasize`                                                                                         | That point/bar is darker; bars get a purple `#a855f7` border, points get radius 7.                                                                                                  |

Datasets get an `order` so that **scatter points are drawn above lines, and lines above bars**.

### Colours

`ChartJsMixin.colorForIndex(i, emphasize)` uses `EquidistantColorPalette` (8 colours, then `#666666`). In dark mode (`prefers-color-scheme`) colours are lightened and saturated, and the text colour switches to `#f9fafb`.

`DataTableGrapher` reads `variable.color` when it is set, but `DataTableVariable` never parses or serializes a `color` field. **Custom colours from YAML therefore have no effect today.**

### Shared Chart.js options (`ChartJsMixin`)

`animation.duration: 0`, `maintainAspectRatio: false`, `responsive: true`, legend at the bottom, `locale` = render language, canvas height `h-96 md:h-128`.

## `arraytable` charts (`ArrayTableGrapher`)

```yaml
arraytable:
    chart_type: bar # or chart_types: [bar, line, …] (one per dataset)
    axes:
        y: { label: __Salary__, style: currency, currency: CAD } # style: currency | percentage
    strings:
        en: { __Salary__: Salary, _S22_: "2022" }
        fr: { __Salary__: Salaire, _S22_: "2022" }
    arraytable:
        - [Employee, _S22_]
        - [Mike, 35000]
        - [Bob, { data: 37000, emphasize: true }]
```

- `ArrayTableDataSource` turns the array into `{labels, datasets}`. Cells can be `{data, emphasize}`; emphasized points become triangles (line) or darker bars.
- `localizeRecursively` serializes the structure to JSON and replaces every `"placeholder"` with its translation, but only when it is an **entire JSON string** (quotes included). The author page says "any substring", but a placeholder inside a longer string (for example `"Total _FY_"`) is **not** replaced.
- `colors` is parsed but not used by `ArrayTableDataSource`, which always uses `EquidistantColorPalette`.
- Axis `style: currency | percentage` formats ticks with `Intl.NumberFormat` and **divides the value by 100**.

## Rendering wrapper

`ChartSliceHtmlRenderer.renderReadonlyVnode()` mounts the grapher inside `<Suspense>` (the Chart.js chunk is loaded asynchronously). `renderAltsVnodes()` is overridden: if the author gave no `alts`, an accessible data table is created automatically and shown in the collapsible "Text version".

## Editing

`ChartSliceEditor` shows:

1. a live EN | FR preview. A deep watcher swaps it for a fixed-height placeholder for about 100 ms after each change, so Chart.js re-mounts without layout jumps;
2. `DataTableEditor` with `showChartProperties: true`. This adds `chart_type`, `tension` and `skip_chart` controls for variables and a `skip_chart` toggle for entries.

Read-only slices **and arraytable charts** only show the preview.

## Serialization

```js
toArray() {
  let array = super.toArray();
  array.datatable = this.datatable;     // ⚠️ the instance, not this.datatable.toArray()
  array.arraytable = this.arraytable;   // ⚠️ same
  return array;
}
```

## Known quirks and limitations

- **Serialization leaks runtime fields.** Because the instances themselves are put in the output, `js-yaml` dumps all of their own properties: `datatable.state` (`caption: null`), each variable's `key`, default values (`chart_type: bar`, `level: 0`, …) and `ArrayTable`'s normalized fields (`types`, `strings`). The output still loads again, but it is noisier than `TableSlice` output and can drift from the source. The fix is to call `.toArray()` (and to add a `toArray()` to `ArrayTable`).
- `variable.color` is read by the grapher but dropped by the model (see Colours).
- A chart with no `is_descriptive` variable renders only ⚠️; the error is swallowed in the computed `config`.
- For numeric x axes, `stepSize` is the smallest gap between **sorted** x values. Duplicate x values give a step of `0`.
- `ChartJsMixin` defines a module-level `unid` shared by all chart instances (it is not used for DOM ids today).
- Source-code editing has the same limits as for tables (no rebuild of `DataTable`/`ArrayTable`).
