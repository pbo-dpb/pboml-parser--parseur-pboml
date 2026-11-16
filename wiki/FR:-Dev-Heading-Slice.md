# Tranche d'en-tête — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche d'en-tête](./FR:-Heading-Slice)

***
🌐  [English](./EN:-Dev-Heading-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `heading` |
| Modèle | `src/models/contents/HeadingSlice.js` |
| Moteur de rendu HTML | `src/Renderers/Html/HeadingSliceHtmlRenderer.js` |
| Éditeur | `src/editors/HeadingSliceEditor.js` |
| Dans le menu d'ajout de tranche | Oui |
| Présentation par défaut | aucune |
| Utilisée par | Table des matières (`Toc.js`), importateur de structure |

## Modèle

```yaml
- type: heading
  level: 1            # commence à 0 ; 0 par défaut
  referenced_as: { en: "1.1", fr: "1.1" }   # facultatif, affiché avant le texte
  content:
    en: Overview of Proposed Spending
    fr: Aperçu des dépenses proposées
```

| Propriété | Analyse |
|:-|:-|
| `content` | Normalisé en `{en, fr}`. |
| `level` | `payload.level ? payload.level : 0` : toute valeur fausse devient `0`. |
| Champs communs de `Slice` | Lus par `super()`, mais `label`, `display_label` et `presentation` sont **retirés** à la sérialisation. |

`toArray()` supprime `display_label`, `label` et `presentation`, puis écrit `content` et `level`.

## Rendu

```js
const headingElType = `h${2 + this.slice.level}`;   // niveau 0 → <h2>
```

- `<h1>` est réservé au titre du document (affiché par `Renderer.js`).
- Classes Tailwind selon le niveau : `0` → `text-3xl` + bordure, `1` → `text-2xl` + bordure, `2` → `text-xl` + bordure pâle, `3` → bordure pâle seulement.
- `content[lang]` est rendu en **Markdown en ligne** (`md.shouldRenderInline(true)`) : l'emphase, les liens et les formules en ligne fonctionnent.
- Si `referenced_as[lang]` est défini, il est affiché dans un `<span>` atténué avant le texte.
- L'en-tête reçoit quand même l'élément englobant standard (`<section id="{ancre}">`) de `SliceHtmlRenderer.renderAsVnode()`. Les blocs de libellé et de métadonnées de la classe de base sont tout de même évalués. Ils sont normalement vides, mais un `label` ou des `notes` ajoutés à la main sur un en-tête **seraient** affichés.

## Édition

`HeadingSlice` **redéfinit `__buildEditorsVnode()`**. Au lieu du formulaire complet de métadonnées, elle affiche seulement :

1. `SliceReferenceEditor` (`referenced_as`)
2. `HeadingSliceEditor` :
   - un `BigRadioInput` avec les choix `H1 → 0`, `> H2 → 1`, `>> H3 → 2`, `>>> H4 → 3`. La valeur est enregistrée avec `parseInt` ;
   - un `BilingualInput` pour `content`.

Il n'y a pas d'éditeur de présentation, de libellé, d'id ni de métadonnées pour les en-têtes.

## Table des matières et structure

- `Toc.js` construit son arborescence à partir des tranches d'en-tête de `level < 3` : les en-têtes de niveau `3` n'apparaissent jamais dans la table des matières.
- L'importateur de structure crée des en-têtes à partir des éléments Markdown `#` (`level = depth - 1`). Un en-tête de niveau 0 intitulé exactement `Notes` fait passer l'importateur en mode annotations.

## Particularités et limites connues

- **Libellés de l'éditeur et niveaux HTML** : l'éditeur appelle le niveau `0` « H1 », mais il est rendu en `<h2>` (et le niveau `3`, « H4 », en `<h5>`). C'est voulu (le titre du document est le vrai `<h1>`), mais cela peut dérouter les auteurs qui comparent avec Word.
- **Les niveaux hors limites** ne sont pas validés. `level: 4` produit un `<h6>` sans style. `level: 5` ou plus produit un nom d'élément invalide (`h7`…), et l'en-tête disparaît dans les faits. La page pour les rédacteurs indique que « rien ne sera rendu » pour les valeurs non prises en charge, ce qui correspond à ce que voient les utilisateurs.
- `display_label`, `label`, `presentation`, `sources`, `notes` et `alts` sont acceptés à l'analyse, mais ne peuvent pas être modifiés dans l'éditeur. `sources`/`notes`/`alts` sont tout de même réécrits par `toArray()` s'ils sont présents.
- Le contenu de l'en-tête est du Markdown en ligne **sans liens vers les notes** : le `<span>` de l'en-tête n'est pas un conteneur `.pboml-prose`, donc `[^1]` ne devient pas un lien.
