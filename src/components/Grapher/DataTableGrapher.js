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
            } else {
                let labels = this.datatable.content.map((ct) => ct[descriptiveVariableKey]).sort((a, b) => a - b);
                // Initialize the smallestStepSize with a large value
                let smallestStepSize = Infinity;

                // Iterate through the array and calculate the differences between adjacent numbers
                for (let i = 1; i < labels.length; i++) {
                    const stepSize = labels[i] - labels[i - 1];

                    // Update the smallestStepSize if the current stepSize is smaller
                    if (stepSize < smallestStepSize) {
                        smallestStepSize = stepSize;
                    }
                }
                scales.x.type = "linear"
                scales.x.ticks = { stepSize: smallestStepSize }
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
                        let xLabel = entry[descriptiveVariableKey]?.[this.language] ? entry[descriptiveVariableKey]?.[this.language] : entry[descriptiveVariableKey];
                        return {
                            x: xLabel,
                            y: (valForVar?.[this.language] ? valForVar[this.language] : valForVar),
                            backgroundColor: entry.emphasize ? this.emphasizeColor(new Color(variableColor)).hex() : variableColor,
                            borderColor: variable.chart_type !== 'line' && entry.emphasize ? "#a855f7" : variableColor,
                            borderWidth: entry.emphasize ? 2 : 0,
                            pointRadius: entry.emphasize ? 7 : 5,

                        };
                    }).filter(n => n);

                    let dataset = {
                        label: variable.label[this.language],
                        type: variable.chart_type ? variable.chart_type : "bar",
                        backgroundColor: varEntries.map((v) => v.backgroundColor),
                        borderColor: varEntries.map((v) => v.borderColor),
                        borderWidth: variable.chart_type === 'line' ? 3 : varEntries.map((v) => v.borderWidth),
                        pointRadius: varEntries.map((v) => v.pointRadius),
                        data: varEntries,
                        // Make sure we draw lines and lone points on top of bars
                        order: counter - (variable.chart_type === 'line' ? 10 : 0) - (variable.chart_type === 'scatter' ? 20 : 0)
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