# Aide-mémoire PBOML pour LLMs

PBOML est un format basé sur YAML. Ce mémo se concentre sur les constructions spécifiques à PBOML.

## 1. Structure de base d'un document

Un document PBOML est un fichier YAML avec ces champs racines :

```yaml
pboml:
  version: string # ex. : "1.0.0"
document:
  id: string # Identifiant unique du document
slices: [] # Tableau d'objets Tranche (voir section 4)
annotations: [] # Tableau d'objets Annotation (voir section 3)
```

## 2. Objet chaîne localisée

Utilisé pour les champs multilingues. Les langues sont des codes ISO 639-1.

```yaml
nomDuChamp:
  en: "Contenu en anglais"
  fr: "Contenu en français"
```
Pris en charge (v1.0.0) : Anglais (`en`), Français (`fr`).

## 3. Annotations

Sous le champ racine `annotations`. Chaque annotation est un objet :

| Champ         | Type                    | Oblig. | Description                                    |
|---------------|------------------------|--------|------------------------------------------------|
| `id`          | String                 | Oui    | ID unique (ex. : "1", "REF-A").               |
| `content_type`| String                 | Oui    | Format : `markdown` ou `bibtex`.               |
| `content`     | Objet chaîne localisée | Oui    | Contenu de l'annotation, rendu selon le type.  |

Exemple :
```yaml
annotations:
  - id: "1"
    content_type: "markdown"
    content:
      en: "Ceci est une note."
      fr: "Ceci est une note."
```

## 4. Tranches (Slices)

Sous le champ racine `slices`. Tableau ordonné de blocs de contenu.

### 4.1. Champs communs à toutes les tranches (sauf `heading`)

| Champ            | Type                             | Opt. | Description                                      |
|------------------|----------------------------------|------|--------------------------------------------------|
| `id`             | String                           | Oui  | Identifiant unique de la tranche.                |
| `type`           | String                           | Oui  | **Type de tranche.** (Voir types spécifiques)     |
| `sources`        | Tableau d'objets chaîne localisée| Oui  | Sources pertinentes.                             |
| `notes`          | Tableau d'objets chaîne localisée| Oui  | Notes pertinentes.                               |
| `alts`           | Tableau d'objets chaîne localisée| Oui  | Descriptions textuelles (accessibilité).         |
| `label`          | Objet chaîne localisée           | Oui  | Titre/étiquette de la tranche.                   |
| `display_label`  | Booléen                          | Oui  | Si `true`, `label` est visible.                  |
| `readonly`       | Booléen                          | Oui  | Si `true`, non éditable dans l'éditeur PBOML.    |
| `referenced_as`  | Objet chaîne localisée           | Oui  | Chaîne de référence (ex. : "Figure 1.1").       |
| `presentation`   | String                           | Oui  | Format : `""` (défaut), `figure`, ou `aside`.    |

### 4.2. Types de tranches

#### 4.2.1. `markdown`
- `type: "markdown"` (Obligatoire)
- `content` : (Obligatoire) Objet chaîne localisée. Contenu Markdown.
```yaml
- type: markdown
  content:
    en: "Du texte **Markdown**."
```

#### 4.2.2. `heading`
- **Note :** Seul `id` des champs communs s'applique.
- `type: "heading"` (Obligatoire)
- `content` : (Obligatoire) Objet chaîne localisée. Texte brut. **Pas de Markdown.**
- `level` : (Obligatoire) Nombre (`0`, `1`, `2`, `3`). Défaut `0`. Valeurs invalides = rien affiché.
```yaml
- type: heading
  content: { en: "Section principale" }
  level: 0
```

#### 4.2.3. `table`
- `type: "table"` (Obligatoire)
- `variables` : (Obligatoire) Objet. Définit les colonnes. Chaque clé est un ID de variable.
  - Objet variable : `{ label: ObjetChaîneLocalisée, type: "markdown" | "number" | ... }`
- `content` : (Obligatoire) Tableau d'objets (lignes). Clés = IDs de `variables`.
```yaml
- type: table
  variables:
    colA: { label: { en: "En-tête A" }, type: "markdown" }
  content:
    - colA: { en: "Donnée 1" }
```

#### 4.2.4. `svg`
- `type: "svg"` (Obligatoire)
- `content` : (Obligatoire) Objet chaîne localisée. SVG brut (chaîne multilignes).
```yaml
- type: svg
  content:
    en: |-
      <svg><circle cx="50" cy="50" r="40" fill="red" /></svg>
```

#### 4.2.5. `chart`
- `type: "chart"` (Obligatoire)
- Nécessite l'un des deux :
    - `datatable` : (Objet) Structure similaire à `table` (variables + contenu), avec ajouts pour graphiques.
        - `variables` : (Obligatoire) Objet. Définit les séries.
        - `content` : (Obligatoire) Objet. Points de données.
        - `state` : (Optionnel) Objet.
    - `arraytable` : (Objet) Structure simplifiée par tableau. (Voir doc complète.)
```yaml
- type: chart
  datatable: # Simplifié
    variables: { /* définitions des séries */ }
    content: { /* points de données */ }
```

#### 4.2.6. `kvlist` (Liste clé-valeur)
- `type: "kvlist"` (Obligatoire)
- `prototype` : (Obligatoire) Objet. Définit la structure des clés/valeurs.
    - `key` : `{ type: "markdown", label: ObjetChaîneLocalisée }` (Obligatoire)
    - `value` : `{ type: "markdown", label: ObjetChaîneLocalisée }` (Obligatoire)
- `content` : (Obligatoire) Tableau d'objets, chaque objet = une paire clé-valeur.
    - Paire : `{ key: { content: ObjetChaîneLocalisée }, value: { content: ObjetChaîneLocalisée } }`
```yaml
- type: kvlist
  prototype:
    key: { type: "markdown", label: { en: "Propriété" } }
    value: { type: "markdown", label: { en: "Valeur" } }
  content:
    - key: { content: { en: "Auteur" } }
      value: { content: { en: "DPB" } }
```

#### 4.2.7. `bitmap`
- `type: "bitmap"` (Obligatoire)
- `content` : (Obligatoire) Objet chaîne localisée. Liens vers les images principales.
- `thumbnails` : (Obligatoire) Objet miniature localisé. Liens vers les miniatures.
  - Structure : `code_langue: { taille_résolution_format: "url", ... }`
  - Alias : taille (`sm`, `md`, `lg`), résolution (`1x`, `2x`, `3x`), format (`webp`, `png`, `jpeg`).
```yaml
- type: bitmap
  content: { en: "image_en.png" }
  thumbnails:
    en:
      sm_1x_webp: "thumb_en_sm.webp"
```

#### 4.2.8. `html`
- `type: "html"` (Obligatoire)
- `content` : (Obligatoire) Objet chaîne localisée. HTML brut.
- `remove_default_styles` : (Optionnel) Booléen.
- `css` : (Optionnel) Chaîne CSS pour cette tranche.
```yaml
- type: html
  content: { en: "<p>HTML brut.</p>" }
```
