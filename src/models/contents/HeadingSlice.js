import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import MarkdownDriver from '../../MarkdownDriver';


export default class HeadingSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }

        // Zero indexed level; when rendered to HTML, will use 2+level (so 0 will render as h2, 1 as h3, etc. up to h6)
        this.level = payload.level ? payload.level : 0;
        this.type = "heading";
    }

    renderReadonlyVnode(language) {

        let headingElType = `h${2 + this.level}`;
        let classes = ['font-thin'];

        switch (this.level) {
            case 0:
                classes.push('text-3xl border-b-4 pb-1 border-gray-300 dark:border-gray-700');
                break;
            case 1:
                classes.push('text-2xl border-b-2 pb-1 border-gray-300 dark:border-gray-700');
                break;
            case 2:
                classes.push('text-xl border-b pb-1 border-gray-100 dark:border-gray-800');
                break;
            case 3:
                classes.push('italic border-b pb-1 border-gray-100 dark:border-gray-800');
                break;
        }

        const md = new MarkdownDriver;
        md.shouldBreakNewLines(false);
        md.shouldRenderInline(true);
        return h(headingElType, { class: classes.join(' ') }, [
            this.referenced_as?.[language] ? h('span', { class: 'opacity-70 font-normal mr-4 tracking-tight' }, this.referenced_as[language]) : null,
            h('span', { innerHTML: md.render(this.content[language]) })
        ]);
    }


    __buildEditorsVnode() {

        return [

            h('div', {}, [h(defineAsyncComponent(() => import('../../components/Editor/SliceReferenceEditor.js')), {
                'referenced_as': this.referenced_as,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.referenced_as.en = value.en;
                    this.referenced_as.fr = value.fr;
                }
            })]),

            ...(this.choices ? this._buildEditorChoicesInputVnode() : this._buildEditorInputVnodes())
        ];
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/HeadingSliceEditor.js')), { slice: this }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        delete array.display_label;
        delete array.label;
        delete array.presentation;
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }
        array.level = this.level;
        return array;
    }

}