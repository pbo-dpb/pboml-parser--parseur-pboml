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
                    let result = this.svg;
                    result = result.replaceAll("&nbsp;", '');
                    this.$emit('sanitize', result)
                },
            }, () => [
                h(ViewfinderCircleIcon, { class: 'w-4 h-4' }),
                editorStrings[document.documentElement.lang].svg_sanitizer_tool
            ]),


            h('div', { innerHTML: this.svg, class: 'hidden w-full dark:invert flex flex-col items-center', ref: 'renderer', hidden: true })

        ]);
    }
}