import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import Details from '../components/Details'
import SingleInput from "../components/Editor/Inputs/SingleInput.vue"

import { IMAGE_RESOLUTIONS, IMAGE_FORMATS, IMAGE_DENSITIES } from '../models/contents/ImageSlice'

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            md.shouldBreakNewLines(false);
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.renderAsVnode("en"),
                props.slice.renderAsVnode("fr"),
            ])
        }

        return () => h('div', { class: 'flex flex-col gap-4' }, [

            h(BilingualInput, {
                label: strings[document.documentElement.lang].image_slice_source_label,
                class: "w-full",
                modelValue: props.slice.content,
                'onUpdate:modelValue': (value) => {
                    props.slice.content = value;
                }
            }),

            h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('figure', { class: "shadow flex justify-center items-center" }, [
                    props.slice.content.en ? h('img', { src: props.slice.content.en, class: 'max-h-64' }) : h('span', '❌'),
                ]),
                h('figure', { class: "shadow flex justify-center items-center" }, [
                    props.slice.content.fr ? h('img', { src: props.slice.content.fr, class: 'max-h-64' }) : h('span', '❌'),
                ]),
            ]),

            h('hr'),

            h(Details, { label: strings[document.documentElement.lang].image_slice_thumbnails_details_label }, {
                default: () => h('div', { class: "grid grid-cols-2 gap-2 text-sm" }, [
                    ...['en', 'fr'].map(lg => {
                        return h('fieldset', { class: 'flex flex-col gap-2' }, [
                            ...Object.keys(IMAGE_RESOLUTIONS).map((rs) => IMAGE_DENSITIES.map(ds => {

                                return IMAGE_FORMATS.map(ft => {
                                    const keyForThumbnail = `${rs}_${ds}_${ft}`
                                    return h(SingleInput, {
                                        modelValue: props.slice.thumbnails[lg]?.[keyForThumbnail],
                                        label: `${lg} : ${keyForThumbnail}`,
                                        'onUpdate:modelValue': (value) => {
                                            if (!props.slice.thumbnails[lg]) {
                                                props.slice.thumbnails[lg] = {}
                                            }
                                            props.slice.thumbnails[lg][keyForThumbnail] = value
                                        }
                                    })
                                })
                            })),
                        ])

                    }),


                ]),
            })

        ]);

    }
}
