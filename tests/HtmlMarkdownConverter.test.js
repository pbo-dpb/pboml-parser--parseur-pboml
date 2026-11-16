import { describe, it, expect } from "vite-plus/vitest";
import HtmlMarkdownConverter from "../src/HtmlMarkdownConverter";

describe("HtmlMarkdownConverter", () => {
    const converter = new HtmlMarkdownConverter();

    it("escapes dollar signs in text", () => {
        expect(
            converter.convert("<p>Une prestation de 650 $ si moins de 70 000 $.</p>"),
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
});
