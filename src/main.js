import { defineCustomElement } from 'vue'
import App from "./App.ce.vue"
import Toc from "./Toc.ce.vue"

customElements.define('pboml-parser', defineCustomElement(App))
customElements.define('pboml-toc', defineCustomElement(Toc))

// Expose the script URL to the window object; used by the enhanced preview window to load the script
window.pbomlParserScriptUrl = import.meta.url;