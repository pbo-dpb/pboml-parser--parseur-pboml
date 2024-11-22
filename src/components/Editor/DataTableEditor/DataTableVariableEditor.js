import { h } from 'vue'
import DataTableVariable from "../../../models/contents/DataTable/DataTableVariable"
import BilingualInput from '../../Editor/Inputs/BilingualInput.vue'
import editorStrings from '../../../editor-strings'
import { ChartBarIcon, StarIcon, TrashIcon, KeyIcon } from '@heroicons/vue/24/solid'
import SelectInput from "../Inputs/SelectInput.vue"
import TinyButton from "../TinyButton.vue";
import SingleInput from "../Inputs/SingleInput.vue"
import RadioInput from '../Inputs/RadioInput.vue'
import { HashtagIcon, LanguageIcon, MinusIcon } from '@heroicons/vue/16/solid'


export default {
    props: {
        variable: {
            type: DataTableVariable,
            required: true
        },
        variableKey: {
            type: String,
            required: true
        },
        showChartProperties: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showAdvanced: false,
        }
    },
    render() {
        const language = document.documentElement.lang;
        const strings = editorStrings[language];

        let typesInputChoices = {
            'markdown': { label: strings.data_table_variables_editor_var_type_markdown, icon: LanguageIcon },
            'number': { label: strings.data_table_variables_editor_var_type_number, icon: HashtagIcon },
            'separator': { label: strings.data_table_variables_editor_var_type_separator, icon: MinusIcon },
        }

        let chartVariableTypeChoices = {
            'Bar': 'bar',
            'Line': 'line',
            'Scatter': 'scatter'
        }

        let presentationStyleChoices = {
            'inherit': strings.data_table_variables_presentation_type_inherit,
            'accounting': strings.data_table_variables_presentation_type_accounting,
            'prose': strings.data_table_variables_presentation_type_prose,
        }

        return h('div', { class: `flex flex-col gap-4 ` }, [
            h('div', { class: 'flex flex-row justify-between' }, [
                h('span', { class: `font-semibold text-gray-800 font-mono text-lg` }, this.variableKey),
                h('div', { class: 'flex flex-row gap-2' }, [

                    h(TinyButton, {
                        danger: true,
                        'aria-label': strings.data_table_editor_delete,
                        onClick: () => {
                            this.$emit('delete', this.variableKey)
                        }
                    }, () => [
                        h(TrashIcon, { class: 'h-4 w-4' })
                    ]),

                    this.variable.is_descriptive ? null : h(TinyButton, {
                        'aria-label': strings.data_table_variables_editor_var_skip_chart,
                        'aria-pressed': !this.variable.skip_chart,
                        onClick: () => {
                            this.variable.skip_chart = !this.variable.skip_chart
                            this.$emit('update:modelValue', this.variable)
                        }
                    }, () => [
                        h(ChartBarIcon, { class: 'h-4 w-4' })
                    ]),


                    h(TinyButton, {
                        'aria-pressed': this.variable.emphasize,
                        'aria-label': strings.data_table_editor_emphasize,
                        onClick: () => {
                            this.variable.emphasize = !this.variable.emphasize
                            this.$emit('update:modelValue', this.variable)
                        }
                    }, () => [
                        h(StarIcon, { class: 'h-4 w-4' })
                    ]),

                    h(TinyButton, {
                        'aria-pressed': this.variable.is_descriptive,
                        'aria-label': strings.data_table_variables_editor_var_is_descriptive,
                        onClick: () => {
                            this.variable.is_descriptive = !this.variable.is_descriptive
                            this.$emit('update:modelValue', this.variable)
                        }
                    }, () => [
                        h(KeyIcon, { class: 'h-4 w-4' })
                    ]),


                ])
            ]),

            h(RadioInput, {
                choices: typesInputChoices,
                label: strings.data_table_variables_editor_var_type,
                modelValue: this.variable.type,
                'onUpdate:modelValue': (value) => {
                    this.variable.type = value;
                }
            }),

            h(RadioInput, {
                choices: presentationStyleChoices,
                label: strings.data_table_variables_presentation_type,
                modelValue: this.variable.presentation_style,
                'onUpdate:modelValue': (value) => {
                    this.variable.presentation_style = value;
                }
            }),

            h(BilingualInput, {
                label: strings.data_table_variables_editor_var_label,
                modelValue: this.variable.label,
                'onUpdate:modelValue': (value) => {
                    this.variable.label = value;
                    this.$emit('update:modelValue', this.variable)
                }
            }),



            /**
             * Charting
             */

            ...this.showChartProperties ? [

                this.variable.is_descriptive ? null : h(SelectInput, {
                    choices: chartVariableTypeChoices,
                    label: strings.data_table_variables_editor_var_chart_type,
                    modelValue: this.variable.chart_type,
                    'onUpdate:modelValue': (value) => {
                        this.variable.chart_type = value;
                    }
                }),

            ] : [
                this.variable.is_descriptive ? null : h(SelectInput, {
                    choices: {
                        '0': 0,
                        '↳ 1': 1,
                        '_↳ 2': 2,
                        '__↳ 3': 3,
                    },
                    label: strings.data_table_variable_level,
                    modelValue: this.variable.level,
                    'onUpdate:modelValue': (value) => {
                        this.variable.level = Number.parseInt(value);
                    }
                }),
            ],





            h(BilingualInput, {
                label: strings.data_table_variables_editor_var_group,
                modelValue: this.variable.group,
                'onUpdate:modelValue': (value) => {
                    this.variable.group = value;
                    this.$emit('update:modelValue', this.variable)
                }
            }),
            h(BilingualInput, {
                label: strings.data_table_variables_editor_var_unit,
                modelValue: this.variable.unit,
                'onUpdate:modelValue': (value) => {
                    this.variable.unit = value;
                    this.$emit('update:modelValue', this.variable)
                }
            }),

            this.variable.chart_type === 'line' ? h(SingleInput, {
                label: strings.data_table_variables_editor_var_tension,
                hint: strings.data_table_variables_editor_var_tension_hint,
                modelValue: this.variable.tension,
                'onUpdate:modelValue': (value) => {
                    this.variable.tension = value;
                    this.$emit('update:modelValue', this.variable)
                }
            }) : null,




        ])
    }
}