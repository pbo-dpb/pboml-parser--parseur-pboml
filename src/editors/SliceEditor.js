import editorStrings from "../editor-strings";
import { h, Suspense } from 'vue'
import LoadingIndicator from "../components/LoadingIndicator.vue"
import MetaEditingButton from "../components/Editor/MetaEditingButton";
import PreviewingButton from "../components/Editor/PreviewingButton";
import SliceSourceCodeEditButton from "../components/Editor/SliceSourceCodeEditButton";
import DeleteButton from "../components/Editor/DeleteButton";
import DuplicateButton from "../components/Editor/DuplicateButton";
import MoveButton from "../components/Editor/MoveButton";
import Renderer from "../components/Renderer/Renderer";
import SliceSourceCodeEditor from "../components/Editor/SliceSourceCodeEditor.vue";

import SliceEditorLockStateToggler from "./SliceEditorLockStateToggler";

export default {
    props: ["slice", "language"],
    methods: {
        resetSliceState() {
            this.slice.state.isEditingSourceCode = false;
            this.slice.state.isEditingMeta = false;
            this.slice.state.isPreviewing = false;
        }
    },
    render() {

        const verbosePresentationStyle = editorStrings[this.language][`presentation_${this.slice.presentation}`]
        const verboseSliceType = editorStrings[this.language][`slice_type_${this.slice.type}`];


        let currentContext = [];

        if (this.slice.state.isPreviewing) {
            // Preview
            currentContext.push(
                h('div', { class: 'border-4 border-slate-100 border-dashed p-4 rounded-sm' }, [
                    h('div', { class: "uppercase text-xl font-bold text-slate-500 -mt-2 mb-2 pb-2 border-b-4 border-slate-100 border-dashed" }, `${editorStrings[this.language].editor_actions_preview} (${this.slice.state.isPreviewing})`),
                    Renderer.methods.renderSliceAsVnode(this.slice, this.slice.state.isPreviewing)
                ])
            );
        } else if (this.slice.state.isEditingSourceCode) {
            // Source code editor
            currentContext.push(
                h(SliceSourceCodeEditor, { slice: this.slice, onUpdate: () => { this.resetSliceState() } })
            )
        } else {
            // Editor
            currentContext.push(
                h(Suspense, null, {
                    default: () => h('div', { class: 'flex flex-col gap-4' }, this.slice.__buildEditorsVnode()),
                    fallback: () => h('template', null, LoadingIndicator)
                })
            )
        }


        let presentationSpecificHeading = [];
        if (this.slice.presentation === 'figure') {
            presentationSpecificHeading.push('bg-slate-300', 'border-slate-300')
        } else if (this.slice.presentation === 'aside') {
            presentationSpecificHeading.push('bg-blue-300', 'border-blue-300')
        }


        return h('section', { class: 'relative' }, [
            this.$attrs.onMoveSlice ? h(SliceEditorLockStateToggler, { class: 'absolute -left-8', slice: this.slice }, () => []) : null,

            this.slice.state._unlocked ? null : h('div', { 'aria-hidden': true, class: 'grid grid-cols-2 selection-none', inert: true }, [
                h('div', { class: '-mx-16 scale-75' }, [Renderer.methods.renderSliceAsVnode(this.slice, 'en')]),
                h('div', { class: '-mx-16 scale-75' }, [Renderer.methods.renderSliceAsVnode(this.slice, 'fr')]),
            ]),


            this.slice.state._unlocked ? h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded-sm ${this.slice.readonly ? ' filter grayscale opacity-80' : ''}` },
                [

                    h('legend',
                        { class: ` text-sm px-2 text-gray-800 border-2 flex flex-row gap-2 items-center w-full justify-between w-full rounded-sm py-2 ${presentationSpecificHeading.join(' ')}` },
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

                                h(SliceSourceCodeEditButton, {
                                    'onEditing': (value) => {
                                        this.resetSliceState()
                                        this.slice.state.isEditingSourceCode = value;
                                    },
                                    "isEditingSource": this.slice.state.isEditingSourceCode
                                }),


                                h('div', {
                                    'aria-hidden': true,
                                    'class': 'text-gray-400',
                                }, "•"),

                                h(PreviewingButton, {
                                    'isPreviewing': this.slice.state.isPreviewing,
                                    'onPreviewing': (value) => {
                                        this.resetSliceState()
                                        this.slice.state.isPreviewing = value;
                                    }
                                }, () => []),

                                h(MetaEditingButton, {
                                    'isEditing': this.slice.state.isEditingMeta,
                                    'onEditing': (value) => {
                                        this.resetSliceState()
                                        this.slice.state.isEditingMeta = value;
                                    }
                                }),

                            ])

                        ]),

                    ...currentContext
                ]) : null,

        ])

    }
}