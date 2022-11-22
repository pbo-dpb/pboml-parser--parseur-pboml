import { EquidistantColorPalette } from "./ColourPalettes";
import Color from "color";

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

    colorForIndex(index, emphasize) {
        let colorForIndex = this.colorPalette[index];
        let color = colorForIndex ? colorForIndex : "#666666";

        return Color(color).saturate(emphasize ? 1 : 0).darken(emphasize ? 0.5 : (emphasize === false ? -0.25 : 0)).hex();
    }

    convertToGraphjsDataStructure() {
        throw new Error("Method is not implemented.");
    }
}