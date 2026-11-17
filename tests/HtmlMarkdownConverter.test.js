import { describe, it, expect } from "vite-plus/test";
import HtmlMarkdownConverter from "../src/HtmlMarkdownConverter";

describe("HtmlMarkdownConverter", () => {
    const converter = new HtmlMarkdownConverter();

    it("escapes dollar signs in text", () => {
        expect(
            converter.convert(
                "<p>Une prestation de 650 $ si moins de 70 000 $.</p>",
            ),
        ).toBe("Une prestation de 650 \\$ si moins de 70 000 \\$.");
        expect(converter.convert("<p>It costs $5 and $10.</p>")).toBe(
            "It costs \\$5 and \\$10.",
        );
    });

    it("escapes dollar signs in table cells", () => {
        const md = converter.convert(
            "<table><tr><th>$ millions</th></tr><tr><td>$1.50</td></tr></table>",
        );
        expect(md).toContain("\\$ millions");
        expect(md).toContain("\\$1.50");
    });

    it("does not escape dollar signs inside code", () => {
        expect(converter.convert("<p><code>$HOME</code></p>")).toBe("`$HOME`");
    });

    it("uses # headings, - bullets and * emphasis", () => {
        const md = converter.convert(
            "<h2>Title</h2><ul><li>One</li><li><em>Two</em></li></ul>",
        );
        expect(md).toBe("## Title\n\n-   One\n-   *Two*");
    });

    it("converts links", () => {
        expect(
            converter.convert(
                '<p><a href="https://www.pbo-dpb.ca">PBO</a></p>',
            ),
        ).toBe("[PBO](https://www.pbo-dpb.ca)");
    });

    it("converts tables with a header row to GFM tables", () => {
        const md = converter.convert(
            "<table><thead><tr><th>Year</th><th>Cost</th></tr></thead><tbody><tr><td>2024</td><td>10</td></tr></tbody></table>",
        );
        // Cells may be padded with extra spaces; compare without them.
        expect(md.split("\n").map((line) => line.replace(/ +/g, " "))).toEqual([
            "| Year | Cost |",
            "| --- | --- |",
            "| 2024 | 10 |",
        ]);
    });

    it("removes leftover HTML comments", () => {
        expect(converter.convert("<p>Text<!-- hidden --></p>")).toBe("Text");
    });

    it("turns Word list bullets (· followed by non-breaking spaces) into markdown bullets", () => {
        const nbsp = "&nbsp;".repeat(8);
        // Extra spaces after the dash are fine: it is still a markdown list item.
        expect(converter.convert(`<p>·${nbsp}First</p>`)).toMatch(/^- +First$/);
    });

    it("drops pasted references after a horizontal rule", () => {
        const md = converter.convert(
            "<p>Body</p><hr><p>[1] Some reference</p><p>[2] Another</p>",
        );
        expect(md.trim()).toBe("Body");
    });

    it("replaces pasted footnote links with a placeholder marker", () => {
        const md = converter.convert('<p>Claim<a href="#_ftn1">[1]</a>.</p>');
        expect(md).toBe("Claim[^🟠].");
    });
});
