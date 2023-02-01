<template>
    <button
        class="rounded  text-white p-2 flex flex-row gap-1 items-center justify-center font-semibold disabled:opacity-30"
        :class="{
            'bg-blue-800 enabled:hover:bg-blue-700': primary,
            'bg-slate-800 enabled:hover:bg-slate-700': !primary,
            'shadow-inner bg-blue-600': primary && toggled,
            'shadow-inner bg-slate-600': !primary && toggled
        }">

        <slot></slot>


    </button>
</template>
<script>
export default {
    props: ['primary', 'toggled']
}
</script>