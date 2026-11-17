// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { h } from "vue";
import { render } from "@testing-library/vue";
import Toc from "../../src/components/Toc/Toc";
import Renderer from "../../src/components/Renderer/Renderer";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { flush, loadSample, yamlDocument } from "../helpers";

const heading = (en, level = 0, extra = {}) => ({
    type: "heading",
    level,
    content: { en, fr: `${en} (fr)` },
    ...extra,
});
const md = (label, extra = {}) => ({
    type: "markdown",
    label: label ? { en: label, fr: `${label} (fr)` } : undefined,
    content: { en: "x" },
    ...extra,
});

const mountToc = async (slices, props = {}) => {
    const doc = new PBOMLDocument(yamlDocument({ slices }));
    const result = render(Toc, {
        props: { pbomlDocument: doc, language: "en", ...props },
    });
    await flush();
    return result;
};

// Top-level entries, without the "Top" link.
const topLevelTexts = (container) =>
    [...container.querySelectorAll("ol.pb__toc_root > li > a[href]")].map((a) =>
        a.textContent.trim(),
    );

describe("Toc", () => {
    afterEach(() => {
        location.hash = "";
    });

    it("starts with a link back to the top", async () => {
        const { container } = await mountToc([heading("Intro")]);
        const first = container.querySelector("ol.pb__toc_root > li > a");
        expect(first.textContent).toContain("Top");
        expect(first.hasAttribute("href")).toBe(false);
    });

    // KNOWN BUG: with hideTop the tree starts with `null`, and both the
    // anchors list and render() crash on it.
    it.fails("hides the top link with hideTop", async () => {
        const { container } = await mountToc([heading("Intro")], {
            hideTop: true,
        });
        expect(topLevelTexts(container)).toEqual(["Intro"]);
    });

    it("builds a nested list from heading levels", async () => {
        const { container } = await mountToc([
            heading("Chapter 1"),
            heading("Section 1.1", 1),
            heading("Detail 1.1.1", 2),
            heading("Chapter 2"),
        ]);
        expect(topLevelTexts(container)).toEqual(["Chapter 1", "Chapter 2"]);
        const nested = container.querySelector("li.pb__toc_item_l1 > a");
        expect(nested.textContent).toBe("Section 1.1");
        expect(nested.getAttribute("href")).toBe("#heading-2");
        expect(
            container.querySelector("li.pb__toc_item_l2 > a").textContent,
        ).toBe("Detail 1.1.1");
    });

    it("leaves out headings of level 3 and deeper", async () => {
        const { container } = await mountToc([
            heading("Chapter"),
            heading("Too deep", 3),
        ]);
        expect(container.textContent).not.toContain("Too deep");
    });

    it("shows the referenced_as prefix", async () => {
        const { container } = await mountToc([
            heading("Costs", 0, { referenced_as: { en: "Chapter 3" } }),
        ]);
        expect(topLevelTexts(container)[0]).toContain("Chapter 3");
        expect(topLevelTexts(container)[0]).toContain("Costs");
    });

    it("uses the requested language", async () => {
        const { container } = await mountToc([heading("Intro")], {
            language: "fr",
        });
        expect(topLevelTexts(container)).toEqual(["Intro (fr)"]);
        expect(container.textContent).toContain("Début");
    });

    it("falls back to slice labels when there are no headings", async () => {
        const { container } = await mountToc([
            md("First"),
            md(null),
            md("Hidden", { display_label: false }),
            md("Last"),
        ]);
        expect(topLevelTexts(container)).toEqual(["First", "Last"]);
    });

    it("only shows the top link for an empty document", async () => {
        const { container } = await mountToc([]);
        expect(container.querySelectorAll("nav li")).toHaveLength(1);
        expect(topLevelTexts(container)).toEqual([]);
    });

    it("highlights the anchor in the URL hash on load", async () => {
        location.hash = "#heading-2";
        const { container } = await mountToc([heading("A"), heading("B")]);
        const current = container.querySelector("a[href='#heading-2']");
        expect(current.className).toContain("text-gray-900");
        expect(
            container.querySelector("a[href='#heading-1']").className,
        ).toContain("text-blue-900");
    });

    it("dispatches pbomlnavigate for SPA-style hashes instead of following the link", async () => {
        const { container } = await mountToc([heading("A")]);
        location.hash = "#/app/route";
        const listener = vi.fn();
        addEventListener("pbomlnavigate", listener);
        container.querySelector("a[href='#heading-1']").click();
        removeEventListener("pbomlnavigate", listener);
        expect(listener).toHaveBeenCalledOnce();
        expect(listener.mock.calls[0][0].detail).toBe("heading-1");
    });

    // KNOWN BUG: beforeUnmount calls addEventListener instead of
    // removeEventListener, so the intersection listener is never removed.
    it.fails("removes its intersection listener when unmounted", async () => {
        const spy = vi.spyOn(document, "removeEventListener");
        const toc = await mountToc([heading("A")]);
        dispatchEvent(new Event("scroll"));
        toc.unmount();
        expect(spy).toHaveBeenCalledWith(
            "pboml-renderer-intersection-visible",
            expect.any(Function),
        );
        spy.mockRestore();
    });

    // KNOWN BUG: see the grouped-slices test in SliceHtmlRenderers.test.js.
    it.fails("only links to anchors that exist in the rendered leg0 document", async () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const page = render({
            render: () =>
                h("div", [
                    h(Toc, { pbomlDocument: doc, language: "en" }),
                    h(Renderer, { pbomlDocument: doc, language: "en" }),
                ]),
        });
        await flush();
        const hrefs = [...page.container.querySelectorAll("nav a[href]")].map(
            (a) => a.getAttribute("href"),
        );
        expect(hrefs.length).toBeGreaterThan(0);
        hrefs.forEach((href) =>
            expect(page.container.querySelector(href), href).not.toBeNull(),
        );
    });
});
