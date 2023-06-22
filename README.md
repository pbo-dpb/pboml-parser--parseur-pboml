# PBOML Parser (English)

## Description

This project takes the form of a web component that can render PBOML formatted content (the `renderer`). The Web component also includes an optionally loaded visual editor (the `editor`).

This project is under active development, and several concepts are set to change and evolve. It is not recommended for production use at this time.

### The PBOML language

⚠️ The PBOML language is under development. It is recommended not to use it in production as its implementation could change drastically.

YAML based, the PBOML language is used to serialize PBO reports, notes and election costings for storage, machine based edition and just in time rendering to multiple formats (HTML, Docx, PDF). To learn more about the PBOML language, [visit this project's Wiki](https://github.com/pbo-dpb/pboml-parser--parseur-pboml/wiki).

## Demo

### Sandbox

The sandbox lets you visualize and interact with the various slices and their renderers.

- [Sandbox](https://pboml-sandbox--bac-a-sable-pboml.opbo-bdpb.ca/)
- [Source code](https://github.com/pbo-dpb/pboml-sandbox--bac-a-sable-pboml)

### Renderer examples

Some existing publications have already been converted to the PBOML format and are rendered from this format on the OPBO fallback site. This is notably the case for the following publications:

- [A Distributional Analysis of the Clean Fuel Regulations](https://fallback--repli.pbo-dpb.ca/en/publications/RP-2324-004-S--distributional-analysis-clean-fuel-regulations--analyse-distributive-reglement-combustibles-propres)
- [Personnel Expenditure Analysis — Update](https://fallback--repli.pbo-dpb.ca/en/publications/RP-2324-002-S--personnel-expenditure-analysis-update--examen-depenses-personnel-mise-jour)
- [Cost estimate of Employment Insurance Board of Appeal](https://fallback--repli.pbo-dpb.ca/en/publications/LEG-2324-004-M--cost-estimate-employment-insurance-board-appeal--estimation-cout-conseil-appel-assurance-emploi)

## Use the Web component

⚠️ The Web component is under development. It is recommended not to use it in production as its implementation could change drastically.

### Retrieve the current version of the script

The following script allows you to retrieve the latest version of the script by consulting the manifest produced when it was compiled, and inject it on a given page.

```js
const PARSER_DOMAIN = "https://pboml.opbo-bdpb.ca/";

function loadPbomlParser() {
    window.pboml_parser_loaded = true;
    fetch(`${PARSER_DOMAIN}manifest.json`)
        .then((response) => response.json())
        .then((data) => {
            for (const property in data) {
                if (data[property].isEntry) {
                    const script = document.createElement('script');
                    script.src = `${PARSER_DOMAIN}${data[property].file}`;
                    script.type = "module";
                    document.head.appendChild(script);
                }
            }
        });
}
if (!window.pboml_parser_loaded)
    loadPbomlParser()
```

### Embed the renderer

The renderer can then be inserted as follows:

```html
<pboml-parser payload="data:text/yaml;base64,{pboml}"></pboml-parser>
```

Where `{pboml}` is a base64 encoded PBOML document. The `payload` attribute can also be fed raw PBOML content, as long as it's encoded correctly. For example, a Vue.js app could embed the component as such:

```html
<pboml-parser :payload="pbomlString"></pboml-parser>
```

Where `pbomlDocument` is a raw PBOML document.

### Embed the editor

The visual editor can be embeded by adding and `edit` attribute set to `true`.

```html
<pboml-parser edit="true" payload="data:text/yaml;base64,{pboml}"></pboml-parser>
```

## Develop and build locally

### 1. Project setup
```
npm install
```

### 2. Compilation with Vite

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```
