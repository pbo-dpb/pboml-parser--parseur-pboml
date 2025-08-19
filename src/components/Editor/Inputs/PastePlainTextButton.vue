<template>
    <TinyButton :title="pastePlainTextLabel" tabindex="-1" class="bg-slate-100 text-slate-800" @click="handleClick">
        <TextCursorInput  class="w-4 h-4"></TextCursorInput>
        <span class="sr-only">{{ pastePlainTextLabel }}</span>
    </TinyButton>
</template>
<script setup>
import TinyButton from '../TinyButton.vue';
import { TextCursorInput } from 'lucide-vue-next';
import { ref } from 'vue';
import editorStrings from '../../../editor-strings';
const emit = defineEmits(['pasted']);
const pastePlainTextLabel = ref(editorStrings[document.documentElement.lang].paste_plain_text)


const handleClick = async () => {
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
                    if (item.types.includes('text/plain')) {
                        const blob = await item.getType("text/plain");
                        const plainText = await blob.text();
                        emit("pasted", plainText)
                        break;
                    }
                }
            } catch (error) {

            }

        }

</script>