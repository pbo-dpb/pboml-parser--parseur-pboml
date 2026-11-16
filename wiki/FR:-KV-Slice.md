# Tranche KV (clé-valeur)

La tranche KV est utilisée pour représenter des paires clé-valeur dans un document PBOML. Elle est idéale pour les données structurées où chaque clé est associée à une valeur spécifique.

|Version ajoutée|1.0.0|
|:-:|:-:|

La tranche KV est utilisée pour représenter des paires clé-valeur dans un document `pboml`.

## Liste des champs

La liste des champs valides est incluse dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche).

### Liste des champs uniques à la tranche KV

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Obligatoire|Défini à `kvlist`|
|`prototype`|Objets YAML|Obligatoire|Contient des informations sur la clé et la valeur (`type` et `label`)|
|`content`|Tableau YAML|Obligatoire|Contient les objets clé-valeur avec leur contenu respectif|

### Exemple - Tranche KV

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
```
