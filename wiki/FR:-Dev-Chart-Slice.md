# Tranche graphique — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche graphique](./FR:-Chart-Slice)

---

🌐 [English](./EN:-Dev-Chart-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)

---

## En un coup d'œil

|                                 |                                                                                                                                         |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `type` YAML                     | `chart`                                                                                                                                 |
| Modèle                          | `src/models/contents/ChartSlice.js` + `DataTable/*` **ou** `ArrayTable/ArrayTable.js`                                                   |
| Moteur de rendu HTML            | `src/Renderers/Html/ChartSliceHtmlRenderer.js`                                                                                          |
| Composants Chart.js             | `src/components/Grapher/DataTableGrapher.js`, `ArrayTableGrapher.js`, `ArrayTableDataSource.js`, `ChartJsMixin.js`, `ColourPalettes.js` |
| Éditeur                         | `src/editors/ChartSliceEditor.js` → `DataTableEditor` (avec `showChartProperties: true`)                                                |
| Dans le menu d'ajout de tranche | Oui (présentation par défaut `figure`)                                                                                                  |
| Bibliothèques                   | `chart.js/auto` (v4), `color`                                                                                                           |

## Deux sources de données

```js
// Constructeur de ChartSlice
if (payload.arraytable) this.arraytable = new ArrayTable(payload.arraytable);
else this.datatable = new DataTable(payload.datatable);
```

|                                            | `datatable` (actuel)                                                                              | `arraytable` (ancien)                                                                                                          |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Modèle de données                          | Le même `DataTable` que la [tranche de tableau](./FR:-Dev-Table-Slice), sous une clé `datatable:` | Tableau 2D : première ligne = noms des séries, première colonne = étiquettes de l'axe des x                                    |
| Localisation                               | Valeurs et libellés `{en, fr}`                                                                    | Chaînes de substitution remplacées à partir de `strings.{en,fr}` (`localizeRecursively`)                                       |
| Modifiable dans l'éditeur visuel           | ✅                                                                                                | ❌ Aperçu seulement. Modifier avec _Avancé → Code_ (l'éditeur de code source de la tranche ne reconstruit pas l'`ArrayTable`). |
| Équivalent textuel (« Version textuelle ») | Tableau généré par `DataTable.renderReadonlyVnode()`                                              | `ArrayTableTable.js`                                                                                                           |

> ⚠️ Attention à la construction d'`ArrayTable` : `ChartSlice` lui passe `payload.arraytable`, et le constructeur d'`ArrayTable` lit ensuite `arraytable`, `axes`, `colors`, `strings` et `chart_type(s)` **dans cet objet**. Un graphique arraytable a donc besoin d'un objet **imbriqué** (`arraytable: { arraytable: [[…]], axes, strings, chart_type }`), comme le montre la page Tranche graphique pour les rédacteurs.

## Graphiques `datatable` (`DataTableGrapher`)

### Correspondance avec Chart.js

| Notion DataTable                                                                                                     | Chart.js                                                                                                                                                                                                              |
| :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Première variable avec `is_descriptive: true` (**obligatoire** ; sinon la configuration vaut `null` et ⚠️ s'affiche) | Valeurs de x. Axe par catégories si le `type` de la variable est `markdown` ; sinon axe **linéaire** avec `stepSize` = plus petit écart entre les valeurs. Le libellé de la variable devient le titre de l'axe des x. |
| Chaque autre variable avec `skip_chart: false`                                                                       | Une série. `label` → légende.                                                                                                                                                                                         |
| Chaque entrée (`content[i]`) avec `skip_chart: false`                                                                | Un point par série (`{x, y}`).                                                                                                                                                                                        |
| `variable.chart_type`                                                                                                | `type` de la série (`bar`, `line`, `scatter`, …).                                                                                                                                                                     |
| `variable.tension`                                                                                                   | `"monotone"` → `cubicInterpolationMode: "monotone"` ; un nombre → `tension`.                                                                                                                                          |
| `variable.group[lang]`                                                                                               | `stack` de la série (groupes empilés).                                                                                                                                                                                |
| `variable.emphasize`                                                                                                 | Couleur de la palette plus foncée et plus saturée pour toute la série.                                                                                                                                                |
| `entry.emphasize`                                                                                                    | Ce point ou cette barre est plus foncé ; les barres reçoivent une bordure violette `#a855f7`, les points un rayon de 7.                                                                                               |

Les séries reçoivent un `order` pour que **les points de nuage soient dessinés au-dessus des lignes, et les lignes au-dessus des barres**.

### Couleurs

`ChartJsMixin.colorForIndex(i, emphasize)` utilise `EquidistantColorPalette` (8 couleurs, puis `#666666`). En mode sombre (`prefers-color-scheme`), les couleurs sont éclaircies et plus saturées, et le texte passe à `#f9fafb`.

`DataTableGrapher` lit `variable.color` s'il est défini, mais `DataTableVariable` ne lit ni n'écrit jamais de champ `color`. **Les couleurs personnalisées dans le YAML n'ont donc aucun effet pour l'instant.**

### Options Chart.js communes (`ChartJsMixin`)

`animation.duration: 0`, `maintainAspectRatio: false`, `responsive: true`, légende en bas, `locale` = langue du rendu, hauteur du canevas `h-96 md:h-128`.

## Graphiques `arraytable` (`ArrayTableGrapher`)

```yaml
arraytable:
    chart_type: bar # ou chart_types: [bar, line, …] (une valeur par série)
    axes:
        y: { label: __Salary__, style: currency, currency: CAD } # style : currency | percentage
    strings:
        en: { __Salary__: Salary, _S22_: "2022" }
        fr: { __Salary__: Salaire, _S22_: "2022" }
    arraytable:
        - [Employee, _S22_]
        - [Mike, 35000]
        - [Bob, { data: 37000, emphasize: true }]
```

- `ArrayTableDataSource` convertit le tableau en `{labels, datasets}`. Une cellule peut être `{data, emphasize}` ; les points mis en évidence deviennent des triangles (ligne) ou des barres plus foncées.
- `localizeRecursively` convertit la structure en JSON et remplace chaque `"chaîne de substitution"` par sa traduction, mais seulement quand elle forme une **chaîne JSON entière** (guillemets compris). La page pour les rédacteurs parle de « toute sous-chaîne », mais une chaîne de substitution placée dans une chaîne plus longue (par exemple `"Total _FY_"`) n'est **pas** remplacée.
- `colors` est lu, mais `ArrayTableDataSource` ne l'utilise pas : il prend toujours `EquidistantColorPalette`.
- Pour les axes, `style: currency | percentage` met les graduations en forme avec `Intl.NumberFormat` et **divise la valeur par 100**.

## Élément englobant du rendu

`ChartSliceHtmlRenderer.renderReadonlyVnode()` place le composant graphique dans un `<Suspense>` (le code de Chart.js est chargé de façon asynchrone). `renderAltsVnodes()` est redéfini : si l'auteur n'a fourni aucun `alts`, un tableau de données accessible est généré automatiquement et affiché dans la « Version textuelle » repliable.

## Édition

`ChartSliceEditor` affiche :

1. un aperçu EN | FR en direct. Un observateur profond le remplace par un espace réservé de hauteur fixe pendant environ 100 ms après chaque modification, pour que Chart.js se recharge sans faire sauter la mise en page ;
2. `DataTableEditor` avec `showChartProperties: true`. Cela ajoute les contrôles `chart_type`, `tension` et `skip_chart` pour les variables, et un bouton `skip_chart` pour les entrées.

Les tranches en lecture seule **et les graphiques arraytable** n'affichent que l'aperçu.

## Sérialisation

```js
toArray() {
  let array = super.toArray();
  array.datatable = this.datatable;     // ⚠️ l'instance, et non this.datatable.toArray()
  array.arraytable = this.arraytable;   // ⚠️ idem
  return array;
}
```

## Particularités et limites connues

- **La sérialisation laisse passer des champs d'exécution.** Comme les instances elles-mêmes sont placées dans le résultat, `js-yaml` écrit toutes leurs propriétés : `datatable.state` (`caption: null`), la `key` de chaque variable, les valeurs par défaut (`chart_type: bar`, `level: 0`, …) et les champs normalisés d'`ArrayTable` (`types`, `strings`). Le résultat peut toujours être rechargé, mais il est plus chargé que celui de `TableSlice` et peut s'écarter de la source. La correction consiste à appeler `.toArray()` (et à ajouter une méthode `toArray()` à `ArrayTable`).
- `variable.color` est lu par le composant graphique, mais ignoré par le modèle (voir Couleurs).
- Un graphique sans variable `is_descriptive` n'affiche que ⚠️ ; l'erreur est absorbée dans la propriété calculée `config`.
- Pour un axe des x numérique, `stepSize` est le plus petit écart entre les valeurs de x **triées**. Des valeurs de x en double donnent un pas de `0`.
- `ChartJsMixin` définit au niveau du module un `unid` partagé par tous les graphiques (il ne sert pas aux identifiants du DOM pour l'instant).
- L'édition du code source a les mêmes limites que pour les tableaux (`DataTable`/`ArrayTable` ne sont pas reconstruits).
