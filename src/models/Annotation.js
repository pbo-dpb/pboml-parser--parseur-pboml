import { h, Suspense } from 'vue'


const defaults = {
    category: "note",
    content_type: 'markdown'
}

export default class Annotation {
    constructor(payload) {
        this.id = payload.id
        this.category = payload.category ? payload.category : defaults.category;
        this.content_type = payload.category ? payload.category : defaults.content_type;

        if (this.content_type === "markdown") {
            this.content = payload.content;
        }


        this.state = {
            sequence: 0
        }

    }


    get anchorHtml() {
        return `<sup><a class="no-underline print:no-underline print:text-gray-800 hover:underline bg-blue-100 print:before:content-['['] print:after:content-[']'] rounded font-mono px-0.5 mx-0.5" href='#ant_${this.id}'>${this.state.sequence}</a></sup>`
    }

    toArray() {
        return {
            id: this.id,
            category: this.category,
            content_type: this.content_type,

        }
    }
}