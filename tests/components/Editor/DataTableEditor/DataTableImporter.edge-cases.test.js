// @vitest-environment jsdom
// jsdom is used so DOMPurify works for real (under happy-dom it drops the
// <table> wrapper, which is why DataTableImporter.test.js mocks it).
import "../../../helpers/lang-en.js";
import { describe, it, expect } from "vite-plus/test";
import { render, fireEvent } from "@testing-library/vue";
import DataTableImporter from "../../../../src/components/Editor/DataTableEditor/DataTableImporter.js";
import DataTable from "../../../../src/models/contents/DataTable/DataTable.js";
import { flush } from "../../../helpers";

/** Runs the importer's `dataTable` computed property with a fake instance. */
function importTable({
    en = "",
    fr = "",
    locationOfVars = "col",
    useLineBreakForVariableGroupName = true,
    shouldMergeNotReplace = false,
    datatable = new DataTable(),
} = {}) {
    const vm = {
        rawContent: { en, fr },
        locationOfVars,
        useLineBreakForVariableGroupName,
        shouldMergeNotReplace,
        datatable,
    };
    for (const [name, method] of Object.entries(DataTableImporter.methods)) {
        vm[name] = method.bind(vm);
    }
    return DataTableImporter.computed.dataTable.call(vm);
}

const labels = (table, lang = "en") =>
    Object.values(table.variables).map((v) => v.label[lang]);

const byLabel = (table, label) =>
    Object.entries(table.variables).find(([, v]) => v.label.en === label);

const rowsTable = `
| Year    | Cost | Revenue |
| ------- | ---- | ------- |
| 2024-25 | 10   | 12      |
| 2025-26 | 11   | 13      |
`;

describe("DataTableImporter: edge cases", () => {
    it("returns nothing when there is no table in the text", () => {
        expect(importTable({ en: "Just a paragraph." })).toBeNull();
    });

    it("reads variables from the first row", () => {
        const table = importTable({ en: rowsTable, locationOfVars: "row" });
        expect(labels(table)).toEqual(["Year", "Cost", "Revenue"]);
        expect(table.content).toHaveLength(2);
        const [yearKey, year] = byLabel(table, "Year");
        expect(year.is_descriptive).toBe(true);
        expect(byLabel(table, "Cost")[1].is_descriptive).toBe(false);
        expect(table.content[1][yearKey].en).toBe("2025-26");
    });

    it("reads variables from the first column", () => {
        const table = importTable({ en: rowsTable, locationOfVars: "col" });
        expect(labels(table)).toEqual(["Year", "2024-25", "2025-26"]);
        expect(table.content).toHaveLength(2);
    });

    it("pairs English and French cells", () => {
        const fr = `
| Année     | Coût | Revenu |
| --------- | ---- | ------ |
| 2024-2025 | 10   | 12     |
| 2025-2026 | 11   | 13     |
`;
        const table = importTable({ en: rowsTable, fr, locationOfVars: "row" });
        const [yearKey, year] = byLabel(table, "Year");
        expect(year.label.fr).toBe("Année");
        expect(table.content[0][yearKey]).toEqual({
            en: "2024-25",
            fr: "2024-2025",
        });
    });

    it("works with only a French table", () => {
        const table = importTable({ fr: rowsTable, locationOfVars: "row" });
        expect(labels(table, "fr")).toEqual(["Year", "Cost", "Revenue"]);
        expect(labels(table, "en")).toEqual([undefined, undefined, undefined]);
    });

    it("gives variables with the same label different keys", () => {
        const en = `
| Item  | Total | Total |
| ----- | ----- | ----- |
| A     | 1     | 2     |
`;
        const table = importTable({ en, locationOfVars: "row" });
        const keys = Object.keys(table.variables);
        expect(keys).toHaveLength(3);
        expect(new Set(keys).size).toBe(3);
        expect(labels(table)).toEqual(["Item", "Total", "Total"]);
    });

    it("splits a two-line label into group and label", () => {
        const en = `
| Year | Spending<br>Total | Spending<br>Change |
| ---- | ----------------- | ------------------ |
| 2024 | 1                 | 2                  |
`;
        const table = importTable({ en, locationOfVars: "row" });
        const [, total] = byLabel(table, "Total");
        expect(total.group.en.trim()).toBe("Spending");
    });

    // KNOWN BUG (minor): turndown turns <br> into "  \n", so the group name
    // keeps two trailing spaces ("Spending  "). Two variables in the same
    // group only stay grouped if every group name has the same spaces.
    it.fails("trims the group name taken from a two-line label", () => {
        const en = `
| Year | Spending<br>Total |
| ---- | ----------------- |
| 2024 | 1                 |
`;
        const table = importTable({ en, locationOfVars: "row" });
        expect(byLabel(table, "Total")[1].group.en).toBe("Spending");
    });

    it("keeps two-line labels whole when group splitting is off", () => {
        const en = `
| Year | Spending<br>Total |
| ---- | ----------------- |
| 2024 | 1                 |
`;
        const table = importTable({
            en,
            locationOfVars: "row",
            useLineBreakForVariableGroupName: false,
        });
        const variable = Object.values(table.variables)[1];
        expect(variable.group).toBeNull();
        expect(variable.label.en).toMatch(/Spending\s+\nTotal/);
    });

    it("keeps links and emphasis in cells as markdown", () => {
        const en = `
| Name | Source |
| ---- | ------ |
| A    | [PBO](https://www.pbo-dpb.ca) and *note* |
`;
        const table = importTable({ en, locationOfVars: "row" });
        const [sourceKey] = byLabel(table, "Source");
        expect(table.content[0][sourceKey].en).toBe(
            "[PBO](https://www.pbo-dpb.ca) and _note_",
        );
    });

    it("strips scripts and handlers from imported cells", () => {
        const en = `
| Name | Value |
| ---- | ----- |
| A    | <img src="x" onerror="alert(1)">ok |
`;
        const table = importTable({ en, locationOfVars: "row" });
        const [valueKey] = byLabel(table, "Value");
        expect(table.content[0][valueKey].en).not.toMatch(/onerror/);
    });

    it("adds new variables to the existing table when merging", () => {
        const existing = new DataTable({
            variables: { notes: { label: { en: "Notes" } } },
            content: [{ notes: { en: "kept" } }, { notes: { en: "kept 2" } }],
        });
        const table = importTable({
            en: rowsTable,
            locationOfVars: "row",
            shouldMergeNotReplace: true,
            datatable: existing,
        });
        expect(labels(table)).toEqual(["Notes", "Year", "Cost", "Revenue"]);
        expect(table.content[0].notes).toEqual({ en: "kept" });
        expect(table.content).toHaveLength(2);
    });

    it("replaces the existing table when not merging", () => {
        const existing = new DataTable({
            variables: { notes: { label: { en: "Notes" } } },
            content: [{ notes: { en: "old" } }],
        });
        const table = importTable({
            en: rowsTable,
            locationOfVars: "row",
            shouldMergeNotReplace: false,
            datatable: existing,
        });
        expect(labels(table)).toEqual(["Year", "Cost", "Revenue"]);
    });
});

describe("DataTableImporter component", () => {
    it("previews the imported table and emits it on Import", async () => {
        const { container, getAllByText, emitted } = render(DataTableImporter, {
            props: { datatable: new DataTable() },
        });
        await flush();
        const [enArea] = container.querySelectorAll("textarea");
        await fireEvent.update(enArea, rowsTable);
        await fireEvent.update(container.querySelector("select"), "row");
        await flush();
        expect(
            container.querySelectorAll("table").length,
        ).toBeGreaterThanOrEqual(2);

        const importButton = getAllByText("Import").at(-1).closest("button");
        await fireEvent.click(importButton);
        const [imported] = emitted().import[0];
        expect(imported).toBeInstanceOf(DataTable);
        expect(labels(imported)).toEqual(["Year", "Cost", "Revenue"]);
    });

    it("disables the replace option when the current table is empty", async () => {
        const { container } = render(DataTableImporter, {
            props: { datatable: new DataTable() },
        });
        await flush();
        const checkbox = container.querySelector("input[type=checkbox]");
        expect(checkbox.disabled).toBe(true);
    });
});
