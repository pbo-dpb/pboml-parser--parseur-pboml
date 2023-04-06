import ArrayTableDataSource from './ArrayTableDataSource';
import ChartJsMixin from './ChartJsMixin';
import ArrayTable from '../../models/contents/ArrayTable/ArrayTable';

export default {
    mixins: [ChartJsMixin],
    props: {

        arraytable: {
            type: ArrayTable,
            required: true,
        },

    },


    computed: {

        strings() {
            return this.arraytable.strings
        },

        axes() {
            return this.arraytable.axes;
        },

        types() {
            return this.arraytable.types;
        },

        config() {
            return this._config;
        },
        _config() {

            let config = {
                data: this._data,
                options: this._options
            }

            return config;
        },

        _data() {

            if (this.arraytable.arraytable) {
                let dataSource = new ArrayTableDataSource(this.types, this.arraytable.arraytable);
                return this.localizeRecursively(dataSource.convertToGraphjsDataStructure());
            }

            return null;
        },

        _options() {
            let options = {
                scales: {
                    x: this.configureAxis('x'),
                    y: this.configureAxis('y')
                },


            }

            return options
        }
    },

    methods: {
        localizeRecursively(content) {
            /**
             *  Feels a little too easy...
             *  Inspired by https://stackoverflow.com/questions/29473526/recursive-find-and-replace-in-multidimensional-javascript-object
             */
            let rawContent = JSON.stringify(content);
            for (const [key, value] of Object.entries(this.strings[this.language])) {
                rawContent = rawContent.replaceAll(`"${key}"`, JSON.stringify(value))
            }

            return JSON.parse(rawContent);
        },
        configureAxis(axisName) {
            let axis = {
                title: {}
            };

            /**
             * Axis name
             */
            if (this.axes?.[axisName]?.label) {
                axis.title.display = true;
                axis.title.text = this.axes[axisName].label;
                // A custom name needs to be localized
                axis = this.localizeRecursively(axis);
            }

            /**
             * Axis customization
             */
            if (this.axes?.[axisName]?.style === "currency" || this.axes?.[axisName]?.style === "percentage") {
                axis.ticks = {
                    callback: (value, index, ticks) => {
                        let formatterOptions = {
                            style: this.axes?.[axisName].style,
                            trailingZeroDisplay: "stripIfInteger"
                        };
                        if (this.axes?.[axisName].style === "currency") {
                            formatterOptions.currency = this.axes[axisName].currency ? this.axes[axisName].currency : "CAD";
                            formatterOptions.currencyDisplay = "narrowSymbol";
                        }
                        if (this.axes?.[axisName].style === "percentage") {
                            formatterOptions.style = "percent";
                            formatterOptions.maximumFractionDigits = 2;
                        }
                        return (new Intl.NumberFormat(this.language, formatterOptions)).format(value / 100);
                    }
                }
            }

            return axis;

        },
    }

}