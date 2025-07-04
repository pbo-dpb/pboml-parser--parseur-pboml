import { h } from 'vue'

import BilingualInput from "../Inputs/BilingualInput.vue"
import NumberInput from "../Inputs/NumberInput.vue"
import strings from "../../../editor-strings"
import TinyButton from "../TinyButton.vue";
import editorStrings from '../../../editor-strings';
import { ArrowRightCircleIcon, ChartBarIcon, StarIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid';
import DataTableEntry from '../../../models/contents/DataTable/DataTableEntry';

export default {
    props: ['datatable', 'showChartProperties'],
    methods: {
        addValue() {
            this.datatable.content.push(new DataTableEntry())
        }
    },
    render() {
        const language = document.documentElement.lang;
        let strings = editorStrings[language];

        // Actions thead cells
        let valueActionCells = [
            h('th', {}, ''),
            ...this.datatable.content.map((ct, index) => {
                return h('td', { class: 'border border-slate-300 bg-slate-50 px-1 py-2 ' }, [
                    h('div', { class: 'flex flex-row justify-end gap-2' }, [



                        h(TinyButton, {
                            danger: true,
                            'aria-label': strings.data_table_editor_delete,
                            title: strings.data_table_editor_delete,
                            onClick: () => this.datatable.content.splice(index, 1)
                        }, () => [
                            h(TrashIcon, { class: 'h-4 w-4' })
                        ]),

                        this.showChartProperties ? h(TinyButton, {
                            'aria-pressed': !ct.skip_chart,
                            'aria-label': strings.data_table_entry_editor_var_skip_chart,
                            'title': strings.data_table_entry_editor_var_skip_chart,
                            onClick: () => this.datatable.content[index].skip_chart = !ct.skip_chart
                        }, () => [
                            h(ChartBarIcon, { class: 'h-4 w-4' })
                        ]) : null,

                        h(TinyButton, {
                            'aria-pressed': ct.emphasize,
                            'aria-label': strings.data_table_editor_emphasize,
                            'title': strings.data_table_editor_emphasize,
                            onClick: () => this.datatable.content[index].emphasize = !ct.emphasize
                        }, () => [
                            h(StarIcon, { class: 'h-4 w-4' })
                        ])
                    ])
                ])
            })
        ];


        // tbody
        let rows = [];
        Object.entries(this.datatable.variables).forEach((entry) => {
            const [key, variable] = entry;

            let columns = [];
            let headerCol = variable.getTableHeaderVnode('row', language, true, true)

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
                } else if (variable.type === 'number') {
                    cellContent = h(NumberInput, {
                        modelValue: content[key],
                        'onUpdate:modelValue': (value) => {
                            content[key] = value;
                            this.$emit('update:modelValue', this.datatable.content)
                        }
                    });
                }

                let cellClasses = ['px-1', 'py-2', 'border-slate-300', 'border'];
                if (variable.emphasize && variable.is_descriptive) cellClasses.push('bg-yellow-200')
                else if (content.emphasize && variable.is_descriptive) cellClasses.push('bg-yellow-200')
                else if (content.emphasize && variable.emphasize) cellClasses.push('bg-yellow-200')
                else if (content.emphasize) cellClasses.push('bg-yellow-100')
                else if (variable.emphasize) cellClasses.push('bg-yellow-100')
                else if (variable.is_descriptive) cellClasses.push('bg-slate-200')
                else cellClasses.push('bg-slate-100')

                columns.push(h('td', { width: `${100 / (this.datatable.bodyRowsCount + 1)}%`, class: cellClasses.join(' ') }, [cellContent]));
            })

            rows.push(columns);
        });



        return h('div', {
            class: 'flex flex-col gap-2'
        }, [

            (!this.datatable.getAllUnitsUsedInTableForLanguage(language).length) ?
                h('span', { 'class': 'rounded-sm p-1 bg-orange-700 text-white text-xs flex flex-row gap-1 w-fit' }, [
                    h(ExclamationTriangleIcon, { 'class': 'h-4 w-4' }, () => []),
                    strings.data_table_has_no_units
                ]) : null,

            h('table', {
                class: `table table-fixed border-collapse border border-slate-300 dark:border-slate-700 w-full text-xs`
            }, [
                h('thead', {}, [h('tr', {}, valueActionCells)]),
                h('tbody', {}, rows.map(row => {
                    return h('tr', { class: '' }, row)
                }))
            ]
            ),
            h('div', { class: 'flex flex-row justify-end' }, [
                h(TinyButton, {
                    onClick: () => this.addValue()
                }, () => [

                    h('span', strings.data_table_content_new),
                    h(ArrowRightCircleIcon, { 'class': 'h-4 w-4' }, () => []),
                ])
            ])
        ])



    }
}
