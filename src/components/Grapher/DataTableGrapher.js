import { h } from 'vue'
import Chart from 'chart.js/auto';
import Datatable from "../../models/contents/DataTable/DataTable"

export default {

    props: {
        language: {
            type: String,
            required: true
        },


        datatable: {
            type: Datatable,
            required: true,
        },

    },









}