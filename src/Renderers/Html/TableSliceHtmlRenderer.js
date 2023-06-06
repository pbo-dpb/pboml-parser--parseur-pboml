import SliceHtmlRenderer from './SliceHtmlRenderer';


export default class TableSliceHtmlRenderer extends SliceHtmlRenderer {

    renderReadonlyVnode(language) {
        let vnodes = super.renderReadonlyVnode(language);
        vnodes.push(this.slice.datatable.renderReadonlyVnode(language))
        return vnodes;
    }

    renderAsVnode(language = document.documentElement.lang) {
        let parentVnode = super.renderAsVnode(language);
        parentVnode.props.class = `${parentVnode.props.class} break-inside-avoid-page`;
        return parentVnode;
    }


}