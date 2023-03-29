import editorStrings from "../editor-strings";
import { h, Suspense, defineAsyncComponent } from 'vue'
import LoadingIndicator from "../components/LoadingIndicator.vue"
import MetaEditingButton from "../components/Editor/MetaEditingButton";
import PreviewingButton from "../components/Editor/PreviewingButton";

export default {
    props: ["slice", "language"],
    render() {

        const verboseSliceType = editorStrings[this.language][`slice_type_${this.slice.type}`];

        return h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded ${this.slice.readonly ? ' filter grayscale opacity-80' : ''}` },
            [

                h('legend',
                    { class: 'text-sm px-2 text-gray-600 flex flex-row gap-2 items-center' },
                    [
                        verboseSliceType ? h('span', {}, verboseSliceType) : null,

                        h(MetaEditingButton, {
                            'isEditing': this.slice.state.isEditingMeta,
                            'onClick': (value) => {
                                this.slice.state.isEditingMeta = !this.slice.state.isEditingMeta;
                            }
                        }),
                        h(PreviewingButton, {
                            'isPreviewing': this.slice.state.isPreviewing,
                            'onPreviewing': (value) => {
                                this.slice.state.isPreviewing = value;
                            }
                        }, () => []),

                    ]),
                this.slice.state.isPreviewing ? this.slice._buildVnodes(this.slice.state.isPreviewing) : h(Suspense, null, {
                    default: () => h('div', { class: 'flex flex-col gap-2' }, this.slice.__buildEditorsVnode()),
                    fallback: () => h('template', null, LoadingIndicator)
                })])

    }
}