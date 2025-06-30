import { h } from 'vue'

export default {
    props: ['label'],
    render() {

        return h("details", {
            'class': 'print:hidden flex flex-col gap-2'
        },

            [
                h('summary', { class: 'pt-1 cursor-pointer text-blue-900 hover:text-blue-800 dark:text-blue-100 dark:hover:text-blue-200 text-sm font-semibold  select-none', innerHTML: this.label }),
                h('div', this.$slots.default())
            ]);
    }
}