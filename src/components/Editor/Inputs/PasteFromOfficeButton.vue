<template>
    <TinyButton :title="pasteFromOffice" tabindex="-1">
        <ClipboardDocumentListIcon class="w-4 h-4"></ClipboardDocumentListIcon>
        <span class="sr-only">{{ pasteFromOffice }}</span>
    </TinyButton>
</template>
<script setup>
import TinyButton from '../TinyButton.vue';
import { ClipboardDocumentListIcon } from '@heroicons/vue/16/solid';
import { ref } from 'vue';
import editorStrings from '../../../editor-strings';
const pasteFromOffice = ref(editorStrings[document.documentElement.lang].paste_from_office)


</script>