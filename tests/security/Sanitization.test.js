// @vitest-environment jsdom
// DOMPurify does not work correctly under happy-dom (it keeps <script> and
// drops allowed tags), so sanitization is tested with jsdom.
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vite-plus/test";
import { h } from "vue";
import MarkdownDriver from "../../src/MarkdownDriver";
import HtmlRenderer from "../../src/components/HtmlRenderer";
import SvgRenderer from "../../src/components/SvgRenderer";
import Renderer from "../../src/components/Renderer/Renderer";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import SvgSlice from "../../src/models/contents/SvgSlice";
import HtmlSlice from "../../src/models/contents/HtmlSlice";
import BitmapSlice from "../../src/models/contents/BitmapSlice";
import SvgSliceHtmlRenderer from "../../src/Renderers/Html/SvgSliceHtmlRenderer";
import HtmlSliceHtmlRenderer from "../../src/Renderers/Html/HtmlSliceHtmlRenderer";
import BitmapSliceHtmlRenderer from "../../src/Renderers/Html/BitmapSliceHtmlRenderer";
import { mountVnode, shadowHtml, yamlDocument, waitUntil } from "../helpers";

/**
 * PBOML files come from authors and are rendered on public pages, so any
 * HTML that reaches the page must be free of scripts and event handlers.
 */

const XSS = {
    script: "<script>window.__pwned = true</script>",
    imgOnerror: '<img src="x" onerror="window.__pwned = true">',
    jsLink: '<a href="javascript:alert(1)">click</a>',
    svgOnload:
        '<svg xmlns="http://www.w3.org/2000/svg" onload="window.__pwned = true"><script>window.__pwned = true</script><circle r="5" onclick="alert(1)"/></svg>',
};

function expectClean(html) {
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/\son\w+\s*=/i);
    expect(html).not.toMatch(/javascript:/i);
}

describe("Markdown rendering (MarkdownDriver)", () => {
    // MarkdownDriver skips DOMPurify when NODE_ENV is "test". These tests
    // switch to "production" so they check what readers actually get.
    beforeEach(() => vi.stubEnv("NODE_ENV", "production"));
    afterEach(() => vi.unstubAllEnvs());

    it.each(Object.entries(XSS))("removes %s from markdown", (_, payload) => {
        expectClean(new MarkdownDriver().render(`Text ${payload} more text`));
    });

    it("removes a javascript: link written in markdown syntax", () => {
        expectClean(
            new MarkdownDriver().render("[click](javascript:alert(1))"),
        );
    });

    it("keeps normal formatting and links", () => {
        const html = new MarkdownDriver().render(
            "**bold** and [PBO](https://www.pbo-dpb.ca)",
        );
        expect(html).toContain("<strong>bold</strong>");
        expect(html).toContain('href="https://www.pbo-dpb.ca"');
    });

    it("sanitizes in parseGenericMarkdown too", () => {
        expectClean(MarkdownDriver.parseGenericMarkdown(XSS.imgOnerror));
    });

    it("sanitizes inline rendering (used for headings)", () => {
        const md = new MarkdownDriver();
        md.shouldRenderInline(true);
        expectClean(md.render(`Title ${XSS.imgOnerror}`));
    });
});

describe("HTML slices (HtmlRenderer)", () => {
    it.each(Object.entries(XSS))(
        "removes %s from the shadow DOM",
        async (_, payload) => {
            const { container } = await mountVnode(() =>
                h(HtmlRenderer, {
                    payload: `<p>ok</p>${payload}`,
                    removeDefaultStyles: true,
                }),
            );
            const html = shadowHtml(container);
            expect(html).toContain("<p>ok</p>");
            expectClean(html);
        },
    );

    it("keeps tables and basic formatting", async () => {
        const { container } = await mountVnode(() =>
            h(HtmlRenderer, {
                payload: "<table><tr><td><em>x</em></td></tr></table>",
                removeDefaultStyles: true,
            }),
        );
        expect(shadowHtml(container)).toContain("<em>x</em>");
    });

    it("sanitizes through the full HTML slice renderer", async () => {
        const slice = new HtmlSlice({
            type: "html",
            content: { en: `<p>ok</p>${XSS.imgOnerror}` },
        });
        const { container } = await mountVnode(() =>
            new HtmlSliceHtmlRenderer(slice).renderReadonlyVnode("en"),
        );
        // HtmlRenderer is an async component: wait until it has rendered.
        await waitUntil(() => expect(shadowHtml(container)).toContain("ok"));
        expectClean(shadowHtml(container));
    });

    // KNOWN BUG: the fallback passes a function as the children of a plain
    // <div>, which Vue ignores, so the ⚠️ warning is never shown (same
    // pattern in SvgSliceHtmlRenderer and ChartJsMixin).
    it.fails("shows a warning when a language is missing", async () => {
        const slice = new HtmlSlice({
            type: "html",
            content: { en: "<p>x</p>" },
        });
        const { container } = await mountVnode(() =>
            new HtmlSliceHtmlRenderer(slice).renderReadonlyVnode("fr"),
        );
        expect(container.textContent).toContain("⚠️");
    });
});

describe("SVG slices (SvgRenderer)", () => {
    it("removes scripts and event handlers from SVG", async () => {
        const { container } = await mountVnode(() =>
            h(SvgRenderer, { payload: XSS.svgOnload }),
        );
        const html = shadowHtml(container);
        expect(html).toContain("<circle");
        expectClean(html);
    });

    it("sanitizes through the full SVG slice renderer", async () => {
        const slice = new SvgSlice({
            type: "svg",
            content: { en: XSS.svgOnload, fr: XSS.svgOnload },
        });
        const { container } = await mountVnode(() =>
            new SvgSliceHtmlRenderer(slice).renderReadonlyVnode("fr"),
        );
        expectClean(shadowHtml(container));
    });
});

describe("Document header and footer (Renderer)", () => {
    const renderDocument = (documentFields) =>
        mountVnode(() =>
            h(Renderer, {
                pbomlDocument: new PBOMLDocument(
                    yamlDocument({ document: documentFields }),
                ),
                language: "en",
            }),
        );

    // KNOWN BUG: the title, type, copyright and id are inserted with
    // innerHTML without DOMPurify.
    it.fails("sanitizes the document title", async () => {
        const { container } = await renderDocument({
            title: { en: `Report ${XSS.imgOnerror}` },
        });
        expectClean(container.innerHTML);
    });

    it.fails("sanitizes the document type and copyright", async () => {
        const { container } = await renderDocument({
            type: { en: XSS.imgOnerror },
            copyright: { en: XSS.imgOnerror },
        });
        expectClean(container.innerHTML);
    });
});

describe("Bitmap slices", () => {
    // KNOWN BUG: the image URL is used as-is for <a href> and <img src>.
    it.fails("does not link to javascript: URLs", async () => {
        const slice = new BitmapSlice({
            type: "bitmap",
            content: { en: "javascript:alert(1)" },
        });
        const { container } = await mountVnode(() =>
            new BitmapSliceHtmlRenderer(slice).renderReadonlyVnode("en"),
        );
        expectClean(container.innerHTML);
    });
});
