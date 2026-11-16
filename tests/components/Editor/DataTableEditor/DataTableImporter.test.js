import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { marked } from "marked";

import DataTableImporter from "../../../../src/components/Editor/DataTableEditor/DataTableImporter.js";
import DataTable from "../../../../src/models/contents/DataTable/DataTable.js";
import MarkdownDriver from "../../../../src/MarkdownDriver.js";

// Under happy-dom, DOMPurify drops the <table> wrapper, so the importer would
// find no table. Skip sanitizing in these tests only, like
// MarkdownDriver.render() already does when NODE_ENV is "test".
beforeEach(() => {
    vi.spyOn(MarkdownDriver, "parseGenericMarkdown").mockImplementation(
        (markdown) => marked.parse(markdown),
    );
});
afterEach(() => {
    vi.restoreAllMocks();
});

/**
 * Runs the importer's `dataTable` computed property outside of Vue, using a
 * plain object as the component instance.
 */
function importTable({ en = "", fr = "", locationOfVars = "col" } = {}) {
    const vm = {
        rawContent: { en, fr },
        locationOfVars,
        useLineBreakForVariableGroupName: true,
        shouldMergeNotReplace: false,
        datatable: new DataTable(),
    };
    for (const [name, method] of Object.entries(DataTableImporter.methods)) {
        vm[name] = method.bind(vm);
    }
    return DataTableImporter.computed.dataTable.call(vm);
}

/** Returns the variable whose English label matches `label`. */
function findVariable(dataTable, label) {
    return Object.entries(dataTable.variables).find(
        ([, variable]) => variable.label.en === label,
    );
}

// Variables in the first column, one entry per year column.
const enTable = `
|         | 2024-25   | 2025-26 | 2026-27 |
| ------- | --------- | ------- | ------- |
| Revenue | 1,234.0   | 0.0     | 1.50    |
| Total   | **12.30** | -       |         |
`;

const frTable = `
|          | 2024-2025 | 2025-2026 | 2026-2027 |
| -------- | --------- | --------- | --------- |
| Revenus  | 1 234,0   | 0,0       | 1,50      |
| Total    | **12,30** | -         |           |
`;

describe("DataTableImporter keeps imported values as text", () => {
    it("never converts variables to the number type", () => {
        const dataTable = importTable({ en: enTable, fr: frTable });

        const types = Object.values(dataTable.variables).map((v) => v.type);
        expect(types.length).toBeGreaterThan(0);
        expect(types).not.toContain("number");
        types.forEach((type) => expect(type).toBe("markdown"));
    });

    it("keeps decimal places, including on zero values", () => {
        const dataTable = importTable({ en: enTable, fr: frTable });
        const [key] = findVariable(dataTable, "Revenue");

        expect(dataTable.content.map((entry) => entry[key])).toEqual([
            { en: "1,234.0", fr: "1 234,0" },
            { en: "0.0", fr: "0,0" },
            { en: "1.50", fr: "1,50" },
        ]);
    });

    it("keeps bold formatting on numeric values", () => {
        const dataTable = importTable({ en: enTable, fr: frTable });
        const [key] = findVariable(dataTable, "Total");

        expect(dataTable.content[0][key]).toEqual({
            en: "**12.30**",
            fr: "**12,30**",
        });
    });

    it("keeps dashes and empty cells as text instead of null", () => {
        const dataTable = importTable({ en: enTable, fr: frTable });
        const [key] = findVariable(dataTable, "Total");

        const dashCell = dataTable.content[1][key];
        expect(dashCell).not.toBeNull();
        expect(typeof dashCell.en).toBe("string");
        expect(dashCell.en.replace("\\", "")).toBe("-");

        expect(dataTable.content[2][key]).toEqual({ en: "", fr: "" });
    });

    it("keeps a column that only has numbers as text", () => {
        const dataTable = importTable({
            en: `
| Year | Amount |
| ---- | ------ |
| 2024 | 10.0   |
| 2025 | 0.00   |
`,
            locationOfVars: "row",
        });
        const [key, variable] = findVariable(dataTable, "Amount");

        expect(variable.type).toBe("markdown");
        expect(dataTable.content.map((entry) => entry[key].en)).toEqual([
            "10.0",
            "0.00",
        ]);
    });

    it("works with a single language", () => {
        const dataTable = importTable({ fr: frTable });
        const [key] = Object.entries(dataTable.variables).find(
            ([, variable]) => variable.label.fr === "Revenus",
        );

        expect(dataTable.content[1][key]).toEqual({
            en: undefined,
            fr: "0,0",
        });
    });

    it("stores the original text in the serialized table", () => {
        const dataTable = importTable({ en: enTable, fr: frTable });
        const [key] = findVariable(dataTable, "Revenue");
        const serialized = dataTable.toArray();

        // toArray() omits default values, and "markdown" is the default type.
        expect(serialized.variables[key].type ?? "markdown").toBe("markdown");
        expect(serialized.content[1][key]).toEqual({ en: "0.0", fr: "0,0" });
    });

    it("renders the value as written", () => {
        const dataTable = importTable({ en: enTable, fr: frTable });
        const [revenueKey, revenue] = findVariable(dataTable, "Revenue");
        const [totalKey, total] = findVariable(dataTable, "Total");

        const zeroCell = revenue.getTableCellVnode(
            dataTable.content[1][revenueKey],
            null,
            "en",
        );
        expect(zeroCell.props.innerHTML).toContain("0.0");

        const frenchCell = revenue.getTableCellVnode(
            dataTable.content[0][revenueKey],
            null,
            "fr",
        );
        expect(frenchCell.props.innerHTML).toContain("1 234,0");

        const boldCell = total.getTableCellVnode(
            dataTable.content[0][totalKey],
            null,
            "en",
        );
        expect(boldCell.props.innerHTML).toContain("<strong>12.30</strong>");
    });
});
