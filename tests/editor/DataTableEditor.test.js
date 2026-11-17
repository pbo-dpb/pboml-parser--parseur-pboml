import "../helpers/lang-en.js";
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { reactive } from "vue";
import { render, fireEvent, within } from "@testing-library/vue";
import DataTableEditor from "../../src/components/Editor/DataTableEditor/DataTableEditor";
import DataTableVisualEditor from "../../src/components/Editor/DataTableEditor/DataTableVisualEditor";
import DataTableVariablesEditor from "../../src/components/Editor/DataTableEditor/DataTableVariablesEditor.vue";
import DataTableVariableEditor from "../../src/components/Editor/DataTableEditor/DataTableVariableEditor";
import DataTableDisplayEditor from "../../src/components/Editor/DataTableEditor/DataTableDisplayEditor/DataTableDisplayEditor.vue";
import DataTableDisplayEditorVariables from "../../src/components/Editor/DataTableEditor/DataTableDisplayEditor/Variables/DataTableDisplayEditorVariables.vue";
import DataTableDisplayEditorDataEntryGroupsGroup from "../../src/components/Editor/DataTableEditor/DataTableDisplayEditor/DataTableDisplayEditorDataEntryGroups/DataTableDisplayEditorDataEntryGroupsGroup.vue";
import DataTable from "../../src/models/contents/DataTable/DataTable";
import DataTableVariable from "../../src/models/contents/DataTable/DataTableVariable";
import { flush } from "../helpers";

const table = () =>
    reactive(
        new DataTable({
            variables: {
                year: {
                    is_descriptive: true,
                    label: { en: "Year", fr: "Année" },
                },
                cost: { type: "number", label: { en: "Cost", fr: "Coût" } },
                note: { type: "markdown", label: { en: "Note", fr: "Note" } },
            },
            content: [
                {
                    year: { en: "2024", fr: "2024" },
                    cost: 10,
                    note: { en: "a", fr: "a" },
                },
                {
                    year: { en: "2025", fr: "2025" },
                    cost: 12,
                    note: { en: "b", fr: "b" },
                },
            ],
        }),
    );

const mount = async (Component, props) => {
    const view = render(Component, { props });
    await flush();
    return { ...view, q: within(view.container) };
};

afterEach(() => vi.restoreAllMocks());

describe("DataTableEditor tabs", () => {
    it("switches between the four editors", async () => {
        const { q } = await mount(DataTableEditor, { datatable: table() });
        expect(
            q
                .getByRole("tab", { name: /Tabular data/ })
                .getAttribute("aria-selected"),
        ).toBe("true");
        await fireEvent.click(q.getByRole("tab", { name: /Variables/ }));
        expect(q.getByText("New variable")).toBeTruthy();
        await fireEvent.click(q.getByRole("tab", { name: /Display/ }));
        expect(q.getByText("General")).toBeTruthy();
        await fireEvent.click(q.getByRole("tab", { name: /Import/ }));
        expect(q.getAllByRole("combobox").length).toBeGreaterThan(0);
    });

    it("links each tab to the panel it controls", async () => {
        const { q, container } = await mount(DataTableEditor, {
            datatable: table(),
        });
        const tab = q.getByRole("tab", { name: /Tabular data/ });
        const panelId = tab.getAttribute("aria-controls");
        expect(container.querySelector(`#${panelId}`)).not.toBeNull();
    });
});

describe("DataTableVisualEditor", () => {
    it("shows one row per variable and one column per entry", async () => {
        const { container } = await mount(DataTableVisualEditor, {
            datatable: table(),
        });
        const rows = container.querySelectorAll("tbody tr");
        expect(rows).toHaveLength(3);
        expect(rows[1].querySelectorAll("td")).toHaveLength(2);
    });

    it("uses number inputs for numbers and EN/FR inputs for text", async () => {
        const { container } = await mount(DataTableVisualEditor, {
            datatable: table(),
        });
        const [, costRow, noteRow] = container.querySelectorAll("tbody tr");
        expect(costRow.querySelectorAll("input[type=number]")).toHaveLength(2);
        expect(noteRow.querySelectorAll("input[type=text]")).toHaveLength(4);
    });

    it("edits a number and a text value", async () => {
        const t = table();
        const { container } = await mount(DataTableVisualEditor, {
            datatable: t,
        });
        const [, costRow, noteRow] = container.querySelectorAll("tbody tr");
        await fireEvent.update(costRow.querySelector("input"), "15.5");
        expect(t.content[0].cost).toBe(15.5);
        await fireEvent.update(noteRow.querySelectorAll("input")[1], "c");
        expect(t.content[0].note).toEqual({ en: "a", fr: "c" });
    });

    it("adds, emphasizes and deletes entries", async () => {
        const t = table();
        const { container, q } = await mount(DataTableVisualEditor, {
            datatable: t,
        });
        await fireEvent.click(q.getByText("Add values").closest("button"));
        expect(t.content).toHaveLength(3);
        await fireEvent.click(q.getAllByLabelText("Emphasize")[0]);
        expect(t.content[0].emphasize).toBe(true);
        await fireEvent.click(q.getAllByLabelText("Delete")[1]);
        expect(t.content).toHaveLength(2);
        expect(t.content[1].year).toBeUndefined();
        expect(container).toBeTruthy();
    });

    it("shows the 'display in chart' toggle only for charts", async () => {
        const plainTable = await mount(DataTableVisualEditor, {
            datatable: table(),
        });
        expect(
            plainTable.q.queryAllByLabelText("Display in chart"),
        ).toHaveLength(0);
        const t = table();
        const chart = await mount(DataTableVisualEditor, {
            datatable: t,
            showChartProperties: true,
        });
        const toggle = chart.q.getAllByLabelText("Display in chart")[0];
        expect(toggle.getAttribute("aria-pressed")).toBe("true");
        await fireEvent.click(toggle);
        expect(t.content[0].skip_chart).toBe(true);
    });
});

describe("DataTableVariablesEditor", () => {
    it("selects the first variable and switches on click", async () => {
        const { container, q } = await mount(DataTableVariablesEditor, {
            datatable: table(),
        });
        expect(container.querySelector(".font-mono.text-lg").textContent).toBe(
            "year",
        );
        await fireEvent.click(q.getAllByRole("button")[1]);
        expect(container.querySelector(".font-mono.text-lg").textContent).toBe(
            "cost",
        );
    });

    it("adds a variable from the prompt (first one is descriptive)", async () => {
        window.prompt = vi.fn(() => "Region");
        const t = reactive(new DataTable({}));
        const { q } = await mount(DataTableVariablesEditor, { datatable: t });
        await fireEvent.click(q.getByText("New variable"));
        const [variable] = Object.values(t.variables);
        expect(variable.key).toBe("region");
        expect(variable.is_descriptive).toBe(true);
        expect(variable.type).toBe("markdown");
    });

    it("adds later variables as numbers and avoids key collisions", async () => {
        window.prompt = vi.fn(() => "Year");
        const t = table();
        const { q } = await mount(DataTableVariablesEditor, { datatable: t });
        await fireEvent.click(q.getByText("New variable"));
        const keys = Object.keys(t.variables);
        expect(keys).toHaveLength(4);
        const added = t.variables[keys[3]];
        expect(added.key).not.toBe("year");
        expect(added.type).toBe("number");
    });

    it("does nothing when the prompt is cancelled", async () => {
        window.prompt = vi.fn(() => null);
        const t = table();
        const { q } = await mount(DataTableVariablesEditor, { datatable: t });
        await fireEvent.click(q.getByText("New variable"));
        expect(Object.keys(t.variables)).toHaveLength(3);
    });

    it("deletes the selected variable and its values", async () => {
        const t = table();
        const { q } = await mount(DataTableVariablesEditor, { datatable: t });
        await fireEvent.click(q.getAllByRole("button")[1]); // cost
        await fireEvent.click(q.getByLabelText("Delete"));
        expect(t.variables).not.toHaveProperty("cost");
        expect(t.content[0]).not.toHaveProperty("cost");
    });

    // KNOWN BUG: the template does not pass showChartProperties down to
    // DataTableVariableEditor, so the "Drawn as…" (bar/line/scatter) choice
    // never appears, even for chart slices.
    it.fails("shows the chart type choice for chart slices", async () => {
        const { q } = await mount(DataTableVariablesEditor, {
            datatable: table(),
            showChartProperties: true,
        });
        await fireEvent.click(q.getAllByRole("button")[1]); // cost
        expect(q.getByLabelText("Drawn as...")).toBeTruthy();
    });

    // KNOWN BUG (accessibility): the variable list items are
    // <div role="button"> without tabindex, so keyboard users can't select
    // a variable.
    it.fails("lets keyboard users reach the variables", async () => {
        const { q } = await mount(DataTableVariablesEditor, {
            datatable: table(),
        });
        expect(q.getAllByRole("button")[0].getAttribute("tabindex")).toBe("0");
    });
});

describe("DataTableVariableEditor", () => {
    const variable = (payload = { type: "number" }) =>
        reactive(new DataTableVariable(payload, "cost"));
    const mountVar = (v, props = {}) =>
        mount(DataTableVariableEditor, {
            variable: v,
            variableKey: "cost",
            ...props,
        });

    it("changes the content type and presentation style", async () => {
        const v = variable();
        const { container } = await mountVar(v);
        const radios = container.querySelectorAll("input[type=radio]");
        await fireEvent.change(radios[2]); // separator
        expect(v.type).toBe("separator");
        await fireEvent.change(radios[4]); // accounting
        expect(v.presentation_style).toBe("accounting");
    });

    it("toggles emphasis and descriptive", async () => {
        const v = variable();
        const { q } = await mountVar(v);
        await fireEvent.click(q.getByLabelText("Emphasize"));
        expect(v.emphasize).toBe(true);
        await fireEvent.click(q.getByLabelText("Describes column contents."));
        expect(v.is_descriptive).toBe(true);
    });

    it("trims the group name", async () => {
        const v = variable();
        const { container } = await mountVar(v);
        const groupFieldset = [...container.querySelectorAll("fieldset")].find(
            (f) =>
                f.querySelector("legend")?.textContent.trim() ===
                "Group by label",
        );
        await fireEvent.update(
            groupFieldset.querySelector("input"),
            "  Spending  ",
        );
        expect(v.group.en).toBe("Spending");
    });

    it("shows the indentation level for tables and the chart type for charts", async () => {
        const forTable = await mountVar(variable());
        expect(forTable.q.getByLabelText("Indentation level")).toBeTruthy();
        expect(forTable.q.queryByLabelText("Drawn as...")).toBeNull();

        const v = variable();
        const forChart = await mountVar(v, { showChartProperties: true });
        await fireEvent.update(
            forChart.q.getByLabelText("Drawn as..."),
            "line",
        );
        expect(v.chart_type).toBe("line");
        expect(forChart.q.queryByLabelText("Indentation level")).toBeNull();
    });

    it("stores the indentation level as a number", async () => {
        const v = variable();
        const { q } = await mountVar(v);
        await fireEvent.update(q.getByLabelText("Indentation level"), "2");
        expect(v.level).toBe(2);
    });

    // KNOWN BUG (accessibility): the "Hide from chart" button is marked
    // pressed when the variable is *shown* (aria-pressed = !skip_chart).
    it.fails("marks 'Hide from chart' as pressed only when the variable is hidden", async () => {
        const v = variable({ type: "number", skip_chart: false });
        const { q } = await mountVar(v);
        expect(
            q.getByLabelText("Hide from chart").getAttribute("aria-pressed"),
        ).toBe("false");
    });
});

describe("DataTableDisplayEditor", () => {
    it("sets the table presentation style", async () => {
        const t = table();
        const { container } = await mount(DataTableDisplayEditor, {
            datatable: t,
        });
        const radios = container.querySelectorAll("input[type=radio]");
        await fireEvent.change(radios[0]);
        expect(t.presentation_style).toBe("accounting");
    });

    it("adds and removes entry groups", async () => {
        const t = table();
        const { q } = await mount(DataTableDisplayEditor, { datatable: t });
        await fireEvent.click(q.getByText("Data"));
        expect(q.getByText("No groups defined")).toBeTruthy();
        await fireEvent.click(q.getByText("New group").closest("button"));
        expect(t.entrygroups).toHaveLength(1);
        await fireEvent.click(q.getByText("Delete").closest("button"));
        expect(t.entrygroups).toHaveLength(0);
    });

    it("shows which entries a group covers and warns when it is too wide", async () => {
        const t = table();
        t.entrygroups.push(
            ...new DataTable({ entrygroups: [{ span: 1 }, { span: 2 }] })
                .entrygroups,
        );
        const first = await mount(DataTableDisplayEditorDataEntryGroupsGroup, {
            group: t.entrygroups[0],
            datatable: t,
        });
        expect(first.container.textContent).toContain("[1, 1] (/ 2)");
        const second = await mount(DataTableDisplayEditorDataEntryGroupsGroup, {
            group: t.entrygroups[1],
            datatable: t,
        });
        expect(second.container.textContent).toContain("[2, 3] (/ 2)");
        expect(second.container.querySelector(".bg-yellow-50")).not.toBeNull();
        const covered = [
            ...second.container.querySelectorAll("td.font-semibold"),
        ].map((td) => td.textContent.trim());
        expect(covered).toEqual(["2025"]);
    });
});

describe("DataTableDisplayEditorVariables (drag to reorder)", () => {
    const dataTransfer = () => ({ setData: vi.fn(), effectAllowed: "" });

    it("moves a variable by dragging it onto another", async () => {
        const t = table();
        const { container } = await mount(DataTableDisplayEditorVariables, {
            datatable: t,
        });
        const items = container.querySelectorAll("li");
        await fireEvent.dragStart(items[0], { dataTransfer: dataTransfer() });
        await fireEvent.drop(items[2], { dataTransfer: dataTransfer() });
        expect(Object.keys(t.variables)).toEqual(["cost", "note", "year"]);
    });

    // KNOWN BUG: the item emits "dragend" but the list listens for
    // "dragEnd", so a cancelled drag is never cleared and the drop cues
    // keep showing on other items.
    it.fails("forgets the dragged variable when a drag is cancelled", async () => {
        const t = table();
        const { container } = await mount(DataTableDisplayEditorVariables, {
            datatable: t,
        });
        const items = container.querySelectorAll("li");
        await fireEvent.dragStart(items[0], { dataTransfer: dataTransfer() });
        await fireEvent.dragEnd(items[0]);
        await fireEvent.dragOver(items[2]);
        expect(items[2].className).not.toContain("border-b-4");
    });
});
