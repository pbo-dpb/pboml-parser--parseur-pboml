import { h, defineAsyncComponent } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";
import MarkdownDriver from '../../MarkdownDriver';

export default class HeadingSliceHtmlRenderer extends SliceHtmlRenderer {

    renderReadonlyVnode(language) {

        let headingElType = `h${2 + this.slice.level}`;
        let classes = ['font-thin'];

        switch (this.slice.level) {
            case 0:
                classes.push('text-3xl border-b  border-gray-300 dark:border-gray-700');
                break;
            case 1:
                classes.push('text-2xl border-b  border-gray-300 dark:border-gray-700');
                break;
            case 2:
                classes.push('text-xl border-b  border-gray-100 dark:border-gray-800');
                break;
            case 3:
                classes.push('italic border-b border-gray-100 dark:border-gray-800');
                break;
        }

        const md = new MarkdownDriver;
        md.shouldRenderInline(true);
        return h(headingElType, { class: classes.join(' ') }, [
            this.slice.referenced_as?.[language] ? h('span', { class: 'opacity-70 font-normal mr-4 tracking-tight' }, this.slice.referenced_as[language]) : null,
            h('span', { innerHTML: md.render(this.slice.content[language]) })
        ]);
    }


}