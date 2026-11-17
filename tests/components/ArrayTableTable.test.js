import "../helpers/lang-en.js";
import { describe, it, expect, vi } from "vite-plus/test";
import { h } from "vue";
import { render } from "@testing-library/vue";
import ArrayTableTable from "../../src/components/Renderer/ArrayTableTable";
import ArrayTable from "../../src/models/contents/ArrayTable/ArrayTable";
import ChartSlice from "../../src/models/contents/ChartSlice";
import ChartSliceHtmlRenderer from "../../src/Renderers/Html/ChartSliceHtmlRenderer";
import { waitUntil } from "../helpers";

/**
 * ArrayTableTable is the "Text version" table shown under charts built from
 * an `arraytable`.
 */

const payload = () => ({
    arraytable: [
        ["_who_", "2023"],
        ["Mike", 1234.5],
        ["Bob", { data: 37000, emphasize: true }],
        ["Al", null],
    ],
    strings: { en: { _who_: "Who" }, fr: { _who_: "Qui" } },
});

const cells = (container) =>
    [...container.querySelectorAll("tr")].map((tr) =>
        [...tr.querySelectorAll("th, td")].map((c) => c.textContent),
    );

describe("ArrayTableTable", () => {
    it("uses the first row as headers and the rest as the body", () => {
        const { container } = render(ArrayTableTable, {
            props: { arraytable: new ArrayTable(payload()), language: "en" },
        });
        expect(container.querySelectorAll("thead th")).toHaveLength(2);
        expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
        expect(cells(container)[0]).toEqual(["Who", "2023"]);
    });

    it("formats numbers for the language", () => {
        const en = render(ArrayTableTable, {
            props: { arraytable: new ArrayTable(payload()), language: "en" },
        });
        expect(cells(en.container)[1][1]).toBe("1,234.5");
        const fr = render(ArrayTableTable, {
            props: { arraytable: new ArrayTable(payload()), language: "fr" },
        });
        expect(cells(fr.container)[1][1]).toMatch(/^1\s234,5$/);
        expect(cells(fr.container)[0][0]).toBe("Qui");
    });

    it("drops trailing zeros on whole numbers", () => {
        const table = new ArrayTable({
            arraytable: [["a"], [12]],
            strings: { en: {} },
        });
        const { container } = render(ArrayTableTable, {
            props: { arraytable: table, language: "en" },
        });
        expect(cells(container)[1][0]).toBe("12");
    });

    it("marks empty cells for screen readers", () => {
        const { container } = render(ArrayTableTable, {
            props: { arraytable: new ArrayTable(payload()), language: "fr" },
        });
        const blank = container
            .querySelectorAll("tbody tr")[2]
            .querySelectorAll("td")[1];
        expect(blank.querySelector(".sr-only").textContent).toBe(
            "Cellule vide",
        );
        expect(blank.className).toContain("bg-gray-100");
    });

    // KNOWN BUG: values written as { data, emphasize } (supported by the
    // chart) are passed to the cell as an object, so the cell is empty.
    it.fails("shows emphasized values", () => {
        const { container } = render(ArrayTableTable, {
            props: { arraytable: new ArrayTable(payload()), language: "en" },
        });
        expect(cells(container)[2][1]).toBe("37,000");
    });
});

describe("Text version of an arraytable chart", () => {
    const textVersion = async (language) => {
        const slice = new ChartSlice({ type: "chart", arraytable: payload() });
        const view = render({
            render: () =>
                h(
                    "div",
                    new ChartSliceHtmlRenderer(slice).renderAltsVnodes(
                        language,
                    ),
                ),
        });
        await waitUntil(() => {
            if (!view.container.querySelector("table"))
                throw new Error("not loaded");
        });
        return view;
    };

    it("is shown in a collapsible 'Text version' section", async () => {
        const { container } = await textVersion("en");
        expect(container.querySelector("details summary").textContent).toBe(
            "Text version",
        );
        expect(container.querySelector("details table")).not.toBeNull();
    });

    // KNOWN BUG: ArrayTable.renderReadonlyVnode(language) doesn't pass the
    // language to ArrayTableTable, which then uses the page language. A French
    // reader on an English page gets English labels and number formats.
    it.fails("uses the requested language", async () => {
        const { container } = await textVersion("fr");
        expect(cells(container)[0][0]).toBe("Qui");
        expect(cells(container)[1][1]).toMatch(/^1\s234,5$/);
    });
});
