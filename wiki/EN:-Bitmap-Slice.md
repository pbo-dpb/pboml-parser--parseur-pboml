# Bitmap Slice

The Bitmap Slice is used to display bitmap images in a PBOML document. It supports responsive images and multiple resolutions.

## List of fields

In a `pboml` document, the bitmap slice is represented using many fields.
Many of those fields are included already in the [List of fields common to all types of slice](./EN:-Slice-Objects#list-of-fields-common-to-all-types-of-slice). However, there are fields that are specific to the table slice.

### List of fields unique to the Bitmap slice

|field name|type|optionality|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Required|Must be set to `bitmap`
|`content`|Localized String Object|Required|Contains the images in all related langugaes (See [Localized String Object])
|`thumbnails`|Localized Thumbnail Object|Required|Contains all the different thumbnail images in all the supported file type, size and resolution

### Example - bitmap slice

```yaml
  - type: bitmap
    presentation: figure
    label: {}
    content:
      en: >-
        https://example.com/images/original_en.png
      fr: >-
        https://example.com/images/original_fr.png
    thumbnails:
      en:
        sm_1x_webp: >-
          https://example.com/images/w608_1x_en.webp
        sm_1x_png: >-
          https://example.com/images/w608_1x_en.png
        sm_2x_webp: >-
          https://example.com/images/w608_2x_en.webp
        sm_2x_png: >-
          https://example.com/images/w608_2x_en.png
        md_1x_webp: >-
          https://example.com/images/w704_1x_en.webp
        md_1x_png: >-
          https://example.com/images/w704_1x_en.png
        md_2x_webp: >-
          https://example.com/images/w704_2x_en.webp
        md_2x_png: >-
          https://example.com/images/w704_2x_en.png
        lg_1x_webp: >-
          https://example.com/images/w960_1x_en.webp
        lg_1x_png: >-
          https://example.com/images/w960_1x_en.png
        lg_2x_webp: >-
          https://example.com/images/w960_2x_en.webp
        lg_2x_png: >-
          https://example.com/images/w960_2x_en.png
      fr:
        sm_1x_webp: >-
          https://example.com/images/w608_1x_fr.webp
        sm_1x_png: >-
          https://example.com/images/w608_1x_fr.png
        sm_2x_webp: >-
          https://example.com/images/w608_2x_fr.webp
        sm_2x_png: >-
          https://example.com/images/w608_2x_fr.png
        md_1x_webp: >-
          https://example.com/images/w704_1x_fr.webp
        md_1x_png: >-
          https://example.com/images/w704_1x_fr.png
        md_2x_webp: >-
          https://example.com/images/w704_2x_fr.webp
        md_2x_png: >-
          https://example.com/images/w704_2x_fr.png
        lg_1x_webp: >-
          https://example.com/images/w960_1x_fr.webp
        lg_1x_png: >-
          https://example.com/images/w960_1x_fr.png
        lg_2x_webp: >-
          https://example.com/images/w960_2x_fr.webp
        lg_2x_png: >-
          https://example.com/images/w960_2x_fr.png
```

## Detailed field description

### `content`

The `content` field stores the main image, while the `thumbnails` field provides variations for different sizes and formats. To render this slice correctly the content must be an accessible link to the image that you want to pass in. Like most `content` fields, it stores the images links in a Localized String Object (see [defefe](.)).

### `thumbnails`

The `thumbnail` field like the `content` field contains a Localized Object for each supported language. Each supported language has the same set of fields used to represent the different types of images. A renderer - such as the HTML renderer - could use these declinations to render [responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images). Here is the followed naming convention:

|Images size aliases|Pixel resolution aliases|File format aliases|
|:-:|:-:|:-:|
|sm small|1x: 1 point = 1 pixel|`webp`
|md: medium| 2x: 2 points = 4 pixels|`png`
|lg: large|3x: 3 points = 9 pixels|`jpeg`

So the format for the field names is:

`{Images size aliases}_{Pixel resolution aliases}_{File format aliases}`

All image declinations are optional. The renderer will only use those variations that are present. The renderer could also use only certain variations or, in the case of an HTML renderer, offer the browser only some of the variations, depending on the circumstances.

For example, the object above will could be rendered in HTML as follows:

```html

<a href="https://example.com/images/original_en.png" target="_blank">
   <picture>
      <source type="image/webp" srcset="https://example.com/images/w608_1x_en.webp 1x, https://example.com/images/w608_2x_en.webp 2x" media="(max-width: 640px)">
      <source type="image/png" srcset="https://example.com/images/w608_1x_en.png 1x, https://example.com/images/w608_2x_en.png 2x" media="(max-width: 640px)">
      <source type="image/webp" srcset="https://example.com/images/w704_1x_en.webp 1x, https://example.com/images/w704_2x_en.webp 2x" media="(max-width: 768px)">
      <source type="image/png" srcset="https://example.com/images/w704_1x_en.png 1x, https://example.com/images/w704_2x_en.png 2x" media="(max-width: 768px)">
      <source type="image/webp" srcset="https://example.com/images/w960_1x_en.webp 1x, https://example.com/images/w960_2x_en.webp 2x">
      <source type="image/png" srcset="https://example.com/images/w960_1x_en.png 1x, https://example.com/images/w960_2x_en.png 2x">
      <img src="https://example.com/images/original_en.png" fetchpriority="low" loading="lazy">
   </picture>
</a>

```