import editorStrings from "../editor-strings";
import { h, defineAsyncComponent } from 'vue'
import SliceMetaEditor from "./SliceMetaEditor";

export default {
    props: ["slice"],
    render() {

        return h("div", {
            'class': 'border-t border-gray-300 text-sm mt-2 pt-2'
        },

            [
                h(SliceMetaEditor, { slice: this.slice, meta_type: 'alts' }),
                h(SliceMetaEditor, { slice: this.slice, meta_type: 'sources' }),
                h(SliceMetaEditor, { slice: this.slice, meta_type: 'notes' })
            ]

        );

    }
}