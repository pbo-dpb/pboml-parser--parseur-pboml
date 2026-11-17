import "../helpers/lang-en.js";
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vite-plus/test";
import { reactive } from "vue";
import { render, fireEvent, within } from "@testing-library/vue";
import SliceStager from "../../src/components/Editor/SliceStager/SliceStager.vue";
import EditorSlices from "../../src/components/Editor/EditorMainContent/EditorSlices";
import EditorMainContent from "../../src/components/Editor/EditorMainContent/EditorMainContent";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import MarkdownSlice from "../../src/models/contents/MarkdownSlice";
import HeadingSlice from "../../src/models/contents/HeadingSlice";
import TableSlice from "../../src/models/contents/TableSlice";
import SvgSlice from "../../src/models/contents/SvgSlice";
import KvListSlice from "../../src/models/contents/KvListSlice";
import ChartSlice from "../../src/models/contents/ChartSlice";
import BitmapSlice from "../../src/models/contents/BitmapSlice";
import LaTeXSlice from "../../src/models/contents/LaTeXSlice";
import HtmlSlice from "../../src/models/contents/HtmlSlice";
import { flush, waitForSelector, yamlDocument, waitUntil } from "../helpers";

const md = (en) => ({ type: "markdown", content: { en, fr: `${en}-fr` } });

beforeEach(() => {
    window.confirm = vi.fn(() => true);
    HTMLDialogElement.prototype.showModal ??= function () {
        this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function () {
        this.open = false;
    };
    Element.prototype.scrollIntoViewIfNeeded = vi.fn();
    location.hash = "";
});
afterEach(() => {
    vi.restoreAllMocks();
    location.hash = "";
});

/** Opens a stager and clicks the button with the given label. */
async function addFromStager(container, _unused, label, stagerIndex = 0) {
    const openButtons = [
        ...container.querySelectorAll("button[aria-expanded]"),
    ];
    await fireEvent.click(openButtons[stagerIndex]);
    await flush();
    await fireEvent.click(
        within(container).getAllByText(label)[0].closest("button"),
    );
    await flush();
}

describe("SliceStager", () => {
    it.each([
        ["Text Block (markdown)", MarkdownSlice, null],
        ["Heading", HeadingSlice, null],
        ["Table", TableSlice, "figure"],
        ["SVG Image", SvgSlice, "figure"],
        ["Key-Value list", KvListSlice, null],
        ["Interactive Chart", ChartSlice, "figure"],
        ["Bitmap", BitmapSlice, "figure"],
        ["LaTeX", LaTeXSlice, null],
        ["HTML", HtmlSlice, "figure"],
    ])("creates a new unlocked %s slice", async (label, cls, presentation) => {
        const { container, getAllByText, emitted } = render(SliceStager);
        await addFromStager(container, getAllByText, label);
        const [slice] = emitted().new[0];
        expect(slice).toBeInstanceOf(cls);
        expect(slice.state._unlocked).toBe(true);
        expect(slice.presentation).toBe(presentation);
        expect(slice.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("asks for confirmation before adding an advanced slice", async () => {
        window.confirm = vi.fn(() => false);
        const { container, getAllByText, emitted } = render(SliceStager);
        await addFromStager(container, getAllByText, "HTML");
        expect(window.confirm).toHaveBeenCalledOnce();
        expect(emitted().new).toBeUndefined();
    });

    it("does not ask for confirmation for regular slices", async () => {
        const { container, getAllByText } = render(SliceStager);
        await addFromStager(container, getAllByText, "Heading");
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("closes after a slice is added", async () => {
        const { container, getAllByText } = render(SliceStager);
        await addFromStager(container, getAllByText, "Heading");
        expect(container.querySelector("dialog")).toBeNull();
        expect(
            container
                .querySelector("button[aria-expanded]")
                .getAttribute("aria-expanded"),
        ).toBe("false");
    });

    it("gives every new slice a different id", async () => {
        const { container, getAllByText, emitted } = render(SliceStager);
        await addFromStager(container, getAllByText, "Heading");
        await addFromStager(container, getAllByText, "Heading");
        const [a, b] = emitted().new.map(([s]) => s.id);
        expect(a).not.toBe(b);
    });
});

describe("EditorSlices (editing the document through the UI)", () => {
    const mountDoc = async (slices) => {
        const doc = reactive(new PBOMLDocument(yamlDocument({ slices })));
        const view = render(EditorSlices, { props: { pbomlDocument: doc } });
        await flush(10);
        return { doc, ...view };
    };
    const contents = (doc) => doc.slices.map((s) => s.content.en);

    it("shows the empty state for a document without slices", async () => {
        const { container } = await mountDoc([]);
        // The empty-state message is an async component: wait for it.
        await waitUntil(() =>
            expect(container.textContent).toContain(
                "No slice is present in the document.",
            ),
        );
    });

    it("adds a slice at the top from the first stager", async () => {
        const { doc, container, getAllByText } = await mountDoc([md("A")]);
        await addFromStager(
            container,
            getAllByText,
            "Text Block (markdown)",
            0,
        );
        expect(doc.slices).toHaveLength(2);
        expect(doc.slices[0].content.en).toBeUndefined();
        expect(doc.slices[1].content.en).toBe("A");
        expect(doc.slices.map((s) => s.state.sequence)).toEqual([1, 2]);
    });

    it("adds a slice after the slice whose stager was used", async () => {
        const { doc, container, getAllByText } = await mountDoc([
            md("A"),
            md("B"),
        ]);
        await addFromStager(container, getAllByText, "Heading", 1);
        expect(doc.slices.map((s) => s.type)).toEqual([
            "markdown",
            "heading",
            "markdown",
        ]);
    });

    it("deletes a slice from its editor", async () => {
        const { doc, container } = await mountDoc([
            { ...md("A"), state: { _unlocked: true } },
            md("B"),
        ]);
        await fireEvent.click(
            await waitForSelector(container, "button.bg-red-100"),
        );
        await flush();
        expect(contents(doc)).toEqual(["B"]);
    });

    it("duplicates a slice to the end of the document", async () => {
        const { doc, container } = await mountDoc([
            { ...md("A"), state: { _unlocked: true } },
            md("B"),
        ]);
        await fireEvent.click(
            await waitForSelector(
                container,
                'button[aria-label="Duplicate slice"]',
            ),
        );
        await flush();
        expect(contents(doc)).toEqual(["A", "B", "A"]);
    });

    it("moves a slice down from its editor", async () => {
        const { doc, container } = await mountDoc([
            { ...md("A"), state: { _unlocked: true } },
            md("B"),
        ]);
        await fireEvent.click(
            await waitForSelector(
                container,
                'button[aria-label="Push the slice towards the end"]',
            ),
        );
        await flush();
        expect(contents(doc)).toEqual(["B", "A"]);
    });
});

describe("EditorMainContent", () => {
    const mountMain = async () => {
        const doc = reactive(
            new PBOMLDocument(yamlDocument({ slices: [md("A")] })),
        );
        const view = render(EditorMainContent, {
            props: { pbomlDocument: doc },
        });
        await flush(10);
        return view;
    };

    it("switches between the slices, notes and structure tabs", async () => {
        const { getByRole } = await mountMain();
        const notes = getByRole("tab", { name: "Notes" });
        await fireEvent.click(notes);
        await flush(10);
        expect(notes.getAttribute("aria-selected")).toBe("true");
        expect(
            getByRole("tab", { name: "Slices" }).getAttribute("aria-selected"),
        ).toBe("false");
    });

    it("toggles the table of contents when the icon is clicked", async () => {
        const { container } = await mountMain();
        await fireEvent.click(container.querySelector("button svg"));
        await flush();
        expect(container.querySelector(".grid-cols-5")).not.toBeNull();
    });

    // KNOWN BUG: the click handler is on the icon, not on the button, so
    // keyboard users (Enter/Space trigger a click on the button) and clicks on
    // the button's padding do nothing.
    it.fails("toggles the table of contents when the button itself is activated", async () => {
        const { container, getByText } = await mountMain();
        const toggle = getByText("Toggle table of contents").closest("button");
        await fireEvent.click(toggle);
        await flush();
        expect(container.querySelector(".grid-cols-5")).not.toBeNull();
    });
});
