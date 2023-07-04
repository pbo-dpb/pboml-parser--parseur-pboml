# Parseur PBOML (Français)

## Description

Ce projet prend la forme d'un composant Web qui interprète et rend le contenu formaté PBOML (le `rendeur`). Le composant Web comprend également un éditeur visuel (l'"éditeur").

Ce projet est en cours de développement et plusieurs concepts sont appelés à changer et à évoluer. Il n'est pas recommandé pour l'instant de l'utiliser en production.

### Le langage PBOML

⚠️ Le langage PBOML est en cours de développement. Il est recommandé de ne pas l'utiliser en production car sa mise en œuvre pourrait changer radicalement.

Basé sur YAML, le langage PBOML est utilisé pour sérialiser les rapports du PBO, les notes et les coûts des élections pour le stockage, l'édition sur machine et le rendu juste à temps dans de multiples formats (HTML, Docx, PDF). Pour en savoir plus sur le langage PBOML, [visitez le Wiki de ce projet] (https://github.com/pbo-dpb/pboml-parser--parseur-pboml/wiki).

## Demo

### Bac à sable

Le bac à sable vous permet de visualiser et d'interagir avec les différentes tranches et leurs outils de rendu.

- [Bac à sable](https://pboml-sandbox--bac-a-sable-pboml.opbo-bdpb.ca/)
- [Code source](https://github.com/pbo-dpb/pboml-sandbox--bac-a-sable-pboml)

### Exemples de rendu

Certaines publications existantes ont déjà été converties au format PBOML et sont rendues à partir de ce format sur le site de repli de l'OPBO. C'est notamment le cas des publications suivantes :

- [Analyse distributive du Règlement sur les combustibles propres](https://fallback--repli.pbo-dpb.ca/fr/publications/RP-2324-004-S--distributional-analysis-clean-fuel-regulations--analyse-distributive-reglement-combustibles-propres)
- [Examen des dépenses en personnel — Mise à jour](https://fallback--repli.pbo-dpb.ca/fr/publications/RP-2324-002-S--personnel-expenditure-analysis-update--examen-depenses-personnel-mise-jour)
- [Estimation du coût du Conseil d’appel en assurance-emploi](https://fallback--repli.pbo-dpb.ca/fr/publications/LEG-2324-004-M--cost-estimate-employment-insurance-board-appeal--estimation-cout-conseil-appel-assurance-emploi)

## Utiliser le composant Web

⚠️ Le composant Web est en cours de développement. Il est recommandé de ne pas l'utiliser en production car sa mise en œuvre pourrait changer radicalement.

###  Récupérer la version actuelle du script

Le script suivant permet de récupérer la dernière version du script en consultant le manifeste produit lors de sa compilation, et de l'injecter sur une page donnée.

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

### Intégrer le moteur de rendu

**❗ Seul le contenu fiable doit être transmis au composant, car il ne sera (la plupart du temps) pas nettoyé avant le rendu.**

Le moteur de rendu peut alors être inséré comme suit :

```html
<pboml-parser payload="data:text/yaml;base64,{pboml}"></pboml-parser>
```

Où `{pboml}` est un document PBOML encodé en base64. L'attribut `payload` peut aussi être un contenu PBOML brut, tant qu'il est encodé correctement. Par exemple, une application Vue.js pourrait intégrer le composant comme suit :

```html
<pboml-parser :payload="pbomlString"></pboml-parser>
```

Où `pbomlDocument` est un document PBOML brut.

### Intégrer l'éditeur

L'éditeur visuel peut être intégré en ajoutant l'attribut `edit` avec la valeur `true`.

```html
<pboml-parser edit="true" payload="data:text/yaml;base64,{pboml}"></pboml-parser>
```

## Développer et construire localement

### 1. Mise en route
```
npm install
```

### 2. Compilation avec Vite

### Compilations et recharges à chaud pour le développement
```
npm run dev
```

### Tests
```
npm run test
```

### Compilation et miniaturisation pour la production
```
npm run build
```
