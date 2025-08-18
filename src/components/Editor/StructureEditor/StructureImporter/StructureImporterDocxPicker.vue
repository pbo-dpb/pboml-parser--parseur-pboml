<template>
    <div class="flex flex-col gap-2">
        <label :for="eluid" class="font-medium">

            {{ language }}

        </label>
        <input type="file" :id="eluid" @change="handleFileInputChange" accept=".docx" ref="inputField"
            class="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded" />

    </div>
</template>
<script setup>
import mammoth from 'mammoth';


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

    const markdown = (new HtmlMarkdownConverter).convert(html);

    emit('pick', { markdown, language: props.language });

    inputField.value.value = null;
}

const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readDocxFile(file);
}

</script>