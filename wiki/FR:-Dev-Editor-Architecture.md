# Architecture de l'éditeur

Comment l'éditeur visuel (`<pboml-parser edit="true">`) est construit et comment il modifie un `PBOMLDocument`.

***
🌐  [English](./EN:-Dev-Editor-Architecture) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## Principe directeur : modifier le modèle directement

L'éditeur n'a **pas de magasin d'état séparé** et ne garde aucune copie du document. Chaque composant d'édition reçoit des instances du modèle (`PBOMLDocument`, `Slice`, `DataTable`, …) en props et les **modifie directement**. La réactivité profonde de Vue se charge ensuite :

- de mettre à jour l'éditeur et les aperçus des tranches ;
- de déclencher l'observateur profond de `Editor.vue`, qui émet `pboml-editor-document-updated` avec `pbomlDocument.serialize()` comme détail.

**Pour sauvegarder le document, la page hôte écoute cet événement.** (Le bouton *Télécharger* de `EditorPreviews.vue` est actuellement mis en commentaire.)

Certains éditeurs de tranche émettent encore des événements `update:*` (`update:modelValue`, `update:datatable`). Le gestionnaire, défini dans la méthode `_buildEditorInputVnodes()` du modèle, se contente de réaffecter la valeur au modèle.

## Démarrage

```
App.ce.vue
 ├─ contenu présent ? → PBOMLDocument → <Editor>
 └─ aucun contenu     → <FilePicker>
                          ├─ « nouveau document » → new PBOMLDocument([{ pboml: { version: "1.0.0" } }])
                          └─ FilePickerInput : fichier .yaml, ou PDF dont la métadonnée Sujet contient du PBOML (pdf-lib)
```

`Editor.vue` et `FilePicker.vue` sont chargés avec `defineAsyncComponent` : les pages qui n'affichent qu'un rendu ne téléchargent jamais le code de l'éditeur.

## Disposition

```
Editor.vue
 ├─ bandeau d'avertissement « contenu déverrouillé » (si une tranche ou une annotation a state._unlocked)
 ├─ onglets : Contenu | Méta | Avancé                    + EditorPreviews (aperçu / aperçu avancé)
 ├─ Contenu → EditorMainContent.js
 │    ├─ onglets : Tranches | Annotations • Structure   + bouton de table des matières
 │    ├─ Tranches    → EditorSlices.js
 │    │                 SliceStager (+)  → SliceEditor  → SliceStager (+) → SliceEditor …
 │    ├─ Annotations → AnnotationsEditor.js → AnnotationEditor.js
 │    └─ Structure   → StructureEditor.js → StructureTree + StructureImporter
 ├─ Méta   → DocumentMetaEditor.js (titre, id)
 └─ Avancé → EditorAdvanced.vue → YamlEditor.vue (« Valider les modifications »)
```

## Cycle de vie de l'édition d'une tranche

### 1. Création – `SliceStager.vue`

Le bouton ⊕ placé entre les tranches ouvre un `<dialog>` avec un bouton par type de tranche. Au clic :

1. Les types « avancés » (**Bitmap, LaTeX, HTML**) demandent d'abord une confirmation (`advanced_slice_warning`).
2. `new SliceClass({})` est créé avec `id = crypto.randomUUID()` et `state._unlocked = true`.
3. Les tranches Bitmap, SVG, Tableau, HTML et Graphique reçoivent `presentation = "figure"`.
4. L'événement `new` est émis, et `EditorSlices` appelle `pbomlDocument.addSlice(slice, index)`.

### 2. Le cadre – `editors/SliceEditor.js`

Chaque tranche de l'éditeur passe par `slice.renderEditingVnode()`, qui l'entoure de `SliceEditor`. L'affichage dépend de `state` :

| État | Affichage |
|:-|:-|
| `_unlocked === false` | Un **aperçu EN \| FR** réduit, en lecture seule et inerte. Seul le cadenas à gauche est actif. |
| `_unlocked === true` | Un `<fieldset>` avec une barre d'outils (supprimer, dupliquer, déplacer ↑↓, code source, aperçu, métadonnées) et l'un des trois contextes ci-dessous. |

| Contexte (un seul à la fois) | Composant |
|:-|:-|
| `isPreviewing = "en" \| "fr"` | `Renderer.methods.renderSliceAsVnode(slice, lang)` |
| `isEditingSourceCode` | `SliceSourceCodeEditor.vue` – zone de texte YAML de `slice.toArray()` |
| par défaut | `slice.__buildEditorsVnode()` – le formulaire |

`resetSliceState()` remet les trois indicateurs à zéro avant de passer à un autre contexte.

### 3. Le formulaire – `Slice.__buildEditorsVnode()`

Le formulaire est construit par le **modèle**, et non par le composant d'édition :

```
SlicePresentationEditor   (presentation : aucune | figure | aside | aside-2)
SliceReferenceEditor      (referenced_as)
SliceLabelEditor          (label)
SliceIdEditor             (id)
choices ? ChoiceRenderer : this._buildEditorInputVnodes()   ← éditeur propre au type
SliceMetasEditor          (alts, sources, notes)
```

Les quatre premiers n'affichent leurs champs que si `state.isEditingMeta` est vrai (bouton « métadonnées » de la barre d'outils). Chaque sous-classe redéfinit `_buildEditorInputVnodes()` pour ajouter son propre éditeur, situé dans `src/editors/`. `HeadingSlice` redéfinit entièrement `__buildEditorsVnode()`, puisque les en-têtes n'ont ni libellé, ni présentation, ni métadonnées.

### 4. Tranches en lecture seule

Chaque éditeur propre à un type vérifie d'abord `slice.readonly`. S'il est vrai, l'éditeur affiche le message « tranche en lecture seule » et un aperçu EN/FR au lieu des champs.

### 5. Verrouillage (`LockStateToggler`)

`state._unlocked` est un **indicateur de suivi du travail**. Il est enregistré dans le YAML, pour que les tranches inachevées restent visiblement « ouvertes » d'une séance à l'autre. `Editor.vue` affiche un bandeau d'avertissement tant qu'un élément est déverrouillé. Les annotations ont le même indicateur.

### 6. Édition du code source – `SliceSourceCodeEditor.vue`

Affiche `yaml.dump(slice.toArray())`, valide le YAML pendant la saisie, avertit si `type` change et, au clic sur *Appliquer*, exécute :

```js
Object.assign(props.slice, yaml.load(code.value));
```

> ⚠️ Il s'agit d'une **affectation superficielle sur l'instance existante**. Les modèles imbriqués ne sont **pas** reconstruits. Par exemple, modifier ici les `variables`/`content` d'un tableau ne fait que définir des propriétés simples sur la tranche. Le `datatable` de la tranche (celui qu'utilisent le moteur de rendu et `toArray()`) ne change pas, et ces modifications sont donc perdues. Pour les tranches riches en données, utilisez plutôt *Avancé → Code* (qui analyse de nouveau tout le document) ou les éditeurs dédiés.

## Édition au niveau du document

### Avancé → Code (`EditorAdvanced.vue` + `YamlEditor.vue`)

Affiche tout le document sérialisé dans une zone de texte et le valide avec `yaml.loadAll` pendant la saisie. *Valider les modifications* exécute `PBOMLDocument.initFromYaml()` et remplace `this.$root.pbomlDocument`. C'est la façon la plus sûre de modifier la structure à la main.

### Importateur de structure (`StructureImporter.vue`)

Il crée le **squelette** d'un document à partir de sources EN et FR existantes (Markdown collé, ou fichier `.docx` converti avec **mammoth** → HTML → `HtmlMarkdownConverter`/Turndown) :

| Élément Markdown | Résultat |
|:-|:-|
| `heading` | `HeadingSlice` avec `level = depth - 1` et son texte |
| `paragraph` (les paragraphes consécutifs sont fusionnés) | `MarkdownSlice` vide |
| `table` | `TableSlice` vide, présentation `figure` |
| `image` | `SvgSlice` vide, présentation `figure` |
| en-tête de niveau 0 intitulé exactement `Notes` | Tout ce qui suit est lu comme des annotations (`list_item`, id tiré du `N.` initial, lien de retour `[↑]` de Word retiré) |

Les structures EN et FR sont associées **par position**. Une différence de type ou de niveau d'en-tête est signalée (`state._structureImporterError`). Quand les deux langues correspondent, les textes des en-têtes sont fusionnés et l'en-tête est verrouillé. Tout le reste est créé **déverrouillé**, pour que les auteurs voient ce qu'il reste à remplir. Les nouvelles tranches et annotations sont **ajoutées à la fin** du document.

Pour les fichiers Word, `StructureImporterDocxPicker.vue` supprime aussi tout ce qui précède le titre H1 « Highlights / Faits saillants » des gabarits de rapport du DPB.

### Éditeur d'annotations

`AnnotationsEditor.js` insère les nouvelles annotations (déverrouillées) à une position donnée. Une option **« garder organisé »** renumérote les id dans l'ordre (`id = i + 1`) et les rend non modifiables. Elle s'active automatiquement si les id existants sont déjà des entiers consécutifs. Attention : les appels de note dans le Markdown (`[^id]`) ne sont **pas** mis à jour quand les id changent. `AnnotationEditor.js` modifie une annotation (contenu EN/FR, `content_type`), avec le même principe de verrouillage que les tranches.

## Aperçus

- **Aperçu** (`EditorPreviews.vue`) – un `<dialog>` plein écran avec le `Renderer` en lecture seule et des onglets EN/FR.
- **Aperçu avancé** – ouvre une fenêtre contextuelle, y charge le script du composant depuis `window.pbomlParserScriptUrl` et y place deux éléments `<pboml-parser>` (EN, FR) côte à côte. Leur attribut `payload` (base64) est mis à jour à mesure que le document change.

## Champs réutilisables (`components/Editor/Inputs/`)

| Composant | Rôle |
|:-|:-|
| `BilingualInput.vue` | Champs EN + FR liés à un objet `{en, fr}` (option `inputSize: "lg"` pour des zones de texte). |
| `MarkdownTextarea.vue` / `MarkdownInput.vue` | Saisie en Markdown (avec un bouton pour coller en texte brut). |
| `BigRadioInput.vue`, `RadioInput.vue`, `SelectInput.vue`, `CheckboxInput.vue`, `NumberInput.vue`, `SingleInput.vue` | Contrôles de formulaire génériques. |
| `BibtexTextarea.vue` | Saisie BibTeX pour les annotations. |
| `ChoiceRenderer.js` | Affiche `slice.choices` sous forme de boutons radio avec un aperçu de chaque choix. En choisir un copie ses clés dans la tranche. |

## Langue de l'éditeur

L'interface de l'éditeur utilise **`document.documentElement.lang`** (la langue de la page hôte) et `src/editor-strings.js`. Elle n'utilise **pas** la prop `language` du composant. Les auteurs modifient toujours les deux langues côte à côte.

## Particularités connues

- `LockStateToggler` construit son id avec `` `toggle-lock-` - crypto.randomUUID() `` (une soustraction au lieu d'une concaténation) : l'id vaut donc toujours `NaN`.
- `PBOMLDocument.duplicateSlice()` ajoute toujours la copie à la **fin** du document, et non juste après l'original.
- `EditorAdvanced.handleSave()` remplace `this.$root.pbomlDocument`. Dans un élément personnalisé, `$root` est l'instance de `App.ce.vue`. Cela fonctionne actuellement, mais dépend de cette structure de composants.
