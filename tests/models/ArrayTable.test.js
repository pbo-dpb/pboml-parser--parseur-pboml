import { describe, it, expect } from "vite-plus/test";
import * as yaml from "js-yaml";
import ArrayTable from "../../src/models/contents/ArrayTable/ArrayTable";
import ChartSlice from "../../src/models/contents/ChartSlice";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { plain } from "../helpers";

const payload = () => ({
    arraytable: [
        ["_name_", "_salary_"],
        ["Mike", 35000],
        ["Bob", { data: 37000, emphasize: true }],
    ],
    axes: { x: { label: "_name_" } },
    colors: ["#000000"],
    strings: {
        en: { _name_: "Name", _salary_: "Salary" },
        fr: { _name_: "Nom", _salary_: "Salaire" },
    },
    chart_type: "line",
});

describe("ArrayTable", () => {
    it("reads the table, axes, colours and strings", () => {
        const table = new ArrayTable(payload());
        expect(table.arraytable).toHaveLength(3);
        expect(table.axes).toEqual({ x: { label: "_name_" } });
        expect(table.colors).toEqual(["#000000"]);
        expect(table.strings.fr._name_).toBe("Nom");
    });

    it("turns chart_type into a one-item list of types", () => {
        expect(new ArrayTable(payload()).types).toEqual(["line"]);
    });

    it("uses chart_types as given", () => {
        const table = new ArrayTable({
            arraytable: [],
            chart_types: ["bar", "line"],
        });
        expect(table.types).toEqual(["bar", "line"]);
    });

    it("defaults to a bar chart", () => {
        expect(new ArrayTable({ arraytable: [] }).types).toBe("bar");
    });

    it("sets missing fields to null", () => {
        const table = new ArrayTable({});
        expect(table.arraytable).toBeNull();
        expect(table.axes).toBeNull();
        expect(table.colors).toBeNull();
    });

    it("replaces string placeholders for the chosen language", () => {
        const table = new ArrayTable(payload());
        expect(table.localizeRecursively(table.arraytable, "fr")[0]).toEqual([
            "Nom",
            "Salaire",
        ]);
        expect(table.localizeRecursively(table.axes, "en")).toEqual({
            x: { label: "Name" },
        });
    });

    it("does not replace partial matches", () => {
        const table = new ArrayTable(payload());
        expect(table.localizeRecursively(["my _name_ here"], "en")).toEqual([
            "my _name_ here",
        ]);
    });

    // KNOWN BUG: Object.entries(undefined) throws when a chart has no
    // `strings` for the language, which breaks the text version of the chart.
    it.fails("works when no strings are defined", () => {
        const table = new ArrayTable({ arraytable: [["a"], [1]] });
        expect(table.localizeRecursively(table.arraytable, "en")).toEqual([
            ["a"],
            [1],
        ]);
    });
});

describe("ChartSlice with an arraytable", () => {
    it("builds an ArrayTable instead of a DataTable", () => {
        const slice = new ChartSlice({ type: "chart", arraytable: payload() });
        expect(slice.arraytable).toBeInstanceOf(ArrayTable);
        expect(slice.datatable).toBeUndefined();
    });

    // KNOWN BUG: ArrayTable has no toArray(), and ChartSlice.toArray()
    // returns the instance as-is. The saved shape no longer matches the input
    // (e.g. chart_type becomes `types`), so the chart type is lost on reload.
    it.fails("serializes the arraytable back to its original shape", () => {
        const slice = new ChartSlice({ type: "chart", arraytable: payload() });
        expect(plain(slice.toArray().arraytable)).toEqual(plain(payload()));
    });

    it.fails("keeps the chart type after save and reload", () => {
        const doc = new PBOMLDocument([
            {
                pboml: { version: "1.0.0" },
                slices: [{ type: "chart", arraytable: payload() }],
            },
        ]);
        const reloaded = PBOMLDocument.initFromYaml(doc.serialize());
        expect(reloaded.slices[0].arraytable.types).toEqual(["line"]);
    });

    // KNOWN BUG: js-yaml refuses to dump the ArrayTable instance, so saving
    // a document with an arraytable chart throws.
    it.fails("can be saved to YAML", () => {
        const slice = new ChartSlice({ type: "chart", arraytable: payload() });
        expect(() => yaml.dump(slice.toArray())).not.toThrow();
    });
});
