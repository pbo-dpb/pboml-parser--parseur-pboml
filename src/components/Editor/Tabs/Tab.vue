<template>
    <button
        class="font-semibold border-b-4 tracking-tighter px-2 flex flex-row gap-2 items-center select-none items-center"
        :class="{
            'text-xl': size === 'lg',
            'text-lg': size === 'md',
            'text-base': size === 'sm',
            'border-purple-800  text-purple-800 cursor-default': selected,
            'border-gray-100 hover:border-blue-800 text-gray-600 hover:text-blue-800': !selected
        }" role="tab" :aria-selected="selected" :aria-controls="controls" :id="`tab-${controls}`"
        :tabindex="selected ? 0 : -1">
        <slot></slot>
    </button>
</template>
<script>
export default {
    props: {
        "selected": Boolean,
        "controls": String,
        'size': {
            type: String,
            default: "lg"
        }
    }
}
</script>