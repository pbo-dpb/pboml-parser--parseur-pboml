# Tranche Bitmap

La tranche Bitmap est utilisée pour afficher des images bitmap dans un document PBOML. Elle prend en charge les images réactives et plusieurs résolutions.

## Liste des champs

Dans un document `pboml`, la tranche bitmap est représentée à l'aide de nombreux champs.
Beaucoup de ces champs sont déjà inclus dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche). Cependant, certains champs sont spécifiques à la tranche bitmap.

### Liste des champs uniques à la tranche Bitmap

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Obligatoire|Doit être défini à `bitmap`|
|`content`|Objet chaîne localisée|Obligatoire|Contient les images dans toutes les langues concernées (voir [Objet chaîne localisée])|
|`thumbnails`|Objet miniature localisé|Obligatoire|Contient toutes les différentes images miniatures dans tous les types de fichiers, tailles et résolutions pris en charge|

### Exemple - tranche bitmap

```yaml
  - type: bitmap
    presentation: figure
    label: {}
    content:
      en: >-
        https://example.com/images/original_en.png
      fr: >-
        https://example.com/images/original_fr.png
    thumbnails:
      en:
        sm_1x_webp: >-
          https://example.com/images/w608_1x_en.webp
        sm_1x_png: >-
          https://example.com/images/w608_1x_en.png
        sm_2x_webp: >-
          https://example.com/images/w608_2x_en.webp
        sm_2x_png: >-
          https://example.com/images/w608_2x_en.png
        md_1x_webp: >-
          https://example.com/images/w704_1x_en.webp
```
