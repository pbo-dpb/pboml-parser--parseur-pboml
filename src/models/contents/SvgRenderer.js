import { h } from "vue"

export default {
    props: ['payload'],
    render() {
        return h('div');
    },
    methods: {
        rebuildShadowDom() {
            let wrapper = document.createElement("div");
            wrapper.classList.add("w-full");
            const shadowRoot = wrapper.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = this.payload;
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