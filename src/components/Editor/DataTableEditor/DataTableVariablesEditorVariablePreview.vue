<template>
    <div
        class="-m-2 flex flex-row items-center justify-between p-2 text-sm font-semibold">
        <div class="flex min-w-0 flex-row items-center gap-2">
            <div>
                <LanguageIcon
                    class="size-4"
                    v-if="variable.type === 'markdown'" />
                <HashtagIcon
                    class="size-4"
                    v-if="variable.type === 'number'" />
                <MinusIcon
                    class="size-4"
                    v-if="variable.type === 'separator'" />
            </div>
            <div
                v-if="groupAbbrev"
                class="w-8 rounded-sm bg-slate-100 text-center text-xs">
                {{ groupAbbrev }}
            </div>
            <div
                class="overflow-hidden"
                :title="variable.key">
                <span class="overflow-hidden font-mono">{{
                    variable.key
                }}</span>
            </div>
        </div>
        <div class="flex flex-row items-center gap-2">
            <StarIcon
                class="size-4"
                v-if="variable.emphasize" />
            <KeyIcon
                class="size-4 text-yellow-600 drop-shadow-sm"
                v-if="variable.is_descriptive" />
        </div>
    </div>
</template>
<script setup>
    import { computed } from "vue";
    import {
        HashtagIcon,
        KeyIcon,
        LanguageIcon,
        StarIcon,
        MinusIcon,
    } from "@heroicons/vue/16/solid";

    const props = defineProps(["variable"]);

    const language = document.documentElement.lang;

    const groupAbbrev = computed(() => {
        if (!props.variable.group?.[language]) return null;

        let abbrev;
        let splitGroup = props.variable.group[language].split(" ");
        if (splitGroup.length > 1) {
            abbrev = splitGroup
                .slice(0, 3)
                .map((word) => word.replace(/[^a-zA-Z0-9]/g, "-")?.[0])
                .filter((x) => x)
                .join("");
        } else {
            abbrev = splitGroup[0].slice(0, 3);
        }

        return `${abbrev}`.toUpperCase();
    });
</script>
