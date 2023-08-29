import { h } from 'vue'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/solid'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'

export default {
    props: ["canMoveUp", "canMoveDown"],
    emits: ['move'],

    render() {

        return h('div', { 'class': 'flex flex-row gap-1 items-center' }, [

            h(TinyButton, {
                'aria-label': strings[document.documentElement.lang].move_down_button_label,
                disabled: !this.canMoveDown,
                onClick: (e) => {
                    this.$emit("move", 'down', e)
                },
            }, () => [
                h(ArrowDownIcon, { 'class': 'h-4 w-4' }, () => []),
            ]),

            h(TinyButton, {
                'aria-label': strings[document.documentElement.lang].move_up_button_label,
                disabled: !this.canMoveUp,
                onClick: (e) => {
                    this.$emit("move", 'up', e)
                },
            }, () => [
                h(ArrowUpIcon, { 'class': 'h-4 w-4' }, () => []),
            ])

        ])


    }

}