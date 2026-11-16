# Table Slice

The table slice is used to display structured data in a tabular format within a PBOML document. It is ideal for presenting information that requires rows and columns, and supports advanced features such as grouped columns and row separators.

|Version added|1.0.0|
|:-:|:-:|

The table slice is used to display a data table in the `pboml` document.

## List of fields

In a `pboml` document, the table slice is represented using many fields.
Many of those fields are included already in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice). However, there are fields that are specific to the table slice.

### List of fields unique to the table slice

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|Must be set to `table`|
|`variables`|Variables objects|Required|Contains all the variables of the table and their relevant information (defines the structure of the table)|
|`content`|YAML array|Required|Contains variable objects with their associated values (the data of the table)|
|`entrygroups`|YAML array|Optional|Defines column groupings for multi-level headers (e.g., years spanning multiple columns)|

### Example - Rendered data table

The following example demonstrates a table with grouped columns, a separator row, and a variety of variable types, including a separator variable. This example matches the YAML and HTML below:

<figure style="margin: 1em 0;">
  <figcaption style="font-weight: 300; text-align: center; font-size: 1.2em; margin-bottom: 0.5em;">
    <span style="font-weight: 400;">Table 1 –</span>
    <span>Vehicle prices and ownership cost in the baseline scenario, 2022 Canadian dollars</span>
  </figcaption>
  <div style="overflow-x: auto;">
    <table style="border-collapse: collapse; min-width: 600px; width: 100%; background: #fff;">
      <caption style="display: none;">Table 1, Vehicle prices and ownership cost in the baseline scenario, 2022 Canadian dollars</caption>
      <colgroup>
        <col>
        <col span="2">
        <col span="2">
        <col span="2">
      </colgroup>
      <thead>
        <tr>
          <th></th>
          <th colspan="2" style="border-bottom: 3px solid #d1d5db; color: #334155;">2022</th>
          <th colspan="2" style="border-bottom: 3px solid #94a3b8; color: #334155;">2026</th>
          <th colspan="2" style="border-bottom: 3px solid #d1d5db; color: #334155;">2030</th>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Cars</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">BEV</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">ICE</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">BEV</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">ICE</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">BEV</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">ICE</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Purchase price</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">56,850</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">46,220</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">61,520</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">54,800</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">65,140</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">61,610</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Incentives</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">7,425</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">480</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Annual operating cost</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">797</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">3,138</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">878</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">2,577</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">960</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">2,625</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Total 8-year discounted ownership cost</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>55,700</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>66,080</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>67,830</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>73,580</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>72,140</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>80,140</strong></td>
        </tr>
        <tr>
          <td colspan="7" style="background: #f1f5f9; height: 8px; border: none;"></td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">SUVs, minivans and trucks</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">BEV</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">ICE</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">BEV</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">ICE</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">BEV</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">ICE</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Purchase price</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">73,400</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">57,220</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">75,500</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">64,010</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">76,320</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">69,720</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Incentives</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">7,425</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">480</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Annual operating cost</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">1,349</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">4,675</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">1,493</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">3,847</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">1,639</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">3,914</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Total 8-year discounted ownership cost</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>76,640</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>86,710</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>86,580</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>92,030</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>88,270</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>97,390</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div style="margin-top: 1em;">
    <div style="font-size: 0.95em; border-left: 3px solid #e5e7eb; padding-left: 0.7em; margin-bottom: 0.5em;">
      <strong>Source:</strong> Office of the Parliamentary Budget Officer.
    </div>
    <div style="font-size: 0.95em; border-left: 3px solid #e5e7eb; padding-left: 0.7em;">
      <strong>Note:</strong> Purchase prices are based on manufacturing cost differentials, home charging equipment and include sales taxes. They do not include differences in margins. Incentives include federal and provincial ZEV subsidies weighted by their national ZEV share. Annual operating costs include energy use, efficiency, gas and electricity prices, kilometers driven and maintenance. They do not include differences in depreciation. Future operating costs are discounted at a 3 per cent rate. ICE costs are based on gasoline-powered vehicles.
    </div>
  </div>
</figure>


```yaml
  - type: table
    presentation: figure
    referenced_as:
      en: 'Table 1 '
      fr: Tableau 1
    label:
      en: >-
        Vehicle prices and ownership cost in the baseline scenario, 2022
        Canadian dollars
      fr: >-
        Prix et coûts de possession d’un véhicule selon le scénario de
        référence, en dollars canadiens de 2022
    sources:
      - en: Office of the Parliamentary Budget Officer.
        fr: Bureau du directeur parlementaire du budget.
    notes:
      - en: >-
          Purchase prices are based on manufacturing cost differentials, home
          charging equipment and include sales taxes. They do not include
          differences in margins. Incentives include federal and provincial ZEV
          subsidies weighted by their national ZEV share. Annual operating costs
          include energy use, efficiency, gas and electricity prices, kilometers
          driven and maintenance. They do not include differences in
          depreciation. Future operating costs are discounted at a 3 per cent
          rate. ICE costs are based on gasoline-powered vehicles.
        fr: "Les prix d’achat sont basés sur les écarts de coûts de fabrication et les équipements de recharge à domicile; ils comprennent également les taxes de vente, mais ils ne tiennent pas compte des différences de marges. Les incitatifs financiers comprennent les subventions fédérales et provinciales pour les VZE pondérées en fonction de leur part nationale des VZE. Les coûts d’utilisation annuels comprennent la consommation d’énergie, l’efficacité énergétique, le prix de l’essence et de l’électricité, les kilomètres parcourus et l’entretien. Ils ne tiennent pas compte des différences d’amortissement. Les coûts d’utilisation futurs sont actualisés à un taux de 3\_% . Les coûts des VCI sont basés sur les véhicules à essence."
    content:
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 56850
        incentives:
          en: 7,425
          fr: "7\_425"
        annualoperatingcost: 797
        total8yeardiscountedownershipcost:
          en: '**55,700**'
          fr: "**55\_700**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 73400
        nrincentives:
          en: 7,425
          fr: "7\_425"
        nssannualoperatingcost: 1349
        npektotal8yeardiscountedownershipcost:
          en: '**76,640**'
          fr: "**76\_640**"
      - cars:
          en: ICE
          fr: Combustion interne
        purchaseprice: 46220
        incentives:
          en: \-
          fr: \-
        annualoperatingcost: 3138
        total8yeardiscountedownershipcost:
          en: '**66,080**'
          fr: "**66\_080**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: ICE
          fr: Combustion interne
        iepurchaseprice: 57220
        nrincentives:
          en: \-
          fr: \-
        nssannualoperatingcost: 4675
        npektotal8yeardiscountedownershipcost:
          en: '**86,710**'
          fr: '**86 710**'
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 61520
        incentives:
          en: '480'
          fr: '480'
        annualoperatingcost: 878
        total8yeardiscountedownershipcost:
          en: '**67,830**'
          fr: "**67\_830**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 75500
        nrincentives:
          en: '480'
          fr: '480'
        nssannualoperatingcost: 1493
        npektotal8yeardiscountedownershipcost:
          en: '**86,580**'
          fr: "**86\_580**"
      - cars:
          en: ICE
          fr: Combustion interne
        purchaseprice: 54800
        incentives:
          en: \-
          fr: \-
        annualoperatingcost: 2577
        total8yeardiscountedownershipcost:
          en: '**73,580**'
          fr: "**73\_580**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: ICE
          fr: Combustion interne
        iepurchaseprice: 64010
        nrincentives:
          en: \-
          fr: \-
        nssannualoperatingcost: 3847
        npektotal8yeardiscountedownershipcost:
          en: '**92,030**'
          fr: "**92\_030**"
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 65140
        incentives:
          en: \-
          fr: \-
        annualoperatingcost: 960
        total8yeardiscountedownershipcost:
          en: '**72,140**'
          fr: "**72\_140**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 76320
        nrincentives:
          en: \-
          fr: \-
        nssannualoperatingcost: 1639
        npektotal8yeardiscountedownershipcost:
          en: '**88,270**'
          fr: "**88\_270**"
      - cars:
          en: ICE
          fr: Combustion interne
        purchaseprice: 61610
        incentives:
          en: \-
          fr: \-
        annualoperatingcost: 2625
        total8yeardiscountedownershipcost:
          en: '**80,140**'
          fr: "**80\_140**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: ICE
          fr: Combustion interne
        iepurchaseprice: 69720
        nrincentives:
          en: \-
          fr: \-
        nssannualoperatingcost: 3914
        npektotal8yeardiscountedownershipcost:
          en: '**97,390**'
          fr: "**97\_390**"
    variables:
      cars:
        label:
          en: Cars
          fr: Voitures
        is_descriptive: true
      purchaseprice:
        label:
          en: Purchase price
          fr: Prix d’achat
        type: number
      incentives:
        label:
          en: Incentives
          fr: Incitatifs financiers
      annualoperatingcost:
        label:
          en: Annual operating cost
          fr: Coûts d’utilisation annuels
        type: number
      total8yeardiscountedownershipcost:
        label:
          en: Total 8-year discounted ownership cost
          fr: "Coût total de possession actualisé sur 8\_ans"
      rszy:
        type: separator
      suvsminivansandtrucks:
        label:
          en: SUVs, minivans and trucks
          fr: VUS, minifourgonnettes et camions
      iepurchaseprice:
        label:
          en: Purchase price
          fr: Prix d’achat
        type: number
      nrincentives:
        label:
          en: Incentives
          fr: Incitatifs financiers
      nssannualoperatingcost:
        label:
          en: Annual operating cost
          fr: Coûts d’utilisation annuels
        type: number
      npektotal8yeardiscountedownershipcost:
        label:
          en: Total 8-year discounted ownership cost
          fr: "Coût total de possession actualisé sur 8\_ans"
    entrygroups:
      - label:
          en: '2022'
          fr: '2022'
        span: 2
      - label:
          en: '2026'
          fr: '2026'
        span: 2
      - label:
          en: '2030'
          fr: '2030'
        span: 2
```


## Detailed Field description

### `variables`

The `variables` object defines the structure of the table. Each variable is keyed by a unique `key` that is referenced in the `content` objects. Variables can represent data columns, descriptive columns, or special types such as separators.

#### List of valid fields for a variable object

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`label`|Localised String Object|Required for data variables|Describes the variable to the user|
|`group`|Localised String Object|Optional|Groups variables for multi-level headers|
|`units`|Localised String Object|Optional|Custom unit of the values that are represented by the variable|
|`type`|String|Optional|Type of value (`number`, `markdown`, or `separator`)|
|`emphasize`|Boolean|Optional|Highlights the values of the variable|
|`is_descriptive`|Boolean|Optional|Indicates that the variable is descriptive (renders as a `<th>` cell)|

A variable is structured as such:

```yaml
      {variable_key}:
        label:
          en: {label_in_english}
          fr: {label_in_french}
        group:
          en: {group_name}
          fr: {group_name}
        unit:
          en: {units_used}
          fr: {units_used}
        type: {number | markdown | separator}
        emphasize: {true | false}
        is_descriptive: {true | false}
```

#### `separator` variable type

A variable with `type: separator` is used to insert a visual separator row in the table. The value for this variable in the `content` array should be an empty string or omitted. When rendered, this creates a row with a background or spacing, spanning all columns, to visually separate sections of the table.

#### `label`

The `label` field is required for data variables and is a [Localized String Object](./EN:-Anatomy-of-a-PBOML-document#note-on-localized-string-object).

#### `group`

The `group` field is optional and is used to group variables for multi-level headers. Variables with the same `group` value will be grouped together in the table header.

#### `unit`

The `unit` field is optional and describes the unit for the variable's values. Units are displayed either above the table or under each variable's label, depending on usage.

#### `type`

The `type` field describes the type of value for the variable. Supported types are:
- `number`: Numeric values
- `markdown`: Markdown-formatted text
- `separator`: Used for visual row separation (see above)

#### `emphasize`

If set to `true`, the renderer will emphasize the variable and its values (e.g., bold or highlighted row).

#### `is_descriptive`

If set to `true`, the renderer will render the content of that variable as a `<th />` cell (typically the first column).

### `content`

The `content` array contains the data for the table. Each object in the array represents a row, with keys matching the variable keys defined in `variables`. Separator rows are created by including a variable of type `separator` with an empty value.

Example:

```yaml
    content:
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 56850
        incentives:
          en: 7,425
          fr: "7\_425"
        annualoperatingcost: 797
        total8yeardiscountedownershipcost:
          en: '**55,700**'
          fr: "**55\_700**"
        rszy: ''  # Separator row
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 73400
        nrincentives:
          en: 7,425
          fr: "7\_425"
        nssannualoperatingcost: 1349
        npektotal8yeardiscountedownershipcost:
          en: '**76,640**'
          fr: "**76\_640**"
      # ...more rows...
```

### `entrygroups`

The `entrygroups` array defines column groupings for multi-level headers. Each group specifies a label and a span (number of columns it covers). This is used to create headers like years spanning multiple columns.

Example:

```yaml
    entrygroups:
      - label:
          en: '2022'
          fr: '2022'
        span: 2
      - label:
          en: '2026'
          fr: '2026'
        span: 2
      - label:
          en: '2030'
          fr: '2030'
        span: 2
```
