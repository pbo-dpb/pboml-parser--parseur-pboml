import { EquidistantColorPalette } from "./ColourPalettes";
import Color from "color";

export default class ArraytableDataSource {

    constructor(types, arraytable) {

        if (Array.isArray(types)) {
            this.types = types;
        } else {
            this.types = [types];
        }

        this.colorPalette = EquidistantColorPalette;
        this.arraytable = arraytable;
    }

    colorForIndex(index, emphasize) {
        let colorForIndex = this.colorPalette[index];
        let color = colorForIndex ? colorForIndex : "#666666";

        return Color(color).saturate(emphasize ? 1 : 0).darken(emphasize ? 0.5 : (emphasize === false ? -0.25 : 0)).hex();
    }

    /**
     * Convert an array arraytable. Exemple format for a bar or line chart: 
     * [
            ['Employee Name', 'Salary 2022', 'Salary 2023'],
            ['Mike', 35000, 35000],
            ['Bob', 35000, 37000],
            ['Alice', 44000, 47000],
            ['Frank', 27000, 30000],
            ['Floyd', 92000, 97000],
            ['Fritz', 18500, 25000]
        ]
        
     */
    convertArrayToGraphjsDataStructure() {
        let arraytable = JSON.parse(JSON.stringify(this.arraytable));

        let datasetsRow = arraytable.shift();
        let datasetsLabelsInfo = datasetsRow.shift();
        let dataLabels = arraytable.map((dataRow) => dataRow.shift());

        let datasets = datasetsRow.map((label, index) => {
            let data = arraytable.map((dataRow) => dataRow.shift());
            let datasetdata = data.map((v) => (v?.data ? v.data : v));
            let emphasizes = data.map((v) => (v?.emphasize ? true : false));
            const hasEmphasizedContent = emphasizes.filter(Boolean).length;

            const datasetType = this.types[index] ? this.types[index] : this.types[0];

            let datasetInfo = {
                type: datasetType,
                label: label,
                data: datasetdata,
                backgroundColor: this.colorForIndex(index),
                borderColor: this.colorForIndex(index),
            }

            if (datasetType === 'line') {
                const pointColors = emphasizes.map(e => this.colorForIndex(index, e ? true : (hasEmphasizedContent ? false : undefined)));
                datasetInfo.pointBackgroundColor = pointColors;
                datasetInfo.pointBorderColor = pointColors;
                datasetInfo.pointStyle = emphasizes.map(e => e ? 'triangle' : 'circle')
                datasetInfo.radius = emphasizes.map(e => e ? 8 : 5)
            } else if (datasetType === 'bar') {
                datasetInfo.backgroundColor = emphasizes.map(e => this.colorForIndex(index, e ? true : (hasEmphasizedContent ? false : undefined)));
                datasetInfo.borderColor = emphasizes.map(e => Color(this.colorForIndex(index, e ? true : (hasEmphasizedContent ? false : undefined))).darken(e ? 1 : 0).hex());
            }

            return datasetInfo
        });

        let data = {
            labels: dataLabels,
            datasets: datasets
        }


        return data;
    }

    /**
     * Create a graph.js compatible data structure. Eg.:
     * {
        labels: ['Mike', 'Bob', 'Alice', 'Frank', 'Floyd', 'Fritz'],
        datasets: [
            {
            label: 'Salary 2022',
            data: [35000, 35000, 44000, 27000, 92000, 18500],
            }
        (...)
        ]
        }
     */
    convertToGraphjsDataStructure() {
        if (Array.isArray(this.arraytable)) {
            return this.convertArrayToGraphjsDataStructure();
        }

    }
}