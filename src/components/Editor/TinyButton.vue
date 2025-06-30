<template>
    <button
        class="rounded-sm text-xs  w-fit p-1 flex flex-row gap-1 items-center place-content-center aria-pressed:outline-2 aria-pressed:outline-solid outline-yellow-600 disabled:filter disabled:grayscale disabled:opacity-80"
        :class="{
            'bg-red-100 enabled:hover:bg-red-300 text-red-800': danger,
            'bg-blue-100 enabled:hover:bg-blue-300 text-blue-800 ': !danger,
        }">
        <slot></slot>
    </button>
</template>
<script>
export default {
    props: ['danger'],
}
</script>