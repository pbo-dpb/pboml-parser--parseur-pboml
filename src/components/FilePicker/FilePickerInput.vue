<template>

    <div class="flex flex-col gap-2" :class="{ 'bg-red-100': hasError }">
        <input type="file" if="pboml-file-picker" @change="handleFileInputChange" accept=".yaml,.pdf" />
        <label v-if="hasError" for="pboml-file-picker"
            class="flex flex-row items-center gap-2 text-sm font-semibold text-red-800">
            <strong>❗</strong>
            {{ hasError }}
        </label>
    </div>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import { PDFDocument } from 'pdf-lib'
import yaml from 'js-yaml'


export default {
    emits: ['pick'],
    data() {
        return {
            hasError: false
        }
    },

    methods: {
        unpackPbomlDocument(pboml) {

            let loadedPboml;
            try {
                loadedPboml = yaml.loadAll(pboml);
            } catch (e) {
                this.hasError = "Unable to open file: invalid yaml // Impossible d'ouvrir le fichier : yaml non conforme";
                return;
            }

            let pbomlDocument;
            try {
                pbomlDocument = new PBOMLDocument(loadedPboml);
            } catch (error) {
                this.hasError = "Unable to open file: invalid PBOML // Impossible d'ouvrir le fichier : PBOML non conforme";
                return;
            }


            this.$emit('pick', pbomlDocument);
        },

        readPdfWithPbomlFile(pdfFile) {
            new Promise((resolve, reject) => {
                var fr = new FileReader();
                fr.onload = () => {
                    resolve(fr.result)
                };
                fr.onerror = reject;
                fr.readAsArrayBuffer(pdfFile);
            }).then((arrayBuffer) => {
                const pdfDoc = PDFDocument.load(arrayBuffer, {
                    updateMetadata: false
                }).then(pdfDoc => {
                    const subjectContent = pdfDoc.getSubject();
                    if (!subjectContent)
                        this.hasError = "The PDF does not contain PBOML content // Le PDF ne contient pas de contenu PBOML";
                    this.unpackPbomlDocument(subjectContent);
                }, () => {
                    this.hasError = "Unable to open PDF // Impossible d'ouvrir le PDF";
                })
            }, () => {
                this.hasError = "Unable to open pdf file // Impossible d'ouvrir le fichier pdf";
            });

        },
        readPbomlFile(pbomlFile) {
            new Promise((resolve, reject) => {
                var fr = new FileReader();
                fr.onload = () => {
                    resolve(fr.result)
                };
                fr.onerror = reject;
                fr.readAsText(pdfFile);
            }).then((fileContent) => {
                this.unpackPbomlDocument(fileContent);
            }, () => {
                this.hasError = "Unable to open yaml file // Impossible d'ouvrir le fichier yaml";
            });
        },
        handleFileInputChange(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type === 'application/pdf') {
                return this.readPdfWithPbomlFile(file);
            } else if (file.type === "text/yaml") {
                return this.readPbomlFile(file);
            }

            this.hasError = "Invalid file type // Type de fichier non valide";
        }
    }
}
</script>