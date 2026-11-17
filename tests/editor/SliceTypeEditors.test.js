import "../helpers/lang-en.js";
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { reactive, h } from "vue";
import { render, fireEvent, within } from "@testing-library/vue";
import MarkdownSliceEditor from "../../src/editors/MarkdownSliceEditor";
import HeadingSliceEditor from "../../src/editors/HeadingSliceEditor";
import LaTeXSliceEditor from "../../src/editors/LaTeXSliceEditor";
import HtmlSliceEditor from "../../src/editors/HtmlSliceEditor";
import SvgSliceEditor from "../../src/editors/SvgSliceEditor";
import KvSliceEditor from "../../src/editors/KvSliceEditor";
import BitmapSliceEditor from "../../src/editors/BitmapSliceEditor";
import TableSliceEditor from "../../src/editors/TableSliceEditor";
import ChartSliceEditor from "../../src/editors/ChartSliceEditor";
import SliceMetaEditor from "../../src/editors/SliceMetaEditor";
import SliceMetasEditor from "../../src/editors/SliceMetasEditor";
import PBOMLDocument from "../../src/models/PBOMLDocument";
vi.mock("chart.js/auto", () => import("../helpers/chartjs-stub.js"));
import { flush, loadSample, yamlDocument, waitUntil } from "../helpers";

/** Builds a reactive slice through PBOMLDocument, like the editor does. */
const sliceOf = (payload) =>
    reactive(new PBOMLDocument(yamlDocument({ slices: [payload] }))).slices[0];

const mountEditor = async (Editor, slice, props = {}) => {
    const view = render(Editor, { props: { slice, ...props } });
    await flush();
    return { ...view, q: within(view.container) };
};

afterEach(() => vi.restoreAllMocks());

describe("Read-only slices", () => {
    it.each([
        [
            "MarkdownSliceEditor",
            MarkdownSliceEditor,
            { type: "markdown", content: { en: "Body EN", fr: "Body FR" } },
        ],
        [
            "HeadingSliceEditor",
            HeadingSliceEditor,
            { type: "heading", content: { en: "Body EN", fr: "Body FR" } },
        ],
        [
            "KvSliceEditor",
            KvSliceEditor,
            {
                type: "kvlist",
                prototype: {
                    key: { type: "markdown" },
                    value: { type: "markdown" },
                },
                content: [
                    {
                        key: { content: { en: "Body EN", fr: "Body FR" } },
                        value: { content: { en: "v", fr: "v" } },
                    },
                ],
            },
        ],
        [
            "TableSliceEditor",
            TableSliceEditor,
            {
                type: "table",
                variables: {
                    a: {
                        is_descriptive: true,
                        label: { en: "Body EN", fr: "Body FR" },
                    },
                },
                content: [{ a: "x" }],
            },
        ],
    ])("%s shows both languages and no inputs", async (_, Editor, payload) => {
        const slice = sliceOf({ ...payload, readonly: true });
        const { container } = await mountEditor(Editor, slice);
        expect(container.textContent).toContain("Body EN");
        expect(container.textContent).toContain("Body FR");
        expect(container.querySelector("input, textarea")).toBeNull();
    });

    // KNOWN BUG: in the read-only (and arraytable) branch, render() returns
    // a function instead of a vnode. Vue prints it as text, so authors see
    // the JavaScript source of the function instead of the chart.
    it.fails("ChartSliceEditor shows a read-only chart's preview", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("charts0"));
        const chart = reactive(doc.slices.find((s) => s.type === "chart"));
        chart.readonly = true;
        const { container } = await mountEditor(ChartSliceEditor, chart);
        expect(container.textContent).not.toContain("=>");
        expect(container.querySelectorAll("section")).toHaveLength(2);
    });
});

describe("MarkdownSliceEditor", () => {
    it("emits the edited content with the other language unchanged", async () => {
        const slice = sliceOf({
            type: "markdown",
            content: { en: "A", fr: "B" },
        });
        const { q, emitted } = await mountEditor(MarkdownSliceEditor, slice);
        await fireEvent.update(q.getByLabelText("FR"), "C");
        expect(emitted()["update:modelValue"].at(-1)[0]).toEqual({
            en: "A",
            fr: "C",
        });
    });
});

describe("HeadingSliceEditor", () => {
    it("changes the heading level", async () => {
        const slice = sliceOf({
            type: "heading",
            level: 0,
            content: { en: "T" },
        });
        const { container } = await mountEditor(HeadingSliceEditor, slice);
        const radios = container.querySelectorAll("input[type=radio]");
        expect(radios).toHaveLength(4);
        await fireEvent.input(radios[2]);
        expect(slice.level).toBe(2);
    });

    it("edits the heading text", async () => {
        const slice = sliceOf({
            type: "heading",
            content: { en: "Old", fr: "Ancien" },
        });
        const { q } = await mountEditor(HeadingSliceEditor, slice);
        await fireEvent.update(q.getByLabelText("EN"), "New");
        expect(slice.content).toEqual({ en: "New", fr: "Ancien" });
    });
});

describe("LaTeXSliceEditor and HtmlSliceEditor", () => {
    it.each([
        ["LaTeX", LaTeXSliceEditor],
        ["html", HtmlSliceEditor],
    ])(
        "%s editor emits content when a text area changes",
        async (type, Editor) => {
            const slice = sliceOf({ type, content: { en: "en", fr: "fr" } });
            const { container, emitted } = await mountEditor(Editor, slice);
            const [en] = container.querySelectorAll("textarea");
            en.value = "changed";
            await fireEvent.change(en);
            expect(emitted()["update:modelValue"].at(-1)[0]).toEqual({
                en: "changed",
                fr: "fr",
            });
        },
    );

    // KNOWN BUG (accessibility): the EN / FR labels are not linked to their
    // text areas (no for/id and not wrapping them).
    it.fails.each([
        ["LaTeX", LaTeXSliceEditor],
        ["html", HtmlSliceEditor],
    ])(
        "%s editor links the EN label to its text area",
        async (type, Editor) => {
            const slice = sliceOf({ type, content: { en: "en", fr: "fr" } });
            const { q } = await mountEditor(Editor, slice);
            expect(q.getByLabelText("EN").tagName).toBe("TEXTAREA");
        },
    );

    it("HtmlSliceEditor shows CSS options only in meta editing mode", async () => {
        const slice = sliceOf({ type: "html", content: { en: "<p>x</p>" } });
        const hidden = await mountEditor(HtmlSliceEditor, slice);
        expect(hidden.container.querySelectorAll("textarea")).toHaveLength(2);

        const shown = await mountEditor(HtmlSliceEditor, slice, {
            isEditingMeta: true,
        });
        const textareas = shown.container.querySelectorAll("textarea");
        expect(textareas).toHaveLength(3);
        textareas[0].value = "p { color: red }";
        await fireEvent.change(textareas[0]);
        expect(slice.css).toBe("p { color: red }");
        textareas[0].value = "";
        await fireEvent.change(textareas[0]);
        expect(slice.css).toBeNull();

        await fireEvent.click(
            shown.container.querySelector("input[type=checkbox]"),
        );
        expect(slice.remove_default_styles).toBe(true);
    });
});

describe("SvgSliceEditor", () => {
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="5" height="5"/></svg>';

    it("loads an uploaded .svg file into the right language", async () => {
        const slice = sliceOf({ type: "svg", content: { en: svg } });
        const { container, emitted } = await mountEditor(SvgSliceEditor, slice);
        const [, frInput] = container.querySelectorAll("input[type=file]");
        const file = new File([svg.replace("5", "7")], "fr.svg", {
            type: "image/svg+xml",
        });
        Object.defineProperty(frInput, "files", { value: [file] });
        await fireEvent.change(frInput);
        await waitUntil(() =>
            expect(emitted()["update:modelValue"]).toBeTruthy(),
        );
        const [updated] = emitted()["update:modelValue"][0];
        expect(updated.en).toBe(svg);
        expect(updated.fr).toContain('width="7"');
    });

    it("shows a warning icon and no tools when a language has no SVG", async () => {
        const slice = sliceOf({ type: "svg", content: { en: svg } });
        const { container } = await mountEditor(SvgSliceEditor, slice);
        const summaries = [...container.querySelectorAll("summary")].map(
            (s) => s.textContent,
        );
        expect(summaries.filter((s) => s === "SVG Tools")).toHaveLength(1);
        expect(container.querySelector(".text-yellow-500")).not.toBeNull();
    });

    it("applies an SVG tool result to the slice", async () => {
        const slice = sliceOf({
            type: "svg",
            content: { en: svg.replace("<rect", '<rect fill="#FFF"') },
        });
        const { container } = await mountEditor(SvgSliceEditor, slice);
        const toolButtons = [...container.querySelectorAll("details button")];
        // Fitter, white remover, sanitizer
        await fireEvent.click(toolButtons[1]);
        expect(slice.content.en).toContain("rgba(255,255,255,0)");
    });

    it("edits the source code of a language", async () => {
        const slice = sliceOf({ type: "svg", content: { en: svg } });
        const { container, emitted } = await mountEditor(SvgSliceEditor, slice);
        const source = container.querySelector("details textarea");
        source.value = "<svg/>";
        await fireEvent.change(source);
        expect(emitted()["update:modelValue"].at(-1)[0].en).toBe("<svg/>");
    });
});

describe("KvSliceEditor", () => {
    const kv = () =>
        sliceOf({
            type: "kvlist",
            prototype: {
                key: { type: "markdown", label: { en: "Name", fr: "Nom" } },
                value: { type: "markdown", label: { en: "Role", fr: "Rôle" } },
            },
            content: [
                {
                    key: { content: { en: "Alice", fr: "Alice" } },
                    value: { content: { en: "Analyst", fr: "Analyste" } },
                },
            ],
        });

    it("shows one block per pair with its labels", async () => {
        const { container } = await mountEditor(KvSliceEditor, kv());
        expect(container.textContent).toContain("Name • Nom");
        expect(container.textContent).toContain("Role • Rôle");
        expect(
            [...container.querySelectorAll("input")].map((i) => i.value),
        ).toEqual(["Alice", "Alice", "Analyst", "Analyste"]);
    });

    it("edits a value", async () => {
        const slice = kv();
        const { container } = await mountEditor(KvSliceEditor, slice);
        await fireEvent.update(
            container.querySelectorAll("input")[3],
            "Analyste principale",
        );
        expect(slice.content[0].value.content.fr).toBe("Analyste principale");
    });

    it("adds and removes pairs", async () => {
        const slice = kv();
        const { container } = await mountEditor(KvSliceEditor, slice);
        const add = [...container.querySelectorAll("button")].find(
            (b) => b.textContent === "➕",
        );
        await fireEvent.click(add);
        expect(slice.content).toHaveLength(2);
        const remove = container.querySelector("button.bg-red-100");
        await fireEvent.click(remove);
        expect(slice.content).toHaveLength(1);
    });

    it("edits the key/value labels and display_labels in meta editing mode", async () => {
        const slice = kv();
        const { q } = await mountEditor(KvSliceEditor, slice, {
            isEditingMeta: true,
        });
        await fireEvent.click(q.getByLabelText("Display labels"));
        expect(slice.prototype.display_labels).toBe(true);
    });
});

describe("BitmapSliceEditor", () => {
    const bitmap = (extra = {}) =>
        sliceOf({
            type: "bitmap",
            content: { en: "https://x/en.png", fr: "" },
            ...extra,
        });

    it("previews each language and marks a missing one", async () => {
        const { container } = await mountEditor(BitmapSliceEditor, bitmap());
        const figures = container.querySelectorAll("figure");
        expect(figures[0].querySelector("img").getAttribute("src")).toBe(
            "https://x/en.png",
        );
        expect(figures[1].textContent).toBe("❌");
    });

    it("edits a thumbnail URL", async () => {
        const slice = bitmap();
        const { container } = await mountEditor(BitmapSliceEditor, slice);
        const legend = [...container.querySelectorAll("legend")].find(
            (l) => l.textContent.trim() === "fr : sm_2x_webp",
        );
        await fireEvent.update(
            legend.parentElement.querySelector("input"),
            "https://x/fr-sm.webp",
        );
        expect(slice.thumbnails.fr.sm_2x_webp).toBe("https://x/fr-sm.webp");
    });

    it("fills empty fields from YAML on the clipboard without overwriting set ones", async () => {
        const slice = bitmap();
        const yaml = [
            "type: bitmap",
            "content: { en: 'https://other/en.png', fr: 'https://x/fr.png' }",
            "thumbnails: { fr: { lg_1x_png: 'https://x/fr-lg.png' } }",
        ].join("\n");
        vi.stubGlobal("navigator", {
            ...navigator,
            clipboard: { readText: vi.fn(async () => yaml) },
        });
        const { q } = await mountEditor(BitmapSliceEditor, slice);
        await fireEvent.click(
            q.getByText("Fill from clipboard").closest("button"),
        );
        await flush();
        expect(slice.content).toEqual({
            en: "https://x/en.png",
            fr: "https://x/fr.png",
        });
        expect(slice.thumbnails.fr.lg_1x_png).toBe("https://x/fr-lg.png");
        vi.unstubAllGlobals();
    });

    it("warns about invalid YAML on the clipboard", async () => {
        window.alert = vi.fn();
        vi.stubGlobal("navigator", {
            ...navigator,
            clipboard: { readText: vi.fn(async () => "a: [") },
        });
        const { q } = await mountEditor(BitmapSliceEditor, bitmap());
        await fireEvent.click(
            q.getByText("Fill from clipboard").closest("button"),
        );
        await flush();
        expect(window.alert).toHaveBeenCalledWith("⚠️ Invalid YAML.");
        vi.unstubAllGlobals();
    });

    // KNOWN BUG (accessibility): the preview images have no alt text.
    it.fails("gives the preview images alt text", async () => {
        const { container } = await mountEditor(BitmapSliceEditor, bitmap());
        expect(container.querySelector("figure img").hasAttribute("alt")).toBe(
            true,
        );
    });
});

describe("TableSliceEditor and ChartSliceEditor", () => {
    it("TableSliceEditor shows the data table editor", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const table = reactive(doc.slices.find((s) => s.type === "table"));
        const { q } = await mountEditor(TableSliceEditor, table);
        expect(q.getByRole("tab", { name: /Tabular data/ })).toBeTruthy();
    });

    it("ChartSliceEditor shows EN/FR previews and the data table editor with chart options", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("charts0"));
        const chart = reactive(doc.slices.find((s) => s.type === "chart"));
        const { container, q } = await mountEditor(ChartSliceEditor, chart);
        expect(container.querySelectorAll("section")).toHaveLength(2);
        expect(q.getByRole("tab", { name: /Tabular data/ })).toBeTruthy();
        // Chart-only toggles ("skip in chart") appear in the visual editor.
        expect(
            container.querySelector(
                '[aria-pressed][title*="hart"], [aria-pressed][aria-label*="hart"]',
            ),
        ).not.toBeNull();
    });
});

describe("SliceMetaEditor (sources, notes, textual descriptions)", () => {
    const slice = () =>
        sliceOf({
            type: "markdown",
            content: { en: "x" },
            sources: [{ en: "S1", fr: "S1-fr" }],
        });

    it("shows the count and expands on click", async () => {
        const s = slice();
        const { container, q } = await mountEditor(SliceMetaEditor, s, {
            meta_type: "sources",
        });
        expect(container.textContent).toContain("Sources");
        expect(container.textContent).toContain("1");
        expect(container.querySelector("input")).toBeNull();
        await fireEvent.click(q.getByRole("button"));
        expect(container.querySelectorAll("input")).toHaveLength(2);
    });

    it("adds, edits and removes entries", async () => {
        const s = slice();
        const { container, q } = await mountEditor(SliceMetaEditor, s, {
            meta_type: "sources",
        });
        await fireEvent.click(q.getByRole("button"));
        await fireEvent.update(
            container.querySelectorAll("input")[1],
            "S1-modifié",
        );
        expect(s.sources[0].fr).toBe("S1-modifié");

        const add = [...container.querySelectorAll("button")].at(-1);
        await fireEvent.click(add);
        expect(s.sources).toHaveLength(2);

        await fireEvent.click(container.querySelector("button.bg-red-100"));
        expect(s.sources).toHaveLength(1);
    });

    it("uses large side-by-side fields for notes and textual descriptions", async () => {
        const s = sliceOf({
            type: "markdown",
            content: { en: "x" },
            notes: [{ en: "N" }],
        });
        const { container, q } = await mountEditor(SliceMetaEditor, s, {
            meta_type: "notes",
        });
        await fireEvent.click(q.getByRole("button"));
        expect(container.querySelectorAll("textarea")).toHaveLength(2);
    });

    it("SliceMetasEditor lists the three kinds", async () => {
        const { container } = await mountEditor(SliceMetasEditor, slice());
        const titles = [...container.querySelectorAll(".uppercase")].map(
            (t) => t.textContent,
        );
        expect(titles).toEqual(["Textual descriptions", "Sources", "Notes"]);
    });

    // KNOWN BUG (accessibility): the toggle is a <div role="button"> with no
    // tabindex, key handler or aria-expanded, so it can't be used from the
    // keyboard and screen readers don't know whether it is open.
    it.fails("can be opened from the keyboard and reports its state", async () => {
        const { q } = await mountEditor(SliceMetaEditor, slice(), {
            meta_type: "sources",
        });
        const toggle = q.getByRole("button");
        expect(toggle.getAttribute("tabindex")).toBe("0");
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
    });
});
