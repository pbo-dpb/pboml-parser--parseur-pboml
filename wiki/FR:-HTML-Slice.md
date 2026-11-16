# Tranche HTML

La tranche HTML permet d'intégrer du contenu HTML brut dans un document PBOML. Elle est principalement destinée à des fins de compatibilité, et d'autres types de tranches sont préférés lorsque cela est possible.

|Version ajoutée|1.0.0|
|:-:|:-:|

## Liste des champs

La liste des champs valides est incluse dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche).

### Liste des champs pour la tranche HTML

Voici la liste des champs pouvant être trouvés dans une tranche HTML.

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|obligatoire|doit être défini à `html`|
|`content`|Objet chaîne localisée|obligatoire|Contient la charge utile HTML brute à rendre|
|`remove_default_styles`|Booléen|optionnel|Si `true`, aucun style ne sera appliqué au shadow DOM|
|`css`|String|optionnel|Peut inclure du CSS appliqué à la tranche|

### Exemple - Tranche HTML

```yaml
  - type: html
    css: "strong {font-size: 2em;}"
    content:
      en: |-
        <strong>
          Hello, world
        </strong>
      fr: |-
        <strong>
          Bonjour, monde
        </strong>
```

## Description détaillée des champs
