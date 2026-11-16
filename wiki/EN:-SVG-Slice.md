# SVG Slice

The SVG slice is used to embed Scalable Vector Graphics (SVG) content in a PBOML document. It is ideal for vector-based images and diagrams.

|Version added|1.0.0|
|:-:|:-:|

The SVG slice is used to store a Scalable Vector Graphic (svg) object in the `pboml` document.

## List of fields

The list of valid field are all included in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice).

### List of fields for the heading slice

As of version 1.0.0, here is the list of fields that can be found in an SVG slice.

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|obligatory|set to `heading`
|`content`|Localized String Object|obligatory|Contains the content of the heading. Rendered differently depending on the value of the `level` field

### Example - SVG Slice

```yaml
  - type: svg
    label:
      en: Rectangle
      fr: Rectangle
    content:
      en: |-
        <svg width="400" height="110">
          <rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />
        </svg>
      fr: |-
        <svg width="400" height="110">
          <rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />
        </svg>
```

## Detailed field description

### `type`

In the case of the SVG slice, this field must always be set to `svg` to allow the parser to render the content correctly.

#### Example - `type` field

```yaml
  - type: svg
```

### `content`

The `content` field contains the raw SVG markup. Ensure the SVG is valid to avoid rendering issues.

> :warning: When using this project's HTML renderer and editor, the svg string will be injected as is, without being escaped or filtered, in the body of the editor and the rendered PBOML Document. This could allow for cross-site scripting attacks. It is imperative that only trusted content be displayed and/or effective content security policies (CSP) be enforced by the page wrapping this project's element.

#### Example - `content` field

```yaml
  - type: svg
    presentation: figure
    referenced_as:
      en: Summary Figure 1
      fr: Figure 1 du résumé
    content:
      en: >-
        <svg .... </svg>
      fr: >-
        <svg .... </svg>
```
