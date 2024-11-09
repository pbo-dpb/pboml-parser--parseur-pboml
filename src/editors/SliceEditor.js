import editorStrings from "../editor-strings";
import { h, Suspense, defineAsyncComponent } from 'vue'
import LoadingIndicator from "../components/LoadingIndicator.vue"
import MetaEditingButton from "../components/Editor/MetaEditingButton";
import PreviewingButton from "../components/Editor/PreviewingButton";
import DeleteButton from "../components/Editor/DeleteButton";
import DuplicateButton from "../components/Editor/DuplicateButton";
import MoveButton from "../components/Editor/MoveButton";
import Renderer from "../components/Renderer/Renderer";


import { ListBulletIcon } from "@heroicons/vue/24/solid";
import SliceEditorCollapser from "./SliceEditorCollapser";

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


        return h('section', { class: 'relative' }, [
            this.$attrs.onMoveSlice ? h(SliceEditorCollapser, { class: 'absolute -left-8', slice: this.slice }, () => []) : null,

            this.slice.state.collapsed ? h('div', { 'aria-hidden': true, class: 'selection-none relative h-24 overflow-hidden', inert: true }, [
                h('div', { class: 'absolute bg-gradient-to-t from-white h-24 w-full z-10' }, ''),
                Renderer.methods.renderSliceAsVnode(this.slice, this.language),
            ]) : null,

            this.slice.state.collapsed ? null : h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded ${this.slice.readonly ? ' filter grayscale opacity-80' : ''}` },
                [

                    h('legend',
                        { class: ` text-sm px-2 text-gray-800 border-2 flex flex-row gap-2 items-center w-full justify-between w-full rounded py-2 ${presentationSpecificHeading.join(' ')}` },
                        [

                            h('div', { class: 'font-semibold text-lg flex flex-row gap-2' }, [(verbosePresentationStyle ? h('em', {}, verbosePresentationStyle) : null), (verboseSliceType ? verboseSliceType : null)]),

                            h('div', { class: 'flex flex-row gap-2' }, [
                                this.$attrs.onDeleteSlice ? h(DeleteButton, {
                                    'onDelete': (value) => {
                                        this.$emit("delete-slice", this.slice);
                                    }
                                }) : null,

                                this.$attrs.onDuplicateSlice ? h(DuplicateButton, {
                                    'onDuplicate': (value) => {
                                        this.$emit("duplicate-slice", this.slice);
                                    }
                                }) : null,

                                this.$attrs.onMoveSlice ? h(MoveButton, {
                                    canMoveUp: this.slice.state.canMoveUp,
                                    canMoveDown: this.slice.state.canMoveDown,
                                    'onMove': (direction) => {
                                        this.$emit("move-slice", this.slice, direction);
                                    }
                                }, () => []) : null,

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

                    this.slice.state.isPreviewing ? h('div', { class: 'border-4 border-slate-100 border-dashed p-4 rounded' }, [
                        h('div', { class: "uppercase text-xl font-bold text-slate-500 -mt-2 mb-2 pb-2 border-b-4 border-slate-100 border-dashed" }, `${editorStrings[this.language].editor_actions_preview} (${this.slice.state.isPreviewing})`),
                        Renderer.methods.renderSliceAsVnode(this.slice, this.slice.state.isPreviewing)
                    ]) : h(Suspense, null, {
                        default: () => h('div', { class: 'flex flex-col gap-4' }, this.slice.__buildEditorsVnode()),
                        fallback: () => h('template', null, LoadingIndicator)
                    }),
                ])
        ])

    }
}