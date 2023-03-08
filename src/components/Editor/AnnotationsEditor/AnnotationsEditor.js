import Button from "../Button.vue"
import editorStrings from "../../../editor-strings"
import { h } from 'vue'
import Annotation from "../../../models/Annotation"
export default {
    props: ["pbomlDocument"],

    methods: {
        pushNewAnnotation(e) {
            if (!this.pbomlDocument.annotations)
                this.pbomlDocument.annotations = [];

            let currentAnnotationsCount = this.pbomlDocument.annotations.length
            this.pbomlDocument.annotations.push(new Annotation({
                id: currentAnnotationsCount + 1
                /*content_type: "bibtex",
                content:
                {
                    en: `@techreport{LOREM_IPSUM_ID,\n  author={Smith, John and Untel, Jean},\n  title={Lorem Ipsum},\n  institution={Office of the Parliamentary Budget Officer},\n  year=2023,\n  url = \"https://www.pbo-dpb.ca/en",\n  address = \"Ottawa, ON\"\n}`,
                    fr: `@techreport{LOREM_IPSUM_ID,\n  author={Smith, John and Untel, Jean},\n  title={Lorem Ipsum},\n  institution={Bureau du directeur parlementaire du budget},\n  year=2023,\n  url = \"https://www.pbo-dpb.ca/fr",\n  address = \"Ottawa, ON\"\n}`
                }*/
            }))
            if (e && e.target) {
                const button = e.target;
                this.$nextTick(() => {
                    setTimeout(() => {
                        button.scrollIntoView(false)
                    }, "300")
                })
            }

        },
        deleteAnnotation(annotation) {

        }
    },

    render() {
        let strings = editorStrings[document.documentElement.lang]
        return h('section', { 'class': "flex flex-col gap-4" }, [

            this.pbomlDocument.annotations?.map((ann) => {
                return ann.renderEditingVnode()
            }),

            h('div', h(Button, { 'innerText': `${strings.create_annotation} ➕`, "onClick": (e) => this.pushNewAnnotation(e) }))

        ])

    }

}