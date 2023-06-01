import { h } from 'vue'
import Chart from 'chart.js/auto';
import Datatable from "../../models/contents/DataTable/DataTable"
import ChartJsMixin from './ChartJsMixin';
import Color from "color";

export default {
    mixins: [ChartJsMixin],
    props: {
        datatable: {
            type: Datatable,
            required: true,
        },
    },

    computed: {
        config() {
            try {
                return {
                    data: {
                        datasets: this.datasets,
                    },
                    options: {
                        scales: this.scales
                    }
                }
            } catch (error) {
                return null;
            }

        },

        scales() {
            let [descriptiveVariableKey, descriptiveVariable] = this.datatable.descriptiveVariableKeyPair;
            let xAxisLabel = descriptiveVariable.label?.[this.language]

            let scales = {
                x: {

                    title: {
                        text: xAxisLabel,
                        display: xAxisLabel ? true : false,
                    }
                }
            }

            if (descriptiveVariable.type === "markdown") {
                scales.x.type = "category"
            }

            return scales
        },

        datasets() {

            let [descriptiveVariableKey, descriptiveVariable] = this.datatable.descriptiveVariableKeyPair;

            if (!descriptiveVariableKey) throw new Error("A descriptive variable must be set with `is_descriptive`=true to label the x axis.")

            let series = [];
            let counter = 0;

            Object.entries(this.datatable.variables).forEach((entry) => {

                const [currentVariableKey, variable] = entry;
                if (!variable.skip_chart && !variable.is_descriptive) { // TODO Document this

                    const variableColor = variable.color ? variable.color : this.colorForIndex(counter, variable.emphasize);

                    const varEntries = this.datatable.content.map(entry => {
                        if (entry.skip_chart) return null; // TODO Document this
                        let valForVar = entry[currentVariableKey];
                        return {
                            x: entry[descriptiveVariableKey]?.[this.language] ? entry[descriptiveVariableKey]?.[this.language] : entry[descriptiveVariableKey],
                            y: (valForVar?.[this.language] ? valForVar[this.language] : valForVar),
                            backgroundColor: entry.emphasize ? this.emphasizeColor(new Color(variableColor)).hex() : variableColor,
                            borderColor: entry.emphasize ? "#a855f7" : variableColor,
                            borderWidth: entry.emphasize ? 2 : 0,
                        };
                    }).filter(n => n);

                    let dataset = {
                        label: variable.label[this.language],
                        type: variable.chart_type ? variable.chart_type : "bar",
                        backgroundColor: varEntries.map((v) => v.backgroundColor),
                        borderColor: varEntries.map((v) => v.borderColor),
                        borderWidth: varEntries.map((v) => v.borderWidth),
                        data: varEntries
                    };

                    if (variable.group) {
                        dataset.stack = variable.group[this.language]; // TODO Document this (https://www.chartjs.org/docs/latest/samples/bar/stacked-groups.html)
                    }

                    series[counter] = dataset
                    counter++;
                }

            });

            return series;
        }
    }


}