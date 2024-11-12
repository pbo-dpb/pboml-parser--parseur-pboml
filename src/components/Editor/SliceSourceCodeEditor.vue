<template>
    <div class="flex flex-col gap-4">
        <textarea v-model="code" class="font-mono h-96 p-2 border border-gray-300 rounded " :class="{
            'border-red-500 outline-red-500': hasError
        }" :invalid="hasError"></textarea>

        <div class="flex flex-row items-start gap-4">

            <Button @click="applyCode" class="w-fit" :disabled="hasError">{{ strings.apply }}</Button>

            <div v-if="hasError" class="font-mono bg-red-50 p-4 w-full">
                <pre class="text-red-900">{{ hasError.message }}</pre>
            </div>

            <ul v-if="hasWarning" class="bg-yellow-50 p-4 w-full text-yellow-700 list-inside list-disc">
                <li v-for="warning in hasWarning">{{ warning }}</li>
            </ul>

        </div>

    </div>
</template>
<script setup>

import { onMounted, ref, computed } from 'vue'
import Slice from '../../models/contents/Slice';
import yaml from 'js-yaml'
import editorStrings from '../../editor-strings';
import Button from './Button.vue'

const props = defineProps({
    slice: {
        type: Slice,
        required: true
    }
})
const emit = defineEmits(['update'])
const code = ref('')
const strings = ref(editorStrings[document.documentElement.lang])

onMounted(() => {

    code.value = yaml.dump(props.slice.toArray());

})

const applyCode = () => {

    const rawObject = yaml.load(code.value);

    Object.assign(props.slice, rawObject);

    emit('update', props.slice);

}

const hasError = computed(() => {
    try {
        yaml.load(code.value)
        return false
    } catch (e) {
        return e
    }
})

const hasWarning = computed(() => {
    if (hasError.value) {
        return false
    }
    const newObject = yaml.load(code.value);

    if (!newObject) {
        return false;
    }

    let warnings = [];
    if (!newObject.type || (newObject.type !== props.slice.type)) {
        warnings.push(strings.value.slice_source_code_warning_type_mismatch)
    }

    return warnings.length > 0 ? warnings : false
})


</script>