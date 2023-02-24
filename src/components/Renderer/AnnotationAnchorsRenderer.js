/**
 * This object will parse the rendered DOM looking for anchors (eg. [^my_annotation]) to a given PBOMLDocument's
 * annotations, and replace them with a stylized link.
 * This renderer is not intendend to be permanently used and should eventually be replace by Vue components
 * loaded while parsing Markdown (and not after Vue has generated the DOM).
 */
export default class AnnotationAnchorsRenderer {
    constructor(mainEl, annotations) {
        this.mainEl = mainEl;
        this.annotations = annotations
    }


    render() {

        this.annotations.forEach(annotation => {

            this.mainEl.querySelectorAll(".pboml-prose").forEach(el => {
                el.innerHTML = el.innerHTML.replaceAll(`[^${annotation.id}]`, annotation.anchorHtml)
            })

        });

    }

}