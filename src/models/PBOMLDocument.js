export default class PBOMLDocument {
    constructor(payload) {
        this.version = payload.find(element => element.pboml?.version)?.pboml.version;
    }
}