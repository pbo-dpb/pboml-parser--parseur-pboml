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
import AnnotationsEditor from "../../src/components/Editor/AnnotationsEditor/AnnotationsEditor";
import AnnotationEditor from "../../src/editors/AnnotationEditor";
import Annotation from "../../src/models/Annotation";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { flush, yamlDocument } from "../helpers";

const note = (id, en = `Note ${id}`, extra = {}) => ({
    id,
    content: { en, fr: `${en} (fr)` },
    ...extra,
});
const unlockedNote = (id, en) => note(id, en, { state: { _unlocked: true } });

const mountEditor = async ({ annotations = [], slices = [] } = {}) => {
    const doc = reactive(
        new PBOMLDocument(yamlDocument({ annotations, slices })),
    );
    const view = render(AnnotationsEditor, { props: { pbomlDocument: doc } });
    await flush();
    return { doc, ...view, q: within(view.container) };
};

const ids = (doc) => doc.annotations.map((a) => a.id);
const keepOrganizedBox = (q) => q.getByLabelText("Enforce numerical order");

beforeEach(() => {
    window.confirm = vi.fn(() => true);
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollIntoViewIfNeeded = vi.fn();
});
afterEach(() => vi.restoreAllMocks());

describe("AnnotationsEditor", () => {
    it("turns numerical order on when ids are already 1, 2, 3…", async () => {
        const { q } = await mountEditor({
            annotations: [note(1), note(2), note(3)],
        });
        expect(keepOrganizedBox(q).checked).toBe(true);
    });

    it("leaves numerical order off when ids have gaps or text", async () => {
        const gaps = await mountEditor({ annotations: [note(1), note(3)] });
        expect(keepOrganizedBox(gaps.q).checked).toBe(false);
        const text = await mountEditor({ annotations: [note("a"), note("b")] });
        expect(keepOrganizedBox(text.q).checked).toBe(false);
    });

    it("shows locked notes as EN/FR previews", async () => {
        const { container } = await mountEditor({
            annotations: [note(1, "Hello")],
        });
        const preview = container.querySelector("[inert]");
        expect(preview.textContent).toContain("Hello");
        expect(preview.textContent).toContain("Hello (fr)");
        expect(container.querySelector("fieldset")).toBeNull();
    });

    it("adds an unlocked note at the end with the next number", async () => {
        const { doc, q } = await mountEditor({
            annotations: [note(1), note(2)],
        });
        const addButtons = q.getAllByTitle("Add a new annotation");
        await fireEvent.click(addButtons.at(-1));
        expect(ids(doc)).toEqual([1, 2, 3]);
        expect(doc.annotations[2].state._unlocked).toBe(true);
    });

    it("inserts a note at the top and renumbers when numerical order is on", async () => {
        const { doc, q } = await mountEditor({
            annotations: [note(1, "A"), note(2, "B")],
        });
        await fireEvent.click(q.getAllByTitle("Add a new annotation")[0]);
        expect(ids(doc)).toEqual([1, 2, 3]);
        expect(doc.annotations.map((a) => a.content.en)).toEqual([
            undefined,
            "A",
            "B",
        ]);
    });

    it("deletes a note and renumbers the rest", async () => {
        const { doc, container } = await mountEditor({
            annotations: [unlockedNote(1, "A"), note(2, "B"), note(3, "C")],
        });
        await fireEvent.click(container.querySelector("button.bg-red-100"));
        expect(doc.annotations.map((a) => a.content.en)).toEqual(["B", "C"]);
        expect(ids(doc)).toEqual([1, 2]);
    });

    it("moves a note down and renumbers", async () => {
        const { doc, container } = await mountEditor({
            annotations: [unlockedNote(1, "A"), note(2, "B")],
        });
        await fireEvent.click(
            container.querySelector(
                '[aria-label="Push the slice towards the end"]',
            ),
        );
        expect(doc.annotations.map((a) => a.content.en)).toEqual(["B", "A"]);
        expect(ids(doc)).toEqual([1, 2]);
    });

    it("renumbers existing notes when numerical order is turned on", async () => {
        const { doc, q } = await mountEditor({
            annotations: [note(1), note(5), note(9)],
        });
        await fireEvent.click(keepOrganizedBox(q));
        expect(ids(doc)).toEqual([1, 2, 3]);
    });

    // KNOWN BUG: with numerical order off, a new note gets id = count + 1,
    // even when that id is already used (e.g. ids 1 and 3 → new note is 3).
    it.fails("gives a new note an id that is not already used", async () => {
        const { doc, q } = await mountEditor({
            annotations: [note(1), note(3)],
        });
        await fireEvent.click(q.getAllByTitle("Add a new annotation").at(-1));
        expect(new Set(ids(doc)).size).toBe(3);
    });

    // KNOWN BUG: renumbering changes note ids but not the [^n] markers in
    // the slices, so after deleting note 1 the text's [^2] now points to the
    // old note 3.
    it.fails("updates [^n] markers in the slices when notes are renumbered", async () => {
        const { doc, container } = await mountEditor({
            annotations: [unlockedNote(1, "First"), note(2, "Second")],
            slices: [
                {
                    type: "markdown",
                    content: { en: "Claim[^2]", fr: "Affirmation[^2]" },
                },
            ],
        });
        await fireEvent.click(container.querySelector("button.bg-red-100"));
        expect(doc.annotations[0].content.en).toBe("Second");
        expect(doc.slices[0].content.en).toBe("Claim[^1]");
    });
});

describe("AnnotationEditor", () => {
    const mountOne = (annotation, props = {}) =>
        render(AnnotationEditor, {
            props: { annotation, canMoveUp: true, canMoveDown: true, ...props },
        });

    it("shows the marker to use in the text", () => {
        const a = reactive(new Annotation(note(4)));
        const { container } = mountOne(a);
        expect(container.querySelector("legend").textContent).toContain("[^4]");
    });

    it("removes characters that are not allowed in an id", async () => {
        const a = reactive(new Annotation(note(1)));
        const { getByLabelText } = mountOne(a);
        const input = getByLabelText("Annotation identifier");
        input.value = "my note #2!";
        await fireEvent.change(input);
        expect(a.id).toBe("mynote2");
    });

    it("hides the id field when numerical order is on", () => {
        const a = reactive(new Annotation(note(1)));
        const { queryByLabelText } = mountOne(a, { readonlyId: true });
        expect(queryByLabelText("Annotation identifier")).toBeNull();
    });

    it("edits markdown content in both languages", async () => {
        const a = reactive(new Annotation(note(1, "Old")));
        const { getByLabelText } = mountOne(a);
        await fireEvent.update(getByLabelText("FR"), "Nouveau");
        expect(a.content.fr).toBe("Nouveau");
    });

    it("switches to BibTeX fields", async () => {
        const a = reactive(new Annotation(note(1)));
        const { container, getByLabelText } = mountOne(a);
        await fireEvent.update(container.querySelector("select"), "bibtex");
        expect(a.content_type).toBe("bibtex");
        await fireEvent.update(getByLabelText("EN"), "@book{x, title={T}}");
        expect(a.content.en).toBe("@book{x, title={T}}");
    });
});
