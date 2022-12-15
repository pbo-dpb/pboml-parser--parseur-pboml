import KvListSlice from "./contents/KvListSlice";
import MarkdownSlice from "./contents/MarkdownSlice";
import TableSlice from "./contents/TableSlice";
import yaml from 'js-yaml'
import GraphSlice from "./contents/GraphSlice";


export default class PBOMLDocument {

    static initFromYaml(yamlPayload) {
        let payload = yaml.loadAll(yamlPayload);
        return new PBOMLDocument(payload);
    }

    constructor(payload = []) {
        const mainDocument = payload.find(element => element.pboml?.version);
        this.otherDocuments = payload.filter((dc) => dc != mainDocument);

        this.pbomlVersion = mainDocument?.pboml.version;

        if (!mainDocument || !this.pbomlVersion)
            throw "PBOML document is invalid : missing main document and/or PBOML version.";

        this.copyright = mainDocument.document?.copyright;
        this.form = mainDocument.document?.form;
        this.type = mainDocument.document?.type;

        this.id = mainDocument.document?.id;

        this.release_date = mainDocument.document?.release_date;
        if (this.release_date) {
            this.release_date = new Date(this.release_date);
        }

        this.title = mainDocument.document?.title;

        this.slices = mainDocument.slices?.map((el) => {

            const sliceType = el.type;
            switch (sliceType) {
                case 'markdown':
                    return new MarkdownSlice(el);
                case 'table':
                    return new TableSlice(el);
                case 'kvlist':
                    return new KvListSlice(el);
                case 'graph':
                    return new GraphSlice(el);
            }

        }).filter(n => n);
    }


    get localizedReleaseDate() {
        if (!this.release_date) return;
        return {
            fr: this.release_date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            en: this.release_date.toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    }

    toArray() {
        const documents = [];

        let mainDocument = {
            pboml: {
                version: "1.0.0"
            },
            document: {
                form: this.form,
                version: this.version,
                id: this.id,
                release_date: this.release_date ? this.release_date.toISOString() : null,
                title: {
                    en: this.title?.en,
                    fr: this.title?.fr
                },
                type: {
                    en: this.type?.en,
                    fr: this.type?.fr
                },
                copyright: {
                    en: this.copyright?.en,
                    fr: this.copyright?.fr
                }
            },
            slices: this.slices.map(sl => sl.toArray())
        }

        documents.push(mainDocument);
        this.otherDocuments.forEach(dc => documents.push(dc));
        return documents;
    }



    serialize() {
        return this.toArray().map(doc => yaml.dump(doc)).join('---\n');
    }
}