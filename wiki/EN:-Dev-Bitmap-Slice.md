# Bitmap Slice — Developer Reference

> Author-facing reference: [Bitmap Slice](./EN:-Bitmap-Slice)

***
🌐  English • [Français](./FR:-Dev-Bitmap-Slice) • ⬆️ [Developer Guide](./EN:-Developer-Guide)
***

## At a glance

| | |
|:-|:-|
| YAML `type` | `bitmap` |
| Model | `src/models/contents/BitmapSlice.js` (exports `BITMAP_RESOLUTIONS`, `BITMAP_FORMATS`, `BITMAP_DENSITIES`) |
| HTML renderer | `src/Renderers/Html/BitmapSliceHtmlRenderer.js` |
| Editor | `src/editors/BitmapSliceEditor.js` |
| In the slice stager | Yes, marked **advanced** (asks for confirmation); default presentation `figure` |

## Model

```yaml
- type: bitmap
  presentation: figure
  label: { en: Photo of …, fr: Photo de … }    # also used as the <img alt>
  content:                                      # original image URL per language
    en: https://cdn.example/fig1-en.png
    fr: https://cdn.example/fig1-fr.png
  thumbnails:                                   # optional responsive variants
    en:
      sm_1x_webp: https://…/fig1-en-640.webp
      sm_2x_webp: https://…/fig1-en-1280.webp
      md_1x_png:  https://…/fig1-en-768.png
      lg_1x_webp: https://…/fig1-en-full.webp
    fr: { … }
```

### Thumbnail keys

`{resolution}_{density}_{format}`, built from:

| Constant | Values |
|:-|:-|
| `BITMAP_RESOLUTIONS` | `sm` → `max-width: 640px`, `md` → `max-width: 768px`, `lg` → no media query |
| `BITMAP_DENSITIES` | `1x`, `2x`, `3x` |
| `BITMAP_FORMATS` | `webp`, `png` |

So each language has 18 possible keys. Any subset may be given.

### Parsing / serialization notes

- `display_label` is forced to `true` unless it is explicitly `false`.
- `thumbnails` is written only if at least one language has thumbnails.

## Rendering

```
<a href="{content[lang]}" target="_blank">           ← click opens the full-size original
  no thumbnails[lang]:  <figure><img src=content alt=label loading=lazy fetchpriority=low></figure>
  with thumbnails:      <picture>
                          <source type="image/webp" media="(max-width: 640px)" srcset="… 1x, … 2x">
                          … for each resolution × format with at least one URL …
                          <img src=content …>
                        </picture>
```

Sources are emitted in the order `sm`, `md`, `lg` × `webp`, `png`, so the browser picks the first match (smallest viewport first, WebP first).

## Editing

`BitmapSliceEditor`:

- `BilingualInput` for the two original URLs, with an EN | FR `<img>` preview (❌ when empty).
- **Fill from clipboard**: reads YAML from `navigator.clipboard.readText()` (or `window.prompt` as a fallback), builds a temporary `BitmapSlice`, and **fills only the empty fields** (content and every thumbnail key). This is meant to be used with an external image-processing tool that copies a bitmap slice YAML snippet.
- A collapsible list of `SingleInput`s, one per thumbnail key and language.

There is no upload. The editor only stores URLs; hosting and resizing happen outside this project.

## Known quirks and limitations

- `alt` is the slice **label**. If `label` is empty, the image has an empty `alt`. Long descriptions should go in `alts` (rendered as a collapsible "Text version").
- The whole image is wrapped in a link to the original, which opens in a new tab with no visible indication.
- `window.prompt` is only used when `navigator.clipboard` does not exist (for example in an insecure context). If `readText()` exists but is refused or unsupported, the error is caught and reported as `⚠️ Invalid YAML.`, which is misleading.
