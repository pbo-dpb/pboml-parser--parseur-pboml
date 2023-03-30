import editorStrings from "../editor-strings";
import { h, Suspense, defineAsyncComponent } from 'vue'
import LoadingIndicator from "../components/LoadingIndicator.vue"
import MetaEditingButton from "../components/Editor/MetaEditingButton";
import PreviewingButton from "../components/Editor/PreviewingButton";
import DeleteButton from "../components/Editor/DeleteButton";
import MoveButton from "../components/Editor/MoveButton";


import { ListBulletIcon } from "@heroicons/vue/24/solid";

export default {
    props: ["slice", "language"],
    render() {

        const verbosePresentationStyle = editorStrings[this.language][`presentation_${this.slice.presentation}`]
        const verboseSliceType = editorStrings[this.language][`slice_type_${this.slice.type}`];

        let presentationSpecificHeading = [];
        if (this.slice.presentation === 'figure') {
            presentationSpecificHeading.push('bg-slate-300', 'border-slate-300')
        } else if (this.slice.presentation === 'aside') {
            presentationSpecificHeading.push('bg-blue-300', 'border-blue-300')
        }



        return h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded ${this.slice.readonly ? ' filter grayscale opacity-80' : ''}` },
            [

                h('legend',
                    { class: `text-sm px-2 text-gray-600 flex flex-row gap-2 items-center w-full justify-between border-2 rounded py-2 ${presentationSpecificHeading.join(' ')}` },
                    [

                        h('div', { class: 'font-semibold text-lg flex flex-row gap-2' }, [(verbosePresentationStyle ? h('em', {}, verbosePresentationStyle) : null), (verboseSliceType ? verboseSliceType : null)]),

                        h('div', { class: 'flex flex-row gap-2' }, [
                            h(DeleteButton, {
                                'isEditing': this.slice.state.isEditingMeta,
                                'onDelete': (value) => {
                                    this.$emit("delete-slice", this.slice);
                                }
                            }),

                            h(MoveButton, {
                                canMoveUp: this.slice.state.canMoveUp,
                                canMoveDown: this.slice.state.canMoveDown,
                                'onMove': (direction) => {
                                    this.$emit("move-slice", this.slice, direction);
                                }
                            }, () => []),

                            h('div', {
                                'aria-hidden': true,
                                'class': 'text-gray-400',
                            }, "•"),

                            h(PreviewingButton, {
                                'isPreviewing': this.slice.state.isPreviewing,
                                'onPreviewing': (value) => {
                                    this.slice.state.isEditingMeta = false;
                                    this.slice.state.isPreviewing = value;
                                }
                            }, () => []),

                            h(MetaEditingButton, {
                                'isEditing': this.slice.state.isEditingMeta,
                                'onClick': (value) => {
                                    this.slice.state.isPreviewing = false;
                                    this.slice.state.isEditingMeta = !this.slice.state.isEditingMeta;
                                }
                            }),




                        ])




                    ]),
                this.slice.state.isPreviewing ? this.slice._buildVnodes(this.slice.state.isPreviewing) : h(Suspense, null, {
                    default: () => h('div', { class: 'flex flex-col gap-2' }, this.slice.__buildEditorsVnode()),
                    fallback: () => h('template', null, LoadingIndicator)
                })])

    }
}