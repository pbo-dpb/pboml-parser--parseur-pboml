import { h } from 'vue'
import strings from "../editor-strings"
import Details from '../components/Details'

export default {
    props: ['slice'],

    data() {
        return {
            shouldShowSource: false,
        }
    },

    methods: {
        setupFormForLanguage(language) {
            return h('div', { class: 'flex flex-col gap-4' }, [
                h('div', { class: 'text-lg font-semibold' }, language),
                h('label', { class: 'w-full flex flex-col gap-1' }, [
                    h('span', { class: 'font-semibold' }, '.svg'),
                    h('input', {
                        type: 'file',
                        //class: 'border border-gray-300 rounded p-1 font-mono h-32 leading-tight',
                        'onChange': (e) => {
                            const filename = e.target.files[0];
                            if (!filename) return;

                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const rawFileContent = event.target.result;
                                let updatedObject = {
                                    ...this.slice.content
                                }
                                updatedObject[language] = rawFileContent
                                this.$emit('update:modelValue', updatedObject)
                            };

                            reader.readAsText(filename);
                        }
                    }),
                ]),
                this.slice.renderReadonlyVnode(language),
                h(Details, { label: strings[document.documentElement.lang].svg_slice_show_source_button_label }, {
                    default: () => h('label', { class: 'w-full flex flex-col gap-1' }, [
                        h('span', { class: 'font-semibold' }, 'Source'),
                        h('textarea', {
                            value: this.slice.content[language],
                            class: 'border border-gray-300 rounded p-1 font-mono h-32 leading-tight',
                            'onChange': (e) => {

                                let updatedObject = {
                                    ...this.slice.content
                                }
                                updatedObject[language] = e.target.value
                                this.$emit('update:modelValue', updatedObject)
                            }
                        })])
                })

            ])
        }
    },
    render() {


        return h('div', { class: 'grid grid-cols-2 gap-4' }, [
            this.setupFormForLanguage('en'),
            this.setupFormForLanguage('fr')
        ]);

    },

}
