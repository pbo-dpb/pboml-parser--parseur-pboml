import { h } from 'vue'

export default class ArrayTable {
    constructor(payload) {

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
        this.arraytable = payload.arraytable ? payload.arraytable : null;

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
        this.axes = payload.axes ? payload.axes : null;


        this.colors = payload.colors ? payload.colors : null;

        /**
         * Provided keys found in the chart config object will be replaced by the given string.
         * Eg.: given config `{"myval": "_some_string_"}` and dicts `{'en': { '_some_string_': "Hello, world!"}}`
         * will render as `{"myval": "Hello, world!"}` when language set to `en`.
         */
        this.strings = {
            en: payload.strings?.en,
            fr: payload.strings?.fr
        }

        /**
         * A type (string) or an array of types (array) for the chart (eg. line). If more than one type is passed,
         * they will be applied to each dataset in order. If a string is passed, each dataset will be
         * of that single type.
         */

        if (payload.chart_type) {
            this.types = [payload.chart_type]
        } else {
            this.types = payload.chart_types ? payload.chart_types : 'bar'
        }
    }


    localizeRecursively(content, language) {
        /**
         *  Feels a little too easy...
         *  Inspired by https://stackoverflow.com/questions/29473526/recursive-find-and-replace-in-multidimensional-javascript-object
         */
        let rawContent = JSON.stringify(content);
        for (const [key, value] of Object.entries(this.strings[language])) {
            rawContent = rawContent.replaceAll(`"${key}"`, JSON.stringify(value))
        }

        return JSON.parse(rawContent);
    }
}