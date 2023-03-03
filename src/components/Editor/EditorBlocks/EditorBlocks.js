import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    methods: {


    },


    render() {
        return h('main', { 'class': 'flex flex-col gap-8 pb-8' }, [
            ...(!!this.pbomlDocument.slices.forEach ? this.pbomlDocument.slices.map((slice) => {
                return slice.renderEditingVnode();
            }) : null),
        ]);
    }
}