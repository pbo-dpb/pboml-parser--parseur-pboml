import { h } from "vue"
import { parse, HtmlGenerator } from 'latex.js'

export default {
    props: ['payload'],
    render() {
        return h('div');
    },
    methods: {
        rebuildShadowDom() {
            try {
                let wrapper = document.createElement("div");
                wrapper.classList.add("w-full");
                const shadowRoot = wrapper.attachShadow({ mode: 'open' });

                let generator = new HtmlGenerator({ hyphenate: false })

                let doc = parse(this.payload, { generator: generator })
                shadowRoot.append(doc.domFragment());
                shadowRoot.append(generator.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/"))
                this.$el.replaceChildren(...[wrapper])
            } catch (error) {
                console.error(error);
            }

        }
    },
    mounted() {
        this.rebuildShadowDom();
    },
    updated() {
        this.rebuildShadowDom();
    }
}