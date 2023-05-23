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
        if (!this.annotations) return;
        this.annotations.forEach(annotation => {

            if (!this.mainEl) return;

            this.mainEl.querySelectorAll(".pboml-prose").forEach(el => {
                while (el.innerHTML.includes(`[^${annotation.id}]`)) {
                    el.innerHTML = el.innerHTML.replace(`[^${annotation.id}]`, annotation.getAnchorDomElement().outerHTML)
                }

            })


        });

    }

}