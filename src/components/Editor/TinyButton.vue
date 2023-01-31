<template>
    <button class="rounded  text-sm  w-fit p-1" :class="{
        'bg-red-100 hover:bg-red-300 text-red-800': danger,
        'bg-blue-100 hover:bg-blue-300 text-blue-800': !danger,
    }">

        <slot></slot>


    </button>
</template>
<script>
export default {
    props: ['danger']
}
</script>