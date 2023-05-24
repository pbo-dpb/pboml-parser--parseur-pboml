import { h } from 'vue'
import TinyButton from "../../components/Editor/TinyButton.vue"
import { ViewfinderCircleIcon } from '@heroicons/vue/24/solid';
import editorStrings from '../../editor-strings';

export default {
    props: {
        svg: {
            type: String
        }
    },
    render() {

        return h('div', {}, [
            h(TinyButton, {
                onClick: (e) => {
                    const regex = /\#F{3,6}/gi;
                    const subst = `rgba(255,255,255,0)`;
                    const result = this.svg.replaceAll(regex, subst);
                    this.$emit('done', result)
                },
            }, () => [
                h(ViewfinderCircleIcon, { class: 'w-4 h-4' }),
                editorStrings[document.documentElement.lang].svg_white_remover_tool
            ]),


            h('div', { innerHTML: this.svg, class: 'hidden w-full dark:invert flex flex-col items-center', ref: 'renderer', hidden: true })

        ]);
    }
}