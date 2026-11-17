import { describe, it, expect, vi } from "vite-plus/test";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import Slice from "../../src/models/contents/Slice";
import BitmapSlice from "../../src/models/contents/BitmapSlice";
import ChartSlice from "../../src/models/contents/ChartSlice";
import HeadingSlice from "../../src/models/contents/HeadingSlice";
import HtmlSlice from "../../src/models/contents/HtmlSlice";
import KvListSlice from "../../src/models/contents/KvListSlice";
import LaTeXSlice from "../../src/models/contents/LaTeXSlice";
import MarkdownSlice from "../../src/models/contents/MarkdownSlice";
import SvgSlice from "../../src/models/contents/SvgSlice";
import TableSlice from "../../src/models/contents/TableSlice";
import { loadSample, plain, yamlDocument } from "../helpers";

const md = (en, fr = en, extra = {}) => ({
    type: "markdown",
    content: { en, fr },
    ...extra,
});

describe("Slice type mapping", () => {
    it.each([
        ["bitmap", BitmapSlice],
        ["chart", ChartSlice],
        ["heading", HeadingSlice],
        ["html", HtmlSlice],
        ["kvlist", KvListSlice],
        ["LaTeX", LaTeXSlice],
        ["markdown", MarkdownSlice],
        ["svg", SvgSlice],
        ["table", TableSlice],
    ])("creates a %s slice as %o", (type, cls) => {
        const slice = PBOMLDocument.provisionSliceFromPayload({ type });
        expect(slice).toBeInstanceOf(cls);
        expect(slice).toBeInstanceOf(Slice);
        expect(slice.type).toBe(type);
    });

    it("returns nothing for an unknown type", () => {
        expect(
            PBOMLDocument.provisionSliceFromPayload({ type: "video" }),
        ).toBeUndefined();
    });

    it("is case-sensitive (latex is not LaTeX)", () => {
        expect(
            PBOMLDocument.provisionSliceFromPayload({ type: "latex" }),
        ).toBeUndefined();
    });

    it("drops slices of unknown type from the document", () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                slices: [md("A"), { type: "video" }, md("B")],
            }),
        );
        expect(doc.slices.map((s) => s.content.en)).toEqual(["A", "B"]);
    });

    it.each([
        ["bitmap", "BitmapSliceHtmlRenderer"],
        ["chart", "ChartSliceHtmlRenderer"],
        ["heading", "HeadingSliceHtmlRenderer"],
        ["html", "HtmlSliceHtmlRenderer"],
        ["kvlist", "KvListSliceHtmlRenderer"],
        ["LaTeX", "LaTeXSliceHtmlRenderer"],
        ["markdown", "MarkdownSliceHtmlRenderer"],
        ["svg", "SvgSliceHtmlRenderer"],
        ["table", "TableSliceHtmlRenderer"],
    ])("maps a %s slice to %s", (type, rendererName) => {
        const slice = PBOMLDocument.provisionSliceFromPayload({ type });
        expect(
            slice.constructor.rendererObjectForSliceRendererType("html"),
        ).toBe(rendererName);
    });

    it("throws for an unknown renderer type", () => {
        expect(() =>
            MarkdownSlice.rendererObjectForSliceRendererType("pdf"),
        ).toThrow(/pdf/);
    });
});

describe("Shared slice fields (Slice)", () => {
    it("applies defaults when fields are missing", () => {
        const slice = new MarkdownSlice({ type: "markdown" });
        expect(slice.readonly).toBe(false);
        expect(slice.display_label).toBe(true);
        expect(slice.print_only).toBe(false);
        expect(slice.presentation).toBeNull();
        expect(slice.sources).toEqual([]);
        expect(slice.notes).toEqual([]);
        expect(slice.alts).toEqual([]);
        expect(slice.label).toEqual({ en: undefined, fr: undefined });
    });

    it("reads bilingual label, referenced_as, sources, notes and alts", () => {
        const slice = new MarkdownSlice({
            type: "markdown",
            label: { en: "Label", fr: "Libellé" },
            referenced_as: { en: "Table 1", fr: "Tableau 1" },
            sources: [{ en: "S", fr: "S-fr" }],
            notes: [{ en: "N", fr: "N-fr" }],
            alts: [{ en: "A", fr: "A-fr" }],
        });
        expect(slice.label).toEqual({ en: "Label", fr: "Libellé" });
        expect(slice.referenced_as).toEqual({ en: "Table 1", fr: "Tableau 1" });
        expect(slice.sources).toEqual([{ en: "S", fr: "S-fr" }]);
        expect(slice.notes).toEqual([{ en: "N", fr: "N-fr" }]);
        expect(slice.alts).toEqual([{ en: "A", fr: "A-fr" }]);
    });

    it("leaves default values out of the serialized slice", () => {
        const out = new MarkdownSlice(md("x")).toArray();
        ["readonly", "display_label", "print_only", "presentation"].forEach(
            (key) => expect(out).not.toHaveProperty(key),
        );
        ["referenced_as", "sources", "notes", "alts"].forEach((key) =>
            expect(out).not.toHaveProperty(key),
        );
    });

    it("keeps non-default values in the serialized slice", () => {
        const out = new MarkdownSlice(
            md("x", "x", {
                readonly: true,
                display_label: false,
                print_only: true,
                presentation: "figure",
                referenced_as: { en: "Figure 1" },
            }),
        ).toArray();
        expect(out).toMatchObject({
            readonly: true,
            display_label: false,
            print_only: true,
            presentation: "figure",
        });
        expect(out.referenced_as.en).toBe("Figure 1");
    });

    it("serializes the unlocked state only when set", () => {
        expect(new MarkdownSlice(md("x")).toArray()).not.toHaveProperty(
            "state",
        );
        expect(
            new MarkdownSlice({
                ...md("x"),
                state: { _unlocked: true },
            }).toArray().state,
        ).toEqual({ _unlocked: true });
    });

    it("combines referenced_as and label into labelStrings", () => {
        const slice = new MarkdownSlice({
            type: "markdown",
            referenced_as: { en: "Table 1" },
            label: { en: "Costs", fr: "Coûts" },
        });
        expect(slice.labelStrings).toEqual({
            en: ["Table 1", "Costs"],
            fr: ["Coûts"],
        });
    });

    it("builds the anchor from prefix, type and sequence", () => {
        const doc = new PBOMLDocument(
            yamlDocument({ slices: [md("A"), md("B")] }),
            "p",
        );
        expect(doc.slices.map((s) => s.anchor)).toEqual([
            "p-markdown-1",
            "p-markdown-2",
        ]);
        const unprefixed = new PBOMLDocument(
            yamlDocument({ slices: [md("A")] }),
        );
        expect(unprefixed.slices[0].anchor).toBe("markdown-1");
    });
});

describe("Slice-specific fields", () => {
    it("HeadingSlice: level defaults to 0 and is serialized", () => {
        expect(new HeadingSlice({ type: "heading" }).level).toBe(0);
        expect(
            new HeadingSlice({ type: "heading", level: 2 }).toArray().level,
        ).toBe(2);
    });

    it("HeadingSlice: label, display_label and presentation are not serialized", () => {
        const out = new HeadingSlice({
            type: "heading",
            label: { en: "x" },
            display_label: false,
            presentation: "figure",
            content: { en: "Title", fr: "Titre" },
        }).toArray();
        expect(out).not.toHaveProperty("label");
        expect(out).not.toHaveProperty("display_label");
        expect(out).not.toHaveProperty("presentation");
        expect(out.content).toEqual({ en: "Title", fr: "Titre" });
    });

    it("HtmlSlice: css and remove_default_styles are left out when default", () => {
        const out = new HtmlSlice({
            type: "html",
            content: { en: "<p>x</p>" },
        }).toArray();
        expect(out).not.toHaveProperty("css");
        expect(out).not.toHaveProperty("remove_default_styles");
    });

    it("HtmlSlice: css and remove_default_styles are kept when set", () => {
        const out = new HtmlSlice({
            type: "html",
            content: { en: "<p>x</p>" },
            css: "p { color: red; }",
            remove_default_styles: true,
        }).toArray();
        expect(out.css).toBe("p { color: red; }");
        expect(out.remove_default_styles).toBe(true);
    });

    it("BitmapSlice: thumbnails are serialized only when present", () => {
        const plainBitmap = new BitmapSlice({
            type: "bitmap",
            content: { en: "a.png", fr: "b.png" },
        });
        expect(plainBitmap.toArray()).not.toHaveProperty("thumbnails");

        const withThumbs = new BitmapSlice({
            type: "bitmap",
            content: { en: "a.png" },
            thumbnails: { en: { sm_1x_webp: "a-sm.webp" } },
        });
        expect(withThumbs.toArray().thumbnails.en).toEqual({
            sm_1x_webp: "a-sm.webp",
        });
    });

    it("SvgSlice: gives each slice a unique render id prefix", () => {
        const a = new SvgSlice({ type: "svg" });
        const b = new SvgSlice({ type: "svg" });
        expect(a.state.renderedAnchorIdPrefix).not.toBe(
            b.state.renderedAnchorIdPrefix,
        );
    });

    it("TableSlice: uses the slice label as the table caption", () => {
        const slice = new TableSlice({
            type: "table",
            label: { en: "Costs", fr: "Coûts" },
            variables: {},
            content: [],
        });
        expect(slice.datatable.state.caption).toEqual({
            en: ["Costs"],
            fr: ["Coûts"],
        });
    });

    it("TableSlice: serializes variables and content at the slice level", () => {
        const out = new TableSlice({
            type: "table",
            variables: { year: { is_descriptive: true } },
            content: [{ year: "2024" }],
        }).toArray();
        expect(out.variables).toHaveProperty("year");
        expect(out.content).toEqual([{ year: "2024" }]);
        expect(out).not.toHaveProperty("datatable");
    });
});

describe("PBOMLDocument: document fields", () => {
    it("reads id, title, type, copyright and release date", () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                document: {
                    id: "RP-1",
                    title: { en: "Title", fr: "Titre" },
                    type: { en: "Report", fr: "Rapport" },
                    copyright: { en: "© PBO", fr: "© DPB" },
                    release_date: "2024-03-15T12:00:00.000Z",
                },
            }),
        );
        expect(doc.id).toBe("RP-1");
        expect(doc.title).toEqual({ en: "Title", fr: "Titre" });
        expect(doc.type).toEqual({ en: "Report", fr: "Rapport" });
        expect(doc.copyright).toEqual({ en: "© PBO", fr: "© DPB" });
        expect(doc.release_date.toISOString()).toBe("2024-03-15T12:00:00.000Z");
    });

    it("localizes the release date in English and French", () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                document: { release_date: "2024-03-15T12:00:00.000Z" },
            }),
        );
        expect(doc.localizedReleaseDate.en).toMatch(/March 15, 2024/);
        expect(doc.localizedReleaseDate.fr).toMatch(/15 mars 2024/);
    });

    it("has no localized release date when none is set", () => {
        expect(
            new PBOMLDocument(yamlDocument()).localizedReleaseDate,
        ).toBeUndefined();
    });

    it("loads every slice from leg0.yaml with the right classes", () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const classes = doc.slices.map((s) => s.constructor.name);
        expect(classes).toContain("TableSlice");
        expect(classes).toContain("KvListSlice");
        expect(classes).toContain("MarkdownSlice");
    });
});

describe("PBOMLDocument: slice order and moves", () => {
    const threeSlices = () =>
        new PBOMLDocument(
            yamlDocument({ slices: [md("A"), md("B"), md("C")] }),
        );
    const contents = (doc) => doc.slices.map((s) => s.content.en);

    it("numbers slices from 1", () => {
        expect(threeSlices().slices.map((s) => s.state.sequence)).toEqual([
            1, 2, 3,
        ]);
    });

    it("prevents moving the first slice up and the last slice down", () => {
        const doc = threeSlices();
        expect(doc.slices[0].state.canMoveUp).toBe(false);
        expect(doc.slices[2].state.canMoveDown).toBe(false);
        expect(doc.slices[1].state.canMoveUp).toBe(true);
        expect(doc.slices[1].state.canMoveDown).toBe(true);
    });

    // KNOWN BUG: the last-slice check compares against
    // `mainDocument.slices.length`, which is undefined when `slices` is a map.
    it.fails("prevents moving the last slice down when slices is a map", () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("slicesIsObject"));
        expect(doc.slices.at(-1).state.canMoveDown).toBe(false);
    });

    // KNOWN BUG: the counter also counts slices of unknown type that are
    // later dropped, which leaves gaps. deleteSlice/moveSlice use
    // `sequence - 1` as the array index, so they then act on the wrong slice.
    it.fails("numbers slices without gaps when an unknown slice is skipped", () => {
        const doc = new PBOMLDocument(
            yamlDocument({ slices: [md("A"), { type: "video" }, md("B")] }),
        );
        expect(doc.slices.map((s) => s.state.sequence)).toEqual([1, 2]);
    });

    it.fails("deletes the right slice when an unknown slice was skipped", () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                slices: [md("A"), { type: "video" }, md("B"), md("C")],
            }),
        );
        const b = doc.slices.find((s) => s.content.en === "B");
        doc.deleteSlice(b);
        expect(contents(doc)).toEqual(["A", "C"]);
    });

    it("moves a slice down and renumbers", () => {
        const doc = threeSlices();
        doc.moveSlice(doc.slices[0], "down");
        expect(contents(doc)).toEqual(["B", "A", "C"]);
        expect(doc.slices.map((s) => s.state.sequence)).toEqual([1, 2, 3]);
        expect(doc.slices[0].state.canMoveUp).toBe(false);
    });

    it("moves a slice up and renumbers", () => {
        const doc = threeSlices();
        doc.moveSlice(doc.slices[2], "up");
        expect(contents(doc)).toEqual(["A", "C", "B"]);
        expect(doc.slices[2].state.canMoveDown).toBe(false);
    });

    it("inserts a slice at index 0", () => {
        const doc = threeSlices();
        doc.addSlice(new MarkdownSlice(md("Z")), 0);
        expect(contents(doc)).toEqual(["Z", "A", "B", "C"]);
        expect(doc.slices[0].state.canMoveUp).toBe(false);
        expect(doc.slices[1].state.canMoveUp).toBe(true);
    });

    it("deletes the last slice and updates moveability", () => {
        const doc = threeSlices();
        doc.deleteSlice(doc.slices[2]);
        expect(contents(doc)).toEqual(["A", "B"]);
        expect(doc.slices[1].state.canMoveDown).toBe(false);
    });

    it("duplicates a slice into an independent copy", () => {
        const doc = threeSlices();
        doc.duplicateSlice(doc.slices[0]);
        const copy = doc.slices.at(-1);
        expect(copy).not.toBe(doc.slices[0]);
        doc.slices[0].content.en = "changed";
        expect(copy.content.en).toBe("A");
    });

    // KNOWN BUG: DataTableEntry copies cell objects by reference, so a
    // duplicated table shares its { en, fr } cells with the original.
    it.fails("duplicates a table whose cells are independent of the original", () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const table = doc.slices.find((s) => s.type === "table");
        doc.duplicateSlice(table);
        const copy = doc.slices.at(-1);
        const before = plain(copy.datatable.content[0].fiscalyear);
        table.datatable.content[0].fiscalyear.en = "changed";
        expect(copy.datatable.content[0].fiscalyear).toEqual(before);
    });

    it("sends a pbomlnavigate event instead of changing the hash for SPA-style hashes", () => {
        const doc = threeSlices();
        location.hash = "#/some/route";
        const listener = vi.fn();
        addEventListener("pbomlnavigate", listener);
        doc.scrollToSliceAtIndex(1);
        removeEventListener("pbomlnavigate", listener);
        expect(listener).toHaveBeenCalledOnce();
        expect(listener.mock.calls[0][0].detail).toBe("markdown-2");
        expect(location.hash).toBe("#/some/route");
        location.hash = "";
    });

    it("updates the hash for normal anchors", () => {
        const doc = threeSlices();
        location.hash = "";
        doc.scrollToSliceAtIndex(2);
        expect(location.hash).toBe("#markdown-3");
        location.hash = "";
    });
});
