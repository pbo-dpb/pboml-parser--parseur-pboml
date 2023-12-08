<template>
    <div class="flex flex-col gap-4 border border-blue-800 rounded p-4">

        <div class="grid grid-cols-2 gap-2">
            <markdown-textarea v-model="en" label="EN"></markdown-textarea>
            <markdown-textarea v-model="fr" label="FR"></markdown-textarea>
        </div>

        <div v-html="visualStructureHtml"></div>
        <div>
            <Button @click="handleImportAction" :disabled="!canImport">
                <RectangleGroupIcon class="h-4 w-4/12"></RectangleGroupIcon> Import
            </Button>
        </div>
    </div>
</template>
<script>
import MarkdownTextarea from "../../Inputs/MarkdownTextarea.vue";
import editorStrings from "../../../../editor-strings"
import Button from "../../Button.vue";

import { RectangleGroupIcon } from '@heroicons/vue/24/outline'
import { Marked } from 'marked';
import HeadingSlice from "../../../../models/contents/HeadingSlice";
import MarkdownSlice from "../../../../models/contents/MarkdownSlice";
import TableSlice from "../../../../models/contents/TableSlice";

export default {
    props: ["pbomlDocument"],
    components: {
        Button,
        MarkdownTextarea,
        RectangleGroupIcon
    },

    data() {
        return {
            editorStrings: editorStrings[document.documentElement.lang],
            en: "",
            fr: ""
        }
    },

    mounted() {


    },

    computed: {

        visualStructureHtml() {
            if (!this.en || !this.fr)
                return "";

            const containerUl = document.createElement("ol");
            containerUl.classList.add("text-sm", "list-decimal", "list-outside", "ml-4");

            this.importedStructure.forEach((slice) => {
                if (typeof slice === "string") {
                    const li = document.createElement("li");
                    li.innerText = slice;
                    li.classList.add("text-red-500");
                    containerUl.appendChild(li);
                } else {
                    const li = document.createElement("li");
                    li.classList.add("text-gray-500");

                    let innerHTML = `<span class="font-semibold text-black mr-2">${this.editorStrings[`slice_type_${slice.type}`]}</span>`;

                    let contents = [
                        slice.content?.en ? `<span class="text-gray-500">${slice.content.en}</span>` : null,
                        slice.content?.fr ? `<span class="text-gray-500">${slice.content.fr}</span>` : null
                    ].filter((c) => c);

                    innerHTML += contents.join(" ▪️ ");

                    li.innerHTML = innerHTML;

                    containerUl.appendChild(li);
                }
            })

            return containerUl.outerHTML;
        },

        importedStructure() {


            let englishStructure;
            let frenchStructure;
            try {
                englishStructure = this.walkThroughMarkdown(this.en, "en");
                frenchStructure = this.walkThroughMarkdown(this.fr, "fr");
            } catch (e) {
                return [];
            }

            let counter = 0;
            return englishStructure.map((enSlice) => {
                let frSlice = frenchStructure[counter];
                counter++;

                if (!frSlice || enSlice.type !== frSlice.type)
                    return "❌ type mismatch";

                if (frSlice.type === "heading" && enSlice.type === "heading" && frSlice.level !== enSlice.level)
                    return "❗ heading level mismatch";

                if (enSlice.type === "heading")
                    enSlice.content.fr = frSlice.content?.fr;

                return enSlice;
            });


        }
        ,

        canImport() {
            return this.visualStructureHtml && this.importedStructure.filter((s) => typeof s === "string").length === 0;
        }

    },

    methods: {

        walkThroughMarkdown(markdown, language) {

            let slices = []
            const marked = new Marked();
            marked.use({
                walkTokens: (token) => {
                    if (token.type === 'heading') {
                        let payload = { content: {} };
                        payload.content[language] = token.text;
                        payload.level = token.depth - 1;
                        slices.push(new HeadingSlice(payload));
                    } else if (token.type === 'paragraph') {
                        let previousSlice = slices.length ? slices[slices.length - 1] : null;

                        // Don't create a new slice if the previous slice was also a markdown slice
                        if (previousSlice && previousSlice.type === "markdown")
                            return;
                        slices.push(new MarkdownSlice({}));
                    } else if (token.type === 'table') {
                        slices.push(new TableSlice({}));
                    }

                }
            });

            marked.parse(markdown);

            return slices;
        },

        handleImportAction() {

            this.pbomlDocument.slices = [
                ...this.pbomlDocument.slices,
                ...this.importedStructure
            ]
            this.$emit("close");

        }

    },



}
</script>