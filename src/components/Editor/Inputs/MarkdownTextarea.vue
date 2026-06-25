<template>
    <div
        class="flex flex-col gap-1 text-gray-700 focus-within:text-purple-800 @sm:flex-row">
        <div class="flex flex-row items-center justify-between">
            <label
                v-if="label"
                :for="eluid"
                class="font-semibold"
                >{{ label }}</label
            >
            <PastePlainTextButton
                @pasted="handlePaste"
                class="@sm:hidden"></PastePlainTextButton>
        </div>

        <textarea
            v-if="multiline"
            ref="payloadArea"
            :value="modelValue"
            :id="eluid"
            class="h-96 w-full rounded-sm border border-gray-300 p-1 text-gray-800 outline-purple-800"
            @input="emitUpdate($event.target.value)">
        </textarea>

        <input
            type="text"
            v-else
            ref="payloadArea"
            :value="modelValue"
            :id="eluid"
            class="w-full rounded-sm border border-gray-300 p-1 text-gray-800 outline-purple-800"
            @input="emitUpdate($event.target.value)" />
        <PastePlainTextButton
            @pasted="handlePaste"
            class="hidden @sm:block"></PastePlainTextButton>
    </div>
</template>
<script>
    import HtmlMarkdownConverter from "../../../HtmlMarkdownConverter.js";
    import PastePlainTextButton from "./PastePlainTextButton.vue";

    export default {
        props: {
            modelValue: { required: true },
            label: {},
            multiline: {
                type: Boolean,
                default: true,
            },
        },
        emits: ["update:modelValue"],
        data() {
            return {
                eluid: Math.random().toString(36).substring(2),
            };
        },
        components: { PastePlainTextButton },
        mounted() {
            this.registerToPasteEvent();
        },
        methods: {
            registerToPasteEvent() {
                this.$refs.payloadArea.addEventListener("paste", (event) => {
                    let data = event.clipboardData.getData("text/html");
                    if (!data) {
                        data = event.clipboardData.getData("text/plain");
                    }

                    this.sanitizeAndInsertHtml(data);
                    event.preventDefault();
                });
            },
            emitUpdate(value) {
                this.$emit("update:modelValue", value);
            },
            sanitizeAndInsertHtml(html) {
                let markdown = new HtmlMarkdownConverter().convert(html);
                this.insertContent(markdown);
            },

            insertContent(content) {
                let textarea = this.$refs.payloadArea;
                if (textarea.selectionStart || textarea.selectionStart == "0") {
                    const [start, end] = [
                        textarea.selectionStart,
                        textarea.selectionEnd,
                    ];
                    textarea.setRangeText(content.trim(), start, end, "select");
                } else {
                    textarea.value += content.trim();
                }

                this.emitUpdate(textarea.value);
            },

            handlePaste(content) {
                this.insertContent(content);
            },
        },
    };
</script>
