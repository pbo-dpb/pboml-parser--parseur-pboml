import { h } from 'vue'
import ArrayTable from "../../models/contents/ArrayTable/ArrayTable";
import DataTableVariable from '../../models/contents/DataTable/DataTableVariable';
import RendererStrings from "../../renderer-strings"

const cellBaseClass = `border border-gray-300 dark:border-gray-700 p-.5 text-center leading-snug`
export default {
    props: {
        arraytable: {
            type: ArrayTable,
            required: true
        },
        language: {
            type: String,
            default: document.documentElement.lang
        }
    },
    computed: {
        headers() {
            return this.localizedTable[0];
        },
        body() {
            let body = [
                ...this.localizedTable
            ];
            body.shift();
            return body;
        },
        localizedTable() {
            return this.arraytable.localizeRecursively(this.arraytable.arraytable, this.language)
        }
    },
    render() {

        return h('table', { 'class': `table-fixed w-full` }, [
            h('thead', {}, [
                h('tr', {}, this.headers.map((cellContent) => h('th', { class: cellBaseClass }, cellContent)))
            ]),
            h('tbody', {}, [
                this.body.map((row) => h('tr', {}, row.map(celldata => this.formatedCellForData(celldata))))
            ])
        ])
    },
    methods: {
        formatedCellForData(celldata) {

            let cellClasses = `${cellBaseClass}`;

            if (celldata === null) {
                celldata = [h('span', { class: 'sr-only' }, RendererStrings[this.language].empty_cell_label)];
                cellClasses += " bg-gray-100 dark:bg-gray-900"
            } else if (typeof celldata === 'number') {
                let formatterOptions = {
                    trailingZeroDisplay: "stripIfInteger"
                }
                celldata = (new Intl.NumberFormat(this.language, formatterOptions)).format(celldata)
            }


            return h('td', { class: cellClasses }, celldata);
        }
    }
}