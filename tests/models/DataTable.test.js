import { describe, it, expect } from "vite-plus/test";
import DataTable from "../../src/models/contents/DataTable/DataTable";
import DataTableVariable from "../../src/models/contents/DataTable/DataTableVariable";
import DataTableEntry from "../../src/models/contents/DataTable/DataTableEntry";
import DataTableEntryGroup from "../../src/models/contents/DataTable/DataTableEntryGroup";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { loadSample, mountVnode } from "../helpers";

const costTable = () =>
    new DataTable({
        variables: {
            year: {
                label: { en: "Year", fr: "Année" },
                is_descriptive: true,
            },
            cost: {
                label: { en: "Cost", fr: "Coût" },
                type: "number",
                unit: { en: "$ millions", fr: "M$" },
            },
            revenue: {
                label: { en: "Revenue", fr: "Revenu" },
                type: "number",
                unit: { en: "$ millions", fr: "M$" },
            },
        },
        content: [
            { year: { en: "2024-25", fr: "2024-2025" }, cost: 10, revenue: 12 },
            { year: { en: "2025-26", fr: "2025-2026" }, cost: 11, revenue: 13 },
        ],
    });

describe("DataTable", () => {
    it("creates a DataTableVariable for each variable, keyed by name", () => {
        const table = costTable();
        expect(Object.keys(table.variables)).toEqual([
            "year",
            "cost",
            "revenue",
        ]);
        Object.entries(table.variables).forEach(([key, variable]) => {
            expect(variable).toBeInstanceOf(DataTableVariable);
            expect(variable.key).toBe(key);
        });
    });

    it("creates a DataTableEntry for each content row", () => {
        const table = costTable();
        expect(table.content).toHaveLength(2);
        table.content.forEach((row) =>
            expect(row).toBeInstanceOf(DataTableEntry),
        );
        expect(table.bodyRowsCount).toBe(2);
        expect(table.variableCount).toBe(3);
    });

    it("accepts a missing payload", () => {
        const table = new DataTable(undefined);
        expect(table.content).toEqual([]);
        expect(table.variables).toEqual({});
    });

    // KNOWN BUG (minor): `Symbol.iterator in content` throws a TypeError when
    // content or entrygroups is a number or string in the YAML.
    it.fails("ignores content that is not a list instead of crashing", () => {
        const table = new DataTable({ content: 5, entrygroups: "x" });
        expect(table.content).toEqual([]);
        expect(table.entrygroups).toEqual([]);
        expect(table.variables).toEqual({});
    });

    it("defaults presentation_style to prose and leaves it out when saving", () => {
        const table = costTable();
        expect(table.presentation_style).toBe("prose");
        expect(table.toArray()).not.toHaveProperty("presentation_style");
    });

    it("keeps a non-default presentation_style", () => {
        const table = new DataTable({ presentation_style: "accounting" });
        expect(table.toArray().presentation_style).toBe("accounting");
    });

    it("finds the first descriptive variable", () => {
        const table = costTable();
        expect(table.descriptiveVariableKey).toBe("year");
        expect(table.descriptiveVariableKeyPair[1].label.en).toBe("Year");
    });

    it("returns no descriptive variable when there is none", () => {
        const table = new DataTable({ variables: { a: {} } });
        expect(table.descriptiveVariableKeyPair).toEqual([null, null]);
    });

    it("uses one unit for the whole table when all variables share it", () => {
        expect(costTable().getWholeTableUnitForLanguage("en")).toBe(
            "$ millions",
        );
        expect(costTable().getWholeTableUnitForLanguage("fr")).toBe("M$");
    });

    it("has no whole-table unit when variables use different units", () => {
        const table = costTable();
        table.variables.revenue.unit = { en: "%", fr: "%" };
        expect(table.getAllUnitsUsedInTableForLanguage("en")).toEqual([
            "$ millions",
            "%",
        ]);
        expect(table.getWholeTableUnitForLanguage("en")).toBeNull();
    });

    it("ignores the unit of descriptive variables", () => {
        const table = costTable();
        table.variables.year.unit = { en: "years", fr: "années" };
        expect(table.getWholeTableUnitForLanguage("en")).toBe("$ millions");
    });

    it("groups consecutive variables that share a group name", () => {
        const table = new DataTable({
            variables: {
                label: { is_descriptive: true },
                a: { group: { en: "G1", fr: "G1" } },
                b: { group: { en: "G1", fr: "G1" } },
                c: { group: { en: "G2", fr: "G2" } },
                d: {},
            },
        });
        const groups = table.groupsMapForLanguage("en");
        expect(groups.map((g) => g.key)).toEqual(["G1", "G2", ""]);
        expect(Object.keys(groups[0].variables)).toEqual(["a", "b"]);
    });

    it("deletes a variable and its values from every row", () => {
        const table = costTable();
        table.deleteVariableWithKey("cost");
        expect(table.variables).not.toHaveProperty("cost");
        table.content.forEach((row) => expect(row).not.toHaveProperty("cost"));
    });

    it("serializes variables and content back to plain objects", () => {
        const out = costTable().toArray();
        expect(out.variables.cost).toMatchObject({
            label: { en: "Cost", fr: "Coût" },
            type: "number",
            unit: { en: "$ millions", fr: "M$" },
        });
        expect(out.content[0]).toEqual({
            year: { en: "2024-25", fr: "2024-2025" },
            cost: 10,
            revenue: 12,
        });
        expect(out).not.toHaveProperty("entrygroups");
    });

    it("serializes entry groups when present", () => {
        const table = new DataTable({
            entrygroups: [{ label: { en: "Past", fr: "Passé" }, span: "2" }],
        });
        expect(table.entrygroups[0]).toBeInstanceOf(DataTableEntryGroup);
        expect(table.entrygroups[0].span).toBe(2);
        expect(table.toArray().entrygroups).toEqual([
            { label: { en: "Past", fr: "Passé" }, span: 2 },
        ]);
    });

    it("keeps the leg0.yaml tables unchanged through toArray", () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const table = doc.slices.find((s) => s.type === "table");
        const again = new DataTable(table.datatable.toArray());
        expect(again.toArray()).toEqual(table.datatable.toArray());
    });
});

describe("DataTableVariable", () => {
    it("applies defaults", () => {
        const v = new DataTableVariable({}, "k");
        expect(v.type).toBe("markdown");
        expect(v.chart_type).toBe("bar");
        expect(v.level).toBe(0);
        expect(v.presentation_style).toBe("inherit");
        expect(v.skip_chart).toBe(false);
        expect(v.tension).toBe(0);
        expect(v.group).toBeNull();
        expect(v.unit).toBeNull();
    });

    it("fills missing group and unit languages with empty strings", () => {
        const v = new DataTableVariable(
            { group: { en: "G" }, unit: { fr: "%" } },
            "k",
        );
        expect(v.group).toEqual({ en: "G", fr: "" });
        expect(v.unit).toEqual({ en: "", fr: "%" });
    });

    it("leaves defaults, empty labels and empty bilingual values out when saving", () => {
        const out = new DataTableVariable(
            { unit: { en: "", fr: "" }, label: {} },
            "k",
        ).toArray();
        expect(out).not.toHaveProperty("type");
        expect(out).not.toHaveProperty("chart_type");
        expect(out).not.toHaveProperty("level");
        expect(out).not.toHaveProperty("presentation_style");
        expect(out).not.toHaveProperty("skip_chart");
        expect(out).not.toHaveProperty("unit");
        expect(out).not.toHaveProperty("label");
    });

    it("keeps non-default values when saving", () => {
        const out = new DataTableVariable(
            {
                type: "number",
                chart_type: "line",
                level: 2,
                skip_chart: true,
                emphasize: true,
                presentation_style: "accounting",
            },
            "k",
        ).toArray();
        expect(out).toMatchObject({
            type: "number",
            chart_type: "line",
            level: 2,
            skip_chart: true,
            emphasize: true,
            presentation_style: "accounting",
        });
    });

    // KNOWN BUG: `color` is never read from the payload (DataTableGrapher
    // uses variable.color), so a custom colour is ignored and lost on save.
    it.fails("reads and saves a custom chart colour", () => {
        const v = new DataTableVariable({ color: "#ff0000" }, "k");
        expect(v.color).toBe("#ff0000");
        expect(v.toArray().color).toBe("#ff0000");
    });

    // KNOWN BUG: `tension` is read but not included in toArray().
    it.fails("saves a non-default line tension", () => {
        const v = new DataTableVariable({ tension: 0.4 }, "k");
        expect(v.tension).toBe(0.4);
        expect(v.toArray().tension).toBe(0.4);
    });

    describe("generateUniqueDataTableVariableId", () => {
        it("makes a lowercase key from the group and label", () => {
            expect(
                DataTableVariable.generateUniqueDataTableVariableId(
                    "Total Cost",
                    null,
                    "Budget 2024",
                ),
            ).toBe("budget2024totalcost");
        });

        it("avoids existing keys", () => {
            const key = DataTableVariable.generateUniqueDataTableVariableId(
                "Cost",
                { cost: {} },
            );
            expect(key).not.toBe("cost");
            expect(key).toMatch(/cost$/);
        });

        it("avoids names reserved by DataTableEntry (e.g. emphasize)", () => {
            const key = DataTableVariable.generateUniqueDataTableVariableId(
                "Emphasize",
                {},
            );
            expect(key).not.toBe("emphasize");
        });

        it("always starts with a letter", () => {
            const key = DataTableVariable.generateUniqueDataTableVariableId(
                "2024",
                {},
            );
            expect(key).toMatch(/^[a-z]/);
        });
    });

    describe("table cells", () => {
        const cellHtml = async (
            variable,
            value,
            language = "en",
            emphasize = false,
            table = null,
        ) => {
            const { container } = await mountVnode(() =>
                variable.getTableCellVnode(
                    value,
                    null,
                    language,
                    emphasize,
                    table,
                ),
            );
            return container.querySelector("td, th");
        };

        it("formats numbers for the language", async () => {
            const v = new DataTableVariable({ type: "number" }, "k");
            expect((await cellHtml(v, 1234.5, "en")).textContent).toBe(
                "1,234.5",
            );
            expect((await cellHtml(v, 1234.5, "fr")).textContent).toMatch(
                /1\s234,5/,
            );
        });

        it("renders markdown in the right language", async () => {
            const v = new DataTableVariable({ type: "markdown" }, "k");
            const cell = await cellHtml(
                v,
                { en: "**Yes**", fr: "**Oui**" },
                "fr",
            );
            expect(cell.querySelector("strong").textContent).toBe("Oui");
        });

        it("marks empty cells for screen readers", async () => {
            const v = new DataTableVariable({ type: "number" }, "k");
            const cell = await cellHtml(v, null, "fr");
            expect(cell.querySelector(".sr-only").textContent).toBe(
                "Cellule vide",
            );
            expect(cell.className).toContain("bg-gray-100");
        });

        it("shows zero as a value, not as an empty cell", async () => {
            const v = new DataTableVariable({ type: "number" }, "k");
            const cell = await cellHtml(v, 0, "en");
            expect(cell.textContent).toBe("0");
            expect(cell.querySelector(".sr-only")).toBeNull();
        });

        it("highlights emphasized rows", async () => {
            const v = new DataTableVariable({ type: "number" }, "k");
            const cell = await cellHtml(v, 5, "en", true);
            expect(cell.className).toContain("bg-yellow-100");
        });

        // KNOWN BUG: uses `this.shouldEmphasizeCell` (always undefined)
        // instead of the local `shouldEmphasizeCell`.
        it.fails("uses a darker grey for empty cells in emphasized rows", async () => {
            const v = new DataTableVariable({ type: "number" }, "k");
            const cell = await cellHtml(v, null, "en", true);
            expect(cell.className).toContain("bg-gray-200");
        });

        it("inherits accounting style from the table", async () => {
            const v = new DataTableVariable({ type: "number" }, "k");
            const table = new DataTable({ presentation_style: "accounting" });
            const cell = await cellHtml(v, 5, "en", false, table);
            expect(cell.className).toContain("text-right");
            expect(cell.className).toContain("tabular-nums");
        });

        it("renders descriptive variables as header cells", async () => {
            const v = new DataTableVariable({ is_descriptive: true }, "k");
            const { container } = await mountVnode(() =>
                v.getTableCellVnode({ en: "2024" }, "col", "en"),
            );
            const th = container.querySelector("th");
            expect(th).not.toBeNull();
            expect(th.getAttribute("scope")).toBe("col");
        });
    });
});

describe("DataTableEntry", () => {
    it("keeps every value and leaves default flags out when saving", () => {
        const entry = new DataTableEntry({ a: 1, b: { en: "x" } });
        expect(entry.emphasize).toBe(false);
        expect(entry.toArray()).toEqual({ a: 1, b: { en: "x" } });
    });

    it("keeps emphasize and skip_chart when set", () => {
        const entry = new DataTableEntry({
            a: 1,
            emphasize: true,
            skip_chart: true,
        });
        expect(entry.toArray()).toEqual({
            a: 1,
            emphasize: true,
            skip_chart: true,
        });
    });

    it("accepts an empty payload", () => {
        expect(new DataTableEntry(null).toArray()).toEqual({});
    });
});

describe("DataTableEntryGroup", () => {
    it("defaults span to 1 and leaves it out when saving", () => {
        const group = new DataTableEntryGroup({ label: { en: "A" } });
        expect(group.span).toBe(1);
        expect(group.toArray()).toEqual({ label: { en: "A", fr: undefined } });
    });

    it("leaves out an empty label", () => {
        expect(new DataTableEntryGroup({ span: 3 }).toArray()).toEqual({
            span: 3,
        });
    });
});
