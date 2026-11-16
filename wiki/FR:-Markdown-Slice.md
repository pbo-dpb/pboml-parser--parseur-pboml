# Tranche Markdown

|Version ajoutée|1.0.0|
|:-:|:-:|

La tranche markdown est utilisée pour représenter des blocs de paragraphes dans un document `pboml`. Le contenu de cette tranche est rendu en Markdown. Pour plus d'informations sur la syntaxe Markdown, veuillez consulter le [Guide Markdown](https://www.markdownguide.org/basic-syntax/).

## Liste des champs

Dans un document `pboml`, la tranche markdown est représentée à l'aide de nombreux champs.
Beaucoup de ces champs sont déjà inclus dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche). Cependant, certains champs sont spécifiques à la tranche markdown.

### Liste des champs uniques à la tranche markdown

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Obligatoire|Doit être défini à `markdown` pour que le champ `content` soit rendu correctement|
|`content`|String|Obligatoire|Contient le contenu principal de la tranche markdown|

### Exemple - Tranche markdown

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

## Description détaillée des champs

### `type`

Dans le cas de la tranche markdown, ce champ est obligatoire et doit toujours être défini à `markdown` pour permettre au parseur de rendre le contenu correctement.
