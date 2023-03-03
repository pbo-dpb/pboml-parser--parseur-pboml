import KvListSlice from "./contents/KvListSlice";
import MarkdownSlice from "./contents/MarkdownSlice";
import TableSlice from "./contents/TableSlice";
import HeadingSlice from "./contents/HeadingSlice";
import yaml from 'js-yaml'
import GraphSlice from "./contents/GraphSlice";
import Annotation from "./Annotation";
import PlainImageSlice from "./contents/PlainImageSlice";


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

        let counter = 0;
        this.slices = mainDocument.slices?.map((el) => {

            const sliceType = el.type;
            let sli;
            switch (sliceType) {
                case 'markdown':
                    sli = new MarkdownSlice(el);
                    break;
                case 'table':
                    sli = new TableSlice(el);
                    break;
                case 'kvlist':
                    sli = new KvListSlice(el);
                    break;
                case 'graph':
                    sli = new GraphSlice(el);
                    break;
                case 'heading':
                    sli = new HeadingSlice(el);
                    break;
                case 'plain_image':
                    sli = new PlainImageSlice(el);
                    break;
            }

            counter++;
            if (sli) {
                sli.state.sequence = counter;
                return sli;
            }

        }).filter(n => n);


        let i = 0;
        this.annotations = mainDocument.annotations?.map((el) => {
            i++;
            let ant = new Annotation(el);
            ant.state.sequence = i;
            return ant
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
            slices: this.slices.map(sl => sl.toArray()),
            annotations: this.annotations?.map(an => an.toArray()) ?? []
        }

        documents.push(mainDocument);
        this.otherDocuments.forEach(dc => documents.push(dc));
        return documents;
    }



    serialize() {
        return this.toArray().map(doc => yaml.dump(doc)).join('---\n');
    }

    addSlice(slice) {
        this.slices.push(slice);
    }
}