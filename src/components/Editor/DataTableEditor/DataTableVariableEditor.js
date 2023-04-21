import { h } from 'vue'
import DataTableVariable from "../../../models/contents/DataTable/DataTableVariable"
import BilingualInput from '../../Editor/Inputs/BilingualInput.vue'
import editorStrings from '../../../editor-strings'
import tinyButton from "../TinyButton.vue"
import { AdjustmentsVerticalIcon } from '@heroicons/vue/24/solid'
import SelectInput from "../Inputs/SelectInput.vue"
import CheckboxInput from "../Inputs/CheckboxInput.vue"

export default {
    props: {
        variable: {
            type: DataTableVariable,
            required: true
        },
        variableKey: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            showAdvanced: false,
        }
    },
    render() {
        let bgClass;
        if (this.variable.emphasize) {
            bgClass = 'bg-yellow-100';
        } else if (this.variable.is_descriptive) {
            bgClass = 'bg-slate-200'
        } else {
            bgClass = 'bg-slate-100'
        }
        const language = document.documentElement.lang;
        const strings = editorStrings[language];

        let typesInputChoices = {
            'Markdown': 'markdown'
        }
        typesInputChoices[strings.data_table_variables_editor_var_type_number] = 'number';

        return h('div', { class: `border border-gray-300 rounded p-2 flex flex-col gap-4 ${bgClass}` }, [
            h('span', { class: 'font-semibold text-gray-800 font-mono text-lg' }, this.variableKey),
            h(BilingualInput, {
                label: strings.data_table_variables_editor_var_label,
                modelValue: this.variable.label,
                'onUpdate:modelValue': (value) => {
                    this.variable.label = value;
                    this.$emit('update:modelValue', this.variable)
                }
            }),

            h(SelectInput, {
                choices: typesInputChoices,
                label: strings.data_table_variables_editor_var_type,
                modelValue: this.variable.type,
                'onUpdate:modelValue': (value) => {
                    this.variable.type = value;
                }
            }),

            h(CheckboxInput, {
                label: strings.data_table_variables_editor_var_is_descriptive,
                modelValue: this.variable.is_descriptive,
                'onUpdate:modelValue': (value) => {
                    this.variable.is_descriptive = value
                    this.$emit('update:modelValue', this.variable)
                }
            }),

            h(tinyButton, {
                'aria-pressed': this.showAdvanced,
                'onClick': () => { this.showAdvanced = !this.showAdvanced },
            }, () => [h(AdjustmentsVerticalIcon, { 'class': 'h-4 w-4' }), strings.data_table_variables_editor_advanced_toggle]),



            ...this.showAdvanced ? [
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



                h(CheckboxInput, {
                    label: strings.data_table_variables_editor_var_skip_chart,
                    modelValue: this.variable.skip_chart,
                    'onUpdate:modelValue': (value) => {
                        this.variable.skip_chart = value
                        this.$emit('update:modelValue', this.variable)
                    }
                }),

                h(CheckboxInput, {
                    label: strings.data_table_variables_editor_var_emphasize,
                    modelValue: this.variable.emphasize,
                    'onUpdate:modelValue': (value) => {
                        this.variable.emphasize = value
                        this.$emit('update:modelValue', this.variable)
                    }
                }),


            ] : [],


        ])
    }
}