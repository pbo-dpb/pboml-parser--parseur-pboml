# Annotations

Les annotations sont une fonctionnalité clé des documents PBOML, permettant des références structurées et des notes. Le champ `annotations` contient un tableau d'objets annotation.

## Anatomie d'un objet annotation

### Liste des champs d'un objet annotation

Depuis la version 1.0.0, voici la liste des champs contenus dans chaque annotation :

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`id`|String|Obligatoire|Chaîne utilisée pour identifier de façon unique une annotation|
|`content_type`|String|Obligatoire|Définit le format de l'annotation|
|`content`|Objet chaîne localisée|Obligatoire|Contenu de l'annotation. Rendu différemment selon la valeur du champ `content_type`|

#### Exemple - champ `annotations`

Dans le champ racine `annotations`, chaque annotation individuelle pourrait être listée comme suit :

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
```
