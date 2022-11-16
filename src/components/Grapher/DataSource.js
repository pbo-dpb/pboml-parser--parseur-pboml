
export default class DataSource {
    constructor(types) {
        if (this.constructor == DataSource) {
            throw new Error("Abstract class is not meant be instantiated.");
        }

        if (Array.isArray(types)) {
            this.types = types;
        } else {
            this.types = [types];
        }

    }

    convertToGraphjsDataStructure() {
        throw new Error("Method is not implemented.");
    }
}