import { h } from 'vue'
import strings from "../editor-strings"
import Details from '../components/Details'
import SvgFitter from "./SvgSliceTools/SvgFitter"
import SvgWhiteRemover from "./SvgSliceTools/SvgWhiteRemover"
import { ExclamationCircleIcon } from '@heroicons/vue/24/solid'
import SvgSanitizer from './SvgSliceTools/SvgSanitizer'

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
                this.slice.content[language] ? h('div', { class: 'p-4', style: "background-color: rgba(249,250,251,0.1);background-image: repeating-linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%, #f1f5f9), repeating-linear-gradient(45deg, #f1f5f9 25%, rgba(249,250,251,0.1) 25%, rgba(249,250,251,0.1) 75%, #f1f5f9 75%, #f1f5f9);background-position: 0 0, 15px 15px;background-size: 30px 30px;" }, [
                    this.slice.renderReadonlyVnode(language),
                ]) : h(ExclamationCircleIcon, { class: 'w-8 h-8 text-yellow-500' }),

                this.slice.content[language] ? h(Details, { label: strings[document.documentElement.lang].svg_slice_show_more_options_button_label }, {
                    default: () => h('div', { class: 'w-full flex flex-wrap gap-2' }, [
                        h(SvgFitter, {
                            svg: this.slice.content[language], 'onFit': (thenew) => {
                                this.slice.content[language] = thenew;
                            }
                        }),
                        h(SvgWhiteRemover, {
                            svg: this.slice.content[language], 'onDone': (thenew) => {
                                this.slice.content[language] = thenew;
                            }
                        }),
                        h(SvgSanitizer, {
                            svg: this.slice.content[language], 'onSanitize': (thenew) => {
                                this.slice.content[language] = thenew;
                            }
                        }),
                    ])
                }) : null,
                h(Details, {
                    label: strings[document.documentElement.lang].svg_slice_show_source_button_label
                }, {
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
