<template>
    <button class="rounded  text-white p-2 flex flex-row gap-1 items-center justify-center font-semibold" :class="{
        'bg-blue-800 hover:bg-blue-700': primary,
        'bg-gray-800 hover:bg-gray-700': !primary,
        'shadow-inner bg-blue-600': primary && toggled,
        'shadow-inner bg-gray-600': !primary && toggled
    }">

        <slot></slot>


    </button>
</template>
<script>
export default {
    props: ['primary', 'toggled']
}
</script>