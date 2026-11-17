import { describe, it, expect } from "vite-plus/test";
import Annotation from "../../src/models/Annotation";
import AnnotationAnchorsRenderer from "../../src/components/Renderer/AnnotationAnchorsRenderer";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { loadSample, mountVnode, yamlDocument } from "../helpers";

const note = (id, en = `Note ${id}`, extra = {}) => ({
    id,
    content: { en, fr: `${en} (fr)` },
    ...extra,
});

describe("Annotation", () => {
    it("defaults content_type to markdown", () => {
        expect(new Annotation(note(1)).content_type).toBe("markdown");
    });

    it("reads bilingual content", () => {
        expect(new Annotation(note(1, "Hello")).content).toEqual({
            en: "Hello",
            fr: "Hello (fr)",
        });
    });

    it("serializes id, content_type and content", () => {
        expect(new Annotation(note(3, "x")).toArray()).toEqual({
            id: 3,
            content_type: "markdown",
            content: { en: "x", fr: "x (fr)" },
        });
    });

    it("serializes the unlocked state only when set", () => {
        expect(new Annotation(note(1)).toArray()).not.toHaveProperty("state");
        expect(
            new Annotation({ ...note(1), state: { _unlocked: true } }).toArray()
                .state,
        ).toEqual({ _unlocked: true });
    });

    it("builds anchors with and without a prefix", () => {
        const a = new Annotation(note(4));
        expect(a.annotationAnchor).toBe("antn_4");
        a.state.prefix = "doc";
        expect(a.annotationAnchor).toBe("doc_antn_4");
        expect(a.getReferenceAnchor(2)).toBe("ref_doc_antn_4_2");
    });

    it("gives each in-text reference a unique id", () => {
        const a = new Annotation(note(1));
        const first = a.getAnchorDomElement().querySelector("a");
        const second = a.getAnchorDomElement().querySelector("a");
        expect(first.id).toBe("ref_antn_1_0");
        expect(second.id).toBe("ref_antn_1_1");
        expect(first.getAttribute("href")).toBe("#antn_1");
        expect(first.getAttribute("role")).toBe("doc-noteref");
        expect(first.textContent).toBe("1");
    });

    it("renders markdown content in the right language", async () => {
        const a = new Annotation(note(1, "**Bold**"));
        const { container } = await mountVnode(() => a.renderAsVnode("en"));
        expect(container.querySelector("strong").textContent).toBe("Bold");
        expect(container.querySelector("#antn_1")).not.toBeNull();
    });

    it("adds a back link only when highlighted", async () => {
        const a = new Annotation(note(1));
        const plainNote = await mountVnode(() => a.renderAsVnode("en", false));
        expect(
            plainNote.container.querySelector("a[href='#ref_antn_1_0']"),
        ).toBeNull();
        const highlighted = await mountVnode(() => a.renderAsVnode("fr", true));
        const back = highlighted.container.querySelector(
            "a[href='#ref_antn_1_0']",
        );
        expect(back.getAttribute("aria-label")).toBe("Revenir au contenu");
    });
});

describe("Annotations in a document", () => {
    it("accepts annotations as a map", () => {
        const doc = PBOMLDocument.initFromYaml(
            loadSample("annotationsIsObject"),
        );
        expect(doc.annotations.map((a) => a.id)).toEqual([1, 2, 3]);
    });

    it("sorts annotations by id, numerically", () => {
        const doc = new PBOMLDocument(
            yamlDocument({ annotations: [note(10), note(2), note(1)] }),
        );
        expect(doc.annotations.map((a) => a.id)).toEqual([1, 2, 10]);
    });

    it("passes the document prefix to every annotation", () => {
        const doc = new PBOMLDocument(
            yamlDocument({ annotations: [note(1)] }),
            "p",
        );
        expect(doc.annotations[0].annotationAnchor).toBe("p_antn_1");
    });

    it("keeps annotations through save and reload", () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                annotations: [
                    note(1),
                    note(2, "x", { content_type: "bibtex" }),
                ],
            }),
        );
        const reloaded = PBOMLDocument.initFromYaml(doc.serialize());
        expect(reloaded.annotations.map((a) => a.toArray())).toEqual(
            doc.annotations.map((a) => a.toArray()),
        );
    });
});

describe("AnnotationAnchorsRenderer", () => {
    const setup = (html) => {
        const main = document.createElement("div");
        main.innerHTML = html;
        return main;
    };

    it("replaces every [^id] marker in prose with a link", () => {
        const main = setup(
            "<div class='pboml-prose'><p>A[^1] and B[^1] and C[^2]</p></div>",
        );
        new AnnotationAnchorsRenderer(main, [
            new Annotation(note(1)),
            new Annotation(note(2)),
        ]).render();
        const links = main.querySelectorAll("a[role='doc-noteref']");
        expect(links).toHaveLength(3);
        expect(main.innerHTML).not.toContain("[^");
        expect([...links].map((l) => l.id)).toEqual([
            "ref_antn_1_0",
            "ref_antn_1_1",
            "ref_antn_2_0",
        ]);
    });

    it("does not confuse [^1] with [^10]", () => {
        const main = setup("<div class='pboml-prose'>x[^10]</div>");
        new AnnotationAnchorsRenderer(main, [new Annotation(note(1))]).render();
        expect(main.textContent).toBe("x[^10]");
    });

    it("leaves markers outside .pboml-prose alone", () => {
        const main = setup("<div>x[^1]</div>");
        new AnnotationAnchorsRenderer(main, [new Annotation(note(1))]).render();
        expect(main.textContent).toBe("x[^1]");
    });

    it("does nothing without annotations or a root element", () => {
        expect(() =>
            new AnnotationAnchorsRenderer(null, null).render(),
        ).not.toThrow();
        expect(() =>
            new AnnotationAnchorsRenderer(null, [
                new Annotation(note(1)),
            ]).render(),
        ).not.toThrow();
    });
});
