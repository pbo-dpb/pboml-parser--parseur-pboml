import { h } from 'vue'

import strings from "../../../editor-strings"
import Button from "../Button.vue";
import editorStrings from '../../../editor-strings';
import CheckboxInput from "../Inputs/CheckboxInput.vue"
import SelectInput from "../Inputs/SelectInput.vue"
import MarkdownTextarea from '../Inputs/MarkdownTextarea.vue'
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/vue/24/solid';
import MarkdownDriver from '../../../MarkdownDriver';
import DataTableVariable from '../../../models/contents/DataTable/DataTableVariable';
import DataTableEntry from '../../../models/contents/DataTable/DataTableEntry';
import DataTable from '../../../models/contents/DataTable/DataTable';
import merge from "lodash.merge";
import Turndown from "turndown"

export default {
    props: ['datatable'],
    data() {
        return {
            rawContent: {
                en: '',
                fr: ''
            },
            shouldMergeNotReplace: true,
            useLineBreakForVariableGroupName: true,
            locationOfVars: 'col',
        }
    },
    methods: {
        buildArrayTableForLanguage(input) {

            // Convert Markdown to HTML
            let html = MarkdownDriver.parseGenericMarkdown(input);

            // Extract DOM template from raw HTML string
            // Inspired by https://stackoverflow.com/a/35385518
            const template = document.createElement('template');
            html = html.trim();
            template.innerHTML = html;
            let table = template.content.querySelector('table');
            if (!table) return null;
            const turndownService = new Turndown()
            let tableArray = [...table.querySelectorAll('tr')].map((tr) => {
                return [...tr.querySelectorAll('td, th')].map(td => {
                    let content = turndownService.turndown(td.innerHTML);
                    let innerText = content ? content.trim() : "";
                    return innerText.split("\n").filter(n => n.trim()).join("\n");
                })
            })

            return tableArray;
        },

        getKeyVariableWrapperForRowCol(tables, rowIndex, rowColIndex, otherVariables) {
            let label = {
                en: tables.en?.[rowIndex]?.[rowColIndex],
                fr: tables.fr?.[rowIndex]?.[rowColIndex],
            };

            let group = null;

            if (this.useLineBreakForVariableGroupName && label.en && label.en.includes("\n")) {

                let parts = label.en.split("\n");
                group = {
                    en: parts.shift()
                }

                label.en = parts.join("\n");
            }

            if (group && label.fr && label.fr.includes("\n")) {
                let parts = label.fr.split("\n");
                group.fr = parts.shift();
                label.fr = parts.join("\n");
            }


            let variable = new DataTableVariable({
                label: label,
                group: group,
                is_descriptive: (this.locationOfVars === "row" && rowColIndex === 0) || (this.locationOfVars === "col" && rowIndex === 0)
            });

            let key = DataTableVariable.generateUniqueDataTableVariableId(Object.values(variable.label).filter(x => x)?.[0], otherVariables, group?.en ?? null);
            variable.key = key;
            return { key, variable }
        },

        convertVariableToNumericWhenApplicable(variables, entries) {
            // Traverse entries and spot all numerical variables
            const englishFormattedNumberReg = new RegExp('^-?[0-9,]+\\.?[0-9]*$', '')
            const frenchFormattedNumberReg = new RegExp('^-?[0-9\\s]+\\,?[0-9]*$', '')
            variables.forEach(variable => {
                // Never convert descriptive variables so we don't accidentally convert years to numbers
                if (variable.variable.is_descriptive) return;

                let entriesAreOnlyNumeric = true;
                entries.forEach(entry => {

                    if (entry[variable.key]?.is_descriptive)
                        entriesAreOnlyNumeric = false;
                    if (typeof entry[variable.key]?.en !== 'undefined' && entry[variable.key]?.en !== '-' && entry[variable.key]?.en !== '' && !englishFormattedNumberReg.test(entry[variable.key]?.en))
                        entriesAreOnlyNumeric = false;
                    if (typeof entry[variable.key]?.fr !== 'undefined' && entry[variable.key]?.en !== '-' && entry[variable.key]?.fr !== '' && !frenchFormattedNumberReg.test(entry[variable.key]?.fr))
                        entriesAreOnlyNumeric = false;
                })
                if (entriesAreOnlyNumeric)
                    variable.variable.type = 'number'
            });

            // Transform numeric variable entries to numbers
            entries.forEach(entry => {

                (variables.filter(v => v.variable.type === 'number')).forEach((numVar) => {
                    let firstValueForEntry;
                    let languageOfFirstValueForEntry;

                    for (const [lKey, languageSpecificValue] of Object.entries(entry[numVar.key])) {
                        if (typeof languageSpecificValue !== 'undefined') {
                            firstValueForEntry = languageSpecificValue;
                            languageOfFirstValueForEntry = lKey;
                            break;
                        }
                    }

                    if (firstValueForEntry) {
                        let cleanedUpNumber;
                        if (languageOfFirstValueForEntry === 'en')
                            cleanedUpNumber = firstValueForEntry.replaceAll(",", "");
                        else if (languageOfFirstValueForEntry === 'fr')
                            cleanedUpNumber = firstValueForEntry.replaceAll(" ", "").replaceAll(",", ".");

                        if (cleanedUpNumber === "" || cleanedUpNumber === "-")
                            entry[numVar.key] = null;
                        else
                            entry[numVar.key] = +cleanedUpNumber;


                    }
                });

            })

            return { variables, entries };
        }


    },
    computed: {
        dataTable() {
            let tables = {
                'en': this.buildArrayTableForLanguage(this.rawContent.en),
                'fr': this.buildArrayTableForLanguage(this.rawContent.fr)
            }

            if (!Object.values(tables).filter(x => x).length) return null;

            // Use the first available table to build the entire data structure
            const bones = Object.values(tables).filter(x => x)[0];

            let variables = [];
            let entries = [];

            bones.forEach((row, rowIndex) => {
                row.forEach((rowCol, rowColIndex) => {
                    if (this.locationOfVars === "row") {
                        if (rowIndex === 0) {
                            variables.push(this.getKeyVariableWrapperForRowCol(tables, rowIndex, rowColIndex, variables));
                        } else {
                            if (!entries[rowIndex - 1]) {
                                entries.push({})
                            }
                            const variableWrapper = variables[rowColIndex];
                            entries[rowIndex - 1][variableWrapper.key] = {
                                en: tables.en?.[rowIndex]?.[rowColIndex],
                                fr: tables.fr?.[rowIndex]?.[rowColIndex],

                            }
                        }
                    } else if (this.locationOfVars === "col") {
                        if (rowColIndex === 0) {
                            variables.push(this.getKeyVariableWrapperForRowCol(tables, rowIndex, rowColIndex, variables))
                        } else {
                            if (!entries[rowColIndex - 1]) {
                                entries.push({})
                            }
                            const variableWrapper = variables[rowIndex];
                            entries[rowColIndex - 1][variableWrapper.key] = {
                                en: tables.en?.[rowIndex]?.[rowColIndex],
                                fr: tables.fr?.[rowIndex]?.[rowColIndex],

                            }
                        }
                    }
                })
            });

            let transformedVarAndEntries = this.convertVariableToNumericWhenApplicable(variables, entries);
            variables = transformedVarAndEntries.variables;
            entries = transformedVarAndEntries.entries;

            let dataTable = new DataTable();
            dataTable.variables = Object.fromEntries(variables.map(v => [v.key, v.variable]));
            dataTable.content = entries.map(e => new DataTableEntry(e));

            if (this.shouldMergeNotReplace) {
                let newTable = dataTable.toArray();
                let existingTable = this.datatable.toArray();
                let mergedTable = merge(existingTable, newTable);
                dataTable = new DataTable(mergedTable);
            }

            return dataTable

        },
        locationOfVarsChoices() {
            const language = document.documentElement.lang;
            let strings = editorStrings[language];
            let choices = {};
            choices[`${strings.data_table_importer_var_on_first_row}`] = "row";
            choices[`${strings.data_table_importer_var_on_first_col}`] = "col";
            return choices;
        },
    },
    render() {
        const language = document.documentElement.lang;
        let strings = editorStrings[language];

        // Second screen
        let flowDom = [

            h('div', { class: 'flex flex-row gap-4 items-center' }, [

                h(MarkdownTextarea, {
                    class: 'w-full p-2 font-mono border border-gray-300 h-64',
                    modelValue: this.rawContent.en,
                    label: 'EN',
                    'onUpdate:modelValue': (v) => {
                        this.rawContent.en = v
                    }
                }, ''),

                h(MarkdownTextarea, {
                    class: 'w-full p-2 font-mono border border-gray-300 h-64',
                    modelValue: this.rawContent.fr,
                    label: 'FR',
                    'onUpdate:modelValue': (v) => {
                        this.rawContent.fr = v
                    },

                }, ''),
            ]),

            h(SelectInput, {
                choices: this.locationOfVarsChoices,
                label: strings.data_table_importer_var_on_label,
                modelValue: this.locationOfVars,
                'onUpdate:modelValue': (value) => {
                    this.locationOfVars = value;
                }
            }),



            h(CheckboxInput, {
                label: strings.data_table_importer_append_checkbox,
                modelValue: this.shouldMergeNotReplace,
                disabled: Object.values(this.datatable.variables).length === 0,
                modelValue: !this.shouldMergeNotReplace,
                'onUpdate:modelValue': (value) => {
                    this.shouldMergeNotReplace = !this.shouldMergeNotReplace
                }
            }),

            h(CheckboxInput, {
                label: strings.data_table_use_line_break_for_variable_group_names,
                modelValue: this.useLineBreakForVariableGroupName,
                modelValue: this.useLineBreakForVariableGroupName,
                'onUpdate:modelValue': (value) => {
                    this.useLineBreakForVariableGroupName = !this.useLineBreakForVariableGroupName
                }
            }),



            this.dataTable ? h('div', { class: 'flex flex-col gap-2' }, [

                'EN',
                this.dataTable.renderReadonlyVnode('en'),
                'FR',
                this.dataTable.renderReadonlyVnode('fr')
            ]) : null,


            h('div', { class: 'flex flex-row gap-2' }, [
                h(Button, {
                    'onClick': () =>
                        this.$emit('import', this.dataTable)
                }, () => [h(CheckCircleIcon, { class: 'w-4 h-4' }, () => []), strings.data_table_importer_import_button]),
            ])];






        return h('div', { class: 'flex flex-col gap-4' }, [
            ...flowDom
        ])



    }
}
