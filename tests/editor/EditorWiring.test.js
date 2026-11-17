// @vitest-environment jsdom
// jsdom: the chart and table tests import data through DOMPurify, which
// does not work correctly under happy-dom.
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
import SliceEditor from "../../src/editors/SliceEditor";
import StructureEditor from "../../src/components/Editor/StructureEditor/StructureEditor";
import EditorSlicesEmpty from "../../src/components/Editor/EditorMainContent/EditorSlicesEmpty";
import MarkdownTextarea from "../../src/components/Editor/Inputs/MarkdownTextarea.vue";
import PastePlainTextButton from "../../src/components/Editor/Inputs/PastePlainTextButton.vue";
import DataTableVariablesEditorVariablePreview from "../../src/components/Editor/DataTableEditor/DataTableVariablesEditorVariablePreview.vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import DataTable from "../../src/models/contents/DataTable/DataTable";
import DataTableVariable from "../../src/models/contents/DataTable/DataTableVariable";
vi.mock("chart.js/auto", () => import("../helpers/chartjs-stub.js"));
import { flush, yamlDocument, waitUntil, ASYNC_TIMEOUT } from "../helpers";

beforeEach(() => {
    // jsdom has no matchMedia or canvas; the chart code uses both on mount.
    window.matchMedia = vi.fn(() => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
    }));
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}));
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
    HTMLDialogElement.prototype.showModal ??= function () {
        this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function () {
        this.open = false;
    };
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollIntoViewIfNeeded = vi.fn();
    location.hash = "";
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

/** Waits until `find()` returns an element (async components load later). */
const waitFor = (find, timeout = ASYNC_TIMEOUT) =>
    waitUntil(
        () => {
            const el = find();
            if (!el) throw new Error("not rendered yet");
            return el;
        },
        { timeout },
    );

const sliceOf = (payload, prefix = null) =>
    reactive(new PBOMLDocument(yamlDocument({ slices: [payload] }), prefix))
        .slices[0];

/** Mounts the full slice editor for an unlocked slice. */
const editSlice = async (payload, { meta = false } = {}) => {
    const slice = sliceOf({ ...payload, state: { _unlocked: true } });
    slice.state.isEditingMeta = meta;
    const view = render(SliceEditor, { props: { slice, language: "en" } });
    await flush();
    return { slice, ...view, q: within(view.container) };
};

const markdownTable = `
| Year | Cost |
| ---- | ---- |
| 2024 | 10   |
| 2025 | 12   |
`;

describe("Each slice type's editor updates the slice", () => {
    it("markdown", async () => {
        const { slice, q } = await editSlice({
            type: "markdown",
            content: { en: "A", fr: "B" },
        });
        const fr = await waitFor(() => q.queryByLabelText("FR"));
        await fireEvent.update(fr, "C");
        expect(slice.content).toEqual({ en: "A", fr: "C" });
    });

    it("LaTeX", async () => {
        const { slice, container } = await editSlice({
            type: "LaTeX",
            content: { en: "x", fr: "y" },
        });
        const [en] = await waitFor(() => {
            const areas = container.querySelectorAll("textarea");
            return areas.length ? areas : null;
        });
        en.value = "\\textbf{z}";
        await fireEvent.change(en);
        expect(slice.content).toEqual({ en: "\\textbf{z}", fr: "y" });
    });

    it("HTML (with CSS options in meta mode)", async () => {
        const { slice, container } = await editSlice(
            { type: "html", content: { en: "<p>a</p>", fr: "<p>b</p>" } },
            { meta: true },
        );
        const areas = await waitFor(() => {
            const found = container.querySelectorAll("textarea");
            return found.length === 3 ? found : null;
        });
        areas[2].value = "<p>c</p>";
        await fireEvent.change(areas[2]);
        expect(slice.content).toEqual({ en: "<p>a</p>", fr: "<p>c</p>" });
    });

    it("SVG", async () => {
        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>';
        const { slice, container } = await editSlice({
            type: "svg",
            content: { en: svg, fr: svg },
        });
        const source = await waitFor(() =>
            container.querySelector("details textarea"),
        );
        source.value = "<svg/>";
        await fireEvent.change(source);
        expect(slice.content.en).toBe("<svg/>");
        expect(slice.content.fr).toBe(svg);
    });

    it("bitmap", async () => {
        const { slice, container } = await editSlice({
            type: "bitmap",
            content: { en: "", fr: "" },
        });
        const legend = await waitFor(() =>
            [...container.querySelectorAll("legend")].find((l) =>
                l.textContent.includes("Source (full resolution bitmap)"),
            ),
        );
        const [en] = legend.parentElement.querySelectorAll("input");
        await fireEvent.update(en, "https://x/en.png");
        expect(slice.content.en).toBe("https://x/en.png");
    });

    it("key-value list (labels in meta mode)", async () => {
        const { slice, q } = await editSlice(
            {
                type: "kvlist",
                prototype: {
                    key: { type: "markdown" },
                    value: { type: "markdown" },
                },
                content: [],
            },
            { meta: true },
        );
        const box = await waitFor(() => q.queryByLabelText("Display labels"));
        await fireEvent.click(box);
        expect(slice.prototype.display_labels).toBe(true);
    });

    it("heading (level and text)", async () => {
        const { slice, container } = await editSlice({
            type: "heading",
            level: 0,
            content: { en: "T", fr: "T" },
        });
        const radios = await waitFor(() => {
            const found = container.querySelectorAll("input[type=radio]");
            return found.length ? found : null;
        });
        await fireEvent.input(radios[1]);
        expect(slice.level).toBe(1);
    });

    it("heading meta mode only offers the reference (no label or presentation)", async () => {
        const { container, q } = await editSlice(
            {
                type: "heading",
                content: { en: "T" },
                referenced_as: { en: "Ch. 1", fr: "Ch. 1" },
            },
            { meta: true },
        );
        await waitFor(() => container.querySelector("input[type=radio]"));
        const anchor = await waitFor(() =>
            [...container.querySelectorAll("fieldset")].find(
                (f) =>
                    f.querySelector(":scope > legend")?.textContent.trim() ===
                    "Anchor",
            ),
        );
        expect(anchor.querySelector("input").value).toBe("Ch. 1");
        expect(q.queryByText("Figure/Table (numbered)")).toBeNull();
        expect(q.queryByText("Title")).toBeNull();
    });

    it.each([
        ["table", { type: "table", variables: {}, content: [] }],
        ["chart", { type: "chart", datatable: { variables: {}, content: [] } }],
    ])("%s: importing data replaces the slice's table", async (_, payload) => {
        const { slice, q, container } = await editSlice(payload);
        const importTab = await waitFor(() =>
            q.queryByRole("tab", { name: /Import/ }),
        );
        await fireEvent.click(importTab);
        const [enArea] = await waitFor(() => {
            const found = container.querySelectorAll("textarea");
            return found.length ? found : null;
        });
        await fireEvent.update(enArea, markdownTable);
        await fireEvent.update(container.querySelector("select"), "row");
        const importButton = q.getAllByText("Import").at(-1).closest("button");
        await fireEvent.click(importButton);
        await flush();
        expect(slice.datatable).toBeInstanceOf(DataTable);
        expect(
            Object.values(slice.datatable.variables).map((v) => v.label.en),
        ).toEqual(["Year", "Cost"]);
        expect(slice.datatable.content).toHaveLength(2);
    });
});

describe("Slice meta editing (presentation, reference, label, id)", () => {
    it("updates every meta field from the form", async () => {
        const { slice, container } = await editSlice(
            {
                type: "markdown",
                content: { en: "x" },
                label: { en: "L", fr: "L" },
            },
            { meta: true },
        );
        const radios = await waitFor(() => {
            const found = container.querySelectorAll("input[type=radio]");
            return found.length === 4 ? found : null;
        });
        await fireEvent.input(radios[1]);
        expect(slice.presentation).toBe("figure");

        const fieldset = (title) =>
            [...container.querySelectorAll("fieldset")].find(
                (f) =>
                    f.querySelector(":scope > legend")?.textContent.trim() ===
                    title,
            );
        const reference = await waitFor(() => fieldset("Anchor"));
        await fireEvent.update(reference.querySelectorAll("input")[0], "Box 2");
        expect(slice.referenced_as.en).toBe("Box 2");

        const titleField = await waitFor(() => fieldset("Title"));
        await fireEvent.update(
            titleField.querySelectorAll("input")[1],
            "Titre",
        );
        expect(slice.label).toEqual({ en: "L", fr: "Titre" });
    });
});

describe("Preset choices (slice.choices)", () => {
    const withChoices = () =>
        editSlice({
            type: "markdown",
            content: { en: "Option A", fr: "Option A (fr)" },
            choices: [
                { content: { en: "Option A", fr: "Option A (fr)" } },
                { content: { en: "Option B", fr: "Option B (fr)" } },
            ],
        });

    it("shows the choices instead of the editing fields", async () => {
        const { container } = await withChoices();
        const group = await waitFor(() =>
            container.querySelector('[role="radiogroup"]'),
        );
        const radios = group.querySelectorAll('[role="radio"]');
        expect(radios).toHaveLength(2);
        expect(container.querySelector("textarea")).toBeNull();
        await waitFor(() =>
            radios[1].textContent.includes("Option B (fr)") ? radios[1] : null,
        );
    });

    it("marks the current choice as checked", async () => {
        const { container } = await withChoices();
        const radios = await waitFor(() => {
            const found = container.querySelectorAll('[role="radio"]');
            return found.length ? found : null;
        });
        expect([...radios].map((r) => r.getAttribute("aria-checked"))).toEqual([
            "true",
            "false",
        ]);
    });

    it("applies a choice when clicked", async () => {
        const { slice, container } = await withChoices();
        const radios = await waitFor(() => {
            const found = container.querySelectorAll('[role="radio"]');
            return found.length ? found : null;
        });
        await fireEvent.click(radios[1]);
        expect(slice.content).toEqual({ en: "Option B", fr: "Option B (fr)" });
        await waitUntil(() =>
            expect(
                container
                    .querySelectorAll('[role="radio"]')[1]
                    .getAttribute("aria-checked"),
            ).toBe("true"),
        );
    });

    it("keeps choices through save and reload", () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                slices: [
                    {
                        type: "markdown",
                        content: { en: "a" },
                        choices: [{ content: { en: "a" } }],
                    },
                ],
            }),
        );
        const reloaded = PBOMLDocument.initFromYaml(doc.serialize());
        expect(reloaded.slices[0].choices).toEqual([{ content: { en: "a" } }]);
    });

    // KNOWN BUG (accessibility): the choices are <div role="radio"> without
    // tabindex or key handling, so they can't be picked from the keyboard.
    it.fails("can be reached from the keyboard", async () => {
        const { container } = await withChoices();
        const radio = await waitFor(() =>
            container.querySelector('[role="radio"]'),
        );
        expect(radio.getAttribute("tabindex")).not.toBeNull();
    });
});

describe("StructureEditor (Structure tab)", () => {
    it("shows the tree and opens the importer, which closes after importing", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    slices: [{ type: "markdown", content: { en: "A" } }],
                }),
            ),
        );
        const { container } = render(StructureEditor, {
            props: { pbomlDocument: doc },
        });
        const q = within(container);
        expect(container.querySelectorAll("li")).toHaveLength(1);
        await fireEvent.click(q.getByText("Import").closest("button"));
        const [en] = await waitFor(() => {
            const found = container.querySelectorAll("textarea");
            return found.length ? found : null;
        });
        await fireEvent.update(en, "# New heading");
        const importButton = within(container)
            .getAllByText("Import")
            .at(-1)
            .closest("button");
        await fireEvent.click(importButton);
        await flush();
        expect(doc.slices).toHaveLength(2);
        expect(container.querySelector("textarea")).toBeNull();
        expect(container.querySelectorAll("li")).toHaveLength(2);
    });
});

describe("EditorSlicesEmpty", () => {
    it("offers to import a structure into an empty document", async () => {
        const doc = reactive(new PBOMLDocument(yamlDocument()));
        const { container } = render(EditorSlicesEmpty, {
            props: { pbomlDocument: doc },
        });
        const q = within(container);
        expect(
            q.getByText("No slice is present in the document."),
        ).toBeTruthy();
        await fireEvent.click(q.getByText("Import").closest("button"));
        const [en] = await waitFor(() => {
            const found = container.querySelectorAll("textarea");
            return found.length ? found : null;
        });
        expect(
            q.queryByText("No slice is present in the document."),
        ).toBeNull();
        await fireEvent.update(en, "# Title\n\nText");
        await fireEvent.click(
            within(container).getAllByText("Import").at(-1).closest("button"),
        );
        expect(doc.slices.map((s) => s.type)).toEqual(["heading", "markdown"]);
        await waitUntil(() =>
            expect(
                q.getByText("No slice is present in the document."),
            ).toBeTruthy(),
        );
    });
});

describe("Paste as plain text button", () => {
    const clipboardWith = (items, state = "granted") => {
        vi.stubGlobal("navigator", {
            ...navigator,
            permissions: { query: vi.fn(async () => ({ state })) },
            clipboard: { read: vi.fn(async () => items) },
        });
    };
    const textItem = (text) => ({
        types: ["text/html", "text/plain"],
        getType: vi.fn(async () => new Blob([text], { type: "text/plain" })),
    });

    it("emits the clipboard's plain text", async () => {
        clipboardWith([textItem("a < b * c")]);
        const { container, emitted } = render(PastePlainTextButton);
        await fireEvent.click(container.querySelector("button"));
        await waitUntil(() => expect(emitted().pasted).toBeTruthy());
        expect(emitted().pasted[0]).toEqual(["a < b * c"]);
    });

    it("skips clipboard items without plain text", async () => {
        clipboardWith([
            { types: ["image/png"], getType: vi.fn() },
            textItem("second"),
        ]);
        const { container, emitted } = render(PastePlainTextButton);
        await fireEvent.click(container.querySelector("button"));
        await waitUntil(() => expect(emitted().pasted).toBeTruthy());
        expect(emitted().pasted[0]).toEqual(["second"]);
    });

    it("tells the author when clipboard access is denied", async () => {
        clipboardWith([], "denied");
        const { container, emitted } = render(PastePlainTextButton);
        await fireEvent.click(container.querySelector("button"));
        await waitUntil(() => expect(window.alert).toHaveBeenCalled());
        expect(emitted().pasted).toBeUndefined();
    });

    it("inserts the text as written into a markdown field", async () => {
        clipboardWith([textItem("5 * 2 and a_b")]);
        const { container, emitted } = render(MarkdownTextarea, {
            props: { modelValue: "" },
        });
        await fireEvent.click(container.querySelector("button"));
        await waitUntil(() =>
            expect(emitted()["update:modelValue"]).toBeTruthy(),
        );
        expect(emitted()["update:modelValue"].at(-1)).toEqual([
            "5 * 2 and a_b",
        ]);
    });
});

describe("Variable list preview (table editor)", () => {
    const preview = (payload, key = "cost") =>
        render(DataTableVariablesEditorVariablePreview, {
            props: { variable: new DataTableVariable(payload, key) },
        });

    it("abbreviates a multi-word group with its initials", () => {
        const { container } = preview({ group: { en: "Total Spending Plan" } });
        expect(container.querySelector(".w-8").textContent.trim()).toBe("TSP");
    });

    it("uses the first three letters of a one-word group", () => {
        const { container } = preview({ group: { en: "Revenue" } });
        expect(container.querySelector(".w-8").textContent.trim()).toBe("REV");
    });

    it("shows no group badge without a group", () => {
        const { container } = preview({});
        expect(container.querySelector(".w-8")).toBeNull();
    });

    it("shows the key, and icons for emphasis and descriptive variables", () => {
        const { container } = preview({
            emphasize: true,
            is_descriptive: true,
        });
        expect(container.querySelector(".font-mono").textContent).toBe("cost");
        expect(container.querySelector(".text-yellow-600")).not.toBeNull();
        expect(container.querySelectorAll("svg").length).toBe(3); // type, star, key
    });
});
