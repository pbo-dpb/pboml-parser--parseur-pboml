import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import Details from '../components/Details'
import SingleInput from "../components/Editor/Inputs/SingleInput.vue"
import TinyButton from "../components/Editor/TinyButton.vue"
import { ClipboardDocumentIcon } from '@heroicons/vue/24/solid'

import yaml from 'js-yaml'

import ImageSlice, { IMAGE_RESOLUTIONS, IMAGE_FORMATS, IMAGE_DENSITIES } from '../models/contents/ImageSlice'

export default {
    props: ['slice'],
    setup(props, { emit, expose }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            md.shouldBreakNewLines(false);
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.renderAsVnode("en"),
                props.slice.renderAsVnode("fr"),
            ])
        }

        const pasteFromClipboard = async () => {

            try {
                let raw;
                if (navigator.clipboard) {
                    raw = await navigator.clipboard.readText();
                } else {
                    raw = window.prompt("📋");
                }

                let newSliceObject = yaml.load(raw);
                let newImageSlice = new ImageSlice(newSliceObject);

                // Merge slices without overriding already set properties.
                ['en', 'fr'].forEach(language => {
                    if (!props.slice.content[language]) props.slice.content[language] = newImageSlice.content[language]



                    Object.keys(IMAGE_RESOLUTIONS).map((rs) => IMAGE_DENSITIES.map(ds =>
                        IMAGE_FORMATS.map(ft => {
                            const keyForThumbnail = `${rs}_${ds}_${ft}`
                            if (!props.slice.thumbnails[language]?.[keyForThumbnail] && newImageSlice.thumbnails[language]?.[keyForThumbnail]) {
                                if (!props.slice.thumbnails[language]) {
                                    props.slice.thumbnails[language] = {}
                                }
                                props.slice.thumbnails[language][keyForThumbnail] = newImageSlice.thumbnails[language][keyForThumbnail];
                            }
                        })
                    ))
                })
            } catch (error) {
                window.alert("⚠️ Invalid YAML.")
            }

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
            h(TinyButton, {
                onClick: (e) => {
                    pasteFromClipboard();
                },
            }, () => [
                h(ClipboardDocumentIcon, { 'class': 'h-4 w-4' }, () => []),
                h('span', strings[document.documentElement.lang].image_slice_fill_from_clipboard)
            ]),
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
