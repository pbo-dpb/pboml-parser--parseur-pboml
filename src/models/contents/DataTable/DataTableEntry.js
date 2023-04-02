export default class DataTableEntry {
    constructor(payload, variables) {
        for (const [key, value] of Object.entries(payload)) {
            this[key] = value;
        }
    }
}