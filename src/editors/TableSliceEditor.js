import { h } from 'vue'

import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import NumberInput from "../components/Editor/Inputs/NumberInput.vue"
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            md.shouldBreakNewLines(false);
            md.shouldRenderInline(true);
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.renderAsVnode("en"),
                props.slice.renderAsVnode("fr"),
            ])
        }




        return () => {


            let rows = [];
            Object.entries(props.slice.variables).forEach((entry) => {
                const [key, variable] = entry;

                let columns = [];
                let headerCol = h('th', { class: "px-1 py-2 border-slate-300 border bg-slate-200" }, [
                    h(BilingualInput, {
                        modelValue: variable.label,
                        'onUpdate:modelValue': (value) => {
                            variable.label = value;
                            emit('update:modelValue', props.slice.variables)
                        }
                    }),
                ]);

                headerCol.props['width'] = `${100 / (props.slice.bodyRowsCount + 1)}%`;
                columns.push(headerCol);
                props.slice.content.forEach(content => {

                    let cellContent;

                    if (variable.type === 'markdown') {
                        cellContent = h(BilingualInput, {
                            modelValue: content[key],
                            'onUpdate:modelValue': (value) => {
                                content[key] = value;
                                emit('update:modelValue', props.slice.content)
                            }
                        });
                    } else {
                        cellContent = h(NumberInput, {
                            modelValue: content[key],
                            'onUpdate:modelValue': (value) => {
                                content[key] = value;
                                emit('update:modelValue', props.slice.content)
                            }
                        });
                    }

                    columns.push(h('td', { width: `${100 / (props.slice.bodyRowsCount + 1)}%`, class: "px-1 py-2 border-slate-300 border bg-slate-100" }, [cellContent]));
                })

                rows.push(columns);
            });



            return h('table', {
                class: `table table-fixed border-collapse border border-slate-300 dark:border-slate-700 w-full text-xs`
            }, rows.map(row => {
                return h('tr', { class: '' }, row)
            })
            )


        }



    }
}
