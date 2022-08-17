# Vue 3 + Vite + Web Components (composants web)

## Description

### English

This code provides a starting point for the development of research tools/interactive components that can be embedded on the PBO's main website.
This template should help get you started developing with Vue 3 in Vite with the intent of building a standalone [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

### Français

Ce code fournit un point de départ pour le développement d'outils de recherche/composants interactifs qui peuvent être intégrés au site Web principal du DPB.
Ce modèle devrait vous aider à commencer à développer avec Vue 3 dans Vite avec l'intention de construire un [composant Web  (Web Component)] autonome (https://developer.mozilla.org/en-US/docs/Web/Web_Components).

## Project setup // Mise en route
```
npm install
```

## Compilation // Compilation

### Compiles and hot-reloads for development // Compilations et recharges à chaud pour le développement
```
npm run dev
```

### Compiles and minifies for production // Compilation et miniaturisation pour la production
```
npm run build
```

## Interfaces // Interfaces

### English

A single component can be embedded in an ABCMS web page. An example of how the component is loaded in available in `index.html`.

The web component can raise a `navigation-context-update` event to update the wrapper's UI. See `WrapperEventDispatcher.js` for more information on how to format this `CustomEvent`.

### Français

Un seul composant peut être intégré dans une page web ABCMS. Un exemple de la façon dont le composant est chargé est disponible dans `index.html`.

Le composant Web peut déclencher un événement `navigation-context-update` pour mettre à jour l'interface utilisateur de la page ABCMS englobante. Voir `WrapperEventDispatcher.js` pour plus d'informations sur la façon de formater ce `CustomEvent`.