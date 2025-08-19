<template>
    <div class="flex flex-col gap-1 @sm:flex-row text-gray-700 focus-within:text-purple-800">
        <div class="flex flex-row justify-between items-center">
            <label v-if="label" :for="eluid" class="font-semibold">{{ label }}</label>
            <!--<PasteFromOfficeButton @click="handlePaste" class="@sm:hidden "></PasteFromOfficeButton>-->
        </div>

        <textarea v-if="multiline" ref="payloadArea" :value="modelValue" :id="eluid"
            class="border border-gray-300 p-1 rounded-sm h-96 w-full outline-purple-800 text-gray-800"
            @input="emitUpdate($event.target.value)">
        </textarea>

        <input type="text" v-else ref="payloadArea" :value="modelValue" :id="eluid"
            class="border border-gray-300 p-1 rounded-sm w-full outline-purple-800  text-gray-800"
            @input="emitUpdate($event.target.value)" />

        <!--<PasteFromOfficeButton @click="handlePaste" class="hidden @sm:block"></PasteFromOfficeButton>-->
    </div>
</template>
<script>
import HtmlMarkdownConverter from "../../../HtmlMarkdownConverter.js"
import PasteFromOfficeButton from "./PasteFromOfficeButton.vue"

export default {
    props: {
        'modelValue': { required: true },
        'label': {},
        'multiline': {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            eluid: Math.random().toString(36).substring(2),
        }
    },
    components: { PasteFromOfficeButton },
    mounted() {
        this.registerToPasteEvent();
    },
    methods: {
        registerToPasteEvent() {
            this.$refs.payloadArea.addEventListener("paste", (event) => {
                let data = event.clipboardData.getData('text/html');
                if (!data) {
                    data = event.clipboardData.getData('text/plain');
                }

                this.sanitizeAndInsertHtml(data);
                event.preventDefault();
            });
        },
        emitUpdate(value) {
            this.$emit('update:modelValue', value)
        },
        sanitizeAndInsertHtml(html) {

            let markdown = (new HtmlMarkdownConverter).convert(html);


            /**
             * Replace or insert at current selection
             */
            let textarea = this.$refs.payloadArea;
            if (textarea.selectionStart || textarea.selectionStart == '0') {
                const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
                textarea.setRangeText(markdown.trim(), start, end, 'select');
            } else {
                textarea.value += markdown.trim();
            }

            this.emitUpdate(textarea.value)
        },
        /*
        // Word stopped allowing us to paste HTML directly from the clipboard.

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
                        const blob = await item.getType("text/plain");
                        const markdown = await blob.text();
                        this.sanitizeAndInsertMarkdown(markdown);
                        break;
                    }

                }
            } catch (error) {

            }

        }*/
    }
}
</script>