<template>
    <div class="font-semibold text-sm flex flex-row justify-between items-center -m-2 p-2">
        <div class="flex flex-row items-center gap-2 min-w-0">
            <div>
                <LanguageIcon class="size-4" v-if="variable.type === 'markdown'" />
                <HashtagIcon class="size-4" v-if="variable.type === 'number'" />
                <MinusIcon class="size-4" v-if="variable.type === 'separator'" />
            </div>
            <div class="overflow-hidden" :title="variable.key"><span class="overflow-hidden font-mono">{{ variable.key
                    }}</span></div>
        </div>
        <div class="flex flex-row gap-2 items-center">
            <StarIcon class="size-4" v-if="variable.emphasize" />
            <KeyIcon class="size-4 text-yellow-600 drop-shadow" v-if="variable.is_descriptive" />
        </div>
    </div>
</template>
<script setup>
const props = defineProps(['variable'])
import { HashtagIcon, KeyIcon, LanguageIcon, StarIcon, MinusIcon } from "@heroicons/vue/16/solid"

</script>