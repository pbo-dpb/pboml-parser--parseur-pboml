<template>
    <div class="flex flex-col gap-2">
        <label :for="eluid" class="font-medium">

            .docx ({{ language }})

        </label>
        <input type="file" :id="eluid" @change="handleFileInputChange" accept=".docx" ref="inputField"
            class="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded" />

    </div>
</template>
<script setup>
import * as mammoth from 'mammoth/mammoth.browser';


import { ref } from 'vue';
import HtmlMarkdownConverter from '../../../../HtmlMarkdownConverter';

const inputField = ref(null);

const eluid = ref(Math.random().toString(36).substring(2));
const props = defineProps({
    language: String
});

const emit = defineEmits(['pick'])
const readDocxFile = async (file) => {

    const arrayBuffer = await file.arrayBuffer();

    const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

    let cleanedHtml = "" + html;

    const highlightsRegex = /<h1>\s*<a\s+id="[^"]+"><\/a>\s*(Faits saillants|Highlights)\s*<\/h1>/i;
    if (highlightsRegex.test(html)) {
        // This is a regular report. Only keep whatever comes after the first H1 that isn't the highlights H1.
        cleanedHtml = cleanedHtml.replace(/.*?(?=<h1>\s*<a\s+id="[^"]+"><\/a>\s*(Faits saillants|Highlights)\s*<\/h1>)/i, "");
        cleanedHtml = cleanedHtml.replace(highlightsRegex, "");
        const firstHeadingIndex = cleanedHtml.indexOf("<h1>");
        cleanedHtml = firstHeadingIndex !== -1 ? cleanedHtml.substring(firstHeadingIndex) : cleanedHtml
    }

    const markdown = (new HtmlMarkdownConverter).convert(cleanedHtml);

    emit('pick', { markdown, language: props.language });

    inputField.value.value = null;
}

const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readDocxFile(file);
}

</script>