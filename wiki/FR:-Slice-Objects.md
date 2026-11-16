# Objets Tranche

|Version ajoutée|1.0.0|
|:-:|:-:|

`slices` est l'un des objets racines trouvés dans un document `pboml` (voir [Anatomie-d'un-document-PBOML](./FR:-Anatomie-d'un-document-PBOML)).

Le champ `slices` contient un tableau d'objets de contenu (appelés tranches) qui seront rendus séquentiellement en pile. L'ordre de chaque tranche individuelle est donc important.

## Types de tranches

Depuis la version 1.0.0, il existe **sept** types de tranches différents. Chaque type de tranche a ses propres champs spéciaux, mais certains champs sont communs à tous les types de tranches. Voici la liste des différents types de tranches pouvant être trouvés dans un document `pboml` :

* `markdown`
* `heading`
* `table`
* `svg`
* `chart`
* `kvlist`
* `bitmap`

## Anatomie d'un objet tranche

Bien que les objets tranche diffèrent les uns des autres, certains champs sont communs quel que soit le type de tranche.

### Liste des champs communs à tous les types de tranche

Depuis la version 1.0.0, voici la liste des champs communs avec leur nom et leur optionnalité :

>**Les champs suivants se trouvent dans toutes les tranches à l'exception de la tranche `heading` qui n'utilise qu'un sous-ensemble. Pour plus d'explications, voir [Tranche : heading](https://github.com/pbo-dpb/pboml-parser--parseur-pboml/wiki/FR:-Heading-Slice)**

> **Pour plus de détails sur l'objet chaîne localisée, voir [Note sur l'objet chaîne localisée](./FR:-Anatomie-d'un-document-PBOML#note-sur-les-objets-de-texte-localisé)**

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`id`|String|Optionnel|Chaîne utilisée pour identifier de façon unique une tranche|
|`type`|String|Obligatoire|Définit le type de tranche|
|`sources`|Tableau d'objet chaîne localisée|Optionnel|Contient les sources pertinentes au contenu de la tranche|
|`notes`|Tableau d'objet chaîne localisée|Optionnel|Contient les notes pertinentes au contenu de la tranche|
