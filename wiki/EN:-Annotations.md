# Annotations

Annotations are a key feature of PBOML documents, allowing for structured references and notes. The `annotations` field contains an array of annotation objects.

## Anatomy of an Annotation Object

### List of fields of an Annotation Object

As of version 1.0.0, here is the list of fields contained in each annotation:

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`id`|String|Required|A string used to uniquely identifie an Annotation Object|
|`content_type`|String|Required|Defines the annotation's format
|`content`|Localized String Object|Required| Annotation content. Rendered differently depending on the value of the `content_type` field

#### Example - `annotations` field

Within the `annotations` root field, each individual annotation could be listed as follows:

```yaml
pboml:
  version: 1.0.0
slices:
  - type: markdown
    content:
      en: "Here I reference the annotation with an id of 1 [^1]."
      fr: "Ici j'ai référencé l'annotation avec l'id de 1 [^1]."
  - type: markdown
    content:
      en: "Here I reference the annotation with an id of 2 [^2]."
      fr: "Ici j'ai référencé l'annotation avec l'id de 2 [^2]."    
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
        2023-2024](https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses_prevues/budgets-supplementaires/budget-supplementaire-depenses-a-2023-2024.html).
```

## Detailed field description

### `id`

The `id` field uniquely identifies an annotation, enabling references elsewhere in the document. While numeric IDs are common, strings, underscores, and hyphens are also supported.

Even though it is customary to use incremental numbers as the id of an array of annotations, letter (case sensitive), non-incremental, underscore and hyphens could also be used (see second example below).

#### Examples

##### Numeric ID

```yaml
pboml:
  version: 1.0.0
slices:
  - type: markdown
    content:
      en: "For more information, see the _Old Age Security Act_.[^1]"
      fr: "Pour plus d'information, voir la _Loi sur la sécurité de la vieillesse_[^1]."
annotations:
  - id: 1
    content_type: markdown
    content:
      en: '[_Old Age Security Act_](https://laws-lois.justice.gc.ca/eng/acts/O-9/).'
      fr: >-
        [_Loi sur la sécurité de la
        vieillesse_](https://laws-lois.justice.gc.ca/fra/lois/o-9/).
```

##### String ID

```yaml
pboml:
  version: 1.0.0
slices:
  - type: markdown
    content:
      en: "For more information, see the _Old Age Security Act_.[^OASA-LSV]."
      fr: "_Loi sur la sécurité de la vieillesse_[^OASA-LSV]."
annotations:
  - id: "OASA-LSV"
    content_type: markdown
    content:
      en: '[_Old Age Security Act_](https://laws-lois.justice.gc.ca/eng/acts/O-9/).'
      fr: >-
        [_Loi sur la sécurité de la
        vieillesse_](https://laws-lois.justice.gc.ca/fra/lois/o-9/).
```

### `content_type`

The `content_type` field is used to define the type of rendering engine to use to render what string content of the `content` field. As of version 1.0.0 of `pboml`, there are currently two supported content types: `markdown` and `bibtex`. For more details on both, you can visite these ressources:

* [Markdown Guide](https://www.markdownguide.org/)
* [Bibtext Guide](https://www.overleaf.com/learn/latex/Bibliography_management_with_bibtex)

### `content`

The `content` field of an annotation object contains a localized text object to describe the text in several languages. For detail on the Localized String Object see [Note on Localized String Object](./EN:-Anatomy-of-a-PBOML-document#note-on-localized-string-object). As mentionned before, the content is rendered differently depending on the content type. Below are example for each content type.

#### Examples - `content` field

##### Markdown example

Here is an example with the `markdown` content type:

```yaml
pboml:
  version: 1.0.0
slices:
  - type: markdown
    content:
      en: "Here I reference the annotation with an id of 1 using markdown [^1]."
      fr: "Ici j'ai référencé l'annotation avec l'id de 1 en utilisant markdown [^1]."
annotations:
  - id: 1
    content_type: markdown
    content:
      en: '[_Old Age Security Act_](https://laws-lois.justice.gc.ca/eng/acts/O-9/).'
      fr: >-
        [_Loi sur la sécurité de la
        vieillesse_](https://laws-lois.justice.gc.ca/fra/lois/o-9/).
```

##### Bibtex example

Here is an example with the `bibtext` content type:

```yaml
pboml:
  version: 1.0.0
slices:
  - type: markdown
    content:
      en: "Here I reference the annotation with an id of 1 using bibtex [^abc]."
      fr: "Ici j'ai référencé l'annotation avec l'id de 1 en utilisant bibtex [^abc]."
annotations:
  - id: 1
    content_type: bibtex
    content:
      en: |-
        @book{latex:companion,
          author = {Frank Mittelbach and Michel Gossens
                    and Johannes Braams and David Carlisle
                    and Chris Rowley},
          year = {2004},
          title = {The {\LaTeX} Companion},
          publisher = {Addison-Wesley Professional},
          edition = {2}
        }
      fr: |-
        @book{latex:companion,
          author = {Frank Mittelbach and Michel Gossens
                    and Johannes Braams and David Carlisle
                    and Chris Rowley},
          year = {2004},
          title = {The {\LaTeX} Companion},
          publisher = {Addison-Wesley Professional},
          edition = {2}
        }
```
