A PBOML document is a YAML file encoded in UTF-8. It is designed to be both human-readable and machine-readable, making it suitable for publishing structured content.

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
  - type: markdown
    readonly: false
    display_label: true
    label:
      en: Only slice of this document
      fr: Seule tranche de ce document
    content:
      en: "This is an **example**. Here I reference the annotation with an id of 1 [^1]."
      fr: "Ceci est un **exemple**. Ici j'ai référencé l'annotation avec l'id de 1 [^1]."
annotations:
  - id: 1
    content_type: markdown
    content:
      en: '[_Old Age Security Act_](https://laws-lois.justice.gc.ca/eng/acts/O-9/).'
      fr: >-
        [_Loi sur la sécurité de la
        vieillesse_](https://laws-lois.justice.gc.ca/fra/lois/o-9/).
  - id: 2
    content_type: markdown
    content:
      en: >-
        Treasury Board of Canada Secretariat. [Supplementary Estimates (A),
        2023-24](https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/supplementary-estimates/supplementary-estimates-a-2023-24.html).
      fr: >-
        Secrétariat du Conseil du Trésor du Canada. [Budget supplémentaire des
        dépenses (A),
        2023-2024](https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/budgets-supplementaires/budget-supplementaire-depenses-a-2023-2024.html).
```
> HTML Preview: [English](https://pboml.opbo-bdpb.ca/index.html?payload=pboml%3A%0A%20%20version%3A%201.0.0%0Adocument%3A%0A%20%20id%3A%20EXAMPLE-123456%0A%20%20release_date%3A%20%272022-11-17T13%3A00%3A00.000Z%27%0A%20%20title%3A%0A%20%20%20%20en%3A%20A%20Short%20Example%20Document%0A%20%20%20%20fr%3A%20Un%20court%20document%20d%27exemple%0A%20%20type%3A%0A%20%20%20%20en%3A%20PBOML%20Documentation%20Series%0A%20%20%20%20fr%3A%20S%C3%A9rie%20de%20documentation%20PBOML%0A%20%20copyright%3A%0A%20%20%20%20en%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0A%20%20%20%20fr%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0Aslices%3A%0A%20%20-%20type%3A%20markdown%0A%20%20%20%20readonly%3A%20false%0A%20%20%20%20display_label%3A%20true%0A%20%20%20%20label%3A%0A%20%20%20%20%20%20en%3A%20Only%20slice%20of%20this%20document%0A%20%20%20%20%20%20fr%3A%20Seule%20tranche%20de%20ce%20document%0A%20%20%20%20content%3A%0A%20%20%20%20%20%20en%3A%20%22This%20is%20an%20%2A%2Aexample%2A%2A.%22%0A%20%20%20%20%20%20fr%3A%20%22Ceci%20est%20un%20%2A%2Aexemple%2A%2A.%22) | [French](https://pboml.opbo-bdpb.ca/index.fr.html?payload=pboml%3A%0A%20%20version%3A%201.0.0%0Adocument%3A%0A%20%20id%3A%20EXAMPLE-123456%0A%20%20release_date%3A%20%272022-11-17T13%3A00%3A00.000Z%27%0A%20%20title%3A%0A%20%20%20%20en%3A%20A%20Short%20Example%20Document%0A%20%20%20%20fr%3A%20Un%20court%20document%20d%27exemple%0A%20%20type%3A%0A%20%20%20%20en%3A%20PBOML%20Documentation%20Series%0A%20%20%20%20fr%3A%20S%C3%A9rie%20de%20documentation%20PBOML%0A%20%20copyright%3A%0A%20%20%20%20en%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0A%20%20%20%20fr%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0Aslices%3A%0A%20%20-%20type%3A%20markdown%0A%20%20%20%20readonly%3A%20false%0A%20%20%20%20display_label%3A%20true%0A%20%20%20%20label%3A%0A%20%20%20%20%20%20en%3A%20Only%20slice%20of%20this%20document%0A%20%20%20%20%20%20fr%3A%20Seule%20tranche%20de%20ce%20document%0A%20%20%20%20content%3A%0A%20%20%20%20%20%20en%3A%20%22This%20is%20an%20%2A%2Aexample%2A%2A.%22%0A%20%20%20%20%20%20fr%3A%20%22Ceci%20est%20un%20%2A%2Aexemple%2A%2A.%22)

## Root objects

### `pboml`

The `pboml` root object contains data solely used to describe the PBOML used in the document. This object is required and must always be present at the root of the document. Conventionally, it is the first key presented at the beginning of the document.

The `pboml` object contains the following key:

- **version**: The version of the PBOML used in this document. At the moment, the only possible value is `1.0.0`.

### `document`

The root object `document` contains data about the content of the document. The `document` object and all its variables are optional.

The `document` object contains the following keys:

- **id**: a document id. Will be client visible as part of the document's footer.
- **release_date**: a document release date, ideally formatted as a valid ISO8601 datetime. Will be presented to the end user as part of the document's header.
- **title**: a localized string object that will be used prominently as the document's title.
- **type**: a localized string object that should describe the document's type in a verbose way. For example, *Report* or *Analysis*.
- **copyright**: a localized string object that will be inserted in the document's footer.
- **user_data**: a localized string object used to attach supplementary information to the document as needed.

### `slices`

An array of content object (*slices*) that will be sequentially rendered in stack. This root object must always be present and must have at least one child, as it constitutes the meat of a PBOML document.

Please refer to the [slice specific document](./EN:-Slice-Objects) to learn more.

### `annotations`

An array of content object (*annotations*) that will sequentially render each reference. This root object is optional.

Please refer to the [annotation specific document](./EN:-Annotations) to learn more.

## Note on Localized String Object

The inherently multilingual nature of PBOML means that most variables with text must be localizable. For this reason, in the documentation, we will use the type *localized text object* to describe a text variable that is declined in several languages.

```yaml
a_localized_string_object:
  en: "English String"
  fr: "French Text String"
```

For reasons related to Canadian legislation and the role of the OPBO, the documented languages are English and French (ISO 639-1 codes). However, PBOML supports other languages if needed.