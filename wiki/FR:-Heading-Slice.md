# Tranche d'en-tête

La tranche d'en-tête est utilisée pour représenter les titres dans un document PBOML. Contrairement aux autres tranches, son contenu ne peut pas être écrit en Markdown.

## Liste des champs

Contrairement à tous les autres types de tranches, la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche) **ne s'applique pas aux tranches d'en-tête**.

### Liste des champs pour la tranche d'en-tête

Voici la liste complète des champs pouvant être trouvés dans une tranche d'en-tête.

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`id`|String|Optionnel|Chaîne utilisée pour identifier de façon unique une tranche|
|`type`|String|Obligatoire|doit être défini à `heading`|
|`content`|Objet chaîne localisée|Obligatoire|Contient le contenu du titre. Rendu différemment selon la valeur du champ `level`|
|`level`|nombre|Obligatoire|Définit le niveau du titre|

### Exemple - Tranche d'en-tête

```yaml
slices:
  - type: heading
    content:
      en: Title 1
      fr: Title 1
    level: 0
```

## Description détaillée des champs

### `id`

Le champ `id` dans la tranche d'en-tête se comporte comme dans toute autre tranche. Pour plus de détails, voir la [description du champ `id`](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche)

### `type`

Dans le cas de la tranche d'en-tête, ce champ doit toujours être défini à `heading` pour permettre au parseur de rendre le contenu correctement.
