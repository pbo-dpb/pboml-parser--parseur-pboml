import { h } from 'vue'

import BilingualInput from "../Inputs/BilingualInput.vue"
import NumberInput from "../Inputs/NumberInput.vue"
import strings from "../../../editor-strings"
import TinyButton from "../TinyButton.vue";
import editorStrings from '../../../editor-strings';
import { ArrowRightCircleIcon } from '@heroicons/vue/24/solid';
import DataTableEntry from '../../../models/contents/DataTable/DataTableEntry';

export default {
    props: ['datatable'],
    methods: {
        addValue() {
            this.datatable.content.push(new DataTableEntry())
        }
    },
    render() {

        let strings = editorStrings[document.documentElement.lang];

        let rows = [];
        Object.entries(this.datatable.variables).forEach((entry) => {
            const [key, variable] = entry;

            let columns = [];
            let headerCol = h('th', { class: "px-1 py-2 border-slate-300 border bg-slate-200" }, [
                h(BilingualInput, {
                    modelValue: variable.label,
                    'onUpdate:modelValue': (value) => {
                        variable.label = value;
                        this.$emit('update:modelValue', this.datatable.variables)
                    }
                }),
            ]);

            headerCol.props['width'] = `${100 / (this.datatable.bodyRowsCount + 1)}%`;
            columns.push(headerCol);
            this.datatable.content.forEach(content => {

                let cellContent;

                if (variable.type === 'markdown') {
                    cellContent = h(BilingualInput, {
                        modelValue: content[key],
                        'onUpdate:modelValue': (value) => {
                            content[key] = value;
                            this.$emit('update:modelValue', this.datatable.content)
                        }
                    });
                } else {
                    cellContent = h(NumberInput, {
                        modelValue: content[key],
                        'onUpdate:modelValue': (value) => {
                            content[key] = value;
                            this.$emit('update:modelValue', this.datatable.content)
                        }
                    });
                }

                columns.push(h('td', { width: `${100 / (this.datatable.bodyRowsCount + 1)}%`, class: "px-1 py-2 border-slate-300 border bg-slate-100" }, [cellContent]));
            })

            rows.push(columns);
        });



        return h('div', {
            class: 'flex flex-col gap-2'
        }, [
            h('table', {
                class: `table table-fixed border-collapse border border-slate-300 dark:border-slate-700 w-full text-xs`
            }, rows.map(row => {
                return h('tr', { class: '' }, row)
            })
            ),
            h('div', { class: 'flex flex-row justify-end' }, [
                h(TinyButton, {
                    onClick: () => this.addValue()
                }, [

                    h('span', strings.data_table_content_new),
                    h(ArrowRightCircleIcon, { 'class': 'h-4 w-4' }, () => []),
                ])
            ])
        ])



    }
}
