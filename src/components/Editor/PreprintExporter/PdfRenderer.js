import PBOMLDocument from "../../../models/PBOMLDocument";
import { jsPDF } from "jspdf";

export default class PdfRenderer {
    constructor(pbomlDocument, doms) {
        this.pbomlDocument = pbomlDocument;
        this.doms = doms;
    }

    generatePdf(callback) {

        const doc = new jsPDF({
            format: 'letter',
        });

        doc.setProperties({
            subject: this.pbomlDocument.serialize(),
        });


        doc.html(`
        <div class=' pb-4 flex flex-row items-center justify-between gap-4'>
        <div class="flex flex-col gap-1">
        <span class="text-xl">
        ${this.pbomlDocument.type.en}</span>
        <span class="text-4xl" style="word-spacing: 0.25em;">${this.pbomlDocument.title.en}</span></div>
            <span class="text-red-800 text-4xl text-right font-bold ">EMBARGO</span>
        </div>
        <div class="text-sm text-gray-800">${this.pbomlDocument.localizedReleaseDate?.en ?? ''
            }</div>
        <figure style='letter-spacing: 1px;'>${this.doms.en.innerHTML}</figure>
        <div class='text-sm font-semibold text-center mt-4 text-gray-800' style='letter-spacing: 1px;'>${this.pbomlDocument.copyright.en} • Preprint • ${this.pbomlDocument.id}</div>

        <hr class='my-12'>

        <div class=' pb-4 flex flex-row items-center justify-between gap-4'>
            <div class="flex flex-col gap-1">
            <span class="text-xl">
            ${this.pbomlDocument.type.fr}</span>
            <span class="text-4xl" style="word-spacing: 0.25em;">${this.pbomlDocument.title.fr}</span></div>
            <span class="text-red-800 text-4xl text-right font-bold ">EMBARGO</span>
        </div>
        <div class="text-sm text-gray-800">${this.pbomlDocument.localizedReleaseDate?.fr ?? ''
            }</div>
        <figure style='letter-spacing: 1px;'>${this.doms.fr.innerHTML}</figure>


        <div class='text-sm font-semibold text-center mt-4 text-gray-800' style='letter-spacing: 1px;'>${this.pbomlDocument.copyright.fr} • Préimpression • ${this.pbomlDocument.id}</div>
        `, {
            x: 20,
            y: 20,
            width: 180,
            callback: (doc) => {
                doc.save(`${this.pbomlDocument.id}.pdf`);
                if (callback) callback()
            },
            windowWidth: 1024,
        });
    }

    download(callback) {
        this.generatePdf(callback);
    }
}