# Tranche SVG — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche SVG](./FR:-SVG-Slice)

***
🌐  [English](./EN:-Dev-SVG-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `svg` |
| Modèle | `src/models/contents/SvgSlice.js` |
| Moteur de rendu HTML | `src/Renderers/Html/SvgSliceHtmlRenderer.js` → `src/components/SvgRenderer.js` |
| Éditeur | `src/editors/SvgSliceEditor.js` + `src/editors/SvgSliceTools/{SvgFitter,SvgWhiteRemover,SvgSanitizer}.js` |
| Dans le menu d'ajout de tranche | Oui (présentation par défaut `figure`) |
| Créée par l'importateur de structure | Oui, comme espace réservé vide pour chaque image Markdown |

## Modèle

```yaml
- type: svg
  presentation: figure
  label: { en: Figure title, fr: Titre de la figure }
  alts:                         # fortement recommandé : équivalent textuel
    - { en: "…", fr: "…" }
  content:
    en: "<svg viewBox='0 0 100 50' …>…</svg>"
    fr: "<svg viewBox='0 0 100 50' …>…</svg>"
```

- `content` = balisage SVG brut `{en, fr}` (un fichier par langue).
- À la construction, `state.renderedAnchorIdPrefix = "svg-slice-render-<aléatoire>-"` est généré. Il sert à donner un `id` unique à la racine de chaque `<svg>` affiché.

## Rendu

`SvgSliceHtmlRenderer.renderReadonlyVnode(lang)` :

1. Lève une erreur, et affiche un symbole ⚠️, si `content[lang]` est absent.
2. Analyse le balisage avec `DOMParser` (`image/svg+xml`).
3. Donne à la racine `id = renderedAnchorIdPrefix + lang` et **retire `width` et `height`**, pour que le SVG s'adapte à son conteneur (le `viewBox` doit être présent).
4. Passe le `outerHTML` à `components/SvgRenderer.js`, qui le nettoie avec **DOMPurify** et le place dans un **Shadow DOM** (les styles et les id du SVG ne peuvent donc pas entrer en conflit avec la page).

Classes du conteneur : `w-full @4xl/slice:w-2/3 self-center dark:invert` (l'image occupe les 2/3 de la largeur quand la tranche est large, et ses couleurs sont inversées en mode sombre).

## Édition

`SvgSliceEditor` affiche deux colonnes (EN | FR). Chacune contient :

| Contrôle | Comportement |
|:-|:-|
| Champ de fichier `.svg` | Lu avec `FileReader.readAsText` ; émet `update:modelValue` avec le nouvel objet `{en, fr}`. |
| Aperçu | Fond en damier, pour voir la transparence ; utilise le vrai moteur de rendu. |
| *Plus d'options* (`Details`) | Les trois outils ci-dessous. |
| *Afficher la source* (`Details`) | Zone de texte avec le balisage brut (appliqué à l'événement `change`). |

### Outils SVG

| Outil | Ce qu'il fait réellement |
|:-|:-|
| **Ajuster** (`SvgFitter`) | Affiche le SVG de façon masquée, lit `getBBox()` et réécrit le `viewBox` selon le cadre du dessin (supprime les marges vides). Utilise deux délais de 200 ms pour attendre la mise en page. |
| **Retirer le blanc** (`SvgWhiteRemover`) | Remplace par expression régulière les couleurs hexadécimales `#FFF…` par `rgba(255,255,255,0)`. |
| **Nettoyer** (`SvgSanitizer`) | Retire les entités `&nbsp;`, qui rendent le XML invalide. Malgré son nom, il n'exécute **pas** DOMPurify (le rendu s'en charge). |

Les outils modifient directement `slice.content[lang]` au lieu d'émettre des événements.

## Particularités et limites connues

- **Le mode sombre inverse toutes les couleurs** (`dark:invert`), y compris les couleurs de marque et les photos intégrées au SVG.
- L'expression régulière de `SvgWhiteRemover`, `/#F{3,6}/gi`, reconnaît aussi le début de couleurs comme `#FFF000` ou `#FFFA`, ce qui laisse des couleurs invalides. Elle ignore aussi `white`, `rgb(255,255,255)`, etc.
- Retirer `width`/`height` sans `viewBox` fait parfois revenir le SVG à la taille par défaut (300×150).
- Les appels de note (`[^1]`) placés dans le texte d'un SVG ne deviennent pas des liens (contenu en Shadow DOM, hors `.pboml-prose`).
