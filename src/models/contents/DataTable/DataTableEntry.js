

export default class DataTableEntry {
    static defaults = {
        emphasize: false,
        tension: 0,
        skip_chart: false
    }

    constructor(payload) {

        if (!payload) {
            payload = {}
        }

        for (const [key, value] of Object.entries(payload)) {
            this[key] = value;
        }

        this.emphasize = payload?.emphasize ? payload.emphasize : DataTableEntry.defaults.emphasize
        this.skip_chart = payload?.skip_chart ? payload.skip_chart : DataTableEntry.defaults.skip_chart
        this.tensions = payload?.tension ? payload.tension : DataTableEntry.defaults.tension
    }


    toArray() {

        let arrayout = {}
        for (const [key, value] of Object.entries(this)) {
            arrayout[key] = value;
        }

        // Remove default values from  output
        for (const [key, value] of Object.entries(DataTableEntry.defaults)) {
            if (arrayout[key] == value) {
                delete arrayout[key];
            }
        }

        return arrayout
    }
}