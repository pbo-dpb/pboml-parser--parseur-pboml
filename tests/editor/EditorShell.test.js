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
import "../../src/main.js"; // registers <pboml-parser> and <pboml-toc>
import Editor from "../../src/components/Editor/Editor.vue";
import EditorPreviews from "../../src/components/Editor/EditorPreviews.vue";
import YamlEditor from "../../src/components/Editor/YamlEditor.vue";
import StructureTree from "../../src/components/Editor/StructureEditor/StructureTree/StructureTree";
import StructureTreeSlice from "../../src/components/Editor/StructureEditor/StructureTree/StructureTreeSlice.vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import editorStrings from "../../src/editor-strings";
vi.mock("chart.js/auto", () => import("../helpers/chartjs-stub.js"));
import { flush, loadSample, yamlDocument, waitUntil } from "../helpers";

const md = (en, extra = {}) => ({
    type: "markdown",
    content: { en, fr: `${en}-fr` },
    ...extra,
});

beforeEach(() => {
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
const addedElements = [];
afterEach(() => {
    vi.restoreAllMocks();
    addedElements.splice(0).forEach((el) => el.remove());
});

/**
 * Adds a custom element to the page. `root` is its shadow root; `q` holds
 * testing-library queries scoped to the app inside it (testing-library can't
 * take a ShadowRoot directly).
 */
async function addElement(tag, attributes) {
    const el = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes))
        el.setAttribute(name, value);
    document.body.appendChild(el);
    addedElements.push(el);
    await flush(10);
    const appRoot = () => el.shadowRoot.querySelector("div");
    const q = new Proxy({}, { get: (_, name) => within(appRoot())[name] });
    return { el, root: el.shadowRoot, q };
}

/** Waits until `selector` matches in the shadow root (the app loads async). */
const waitForEl = (root, selector) =>
    waitUntil(() => {
        const el = root.querySelector(selector);
        if (!el) throw new Error(`${selector} not rendered yet`);
        return el;
    });

const base64 = (text) => Buffer.from(text, "utf8").toString("base64");

describe("<pboml-parser> (App.ce.vue)", () => {
    it("renders a raw YAML payload", async () => {
        const { root } = await addElement("pboml-parser", {
            payload: loadSample("leg0"),
        });
        expect((await waitForEl(root, "h1")).textContent).toBe(
            "The Planet of the Sword",
        );
    });

    it("renders a base64 data URL payload", async () => {
        const { root } = await addElement("pboml-parser", {
            payload: `data:text/yaml;base64,${base64(loadSample("leg0"))}`,
        });
        expect((await waitForEl(root, "h1")).textContent).toBe(
            "The Planet of the Sword",
        );
    });

    it("renders French with language='fr'", async () => {
        const { root } = await addElement("pboml-parser", {
            payload: loadSample("leg0"),
            language: "fr",
        });
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        expect((await waitForEl(root, "h1")).textContent).toBe(doc.title.fr);
    });

    it("prefixes anchors with prefix", async () => {
        const { root } = await addElement("pboml-parser", {
            payload: loadSample("slicesHasOneSlice"),
            prefix: "doc2",
        });
        expect(await waitForEl(root, "#doc2-heading-1")).not.toBeNull();
    });

    it("hides the header and footer with standalone='true'", async () => {
        const { root } = await addElement("pboml-parser", {
            payload: loadSample("leg0"),
            standalone: "true",
        });
        // Wait for the slices first, so a missing header means "hidden",
        // not "not loaded yet".
        await waitForEl(root, "section");
        expect(root.querySelector("h1")).toBeNull();
        expect(root.querySelector("footer")).toBeNull();
    });

    it("re-renders when the payload attribute changes", async () => {
        const { el, root } = await addElement("pboml-parser", {
            payload: loadSample("slicesHasOneSlice"),
        });
        await waitForEl(root, "section");
        expect(root.querySelectorAll("section")).toHaveLength(1);
        el.setAttribute("payload", loadSample("slicesHasTwoSlices"));
        // Updates are debounced by 500 ms.
        await waitUntil(() =>
            expect(root.querySelectorAll("section")).toHaveLength(2),
        );
    });

    it("shows the file picker in edit mode without a payload, then the editor", async () => {
        const { root, q } = await addElement("pboml-parser", { edit: "true" });
        await waitUntil(() => expect(q.getByText("New")).toBeTruthy());
        await fireEvent.click(q.getByText("New"));
        await waitUntil(() =>
            expect(root.querySelector('[role="tablist"]')).not.toBeNull(),
        );
        expect(q.getByRole("tab", { name: "Content" })).toBeTruthy();
    });

    it("replaces the document from the Advanced tab", async () => {
        const { q, root } = await addElement("pboml-parser", {
            edit: "true",
            payload: loadSample("slicesHasOneSlice"),
        });
        await waitUntil(() =>
            expect(q.getByRole("tab", { name: "Advanced" })).toBeTruthy(),
        );
        await fireEvent.click(q.getByRole("tab", { name: "Advanced" }));
        const textarea = await waitUntil(() => {
            const t = root.querySelector("#advanced textarea");
            if (!t) throw new Error("not yet");
            return t;
        });
        const commit = q.getByText("Commit changes").closest("button");
        expect(commit.disabled).toBe(true);
        await fireEvent.update(textarea, loadSample("slicesHasTwoSlices"));
        expect(commit.disabled).toBe(false);
        await fireEvent.click(commit);
        await fireEvent.click(q.getByRole("tab", { name: "Content" }));
        await waitUntil(() =>
            expect(root.querySelector("#content").textContent).toContain(
                "Title 3",
            ),
        );
    });

    // KNOWN BUG: the "invalid PBOML" alert uses strings.error_invalid_pboml,
    // which does not exist, so authors see "undefined" followed by the error.
    it.fails("explains why an invalid document can't be committed", async () => {
        const { q, root } = await addElement("pboml-parser", {
            edit: "true",
            payload: loadSample("slicesHasOneSlice"),
        });
        await waitUntil(() =>
            expect(q.getByRole("tab", { name: "Advanced" })).toBeTruthy(),
        );
        await fireEvent.click(q.getByRole("tab", { name: "Advanced" }));
        const textarea = await waitUntil(() => {
            const t = root.querySelector("#advanced textarea");
            if (!t) throw new Error("not yet");
            return t;
        });
        await fireEvent.update(textarea, "pboml:\n  version: 9.9.9");
        await fireEvent.click(q.getByText("Commit changes").closest("button"));
        expect(window.alert).toHaveBeenCalled();
        expect(window.alert.mock.calls[0][0]).not.toMatch(/^undefined/);
    });

    // KNOWN BUG: attribute values are strings, so edit="false" is truthy and
    // opens the editor instead of the reader.
    it.fails("shows the reader with edit='false'", async () => {
        const { root } = await addElement("pboml-parser", {
            edit: "false",
            payload: loadSample("leg0"),
        });
        // Wait until either the reader or the editor has loaded.
        await waitForEl(root, 'h1, [role="tablist"]');
        expect(root.querySelector('[role="tablist"]')).toBeNull();
        expect(root.querySelector("h1")).not.toBeNull();
    });
});

describe("<pboml-toc> (Toc.ce.vue)", () => {
    it("renders the table of contents of a payload", async () => {
        const { root } = await addElement("pboml-toc", {
            payload: loadSample("leg0"),
        });
        await waitUntil(() =>
            expect(root.querySelector("nav.pb__toc")).not.toBeNull(),
        );
    });

    it("accepts a base64 payload", async () => {
        const { root } = await addElement("pboml-toc", {
            payload: `data:text/yaml;base64,${base64(loadSample("leg0"))}`,
            language: "fr",
        });
        await waitUntil(() =>
            expect(root.querySelector("nav.pb__toc")).not.toBeNull(),
        );
        expect(root.textContent).toContain("Début");
    });
});

describe("Editor.vue", () => {
    const mountEditor = async (slices = [md("A")]) => {
        const doc = reactive(new PBOMLDocument(yamlDocument({ slices })));
        const view = render(Editor, { props: { pbomlDocument: doc } });
        await flush(10);
        return { doc, ...view, q: within(view.container) };
    };

    it("switches between content, properties and advanced", async () => {
        const { q, container } = await mountEditor();
        const panel = () =>
            container.querySelector("#content, #meta, #advanced");
        expect(panel().id).toBe("content");
        await fireEvent.click(q.getByRole("tab", { name: "Properties" }));
        expect(panel().id).toBe("meta");
        await fireEvent.click(q.getByRole("tab", { name: "Advanced" }));
        expect(panel().id).toBe("advanced");
        expect(panel().getAttribute("aria-labelledby")).toBe("tab-advanced");
        expect(container.querySelector("#tab-advanced")).not.toBeNull();
    });

    it("warns while some content is unlocked", async () => {
        const { doc, q } = await mountEditor();
        const warning = q
            .getByText(editorStrings.en.unlocked_content_warning.trim(), {
                exact: false,
            })
            .closest("div");
        expect(warning.style.display).toBe("none");
        doc.slices[0].state._unlocked = true;
        await flush();
        expect(warning.style.display).toBe("");
    });

    it("tells the host page when the document changes", async () => {
        const listener = vi.fn();
        document.addEventListener("pboml-editor-document-updated", listener);
        const { doc } = await mountEditor();
        doc.slices[0].content.en = "Changed";
        await flush();
        document.removeEventListener("pboml-editor-document-updated", listener);
        expect(listener).toHaveBeenCalled();
        expect(listener.mock.calls.at(-1)[0].detail.pbomlDocument).toContain(
            "Changed",
        );
    });

    // KNOWN BUG: the update event serializes the document, which throws for
    // documents with a chart (ChartSlice.toArray), so the host page never
    // hears about changes in those documents.
    it.fails("tells the host page about changes in a document with a chart", async () => {
        const listener = vi.fn();
        document.addEventListener("pboml-editor-document-updated", listener);
        const doc = reactive(PBOMLDocument.initFromYaml(loadSample("charts0")));
        // Route the watcher's error to Vue's handler instead of an unhandled
        // rejection, so it doesn't break other tests.
        const errorHandler = vi.fn();
        render(Editor, {
            props: { pbomlDocument: doc },
            global: { config: { errorHandler } },
        });
        await flush(10);
        doc.slices[0].label.en = "Changed";
        await flush();
        document.removeEventListener("pboml-editor-document-updated", listener);
        expect(listener).toHaveBeenCalled();
    });
});

describe("EditorPreviews", () => {
    const doc = () => reactive(PBOMLDocument.initFromYaml(loadSample("leg0")));

    it("opens an EN preview and switches to FR", async () => {
        const { container, getByTitle } = render(EditorPreviews, {
            props: { pbomlDocument: doc() },
        });
        await fireEvent.click(getByTitle("Preview"));
        await flush();
        const dialog = container.querySelector("dialog");
        expect(dialog.querySelector("h1").textContent).toBe(
            "The Planet of the Sword",
        );
        const frTab = within(dialog).getByRole("tab", { name: "FR" });
        await fireEvent.click(frTab);
        expect(frTab.getAttribute("aria-selected")).toBe("true");
    });

    it("tells the author when the enhanced preview is blocked by the browser", async () => {
        window.open = vi.fn(() => null);
        const { getByTitle } = render(EditorPreviews, {
            props: { pbomlDocument: doc() },
        });
        await fireEvent.click(getByTitle("Open enhanced preview"));
        expect(window.alert).toHaveBeenCalledWith(
            expect.stringContaining("popup blocker"),
        );
    });

    // KNOWN BUG: the close button's title uses strings.close_preview, which
    // does not exist (title is empty).
    it.fails("gives the close button a title", async () => {
        const { container, getByTitle } = render(EditorPreviews, {
            props: { pbomlDocument: doc() },
        });
        await fireEvent.click(getByTitle("Preview"));
        await flush();
        const close = container.querySelector("dialog button.ml-8");
        expect(close.getAttribute("title")).toBeTruthy();
    });
});

describe("YamlEditor", () => {
    it("shows the document as YAML and emits edits", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("slicesHasOneSlice"));
        const { container, emitted } = render(YamlEditor, {
            props: { pbomlDocument: doc },
        });
        await flush();
        const textarea = container.querySelector("textarea");
        expect(textarea.value).toContain("Title 1");
        expect(container.textContent).toContain("OK");
        await fireEvent.update(textarea, "a: [");
        expect(
            container.querySelector("pre").textContent.trim().length,
        ).toBeGreaterThan(0);
        expect(emitted().update.at(-1)).toEqual(["a: ["]);
    });
});

describe("StructureTree", () => {
    const mountTree = async (slices) => {
        const doc = reactive(new PBOMLDocument(yamlDocument({ slices })));
        const view = render(StructureTree, { props: { pbomlDocument: doc } });
        await flush();
        return { doc, ...view };
    };
    const dataTransfer = () => ({ setData: vi.fn(), effectAllowed: "" });

    it("lists slices with their type and indents them under headings", async () => {
        const { container } = await mountTree([
            { type: "heading", level: 0, content: { en: "Chapter" } },
            md("Text", { label: { en: "Intro" } }),
            { type: "heading", level: 1, content: { en: "Section" } },
            md("More"),
        ]);
        const items = [...container.querySelectorAll("li")];
        expect(
            items.map((li) => li.querySelector(".w-12").textContent.trim()),
        ).toEqual(["H1", "MKD", "H2", "MKD"]);
        expect(items[0].textContent).toContain("Chapter");
        expect(items[1].textContent).toContain("Intro");
        expect(items[3].className).toContain("ml-2");
    });

    it("reorders slices by drag and drop", async () => {
        const { doc, container } = await mountTree([md("A"), md("B"), md("C")]);
        const items = container.querySelectorAll("li");
        await fireEvent.dragStart(items[0], { dataTransfer: dataTransfer() });
        await fireEvent.drop(items[2], { dataTransfer: dataTransfer() });
        expect(doc.slices.map((s) => s.content.en)).toEqual(["B", "C", "A"]);
    });

    // KNOWN BUG: after a drag reorder the slices keep their old sequence
    // numbers (no resetSlicesMoveability), so anchors and move buttons are
    // wrong until something else renumbers them.
    it.fails("renumbers slices after a drag reorder", async () => {
        const { doc, container } = await mountTree([md("A"), md("B"), md("C")]);
        const items = container.querySelectorAll("li");
        await fireEvent.dragStart(items[0], { dataTransfer: dataTransfer() });
        await fireEvent.drop(items[2], { dataTransfer: dataTransfer() });
        expect(doc.slices.map((s) => s.state.sequence)).toEqual([1, 2, 3]);
        expect(doc.slices[2].state.canMoveDown).toBe(false);
    });

    it("opens a slice in an editing dialog and locks it again on close", async () => {
        const doc = reactive(
            new PBOMLDocument(yamlDocument({ slices: [md("A")] })),
        );
        const slice = doc.slices[0];
        const { container, getByText } = render(StructureTreeSlice, {
            props: { slice, index: 0, level: 0 },
        });
        await fireEvent.click(getByText("Edit").closest("button"));
        await flush(10);
        expect(slice.state._unlocked).toBe(true);
        expect(container.querySelector("dialog")).not.toBeNull();
        await fireEvent.click(
            within(container.querySelector("dialog"))
                .getByText("Close")
                .closest("button"),
        );
        expect(slice.state._unlocked).toBe(false);
        expect(container.querySelector("dialog")).toBeNull();
    });

    it("leaves a slice unlocked if it was already unlocked", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    slices: [md("A", { state: { _unlocked: true } })],
                }),
            ),
        );
        const slice = doc.slices[0];
        const { getByText, container } = render(StructureTreeSlice, {
            props: { slice, index: 0, level: 0 },
        });
        await fireEvent.click(getByText("Edit").closest("button"));
        await flush(10);
        await fireEvent.click(
            within(container.querySelector("dialog"))
                .getByText("Close")
                .closest("button"),
        );
        expect(slice.state._unlocked).toBe(true);
    });

    // KNOWN BUG: "keep unlocked" is remembered forever. After opening an
    // unlocked slice once, a later open on the (now locked) slice no longer
    // locks it again on close.
    it.fails("locks again on close after the slice was locked in between", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    slices: [md("A", { state: { _unlocked: true } })],
                }),
            ),
        );
        const slice = doc.slices[0];
        const { getByText, container } = render(StructureTreeSlice, {
            props: { slice, index: 0, level: 0 },
        });
        const toggle = async () => {
            await fireEvent.click(getByText("Edit").closest("button"));
            await flush(10);
        };
        const close = () =>
            fireEvent.click(
                within(container.querySelector("dialog"))
                    .getByText("Close")
                    .closest("button"),
            );
        await toggle();
        await close();
        slice.state._unlocked = false; // author locks it with the lock button
        await toggle();
        await close();
        expect(slice.state._unlocked).toBe(false);
    });
});

describe("Editor strings", () => {
    it("has the same keys in English and French", () => {
        expect(Object.keys(editorStrings.fr).sort()).toEqual(
            Object.keys(editorStrings.en).sort(),
        );
    });

    // KNOWN BUG: the French "Fill from clipboard" label is still in English.
    it.fails("translates every French string that is a sentence", () => {
        expect(editorStrings.fr.bitmap_slice_fill_from_clipboard).not.toBe(
            editorStrings.en.bitmap_slice_fill_from_clipboard,
        );
    });
});
