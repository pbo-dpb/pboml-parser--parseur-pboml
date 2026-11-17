// @vitest-environment jsdom
// jsdom is used because happy-dom tries to download the stylesheets and
// script that LaTeXRenderer links from a CDN, and logs errors when it can't.
import "../helpers/lang-en.js";
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { h } from "vue";
import { render } from "@testing-library/vue";
import LaTeXRenderer from "../../src/components/LaTeXRenderer";
import Renderer from "../../src/components/Renderer/Renderer";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import packageJson from "../../package.json";
import { flush, loadSample, shadowHtml, waitUntil } from "../helpers";

const article = (body) =>
    String.raw`\documentclass{article}\begin{document}` +
    body +
    String.raw`\end{document}`;

const mountLatex = async (payload) => {
    const view = render(LaTeXRenderer, { props: { payload } });
    await flush();
    return view;
};

/** The rendered LaTeX, without the <link>/<script> tags latex.js appends. */
const bodyHtml = (container) => {
    const host = [...container.querySelectorAll("*")].find(
        (el) => el.shadowRoot,
    );
    return host?.shadowRoot.querySelector(".body")?.innerHTML ?? "";
};

afterEach(() => vi.restoreAllMocks());

describe("LaTeXRenderer", () => {
    it("renders text, sections and formatting in a shadow root", async () => {
        const { container } = await mountLatex(
            article(
                String.raw`\section{Intro}Hello \textbf{bold} and \emph{italic}.`,
            ),
        );
        const html = bodyHtml(container);
        // latex.js puts a non-breaking space between the number and the title.
        expect(html).toMatch(/<h2 id="sec-1">1\s+Intro<\/h2>/);
        expect(html).toContain('<span class="bf">bold</span>');
        expect(container.innerHTML).not.toContain("Intro"); // only inside the shadow root
    });

    it("renders math with MathML for screen readers", async () => {
        const { container } = await mountLatex(String.raw`Area is $\pi r^2$.`);
        const html = bodyHtml(container);
        expect(html).toContain("<math");
        expect(html).toContain(
            '<annotation encoding="application/x-tex">\\pi r^2</annotation>',
        );
    });

    it("escapes HTML written in the LaTeX source", async () => {
        const { container } = await mountLatex(
            'Hello <img src="x" onerror="alert(1)"> world',
        );
        const html = bodyHtml(container);
        expect(html).not.toContain("<img");
        expect(html).toContain("&lt;img");
    });

    it("logs invalid LaTeX instead of crashing", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const { container } = await mountLatex(String.raw`\begin{itemize`);
        expect(error).toHaveBeenCalled();
        expect(shadowHtml(container)).toBe("");
    });

    it("re-renders when the payload changes, and keeps the last good render on error", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { container, rerender } = await mountLatex("First");
        expect(bodyHtml(container)).toContain("First");
        await rerender({ payload: "Second" });
        await flush();
        expect(bodyHtml(container)).toContain("Second");
        await rerender({ payload: String.raw`\unknownmacro` });
        await flush();
        expect(bodyHtml(container)).toContain("Second");
    });

    it("renders the LaTeX slice of latex0.yaml in a document", async () => {
        // latex0 draws lines with SVG, and jsdom has no layout: stub getBBox.
        window.SVGElement.prototype.getBBox ??= () => ({
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        });
        const doc = PBOMLDocument.initFromYaml(loadSample("latex0"));
        const latex = doc.slices.find((s) => s.type === "LaTeX");
        const { container } = render({
            render: () => h(Renderer, { pbomlDocument: doc, language: "en" }),
        });
        await waitUntil(() => {
            const section = container.querySelector(`#${latex.anchor}`);
            expect(bodyHtml(section).length).toBeGreaterThan(100);
        });
    });

    // KNOWN BUG: latex.js styles and script are loaded from jsDelivr, pinned
    // to 0.12.4 while package.json uses a newer version. The bundled pages'
    // Content-Security-Policy blocks external URLs, so the LaTeX output is
    // unstyled there.
    it.fails("does not load styles or scripts from an external CDN", async () => {
        const { container } = await mountLatex("Hello");
        expect(shadowHtml(container)).not.toMatch(/https?:\/\//);
    });

    it.fails("uses the latex.js version installed by package.json", async () => {
        const installed = packageJson.dependencies["latex.js"].replace(
            /^\^/,
            "",
        );
        const { container } = await mountLatex("Hello");
        const urls = [
            ...shadowHtml(container).matchAll(/latex\.js@([\d.]+)/g),
        ].map((m) => m[1]);
        expect(urls.every((v) => v === installed)).toBe(true);
    });
});
