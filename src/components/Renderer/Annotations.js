import PBOMLDocument from "../../models/PBOMLDocument";
import { h } from 'vue'

export default {
    data() {
        return {
            currentHighlight: null,
        }
    },
    props: {
        pbomlDocument: PBOMLDocument,
        language: String,
    },



    methods: {
        handleHashChange(e) {
            this.currentHighlight = location.hash.replace(/[^a-zA-Z0-9\-_]+/g, "");
        }
    },

    created() {
        const handleHashChangeFunc = this.handleHashChange
        addEventListener('hashchange', handleHashChangeFunc);
        handleHashChangeFunc(null);
    },

    beforeUnmount() {
        const handleHashChangeFunc = this.handleHashChange
        removeEventListener('hashchange', handleHashChangeFunc);
    },

    render() {

        if (!this.pbomlDocument.annotations || !this.pbomlDocument.annotations.length) return h("div", { innerHTML: "" });

        return h('aside', { class: 'pt-4 mt-4 border-t border-gray-300', role: "note" }, [
            h('h2', { class: 'font-thin text-2xl mb-4', 'id': "pb__annotations-label" }, `Note${this.pbomlDocument.annotations.length > 1 ? 's' : ''}`),
            h('ol', { class: 'flex flex-col gap-4 print:list-none' }, [
                ...this.pbomlDocument.annotations.map(a => {
                    return a.renderAsVnode(this.language, a.annotationAnchor === this.currentHighlight)
                })
            ])

        ]);
    }

}