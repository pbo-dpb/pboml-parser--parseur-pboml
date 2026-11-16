# PBOML Cheatsheet for LLMs

PBOML is a YAML-based format. This cheatsheet focuses on PBOML-specific constructs.

## 1. Basic Document Structure

A PBOML document is a YAML file with these root fields:

```yaml
pboml:
  version: string # e.g., "1.0.0"
document:
  id: string # Unique document identifier
slices: [] # Array of Slice Objects (see section 4)
annotations: [] # Array of Annotation Objects (see section 3)
```

## 2. Localized String Object

Used for fields supporting multiple languages. Languages are ISO 639-1 codes.

```yaml
fieldName:
  en: "English content"
  fr: "Contenu en français"
```
Supported (v1.0.0): English (`en`), French (`fr`).

## 3. Annotations

Under root `annotations` field. Each is an object:

| Field        | Type                    | Req. | Description                                    |
|--------------|-------------------------|------|------------------------------------------------|
| `id`         | String                  | Yes  | Unique ID (e.g., "1", "REF-A").                |
| `content_type`| String                 | Yes  | Format: `markdown` or `bibtex`.                |
| `content`    | Localized String Object | Yes  | Annotation content, rendered per `content_type`.|

Example:
```yaml
annotations:
  - id: "1"
    content_type: "markdown"
    content:
      en: "This is a note."
      fr: "Ceci est une note."
```

## 4. Slices

Under root `slices` field. Ordered array of content blocks.

### 4.1. Common Slice Fields (Not all applicable to `heading` slice)

| Field           | Type                             | Opt. | Description                                      |
|-----------------|----------------------------------|------|--------------------------------------------------|
| `id`            | String                           | Yes  | Unique slice identifier.                         |
| `type`          | String                           | Yes  | **Defines slice type.** (See specific types)     |
| `sources`       | Array of Localized String Object | Yes  | Relevant sources.                                |
| `notes`         | Array of Localized String Object | Yes  | Relevant notes.                                  |
| `alts`          | Array of Localized String Object | Yes  | Textual descriptions (accessibility).            |
| `label`         | Localized String Object          | Yes  | Slice label/title.                               |
| `display_label` | Boolean                          | Yes  | If `true`, `label` is visible.                   |
| `readonly`      | Boolean                          | Yes  | If `true`, not editable in PBOML editor.         |
| `referenced_as` | Localized String Object          | Yes  | Reference string (e.g., "Figure 1.1").           |
| `presentation`  | String                           | Yes  | Format: `""` (default), `figure`, or `aside`.    |

### 4.2. Slice Types

#### 4.2.1. `markdown`
- `type: "markdown"` (Required)
- `content`: (Required) Localized String Object. Markdown content.
```yaml
- type: markdown
  content:
    en: "Some **Markdown** text."
```

#### 4.2.2. `heading`
- **Note:** Only `id` from common fields applies.
- `type: "heading"` (Required)
- `content`: (Required) Localized String Object. Plain text. **Not Markdown.**
- `level`: (Required) Number (`0`, `1`, `2`, `3`). Default `0`. Invalid values render nothing.
```yaml
- type: heading
  content: { en: "Main Section" }
  level: 0
```

#### 4.2.3. `table`
- `type: "table"` (Required)
- `variables`: (Required) Object. Defines table columns. Each key is a variable ID.
  - Variable object: `{ label: LocalizedString, type: "markdown" | "number" | ... }`
- `content`: (Required) Array of objects (rows). Keys match `variables` IDs.
```yaml
- type: table
  variables:
    colA: { label: { en: "Header A" }, type: "markdown" }
  content:
    - colA: { en: "Data 1" }
```

#### 4.2.4. `svg`
- `type: "svg"` (Required)
- `content`: (Required) Localized String Object. Raw SVG markup (multiline string).
```yaml
- type: svg
  content:
    en: |-
      <svg><circle cx="50" cy="50" r="40" fill="red" /></svg>
```

#### 4.2.5. `chart`
- `type: "chart"` (Required)
- Requires one of:
    - `datatable`: (Object) Structure similar to `table` slice's `variables` and `content`, with chart-specific enhancements.
        - `variables`: (Required) Object. Defines data series.
        - `content`: (Required) Object. Data points.
        - `state`: (Optional) Object.
    - `arraytable`: (Object) Simpler array-based data. (See full docs for details).
```yaml
- type: chart
  datatable: # Simplified
    variables: { /* series definitions */ }
    content: { /* data points */ }
```

#### 4.2.6. `kvlist` (Key-Value List)
- `type: "kvlist"` (Required)
- `prototype`: (Required) Object. Defines structure for keys/values.
    - `key`: `{ type: "markdown", label: LocalizedString }` (Required)
    - `value`: `{ type: "markdown", label: LocalizedString }` (Required)
- `content`: (Required) Array of objects, each a key-value pair.
    - Pair: `{ key: { content: LocalizedString }, value: { content: LocalizedString } }`
```yaml
- type: kvlist
  prototype:
    key: { type: "markdown", label: { en: "Prop" } }
    value: { type: "markdown", label: { en: "Val" } }
  content:
    - key: { content: { en: "Author" } }
      value: { content: { en: "PBO" } }
```

#### 4.2.7. `bitmap`
- `type: "bitmap"` (Required)
- `content`: (Required) Localized String Object. Links to main images.
- `thumbnails`: (Required) Localized Thumbnail Object. Links to thumbnail images.
  - Structure: `lang_code: { size_resolution_format: "url", ... }`
  - Aliases: size (`sm`, `md`, `lg`), resolution (`1x`, `2x`, `3x`), format (`webp`, `png`, `jpeg`).
```yaml
- type: bitmap
  content: { en: "image_en.png" }
  thumbnails:
    en:
      sm_1x_webp: "thumb_en_sm.webp"
```

#### 4.2.8. `html`
- `type: "html"` (Required)
- `content`: (Required) Localized String Object. Raw HTML content.
- `remove_default_styles`: (Optional) Boolean.
- `css`: (Optional) String. CSS for this slice.
```yaml
- type: html
  content: { en: "<p>Raw HTML.</p>" }
```
