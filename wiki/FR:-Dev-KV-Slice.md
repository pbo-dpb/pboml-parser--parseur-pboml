# Tranche clé-valeur (liste KV) — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche KV](./FR:-KV-Slice)

***
🌐  [English](./EN:-Dev-KV-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `kvlist` |
| Modèle | `src/models/contents/KvListSlice.js` + `src/models/contents/KvListVariablePair.js` |
| Moteur de rendu HTML | `src/Renderers/Html/KvListSliceHtmlRenderer.js` (le balisage lui-même vient de `KvListVariablePair`) |
| Éditeur | `src/editors/KvSliceEditor.js` |
| Dans le menu d'ajout de tranche | Oui |
| Présentation par défaut | aucune |

## Modèle

```yaml
- type: kvlist
  prototype:
    key:
      type: markdown            # markdown | number | (autre valeur = brut)
      label: { en: Measure, fr: Mesure }
    value:
      type: markdown
      label: { en: Cost, fr: Coût }
    display_labels: true        # affiche « MESURE • » devant chaque clé et valeur
  content:
    - key:   { content: { en: "Option A", fr: "Option A" } }
      value: { content: { en: "$1.2 billion", fr: "1,2 milliard $" } }
    - key:   { content: { en: "Option B", fr: "Option B" } }
      value: { content: { en: ["$300M", "over 5 years"], fr: ["300 M$", "sur 5 ans"] } }
```

### `KvListSlice`

| Propriété | Remarques |
|:-|:-|
| `prototype.key/value.type` | Détermine la façon d'afficher le contenu (voir plus bas). |
| `prototype.key/value.label` | `{en, fr}` ; affiché si `display_labels` est vrai, et utilisé comme titre dans l'éditeur. |
| `prototype.display_labels` | Converti en booléen. Écrit seulement s'il vaut `true`. |
| `content` | Tableau de `KvListVariablePair`. Une valeur qui n'est pas un tableau devient `[]`. |

Méthodes : `appendKvEntry()` et `removeKvEntry(entry)` (utilisées par l'éditeur).

### `KvListVariablePair`

| Propriété | Remarques |
|:-|:-|
| `key.content`, `value.content` | Généralement `{en, fr}`. La valeur d'une langue peut être un **tableau** : ses éléments sont affichés séparément et reliés par un séparateur `•`. |
| `display_labels` | Lu dans la paire s'il est présent, sinon hérité du prototype. **Non écrit** (voir les particularités). |
| `prototype` | Référence au prototype de la tranche. |

### Rendu selon le type (`renderKeyOrValueContentToHtml`)

| `type` | Rendu |
|:-|:-|
| `markdown` | `MarkdownDriver.render(value[lang] ?? value)` (en cas d'erreur → chaîne vide). |
| `number` | `Intl.NumberFormat(lang).format(value)`. |
| autre / absent | `value[lang] ?? value`, inséré en HTML brut. |

## Rendu

```html
<dl class="flex flex-col gap-2">
  <div class="border-l-2 pl-2">
    <dt>[LIBELLÉ •] <span class="pboml-prose">clé</span></dt>
    <dd>[LIBELLÉ •] <span class="pboml-prose">valeur</span></dd>
  </div>
  …
</dl>
```

Les clés sont en gras. Les libellés sont en petites majuscules. Les deux `span` ont la classe `pboml-prose`, donc les appels de note fonctionnent dans les clés et les valeurs.

## Édition

`KvSliceEditor` :

- Quand l'**édition des métadonnées** est activée : des `BilingualInput` pour les libellés de clé et de valeur, et une case à cocher *afficher les libellés*.
- Un bloc par paire : un bouton 🗑️ pour supprimer et deux `BilingualInput` (clé, valeur). Les titres viennent des libellés du prototype (par défaut « Key • Clé » / « Value • Valeur »).
- ➕ ajoute une paire vide.

L'éditeur utilise toujours `BilingualInput`, quel que soit le `type` du prototype. Il n'y a pas de champ numérique ni d'éditeur pour les valeurs en tableau.

## Particularités et limites connues

- **Objets par défaut partagés pour les nouvelles paires.** Dans le constructeur de `KvListVariablePair` (sans contenu), `{ ...defaultStructures }[type]` ne copie que l'objet **extérieur**. Le `key.content` **et** le `value.content` de chaque nouvelle paire pointent donc vers le **même** objet `{en: "", fr: ""}` (réutilisé aussi pour les paires suivantes). L'éditeur remplace l'objet entier à chaque saisie (`entry.key.content = value`), ce qui masque le problème en pratique. Du code qui modifierait `content.en` directement changerait plusieurs paires à la fois.
- La valeur par défaut de `value.content` est choisie à partir de `prototype.key.type` au lieu de `prototype.value.type` (erreur de copier-coller).
- Une valeur `display_labels` propre à une paire est lue, mais jamais réécrite par `toArray()` : elle est perdue à l'enregistrement.
- Les valeurs en tableau sont affichées, mais l'éditeur visuel n'a pas de champ adapté (`BilingualInput` attend des chaînes). Modifiez-les dans le code source.
- `KvListSliceHtmlRenderer.js` déclare une constante `language` inutilisée au niveau du module.
