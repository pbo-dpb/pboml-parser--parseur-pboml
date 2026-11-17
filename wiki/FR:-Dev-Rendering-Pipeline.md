# Chaîne de rendu

Comment un `PBOMLDocument` devient du HTML en mode lecture seule (moteur de rendu).

***
🌐  [English](./EN:-Dev-Rendering-Pipeline) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## Vue d'ensemble

```
Renderer.js (composant Vue)
 ├─ en-tête : type du document, titre (h1), date de publication localisée  (omis si standalone)
 ├─ pour chaque tranche (ou groupe de tranches partageant `referenced_as`)
 │    getSliceRenderer(slice)
 │      → slice.constructor.rendererObjectForSliceRendererType("html")
 │      → new Renderers/Html/<Nom>.js(slice)
 │    renderer.renderAsVnode(language)
 │      ├─ getSliceWrapperVnode()   <section> | <figure> | <aside>
 │      └─ buildVnodes()
 │           ├─ _renderLabelTitleVnode()   h2 / header / figcaption
 │           ├─ renderReadonlyVnode()      ← propre à chaque type de tranche
 │           └─ _renderMetaVnodes()        alts (repliables), sources, notes
 ├─ <Annotations>                                                  (notes de fin)
 └─ pied de page : droit d'auteur • id du document                (omis si standalone)

mounted/updated → AnnotationAnchorsRenderer remplace [^id] par des liens
mounted         → RendererIntersectionManager observe chaque tranche
```

## Choix du moteur de rendu

Chaque classe de modèle de tranche a une méthode statique :

```js
static rendererObjectForSliceRendererType(rendererType) {
  switch (rendererType) {
    case "html": return "TableSliceHtmlRenderer";
  }
  return super.rendererObjectForSliceRendererType(rendererType);
}
```

`Renderer.js` charge tous les fichiers de `src/Renderers/Html/*.js` à la compilation (`import.meta.glob(..., { eager: true })`) et crée le moteur de rendu à partir du **nom du fichier**. La chaîne retournée ci-dessus doit donc correspondre à un nom de fichier dans `src/Renderers/Html/`. Le nom de la classe dans le fichier n'a pas d'importance (c'est une exportation par défaut).

L'argument `"html"` doit permettre d'ajouter d'autres formats de sortie (DOCX, PDF) plus tard. Pour l'instant, seuls des moteurs de rendu HTML existent.

## `SliceHtmlRenderer` (classe de base)

`src/Renderers/Html/SliceHtmlRenderer.js` donne un cadre uniforme à tous les types de tranches :

| Méthode | Rôle |
|:-|:-|
| `getSliceWrapperVnode(lang)` | Choisit l'élément englobant et son style selon `presentation` : `null` → `<section>`, `figure` → `<figure>` (carte en dégradé), `aside` / `aside-2` → `<aside>` (carte bleue ; `aside-2` ajoute une bordure gauche). Définit `id = slice.anchor`, `aria-labelledby`, et `hidden print:flex` pour `print_only`. |
| `_renderLabelTitleVnode(lang)` | Affiche le libellé (précédé de `referenced_as`, avec un tiret demi-cadratin entre les deux) dans un `<h2>`, un `<header>` (si une présentation est définie) ou un `<figcaption>` (si `figure`). Omis si `display_label` est faux ou s'il n'y a pas de libellé dans cette langue. |
| `renderReadonlyVnode(lang)` | **À redéfinir.** Retourne le corps de la tranche. |
| `_renderMetaVnodes(lang)` | Alts dans un `<details>`, puis Sources et Notes dans des blocs `<dl>`. Chaque entrée est rendue en Markdown. |
| `renderAsVnode(lang, wrap = true)` | Élément englobant + `buildVnodes()`. |
| `buildVnodes(lang, skipTitle)` | `[libellé, corps, métadonnées]`. |

### Regroupement par `referenced_as`

Quand des tranches **consécutives** ont la même valeur `referenced_as` dans la langue courante (par exemple « Tableau 3 »), `Renderer.js` les place dans **un seul élément englobant**, construit à partir de la présentation de la première tranche. Seul le titre de la première tranche est affiché. C'est ainsi qu'une figure peut contenir, par exemple, un en-tête, un graphique et une note en Markdown.

## Markdown

Tout le Markdown passe par `src/MarkdownDriver.js` :

1. `document.pbomlCallbacks.beforeMarkdownRendering(md)` (si la page hôte la définit)
2. `marked` (GFM ; `parseInline` quand `shouldRenderInline(true)` est utilisé)
   - formules **KaTeX** avec `marked-katex-extension`, sortie en MathML, délimiteur en ligne `$$`
   - **linkify-it** (seulement après un appel à `shouldConvertUrls()` ; les annotations l'utilisent)
3. `DOMPurify.sanitize()` (sauté quand `NODE_ENV === "test"`)
4. Une correction pour les exercices financiers : `>2023-24<` devient `2023&shy;-24` avec `hyphenate-character: ''`, pour que Firefox ne coupe pas la ligne au tiret
5. `document.pbomlCallbacks.afterMarkdownRendering(html)` (le résultat n'est **pas** nettoyé de nouveau)

Les éléments qui contiennent du Markdown rendu ont généralement la classe `pboml-prose`. Le traitement des appels de note s'appuie sur cette classe (voir ci-dessous).

## Annotations

- `components/Renderer/Annotations.js` affiche un `<aside role="note">` contenant un `<ol>` de toutes les annotations. L'élément qui correspond à `location.hash` est mis en évidence et reçoit un lien « Revenir au contenu ».
- `AnnotationAnchorsRenderer` s'exécute **après** la mise à jour du DOM par Vue. Il cherche le texte littéral `[^{id}]` dans chaque élément `.pboml-prose` et le remplace par un lien `<sup><a role="doc-noteref">` construit par `Annotation.getAnchorDomElement()`.

> Il s'agit d'un post-traitement du DOM qui contourne Vue. Le code source indique lui-même qu'il devrait à terme être remplacé par une extension Markdown. Par conséquent, les appels de note placés dans du contenu en Shadow DOM (tranches HTML, SVG et LaTeX) ou en dehors d'un conteneur `.pboml-prose` ne deviennent **pas** des liens.

## Moteurs de rendu en Shadow DOM

Trois types de tranches affichent leur contenu dans un **Shadow DOM**, ce qui empêche les styles de l'auteur de déborder sur la page hôte, et inversement :

| Composant | Utilisé par | Remarques |
|:-|:-|:-|
| `components/SvgRenderer.js` | Tranche SVG | `DOMPurify.sanitize()`, puis `innerHTML`. |
| `components/HtmlRenderer.js` | Tranche HTML | DOMPurify ; styles Twind (Tailwind à l'exécution) ajoutés avec `adoptedStyleSheets`, sauf si `remove_default_styles` est activé ; `css` facultatif de l'auteur. |
| `components/LaTeXRenderer.js` | Tranche LaTeX | `HtmlGenerator` de `latex.js` ; sa feuille de style et ses scripts sont chargés depuis jsDelivr. |

Les trois reconstruisent leur racine fantôme (shadow root) à chaque `mounted` et `updated`.

## Graphiques

`ChartSliceHtmlRenderer` charge l'un de deux composants Chart.js de façon asynchrone, dans un `<Suspense>` :

- `Grapher/DataTableGrapher.js` – pour les graphiques `datatable`
- `Grapher/ArrayTableGrapher.js` – pour les anciens graphiques `arraytable`

Les deux utilisent `Grapher/ChartJsMixin.js` (canevas, mode sombre, légende en bas, pas d'animation, `EquidistantColorPalette`). Détails : [Tranche graphique (développeur)](./FR:-Dev-Chart-Slice).

## Navigation, défilement et table des matières

- Le contenu se trouve dans une racine fantôme, donc le défilement natif du navigateur vers une ancre `#` ne fonctionne pas. `App.ce.vue` écoute `hashchange` et `pbomlnavigate` et appelle lui-même `scrollIntoView()` (après 850 ms au premier chargement ou dans l'éditeur, après 10 ms sinon).
- `RendererIntersectionManager` place un `IntersectionObserver` (seuil 1,0) sur chaque tranche et émet `pboml-renderer-intersection-visible` avec l'ancre de la tranche.
- `components/Toc/Toc.js` construit l'arborescence à partir des tranches d'en-tête de `level < 3`. Si le document n'a pas de tels en-têtes, il affiche plutôt les tranches qui ont un libellé. Il met en évidence l'élément visible quand il reçoit cet événement.

## Impression

`src/print.css` est importé avec `@import … print`. Les moteurs de rendu utilisent beaucoup les variantes Tailwind `print:` (par exemple `break-inside-avoid`, et `print:flex` pour les tranches `print_only`).

## Textes localisés

`src/renderer-strings.js` contient les quelques textes dont le moteur de rendu a besoin (`Version textuelle`, `Cellule vide`, `Figure`, `Encart`, …) en `en` et en `fr`. Certains libellés sont encore écrits en dur en anglais, par exemple `Source(s)` / `Note(s)` dans `SliceHtmlRenderer` et le titre `Notes` dans `Annotations.js`.

## Particularités connues

- `RendererIntersectionManager.startObservingForSlice()` ne garde jamais ses observateurs dans `this.observers`, donc `stopObserving()` ne fait rien. Les observateurs restent actifs après le démontage du composant.
- `ChartSliceHtmlRenderer.renderAltsVnodes()` passe `language` comme troisième argument de `renderMetaVnodes(label, content, collapsible)`. Cela fonctionne uniquement parce qu'une chaîne de langue est une valeur vraie.
- `src/Renderers/Html/HtmlSliceHtmlRenderer.js` exporte une classe nommée `SvgSliceHtmlRenderer` (erreur de copier-coller). C'est sans effet, puisque les moteurs de rendu sont trouvés par nom de fichier, mais cela peut prêter à confusion dans les traces d'erreur.
