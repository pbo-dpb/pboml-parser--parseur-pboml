import { h, defineAsyncComponent, Suspense } from 'vue'
import Slice from "./Slice";
const language = document.documentElement.lang;
const Grapher = defineAsyncComponent(() => import('../../components/Grapher/Grapher.js'))
import LoadingIndicator from "../../components/LoadingIndicator.vue"

export default class GraphSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.type = "graph"
        this.strings = {
            en: payload.strings?.en,
            fr: payload.strings?.fr
        }
        // Interim datatable (array / object)
        this.datatable = payload.datatable ? payload.datatable : null;

        this.axes = payload.axes ? payload.axes : null;

        this.colors = payload.colors ? payload.colors : null;

        if (payload.chart_type) {
            this.chart_types = [payload.chart_type]
        } else {
            this.chart_types = payload.chart_types ? payload.chart_types : 'bar'
        }
    }


    renderReadonlyVnode(language) {
        return h(Suspense, null, {
            default: () => h('div', { class: 'flex print:block flex-col items-center justify-center' }, [
                h('div', { class: `w-full'}` }, [
                    h(Grapher, {
                        language: language,
                        strings: this.strings,
                        types: this.chart_types,
                        datatable: this.datatable,
                        axes: this.axes,
                        colors: this.colors,
                    })
                ])
            ]),
            fallback: () => h('template', null, LoadingIndicator)
        });
    }

    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h('div', { class: 'grid grid-cols-2 gap-2' }, [
            this.renderReadonlyVnode('en'),
            this.renderReadonlyVnode('fr')
        ]))
        return vnodes;
    }



    toArray() {
        let array = super.toArray();
        array.strings = this.strings;
        array.datatable = this.datatable;
        array.axes = this.axes;
        array.chart_types = this.chart_types;
        return array;
    }


}