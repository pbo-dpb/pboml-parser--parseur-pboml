import { h } from 'vue'
import Chart from 'chart.js/auto';
import Datatable from "../../models/contents/DataTable/DataTable"
import ChartJsMixin from './ChartJsMixin';

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
            return {
                data: {
                    datasets: this.datasets,
                },
                options: {

                }
            }
        },

        datasets() {

            let [descriptiveVariableKey, descriptiveVariable] = this.datatable.descriptiveVariableKeyPair;

            if (!descriptiveVariableKey) throw "A descriptive variable must be set with `is_descriptive`=true to label the x axis."

            let series = [];
            let counter = 0;

            Object.entries(this.datatable.variables).forEach((entry) => {

                const [currentVariableKey, variable] = entry;
                if (!variable.skip_chart && !variable.is_descriptive) { // TODO Document this

                    let dataset = {
                        label: variable.label[this.language],
                        type: variable.chart_type ? variable.chart_type : "bar",
                        backgroundColor: variable.color ? variable.color : this.colorForIndex(counter, variable.emphasize),
                        borderColor: variable.color ? variable.color : this.colorForIndex(counter, variable.emphasize),
                        data: this.datatable.content.map(entry => {
                            if (entry.skip_chart) return null; // TODO Document this
                            let valForVar = entry[currentVariableKey];
                            return {
                                x: entry[descriptiveVariableKey]?.[this.language] ? entry[descriptiveVariableKey]?.[this.language] : entry[descriptiveVariableKey],
                                y: (valForVar?.[this.language] ? valForVar[this.language] : valForVar)
                            };
                        }).filter(n => n)
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