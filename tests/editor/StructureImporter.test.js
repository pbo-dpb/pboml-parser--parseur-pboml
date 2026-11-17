import "../helpers/lang-en.js";
import { describe, it, expect, vi } from "vite-plus/test";
import { reactive } from "vue";
import { render, fireEvent, within } from "@testing-library/vue";
import StructureImporter from "../../src/components/Editor/StructureEditor/StructureImporter/StructureImporter.vue";
import StructureImporterDocxPicker from "../../src/components/Editor/StructureEditor/StructureImporter/StructureImporterDocxPicker.vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { flush, yamlDocument } from "../helpers";

vi.mock("mammoth/mammoth.browser", () => ({
    convertToHtml: vi.fn(),
}));
import * as mammoth from "mammoth/mammoth.browser";

/** Runs the importer's computed properties with a fake instance. */
function structureOf(en, fr = "") {
    const vm = { en, fr, editorStrings: {} };
    vm.walkThroughMarkdown =
        StructureImporter.methods.walkThroughMarkdown.bind(vm);
    return StructureImporter.computed.importedStructure.call(vm);
}

const EN = `# Summary

Intro paragraph.

Second paragraph.

## Details

| A | B |
|---|---|
| 1 | 2 |

![chart](chart.svg)

# Notes

1. First note [↑](#endnote-ref-1)
2. Second note
`;

const FR = `# Résumé

Paragraphe.

## Détails

| A | B |
|---|---|
| 1 | 2 |

![graphique](chart.svg)

# Notes

1. Première note [↑](#endnote-ref-1)
2. Deuxième note
`;

describe("StructureImporter: reading markdown", () => {
    it("turns headings, paragraphs, tables and images into slices", () => {
        const { slices } = structureOf(EN, FR);
        expect(slices.map((s) => s.type)).toEqual([
            "heading",
            "markdown",
            "heading",
            "table",
            "markdown",
            "svg",
        ]);
    });

    it("uses one markdown slice for consecutive paragraphs", () => {
        const { slices } = structureOf("Para 1.\n\nPara 2.\n\nPara 3.");
        expect(slices.map((s) => s.type)).toEqual(["markdown"]);
    });

    it("converts heading depth to a zero-based level", () => {
        const { slices } = structureOf(EN, FR);
        const headings = slices.filter((s) => s.type === "heading");
        expect(headings.map((h) => h.level)).toEqual([0, 1]);
    });

    it("pairs English and French heading text", () => {
        const { slices } = structureOf(EN, FR);
        expect(slices[0].content).toEqual({ en: "Summary", fr: "Résumé" });
        expect(slices[0].state._unlocked).toBe(false);
    });

    it("presents tables and images as figures", () => {
        const { slices } = structureOf(EN, FR);
        expect(slices.find((s) => s.type === "table").presentation).toBe(
            "figure",
        );
        expect(slices.find((s) => s.type === "svg").presentation).toBe(
            "figure",
        );
    });

    it("turns the list after a level-1 'Notes' heading into annotations", () => {
        const { slices, annotations } = structureOf(EN, FR);
        expect(slices.some((s) => s.content?.en === "Notes")).toBe(false);
        expect(annotations.map((a) => a.id)).toEqual([1, 2]);
        expect(annotations[0].content).toEqual({
            en: "First note",
            fr: "Première note",
        });
    });

    it("flags slices whose type differs between languages", () => {
        const { slices } = structureOf("# Title\n\nText", "Text only");
        expect(slices[0].state._structureImporterError).toMatch(
            /type mismatch/,
        );
    });

    it("flags headings whose level differs between languages", () => {
        const { slices } = structureOf("# Title", "## Titre");
        expect(slices[0].state._structureImporterError).toMatch(
            /level mismatch/,
        );
    });

    it("flags every slice when only English is given", () => {
        const { slices } = structureOf("# Title");
        expect(slices[0].state._structureImporterError).toMatch(
            /type mismatch/,
        );
    });
});

describe("StructureImporter component", () => {
    const mountImporter = async (doc) => {
        const view = render(StructureImporter, {
            props: { pbomlDocument: doc },
        });
        await flush();
        const [en, fr] = view.container.querySelectorAll("textarea");
        // Queries scoped to this importer only.
        return { ...view, ...within(view.container), en, fr };
    };

    it("disables Import until English markdown is entered", async () => {
        const doc = reactive(new PBOMLDocument(yamlDocument()));
        const { getByText, en } = await mountImporter(doc);
        expect(getByText("Import").closest("button").disabled).toBe(true);
        await fireEvent.update(en, "# Title");
        expect(getByText("Import").closest("button").disabled).toBe(false);
    });

    it("previews the structure with errors highlighted", async () => {
        const doc = reactive(new PBOMLDocument(yamlDocument()));
        const { container, en, fr } = await mountImporter(doc);
        await fireEvent.update(en, "# Title\n\nText");
        await fireEvent.update(fr, "## Titre\n\nTexte");
        const items = container.querySelectorAll("ol li");
        expect(items).toHaveLength(2);
        expect(items[0].className).toContain("bg-red-300");
        expect(items[0].textContent).toContain("Heading");
    });

    it("appends the imported slices and notes to the document and closes", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    slices: [{ type: "markdown", content: { en: "Existing" } }],
                }),
            ),
        );
        const { getByText, en, fr, emitted } = await mountImporter(doc);
        await fireEvent.update(en, EN);
        await fireEvent.update(fr, FR);
        await fireEvent.click(getByText("Import").closest("button"));
        expect(doc.slices).toHaveLength(7);
        expect(doc.slices[0].content.en).toBe("Existing");
        expect(doc.annotations).toHaveLength(2);
        expect(emitted().close).toHaveLength(1);
    });

    // KNOWN BUG: imported slices are appended directly to the slices array
    // without resetSlicesMoveability(), so they keep sequence 0. They all get
    // the same anchor (e.g. "heading-0") and the move buttons are wrong.
    it.fails("numbers imported slices after the existing ones", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    slices: [{ type: "markdown", content: { en: "Existing" } }],
                }),
            ),
        );
        const { getByText, en, fr } = await mountImporter(doc);
        await fireEvent.update(en, "# One\n\n# Two");
        await fireEvent.update(fr, "# Un\n\n# Deux");
        await fireEvent.click(getByText("Import").closest("button"));
        expect(doc.slices.map((s) => s.state.sequence)).toEqual([1, 2, 3]);
        expect(new Set(doc.slices.map((s) => s.anchor)).size).toBe(3);
    });

    // KNOWN BUG: the preview inserts heading and note text with innerHTML
    // (v-html), so HTML in a pasted or imported document runs in the editor.
    it.fails("does not inject HTML from the imported text into the preview", async () => {
        const doc = reactive(new PBOMLDocument(yamlDocument()));
        const { container, en } = await mountImporter(doc);
        await fireEvent.update(en, '# Title <img src="x" onerror="alert(1)">');
        expect(container.querySelector("ol img")).toBeNull();
    });
});

describe("StructureImporterDocxPicker", () => {
    const pick = async (html, language = "en") => {
        mammoth.convertToHtml.mockResolvedValue({ value: html, messages: [] });
        const view = render(StructureImporterDocxPicker, {
            props: { language },
        });
        const input = view.container.querySelector("input[type=file]");
        const file = new File(["fake"], "report.docx");
        Object.defineProperty(input, "files", { value: [file] });
        await fireEvent.change(input);
        await flush(10);
        return view.emitted().pick?.[0]?.[0];
    };

    it("converts the Word document to markdown and emits it with the language", async () => {
        const picked = await pick(
            "<h1>Title</h1><p>Body <strong>text</strong></p>",
            "fr",
        );
        expect(picked.language).toBe("fr");
        expect(picked.markdown).toBe("# Title\n\nBody **text**");
    });

    it("drops everything up to and including the Highlights section in reports", async () => {
        const picked = await pick(
            '<p>Cover page</p><h1><a id="h1"></a>Highlights</h1><p>Key points</p><h1>Introduction</h1><p>Body</p>',
        );
        expect(picked.markdown).toBe("# Introduction\n\nBody");
    });

    it("recognizes the French 'Faits saillants' section", async () => {
        const picked = await pick(
            '<p>Page titre</p><h1><a id="x"></a>Faits saillants</h1><p>Points</p><h1>Contexte</h1><p>Texte</p>',
            "fr",
        );
        expect(picked.markdown).toBe("# Contexte\n\nTexte");
    });

    it("keeps documents without a Highlights section whole", async () => {
        const picked = await pick("<p>Cover</p><h1>Intro</h1>");
        expect(picked.markdown).toBe("Cover\n\n# Intro");
    });
});
