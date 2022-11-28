import { h } from 'vue'

export default class SliceLabelEditor {
    constructor(label) {
        this.label = {
            en: label?.en,
            fr: label?.fr
        }
    }


    renderAsVnode() {
        return [
            h('legend', { class: 'border-l-2 pl-2 py-2 border-blue-300 flex flex-col gap-1' }, [
                h('span', { class: "font-thin text-2xl", innerText: this.label.en }),
                h('span', { class: "font-thin text-2xl", innerText: this.label.fr }),
            ])
        ];

    }

}