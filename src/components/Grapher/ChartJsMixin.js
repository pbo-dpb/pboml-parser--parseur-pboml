import { h } from 'vue'
import Chart from 'chart.js/auto';
import { EquidistantColorPalette } from "./ColourPalettes";
import Color from "color";

const unid = Math.random().toString(36).slice(2);

export default {
    props: {
        language: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            unid: unid,
            _chart: null,
        }
    },

    render() {
        return h('div', { class: 'flex flex-row justify-center w-full h-96 md:h-128' }, [
            h('canvas', { ref: 'chart', innerHTML: "", class: "w-full h-full" }, [
            ])
        ]);
    },



    mounted() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const textColor = isDark ? '#f9fafb' : '#111827';
        let config = this.config;
        config.options = {
            color: textColor,
            ...config.options,
            locale: this.language,
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    ...config.options.plugins?.legend,
                    position: "bottom"
                },
                ...config.options.plugins,
            },

        }
        this._chart = new Chart(
            this.$refs.chart.getContext('2d'),
            config
        );
    },

    methods: {
        colorForIndex(index, emphasize) {
            let colorForIndex = EquidistantColorPalette[index];

            let color = Color(colorForIndex ? colorForIndex : "#666666").saturate(emphasize ? 1 : 0).darken(emphasize ? 0.5 : (emphasize === false ? -0.25 : 0));

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                color = color.lighten(0.05).saturate(0.25);
            }

            return color.hex();
        }
    }

}