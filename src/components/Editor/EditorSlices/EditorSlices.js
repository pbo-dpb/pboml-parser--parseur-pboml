import { defineAsyncComponent } from 'vue'
import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'
import SliceStager from "../SliceStager/SliceStager.vue"
import Tab from "../Tabs/Tab.vue";
import strings from "../../../editor-strings"

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    data() {
        return {
            'currentTab': 'slices',
            strings: strings[document.documentElement.lang],
        }
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

    components: {
        Tab
    },

    render() {
        return h('main', { class: "flex flex-col gap-4" }, [


            h('div', {
                role: 'tablist', class: 'flex flex-row gap-4 mb-4 border-b border-gray-300'
            }, {
                default: () => [
                    h(Tab, { size: "md", selected: this.currentTab === 'slices', warning: this.pbomlDocument?.slices?.some(slice => slice.state._unlocked) ?? false, onClick: () => { this.currentTab = 'slices' } }, { default: () => this.strings.slices_section_title }),
                    h(Tab, { size: "md", selected: this.currentTab === 'annotations', warning: this.pbomlDocument?.annotations?.some(annotation => annotation.state._unlocked) ?? false, onClick: () => { this.currentTab = 'annotations' } }, { default: () => this.strings.annotations_section_title }),
                ]
            }),

            this.currentTab === 'annotations' ? h(defineAsyncComponent(() => import('../AnnotationsEditor/AnnotationsEditor.js')), { pbomlDocument: this.pbomlDocument }) : null,

            this.currentTab === 'slices' ? h('div', { 'class': 'flex flex-col gap-8' }, [

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
            ]) : null,

        ]);
    }
}