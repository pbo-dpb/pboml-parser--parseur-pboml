import "../helpers/lang-en.js";
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, fireEvent } from "@testing-library/vue";
import SvgFitter from "../../src/editors/SvgSliceTools/SvgFitter";
import SvgSanitizer from "../../src/editors/SvgSliceTools/SvgSanitizer";
import SvgWhiteRemover from "../../src/editors/SvgSliceTools/SvgWhiteRemover";

const svg = (inner = "", attrs = 'viewBox="0 0 500 500"') =>
    `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

const clickTool = async (Tool, svgString) => {
    const view = render(Tool, { props: { svg: svgString } });
    await fireEvent.click(view.container.querySelector("button"));
    return view;
};

describe("SvgWhiteRemover", () => {
    it.each(["#FFF", "#fff", "#FFFFFF", "#ffffff"])(
        "makes %s transparent",
        async (white) => {
            const { emitted } = await clickTool(
                SvgWhiteRemover,
                svg(`<rect fill="${white}"/>`),
            );
            const [out] = emitted().done[0];
            expect(out).toContain('fill="rgba(255,255,255,0)"');
            expect(out).not.toMatch(/#fff/i);
        },
    );

    it("leaves other colours alone", async () => {
        const input = svg('<rect fill="#2d5071"/><rect fill="#000"/>');
        const { emitted } = await clickTool(SvgWhiteRemover, input);
        expect(emitted().done[0][0]).toBe(input);
    });

    // KNOWN BUG: the pattern /#F{3,6}/ also matches the start of colours
    // like #FFF000 (yellow) or #FFFFFE, producing "rgba(255,255,255,0)000".
    it.fails("does not change colours that only start with FFF", async () => {
        const input = svg('<rect fill="#FFF000"/><rect fill="#FFFFFE"/>');
        const { emitted } = await clickTool(SvgWhiteRemover, input);
        expect(emitted().done[0][0]).toBe(input);
    });
});

describe("SvgSanitizer", () => {
    it("removes &nbsp; entities, which are not valid in SVG", async () => {
        const { emitted } = await clickTool(
            SvgSanitizer,
            svg("<text>A&nbsp;B&nbsp;C</text>"),
        );
        expect(emitted().sanitize[0][0]).toBe(svg("<text>ABC</text>"));
    });

    it("leaves a clean SVG unchanged", async () => {
        const input = svg('<circle r="5"/>');
        const { emitted } = await clickTool(SvgSanitizer, input);
        expect(emitted().sanitize[0][0]).toBe(input);
    });
});

describe("SvgFitter", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("sets the viewBox to the drawing's bounding box", async () => {
        vi.useFakeTimers();
        // The DOM used in tests has no layout, so getBBox is stubbed.
        vi.spyOn(window.SVGSVGElement.prototype, "getBBox").mockReturnValue({
            x: 10,
            y: 20,
            width: 300,
            height: 150,
        });
        const { emitted, container } = await clickTool(
            SvgFitter,
            svg('<rect x="10" y="20" width="300" height="150"/>'),
        );
        await vi.advanceTimersByTimeAsync(500);
        const [out] = emitted().fit[0];
        expect(out).toContain('viewBox="10 20 300 150"');
        expect(container.querySelector("[hidden]")).not.toBeNull();
    });
});

describe("SVG tools: preview element", () => {
    // KNOWN BUG (editor only): each tool puts the raw SVG in the page with
    // innerHTML, without DOMPurify. Event handler attributes in an SVG
    // received from someone else are inserted as-is into the editor page.
    it.fails.each([
        ["SvgFitter", SvgFitter],
        ["SvgSanitizer", SvgSanitizer],
        ["SvgWhiteRemover", SvgWhiteRemover],
    ])("%s does not insert event handlers into the page", (_, Tool) => {
        const { container } = render(Tool, {
            props: { svg: svg('<image href="x" onerror="alert(1)"/>') },
        });
        expect(container.innerHTML).not.toMatch(/onerror/);
    });
});
