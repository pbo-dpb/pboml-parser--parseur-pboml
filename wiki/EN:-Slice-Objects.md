# Slice Objects

|Version added|1.0.0|
|:-:|:-:|

`slices` is one of the root objects found in a `pboml` document (see [Anatomy-of-a-PBOML-document](./EN:-Anatomy-of-a-PBOML-document)).

The `slices` field contains an array of content objects (referenced to as slices) that will be sequentially rendered in stack. The order of each individual slice is therefore important.

## Types of slices

As of version 1.0.0, there exists **seven** different slices. Each type of slice has its own special fields, however there are certain fields that are common to all slice types. Here is a list of the different types of slices that can be found in a `pboml` document:

* `markdown`
* `heading`
* `table`
* `svg`
* `chart`
* `kvlist`
* `bitmap`

## Anatomy of a slice object

While slice objects differ from one another, certain fields are common regardless of the slice type.

### List of fields common to all types of slice

As of version 1.0.0, here is the list of common fields containing its name and its optionality:

>**The following field are found within all slices excluding the `heading` slice which only uses a subset. For further explanations see [Slice: heading](https://github.com/pbo-dpb/pboml-parser--parseur-pboml/wiki/EN:-Heading-Slice)**

> **For details on the Localized String Object see [Note on Localized String Object
](./EN:-Anatomy-of-a-PBOML-document#note-on-localized-string-object)**

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|Defines the type of slice
|`id`|String|Optional|A string used to uniquely identify a slice object|
|`presentation`|String|Optional|Defines the presentation format of the slice (either blank "", `figure` or `aside`)
|`referenced_as`|Localized String Object|Optional|Defines a slice as a string identity (i.e. `Figure 1.1`)
|`label`|Localized String Object|Optional|Contains text that will label the slice
|`display_label`|boolean|Optional|Decides if the text contained in the `label` field will be visible
|`alts`|Array of Localized String Object|Optional|Contains textual descriptions relevant to the content of the slice
|`sources`|Array of Localized String Object|Optional|Contains sources relevant to the content of the slice
|`notes`|Array of Localized String Object|Optional|Contains notes relevant to the content of the slice
|`readonly`|boolean|Optional|Decides the editability of the slice object through the `pboml` editor

#### Example - `slices` field

Within the `slices` root field, each individual slice could be listed as follows:

```yaml
pboml:
  version: 1.0.0
document:
  id: EXAMPLE-123456
  release_date: '2022-11-17T13:00:00.000Z'
  title:
    en: A Short Example Document
    fr: Un court document d'exemple
  type:
    en: PBOML Documentation Series
    fr: Série de documentation PBOML
  copyright:
    en: © Lorem Ipsum, 2022
    fr: © Lorem Ipsum, 2022
slices:
  - type: heading
    content:
      en: Title 1
      fr: Title 1
    level: 0
  - type: markdown
    readonly: false
    display_label: true
    label:
      en: Only slice of this document
      fr: Seule tranche de ce document
    content:
      en: "This is an **example**."
      fr: "Ceci est un **exemple**."
  - type: markdown
    label: {}
    sources:
      - en: ''
        fr: ''
    alts:
      - en: ''
        fr: ''
    content:
      en: >-
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      fr: >-
        tempor incididunt ut labore et dolore magna aliqua. Eleifend quam
        adipiscing vitae proin sagittis nisl rhoncus.
```

## Detailed field description

### `type`

The `type` field is where the type of slice is defined. Each type of slice has its own _supporting_ fields. However, the value you give to the `type` field defines the siblings field will be included. However, siblings **can always be any of the fields in the [common fields list](#list-of-fields-common-to-all-types-of-slice)** (see [YAML documentation](https://yaml.org/spec/1.2.2/#61-indentation-spaces) for details on the structure).

#### Supported values for the `type` field

As of version 1.0.0, `pboml` documents currently support the following values for the `type` field:

|Supported values|Description|
|:-:|:-:|
|`markdown`|Markdown slice
|`heading`|Heading slice
|`table`| Table slice
|`svg`| SVG slice
|`chart`| Chart slice
|`kvlist`| Key-Value pair slice
|`bitmap`| Bitmap slice

### `sources`

The `sources` field is optional. It can be used to define the different sources related to the content of the markdown slice. The `sources` field contains an array of Localized String Objects. Each String Objects is represented by its supported languages (see [Supported Languages](./EN:-Supported-Languages)).

#### Example - `sources` field

```yaml
  - type: markdown
    content:
        en: >-
            Lorem ipsum dolor sit amet, ad saperet consectetuer vel. Qui nemore integre te. Quo ex nostro inciderint liberavisse, et quas congue possim nec. At accumsan lobortis quaerendum ius, in nisl urbanitas reformidans qui. Mel pertinacia assueverit an, est an bonorum nominati, numquam epicuri quo ex. Te congue omnium usu. In est dolorem mentitum, ne eos lorem vocibus, per intellegam instructior ei.
        fr: >-
            Eu sed sumo detraxit. Blandit suavitate id vis, accumsan mediocrem neglegentur per et. Nam te legere vivendo forensibus, sed ut modus assentior sententiae. Facilisis intellegebat sit ei, idque repudiare persequeris qui et. Pro no periculis hendrerit incorrupte, ad iuvaret commune mea, id tempor concludaturque usu. Nam ea delicata pericula, aperiri sententiae pro id.
    sources:
      - en: >-
          Treasury Board of Canada Secretariat, Supplementary Estimates (A),
          2023-24.
        fr: >-
          Secrétariat du Conseil du Trésor du Canada, Budget supplémentaire des
          dépenses (A), 2023-2024.
      - en: >-
          Public Health Agency of Canada, Opioid- and Stimulant-related Harms in
          Canada.
        fr: >-
          Agence de la santé publique du Canada, Méfaits associés aux opioïdes
          et aux stimulants au Canada.
```

### `notes`

The `notes` field is optional. It can be used to add relevant notes related to the content of the markdown slice. The `notes` field contains an array of Localized String Objects. Each String Objects is represented in the supported languages (see [Supported Languages](./EN:-Supported-Languages)).

#### Example - `notes` field

```yaml
  - type: markdown
    content:
        en: >-
            Lorem ipsum dolor sit amet, ad saperet consectetuer vel. Qui nemore integre te. Quo ex nostro inciderint liberavisse, et quas congue possim nec. At accumsan lobortis quaerendum ius, in nisl urbanitas reformidans qui. Mel pertinacia assueverit an, est an bonorum nominati, numquam epicuri quo ex. Te congue omnium usu. In est dolorem mentitum, ne eos lorem vocibus, per intellegam instructior ei.
        fr: >-
            Eu sed sumo detraxit. Blandit suavitate id vis, accumsan mediocrem neglegentur per et. Nam te legere vivendo forensibus, sed ut modus assentior sententiae. Facilisis intellegebat sit ei, idque repudiare persequeris qui et. Pro no periculis hendrerit incorrupte, ad iuvaret commune mea, id tempor concludaturque usu. Nam ea delicata pericula, aperiri sententiae pro id.
    notes:
      - en: '*Data for 2022 is only available from January to September.'
        fr: >-
          *Pour 2022, seules les données de janvier à septembre sont
          disponibles. 
      - en: >-
          Some data at the provincial or territorial level have been suppressed
          to address concerns around releasing small numbers.
        fr: >-
          Certaines données provinciales et territoriales ont été supprimées
          pour tenir compte des préoccupations relatives à la publication de
          chiffres peu élevés.
```

### `alts`

The `alts` field is optional. It can be used to add textual descriptions related to the content of the markdown slice. The `alts` field contains an array of Localized String Objects. Each String Objects is represented in the supported languages (see [Supported Languages](./EN:-Supported-Languages)).

#### Example - `alts` field

```yaml
  - type: markdown
    content:
        en: >-
            Lorem ipsum dolor sit amet, ad saperet consectetuer vel. Qui nemore integre te. Quo ex nostro inciderint liberavisse, et quas congue possim nec. At accumsan lobortis quaerendum ius, in nisl urbanitas reformidans qui. Mel pertinacia assueverit an, est an bonorum nominati, numquam epicuri quo ex. Te congue omnium usu. In est dolorem mentitum, ne eos lorem vocibus, per intellegam instructior ei.
        fr: >-
            Eu sed sumo detraxit. Blandit suavitate id vis, accumsan mediocrem neglegentur per et. Nam te legere vivendo forensibus, sed ut modus assentior sententiae. Facilisis intellegebat sit ei, idque repudiare persequeris qui et. Pro no periculis hendrerit incorrupte, ad iuvaret commune mea, id tempor concludaturque usu. Nam ea delicata pericula, aperiri sententiae pro id.
    alts:
      - en: >
          More than half of the proposed spending in these Supplementary
          Estimates (roughly $13 billion) relates to the negotiation and
          resolution of Indigenous claims.
        fr: >-
          Le DPB est disposé à offrir des séances d’information ou à répondre à
          des questions sur tout poste figurant dans le budget des dépenses du
          gouvernement.
      - en: >
          More than half of the proposed spending in these Supplementary
          Estimates (roughly $13 billion) relates to the negotiation and
          resolution of Indigenous claims.
        fr: >-
          Le DPB est disposé à offrir des séances d’information ou à répondre à
          des questions sur tout poste figurant dans le budget des dépenses du
          gouvernement.
```

### `label`

The `label` field is optional. It can be used to add a label to a slice. The `label` field contains a Localized String Object. Each String Objects is represented in the supported languages (see [Supported Languages](./EN:-Supported-Languages)).

#### Example - `label` field

```yaml
type: markdown
display_label: true
label:
  en: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  fr: Nunc vehicula libero quis lacinia viverra
content:
  en: 
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu ligula
    fringilla, pellentesque odio ut.
  fr: 
    Praesent efficitur iaculis scelerisque. Fusce vitae risus justo. Integer
    ultricies nulla in ex blandit vestibulum.
```

### `display_label`

The `display_label` field contains a boolean that defines the visibility of the content in `label` field. The `display_label` field is optional, however if absent the default value is `true` therefore displaying the content of the label field. If set to `false`, the content won't be visible on the rendered document, however it will be present in the contents metadata.

#### Example - `display_label` field

```yaml
type: markdown
display_label: true
label:
  en: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  fr: Nunc vehicula libero quis lacinia viverra
content:
  en: 
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu ligula
    fringilla, pellentesque odio ut.
  fr: 
    Praesent efficitur iaculis scelerisque. Fusce vitae risus justo. Integer
    ultricies nulla in ex blandit vestibulum.
```

### `readonly`

The `readonly` field contains a boolean that defines the editability of the slice object through the `pboml` editor. The `readonly` field is optional, however if absent the default value is `false` thus making the slice editable. If set to `true`, the content will only be visible but not editable through the `pboml` editor.

#### Example

```yaml
type: markdown
readonly: true
display_label: true
label:
  en: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  fr: Nunc vehicula libero quis lacinia viverra
content:
  en: 
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu ligula
    fringilla, pellentesque odio ut.
  fr: 
    Praesent efficitur iaculis scelerisque. Fusce vitae risus justo. Integer
    ultricies nulla in ex blandit vestibulum.
```

### `referenced_as`

The `referenced_as` field is optional. It can be used to define a string which will define a slice. It is usually used in `svg`, `tables`. `chart` and `bitmap` slices. The `referenced_as` field contains a Localized String Object. Each String Objects is represented in the supported languages (see [Supported Languages](./EN:-Supported-Languages)).

#### Example - `referenced_as` field

```yaml
  - type: svg
    presentation: figure
    referenced_as:
      en: Summary Figure 1
      fr: Figure 1 du résumé
    content:
      en: >-
        <svg .... </svg>
      fr: >-
        <svg .... </svg>
```

### `presentation`

The `presentation` field is optional. It can be used to define how the slice relates to the main document. Practically speaking, this field determines the visual appearance of a slice and how it is inserted in the document's flow. The `presentation` field contains a String. As of version 1.0.0, there are three types of values that are supported: falsy (null, false, absent or a blank string `""`), `figure` or `aside`.

|Supported values|Description|
|:-:|:-:|
|`""`| Slice is presented inline as an integral part of the document (default)
|`figure`| Content is a figure or another type of content directly related - but separate - from the main document
|`aside`| The slice's content is only indirectly related to the document's main content - presented as a blue box by the renderer

#### Example - `presentation` field

```yaml
  - type: svg
    presentation: figure
    referenced_as:
      en: Summary Figure 1
      fr: Figure 1 du résumé
    content:
      en: >-
        <svg .... </svg>
      fr: >-
        <svg .... </svg>
```
