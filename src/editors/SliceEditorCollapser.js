import { h } from 'vue'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
export default {
    props: ['slice'],
    render() {
        return h('button', {
            class: 'mt-1 uppercase border border-blue-100 text-blue-800 hover:bg-blue-100 font-semibold text-lg px-1 py-2 2xl:p-2 rounded-lg flex flex-row items-center gap-.5 2xl:gap-1 2xl:mt-0',
            onClick: () => this.slice.state.collapsed = !this.slice.state.collapsed
        }, [
            h('div', { class: 'hidden 2xl:block w-4 text-blue-500' }, this.slice.type.substring(0, 1)),
            this.slice.state.collapsed ? h(ChevronRightIcon, { class: 'w-4 h-4 text-center' }) : h(ChevronDownIcon, { class: 'w-4 h-4' })
        ])
    }
}