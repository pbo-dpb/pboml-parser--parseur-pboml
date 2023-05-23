import { h } from 'vue'
import TinyButton from "../components/Editor/TinyButton.vue"
import { ViewfinderCircleIcon } from '@heroicons/vue/24/solid';

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
                    this.$refs.renderer.classList.remove('hidden');
                    setTimeout(() => {
                        const bbox = this.$refs.renderer.querySelector('svg').getBBox();
                        this.$refs.renderer.querySelector('svg').setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

                        setTimeout(() => {
                            this.$refs.renderer.classList.add('hidden');
                            this.$emit('fit', this.$refs.renderer.querySelector('svg').outerHTML)
                        }, "200");
                    }, "200");

                },
            }, () => [
                h(ViewfinderCircleIcon, { class: 'w-4 h-4' }),
                'Fit'
            ]),


            h('div', { innerHTML: this.svg, class: 'hidden w-full dark:invert flex flex-col items-center', ref: 'renderer', hidden: true })

        ]);
    }
}