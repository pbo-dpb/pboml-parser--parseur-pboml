import { h } from 'vue'
import deepEqual from 'deep-equal';

export default class ChoiceRenderer {
    constructor(slice) {
        this.slice = slice;
    }

    isChoiceSelected(choice) {

        let isSelected = true;

        for (const [key, value] of Object.entries(choice)) {
            if (!deepEqual(this.slice[key], value))
                isSelected = false;
        }

        return isSelected;
    }

    assignChoiceToSlice(choice) {
        for (const [key, value] of Object.entries(choice)) {
            this.slice[key] = value;
        }

    }


    renderChoiceVnode(choice) {


        let clonedSlice = (new this.slice.constructor({
            ...this.slice,
            display_label: false,
            ...choice
        }));
        let isSelected = this.isChoiceSelected(choice);

        return h('div', {
            class: `flex flex-row gap-2 border border-blue-300 p-2 rounded items-center ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`,
            role: "radio",
            "aria-checked": isSelected,
            onClickCapture: () => {
                this.assignChoiceToSlice(choice)
            },
        }, [
            isSelected ? h('svg', {
                xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "stroke-width": "1.5", stroke: "currentColor", class: "w-6 h-6 text-blue-800",
                innerHTML: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />'
            }) : h('div', { 'class': 'w-6 h-6' }),

            h('div', { 'class': 'flex flex-col gap-1' }, [
                clonedSlice.renderAsVnode("en"),
                clonedSlice.renderAsVnode("fr")
            ]),

        ])
    }


    renderAsVnode() {
        return h('main', { 'class': 'flex flex-col gap-2', role: 'radiogroup' }, this.slice.choices.map(choice => {
            return this.renderChoiceVnode(choice)
        }));
    }
}