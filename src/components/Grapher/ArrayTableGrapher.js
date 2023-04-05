import { h } from 'vue'

import ArrayTableDataSource from './ArrayTableDataSource';
import ChartJsMixin from './ChartJsMixin';

export default {
    mixins: [ChartJsMixin],
    props: {


        /**
         * Provided keys found in the chart config object will be replaced by the given string.
         * Eg.: given config `{"myval": "_some_string_"}` and dicts `{'en': { '_some_string_': "Hello, world!"}}`
         * will render as `{"myval": "Hello, world!"}` when language set to `en`.
         */
        strings: {
            type: Object,
            default() {
                return {
                    'en': {},
                    'fr': {}
                }
            }
        },


        /**
         * A primitive objet or an array (object: key-value(s) or [[header1, header2], ['val1', 'val2']]).
         * Values that are strings or numbers will be treated litteraly. Values that are objects will
         * be unfolded and must adhere to the following format:
         * {
         *      data: "",
         *      emphasize: true// Optional; when true will highlight this value
         * }
         * Inspired by https://developers.google.com/chart/interactive/docs/datatables_dataviews
         */
        arraytable: {
            type: [Array, Object],
            required: true,
        },

        /**
         * A type (string) or an array of types (array) for the chart (eg. line). If more than one type is passed,
         * they will be applied to each dataset in order. If a string is passed, each dataset will be
         * of that single type.
         */
        types: {
            validator(values) {
                if (typeof values === "string")
                    values = [values];
                return !values.map(value => ['line', 'bar'].includes(value)).includes(false)
            }
        },


        /**
         * An optional object with possible format 
         * {
         *  x: {
         *      label: "__some_label__",
         *      type: "time|dollars"
         *  },
         *  y: {
         *      (...)
         *  }
         * }
         */
        axes: {
            type: Object,
        },
    },


    computed: {
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

            if (this.arraytable) {
                let dataSource = new ArrayTableDataSource(this.types, this.arraytable);
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