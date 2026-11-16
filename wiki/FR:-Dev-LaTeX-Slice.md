# Tranche LaTeX — Référence pour les développeurs

> Il n'existe pas encore de page pour les rédacteurs sur ce type de tranche. Cette page documente à la fois le format et sa mise en œuvre.

***
🌐  [English](./EN:-Dev-LaTeX-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | **`LaTeX`** (la casse compte : `latex` ou `Latex` est ignoré sans avertissement) |
| Modèle | `src/models/contents/LaTeXSlice.js` |
| Moteur de rendu HTML | `src/Renderers/Html/LaTeXSliceHtmlRenderer.js` → `src/components/LaTeXRenderer.js` |
| Éditeur | `src/editors/LaTeXSliceEditor.js` |
| Dans le menu d'ajout de tranche | Oui, marquée **avancée** (demande une confirmation) |
| Présentation par défaut | aucune |
| Bibliothèque | [`latex.js`](https://latex.js.org/) |
| Exemple | `tests/samples/latex0.yaml` |

## Quand l'utiliser

Utilisez-la pour du contenu qui exige de vrais **documents ou environnements** LaTeX (équations structurées, `align`, blocs de type théorème, …). Pour des formules simples dans un texte courant, préférez une [tranche Markdown](./FR:-Dev-Markdown-Slice) : les formules KaTeX (`$$…$$`) sont plus légères et suivent les styles de la page.

## Format

```yaml
- type: LaTeX
  label: { en: Model specification, fr: Spécification du modèle }
  content:
    en: |
      \documentclass{article}
      \begin{document}
      The cost is $C = \sum_{t=0}^{T} \frac{c_t}{(1+r)^t}$.
      \end{document}
    fr: |
      \documentclass{article}
      \begin{document}
      Le coût est $C = \sum_{t=0}^{T} \frac{c_t}{(1+r)^t}$.
      \end{document}
```

| Champ | Type | Obligatoire | Remarques |
|:-|:-|:-|:-|
| `type` | chaîne | ✅ | Exactement `LaTeX`. |
| `content` | `{en, fr}` | ✅ | Une source LaTeX que `latex.js` peut analyser. `latex.js` ne prend en charge qu'un **sous-ensemble** de LaTeX et de ses extensions. |
| Champs communs | | | `label`, `presentation`, `sources`, `notes`, `alts`, … fonctionnent comme pour toutes les tranches ([Objets Tranche](./FR:-Slice-Objects)). |

## Modèle

La tranche la plus simple qui soit : `content` est normalisé en `{en, fr}` et réécrit dans `toArray()`. Rien d'autre n'est propre à ce type.

## Rendu (`components/LaTeXRenderer.js`)

```js
const generator = new HtmlGenerator({ hyphenate: false });
const doc = parse(this.payload, { generator });
shadowRoot.append(doc.domFragment());
shadowRoot.append(generator.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/"));
```

- Le résultat est placé dans un **Shadow DOM**, reconstruit à chaque `mounted`/`updated`.
- `stylesAndScripts()` ajoute des balises `<link>`/`<script>` qui chargent **le CSS, les polices et les scripts d'appoint de latex.js depuis jsDelivr**, en version **0.12.4**.
- Les erreurs d'analyse sont interceptées et consignées avec `console.error`. La tranche affiche alors **un bloc vide** (pas de symbole ⚠️).
- Le composant de rendu est chargé de façon asynchrone : `latex.js` n'est téléchargé que si un document contient une tranche LaTeX.

## Édition

`LaTeXSliceEditor` affiche deux zones de texte `<textarea>` à chasse fixe (EN, FR). Les modifications sont appliquées à l'événement `change` (quand le champ perd le focus), et non pendant la saisie. L'éditeur ne vérifie pas la syntaxe ; utilisez l'aperçu de la tranche pour contrôler le résultat.

## Particularités et limites connues

- **Dépendance à un CDN à l'exécution.** Les pages fournies (`index.html`, `editor.html`) définissent une politique de sécurité du contenu stricte (`default-src` sans source ; `script-src 'self'` ; `style-src 'self' 'unsafe-inline'`). Sauf si la page hôte autorise jsDelivr, la feuille de style, les polices et les scripts de latex.js sont **bloqués** et le résultat s'affiche sans mise en forme. Héberger nous-mêmes les fichiers `dist/` de latex.js éliminerait cette dépendance.
- **Versions différentes.** `package.json` demande `latex.js ^0.12.6`, mais l'URL du CDN est fixée à `0.12.4`. L'analyseur JavaScript et le CSS peuvent donc provenir de versions différentes.
- Les erreurs ne sont pas montrées aux auteurs dans l'éditeur (seulement dans la console).
- Les appels de note (`[^1]`) dans le rendu LaTeX ne deviennent pas des liens (Shadow DOM, pas de `.pboml-prose`).
- Le rendu ne suit pas le thème sombre.
- Il n'existe pas de page pour les rédacteurs, et `LaTeX` (comme `html`) est absent de la liste des types de tranches dans [Objets Tranche](./FR:-Slice-Objects). Il serait utile d'ajouter les deux.
