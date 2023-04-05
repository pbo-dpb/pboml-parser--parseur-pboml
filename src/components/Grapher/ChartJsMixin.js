import { h } from 'vue'
import Chart from 'chart.js/auto';

const unid = Math.random().toString(36).slice(2);

export default {
    data() {
        return {
            unid: unid,
            _chart: null
        }
    },

    render() {
        return h('canvas', { ref: 'chart', innerHTML: "", class: 'w-full' }, [
        ]);
    },

    mounted() {

        this._chart = new Chart(
            this.$refs.chart.getContext('2d'),
            this.chartjsconfig
        );


    },
}