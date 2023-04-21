export default class DataTableEntry {
    constructor(payload) {

        if (!payload) {
            payload = {}
        }
        for (const [key, value] of Object.entries(payload)) {
            this[key] = value;
        }
    }
}