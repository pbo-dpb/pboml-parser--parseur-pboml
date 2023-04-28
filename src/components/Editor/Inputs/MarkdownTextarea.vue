<template>
    <div class="flex flex-col gap-1">
        <div class="flex flex-row justify-between items-center">
            <label v-if="label" :for="eluid" class="font-semibold">{{ label }}</label>
            <TinyButton :disabled="!canPaste" @click="handlePaste">
                <ClipboardDocumentListIcon class="w-4 h-4"></ClipboardDocumentListIcon>
                <span class="sr-only">Paste</span>
            </TinyButton>
        </div>

        <textarea ref="payloadArea" :value="modelValue" :id="eluid" class="border border-gray-300 p-1 rounded h-96"
            @input="emitUpdate($event.target.value)" @paste="handlePasta">
        </textarea>
    </div>
</template>
<script>
import TinyButton from "../TinyButton.vue"
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import Turndown from "turndown"

export default {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    data() {
        return {
            eluid: Math.random().toString(36).substring(2),
            canPaste: true
        }
    },
    components: {
        TinyButton, ClipboardDocumentListIcon
    },
    methods: {
        emitUpdate(value) {
            this.$emit('update:modelValue', value)
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
                        const markdown = turndownService.turndown(await blob.text())

                        // Replace or insert at current selection
                        let textarea = this.$refs.payloadArea;
                        if (textarea.selectionStart || textarea.selectionStart == '0') {
                            var startPos = textarea.selectionStart;
                            var endPos = textarea.selectionEnd;
                            textarea.value = textarea.value.substring(0, startPos)
                                + markdown
                                + textarea.value.substring(endPos, textarea.value.length);
                        } else {
                            textarea.value += markdown;
                        }

                        this.emitUpdate(textarea.value)
                        break;
                    }

                }
            } catch (error) {

            }

        }
    }
}
</script>