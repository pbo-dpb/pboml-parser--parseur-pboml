# Modèle de document et analyse

Comment un contenu YAML devient un `PBOMLDocument`, et comment ce document est reconverti en YAML.

***
🌐  [English](./EN:-Dev-Document-Model-and-Parsing) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## Déroulement de l'analyse

```
payload (attribut)
  │  commence par "data:text/yaml;base64," ? → Buffer.from(…, "base64")
  ▼
yaml.loadAll(chaîne)          // js-yaml : une entrée par document séparé par "---"
  ▼
new PBOMLDocument(documents, prefix)
  ├─ trouve le document principal : le premier qui a une clé `pboml`
  ├─ valide pboml.version === "1.0.0"
  ├─ lit les métadonnées de `document`
  ├─ slices → PBOMLDocument.provisionSliceFromPayload() pour chacune
  ├─ annotations → new Annotation() pour chacune, triées par id (ordre numérique)
  └─ conserve les autres documents YAML dans `otherDocuments`
```

Le même déroulement est utilisé par :

- `App.ce.vue` → `loadDocumentFromPayload()` (rendu et éditeur),
- `Toc.ce.vue`,
- `FilePickerInput.vue` (quand l'utilisateur ouvre un fichier `.yaml`, ou un PDF dont la métadonnée **Sujet** contient du PBOML),
- `PBOMLDocument.initFromYaml(yaml, prefix)` (l'onglet *Avancé → Code* de l'éditeur).

## Validation et erreurs

Le constructeur de `PBOMLDocument` lance une `Error` dont le message provient de `PBOMLDocument.errors.js` :

| Situation | Clé du message |
|:-|:-|
| Aucun document YAML | `fileIsEmpty` |
| Aucun document n'a de clé `pboml` | `pbomlIsUndefined` |
| `pboml: null` | `pbomlIsNull` |
| `pboml.version` vaut `null` / `""` / autre chose que `"1.0.0"` | `versionIsNull` / `versionIsEmptyString` / `versionIsNotSupported` |
| `slices` n'est ni un tableau, ni un objet, ni null | `slicesIsNotArrayOrObject` |
| `annotations` n'est ni un tableau, ni un objet, ni null | `annotationsIsNotArrayOrObject` |

Comportements tolérants à connaître :

- `slices` et `annotations` peuvent être des **objets** (dictionnaires) ; seules leurs valeurs sont utilisées.
- Une tranche de **`type` inconnu** fait que `provisionSliceFromPayload()` retourne `undefined`, et la tranche est retirée **sans avertissement**.
- Un contenu de tranche mal formé ne provoque pas d'erreur à l'analyse. Le problème apparaît en général plus tard, au rendu (et les moteurs de rendu affichent souvent un symbole ⚠️).

Ces cas sont couverts par `tests/models/PBOMLDocument.test.js`, à l'aide des exemples de `tests/samples/`.

## `PBOMLDocument`

| Propriété | Source | Remarques |
|:-|:-|:-|
| `pbomlVersion` | `pboml.version` | Toujours `"1.0.0"` pour l'instant. |
| `id` | `document.id` | Sert de nom au fichier téléchargé (`{id}.pboml.yaml`) et s'affiche dans le pied de page. |
| `release_date` | `document.release_date` | Convertie en `Date`. `localizedReleaseDate` la met en forme en `en-CA` / `fr-CA`. |
| `title`, `type`, `copyright` | `document.*` | Objets localisés `{en, fr}`. |
| `user_data` | `document.user_data` | Libre ; conservé tel quel. |
| `slices` | `slices` | Tableau de sous-classes de `Slice`. |
| `annotations` | `annotations` | Tableau d'`Annotation`, triées par id. |
| `otherDocuments` | autres documents `---` | Conservés et réécrits à la sérialisation. |
| `state.prefix` | argument du constructeur | Copié dans chaque tranche et chaque annotation. |

### Fabrique de tranches

```js
static provisionSliceFromPayload(element) {
  switch (element.type) {
    case "bitmap":   return new BitmapSlice(element);
    case "chart":    return new ChartSlice(element);
    case "heading":  return new HeadingSlice(element);
    case "html":     return new HtmlSlice(element);
    case "kvlist":   return new KvListSlice(element);
    case "LaTeX":    return new LaTeXSlice(element);
    case "markdown": return new MarkdownSlice(element);
    case "svg":      return new SvgSlice(element);
    case "table":    return new TableSlice(element);
  }
}
```

Après avoir créé une tranche, le document définit `state.sequence` (position à partir de 1), `state.prefix`, `state.canMoveUp` et `state.canMoveDown`.

### Opérations de structure (utilisées par l'éditeur)

| Méthode | Effet |
|:-|:-|
| `addSlice(slice, index?)` | Insère la tranche (ou l'ajoute à la fin), recalcule les positions et fait défiler la page jusqu'à elle. |
| `duplicateSlice(slice)` | Recrée une tranche à partir de `slice.toArray()` et l'**ajoute à la fin** du document. |
| `deleteSlice(slice)` | Supprime la tranche à la position `state.sequence - 1`, puis fait défiler jusqu'à la tranche la plus proche. |
| `moveSlice(slice, "up"\|"down")` | Échange la tranche avec sa voisine. |
| `resetSlicesMoveability()` | Recalcule `sequence`, `canMoveUp` et `canMoveDown` pour toutes les tranches. |
| `scrollToSliceAtIndex(i)` | Modifie `location.hash` avec l'ancre de la tranche, ou émet `pbomlnavigate` si l'ancre de l'URL semble servir au routage d'une application monopage. |

## Classe de base `Slice`

`src/models/contents/Slice.js` gère les champs communs à la plupart des types de tranches (voir la page [Objets Tranche](./FR:-Slice-Objects) destinée aux rédacteurs) :

| Champ | Valeur par défaut | Remarques |
|:-|:-|:-|
| `id` | – | Les tranches créées dans l'éditeur reçoivent `crypto.randomUUID()`. |
| `type` | – | Redéfini par le constructeur de chaque sous-classe. |
| `readonly` | `false` | Les éditeurs affichent un aperçu en lecture seule au lieu des champs. |
| `display_label` | `true` | |
| `presentation` | `null` | `null`, `figure`, `aside` ou `aside-2`. |
| `print_only` | `false` | Rendu avec `hidden print:flex`. |
| `choices` | – | S'il est présent, l'éditeur affiche une liste de versions possibles à choisir au lieu de l'éditeur de la tranche (voir `ChoiceRenderer`). |
| `referenced_as`, `label` | `{en, fr}` | `labelStrings` les combine pour les légendes. |
| `sources`, `notes`, `alts` | `[]` | Tableaux de chaînes Markdown `{en, fr}`. |
| `content` | – | Sa forme dépend de la sous-classe. |
| `state._unlocked` | `false` | État de verrouillage dans l'éditeur. **Sérialisé** sous `state._unlocked` quand il vaut true. |

Les autres clés de `state` (`isEditingSourceCode`, `isEditingMeta`, `isPreviewing`, `sequence`, `prefix`, `canMoveUp`, `canMoveDown`) n'existent que pendant l'exécution.

### Ancres

```
slice.anchor = `${prefix ? prefix + "-" : ""}${type}-${sequence}`
// p. ex. "table-12", ou "doc2-table-12" avec un préfixe
```

Les ancres dépendent de la **position** et changent quand on déplace des tranches. Les liens qui doivent rester stables ne devraient pas s'y fier.

### Sérialisation (`toArray()`)

`Slice.toArray()` construit un objet simple, puis :

1. retire les clés dont la valeur est la valeur par défaut (`presentation: null`, `readonly: false`, `display_label: true`, `print_only: false`) ;
2. retire les valeurs `null` (`sources`/`notes`/`alts` vides et `referenced_as` vide) ;
3. ajoute `state: { _unlocked: true }` si la tranche est déverrouillée.

Les sous-classes appellent `super.toArray()`, puis ajoutent ou remplacent leurs propres clés.

`PBOMLDocument.serialize()` écrit le document principal et les `otherDocuments` avec `yaml.dump()`, séparés par `---\n`. Le document principal est reconstruit à partir du modèle : **les clés de premier niveau inconnues du document principal sont perdues**, sauf celles placées dans `document.user_data`.

## Annotations

`src/models/Annotation.js`

| Champ | Valeur par défaut | Remarques |
|:-|:-|:-|
| `id` | – | Appelée dans le Markdown avec `[^id]`. |
| `content_type` | `markdown` | `markdown` ou `bibtex`. |
| `content` | `{en, fr}` | Markdown ou entrée BibTeX. |
| `state._unlocked` | `false` | Sérialisé quand il vaut true. |

- `annotationAnchor` → `[prefix_]antn_{id}` ; l'ancre de chaque appel de note est `ref_{annotationAnchor}_{n}`.
- Les annotations Markdown sont affichées avec `MarkdownDriver`, avec la conversion automatique des URL en liens.
- Les annotations BibTeX sont affichées de façon asynchrone par `AnnotationBibtex` avec **citation-js**, au format APA, en `en-CA` / `fr-CA`. Si l'analyse échoue, le contenu brut est affiché en rouge et en police à chasse fixe.

Voir aussi : [Chaîne de rendu → Annotations](./FR:-Dev-Rendering-Pipeline#annotations).

## Fidélité des allers-retours (et lacunes)

L'éditeur s'appuie sur des allers-retours `toArray()` → `provisionSliceFromPayload()` (par exemple dans `duplicateSlice`). Lacunes connues :

- **Tranches graphiques** : `ChartSlice.toArray()` place l'**instance** `DataTable` dans le résultat au lieu de `datatable.toArray()`. `js-yaml` écrit alors toutes ses propriétés, y compris celles qui ne servent qu'à l'exécution (`state.caption`, la `key` de chaque variable, les valeurs par défaut). Voir [Tranche graphique (développeur)](./FR:-Dev-Chart-Slice#particularités-et-limites-connues).
- Les **clés du document principal** autres que `pboml`, `document`, `slices` et `annotations` sont perdues.
- Les **clés inconnues de `document.*`** sont perdues (seuls `id`, `release_date`, `title`, `type`, `copyright` et `user_data` sont conservés). Par exemple, `document.form` dans les exemples de test ne survit pas à un aller-retour.
- `type` dans `document` est toujours écrit sous la forme `{en, fr}`, même s'il était absent.
