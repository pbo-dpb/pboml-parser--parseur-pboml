import { describe, it, expect, afterEach } from "vite-plus/test";
import MarkdownDriver from "../src/MarkdownDriver";

describe("MarkdownDriver", () => {
    afterEach(() => {
        delete document.pbomlCallbacks;
    });

    it("renders block markdown inside paragraphs", () => {
        expect(new MarkdownDriver().render("Hello **world**").trim()).toBe(
            "<p>Hello <strong>world</strong></p>",
        );
    });

    it("renders inline markdown without a paragraph", () => {
        const md = new MarkdownDriver();
        md.shouldRenderInline(true);
        expect(md.render("Hello *world*")).toBe("Hello <em>world</em>");
    });

    it("renders GFM tables", () => {
        const html = new MarkdownDriver().render(
            "| a | b |\n|---|---|\n| 1 | 2 |",
        );
        expect(html).toContain("<table>");
        expect(html).toContain("<td>1</td>");
    });

    // KNOWN BUG: numbers are let through to marked, which only accepts
    // strings, so readers see "An error occurred: marked(): input parameter
    // is of type [object Number]". Happens with numeric values in markdown
    // table cells or KV lists.
    it.fails("renders numbers", () => {
        expect(new MarkdownDriver().render(42).trim()).toBe("<p>42</p>");
    });

    it.each([null, undefined, {}, ["a"]])(
        "renders %o as an empty string instead of throwing",
        (value) => {
            expect(new MarkdownDriver().render(value)).toBe("");
        },
    );

    it("renders $$…$$ as MathML", () => {
        const html = new MarkdownDriver().render("Area: $$\\pi r^2$$");
        expect(html).toContain("<math");
        expect(html).not.toContain("$$");
    });

    it("leaves single dollar amounts alone", () => {
        const html = new MarkdownDriver().render("It costs $5 and $10.");
        expect(html).toContain("$5 and $10");
        expect(html).not.toContain("<math");
    });

    it("keeps fiscal years like 2024-25 on one line", () => {
        const html = new MarkdownDriver().render("2024-25");
        expect(html).toContain("2024&shy;-25");
        expect(html).toContain("hyphenate-character");
    });

    it("does not touch fiscal years inside longer text", () => {
        const html = new MarkdownDriver().render("In 2024-25 we spent more.");
        expect(html).not.toContain("&shy;");
    });

    it("runs the beforeMarkdownRendering callback on the source", () => {
        document.pbomlCallbacks = {
            beforeMarkdownRendering: (src) => src.replace("cat", "dog"),
        };
        expect(new MarkdownDriver().render("cat")).toContain("dog");
    });

    it("runs the afterMarkdownRendering callback on the HTML", () => {
        document.pbomlCallbacks = {
            afterMarkdownRendering: (html) => `<section>${html}</section>`,
        };
        expect(new MarkdownDriver().render("x")).toMatch(/^<section><p>x<\/p>/);
    });

    it("turns bare URLs into links after shouldConvertUrls()", () => {
        const md = new MarkdownDriver();
        md.shouldConvertUrls();
        expect(md.render("See https://www.pbo-dpb.ca")).toContain(
            '<a href="https://www.pbo-dpb.ca">',
        );
    });

    // KNOWN BUG: options are set with the global `marked.use()`. Once any
    // driver calls shouldConvertUrls() (annotations do), every later driver
    // also converts URLs, and each new driver adds the KaTeX extension again.
    it.fails("keeps URL conversion local to the driver that asked for it", () => {
        const withLinks = new MarkdownDriver();
        withLinks.shouldConvertUrls();
        withLinks.render("https://example.com");
        expect(
            new MarkdownDriver().render("https://example.com"),
        ).not.toContain("<a ");
    });
});
