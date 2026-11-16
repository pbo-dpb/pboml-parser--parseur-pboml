# Tranche graphique

La tranche graphique est utilisée pour afficher des représentations graphiques de données dans un document PBOML. Elle est similaire à la tranche de tableau mais inclut des améliorations pour la visualisation.

|Version ajoutée|1.0.0|
|:-:|:-:|

## Liste des champs

La liste des champs valides est incluse dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche).

### Liste des champs uniques à la tranche graphique

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Obligatoire|Doit être défini à `chart`|
|`datatable`|Objet YAML|Obligatoire seulement si le champ `arraytable` est absent|Structure de données similaire à celle d'une tranche de tableau (avec des améliorations)|
|`arraytable`|Objet YAML|Obligatoire seulement si le champ `datatable` est absent|Structure de données simple basée sur un tableau|

## Description détaillée du champ - `datatable`

Comme mentionné, la tranche graphique est très similaire à la tranche de tableau. Le champ `datatable` contient les mêmes champs que dans la [tranche de tableau](Lien_vers_tableau_vars).

### Liste des champs sous `datatable`

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`variables`|Objet YAML|Obligatoire|Identique au champ `variables` de la [tranche de tableau](./FR:-Table-Slice#liste-des-champs-uniques-à-la-tranche-de-tableau) mais avec des champs spéciaux pour personnaliser l'affichage du graphique|
|`content`|Objet YAML|Obligatoire|Identique au champ `content` de la [tranche de tableau](./FR:-Table-Slice#liste-des-champs-uniques-à-la-tranche-de-tableau) mais avec des champs spéciaux pour personnaliser l'affichage du graphique|
|`state`|Objet YAML||?|

### `variables`

Comme mentionné précédemment, le champ `variables` a le même but que celui de la tranche de tableau (voir [Tranche de tableau - objet variable](./FR:-Table-Slice#variables)). Ce champ contient des objets variables qui représentent aussi un élément de l'axe $y$ (l'en-tête du tableau). Ces deux objets partagent les mêmes champs, mais l'objet variable contenu dans la tranche graphique possède des champs additionnels permettant de personnaliser le type de visualisation.

#### Liste des champs additionnels pour l'objet variable unique à la tranche graphique

>**Ce tableau étend : [Tranche de tableau - Liste des champs valides pour un objet variable](./FR:-Table-Slice#liste-des-champs-valides-pour-un-objet-variable)**

|nom du champ|type|optionnalité|Description|
