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
                    this.$refs.renderer.removeAttribute('hidden');
                    setTimeout(() => {
                        const bbox = this.$refs.renderer.querySelector('svg').getBBox();
                        console.log(bbox);
                        this.$refs.renderer.querySelector('svg').setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

                        setTimeout(() => {
                            this.$refs.renderer.setAttribute('hidden', true);
                            this.$emit('fit', this.$refs.renderer.querySelector('svg').outerHTML)
                        }, 200);
                    }, 200);

                },
            }, () => [
                h(ViewfinderCircleIcon, { class: 'w-4 h-4' }),
                editorStrings[document.documentElement.lang].svg_fit_tool
            ]),


            h('div', { innerHTML: this.svg, class: 'w-full dark:invert flex flex-col items-center', ref: 'renderer', hidden: true })

        ]);
    }
}