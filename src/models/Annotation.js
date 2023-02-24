import { h, Suspense } from 'vue'

export default class Annotation {
    constructor(payload) {
        this.id = payload.id
        this.type = payload.type ? payload.type : 'note';

        this.content = payload.content;

        this.state = {
            sequence: 0
        }

    }


    get anchorHtml() {
        return `<sup><a class="no-underline print:no-underline print:text-gray-800 hover:underline bg-blue-100 print:before:content-['['] print:after:content-[']'] rounded font-mono px-0.5 mx-0.5" href='#ant_${this.id}'>${this.state.sequence}</a></sup>`
    }

}