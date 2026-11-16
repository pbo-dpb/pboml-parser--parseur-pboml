# Tranche Bitmap — Référence pour les développeurs

> Référence pour les rédacteurs : [Tranche Bitmap](./FR:-Bitmap-Slice)

***
🌐  [English](./EN:-Dev-Bitmap-Slice) • Français • ⬆️ [Guide du développeur](./FR:-Guide-du-developpeur)
***

## En un coup d'œil

| | |
|:-|:-|
| `type` YAML | `bitmap` |
| Modèle | `src/models/contents/BitmapSlice.js` (exporte `BITMAP_RESOLUTIONS`, `BITMAP_FORMATS`, `BITMAP_DENSITIES`) |
| Moteur de rendu HTML | `src/Renderers/Html/BitmapSliceHtmlRenderer.js` |
| Éditeur | `src/editors/BitmapSliceEditor.js` |
| Dans le menu d'ajout de tranche | Oui, marquée **avancée** (demande une confirmation) ; présentation par défaut `figure` |

## Modèle

```yaml
- type: bitmap
  presentation: figure
  label: { en: Photo of …, fr: Photo de … }    # sert aussi d'attribut alt de <img>
  content:                                      # URL de l'image originale, par langue
    en: https://cdn.example/fig1-en.png
    fr: https://cdn.example/fig1-fr.png
  thumbnails:                                   # variantes adaptatives facultatives
    en:
      sm_1x_webp: https://…/fig1-en-640.webp
      sm_2x_webp: https://…/fig1-en-1280.webp
      md_1x_png:  https://…/fig1-en-768.png
      lg_1x_webp: https://…/fig1-en-full.webp
    fr: { … }
```

### Clés des vignettes

`{résolution}_{densité}_{format}`, à partir de :

| Constante | Valeurs |
|:-|:-|
| `BITMAP_RESOLUTIONS` | `sm` → `max-width: 640px`, `md` → `max-width: 768px`, `lg` → aucune requête média |
| `BITMAP_DENSITIES` | `1x`, `2x`, `3x` |
| `BITMAP_FORMATS` | `webp`, `png` |

Chaque langue peut donc avoir 18 clés. N'importe quel sous-ensemble peut être fourni.

### Remarques sur l'analyse et la sérialisation

- `display_label` est forcé à `true`, sauf s'il vaut explicitement `false`.
- `thumbnails` n'est écrit que si au moins une langue a des vignettes.

## Rendu

```
<a href="{content[lang]}" target="_blank">           ← un clic ouvre l'original en pleine taille
  sans thumbnails[lang] :  <figure><img src=content alt=label loading=lazy fetchpriority=low></figure>
  avec thumbnails :        <picture>
                             <source type="image/webp" media="(max-width: 640px)" srcset="… 1x, … 2x">
                             … pour chaque résolution × format ayant au moins une URL …
                             <img src=content …>
                           </picture>
```

Les sources sont produites dans l'ordre `sm`, `md`, `lg` × `webp`, `png` : le navigateur choisit la première qui convient (plus petit écran d'abord, WebP d'abord).

## Édition

`BitmapSliceEditor` :

- `BilingualInput` pour les deux URL originales, avec un aperçu `<img>` EN | FR (❌ quand le champ est vide).
- **Remplir depuis le presse-papiers** : lit du YAML avec `navigator.clipboard.readText()` (ou avec `window.prompt` en solution de repli), crée une `BitmapSlice` temporaire et **remplit seulement les champs vides** (contenu et chaque clé de vignette). Cette fonction est prévue pour fonctionner avec un outil externe de traitement d'images qui copie un extrait YAML de tranche bitmap.
- Une liste repliable de `SingleInput`, un par clé de vignette et par langue.

Il n'y a pas de téléversement. L'éditeur ne conserve que des URL ; l'hébergement et le redimensionnement se font en dehors de ce projet.

## Particularités et limites connues

- L'attribut `alt` est le **libellé** de la tranche. Si `label` est vide, l'image a un `alt` vide. Les descriptions longues doivent aller dans `alts` (affiché dans une « Version textuelle » repliable).
- Toute l'image est un lien vers l'original, qui s'ouvre dans un nouvel onglet sans indication visible.
- `window.prompt` n'est utilisé que si `navigator.clipboard` n'existe pas (par exemple dans un contexte non sécurisé). Si `readText()` existe mais est refusé ou non pris en charge, l'erreur est interceptée et signalée par `⚠️ Invalid YAML.`, ce qui est trompeur.
