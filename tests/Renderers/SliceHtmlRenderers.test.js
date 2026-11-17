// @vitest-environment jsdom
// jsdom is used because DOMPurify (used by the SVG and HTML renderers)
// does not work correctly under happy-dom.
import { describe, it, expect } from "vite-plus/test";
import { h } from "vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import Renderer from "../../src/components/Renderer/Renderer";
import SliceHtmlRenderer from "../../src/Renderers/Html/SliceHtmlRenderer";
import MarkdownSliceHtmlRenderer from "../../src/Renderers/Html/MarkdownSliceHtmlRenderer";
import HeadingSliceHtmlRenderer from "../../src/Renderers/Html/HeadingSliceHtmlRenderer";
import TableSliceHtmlRenderer from "../../src/Renderers/Html/TableSliceHtmlRenderer";
import KvListSliceHtmlRenderer from "../../src/Renderers/Html/KvListSliceHtmlRenderer";
import BitmapSliceHtmlRenderer from "../../src/Renderers/Html/BitmapSliceHtmlRenderer";
import SvgSliceHtmlRenderer from "../../src/Renderers/Html/SvgSliceHtmlRenderer";
import ChartSliceHtmlRenderer from "../../src/Renderers/Html/ChartSliceHtmlRenderer";
import { loadSample, mountVnode, shadowHtml, yamlDocument } from "../helpers";

const docWith = (slices, prefix = null) =>
    new PBOMLDocument(yamlDocument({ slices }), prefix);

const renderSlice = async (RendererClass, payload, language = "en") => {
    const slice = docWith([payload]).slices[0];
    const result = await mountVnode(() =>
        new RendererClass(slice).renderAsVnode(language),
    );
    return { ...result, slice };
};

const markdownSlice = (extra = {}) => ({
    type: "markdown",
    label: { en: "Label", fr: "Libellé" },
    content: { en: "English **text**", fr: "Texte **français**" },
    ...extra,
});

describe("SliceHtmlRenderer (shared behaviour)", () => {
    it("wraps the slice in a section with the anchor as id", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice(),
        );
        const section = container.querySelector("section");
        expect(section.id).toBe("markdown-1");
    });

    it("renders the label as an h2 with an id", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice(),
            "fr",
        );
        const title = container.querySelector("h2");
        expect(title.id).toBe("markdown-1-label");
        expect(title.textContent).toBe("Libellé");
    });

    it("includes referenced_as before the label", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ referenced_as: { en: "Box 1" } }),
        );
        const spans = [...container.querySelectorAll("h2 span")].map(
            (s) => s.textContent,
        );
        expect(spans).toEqual(["Box 1", "Label"]);
    });

    it("hides the label when display_label is false", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ display_label: false }),
        );
        expect(container.querySelector("h2")).toBeNull();
    });

    it("renders a figure with a figcaption for presentation: figure", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ presentation: "figure" }),
        );
        const figure = container.querySelector("figure");
        expect(figure.getAttribute("aria-labelledby")).toBe("markdown-1-label");
        expect(figure.querySelector("figcaption").textContent).toBe("Label");
    });

    it.each(["aside", "aside-2"])(
        "renders an aside for presentation: %s",
        async (presentation) => {
            const { container } = await renderSlice(
                MarkdownSliceHtmlRenderer,
                markdownSlice({ presentation }),
            );
            const aside = container.querySelector("aside");
            expect(aside).not.toBeNull();
            expect(aside.className).toContain(`pb__${presentation}`);
        },
    );

    it("labels an unlabelled aside with the translated word", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ presentation: "aside", label: {} }),
            "fr",
        );
        expect(
            container.querySelector("aside").getAttribute("aria-labelledby"),
        ).toBe("Encart");
    });

    it("hides print-only slices on screen", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ print_only: true }),
        );
        const classes = container.querySelector("section").className;
        expect(classes).toContain("hidden");
        expect(classes).toContain("print:flex");
    });

    it("uses singular and plural titles for sources and notes", async () => {
        const one = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ sources: [{ en: "S1" }], notes: [{ en: "N1" }] }),
        );
        const oneTitles = [...one.container.querySelectorAll("dt")].map(
            (d) => d.textContent,
        );
        expect(oneTitles).toEqual(["Source", "Note"]);

        const many = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({
                sources: [{ en: "S1" }, { en: "S2" }],
                notes: [{ en: "N1" }, { en: "N2" }],
            }),
        );
        const manyTitles = [...many.container.querySelectorAll("dt")].map(
            (d) => d.textContent,
        );
        expect(manyTitles).toEqual(["Sources", "Notes"]);
    });

    it("puts the text version (alts) in a collapsible details element", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice({ alts: [{ en: "Long description" }] }),
        );
        const details = container.querySelector("details");
        expect(details.querySelector("summary").textContent).toBe(
            "Text version",
        );
        expect(details.textContent).toContain("Long description");
    });

    it("renders nothing extra when there are no metas", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice(),
        );
        expect(container.querySelector("dl")).toBeNull();
        expect(container.querySelector("details")).toBeNull();
    });

    it("can skip the title (used when slices are grouped)", async () => {
        const slice = docWith([markdownSlice()]).slices[0];
        const { container } = await mountVnode(() =>
            new MarkdownSliceHtmlRenderer(slice).buildVnodes("en", true),
        );
        expect(container.querySelector("h2")).toBeNull();
    });

    it("renders nothing for the base renderer's content", () => {
        expect(new SliceHtmlRenderer({}).renderReadonlyVnode("en")).toEqual([]);
    });
});

describe("MarkdownSliceHtmlRenderer", () => {
    it("renders the content for the chosen language", async () => {
        const { container } = await renderSlice(
            MarkdownSliceHtmlRenderer,
            markdownSlice(),
            "fr",
        );
        expect(container.querySelector(".pboml-prose strong").textContent).toBe(
            "français",
        );
    });
});

describe("HeadingSliceHtmlRenderer", () => {
    it.each([
        [0, "H2"],
        [1, "H3"],
        [2, "H4"],
        [3, "H5"],
        [4, "H6"],
    ])("renders level %i as %s", async (level, tag) => {
        const { container } = await renderSlice(HeadingSliceHtmlRenderer, {
            type: "heading",
            level,
            content: { en: "Title" },
        });
        const heading = container.querySelector("h2, h3, h4, h5, h6");
        expect(heading.tagName).toBe(tag);
        expect(heading.textContent).toBe("Title");
    });

    it("renders inline markdown and the reference prefix", async () => {
        const { container } = await renderSlice(HeadingSliceHtmlRenderer, {
            type: "heading",
            referenced_as: { en: "Chapter 2" },
            content: { en: "The *budget*" },
        });
        const heading = container.querySelector("h2");
        expect(heading.querySelector("em").textContent).toBe("budget");
        expect(heading.querySelector("p")).toBeNull();
        expect(heading.textContent).toContain("Chapter 2");
    });
});

describe("TableSliceHtmlRenderer", () => {
    const table = () =>
        PBOMLDocument.initFromYaml(loadSample("leg0")).slices.find(
            (s) => s.type === "table",
        );

    it("renders a table with a header row and one column per entry", async () => {
        const slice = table();
        const { container } = await mountVnode(() =>
            new TableSliceHtmlRenderer(slice).renderAsVnode("en"),
        );
        const tableEl = container.querySelector("table");
        expect(tableEl).not.toBeNull();
        const headerCells = tableEl.querySelectorAll("thead tr:last-child > *");
        // One cell for the variable label, then one per content entry.
        expect(headerCells).toHaveLength(slice.datatable.content.length + 1);
        expect(tableEl.querySelector("thead").textContent).toContain(
            "3501\u00ad-02",
        ); // soft hyphen added by MarkdownDriver;
    });

    it("uses French values for French", async () => {
        const { container } = await mountVnode(() =>
            new TableSliceHtmlRenderer(table()).renderAsVnode("fr"),
        );
        expect(container.querySelector("thead").textContent).toContain(
            "3501\u00ad-3502",
        );
    });

    it("keeps the table on one page when printing", async () => {
        const { container } = await mountVnode(() =>
            new TableSliceHtmlRenderer(table()).renderAsVnode("en"),
        );
        expect(container.querySelector("section").className).toContain(
            "break-inside-avoid-page",
        );
    });

    it("adds a screen-reader caption with the label and the table unit", async () => {
        const doc = docWith([
            {
                type: "table",
                label: { en: "Costs" },
                variables: {
                    year: { is_descriptive: true, label: { en: "Year" } },
                    cost: {
                        type: "number",
                        label: { en: "Cost" },
                        unit: { en: "$ millions" },
                    },
                },
                content: [{ year: "2024", cost: 3 }],
            },
        ]);
        const { container } = await mountVnode(() =>
            new TableSliceHtmlRenderer(doc.slices[0]).renderAsVnode("en"),
        );
        expect(container.querySelector("caption").textContent).toBe(
            "Costs, $ millions",
        );
    });

    // KNOWN BUG: a number in a markdown-type column is passed to marked
    // as-is, and the cell shows marked's error message.
    it.fails("shows numbers stored in a markdown column", async () => {
        const doc = docWith([
            {
                type: "table",
                variables: {
                    year: { is_descriptive: true },
                    total: { type: "markdown" },
                },
                content: [{ year: "2024", total: 52 }],
            },
        ]);
        const { container } = await mountVnode(() =>
            new TableSliceHtmlRenderer(doc.slices[0]).renderAsVnode("en"),
        );
        expect(container.querySelector("tbody").textContent).toContain("52");
        expect(container.textContent).not.toContain("error occurred");
    });
});

describe("KvListSliceHtmlRenderer", () => {
    it("renders a description list with one entry per pair", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const slice = doc.slices.find((s) => s.type === "kvlist");
        const { container } = await mountVnode(() =>
            new KvListSliceHtmlRenderer(slice).renderAsVnode("en"),
        );
        expect(container.querySelectorAll("dl dt")).toHaveLength(
            slice.content.length,
        );
        expect(container.querySelector("dl dt a")).not.toBeNull();
    });
});

describe("BitmapSliceHtmlRenderer", () => {
    it("renders a linked image with the label as alt text", async () => {
        const { container } = await renderSlice(BitmapSliceHtmlRenderer, {
            type: "bitmap",
            label: { en: "Chart of costs" },
            content: { en: "https://example.com/en.png" },
        });
        const img = container.querySelector("figure img");
        expect(img.getAttribute("src")).toBe("https://example.com/en.png");
        expect(img.getAttribute("alt")).toBe("Chart of costs");
        expect(container.querySelector("a").getAttribute("href")).toBe(
            "https://example.com/en.png",
        );
    });

    it("builds responsive sources from thumbnails", async () => {
        const { container } = await renderSlice(BitmapSliceHtmlRenderer, {
            type: "bitmap",
            content: { en: "full.png" },
            thumbnails: {
                en: {
                    sm_1x_webp: "sm1.webp",
                    sm_2x_webp: "sm2.webp",
                    lg_1x_png: "lg1.png",
                },
            },
        });
        const sources = [...container.querySelectorAll("picture source")];
        expect(sources.map((s) => s.getAttribute("srcset"))).toEqual([
            "sm1.webp 1x, sm2.webp 2x",
            "lg1.png 1x",
        ]);
        expect(sources[0].getAttribute("media")).toBe("(max-width: 640px)");
        expect(sources[1].hasAttribute("media")).toBe(false);
    });
});

describe("SvgSliceHtmlRenderer", () => {
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="10" height="10"/></svg>';

    it("removes the fixed size and gives the SVG a unique id", async () => {
        const { container, slice } = await renderSlice(SvgSliceHtmlRenderer, {
            type: "svg",
            content: { en: svg },
        });
        const html = shadowHtml(container);
        expect(html).toContain(`id="${slice.state.renderedAnchorIdPrefix}en"`);
        expect(html).toContain('viewBox="0 0 300 200"');
        expect(html).not.toMatch(/<svg[^>]*\swidth=/);
    });

    // KNOWN BUG: same fallback problem as the HTML slice: the ⚠️ is never shown.
    it.fails("shows a warning when the SVG for the language is missing", async () => {
        const { container } = await renderSlice(
            SvgSliceHtmlRenderer,
            { type: "svg", content: { en: svg } },
            "fr",
        );
        expect(container.textContent).toContain("⚠️");
    });
});

describe("ChartSliceHtmlRenderer", () => {
    it("uses the data table as the text version when no alts are given", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("charts0"));
        const slice = doc.slices.find(
            (s) => s.type === "chart" && !s.alts.length,
        );
        const renderer = new ChartSliceHtmlRenderer(slice);
        const { container } = await mountVnode(() =>
            renderer.renderAltsVnodes("en"),
        );
        const details = container.querySelector("details");
        expect(details.querySelector("summary").textContent).toBe(
            "Text version",
        );
        expect(details.querySelector("table")).not.toBeNull();
    });
});

describe("Renderer (whole document)", () => {
    const mountDocument = (doc, props = {}) =>
        mountVnode(() =>
            h(Renderer, { pbomlDocument: doc, language: "en", ...props }),
        );

    it("renders the title, type, release date and copyright", async () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                document: {
                    id: "RP-1",
                    title: { en: "My report" },
                    type: { en: "Report" },
                    copyright: { en: "© PBO" },
                    release_date: "2024-03-15T12:00:00.000Z",
                },
            }),
        );
        const { container } = await mountDocument(doc);
        expect(container.querySelector("h1").textContent).toBe("My report");
        expect(container.querySelector("header").textContent).toContain(
            "Report",
        );
        expect(container.querySelector("header").textContent).toContain(
            "March 15, 2024",
        );
        expect(container.querySelector("footer").textContent).toContain(
            "© PBO",
        );
        expect(container.querySelector("footer").textContent).toContain("RP-1");
    });

    it("hides the header and footer in standalone mode", async () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                document: { title: { en: "T" }, copyright: { en: "C" } },
            }),
        );
        const { container } = await mountDocument(doc, { standalone: true });
        expect(container.querySelector("header")).toBeNull();
        expect(container.querySelector("footer")).toBeNull();
    });

    // KNOWN BUG: when consecutive slices share referenced_as (leg0 slices 5
    // and 6, "Box 1"), only the group wrapper gets an id. The second slice's
    // anchor (markdown-6) is missing, so its table-of-contents link is dead.
    it.fails("gives every slice of leg0.yaml an element with its anchor", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const { container } = await mountDocument(doc);
        doc.slices.forEach((slice) => {
            expect(
                container.querySelector(`#${slice.anchor}`),
                slice.anchor,
            ).not.toBeNull();
        });
    });

    it("groups consecutive slices with the same referenced_as in one wrapper", async () => {
        const doc = docWith([
            markdownSlice({
                referenced_as: { en: "Box 1" },
                content: { en: "A" },
            }),
            markdownSlice({
                referenced_as: { en: "Box 1" },
                content: { en: "B" },
            }),
            markdownSlice({ content: { en: "C" } }),
        ]);
        const { container } = await mountDocument(doc);
        const sections = container.querySelectorAll("section");
        expect(sections).toHaveLength(2);
        expect(sections[0].textContent).toContain("A");
        expect(sections[0].textContent).toContain("B");
        // Only the first slice of the group shows its title.
        expect(sections[0].querySelectorAll("h2")).toHaveLength(1);
    });

    it("lists annotations and links [^id] markers to them", async () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                slices: [markdownSlice({ content: { en: "Claim[^1]" } })],
                annotations: [{ id: 1, content: { en: "Source of claim" } }],
            }),
        );
        const { container } = await mountDocument(doc);
        expect(container.querySelector("#antn_1").textContent).toContain(
            "Source of claim",
        );
        const link = container.querySelector("a[role='doc-noteref']");
        expect(link.getAttribute("href")).toBe("#antn_1");
        expect(container.textContent).not.toContain("[^1]");
    });
});
