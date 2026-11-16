# Markdown Slice

|Version added|1.0.0|
|:-:|:-:|

The markdown slice is used to represent blocks of paragraphs in a `pboml` document. The content of that slice is rendered using Markdown. For further information on the markdown syntax, please refer to the [Markdown Guide](https://www.markdownguide.org/basic-syntax/).

## List of fields

In a `pboml` document, the markdown slice is represented using many fields.
Many of those fields are included already in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice). However, there are fields that are specific to the markdown slice.

### List of fields unique to the markdown slice

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|Must be set to `markdown` in order to render the `content` field correctly|
|`content`|String|Required|Contains the main content of the markdown slice|

### Example - Markdown slice

```yaml
slices:
  - type: markdown
    readonly: false
    display_label: true
    label:
      en: Only slice of this document
      fr: Seule tranche de ce document
    content:
      en: "This is an **example**."
      fr: "Ceci est un **exemple**."
```

## Detailed field description

### `type`

In the case of the markdown slice, this field is obligatory and must always be set to `markdown` to allow the parser to render the content correctly.

#### Example - `type` field

```yaml
  - type: markdown
```

### `content`

This field contains the content of the markdown slice. This field is obligatory to have in order to proprely render a markdown slice. The content is represented in a localized text object to describe the text in several languages. For details on the Localized String Object see [Note on Localized String Object](./EN:-Anatomy-of-a-PBOML-document#note-on-localized-string-object). Annotations are also supported (for further details, see [Annotations](./EN:-Annotations)).

> Note on the `yaml` syntax: the `>-` characters that are in front of the String fields (see example below) indicates to the `yaml` parser that the content within that field is multiligned.

#### Example - `content` field

```yaml
content:
      en: >-
        The proposed Canada Dental Benefit (CDB) would provide up-front tax-free payments to cover dental expenses for children under 12-years-old.\_\n\n*   $650 would be provided for each eligible child if the family’s adjusted net income is under $70,000.\_\n*   $390 would be provided for each eligible child if the family’s adjusted net income is between $70,000 and $79,999.\n*   $260 would be provided for each eligible child if the family’s adjusted net income is between $80,000 and $89,999.\n\nThere are two benefit periods of CDB.
      fr: >-
        Le projet de prestation dentaire canadienne (PDC) prévoit des paiements initiaux et non imposables pour couvrir les frais dentaires des enfants de moins de 12 ans.\_\n\n*   Une prestation de 650 $ sera versée pour chaque enfant admissible issu d’une famille dont le revenu net ajusté est inférieur à 70 000 $.\_\n*   Une prestation de 390\_$ sera versée pour chaque enfant admissible issu d’une famille dont le revenu net ajusté se situe entre 70\_000\_$ et 79\_999\_$.\n*   Une prestation de 260\_$ sera versée pour chaque enfant admissible issu d’une famille dont le revenu net ajusté se situe entre 80\_000\_$ et 89\_999\_$.\n\nLa PDC comporte deux périodes de prestations.
```
