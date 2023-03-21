import Slice from "../../models/contents/Slice"
export default class {

    constructor() {
        this.observers = {}
    }


    emitEventForSlice(slice) {
        const event = new CustomEvent("pboml-renderer-intersection-visible", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
                anchor: slice.anchor
            }
        });
        document.dispatchEvent(event);
    }

    startObservingForSlice(rendererEl, slice) {

        const sliceId = slice.anchor;

        if (!sliceId || this.observers[sliceId]) return;

        const element = rendererEl.querySelector(`#${sliceId}`);

        if (!element) return;
        new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.intersectionRatio === 1) {
                    this.emitEventForSlice(slice);
                }
            });
        }, {
            threshold: 1.0,
        }).observe(element);

    }

    stopObserving() {
        for (const [key, value] of Object.entries(this.observers)) {
            value.disconnect();
            delete this.observers[key];
        }
    }
}