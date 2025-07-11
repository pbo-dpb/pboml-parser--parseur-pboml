import { h } from 'vue'
import { LockClosedIcon, LockOpenIcon } from '@heroicons/vue/24/solid'
export default {
    props: ['unlockableObject'],
    render() {
        return h('button', {
            class: {
                'mt-1 uppercase font-semibold text-lg px-1 py-2 ': true,
                'text-red-800 hover:bg-red-100  hover:bg-red-100 bg-red-50': this.unlockableObject.state._unlocked,
                'text-green-800 hover:bg-green-100  hover:bg-green-100 bg-green-50': !this.unlockableObject.state._unlocked,
            },
            onClick: () => this.unlockableObject.state._unlocked = !this.unlockableObject.state._unlocked
        }, [
            this.unlockableObject.state._unlocked ? h(LockOpenIcon, { class: 'w-4 h-4' }) : h(LockClosedIcon, { class: 'w-4 h-4 text-center' })
        ])
    }
}