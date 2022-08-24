import PBOMLDocument from "../../models/PBOMLDocument";
import { jsPDF } from "jspdf";

export default class PdfRenderer {
    constructor(pbomlDocument, doms) {
        this.pbomlDocument = pbomlDocument;
        this.doms = doms;
    }

    generatePdf(language) {

        const doc = new jsPDF({
            format: 'letter',
        });

        doc.html(`
        <div class=' pb-4 flex flex-row items-center justify-between gap-4'>
            <div class="text-4xl">${this.pbomlDocument.type[language]}</div>
            <span class="text-red-800 text-4xl text-right font-bold ">EMBARGO</span>
        </div>
        <figure style='letter-spacing: 1px;'>${this.doms[language].innerHTML}</figure>
        <div class='text-sm font-semibold text-center mt-4 text-gray-800' style='letter-spacing: 1px;'>${this.pbomlDocument.copyright[language]}</div>
        `, {
            x: 20,
            y: 20,
            width: 180,
            callback: function (doc) {
                doc.save();
            },
            windowWidth: 1024,
        });
    }

    download() {
        this.generatePdf("en");
        this.generatePdf("fr");
    }
}