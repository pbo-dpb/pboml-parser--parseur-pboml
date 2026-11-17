import "../helpers/lang-en.js";
import { describe, it, expect, vi } from "vite-plus/test";
import * as yaml from "js-yaml";
import { render, fireEvent, within } from "@testing-library/vue";
import SliceSourceCodeEditor from "../../src/components/Editor/SliceSourceCodeEditor.vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import MarkdownSlice from "../../src/models/contents/MarkdownSlice";
import DataTable from "../../src/models/contents/DataTable/DataTable";
import KvListVariablePair from "../../src/models/contents/KvListVariablePair";
import { flush, loadSample, yamlDocument } from "../helpers";

/**
 * The "Edit source code" panel lets authors edit a slice as YAML and apply
 * it back to the model. Applying must leave the slice in the same state as
 * if the YAML had been loaded from a file.
 */

const mountEditor = async (slice) => {
    const result = render(SliceSourceCodeEditor, { props: { slice } });
    await flush();
    return result;
};

/** Replaces the YAML in the textarea and clicks Apply. */
const applyYaml = async ({ container, emitted }, newYaml) => {
    const textarea = container.querySelector("textarea");
    await fireEvent.update(textarea, newYaml);
    await fireEvent.click(within(container).getByText("Apply"));
    return emitted();
};

/** Loads the slice's current YAML, lets `edit` change it, and applies it. */
const editSlice = async (slice, edit) => {
    const view = await mountEditor(slice);
    const source = yaml.load(view.container.querySelector("textarea").value);
    edit(source);
    await applyYaml(view, yaml.dump(source));
    return view;
};

const markdown = () =>
    new MarkdownSlice({
        type: "markdown",
        label: { en: "Label", fr: "Libellé" },
        content: { en: "Hello", fr: "Bonjour" },
    });

describe("SliceSourceCodeEditor", () => {
    it("shows the slice as YAML", async () => {
        const { container } = await mountEditor(markdown());
        const shown = yaml.load(container.querySelector("textarea").value);
        expect(shown).toMatchObject({
            type: "markdown",
            label: { en: "Label", fr: "Libellé" },
            content: { en: "Hello", fr: "Bonjour" },
        });
    });

    it("applies edited content to the slice and emits update", async () => {
        const slice = markdown();
        const view = await editSlice(slice, (src) => {
            src.content.fr = "Salut";
        });
        expect(slice.content).toEqual({ en: "Hello", fr: "Salut" });
        expect(view.emitted().update).toHaveLength(1);
        expect(view.emitted().update[0][0]).toBe(slice);
    });

    it("shows the YAML error and disables Apply when the YAML is invalid", async () => {
        const view = await mountEditor(markdown());
        await fireEvent.update(
            view.container.querySelector("textarea"),
            "content: [unclosed",
        );
        expect(
            within(view.container).getByText("Apply").closest("button")
                .disabled,
        ).toBe(true);
        expect(view.container.querySelector("pre").textContent).toMatch(
            /unexpected end|flow collection/i,
        );
    });

    it("warns when the type is changed", async () => {
        const view = await mountEditor(markdown());
        await fireEvent.update(
            view.container.querySelector("textarea"),
            "type: heading\ncontent: {en: x}",
        );
        expect(
            view.container.querySelector("ul li").textContent.length,
        ).toBeGreaterThan(0);
    });

    it("does not warn while the type is unchanged", async () => {
        const view = await mountEditor(markdown());
        expect(view.container.querySelector("ul")).toBeNull();
    });

    // KNOWN BUG: Object.assign copies the YAML onto the slice, so fields that
    // are missing from the YAML keep their old values. Removing a label in
    // the source editor does not remove it from the slice.
    it.fails("removes fields that were deleted from the YAML", async () => {
        const slice = markdown();
        await editSlice(slice, (src) => {
            delete src.label;
        });
        expect(slice.label.en).toBeUndefined();
    });

    // KNOWN BUG: TableSlice serializes its data at the slice level
    // (variables, content), but renders from slice.datatable. Object.assign
    // never rebuilds the datatable, so cell edits are silently lost.
    it.fails("applies a table cell edit to the table", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const table = doc.slices.find((s) => s.type === "table");
        await editSlice(table, (src) => {
            src.content[0].fiscalyear.en = "Edited";
        });
        expect(table.datatable.content[0].fiscalyear.en).toBe("Edited");
    });

    // KNOWN BUG: for a chart, the YAML's datatable replaces the DataTable
    // instance with a plain object, which the chart and table renderers
    // cannot use. (Opening the editor on a chart already fails today because
    // of the ChartSlice.toArray bug, so toArray is stubbed here to isolate
    // this second problem.)
    it.fails("keeps a chart's datatable as a DataTable after applying", async () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                slices: [
                    {
                        type: "chart",
                        datatable: {
                            variables: {
                                year: { is_descriptive: true },
                                v: { type: "number" },
                            },
                            content: [{ year: "2024", v: 1 }],
                        },
                    },
                ],
            }),
        );
        const chart = doc.slices[0];
        vi.spyOn(chart, "toArray").mockReturnValue({ type: "chart" });
        const view = await mountEditor(chart);
        await applyYaml(
            view,
            yaml.dump({
                type: "chart",
                datatable: {
                    variables: {
                        year: { is_descriptive: true },
                        v: { type: "number" },
                    },
                    content: [{ year: "2024", v: 2 }],
                },
            }),
        );
        expect(chart.datatable).toBeInstanceOf(DataTable);
        expect(chart.datatable.content[0].v).toBe(2);
    });

    // KNOWN BUG: KV pairs become plain objects, so rendering the list
    // (which calls pair.getKvNode) throws.
    it.fails("keeps KV list entries as KvListVariablePair objects", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const kv = doc.slices.find((s) => s.type === "kvlist");
        await editSlice(kv, (src) => {
            src.content[0].key.content.en = "Edited";
        });
        expect(kv.content[0]).toBeInstanceOf(KvListVariablePair);
        expect(kv.content[0].key.content.en).toBe("Edited");
    });
});
