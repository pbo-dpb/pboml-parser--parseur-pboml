import { h } from 'vue'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
export default {
    props: ['slice'],
    render() {
        return h('button', {
            class: 'mt-1 uppercase text-blue-800 hover:bg-blue-100 font-semibold text-lg px-1 py-2 bg-blue-50',
            onClick: () => this.slice.state.collapsed = !this.slice.state.collapsed
        }, [
            this.slice.state.collapsed ? h(ChevronRightIcon, { class: 'w-4 h-4 text-center' }) : h(ChevronDownIcon, { class: 'w-4 h-4' })
        ])
    }
}