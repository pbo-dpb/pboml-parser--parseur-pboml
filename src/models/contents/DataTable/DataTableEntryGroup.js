
/**
 * This model provides a structure for a group of DataTableEntry objects. These are used to group entries
 * in a DataTable. Each group has a label and a span. The span is used to determine how many columns the group
 * should span in the table while the label is used to provide a title for the group.
 */
export default class DataTableEntryGroup {
    static defaults = {
        span: 1,
        label: {}
    }

    constructor(payload) {

        if (!payload) {
            payload = {}
        }

        for (const [key, value] of Object.entries(payload)) {
            this[key] = value;
        }

        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }

        this.span = payload?.span ? parseInt(payload.span) : DataTableEntryGroup.defaults.span

    }


    toArray() {

        let arrayout = {
            label: {
                en: this.label?.en,
                fr: this.label?.fr
            },
            span: this.span,
        }
        for (const [key, value] of Object.entries(this)) {
            arrayout[key] = value;
        }

        // Remove default values from  output
        for (const [key, value] of Object.entries(DataTableEntryGroup.defaults)) {
            if (arrayout[key] == value) {
                delete arrayout[key];
            }
        }

        if (!arrayout.label?.en && !arrayout.label?.fr) {
            delete arrayout.label;
        }

        return arrayout
    }
}