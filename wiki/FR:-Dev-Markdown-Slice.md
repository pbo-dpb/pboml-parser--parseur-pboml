# Tranche Markdown — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche Markdown](./FR:-Markdown-Slice)

***
🌐  [English](./EN:-Dev-Markdown-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `markdown` |
| Modèle | `src/models/contents/MarkdownSlice.js` |
| Moteur de rendu HTML | `src/Renderers/Html/MarkdownSliceHtmlRenderer.js` |
| Éditeur | `src/editors/MarkdownSliceEditor.js` (utilise `components/Editor/Inputs/MarkdownTextarea.vue`) |
| Dans le menu d'ajout de tranche | Oui (premier bouton) |
| Présentation par défaut | aucune |
| Créée par l'importateur de structure | Oui, comme espace réservé vide pour chaque suite de paragraphes |

La tranche Markdown est le type le plus simple et le meilleur modèle pour en créer de nouveaux.

## Modèle

```yaml
- type: markdown
  content:
    en: "Some **text** with a note[^1] and math $$x^2$$."
    fr: "Du **texte** avec une note[^1] et des maths $$x^2$$."
```

- `content` est normalisé en `{en, fr}`.
- `toArray()` = `super.toArray()` + `content: {en, fr}`.
- Tous les champs communs de `Slice` (libellé, présentation, sources, notes, alts, …) sont pris en charge.

## Rendu

```js
renderReadonlyVnode(language) {
  const md = new MarkdownDriver();
  return h("div", { class: "pboml-prose", innerHTML: md.render(this.slice.content[language]) });
}
```

L'essentiel se passe dans `MarkdownDriver` (voir [Chaîne de rendu → Markdown](./FR:-Dev-Rendering-Pipeline#markdown)) :

| Fonction | Mise en œuvre |
|:-|:-|
| Markdown de style GitHub (tableaux, texte barré, …) | `marked` avec `gfm: true` |
| Formules mathématiques | `marked-katex-extension`, sortie MathML, délimiteur en ligne **`$$…$$`** |
| Nettoyage | DOMPurify (sauté pendant les tests) |
| Fonctions de rappel de la page hôte | `document.pbomlCallbacks.before/afterMarkdownRendering` |
| Correction de coupure des exercices financiers | `2023-24` seul dans un élément reçoit un trait d'union conditionnel |
| Appels de note | `[^id]` est laissé tel quel par marked, puis remplacé par `AnnotationAnchorsRenderer`, parce que le conteneur a la classe `pboml-prose` |

Un contenu qui n'est ni une chaîne ni un nombre (par exemple une langue manquante) est rendu comme une chaîne vide, sans erreur.

## Édition

`MarkdownSliceEditor` affiche deux `MarkdownTextarea` (EN | FR) côte à côte. Chaque modification émet `update:modelValue` avec un nouvel objet `{en, fr}`. Le gestionnaire défini dans `MarkdownSlice._buildEditorInputVnodes()` l'affecte à `slice.content`.

Les tranches en lecture seule affichent le message standard et des aperçus EN/FR.

## Particularités et limites connues

- `marked.use()` est appelé dans **chaque** constructeur de `MarkdownDriver`, et `marked` est un singleton au niveau du module : les extensions sont donc enregistrées encore et encore. De plus, dès qu'**un** `MarkdownDriver` appelle `shouldConvertUrls()` (ce que font les annotations), la conversion des URL en liens reste active pour tous les rendus suivants, y compris ceux des tranches Markdown.
- Les liens vers les notes sont ajoutés par un post-traitement du DOM, après le rendu de Vue. Le contenu modifié par `afterMarkdownRendering` ou rendu hors d'un conteneur `.pboml-prose` n'est pas traité.
- Les erreurs KaTeX ne sont pas levées (`throwOnError: false`). Une formule invalide est affichée avec le message d'erreur de KaTeX.
