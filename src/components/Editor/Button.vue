<template>
    <button
        class="rounded-sm p-2 flex flex-row gap-2 items-center justify-center font-semibold disabled:opacity-30 aria-pressed:outline-2 aria-pressed:outline-solid outline-yellow-600"
        :class="{
            'bg-blue-800 enabled:hover:bg-blue-700 text-white': primary,
            'bg-blue-100 enabled:hover:bg-blue-300 text-blue-800': !primary,
            'shadow-inner aria-pressed:bg-blue-600': primary && toggled,
            'shadow-inner aria-pressed:bg-slate-600': !primary && toggled
        }" :aria-pressed="toggled">

        <slot></slot>


    </button>
</template>
<script>
export default {
    props: ['primary', 'toggled']
}
</script>