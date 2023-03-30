import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    methods: {
        handleDeleteSlice(slice) {
            this.$emit('delete-slice', slice);
        },

        handleMoveSlice(slice, direction) {
            this.$emit('move-slice', slice, direction);
        }

    },


    render() {
        return h('main', { 'class': 'flex flex-col gap-8 pb-8' }, [
            ...(!!this.pbomlDocument.slices.forEach ? this.pbomlDocument.slices.map((slice) => {
                let sliceEditingVnode = slice.renderEditingVnode();
                sliceEditingVnode.props.onDeleteSlice = this.handleDeleteSlice;
                sliceEditingVnode.props.onMoveSlice = this.handleMoveSlice;
                return h('div', {}, [sliceEditingVnode]);
            }) : null),
        ]);
    }
}