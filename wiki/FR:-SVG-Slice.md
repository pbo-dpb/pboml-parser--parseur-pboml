# Tranche SVG

La tranche SVG est utilisée pour intégrer du contenu SVG (Scalable Vector Graphics) dans un document PBOML. Elle est idéale pour les images vectorielles et les diagrammes.

|Version ajoutée|1.0.0|
|:-:|:-:|

La tranche SVG est utilisée pour stocker un objet SVG dans le document `pboml`.

## Liste des champs

La liste des champs valides est incluse dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche).

### Liste des champs pour la tranche SVG

Voici la liste des champs pouvant être trouvés dans une tranche SVG.

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|obligatoire|doit être défini à `svg`|
|`content`|Objet chaîne localisée|obligatoire|Contient le contenu SVG. Rendu différemment selon la langue|

### Exemple - Tranche SVG

```yaml
  - type: svg
    label:
      en: Rectangle
      fr: Rectangle
    content:
      en: |-
        <svg width="400" height="110">
          <rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />
        </svg>
      fr: |-
        <svg width="400" height="110">
          <rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />
        </svg>
```
