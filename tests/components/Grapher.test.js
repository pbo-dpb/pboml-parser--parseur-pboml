import { describe, it, expect } from "vite-plus/test";
import ArrayTableDataSource from "../../src/components/Grapher/ArrayTableDataSource";
import ArrayTableGrapher from "../../src/components/Grapher/ArrayTableGrapher";
import DataTableGrapher from "../../src/components/Grapher/DataTableGrapher";
import ChartJsMixin from "../../src/components/Grapher/ChartJsMixin";
import { EquidistantColorPalette } from "../../src/components/Grapher/ColourPalettes";
import ArrayTable from "../../src/models/contents/ArrayTable/ArrayTable";
import DataTable from "../../src/models/contents/DataTable/DataTable";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { loadSample } from "../helpers";

/**
 * The graphers are Vue components that draw with Chart.js on a canvas.
 * These tests check the data and options they hand to Chart.js by calling
 * their computed properties with a minimal component context.
 */

const salaries = () => [
    ["Employee", "2022", "2023"],
    ["Mike", 35000, 35000],
    ["Bob", 35000, { data: 37000, emphasize: true }],
];

describe("ArrayTableDataSource", () => {
    it("uses the first row as dataset labels and the first column as x labels", () => {
        const data = new ArrayTableDataSource(
            "bar",
            salaries(),
        ).convertToGraphjsDataStructure();
        expect(data.labels).toEqual(["Mike", "Bob"]);
        expect(data.datasets.map((d) => d.label)).toEqual(["2022", "2023"]);
        expect(data.datasets[1].data).toEqual([35000, 37000]);
    });

    it("does not modify the source table", () => {
        const table = salaries();
        new ArrayTableDataSource("bar", table).convertToGraphjsDataStructure();
        expect(table).toEqual(salaries());
    });

    it("applies one type per dataset, falling back to the first", () => {
        const data = new ArrayTableDataSource(
            ["line"],
            salaries(),
        ).convertToGraphjsDataStructure();
        expect(data.datasets.map((d) => d.type)).toEqual(["line", "line"]);
        const mixed = new ArrayTableDataSource(
            ["bar", "line"],
            salaries(),
        ).convertToGraphjsDataStructure();
        expect(mixed.datasets.map((d) => d.type)).toEqual(["bar", "line"]);
    });

    it("gives each dataset a palette colour", () => {
        const data = new ArrayTableDataSource(
            "line",
            salaries(),
        ).convertToGraphjsDataStructure();
        expect(data.datasets[0].borderColor).toBe(
            EquidistantColorPalette[0].toUpperCase(),
        );
        expect(data.datasets[1].borderColor).toBe(
            EquidistantColorPalette[1].toUpperCase(),
        );
    });

    it("falls back to grey after the palette runs out", () => {
        const source = new ArrayTableDataSource("bar", []);
        expect(source.colorForIndex(99)).toBe("#666666");
    });

    it("highlights emphasized points on line charts", () => {
        const data = new ArrayTableDataSource(
            "line",
            salaries(),
        ).convertToGraphjsDataStructure();
        expect(data.datasets[1].pointStyle).toEqual(["circle", "triangle"]);
        expect(data.datasets[1].radius).toEqual([5, 8]);
        expect(data.datasets[0].pointStyle).toEqual(["circle", "circle"]);
    });

    it("gives emphasized bars a different colour", () => {
        const data = new ArrayTableDataSource(
            "bar",
            salaries(),
        ).convertToGraphjsDataStructure();
        const [normal, emphasized] = data.datasets[1].backgroundColor;
        expect(normal).not.toBe(emphasized);
    });

    it("returns nothing for a non-array table", () => {
        expect(
            new ArrayTableDataSource("bar", {
                a: 1,
            }).convertToGraphjsDataStructure(),
        ).toBeUndefined();
    });
});

describe("ArrayTableGrapher", () => {
    const context = (payload, language = "en") => {
        const arraytable = new ArrayTable(payload);
        const ctx = { arraytable, language };
        Object.entries(ArrayTableGrapher.computed).forEach(([name, fn]) => {
            Object.defineProperty(ctx, name, { get: () => fn.call(ctx) });
        });
        ctx.configureAxis = ArrayTableGrapher.methods.configureAxis.bind(ctx);
        return ctx;
    };

    it("localizes labels in the chart data", () => {
        const ctx = context(
            {
                arraytable: [
                    ["_who_", "_y_"],
                    ["Mike", 1],
                ],
                strings: {
                    en: { _who_: "Who", _y_: "Year" },
                    fr: { _who_: "Qui", _y_: "Année" },
                },
            },
            "fr",
        );
        expect(ctx.config.data.datasets[0].label).toBe("Année");
    });

    it("adds axis titles from axes labels", () => {
        const ctx = context({
            arraytable: [
                ["a", "b"],
                ["x", 1],
            ],
            axes: { x: { label: "_x_" } },
            strings: { en: { _x_: "Employees" }, fr: {} },
        });
        expect(ctx.config.options.scales.x.title).toEqual({
            display: true,
            text: "Employees",
        });
        expect(ctx.config.options.scales.y.title).toEqual({});
    });

    it("formats percentage axes", () => {
        const ctx = context({
            arraytable: [
                ["a", "b"],
                ["x", 1],
            ],
            axes: { y: { style: "percentage" } },
            strings: { en: {}, fr: {} },
        });
        expect(ctx.config.options.scales.y.ticks.callback(50)).toBe("50%");
    });

    // KNOWN BUG: the tick value is divided by 100 for every style, so a
    // currency axis shows $1,000 as $10.
    it.fails("formats currency axes without dividing by 100", () => {
        const ctx = context({
            arraytable: [
                ["a", "b"],
                ["x", 1],
            ],
            axes: { y: { style: "currency" } },
            strings: { en: {}, fr: {} },
        });
        expect(ctx.config.options.scales.y.ticks.callback(1000)).toBe("$1,000");
    });
});

describe("DataTableGrapher", () => {
    const context = (datatable, language = "en") => {
        const ctx = {
            datatable,
            language,
            colorForIndex: (...args) =>
                ChartJsMixin.methods.colorForIndex.apply(ctx, args),
            emphasizeColor: (color) =>
                ChartJsMixin.methods.emphasizeColor.call(ctx, color),
        };
        Object.entries(DataTableGrapher.computed).forEach(([name, fn]) => {
            Object.defineProperty(ctx, name, { get: () => fn.call(ctx) });
        });
        return ctx;
    };

    const table = () =>
        new DataTable({
            variables: {
                year: {
                    is_descriptive: true,
                    label: { en: "Year", fr: "Année" },
                },
                cost: { type: "number", label: { en: "Cost", fr: "Coût" } },
                trend: {
                    type: "number",
                    label: { en: "Trend" },
                    chart_type: "line",
                    tension: "monotone",
                },
                hidden: { type: "number", skip_chart: true },
            },
            content: [
                {
                    year: { en: "2024-25", fr: "2024-2025" },
                    cost: 10,
                    trend: 9,
                },
                {
                    year: { en: "2025-26", fr: "2025-2026" },
                    cost: 12,
                    trend: 11,
                    emphasize: true,
                },
                {
                    year: { en: "Total" },
                    cost: 22,
                    trend: 20,
                    skip_chart: true,
                },
            ],
        });

    it("makes one dataset per charted variable", () => {
        const datasets = context(table()).datasets;
        expect(datasets.map((d) => d.label)).toEqual(["Cost", "Trend"]);
    });

    it("uses descriptive values as x labels in the chosen language", () => {
        const datasets = context(table(), "fr").datasets;
        expect(datasets[0].data.map((p) => p.x)).toEqual([
            "2024-2025",
            "2025-2026",
        ]);
        expect(datasets[0].data.map((p) => p.y)).toEqual([10, 12]);
    });

    it("leaves out rows with skip_chart", () => {
        expect(context(table()).datasets[0].data).toHaveLength(2);
    });

    it("draws lines on top of bars and supports monotone lines", () => {
        const [bar, line] = context(table()).datasets;
        expect(bar.type).toBe("bar");
        expect(line.type).toBe("line");
        expect(line.order).toBeLessThan(bar.order);
        expect(line.cubicInterpolationMode).toBe("monotone");
    });

    it("emphasizes rows marked emphasize", () => {
        const [bar] = context(table()).datasets;
        expect(bar.borderWidth).toEqual([0, 2]);
        expect(bar.backgroundColor[0]).not.toBe(bar.backgroundColor[1]);
    });

    it("stacks variables that share a group", () => {
        const t = table();
        t.variables.cost.group = { en: "Spending", fr: "Dépenses" };
        expect(context(t).datasets[0].stack).toBe("Spending");
    });

    it("uses a category x axis titled with the descriptive variable", () => {
        expect(context(table(), "fr").scales.x).toEqual({
            title: { text: "Année", display: true },
            type: "category",
        });
    });

    it("uses a linear x axis with the smallest step for numeric x values", () => {
        const t = new DataTable({
            variables: {
                year: { is_descriptive: true, type: "number" },
                v: { type: "number" },
            },
            content: [
                { year: 2020, v: 1 },
                { year: 2022, v: 1 },
                { year: 2021, v: 1 },
            ],
        });
        expect(context(t).scales.x.type).toBe("linear");
        expect(context(t).scales.x.ticks.stepSize).toBe(1);
    });

    it("returns no config (shows the warning) without a descriptive variable", () => {
        const t = new DataTable({
            variables: { v: { type: "number" } },
            content: [],
        });
        expect(context(t).config).toBeNull();
    });

    // KNOWN BUG: DataTableVariable never reads `color`, so this is ignored.
    it.fails("uses a variable's custom colour", () => {
        const t = new DataTable({
            variables: {
                year: { is_descriptive: true },
                cost: { type: "number", color: "#ff0000" },
            },
            content: [{ year: "2024", cost: 1 }],
        });
        expect(context(t).datasets[0].backgroundColor[0]).toBe("#ff0000");
    });

    it("builds datasets for every chart in charts0.yaml", () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("charts0"));
        doc.slices
            .filter((s) => s.type === "chart" && s.datatable)
            .forEach((slice) => {
                const ctx = context(slice.datatable);
                expect(ctx.config).not.toBeNull();
                expect(ctx.datasets.length).toBeGreaterThan(0);
            });
    });
});
