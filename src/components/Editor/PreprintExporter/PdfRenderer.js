import PBOMLDocument from "../../../models/PBOMLDocument";

export default class PdfRenderer {
    /**
     * This static variable indicates if a PDF render was provided. A PDF renderer (such as the one
     * presented in this project's /.lambda-render-to-pdf-function/index.js) URL must be provided
     * as a URL parameter for the PDF Renderer functions to be available. Other optional
     * parameters defined in the example function (renderer-salt, renderer-expiration 
     * and renderer-signature) will also be retrieved and passed on from URL params 
     * if present.
     */
    static get canRenderPdf() {
        return PdfRenderer.pdfRendererParams.url ? true : false;
    }

    static get pdfRendererParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            url: params.get('renderer-url'),
            signature: params.get('renderer-signature'),
            salt: params.get('renderer-salt'),
            expiration: params.get('renderer-expiration')
        };
    }

    constructor(pbomlDocument, requestedType) {
        this.pbomlDocument = pbomlDocument;
        this.requestedType = requestedType;
        this.versions = {
            en: null,
            fr: null,
            null: true
        }
    }


    async _retrieveVersion(language) {



        let body = {
            signature: PdfRenderer.pdfRendererParams.signature,
            salt: PdfRenderer.pdfRendererParams.salt,
            expiration: PdfRenderer.pdfRendererParams.expiration,
            language,
            input: this.pbomlDocument.serialize()
        };

        const response = await fetch(PdfRenderer.pdfRendererParams.url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const blob = await response.blob();
        this.versions[language] = blob;


    }

    async fetchVersions() {

        if (!PdfRenderer.canRenderPdf) throw "Renderer URL is undefined (pass through `&renderer-url=` URL parameter).";

        await Promise.all([this._retrieveVersion('en'), this._retrieveVersion('fr')]);

    }


    download(language) {

        const shadowHyperlink = document.createElement("a");
        document.body.appendChild(shadowHyperlink);
        shadowHyperlink.style = "display: none";
        const url = window.URL.createObjectURL(this.versions[language]);
        shadowHyperlink.href = url;
        shadowHyperlink.download = `${this.pbomlDocument.id}${this.style === 'preprint' ? '__PRE_' : ''}_${language}.pdf`;
        shadowHyperlink.setAttribute('aria-hidden', true);
        shadowHyperlink.click();
        window.URL.revokeObjectURL(url);



    }

    get ready() {
        return Object.values(this.versions).every(v => v ? true : false);
    }
}