# Guide du développeur

Cette section du wiki s'adresse aux **développeurs qui travaillent sur le code du parseur et de l'éditeur PBOML**. Si vous rédigez des documents PBOML, commencez plutôt par [Anatomie d'un document PBOML](./FR:-Anatomie-d'un-document-PBOML) et les pages de référence des tranches.

***
🌐  [English](./EN:-Developer-Guide) • Français
***

## Ce qu'est ce projet

Le projet fournit **un composant Web**, `<pboml-parser>`, qui remplit deux rôles :

| Mode | Activation | Fonction |
|:-|:-|:-|
| **Moteur de rendu** | par défaut | Analyse un contenu PBOML (YAML) et l'affiche en HTML bilingue et accessible. |
| **Éditeur** | attribut `edit="true"` | Charge un éditeur visuel (à la demande, dans un fichier JavaScript séparé) qui permet de créer et de modifier un document PBOML, puis de l'exporter. |

Un second composant, plus petit, `<pboml-toc>`, affiche la table des matières du même contenu.

Les deux sont des composants Vue 3 compilés en **éléments personnalisés** (`defineCustomElement`) et déclarés dans `src/main.js`.

## Vue d'ensemble

```
         Chaîne YAML / URL de données base64
                        │
                        ▼
   ┌──────────────────────────────────────────┐
   │ App.ce.vue  (<pboml-parser>)             │
   │  js-yaml.loadAll() → new PBOMLDocument() │
   └──────────────────────────────────────────┘
                        │  PBOMLDocument (models/)
          ┌─────────────┴─────────────┐
          ▼                           ▼
  Renderer (lecture seule)      Editor (edit="true")
  components/Renderer/          components/Editor/
          │                           │
          ▼                           ▼
  Renderers/Html/*SliceHtmlRenderer   editors/*SliceEditor
  (un par type de tranche)            (un par type de tranche)
          │                           │
          └──── utilitaires communs ──┘
     MarkdownDriver · DataTable · Grapher (Chart.js)
                        │
                        ▼
      PBOMLDocument.serialize() → YAML (export)
```

Le code est organisé en trois couches :

1. **Modèle** (`src/models/`) – Des classes JavaScript simples. `PBOMLDocument` contient les métadonnées du document, une liste de sous-classes de `Slice` et une liste d'`Annotation`. Chaque modèle sait se construire à partir d'un contenu YAML (constructeur) et se reconvertir en objet simple (`toArray()`). Voir [Modèle de document et analyse](./FR:-Dev-Document-Model-and-Parsing).
2. **Moteurs de rendu** (`src/Renderers/Html/`, `src/components/Renderer/`) – Des classes qui transforment une tranche en nœuds virtuels (vnodes) Vue. Le modèle choisit son moteur de rendu avec `rendererObjectForSliceRendererType("html")`. Voir [Chaîne de rendu](./FR:-Dev-Rendering-Pipeline).
3. **Éditeurs** (`src/editors/`, `src/components/Editor/`) – Des composants Vue qui modifient directement le modèle. La réactivité de Vue met à jour les aperçus et déclenche un événement `pboml-editor-document-updated` à chaque modification. Voir [Architecture de l'éditeur](./FR:-Dev-Editor-Architecture).

## Organisation des dossiers

| Chemin | Contenu |
|:-|:-|
| `src/main.js` | Déclare les éléments `pboml-parser` et `pboml-toc`. Expose `window.pbomlParserScriptUrl`, utilisé par la fenêtre d'aperçu avancé. |
| `src/App.ce.vue` | Racine de `<pboml-parser>`. Décode le contenu, construit le `PBOMLDocument`, choisit Renderer / Editor / FilePicker, gère la navigation par ancre et surveille les changements de l'attribut `payload`. |
| `src/Toc.ce.vue` | Racine de `<pboml-toc>`. |
| `src/models/PBOMLDocument.js` | Modèle de document, fabrique de tranches (`provisionSliceFromPayload`), sérialisation. |
| `src/models/Annotation.js` | Modèle des notes (Markdown ou BibTeX). |
| `src/models/contents/` | Classe de base `Slice`, une sous-classe par type de tranche et les modèles communs `DataTable/` et `ArrayTable/`. |
| `src/Renderers/Html/` | Classe de base `SliceHtmlRenderer` et un moteur de rendu HTML par type de tranche. |
| `src/components/Renderer/` | Composant Vue `Renderer`, rendu des annotations, observateur d'intersection. |
| `src/components/Grapher/` | Composants Chart.js qui dessinent les tranches graphiques. |
| `src/components/Editor/` | Structure de l'éditeur, onglets, champs de saisie, éditeur de DataTable, importateur de structure, aperçus. |
| `src/editors/` | `SliceEditor` (le cadre affiché autour de chaque tranche en mode édition) et un éditeur par type de tranche. |
| `src/MarkdownDriver.js` | Convertit le Markdown en HTML (marked + KaTeX + DOMPurify + fonctions de rappel de la page hôte). |
| `src/HtmlMarkdownConverter.js` | Convertit le HTML en Markdown (Turndown). Utilisé pour importer des documents Word. |
| `src/Callbacks.js` | Fonctions facultatives que la page hôte peut définir dans `document.pbomlCallbacks`. |
| `src/editor-strings.js`, `src/renderer-strings.js` | Textes de l'interface en anglais et en français. |
| `tests/` | Suites Vitest (lancées avec Vite+) et exemples YAML. |

## Outils

| Tâche | Commande |
|:-|:-|
| Installation | `pnpm install` |
| Serveur de développement (HTTPS, port 8080) | `pnpm run dev` |
| Tests unitaires (Vitest, `happy-dom`) | `pnpm run test` |
| Compilation de production | `pnpm run build` |

- La compilation utilise **Vite+** (`vp`), avec `@vitejs/plugin-vue` réglé à `customElement: true`, Tailwind CSS v4 et un module SSL de base.
- La compilation a quatre points d'entrée : `src/main.js`, `index.html`, `index.fr.html` et `editor.html`. Elle génère un fichier `manifest.json`, que les pages hôtes utilisent pour trouver la version courante (voir le README).
- Le flux GitHub **`compile-and-release`** se lance à la main (`workflow_dispatch`). Il compile le projet, copie `dist/.vite/manifest.json` vers `dist/manifest.json`, publie une version `latest` avec `dist.zip`, téléverse `dist/` dans S3 et invalide le cache CloudFront.

### Pages d'entrée locales

| Page | Usage |
|:-|:-|
| `index.html` / `index.fr.html` | Moteur de rendu sans contenu (pratique pour injecter un contenu depuis les outils de développement du navigateur). |
| `editor.html` | `<pboml-parser edit="true">` – ouvre le sélecteur de fichier, puis l'éditeur. |
| `tests.html` | Page de test manuel. |

## Intégration dans une page (résumé)

| Attribut | Type | Rôle |
|:-|:-|:-|
| `payload` | chaîne | YAML PBOML brut, ou `data:text/yaml;base64,…`. En mode rendu, les changements de cet attribut sont surveillés (avec un délai de 500 ms) et le document est analysé de nouveau. |
| `edit` | quelconque | S'il est présent (valeur vraie), charge l'éditeur. |
| `standalone` | quelconque | Masque l'en-tête (type, titre, date) et le pied de page (droit d'auteur, identifiant). |
| `prefix` | chaîne | Préfixe de tous les identifiants et ancres générés. Obligatoire quand plusieurs documents sont affichés sur la même page. |
| `language` | chaîne | `en` ou `fr`. Par défaut, la valeur de `<html lang>`. |

**Événements émis sur `document` :**

| Événement | Détail | Moment |
|:-|:-|:-|
| `pboml-editor-document-updated` | `{ pbomlDocument: <YAML sérialisé> }` | Toute modification du document dans l'éditeur, même profonde. |
| `pboml-renderer-intersection-visible` | `{ anchor }` | Une tranche est entièrement visible à l'écran (la table des matières s'en sert pour mettre en évidence la section courante). |
| `pbomlnavigate` (sur `window`) | chaîne d'ancre | Navigation vers une tranche quand `location.hash` sert au routage d'une application monopage. |

**Fonctions de rappel de la page hôte** (`document.pbomlCallbacks`) :

- `beforeMarkdownRendering(markdown) → markdown`
- `afterMarkdownRendering(html) → html` (le HTML retourné est affiché **sans autre nettoyage**)

> ⚠️ Ne transmettez que du contenu de confiance au composant. Le Markdown produit est nettoyé avec DOMPurify, mais pas tout le reste : par exemple, le `title`, le `type` et le `copyright` du document sont insérés avec `innerHTML`.

## Types de tranches en un coup d'œil

| `type` YAML | Modèle | Moteur de rendu HTML | Éditeur | Page développeur |
|:-|:-|:-|:-|:-|
| `heading` | `HeadingSlice` | `HeadingSliceHtmlRenderer` | `HeadingSliceEditor` | [En-tête](./FR:-Dev-Heading-Slice) |
| `markdown` | `MarkdownSlice` | `MarkdownSliceHtmlRenderer` | `MarkdownSliceEditor` | [Markdown](./FR:-Dev-Markdown-Slice) |
| `table` | `TableSlice` (+ `DataTable`) | `TableSliceHtmlRenderer` | `TableSliceEditor` | [Tableau](./FR:-Dev-Table-Slice) |
| `chart` | `ChartSlice` (+ `DataTable` ou `ArrayTable`) | `ChartSliceHtmlRenderer` | `ChartSliceEditor` | [Graphique](./FR:-Dev-Chart-Slice) |
| `svg` | `SvgSlice` | `SvgSliceHtmlRenderer` | `SvgSliceEditor` | [SVG](./FR:-Dev-SVG-Slice) |
| `bitmap` | `BitmapSlice` | `BitmapSliceHtmlRenderer` | `BitmapSliceEditor` | [Bitmap](./FR:-Dev-Bitmap-Slice) |
| `html` | `HtmlSlice` | `HtmlSliceHtmlRenderer` | `HtmlSliceEditor` | [HTML](./FR:-Dev-HTML-Slice) |
| `kvlist` | `KvListSlice` (+ `KvListVariablePair`) | `KvListSliceHtmlRenderer` | `KvSliceEditor` | [Liste clé-valeur](./FR:-Dev-KV-Slice) |
| `LaTeX` | `LaTeXSlice` | `LaTeXSliceHtmlRenderer` | `LaTeXSliceEditor` | [LaTeX](./FR:-Dev-LaTeX-Slice) |

> Les valeurs de `type` **respectent la casse** : il faut écrire exactement `LaTeX`. Une tranche de type inconnu est **ignorée sans avertissement** lors de l'analyse.

## Pages développeur

* [Modèle de document et analyse](./FR:-Dev-Document-Model-and-Parsing)
* [Chaîne de rendu](./FR:-Dev-Rendering-Pipeline)
* [Architecture de l'éditeur](./FR:-Dev-Editor-Architecture)
* [Ajouter un type de tranche](./FR:-Dev-Adding-a-Slice-Type)
