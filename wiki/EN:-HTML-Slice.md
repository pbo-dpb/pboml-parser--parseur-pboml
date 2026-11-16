# HTML Slice

The HTML slice allows embedding raw HTML content within a PBOML document. It is primarily intended for compatibility purposes, and other slice types are preferred when possible.

|Version added|1.0.0|
|:-:|:-:|

## List of fields

The list of valid field are all included in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice).

### List of fields for the heading slice

As of version 1.0.0, here is the list of fields that can be found in an HTML slice.

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|obligatory|set to `html`
|`content`|Localized String Object|required|Contains the raw HTML payload that should be rendered.
|`remove_default_styles`|Boolean|optional|When `true`, no styles will be applied to the shadow DOM.
|`css`|String|optional|Can include CSS that will be applied to the slice.


### Example - HTML Slice

```yaml
  - type: html
    css: "strong {font-size: 2em;}"
    content:
      en: |-
        <strong>
          Hello, world
        </strong>
      fr: |-
        <strong>
          Bonjour, monde
        </strong>
```

## Detailed fields description

### `content`

This field contains a localized object with the actual raw html to be rendered for each language. Although the rendering is, when using this project's renderer, self contained in a shadow tree, invalid *html* could impact rendering in the whole document.

> :warning: When using this project's HTML renderer and editor, the *html* and *css* strings will be injected as is, with only minimal last resort sanitization applied to scripts, in the body of the editor and the rendered PBOML Document. This could allow for cross-site scripting attacks. It is imperative that only trusted content be displayed and/or effective content security policies (CSP) be enforced by the page wrapping this project's element.

#### Example - `content` field

```yaml
  - type: html
    presentation: figure
    referenced_as:
      en: Summary Figure 1
      fr: Figure 1 du résumé
    content:
      en: >-
        <table.... </table>
      fr: >-
        <table .... </table>
```

### `remove_default_styles`

When set to `true`, the renderer will not inject any styles in the shadow tree used to render the slice. A limited amount of styles (eg. the document's font) will permeate through the shadow DOM and still apply, but could be overridden by providing minimal `css` instructions.

By default, the renderer will attempt to render an HTML slice using styles that mimic the whole document. As of November 2023, this means using the [Tailwind CSS](https://tailwindcss.com/) framework.

### `css`

This field contains a raw string that will be adopted by the slice's shadow root's. It can be used to provide custom styles in addition to existing styles or, when used in conjunction with `remove_default_styles`, as a complete replacement. This style is scoped to the slice and cannot be re-used from one slice to another. It is, however, rendering-language agnostic.

> :warning: The same warning as for the `content` field potential for XSS injection applies here.

#### Example - `css` field

```yaml
  - type: html
    content:
      en: >-
        <table.... </table>
      fr: >-
        <table .... </table>
    css: >-
      table{background-color: lavender} tr:nth-child(even):not(:first-child)
      {background-color: pink} thead{background-color: bisque} @media
      (prefers-color-scheme: dark) {table {rotate: -3deg}}
```
