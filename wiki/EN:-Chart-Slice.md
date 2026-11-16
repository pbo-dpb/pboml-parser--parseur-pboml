# Chart Slice

The chart slice is used to display graphical representations of data in a PBOML document. It is functionally similar to the table slice but includes enhancements for visualization.

|Version added|1.0.0|
|:-:|:-:|

## List of fields

The list of valid field are all included in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice).

### List of fields unique to the chart slice

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|Must be set to `chart`
|`datatable`|YAML object|Required only if the `arraytable` field is absent|A data structure similar to the one of a `table` slice (with enhancements)
|`arraytable`|YAML object|Required only if the `datatable` field is absent|A simple array based data structure

## Detailed Field description - `datatable`

As mentionned, the chart slice is very similar to the table slice. The `datatable` field contains the same field as in the [table slice](Link_to_vars_table).

### List of fields under `datatable`

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`variables`|YAML Object|Required|Same as the `variables` field of the [table slice](./EN:-Table-Slice#list-of-fields-unique-to-the-table-slice) but with special fields used to personalize the chart display
|`content`|YAML Object|Required|Same as the `content` field of the [table slice](./EN:-Table-Slice#list-of-fields-unique-to-the-table-slice) but with special fields used to personalize the chart display
|`state`|YAML Object||?

### `variables`

As mentionned before, the `variables` field serve the same purpose as the `variables` field of the table slice (see [Table slice - variable object](./EN:-Table-Slice#variables)). This field contains variable objects that also represent an element of the $y$ axis (the stub of the table). These two variable object share the same fields, however the variable object contained in the chart slice has additional fields that allow the renderer to personalize the type of visualisation.

#### List of additional fields for the Variable Object unique to the chart slice

>**This table extends: [Table slice - List of valid fields for a variable object](./EN:-Table-Slice#list-of-valid-fields-for-a-variable-object)**

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`is_time`|Boolean|Optional|Defines if the $y$ axis represents time; Defaults to `false`
|`emphasis`|Boolean|Optional|adds emphasis to the variable on the graph.
|`skip_chart`|Boolean|Optional|Defines if the variable is to be visualised on the chart or not. In all cases the variable will be visualised on the rendered table under the chart; Defaults to `true`
|`chart_type`|String|Required|Defines how the variable will be graphed. As of version 1.0.0, only the following values are allowed: `bar` for Bar charts; `line` for Line charts; and, `scatter` for Scatter charts.
|`tension`|String|Optional|If `tension` is set to `monotone` and the `chart_type` is set to `line`. the line will be smoothed out

#### Datatable Variable Object Structure

```yaml
        {variable_name}:
          label:
            en: {label_in_english}
            fr: {label_in_french}
          type: {number or markdown}
          display_label: {true or false}
          is_descriptive: {true or false}
          is_time: {true or false}
          emphasis: {true or false}
          skip_chart: {true or false}
          chart_type: {bar, line or scatter}
          group:
            en: {group_name}
            fr: {group_name}
          unit:
            en: {units_used}
            fr: {units_used}
          tension: {number between 0 and 1}
```

#### `is_time`

The `is_time` field is optional. It is described by a boolean. If set to `true`, the rendered will treat the $y$ as a datetime field. This field defaults to `false` if absent.

#### `emphasis`

The `emphasis` field is optional. It is described by a boolean. If set to `true`, the variable will be emphasised across the chart. If absent, this field defaults to `false`.

#### `skip_chart`

The `skip_chart` field is optional. It is described by a boolean. If set to `true`, the variable not be displayed in the chart, but will remain in the rendered table below. If absent, it defaults to false.

#### `chart_type`

The `chart_type` field is required in order to indicate to the renderer the graphing method to be used for this variable. As of version 1.0.0, only the following values are allowed: `bar` for Bar charts; `line` for Line charts; and, `scatter` for Scatter charts.

#### `tension`

The `skip_chart` field is optional. It is described by a boolean. As of version 1.0.0, the only valid value is `monotone`. This value **only works** if `chart_type` is set to `line`.

### `content`

The `content` field follows the same pattern as the `content` field of the table slice: its only once the variables have been defined in the variables field that the content can be added to `content`; the structure of a content object still relies entirely on the variable that were defined in the variables field (See [Table Slice](./EN:-Table-Slice#list-of-valid-fields-for-a-variable-object) for more examples).

The content objects represent elements of the $x$ axis. it has additional fields not found in the table slice:

#### List of additional fields for the Content Object unique to the chart slice

>**This table extends what is found in the content object structure shown [here](./EN:-Table-Slice#content)**

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`emphasis`|Boolean|Optional|Adds emphasis to the content. Defaults to `false`
|`skip_chart`|Boolean|Optional|Defines if the variable is to be visualised on the chart or not.  . In all cases the variable will be visualised on the rendered table under the chart.

## Detailed Field description - `arraytable`

### List of fields under `arraytable`

`datatable` is the preferred method for representing a chart slice, however `arraytable` field can also be used instead to represent a very simple data structures. The `arraytable` reprsents data as an array of arrays, where the first array provides the definition of the following ones.

```
[
    ["Topping", "Slices"],
    ["Mushroom", 3],
    ["Onions", 1],
    ["Olives", 1], 
    ["Zucchini", 1],
    ["Pepperoni", 2]
]
```

Localization of this table is possible through the `strings` object: any substring in the arraytable that matches a key in that object will be substituted by the value for the current rendering language.

Here's an example of an `arraytable`:

```yaml
slices:
    - type: chart
      readonly: false
      display_label: true
      presentation: figure
      referenced_as:
        en: Figure 1
        fr: Figure 1
      sources:
        -
          en: Office of the Parliamentary Budget Officer
          fr: Bureau du directeur parlementaire du budget
      label:
        en: Effective interest rate on new debt
        fr: Taux d’intérêt effectif sur les nouveaux emprunts
      arraytable:
        chart_type: line
        axes:
          y:
            label: _percents_
        arraytable: [
            [
                &quot;_FY_&quot;, 
                &quot;_historical_rate_&quot;,
                &quot;_previous_projection_&quot;, 
                &quot;_new_projection_&quot;
            ], 
            [
                &quot;2019-2020&quot;,
                1.5,  
                null, 
                null], 
            [
                &quot;2020-2021&quot;, 
                0.4,  null, null
            ], 
            [
                &quot;2021-2022&quot; ,
                1.2,  
                1.2, 
                1.2
            ], 
            [
                &quot;2022-2023&quot; , 
                null,  
                1.3, 
                3.2
            ], 
            [
                &quot;2023-2024&quot; , 
                null,  
                2.1, 
                3.6
            ], 
            [
                &quot;2024-2025&quot; , 
                null,  2.5, 3.2
            ], 
            [
                &quot;2025-2026&quot; , 
                null,  
                2.5, 
                2.8
            ], 
            [
                &quot;2026-2027&quot; , 
                null,  
                2.5, 
                2.8
            ], 
            [
                &quot;2027-2028&quot; , 
                null,  
                2.5, 
                2.8
            ]
        ]  
        strings:
          en:
            _FY_: Fiscal year
            _percents_: (percentage)
            _historical_rate_: Historical Rates
            _previous_projection_: Previous Projection  (Mar. 2022)
            _new_projection_: New Projection (Oct. 2022)
          fr:
            _FY_: Exercice financier
            _percents_: (pourcentage)
            _historical_rate_: Taux historiques
            _previous_projection_: Projection précédente (mars 2022)
            _new_projection_: Nouvelle projection (oct. 2022)
```

Documentation of this alternative data format can be found in the [ArrayTable model source code](https://github.com/pbo-dpb/pboml-parser--parseur-pboml/blob/main/src/models/contents/ArrayTable/ArrayTable.js).