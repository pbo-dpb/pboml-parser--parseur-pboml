import { defineCustomElement } from 'vue'
import App from "./App.ce.vue"


customElements.define('pboml-parser', defineCustomElement(App))