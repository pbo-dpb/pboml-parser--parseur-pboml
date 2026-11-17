import "../helpers/lang-en.js";
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vite-plus/test";
import { reactive } from "vue";
import { render, fireEvent, within } from "@testing-library/vue";
import Editor from "../../src/components/Editor/Editor.vue";
import EditorMainContent from "../../src/components/Editor/EditorMainContent/EditorMainContent";
import DataTableEditor from "../../src/components/Editor/DataTableEditor/DataTableEditor";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import DataTable from "../../src/models/contents/DataTable/DataTable";
import { flush, yamlDocument } from "../helpers";

/**
 * Tab lists follow the WAI-ARIA tabs pattern: only the selected tab is in the
 * Tab order (tabindex 0, the others -1), so the arrow keys must move between
 * tabs. Without that, keyboard users can't reach the other tabs at all.
 */

const doc = () =>
    reactive(
        new PBOMLDocument(
            yamlDocument({
                slices: [{ type: "markdown", content: { en: "A" } }],
            }),
        ),
    );

beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollIntoViewIfNeeded = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

const mount = async (Component, props) => {
    const view = render(Component, { props });
    await flush(10);
    return { ...view, q: within(view.container) };
};

/** The first tablist in the container and its tabs. */
const tablist = (container) => {
    const list = container.querySelector('[role="tablist"]');
    return { list, tabs: [...list.querySelectorAll('[role="tab"]')] };
};

describe("Editor.vue tabs", () => {
    it("keeps only the selected tab in the Tab order", async () => {
        const { container } = await mount(Editor, { pbomlDocument: doc() });
        const { tabs } = tablist(container);
        expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual([
            "0",
            "-1",
            "-1",
        ]);
    });

    it("activates a tab with Enter (tabs are buttons)", async () => {
        const { container, q } = await mount(Editor, { pbomlDocument: doc() });
        const properties = q.getByRole("tab", { name: "Properties" });
        properties.focus();
        await fireEvent.click(properties); // what Enter/Space do on a <button>
        expect(properties.getAttribute("aria-selected")).toBe("true");
        expect(properties.getAttribute("tabindex")).toBe("0");
        expect(container.querySelector("#meta")).not.toBeNull();
    });

    it("points each tab to the panel it controls", async () => {
        const { container, q } = await mount(Editor, { pbomlDocument: doc() });
        const content = q.getByRole("tab", { name: "Content" });
        expect(
            container.querySelector(
                `#${content.getAttribute("aria-controls")}`,
            ),
        ).not.toBeNull();
    });

    // KNOWN BUG (accessibility): there is no arrow-key handling, and the
    // other tabs have tabindex -1, so they can't be reached from the keyboard.
    it.fails("moves to the next tab with the right arrow key", async () => {
        const { q } = await mount(Editor, { pbomlDocument: doc() });
        const content = q.getByRole("tab", { name: "Content" });
        content.focus();
        await fireEvent.keyDown(content, { key: "ArrowRight" });
        const properties = q.getByRole("tab", { name: "Properties" });
        expect(properties.getAttribute("aria-selected")).toBe("true");
        expect(document.activeElement).toBe(properties);
    });
});

describe("EditorMainContent tabs (Slices / Notes / Structure)", () => {
    it.fails("moves to the next tab with the right arrow key", async () => {
        const { q } = await mount(EditorMainContent, { pbomlDocument: doc() });
        const slices = q.getByRole("tab", { name: "Slices" });
        slices.focus();
        await fireEvent.keyDown(slices, { key: "ArrowRight" });
        expect(
            q.getByRole("tab", { name: "Notes" }).getAttribute("aria-selected"),
        ).toBe("true");
    });

    // KNOWN BUG: these tabs get no `controls` prop, so every one of them has
    // id="tab-undefined" (duplicate ids) and no aria-controls.
    it.fails("gives each tab a unique id and a panel", async () => {
        const { container } = await mount(EditorMainContent, {
            pbomlDocument: doc(),
        });
        const { tabs } = tablist(container);
        expect(new Set(tabs.map((t) => t.id)).size).toBe(tabs.length);
        tabs.forEach((t) =>
            expect(t.getAttribute("aria-controls")).toBeTruthy(),
        );
    });
});

describe("DataTableEditor tabs", () => {
    const table = () =>
        reactive(
            new DataTable({
                variables: { a: { is_descriptive: true } },
                content: [{ a: "x" }],
            }),
        );

    it("links each tab to its panel", async () => {
        const { container, q } = await mount(DataTableEditor, {
            datatable: table(),
        });
        const visual = q.getByRole("tab", { name: /Tabular data/ });
        expect(
            container.querySelector(`#${visual.getAttribute("aria-controls")}`),
        ).not.toBeNull();
    });

    // KNOWN BUG (accessibility): the four tabs are not inside an element with
    // role="tablist", so assistive technology doesn't announce them as a set.
    it.fails("groups its tabs in a tablist", async () => {
        const { q } = await mount(DataTableEditor, { datatable: table() });
        const visual = q.getByRole("tab", { name: /Tabular data/ });
        expect(visual.closest('[role="tablist"]')).not.toBeNull();
    });
});
