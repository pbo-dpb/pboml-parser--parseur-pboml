# Heading Slice

The heading slice is used to represent headings in a PBOML document. Unlike other slices, its content cannot be written in Markdown.

## List of fields

Unlike all other slice types, the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice) **do not apply to heading slices**.

### List of fields for the heading slice

As of version 1.0.0, here is the comprehensive list of fields that can be found in a heading slice.

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`id`|String|Optional|A string used to uniquely identify a slice object|
|`type`|String|Required|set to `heading`
|`content`|Localized String Object|Required|Contains the content of the heading. Rendered differently depending on the value of the `level` field
|`level`|number|Required|Defines the level of the heading

### Example - Heading slice

```yaml
slices:
  - type: heading
    content:
      en: Title 1
      fr: Title 1
    level: 0
```

## Detailed field description

### `id`

The `id` field in the heading slice behaves the same as in any other slice. For more detail please refer to the [`id` field description](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice)

### `type`

In the case of the heading slice, this field must always be set to `heading` to allow the parser to render the content correctly.

#### Example

```yaml
  - type: heading
```

### `content`

This field contains the content of the heading slice. This field is required to have in order to properly render the heading slice on the final document. The content is represented in a localized text object to describe the text in several languages. For detail on the Localized String Object see [Note on Localized String Object](./EN:-Anatomy-of-a-PBOML-document#note-on-localized-string-object). As of version 1.0.0, unlike most other slices, **the content cannot be written with the markdown syntax**.

### `level`

This field is unique to the heading slice. It indicates the level of the heading, where 0 is a top level header. As of version 1.0.0 of `pboml`, only the following values are accepted: `0`, `1`, `2` and `3`. If the field is empty, the default is 0. If anything other than the accepted values or the empty value, **no error will be thrown but the renderer won't render anything**.

By default, the HTML renderer will reserve the very top level tag (`<h1>`) the the document's title. Therefore, a heading with a level set to `0` will be rendered as an `<h2>` tag, a heading with a level set to `1` will be rendered as an `<h3>` and so on.

#### Examples - `level` field

##### Heading level 0

```yaml
  - type: heading
    content:
      en: Summary
      fr: Résumé
    level: 0
```

##### Heading level 1

```yaml
  - type: heading
    content:
      en: 1.1 Overview of Proposed Spending
      fr: 1.1 Aperçu des dépenses proposées
    level: 1
```
