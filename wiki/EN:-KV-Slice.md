# Key-Value (KV) Slice

The KV slice is used to represent key-value pairs in a PBOML document. It is ideal for structured data where each key is associated with a specific value.

|Version added|1.0.0|
|:-:|:-:|

The KV slice is used to represent key-value pairs in a `pboml` document.

## List of fields

The list of valid field are all included in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice).

### List of fields unique to the KV slice

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|Set to `kvlist`
|`prototype`|YAML Objects|Required|Contains information about the key and the value (`type` and `label`)
|`content`|YAML Array|Required|Contains Key Value Objects with their respective content

### Example - KV slice

Here is an example of KV slice containing these fields:

```yaml
  - type: kvlist
    label:
      en: Data Sources
      fr: Sources des données
    content:
      - key:
          content:
            fr: Données diverses sur les appels d’assurance emploi
            en: Various data about EI appeals
        value:
          content:
            en: Employment and Social Development Canada (ESDC)
            fr: Emploi et Développement social Canada (EDSC)
      - key:
          content:
            fr: Données publiques diverses du TSS
            en: 'Various public SST data '
        value:
          content:
            fr: Tribunal de la sécurité sociale
            en: 'Social Security Tribunal '
    prototype:
      key:
        type: markdown
        label:
          en: Variable
          fr: Variable
      value:
        type: markdown
        label:
          en: Source
          fr: Source
```

## Detailed field descriptions

### `prototype`

The `prototype` field defines the structure of keys and values, while the `content` field contains the actual key-value pairs.

The `prototype` field defines information related to all the keys and values in the KV slice. Thus, there are only two valid fields: `key` and `value`. Below are the descriptions for both of them.

#### Example - `prototype` field

```yaml
    prototype:
      key:
        type: markdown
        label:
          en: Variable
          fr: Variable
      value:
        type: markdown
        label:
          en: Source
          fr: Source
```

#### List of valid fields for the `key` field under `prototype`

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|As of version 1.0.0, only `markdown` is supported
|`label`|Localised String Object|Required|Defines the title of the key

#### List of valid fields for the `value` field under `prototype`

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|As of version 1.0.0, only `markdown` is supported
|`label`|Localised String Object|Required|Defines the title of the key

### `content`

The `content` field can only be rendered correctly if the format of the keys and values have been defined in the [`prototype` field](./EN%3A-KV-Slice#prototype). The `content` field contains an array of keys and values with there own content each.

Here is an example of the `content` field:

```yaml
    content:
      - key:
          content:
            en: '1112'
            fr: Données diverses sur les appels d’assurance emploi
        value:
          content:
            en: Employment and Social Development Canada (ESDC)
            fr: Emploi et Développement social Canada (EDSC)
      - key:
          content:
            fr: Données publiques diverses du TSS
            en: 'Various public SST data '
        value:
          content:
            fr: Tribunal de la sécurité sociale
            en: 'Social Security Tribunal '
```

A Key-Value Object only has two fields: `key` and `value`. Below are the descriptions for both of them:
> For more details regarding the Localized String Object, see a [Note on Localized String Object](./EN:-Anatomy-of-a-PBOML-document#note-on-localized-string-object)

#### List of valid fields for the `key` field under the `content`

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`content`|Localised String Object|Required|Defines the title of the key

#### List of valid fields for the `value` field under the `content`

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`content`|Localised String Object|Required|Defines the value of the key
