<template>
    <div class="flex flex-col gap-4 border border-blue-800 rounded-sm p-4">

        <div class="grid grid-cols-2 gap-2">
            <StructureImporterDocxPicker @pick="handleFilePicked" language="en"></StructureImporterDocxPicker>
            <StructureImporterDocxPicker @pick="handleFilePicked" language="fr"></StructureImporterDocxPicker>
        </div>

        <hr>

        <div class="grid grid-cols-2 gap-2">
            <markdown-textarea v-model="en" label="EN"></markdown-textarea>
            <markdown-textarea v-model="fr" label="FR"></markdown-textarea>
        </div>

        <div v-html="visualStructureHtml"></div>
        <div>
            <Button @click="handleImportAction" :disabled="!canImport">
                <Import class="size-4"></Import> Import
            </Button>
        </div>
    </div>
</template>
<script>
import MarkdownTextarea from "../../Inputs/MarkdownTextarea.vue";
import StructureImporterDocxPicker from "./StructureImporterDocxPicker.vue"
import editorStrings from "../../../../editor-strings"
import Button from "../../Button.vue";

import { Import } from 'lucide-vue-next'
import { Marked } from 'marked';
import HeadingSlice from "../../../../models/contents/HeadingSlice";
import MarkdownSlice from "../../../../models/contents/MarkdownSlice";
import TableSlice from "../../../../models/contents/TableSlice";
import SvgSlice from "../../../../models/contents/SvgSlice";
import Annotation from "../../../../models/Annotation";

export default {
    props: ["pbomlDocument"],
    components: {
        Button,
        MarkdownTextarea,
        Import,
        StructureImporterDocxPicker
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
            if (!this.en)
                return "";

            const containerUl = document.createElement("ol");
            containerUl.classList.add("text-sm", "list-decimal", "list-outside", "ml-4");


            this.importedStructure.slices.forEach((slice) => {

                const li = document.createElement("li");
                li.classList.add("text-gray-500");
                if (slice.state._structureImporterError) {
                    li.classList.add("bg-red-300");
                }

                let innerHTML = `<span class="font-semibold text-black mr-2">${this.editorStrings[`slice_type_${slice.type}`]}</span>`;

                let contents = [
                    slice.content?.en ? `<span class="text-gray-500">${slice.content.en}</span>` : null,
                    slice.content?.fr ? `<span class="text-gray-500">${slice.content.fr}</span>` : null
                ].filter((c) => c);

                if (slice.state._structureImporterError) {
                    contents = [...contents, `<span class="text-red-500">${slice.state._structureImporterError}</span>`];
                }

                innerHTML += contents.join(" ▪️ ");

                li.innerHTML = innerHTML;

                containerUl.appendChild(li);

            })

            this.importedStructure.annotations.forEach((annotation) => {

                const li = document.createElement("li");
                li.classList.add("text-gray-500");

                let innerHTML = `<span class="font-semibold text-purple-900 mr-2">Note</span>`;

                let contents = [
                    annotation.content?.en ? `<span class="text-gray-500te">${annotation.content.en.substring(0, 50) + "…"}</span>` : null,
                    annotation.content?.en ? `<span class="text-gray-500">${annotation.content.en.substring(0, 50) + "…"}</span>` : null,
                    annotation.content?.fr ? `<span class="text-gray-500">${annotation.content.fr.substring(0, 50) + "…"}</span>` : null
                ].filter((c) => c);

                innerHTML += contents.join(" ▪️ ");

                li.innerHTML = innerHTML;

                containerUl.appendChild(li);

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
                return {};
            }

            let counter = 0;
            const slices = englishStructure.slices.map((enSlice) => {
                let frSlice = frenchStructure.slices[counter];
                counter++;

                if (!frSlice || enSlice.type !== frSlice.type)
                    enSlice.state._structureImporterError = "❌ type mismatch";

                if (frSlice && (frSlice.type === "heading" && enSlice.type === "heading" && frSlice.level !== enSlice.level))
                    enSlice.state._structureImporterError = "❗ heading level mismatch";

                if (enSlice.type === "heading" && frSlice && frSlice.type === "heading") {
                    enSlice.content.fr = frSlice.content?.fr;
                    enSlice.state._unlocked = false; // Heading with both French and English can be locked
                }


                return enSlice;
            });

            counter = 0;
            const annotations = englishStructure.annotations.map((enAnnotation) => {
                let frAnnotation = frenchStructure.annotations?.[counter] ?? {};
                counter++;

                if (enAnnotation.content?.['en'] && frAnnotation.content?.['fr']) {
                    enAnnotation.content.fr = frAnnotation.content.fr;
                    enAnnotation.state._unlocked = false;
                }

                return enAnnotation;
            });

            return {
                slices,
                annotations
            }
        },

        canImport() {
            return this.visualStructureHtml
        }

    },

    methods: {

        handleFilePicked(payload) {
            this[payload.language] = payload.markdown;
        },

        walkThroughMarkdown(markdown, language) {

            let slices = [];
            let annotations = [];
            let importingAnnotations = false;
            let counter = 0;
            const marked = new Marked();
            marked.use({
                walkTokens: (token) => {
                    let payload = { state: { _unlocked: true } };
                    if (token.type === 'heading') {
                        payload.content = {};
                        payload.content[language] = token.text;
                        payload.level = token.depth - 1;

                        if (payload.content[language] === "Notes" && payload.level === 0) {
                            importingAnnotations = true; // Once we meet a heading named 'Notes', we are importing the rest as annotations.
                        } else {
                            slices.push(new HeadingSlice(payload));
                        }

                    } else if (!importingAnnotations && token.type === 'paragraph') {
                        let previousSlice = slices.length ? slices[slices.length - 1] : null;
                        // Don't create a new slice if the previous slice was also a markdown slice
                        if (previousSlice && previousSlice.type === "markdown")
                            return;
                        slices.push(new MarkdownSlice(payload));
                    } else if (!importingAnnotations && token.type === 'table') {
                        slices.push(new TableSlice(payload));
                    } else if (!importingAnnotations && token.type === 'image') {
                        slices.push(new SvgSlice(payload));
                    } else if (importingAnnotations && token.type === 'list_item') {
                        payload.content = {};
                        // Token text finishes with [↑](#endnote-ref-x). The [↑] and everything after can be stripped.
                        let positionOfStripping = token.text.indexOf("[↑]");

                        // Each raw content starts with a number followed by a point (e.g.  1. or 12.). Extract this and assign it as the annotation's id.
                        payload.id = parseInt(token.text.match(/^\d+\./)?.[0] || counter + 1);

                        counter++;

                        payload.content[language] = (positionOfStripping !== -1 ? token.text.slice(0, positionOfStripping) : token.text)?.trim();

                        annotations.push(new Annotation(payload));

                    }

                }
            });

            marked.parse(markdown);

            return { slices, annotations };
        },

        handleImportAction() {

            let structure = this.importedStructure;

            this.pbomlDocument.slices = [
                ...this.pbomlDocument.slices,
                ...structure.slices
            ]
            this.pbomlDocument.annotations = [
                ...this.pbomlDocument.annotations,
                ...structure.annotations
            ]
            this.$emit("close");

        }

    },



}
</script>