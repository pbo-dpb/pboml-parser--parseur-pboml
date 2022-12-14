import PBOMLDocument from "../../../models/PBOMLDocument";

export default class PdfRenderer {
    /**
     * This static variable indicates if a PDF render was provided. A PDF renderer (such as the one
     * presented in this project's /.lambda-render-to-pdf-function/index.js) URL must be provided
     * as a URL parameter for the PDF Renderer functions to be available. Other optional
     * parameters defined in the example function (salt, expiration and signature) will
     * also be retrieved and passed on from URL params if present.
     */
    static get canRenderPdf() {
        return PdfRenderer.pdfRendererUrl ? true : false;
    }

    static get pdfRendererUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('renderer-url');
    }

    constructor(pbomlDocument, requestedType) {
        this.pbomlDocument = pbomlDocument;
        this.requestedType = requestedType;
    }


    download(callback) {
    }

    get ready() {
        return false
    }
}