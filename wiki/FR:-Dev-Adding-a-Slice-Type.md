# Ajouter un type de tranche

Liste de tous les endroits où un type de tranche doit être déclaré. Prenez un type simple existant (par exemple `MarkdownSlice` ou `LaTeXSlice`) comme modèle.

***
🌐  [English](./EN:-Dev-Adding-a-Slice-Type) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

Dans les étapes ci-dessous, `Foo` est le préfixe de classe et `foo` le type YAML.

## 1. Modèle – `src/models/contents/FooSlice.js`

```js
import { h, defineAsyncComponent } from "vue";
import Slice from "./Slice";

export default class FooSlice extends Slice {
  constructor(payload) {
    super(payload);
    this.content = { en: payload.content?.en, fr: payload.content?.fr };
    this.type = "foo";                       // doit correspondre au `type` YAML
  }

  _buildEditorInputVnodes() {
    const vnodes = super._buildEditorInputVnodes();
    vnodes.push(h(defineAsyncComponent(() => import("../../editors/FooSliceEditor.js")), {
      slice: this,
      "onUpdate:modelValue": (value) => { this.content = value; },
    }));
    return vnodes;
  }

  toArray() {
    const array = super.toArray();
    array.content = { en: this.content?.en, fr: this.content?.fr };
    return array;
  }

  static rendererObjectForSliceRendererType(rendererType) {
    switch (rendererType) {
      case "html": return "FooSliceHtmlRenderer";   // = nom de fichier dans src/Renderers/Html/
    }
    return super.rendererObjectForSliceRendererType(rendererType);
  }
}
```

Règles :

- Appelez **toujours** `super(payload)` et `super.toArray()`, pour que les champs communs (libellé, présentation, métadonnées, `_unlocked`…) continuent de fonctionner.
- Normalisez les valeurs localisées en `{en, fr}` dans le constructeur.
- `toArray()` ne doit retourner **que des données simples**. Appelez `.toArray()` sur les modèles imbriqués ; ne placez pas les instances elles-mêmes dans le résultat (voir la particularité de la tranche graphique).
- Retirez les valeurs par défaut du résultat pour garder un YAML compact (voir `HtmlSlice.defaults`).

## 2. Fabrique – `src/models/PBOMLDocument.js`

Importez la classe et ajoutez `case "foo": return new FooSlice(element);` dans `provisionSliceFromPayload()`. **Sans cette étape, les tranches `foo` sont ignorées sans avertissement au chargement d'un document.**

## 3. Moteur de rendu HTML – `src/Renderers/Html/FooSliceHtmlRenderer.js`

```js
import { h } from "vue";
import SliceHtmlRenderer from "./SliceHtmlRenderer";

export default class FooSliceHtmlRenderer extends SliceHtmlRenderer {
  renderReadonlyVnode(language) {
    return h("div", { class: "pboml-prose", innerHTML: /* … */ "" });
  }
}
```

- Le **nom du fichier** doit correspondre à la chaîne retournée par `rendererObjectForSliceRendererType("html")`. `Renderer.js` le trouve avec `import.meta.glob`.
- Ajoutez la classe `pboml-prose` aux éléments qui contiennent du Markdown rendu si les appels de note (`[^id]`) doivent y devenir des liens.
- Chargez les dépendances lourdes avec `defineAsyncComponent`, pour les garder hors du fichier principal (voir les moteurs de rendu LaTeX et Graphique).
- Le HTML ou le SVG non fiable doit passer par DOMPurify, idéalement dans un Shadow DOM (voir `components/HtmlRenderer.js`).

## 4. Éditeur – `src/editors/FooSliceEditor.js`

Suivez le modèle existant :

```js
export default {
  props: ["slice"],
  setup(props, { emit }) {
    if (props.slice.readonly) { /* message « lecture seule » + aperçus EN/FR */ }
    return () => h(/* champs liés à props.slice, qui émettent update:modelValue */);
  },
};
```

## 5. Ajout d'une tranche – `src/components/Editor/SliceStager/SliceStager.vue`

- Importez le modèle et ajoutez une entrée à `buttons` (`{ label, type, advanced? }`).
- Ajoutez-le à la liste des types qui reçoivent `presentation = "figure"` par défaut, si c'est pertinent.

## 6. Textes – `src/editor-strings.js`

Ajoutez, en `en` **et** en `fr` :

- `slice_type_foo` (libellé affiché dans le menu d'ajout et dans la légende du cadre de la tranche)
- `slice_type_abbrev_foo` (libellé court ; chaque type existant en définit un, ajoutez-le par cohérence)
- les textes propres à l'éditeur.

## 7. Intégrations facultatives

| Fonction | Où |
|:-|:-|
| Table des matières | `components/Toc/Toc.js` (pour l'instant, seuls les en-têtes et les tranches avec libellé y figurent) |
| Importateur de structure | `StructureImporter.vue → walkThroughMarkdown()` |
| Styles d'impression | `src/print.css` |

## 8. Tests et exemples

- Ajoutez un exemple `tests/samples/foo0.yaml`.
- Ajoutez un test d'analyse (et un test d'aller-retour `toArray()` → nouvelle analyse) dans `tests/models/`.
- Lancez `pnpm run test`.

## 9. Documentation

- Une page pour les rédacteurs `EN:-Foo-Slice` / `FR:-Foo-Slice` (champs, exemples).
- Une page pour les développeurs `EN:-Dev-Foo-Slice` / `FR:-Dev-Foo-Slice` (cette section).
- Ajoutez des liens vers ces pages dans `Home`, `FR:-Accueil`, le tableau du [Guide du développeur](./FR:-Guide-du-developpeur) et la liste des valeurs de `type` dans [Objets Tranche](./FR:-Slice-Objects).
