Un document PBOML est un fichier YAML (utilisant l'encodage UTF-8).

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
      en: "This is an **example**."
      fr: "Ceci est un **exemple**."
```
> Aperçu en HTML : [Anglais](https://pboml.pbo-dpb.ca/index.html?payload=pboml%3A%0A%20%20version%3A%201.0.0%0Adocument%3A%0A%20%20id%3A%20EXAMPLE-123456%0A%20%20release_date%3A%20%272022-11-17T13%3A00%3A00.000Z%27%0A%20%20title%3A%0A%20%20%20%20en%3A%20A%20Short%20Example%20Document%0A%20%20%20%20fr%3A%20Un%20court%20document%20d%27exemple%0A%20%20type%3A%0A%20%20%20%20en%3A%20PBOML%20Documentation%20Series%0A%20%20%20%20fr%3A%20S%C3%A9rie%20de%20documentation%20PBOML%0A%20%20copyright%3A%0A%20%20%20%20en%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0A%20%20%20%20fr%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0Aslices%3A%0A%20%20-%20type%3A%20markdown%0A%20%20%20%20readonly%3A%20false%0A%20%20%20%20display_label%3A%20true%0A%20%20%20%20label%3A%0A%20%20%20%20%20%20en%3A%20Only%20slice%20of%20this%20document%0A%20%20%20%20%20%20fr%3A%20Seule%20tranche%20de%20ce%20document%0A%20%20%20%20content%3A%0A%20%20%20%20%20%20en%3A%20%22This%20is%20an%20%2A%2Aexample%2A%2A.%22%0A%20%20%20%20%20%20fr%3A%20%22Ceci%20est%20un%20%2A%2Aexemple%2A%2A.%22) | [Français](https://pboml.pbo-dpb.ca/index.fr.html?payload=pboml%3A%0A%20%20version%3A%201.0.0%0Adocument%3A%0A%20%20id%3A%20EXAMPLE-123456%0A%20%20release_date%3A%20%272022-11-17T13%3A00%3A00.000Z%27%0A%20%20title%3A%0A%20%20%20%20en%3A%20A%20Short%20Example%20Document%0A%20%20%20%20fr%3A%20Un%20court%20document%20d%27exemple%0A%20%20type%3A%0A%20%20%20%20en%3A%20PBOML%20Documentation%20Series%0A%20%20%20%20fr%3A%20S%C3%A9rie%20de%20documentation%20PBOML%0A%20%20copyright%3A%0A%20%20%20%20en%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0A%20%20%20%20fr%3A%20%C2%A9%20Lorem%20Ipsum%2C%202022%0Aslices%3A%0A%20%20-%20type%3A%20markdown%0A%20%20%20%20readonly%3A%20false%0A%20%20%20%20display_label%3A%20true%0A%20%20%20%20label%3A%0A%20%20%20%20%20%20en%3A%20Only%20slice%20of%20this%20document%0A%20%20%20%20%20%20fr%3A%20Seule%20tranche%20de%20ce%20document%0A%20%20%20%20content%3A%0A%20%20%20%20%20%20en%3A%20%22This%20is%20an%20%2A%2Aexample%2A%2A.%22%0A%20%20%20%20%20%20fr%3A%20%22Ceci%20est%20un%20%2A%2Aexemple%2A%2A.%22)

## Objets à la racine

### `pboml`

L'objet `pboml` contient des données utilisées exclusivement pour décrire le PBOML utilisé dans le document. Cet objet est requis et doit toujours être présent à la racine du document. Conventionellement, il s'agit de la première clé présentée au début du document.

L'objet `pboml` contient la clé suivante :

- **version**:  La version du PBOML utilisé dans ce document. À l'heure actuelle, la seule valeur possible est `1.0.0`.

### `document`

L'objet racine `document` contient des données sur le contenu du document. L'objet `document` et toutes ses variables sont facultatifs.

L'objet `document` contient les clés suivantes :

- **id** : un identifiant de document. Sera visible par le client comme partie du pied de page du document.
- **release_date** : une date de publication du document, idéalement formatée au format ISO8601. Elle sera présentée à l'utilisateur final dans l'en-tête du document.
- **title** : un objet texte localisé qui sera utilisé de manière proéminente comme titre du document.
- **type** : un objet texte localisé qui doit décrire le type du document de manière détaillée. Par exemple, *Rapport* ou *Analyse*.
- **copyright** : un objet texte localisé qui sera inséré dans le pied de page du document.
- **user_data**: un object texte localisé servant à associer des informations supplémentaires au document selon les besoins.

### `slices`

Une série d'objets de contenu (*tranches*) qui seront restitués séquentiellement sous forme de pile. Cet objet racine doit toujours être présent et doit avoir au moins un enfant, car il constitue la substance même d'un document PBOML.

Veuillez vous référer au document spécifique aux tranches pour en savoir plus.

## Note sur les objets de texte localisé

La nature intrinsèquement multilingue du PBOML implique que la plupart des variables présentant du texte doivent pouvoir être localisées. Pour cette raison, dans la documentation, nous utiliseront le type *objet texte localisé* pour décrire une variable texte déclinée en plusieurs langages.

```yaml
une_variable_de_texte_bilingue:
  en: "English Text String"
  fr: "Chaîne de texte en français"
```

Pour des raisons liées à la législation canadienne et au rôle du BDPB, les langues qui seront documentées ici sont l'anglais et le français (représentées par leur code ISO 639-1). Le langage PBOML permettrait toutefois d'utiliser d'autres langues en cas de besoin.