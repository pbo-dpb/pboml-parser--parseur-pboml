import KvListSlice from "./contents/KvListSlice";
import MarkdownSlice from "./contents/MarkdownSlice";
import TableSlice from "./contents/TableSlice";
import HeadingSlice from "./contents/HeadingSlice";
import yaml from 'js-yaml'
import Annotation from "./Annotation";
import BitmapSlice from "./contents/BitmapSlice";
import ChartSlice from "./contents/ChartSlice";
import SvgSlice from "./contents/SvgSlice";


export default class PBOMLDocument {

    static initFromYaml(yamlPayload, prefix = null) {
        let payload = yaml.loadAll(yamlPayload);
        return new PBOMLDocument(payload, prefix);
    }

    constructor(payload = [], prefix = null) {
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

            let sli = PBOMLDocument.provisionSliceFromPayload(el)

            counter++;
            if (sli) {
                sli.state.sequence = counter;
                sli.state.prefix = prefix;
                //sli.state.callbacks.move = (s) => this.handleSliceMove(s);
                //sli.state.callbacks.delete = (s) => this.handleSliceDelete(s);
                if (counter === 1) sli.state.canMoveUp = false;
                if (counter === mainDocument.slices.length) sli.state.canMoveDown = false;
                return sli;
            }

        }).filter(n => n) ?? [];

        try {
            this.annotations = mainDocument.annotations.map((el) => {
                let ant = new Annotation(el);
                ant.state.prefix = prefix;
                return ant
            }).filter(n => n).sort((a, b) => `${a.id}`.localeCompare(`${b.id}`, undefined, { numeric: true }));
        } catch (error) {
            this.annotations = []
        }


        this.state = {
            prefix
        }
    }

    static provisionSliceFromPayload(el) {
        const sliceType = el.type;
        switch (sliceType) {
            case 'markdown':
                return new MarkdownSlice(el);
            case 'table':
                return new TableSlice(el);
            case 'kvlist':
                return new KvListSlice(el);
            case 'chart':
                return new ChartSlice(el);
            case 'heading':
                return new HeadingSlice(el);
            case 'bitmap':
                return new BitmapSlice(el);
            case 'svg':
                return new SvgSlice(el);
        }
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
        this.resetSlicesMoveability();
    }

    scrollToSliceAtIndex(index) {
        let slice = this.slices[index];
        location.hash = slice.anchor
    }

    resetSlicesMoveability() {
        let counter = 0;
        this.slices.forEach((slice) => {
            counter++;
            slice.state.sequence = counter;
            slice.state.canMoveUp = counter > 1;
            slice.state.canMoveDown = this.slices.length > counter;
        })
    }

    moveSlice(slice, direction) {
        const from = slice.state.sequence - 1;
        const to = direction == 'up' ? from - 1 : from + 1;
        const el = this.slices.splice(from, 1)[0];
        this.slices.splice(to, 0, el);
        this.resetSlicesMoveability();
        this.scrollToSliceAtIndex(to);
    }

    deleteSlice(slice) {
        let nearestSlicePosition = slice.state.sequence;
        if (this.slices.length === nearestSlicePosition) {
            // Slice was last
            nearestSlicePosition = this.slices.length - 1;
        }
        this.slices.splice(slice.state.sequence - 1, 1);
        this.resetSlicesMoveability();

        if (nearestSlicePosition > 0) {
            this.scrollToSliceAtIndex(nearestSlicePosition - 1)
        }
    }

    duplicateSlice(slice) {
        let newSlice = PBOMLDocument.provisionSliceFromPayload(slice.toArray());
        this.addSlice(newSlice);
    }
}