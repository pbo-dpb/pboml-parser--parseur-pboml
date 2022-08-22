import MarkdownSlice from "./contents/MarkdownSlice";
import TableSlice from "./contents/TableSlice";

export default class PBOMLDocument {
    constructor(payload) {
        const mainDocument = payload.find(element => element.pboml?.version);
        this.pbomlVersion = mainDocument.pboml.version;

        if (!mainDocument || !this.pbomlVersion)
            throw "PBOML document is invalid : missing main document and/or PBOML version.";

        this.copyright = mainDocument.document?.copyright;
        this.form = mainDocument.document?.form;
        this.type = mainDocument.document?.type;

        this.slices = mainDocument.slices?.map((el) => {

            const sliceType = el.type;
            switch (sliceType) {
                case 'markdown':
                    return new MarkdownSlice(el);
                case 'table':
                    return new TableSlice(el);
            }

        }).filter(n => n);

    }
}