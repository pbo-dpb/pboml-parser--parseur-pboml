import "../helpers/lang-en.js";
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { h } from "vue";
import { render } from "@testing-library/vue";
import AnnotationBibtex from "../../src/components/Renderer/AnnotationBibtex";
import Renderer from "../../src/components/Renderer/Renderer";
import Annotation from "../../src/models/Annotation";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { yamlDocument, waitUntil } from "../helpers";

/**
 * BibTeX notes are formatted with citation-js (APA style). Parsing happens
 * locally, so these tests do not need the network.
 */

const knuth =
    "@book{knuth, author={Donald Knuth}, title={The Art of Computer Programming}, year={1968}, publisher={Addison-Wesley}}";
const hofstadter =
    "@book{geb, author={Douglas Hofstadter}, title={Gödel, Escher, Bach}, year={1979}, publisher={Basic Books}}";

const bibtexNote = (content) =>
    new Annotation({ id: 1, content_type: "bibtex", content });

const mountCitation = (annotation, language = "en") =>
    render(AnnotationBibtex, { props: { annotation, language } });

afterEach(() => vi.restoreAllMocks());

describe("AnnotationBibtex", () => {
    it("formats a BibTeX entry as an APA reference", async () => {
        const { container } = mountCitation(
            bibtexNote({ en: knuth, fr: knuth }),
        );
        await waitUntil(() =>
            expect(container.querySelector(".csl-entry")).not.toBeNull(),
        );
        const entry = container.querySelector(".csl-entry");
        expect(entry.textContent).toBe(
            "Knuth, D. (1968). The Art of Computer Programming. Addison-Wesley.",
        );
        expect(entry.querySelector("i").textContent).toBe(
            "The Art of Computer Programming",
        );
    });

    it("uses the entry for the requested language", async () => {
        const { container } = mountCitation(
            bibtexNote({ en: knuth, fr: hofstadter }),
            "fr",
        );
        await waitUntil(() =>
            expect(container.querySelector(".csl-entry")).not.toBeNull(),
        );
        expect(container.textContent).toContain("Hofstadter");
        expect(container.textContent).toContain("Gödel, Escher, Bach");
    });

    it("shows the raw text in red when the BibTeX can't be parsed", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { container } = mountCitation(
            bibtexNote({ en: "not bibtex {{" }),
        );
        await waitUntil(() =>
            expect(container.querySelector(".text-red-500")).not.toBeNull(),
        );
        expect(container.textContent).toBe("not bibtex {{");
    });

    it("shows an empty reference when a language has no BibTeX", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { container } = mountCitation(bibtexNote({ en: knuth }), "fr");
        await waitUntil(() =>
            expect(container.querySelector(".csl-bib-body")).not.toBeNull(),
        );
        expect(container.querySelector(".csl-entry")).toBeNull();
        expect(container.textContent).not.toContain("[object Object]");
    });

    it("is used for BibTeX notes in a rendered document", async () => {
        const doc = new PBOMLDocument(
            yamlDocument({
                annotations: [
                    {
                        id: 1,
                        content_type: "bibtex",
                        content: { en: knuth, fr: knuth },
                    },
                ],
            }),
        );
        const { container } = render({
            render: () => h(Renderer, { pbomlDocument: doc, language: "en" }),
        });
        await waitUntil(() =>
            expect(
                container.querySelector("#antn_1 .csl-entry"),
            ).not.toBeNull(),
        );
        expect(container.querySelector("#antn_1").textContent).toContain(
            "Knuth, D. (1968)",
        );
    });
});
