import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'
import SliceStager from "../SliceStager/SliceStager.vue"

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    methods: {

        handleNewSlice(slice, index) {
            // Force a rerender of the slices editor block.
            this.pbomlDocument.addSlice(slice, index);
        },
        handleDeleteSlice(slice) {
            this.pbomlDocument.deleteSlice(slice);
        },
        handleDuplicateSlice(slice) {
            this.pbomlDocument.duplicateSlice(slice);
        },
        handleMoveSlice(slice, direction) {
            this.pbomlDocument.moveSlice(slice, direction);
        }


    },


    render() {
        return h('main', { class: "flex flex-col gap-4" }, [
            h('div', { 'class': 'flex flex-col gap-8' }, [

                h(SliceStager, {
                    soft: this.pbomlDocument.slices.length ? true : false,
                    onNew: (slice) => {
                        this.handleNewSlice(slice, 0)
                    }
                }),

                ...(!!this.pbomlDocument.slices.forEach ? this.pbomlDocument.slices.map((slice, i) => {

                    let sliceEditingVnode = slice.renderEditingVnode();
                    sliceEditingVnode.props.onDeleteSlice = this.handleDeleteSlice;
                    sliceEditingVnode.props.onDuplicateSlice = this.handleDuplicateSlice;
                    sliceEditingVnode.props.onMoveSlice = this.handleMoveSlice;

                    return h('div', {}, [
                        sliceEditingVnode,
                        h(SliceStager, {
                            class: 'my-8',
                            soft: this.pbomlDocument.slices.length !== (i + 1),
                            onNew: (slice) => {
                                this.handleNewSlice(slice, i + 1)
                            }
                        }),
                    ]);
                }) : null),
            ]),

        ]);
    }
}