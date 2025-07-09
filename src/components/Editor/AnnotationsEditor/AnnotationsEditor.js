import Button from "../Button.vue"
import editorStrings from "../../../editor-strings"
import CheckboxInput from "../Inputs/CheckboxInput.vue"
import { h } from 'vue'
import Annotation from "../../../models/Annotation"
import AnnotationsEditorNewButton from "./AnnotationsEditorNewButton"
import AnnotationEditor from "../../../editors/AnnotationEditor"


import LockStateToggler from "../../LockStateToggler.js";



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
                id: this.pbomlDocument.annotations.length + 1,
                state: {
                    _unlocked: true, // New annotations are always unlocked
                }
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
                            behavior: 'smooth',
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

            this.pbomlDocument.annotations?.map((annotation, i) => {
                return [

                    // Prepend the first one with an annotation
                    i === 0 ? h(AnnotationsEditorNewButton, { soft: true, "onClick": (e) => this.pushNewAnnotation(e, 0) }) : null,

                    h('div', { 'class': 'relative' }, [

                        h(LockStateToggler, { class: 'absolute -left-8', unlockableObject: annotation }, () => []),

                        annotation.state._unlocked ? null : h('div', { 'aria-hidden': true, class: 'grid grid-cols-2 selection-none', inert: true }, [
                            h('div', { class: '-mx-16 scale-85' }, [annotation.renderAsVnode('en')]),
                            h('div', { class: '-mx-16 scale-85' }, [annotation.renderAsVnode('fr')]),
                        ]),

                        annotation.state._unlocked ? h(AnnotationEditor, {
                            annotation,
                            canMoveUp: i !== 0,
                            canMoveDown: i !== this.pbomlDocument.annotations.length - 1,
                            onDelete: () => {
                                this.pbomlDocument.annotations.splice(this.pbomlDocument.annotations.indexOf(annotation), 1);
                                this.renumberSlices();
                            },
                            onMove: (direction, e) => {
                                const from = i;
                                const to = direction === 'up' ? from - 1 : from + 1;
                                const el = this.pbomlDocument.annotations.splice(from, 1)[0];
                                this.pbomlDocument.annotations.splice(to, 0, el);

                                if (e && e.target) {
                                    const targetEl = e.target;
                                    console.log("targetEl", targetEl)
                                    this.$nextTick(() => {
                                        targetEl.scrollIntoView({
                                            behavior: 'smooth',
                                        })
                                    })
                                }

                                this.renumberSlices()

                            },
                            'readonlyId': this.keepOrganized
                        }) : null,
                    ]),
                    // Add a soft button after each slice except the last one
                    i === (this.pbomlDocument.annotations.length - 1) ? null : h(AnnotationsEditorNewButton, { soft: true, "onClick": (e) => this.pushNewAnnotation(e, i + 1) })

                ]
            }),

            // Always follow slice list with a hard button
            h(AnnotationsEditorNewButton, { soft: this.pbomlDocument.annotations.length ? true : false, "onClick": (e) => this.pushNewAnnotation(e) }),

        ])

    }

}