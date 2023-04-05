import { h } from 'vue'
import VueApexCharts from "vue3-apexcharts";
import AbstractChartDataSource from './AbstractChartDataSource';

export default {
    props: { dataSource: { required: true } },
    render() {
        let data;

        if (this.dataSource instanceof AbstractChartDataSource)
            data = this.dataSource.serialize();


        return h(VueApexCharts, { height: 500, ...data }, () => []);
    }
}