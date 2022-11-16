import { EquidistantColorPalette } from "./ColourPalettes";

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

        this.colorPalette = EquidistantColorPalette;
    }

    colorForIndex(index) {
        let colorForIndex = this.colorPalette[index];

        return colorForIndex ? colorForIndex : "#666666"
    }

    convertToGraphjsDataStructure() {
        throw new Error("Method is not implemented.");
    }
}