<template>
    <div class="flex flex-col">
        <button
            @click="expanded = !expanded"
            class="mx-auto w-fit text-blue-500 hover:text-blue-800"
            :alt="strings.create_slice"
            :aria-expanded="expanded"
            :aria-controls="stagerId">
            <PlusCircleIcon
                aria-hidden="true"
                class="size-6" /><span class="sr-only">{{
                strings.create_slice
            }}</span>
        </button>
        <dialog
            ref="stagerDialog"
            v-if="expanded"
            class="z-50 mx-auto mt-16 w-1/2 rounded-sm border-2 border-purple-800 bg-white shadow-lg"
            @click="
                $event.target === $event.currentTarget
                    ? (expanded = false)
                    : null
            ">
            <div class="p-4">
                <div class="flex flex-col gap-4">
                    <div
                        class="flex flex-row items-center justify-between gap-4">
                        <span class="text-lg font-thin text-purple-900">{{
                            strings.create_slice
                        }}</span>
                        <button
                            @click="expanded = !expanded"
                            class="ml-auto text-blue-500 hover:text-blue-800">
                            <XCircleIcon
                                v-if="expanded"
                                aria-hidden="true"
                                class="size-6" /><span
                                v-if="expanded"
                                class="sr-only"
                                >X</span
                            >
                        </button>
                    </div>

                    <div
                        class="flex flex-col gap-2"
                        :id="stagerId">
                        <div class="grid grid-cols-4 gap-4">
                            <button
                                class="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-blue-800 p-2 text-center text-sm font-semibold text-white hover:bg-blue-950"
                                v-for="button in buttons"
                                @click="generateSliceFromButton(button)">
                                {{ button.label }}
                                <BeakerIcon
                                    class="h-4 w-4"
                                    v-if="button.advanced" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    </div>
</template>
<script>
    import MarkdownSlice from "../../../models/contents/MarkdownSlice";
    import KvListSlice from "../../../models/contents/KvListSlice";
    import HeadingSlice from "../../../models/contents/HeadingSlice";
    import BitmapSlice from "../../../models/contents/BitmapSlice";
    import SvgSlice from "../../../models/contents/SvgSlice";
    import TableSlice from "../../../models/contents/TableSlice";
    import ChartSlice from "../../../models/contents/ChartSlice";
    import LaTeXSlice from "../../../models/contents/LaTeXSlice";
    import HtmlSlice from "../../../models/contents/HtmlSlice";

    import {
        PlusCircleIcon,
        XMarkIcon,
        BeakerIcon,
        XCircleIcon,
    } from "@heroicons/vue/24/solid";

    import TinyButton from "../TinyButton.vue";

    import editorStrings from "../../../editor-strings.js";
    const language = document.documentElement.lang;

    export default {
        emits: ["new"],
        props: {
            soft: Boolean,
        },

        data() {
            return {
                strings: editorStrings[language],
                expanded: false,
                stagerId: Math.random().toString(36).substring(2),
            };
        },
        components: {
            TinyButton,
            PlusCircleIcon,
            XCircleIcon,
            XMarkIcon,
            BeakerIcon,
        },
        watch: {
            expanded(newValue) {
                if (newValue) {
                    this.$nextTick(() => {
                        this.$refs.stagerDialog.showModal();
                    });
                } else {
                    if (this.$refs.stagerDialog) {
                        this.$refs.stagerDialog.close();
                    }
                }
            },
        },

        computed: {
            buttons() {
                return [
                    {
                        label: this.strings.slice_type_markdown,
                        type: MarkdownSlice,
                    },
                    {
                        label: this.strings.slice_type_heading,
                        type: HeadingSlice,
                    },
                    {
                        label: this.strings.slice_type_table,
                        type: TableSlice,
                    },
                    {
                        label: this.strings.slice_type_svg,
                        type: SvgSlice,
                    },

                    {
                        label: this.strings.slice_type_kvlist,
                        type: KvListSlice,
                    },
                    {
                        label: this.strings.slice_type_chart,
                        type: ChartSlice,
                    },
                    {
                        label: this.strings.slice_type_bitmap,
                        type: BitmapSlice,
                        advanced: true,
                    },

                    {
                        label: this.strings.slice_type_LaTeX,
                        type: LaTeXSlice,
                        advanced: true,
                    },

                    {
                        label: this.strings.slice_type_html,
                        type: HtmlSlice,
                        advanced: true,
                    },
                ];
            },
        },
        methods: {
            generateSliceFromButton(button) {
                if (
                    button.advanced &&
                    !window.confirm(this.strings.advanced_slice_warning)
                )
                    return;
                let newSlice = new button.type({});

                newSlice.id = crypto.randomUUID();
                newSlice.state._unlocked = true;

                // Customize the slice presentation.
                if (
                    [
                        BitmapSlice,
                        SvgSlice,
                        TableSlice,
                        HtmlSlice,
                        ChartSlice,
                    ].includes(button.type)
                ) {
                    newSlice.presentation = "figure";
                }

                this.$emit("new", newSlice);
                this.expanded = false;
            },
        },
    };
</script>
