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
        if (!this.config) return (h('div', { class: 'text-red-800 font-semibold text-4xl' }, () => h('span', {}, `⚠️`)));

        return h('div', { class: 'flex flex-row justify-center w-full h-96 md:h-128' }, [
            h('canvas', { ref: 'chart', innerHTML: "", class: "w-full h-full" }, [
            ])
        ]);
    },



    mounted() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const textColor = isDark ? '#f9fafb' : '#111827';
        let config = this.config;
        if (!config) return
        config.options = {
            animation: null,
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

        emphasizeColor(color) {
            return color.saturate(1).darken(0.5)
        },

        colorForIndex(index, emphasize) {
            let colorForIndex = EquidistantColorPalette[index];

            let color = Color(colorForIndex ? colorForIndex : "#666666");

            if (emphasize) {
                color = this.emphasizeColor(color);
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                color = color.lighten(0.05).saturate(0.25);
            }

            return color.hex();
        }
    }

}