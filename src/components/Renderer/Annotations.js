import PBOMLDocument from "../../models/PBOMLDocument";
import { h } from 'vue'

export default {

    props: {
        pbomlDocument: PBOMLDocument,
        language: String
    },

    render() {

        if (!this.pbomlDocument.annotations || !this.pbomlDocument.annotations.length) return h("div", { innerHTML: "" });

        return h('aside', { class: 'pt-4 mt-4 border-t border-gray-300', role: "note" }, [
            h('h2', { class: 'font-thin text-2xl mb-4', 'id': "annotations-label" }, `Note${this.pbomlDocument.annotations.length > 1 ? 's' : ''}`),
            h('dl', { class: 'flex flex-col gap-4' }, [
                ...this.pbomlDocument.annotations.map(a => a.renderAsVnode(this.language))
            ])

        ]);
    }

}