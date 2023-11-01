import { h } from "vue"
import DOMPurify from 'dompurify';
import { twind, cssom, observe, install } from "@twind/core";
import config from "../../twind.config.js";

export default {
    props: {
        'payload': String,
        'css': String,
        'removeDefaultStyles': Boolean
    },
    render() {
        return h('div');
    },
    methods: {
        rebuildShadowDom() {
            let wrapper = document.createElement("div");
            wrapper.classList.add("w-full");
            const shadowRoot = wrapper.attachShadow({ mode: 'open' });
            let wrapperElement = document.createElement("div");
            wrapperElement.classList.add([
                "prose",
                "dark:prose-invert",
                "max-w-none",
                "prose-headings:font-thin",
                "prose-table:block",
                "prose-a:text-blue-800",
                "dark:prose-a:text-blue-200",
                "prose-table:overflow-x-scroll",
                "prose-table:whitespace-nowrap",
                "lg:prose-table:table",
                "lg:prose-table:whitespace-normal",
                "leading-relaxed",
            ]);
            wrapperElement.innerHTML = DOMPurify.sanitize(this.payload);
            shadowRoot.appendChild(wrapperElement);


            let sheets = [];

            if (!this.removeDefaultStyles) {
                // Tailwind
                const sheet = cssom(new CSSStyleSheet());
                const tw = twind(config, sheet);
                sheets.push(sheet.target);

                observe(tw, shadowRoot);

            }


            if (this.css) {
                const clientCss = new CSSStyleSheet();
                clientCss.replaceSync(DOMPurify.sanitize(this.css));
                sheets.push(clientCss);
            }

            shadowRoot.adoptedStyleSheets = sheets;
            this.$el.replaceChildren(...[wrapper])

        }
    },
    mounted() {
        this.rebuildShadowDom();
    },
    updated() {
        this.rebuildShadowDom();
    }
}