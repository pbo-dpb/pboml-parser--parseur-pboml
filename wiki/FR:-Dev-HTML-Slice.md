# Tranche HTML — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche HTML](./FR:-HTML-Slice)

***
🌐  [English](./EN:-Dev-HTML-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `html` |
| Modèle | `src/models/contents/HtmlSlice.js` |
| Moteur de rendu HTML | `src/Renderers/Html/HtmlSliceHtmlRenderer.js` → `src/components/HtmlRenderer.js` |
| Éditeur | `src/editors/HtmlSliceEditor.js` |
| Dans le menu d'ajout de tranche | Oui, marquée **avancée** ; présentation par défaut `figure` |
| Styles à l'exécution | `@twind/core` + `twind.config.js` (préréglages Tailwind et typographie) |

## Modèle

```yaml
- type: html
  remove_default_styles: false   # false par défaut ; true = pas de Tailwind/Twind dans la racine fantôme
  css: |                          # feuille de style facultative de l'auteur, limitée à la racine fantôme
    .highlight { color: rebeccapurple; }
  content:
    en: "<p class='text-lg'>Hello <span class='highlight'>world</span></p>"
    fr: "<p class='text-lg'>Bonjour <span class='highlight'>le monde</span></p>"
```

| Propriété | Valeur par défaut | Remarques |
|:-|:-|:-|
| `content` | – | Fragments HTML `{en, fr}`. |
| `css` | `null` | Une seule feuille de style pour les deux langues. |
| `remove_default_styles` | `false` | Toute valeur vraie devient `true`. |

`toArray()` retire `css` et `remove_default_styles` quand ils sont égaux à `HtmlSlice.defaults` (comparaison souple `==` : une chaîne `css` vide est donc retirée aussi).

## Rendu (`components/HtmlRenderer.js`)

À chaque `mounted`/`updated` :

1. Créer un `<div>` englobant et y attacher un **Shadow DOM ouvert**.
2. À l'intérieur, créer un `<div>` avec des classes de prose (`prose dark:prose-invert max-w-none`, tableaux à défilement horizontal, …).
3. `innerHTML = DOMPurify.sanitize(content[lang])`. Les scripts et les gestionnaires d'événements sont retirés.
4. Construire `adoptedStyleSheets` :
   - sauf si `remove_default_styles` est activé : une feuille Twind (`cssom(new CSSStyleSheet())`) et `observe(tw, shadowRoot)`, pour que **les classes utilitaires Tailwind utilisées dans le HTML soient générées à la demande** ;
   - si `css` est défini : une `CSSStyleSheet` remplie avec `replaceSync(DOMPurify.sanitize(css))`.
5. Remplacer les enfants de la racine du composant par l'élément englobant.

Une langue manquante affiche un symbole ⚠️.

## Édition

`HtmlSliceEditor` :

- Zones de texte `<textarea>` EN et FR (police à chasse fixe), appliquées à l'événement `change` (perte de focus), et non à chaque frappe.
- Quand l'**édition des métadonnées** est activée : une case à cocher *retirer les styles par défaut* et une zone de texte CSS (une valeur vide est enregistrée comme `null`).

Il n'y a pas de mode WYSIWYG. Les aperçus proviennent de l'aperçu standard de la tranche ou de l'aperçu avancé.

## Sécurité

- C'est le type de tranche le plus puissant, et c'est pourquoi il est marqué *avancé* dans le menu d'ajout.
- DOMPurify retire les scripts, mais le HTML peut tout de même contenir des liens, des formulaires, des images de n'importe quelle origine, etc. Traitez les tranches HTML comme du **contenu d'auteur de confiance**.
- Passer du **CSS** dans `DOMPurify.sanitize()` ne revient pas à nettoyer le CSS. Cela protège surtout contre les sorties de type `</style>`. Ne comptez pas dessus pour bloquer les requêtes `url()` ou d'autres attaques par CSS.

## Particularités et limites connues

- Le fichier du moteur de rendu exporte une classe nommée `SvgSliceHtmlRenderer` (erreur de copier-coller). Cela fonctionne, puisque le moteur est trouvé par nom de fichier.
- Les appels de note (`[^1]`) dans le contenu HTML ne deviennent **pas** des liens (Shadow DOM, pas de `.pboml-prose`).
- Les titres placés dans le HTML ne sont pas vus par la table des matières.
- Le CSS généré par Twind peut différer légèrement de celui de la compilation Tailwind v4 utilisée par le reste du composant.
- La racine fantôme est reconstruite à chaque mise à jour du composant par Vue : tout état interactif à l'intérieur (position de défilement, `<details>` ouverts) est perdu.
