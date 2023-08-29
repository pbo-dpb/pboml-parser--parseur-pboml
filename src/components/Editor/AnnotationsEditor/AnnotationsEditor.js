import Button from "../Button.vue"
import editorStrings from "../../../editor-strings"
import CheckboxInput from "../Inputs/CheckboxInput.vue"
import { h } from 'vue'
import Annotation from "../../../models/Annotation"
import AnnotationsEditorNewButton from "./AnnotationsEditorNewButton"
export default {
    props: ["pbomlDocument"],

    data() {
        return {
            keepOrganized: false,
        }
    },

    mounted() {

        // Turn on automatic organization if annotations are all numbers (no strings) and already consecutives
        const annotationIds = this.pbomlDocument.annotations.map(a => `${a.id}`);
        if (!annotationIds.length || (!annotationIds.find((a) => a.match(/\D+/)) && annotationIds.every((el, index) => index === 0 || parseInt(el) === parseInt(annotationIds[index - 1]) + 1))) {
            this.keepOrganized = true;
        }

    },

    methods: {
        pushNewAnnotation(e, index) {
            if (!this.pbomlDocument.annotations)
                this.pbomlDocument.annotations = [];

            let newAnnotation = new Annotation({
                id: this.pbomlDocument.annotations.length + 1
            })

            if (index === 0 || index) {
                this.pbomlDocument.annotations.splice(index, 0, newAnnotation);
            } else {
                this.pbomlDocument.annotations.push(newAnnotation)
            }

            this.renumberSlices();


            if (e && e.target) {
                const button = e.target;
                this.$nextTick(() => {
                    setTimeout(() => {
                        button.scrollIntoView({
                            behavior: 'instant',
                            block: 'center',
                            inline: 'center'
                        })
                    }, "300")
                })
            }

        },

        renumberSlices() {

            if (!this.keepOrganized) return;

            this.pbomlDocument.annotations.forEach((annotation, i) => {
                annotation.id = i + 1;
            });

        }
    },

    render() {
        let strings = editorStrings[document.documentElement.lang]
        return h('section', { 'class': "flex flex-col gap-4" }, [

            h(CheckboxInput, {
                label: strings.annotation_auto_keep_organized_checkbox,
                class: "ml-auto",
                modelValue: this.keepOrganized,
                'onUpdate:modelValue': (value) => {
                    this.keepOrganized = value
                    if (value)
                        this.renumberSlices();
                }
            }),

            this.pbomlDocument.annotations?.map((ann, i) => {
                return [

                    // Prepend the first one with an annotation
                    i === 0 ? h(AnnotationsEditorNewButton, { soft: true, "onClick": (e) => this.pushNewAnnotation(e, 0) }) : null,

                    ann.renderEditingVnode(document.documentElement.lang, (annotation) => {
                        this.pbomlDocument.annotations.splice(this.pbomlDocument.annotations.indexOf(annotation), 1);
                        this.renumberSlices();
                    }, this.keepOrganized),

                    // Add a soft button after each slice except the last one
                    i === (this.pbomlDocument.annotations.length - 1) ? null : h(AnnotationsEditorNewButton, { soft: true, "onClick": (e) => this.pushNewAnnotation(e, i + 1) })

                ]
            }),

            // Always follow slice list with a hard button
            h(AnnotationsEditorNewButton, { soft: this.pbomlDocument.annotations.length ? true : false, "onClick": (e) => this.pushNewAnnotation(e) }),

        ])

    }

}