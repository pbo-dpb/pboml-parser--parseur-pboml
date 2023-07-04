<template>
    <div class="flex flex-col gap-1">
        <div class="flex flex-row justify-between items-center">
            <label v-if="label" :for="eluid" class="font-semibold">{{ label }}</label>
            <TinyButton :disabled="!canPaste" @click="handlePaste" :title="editorStrings.paste_from_word">
                <ClipboardDocumentListIcon class="w-4 h-4"></ClipboardDocumentListIcon>
                <span class="sr-only">{{ editorStrings.paste_from_word }}</span>
            </TinyButton>
        </div>

        <textarea ref="payloadArea" :value="modelValue" :id="eluid" class="border border-gray-300 p-1 rounded h-96"
            @input="emitUpdate($event.target.value)">
        </textarea>
    </div>
</template>
<script>
import TinyButton from "../TinyButton.vue"
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import Turndown from "turndown"
import { tables as gfmTables } from 'joplin-turndown-plugin-gfm'

import editorStrings from "../../../editor-strings"

export default {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    data() {
        return {
            eluid: Math.random().toString(36).substring(2),
            canPaste: true,
            editorStrings: editorStrings[document.documentElement.lang]
        }
    },
    components: {
        TinyButton, ClipboardDocumentListIcon
    },
    methods: {
        emitUpdate(value) {
            this.$emit('update:modelValue', value)
        },
        sanitizeAndInsertMarkdown(markdown) {
            /**
             * Markdown customizations
             */

            // More regular Word
            markdown = markdown.replaceAll('•	', '- ')
                .replaceAll('o	', '- ')
                .replaceAll('	', '- ')
                // Catch weird word list rendering.
                .replaceAll('·        ', '- ')
                .replaceAll('·         ', '- ')
                .replaceAll('o   ', '  - ')
                .replaceAll('§  ', '    - ');


            // Remove all pasted references.
            markdown = markdown.replace(/\n\* \* \*\n((.|\n|\r)*)$/, '')
            markdown = markdown.replaceAll((new RegExp('\\[\\\\\\[[a-z0-9]{1,}\\\\\\]\\]\\(file:\\/\\/([^|)])+\\)', 'g')), '[^🟠]')
            markdown = markdown.replaceAll((new RegExp('\[\\\[[0-9]{1,}\\\]\]\(file:([^)])+\)', 'g')), '[^🟠]')

            // Use first row as table headers when no header is present
            markdown = markdown.replace(/^\|[ \|]{1,}\|\n\| [ \-\|]{1,}\ \|\n\| [^\n]{1,} \|\n/gm, (match) => {
                // Return the replacement leveraging the parameters.
                const headerArr = match.split("\n")
                if (headerArr.length != 4) return match;
                return [headerArr[2], headerArr[1], headerArr[4]].join("\n")
            });



            /**
             * Replace or insert at current selection
             */
            let textarea = this.$refs.payloadArea;
            if (textarea.selectionStart || textarea.selectionStart == '0') {
                var startPos = textarea.selectionStart;
                var endPos = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, startPos)
                    + markdown.trim()
                    + textarea.value.substring(endPos, textarea.value.length);
            } else {
                textarea.value += markdown.trim();
            }

            this.emitUpdate(textarea.value)
        },
        async handlePaste() {
            try {
                const permission = await navigator.permissions.query({
                    name: "clipboard-read",
                });

                if (permission.state === "denied") {
                    window.alert("Paste not allowed")
                    return
                }

                const clipboardContents = await navigator.clipboard.read();
                for (const item of clipboardContents) {

                    if (item.types.includes("text/html")) {

                        const blob = await item.getType("text/html");

                        // Convert HTML to Markdown
                        const turndownService = new Turndown()
                        turndownService.use(gfmTables)
                        const blobText = await blob.text();
                        let markdown = turndownService.turndown(blobText)
                        this.sanitizeAndInsertMarkdown(markdown);
                        break;
                    } else if (item.types.includes('text/plain')) {
                        const blob = await item.getType("text/html");
                        const markdown = await blob.text();
                        this.sanitizeAndInsertMarkdown(markdown);
                        break;
                    }

                }
            } catch (error) {

            }

        }
    }
}
</script>