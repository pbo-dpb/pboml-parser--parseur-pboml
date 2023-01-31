import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    methods: {


    },


    render() {
        return h('main', { 'class': 'flex flex-col gap-16 print:block pb-16' }, [
            ...(!!this.pbomlDocument.slices.forEach ? this.pbomlDocument.slices.map((slice) => {
                return slice.renderEditingVnode();
            }) : null),
        ]);
    }
}