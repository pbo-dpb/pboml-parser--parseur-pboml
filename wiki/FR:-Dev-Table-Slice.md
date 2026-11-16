# Tranche de tableau — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche de tableau](./FR:-Table-Slice)

***
🌐  [English](./EN:-Dev-Table-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `table` |
| Modèle | `src/models/contents/TableSlice.js` → `DataTable/DataTable.js`, `DataTableVariable.js`, `DataTableEntry.js`, `DataTableEntryGroup.js` |
| Moteur de rendu HTML | `src/Renderers/Html/TableSliceHtmlRenderer.js` (délègue à `DataTable.renderReadonlyVnode()`) |
| Éditeur | `src/editors/TableSliceEditor.js` → `components/Editor/DataTableEditor/*` |
| Dans le menu d'ajout de tranche | Oui (présentation par défaut `figure`) |
| Partage son modèle de données avec | la [tranche graphique](./FR:-Dev-Chart-Slice) (graphiques `datatable`) |

## Idée clé : un tableau transposé

`DataTable` est un modèle **organisé par variable** :

- `variables` est un **dictionnaire ordonné** `clé → définition de variable`. **Chaque variable devient une ligne** du tableau HTML.
- `content` est un **tableau d'entrées**. Chaque entrée est un objet `{ cléDeVariable: valeur, … }` et **devient une colonne**.
- `entrygroups` regroupe des **entrées (colonnes)** consécutives sous un en-tête commun, avec `colspan`.

```yaml
- type: table
  presentation: figure
  label: { en: Vehicle prices, fr: Prix des véhicules }
  presentation_style: accounting      # valeur par défaut du tableau : prose | accounting
  entrygroups:                        # facultatif : super-en-tête au-dessus des entrées
    - { label: { en: "2022", fr: "2022" }, span: 2 }
    - { label: { en: "2026", fr: "2026" }, span: 2 }
  variables:
    vehicle:                          # ← ligne 1 (descriptive → dans <thead>)
      label: { en: Cars, fr: Voitures }
      is_descriptive: true
    price:                            # ← ligne 2
      label: { en: Price, fr: Prix }
      type: number
      unit: { en: "$", fr: "$" }
  content:                            # ← un objet par colonne
    - { vehicle: { en: BEV, fr: VÉB }, price: 52000 }
    - { vehicle: { en: ICE, fr: VMC }, price: 38000 }
    - { vehicle: { en: BEV, fr: VÉB }, price: 47000, emphasize: true }
    - { vehicle: { en: ICE, fr: VMC }, price: 40000 }
```

> 📝 La page pour les rédacteurs décrit chaque objet de `content` comme « une ligne » et `group` comme un **en-tête** à plusieurs niveaux. Dans le HTML que le code produit réellement, les entrées sont des **colonnes**, et `group` crée un **groupe de lignes** (une cellule à gauche avec `rowspan`). Gardez-le en tête si vous comparez les deux pages ou si vous mettez à jour la page pour les rédacteurs.

Pour une tranche de tableau, les champs du `DataTable` se trouvent **directement sur la tranche** (`variables`, `content`, `presentation_style`, `entrygroups`). Une tranche graphique les place sous une clé `datatable:`.

```js
// Constructeur de TableSlice
this.datatable = new DataTable(payload);              // lit payload.variables, payload.content, …
this.datatable.state.caption = this.labelStrings;     // sert au <caption> lu par les lecteurs d'écran
```

## Référence du modèle

### `DataTable`

| Champ | Valeur par défaut | Remarques |
|:-|:-|:-|
| `variables` | `{}` | Instances de `DataTableVariable`, par clé. L'ordre d'insertion donne l'ordre des lignes. |
| `content` | `[]` | Instances de `DataTableEntry`. Les valeurs non itérables sont ignorées. |
| `entrygroups` | `[]` | Instances de `DataTableEntryGroup`. |
| `presentation_style` | `prose` | `prose` (cellules centrées) ou `accounting` (chiffres tabulaires, zéro barré, alignement à droite). |
| `state.caption` | `null` | Exécution seulement. |

Méthodes utiles : `descriptiveVariableKeyPair` / `descriptiveVariableKey` (la **première** variable avec `is_descriptive`), `groupsMapForLanguage()`, `getWholeTableUnitForLanguage()` (retourne l'unité unique quand toutes les variables non descriptives ont la même), `deleteVariableWithKey()`.

### `DataTableVariable` (une par ligne)

| Champ | Valeur par défaut | Effet |
|:-|:-|:-|
| `label` | – | En-tête de ligne (Markdown). |
| `type` | `markdown` | `markdown` (valeur `{en, fr}` ou chaîne), `number` (mis en forme avec `Intl.NumberFormat(lang)`), `separator` (ligne de séparation sur toute la largeur, sans cellules). Autres valeurs : affichées telles quelles. |
| `is_descriptive` | – | Les cellules deviennent des `<th>`. Le **premier bloc de variables descriptives consécutives** va dans `<thead>`. |
| `group` | `null` | `{en, fr}`. Les variables consécutives du même groupe partagent une cellule de groupe fusionnée. La colonne de groupe n'apparaît que s'il y a plus d'un groupe. |
| `unit` | `null` | `{en, fr}`. Affichée dans l'en-tête de ligne, ou au-dessus du tableau si c'est la seule unité du tableau. |
| `emphasize` | `false` | Met toute la ligne en évidence. |
| `presentation_style` | `inherit` | `inherit` / `prose` / `accounting` ; `inherit` reprend la valeur du tableau. |
| `level` | `0` | Retrait (icône ↳ et message pour les lecteurs d'écran) ; des styles existent pour les niveaux 1 à 4. |
| `readonly` | – | Conservé tel quel. |
| `skip_chart`, `chart_type`, `tension` | `false`, `bar`, `0` | Graphiques seulement ; voir la [tranche graphique](./FR:-Dev-Chart-Slice). |

`DataTableVariable.generateUniqueDataTableVariableId(label, others, group)` construit une clé à partir de `groupe + libellé` (en minuscules, seulement `[_a-z0-9]`) et ajoute des lettres aléatoires au début jusqu'à ce que la clé commence par une lettre, soit unique et n'entre pas en conflit avec une propriété d'entrée (`emphasize`, `tension`, `skip_chart`).

### `DataTableEntry` (une par colonne)

Chaque clé du contenu est copiée sur l'instance (les valeurs des variables). L'entrée a aussi trois propriétés de mise en forme **réservées** : `emphasize` (mettre la colonne en évidence), `skip_chart` et `tension`. Les valeurs par défaut sont retirées par `toArray()`.

> Comme les propriétés d'entrée et les clés de variable partagent le même objet, une variable ne doit jamais s'appeler `emphasize`, `skip_chart` ou `tension`.

### `DataTableEntryGroup`

`{ label: {en, fr}, span: entier = 1 }`. Les groupes sont placés de gauche à droite. La somme des `span` devrait être égale à `content.length`, mais ce n'est **pas vérifié**.

## Rendu (`DataTable.renderReadonlyVnode`)

```
[ligne d'unité]     (aria-hidden, seulement si tout le tableau a une seule unité)
<div overflow-x-auto>
  <table table-fixed>
    <caption sr-only>   libellés + unité
    <colgroup>          seulement s'il y a des entrygroups
    <thead>
      [super-ligne des groupes d'entrées]
      un <tr> par variable du premier bloc descriptif
    <tbody> par groupe de variables
      <tr> [<th rowspan> du groupe] <th en-tête de variable> <td|th par entrée> …
```

- Les cellules vides (`null`/`undefined`, `NaN`, chaîne vide) affichent un libellé `sr-only` « Cellule vide » sur fond gris.
- Sur grand écran (`window.innerWidth >= 1024`, **vérifié une seule fois, au chargement du module**), la largeur des colonnes est fixée : la colonne d'en-tête reçoit 1/3 (ou 1/6 avec des groupes), et les entrées se partagent les 2/3 restants.
- Les en-têtes de ligne sont `sticky` pour rester visibles quand le tableau défile horizontalement.
- `TableSliceHtmlRenderer.renderAsVnode()` ajoute `break-inside-avoid-page` à l'élément englobant pour l'impression.

## Édition (`DataTableEditor`)

`TableSliceEditor` affiche `DataTableEditor`, qui a quatre onglets :

| Onglet | Composant | Fonction |
|:-|:-|:-|
| Visuel | `DataTableVisualEditor.js` | Grille de type tableur : modifier les cellules, ajouter ou supprimer des entrées (colonnes), activer `emphasize` sur une entrée (et `skip_chart` pour les graphiques). |
| Variables | `DataTableVariablesEditor.vue` → `DataTableVariableEditor.js` | Ajouter, supprimer et réordonner les variables ; modifier `type`, `presentation_style`, `label`, `group`, `unit`, `emphasize`, `is_descriptive`, `level` (et `chart_type`, `tension`, `skip_chart` avec `showChartProperties`). |
| Affichage | `DataTableDisplayEditor/*.vue` | Sous-onglets *Général* (`presentation_style` du tableau), *Variables* (affichage par variable) et *Données* (groupes d'entrées). |
| Importation | `DataTableImporter.js` | Coller des tableaux Markdown/HTML (EN et FR) pour construire un `DataTable`. |

### Détails de l'importateur

- Le texte collé est converti en HTML avec `MarkdownDriver.parseGenericMarkdown()`. Ensuite, chaque `<td>/<th>` est reconverti en Markdown avec Turndown : **la mise en forme, comme le gras, est conservée** dans la cellule.
- *Variables sur la première ligne / la première colonne* détermine l'orientation. La première ligne (ou colonne) devient `is_descriptive`.
- *Utiliser le saut de ligne pour le nom de groupe* : une cellule d'en-tête `Groupe\nLibellé` est séparée en `group` + `label`.
- *Fusionner* (par défaut quand le tableau a déjà des variables) exécute `lodash.merge(existant.toArray(), importé.toArray())`. Sinon, le tableau importé remplace le tableau existant.
- Les valeurs importées sont **toujours du texte** (type `markdown`). Les nombres, les tirets et les décimales sont conservés exactement tels qu'ils ont été écrits (`tests/components/Editor/DataTableEditor/DataTableImporter.test.js`).
- À l'*importation*, `update:datatable` est émis et `TableSlice` affecte le nouveau `DataTable`.

## Sérialisation

`TableSlice.toArray()` = `super.toArray()` + `variables`, `content`, `presentation_style` et `entrygroups` tirés de `datatable.toArray()`. Les valeurs par défaut (`presentation_style: prose`, `entrygroups` vide, valeurs par défaut des variables, objets vides `{en:"", fr:""}`) sont retirées.

## Particularités et limites connues

- **L'édition du code source ne met pas les données à jour** : `SliceSourceCodeEditor` exécute `Object.assign` sur la tranche, mais le rendu et la sérialisation lisent `slice.datatable`, qui n'est pas reconstruit. Utilisez plutôt *Avancé → Code* ou l'éditeur de DataTable.
- `isLg` est calculé à la première importation du module : redimensionner la fenêtre ou tourner une tablette ne change pas la largeur des colonnes avant le prochain chargement de la page.
- Dans `DataTableVariable.getTableCellVnode()`, les cellules vides vérifient `this.shouldEmphasizeCell` (jamais défini) au lieu de la variable locale `shouldEmphasizeCell`. Résultat : les cellules vides des lignes ou colonnes mises en évidence n'ont jamais le gris plus foncé prévu.
- Seule la **première** variable `is_descriptive` est utilisée par `descriptiveVariableKeyPair` (axe des x des graphiques). Pour `<thead>`, seul le premier bloc de variables descriptives consécutives est utilisé ; les variables descriptives placées plus bas restent dans `<tbody>`.
- La somme des `span` des `entrygroups` n'est pas comparée au nombre d'entrées.
- Les clés de variable sont des clés d'objet : renommer une variable oblige à réécrire toutes les entrées.
