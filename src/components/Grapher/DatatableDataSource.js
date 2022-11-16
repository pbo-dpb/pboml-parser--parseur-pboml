import DataSource from "./DataSource";

export default class DatatableDataSource extends DataSource {
    constructor(types, datatable) {
        super(types);
        this.datatable = datatable;
    }

    /**
     * Convert an array datatable. Exemple format: 
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
        let datatable = JSON.parse(JSON.stringify(this.datatable));

        let datasetsRow = datatable.shift();
        let datasetsLabelsInfo = datasetsRow.shift();
        let dataLabels = datatable.map((dataRow) => dataRow.shift());

        let datasets = datasetsRow.map((label, index) => {
            let data = datatable.map((dataRow) => dataRow.shift());

            return {
                type: this.types[index] ? this.types[index] : this.types[0],
                label: label,
                data: data
            }
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
        if (Array.isArray(this.datatable)) {
            return this.convertArrayToGraphjsDataStructure();
        }

    }
}