import PBOMLDocument from "../../../models/PBOMLDocument";
import { PDFDocument } from 'pdf-lib'

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
        this.errors = {
            en: null,
            fr: null,
            null: null
        }
    }




    async _retrieveVersion(yaml, language) {

        let body = {
            signature: PdfRenderer.pdfRendererParams.signature,
            salt: PdfRenderer.pdfRendererParams.salt,
            expiration: PdfRenderer.pdfRendererParams.expiration,
            language,
            input: yaml
        };

        const response = await fetch(PdfRenderer.pdfRendererParams.url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            this.versions[language] = arrayBuffer;
        } else {
            this.errors[language] = await response.text();
        }

    }

    async _mergePdfs(pdfs, outputKey) {

        const mergedPdf = await PDFDocument.create();

        for (let document of pdfs) {
            if (!document) continue;
            document = await PDFDocument.load(document);

            const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        this.versions[outputKey] = new Uint8Array(await mergedPdf.save());
    }

    async _setYamlInPdfMetadata(yaml, language) {
        if (!this.versions[language]) return;

        const pdfDoc = await PDFDocument.load(this.versions[language]);
        pdfDoc.setSubject(yaml);
        this.versions[language] = new Uint8Array(await pdfDoc.save());
    }

    async fetchVersions() {

        if (!PdfRenderer.canRenderPdf) throw "Renderer URL is undefined (pass through `&renderer-url=` URL parameter).";
        const yaml = this.pbomlDocument.serialize()
        await Promise.all([this._retrieveVersion(yaml, 'en'), this._retrieveVersion(yaml, 'fr')]);

        await this._mergePdfs([this.versions.en, this.versions.fr], 'null');
        for (const [key, value] of Object.entries(this.versions)) {
            await this._setYamlInPdfMetadata(yaml, key);
        }

    }


    download(language) {

        const blob = new Blob([this.versions[language ? language : null]], { type: 'application/pdf' });
        const shadowHyperlink = document.createElement("a");
        document.body.appendChild(shadowHyperlink);
        shadowHyperlink.style = "display: none";
        const url = window.URL.createObjectURL(blob);
        shadowHyperlink.href = url;
        shadowHyperlink.download = `${this.pbomlDocument.id}${this.style === 'preprint' ? '__PRE_' : ''}_${language ? language : 'b'}.pdf`;
        shadowHyperlink.setAttribute('aria-hidden', true);
        shadowHyperlink.click();
        window.URL.revokeObjectURL(url);

    }

    get ready() {
        return Object.values(this.versions).every(v => v ? true : false);
    }
}