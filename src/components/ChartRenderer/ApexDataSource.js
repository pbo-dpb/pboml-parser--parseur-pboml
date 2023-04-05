import AbstractChartDataSource from "./AbstractChartDataSource.js"

export default class ApexDataSource extends AbstractChartDataSource {

    get yAxis() {

        let unit = null
        Object.entries(this.data.variables).forEach((entry) => {
            const [key, value] = entry;
            if (!unit && value.unit?.[this.language])
                unit = value.unit[this.language]
        });

        return unit ? {
            title: {
                text: unit,
            },
        } : null
    }

    getSeries() {

        let [descriptiveVariableKey, descriptiveVariable] = this.data.descriptiveVariableKeyPair;

        if (!descriptiveVariableKey) throw "A descriptive variable must be set with `is_descriptive`=true to label the x axis."

        let series = [];
        let counter = 0;

        Object.entries(this.data.variables).forEach((entry) => {

            const [key, value] = entry;
            if (!value.is_descriptive) {
                series[counter] = {
                    name: value.label[this.language],
                    type: value.chart_type ? value.chart_type : "column",
                    data: this.data.content.map(entry => {
                        if (entry.skip_chart) return null; // TODO Document this
                        let valForVar = entry[key];
                        return {
                            x: entry[descriptiveVariableKey]?.[this.language] ? entry[descriptiveVariableKey]?.[this.language] : entry[descriptiveVariableKey],
                            y: (valForVar?.[this.language] ? valForVar[this.language] : valForVar)
                        };
                    }).filter(n => n)
                };
                counter++;
            }

        });

        return series;
    }


    getOptions() {
        if (this.data?.options) return this.data.options;
        return {
            chart: {
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
                background: 'rgba(0,0,0,0)'
            },
            colors: this.colorPalette,
            dataLabels: {
                style: {
                    colors: [this.is_dark ? '#CCCCCC' : '#1F2937']
                }
            },
            theme: {
                mode: this.is_dark ? 'dark' : 'light'
            },

            stroke: {
                width: [0, 0]
            },
            markers: {
                size: [6, 0]
            },
            yaxis: this.yAxis,
            xaxis: { type: 'numeric' }
        }
    }


    serialize() {
        let obj = super.serialize();

        return {

            series: this.getSeries(),
            options: this.getOptions()

        }

    }

}