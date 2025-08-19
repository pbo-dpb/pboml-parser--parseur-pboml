<template>
    <div class="flex flex-col gap-1 @sm:flex-row text-gray-700 focus-within:text-purple-800">
        <div class="flex flex-row justify-between items-center">
            <label v-if="label" :for="eluid" class="font-semibold">{{ label }}</label>
            <PastePlainTextButton @pasted="handlePaste" class="@sm:hidden"></PastePlainTextButton>
        </div>

        <textarea v-if="multiline" ref="payloadArea" :value="modelValue" :id="eluid"
            class="border border-gray-300 p-1 rounded-sm h-96 w-full outline-purple-800 text-gray-800"
            @input="emitUpdate($event.target.value)">
        </textarea>

        <input type="text" v-else ref="payloadArea" :value="modelValue" :id="eluid"
            class="border border-gray-300 p-1 rounded-sm w-full outline-purple-800  text-gray-800"
            @input="emitUpdate($event.target.value)" />
        <PastePlainTextButton @pasted="handlePaste" class="hidden @sm:block"></PastePlainTextButton>
    </div>
</template>
<script>
import HtmlMarkdownConverter from "../../../HtmlMarkdownConverter.js"
import PastePlainTextButton from "./PastePlainTextButton.vue"

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
    components: { PastePlainTextButton },
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
            this.insertContent(markdown);
        },

        insertContent(content) {
            let textarea = this.$refs.payloadArea;
            if (textarea.selectionStart || textarea.selectionStart == '0') {
                const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
                textarea.setRangeText(content.trim(), start, end, 'select');
            } else {
                textarea.value += content.trim();
            }

            this.emitUpdate(textarea.value)
        },

        handlePaste(content) {
            this.insertContent(content);
        },
    }
}
</script>