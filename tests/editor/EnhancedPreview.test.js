// @vitest-environment jsdom
// jsdom is used because happy-dom tries to download the <script> that the
// enhanced preview adds to the pop-up.
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
import { render, fireEvent } from "@testing-library/vue";
import EditorPreviews from "../../src/components/Editor/EditorPreviews.vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { flush, loadSample, yamlDocument } from "../helpers";

/**
 * "Open enhanced preview" opens a pop-up window with two <pboml-parser>
 * elements (EN and FR) fed with the current document. The pop-up is replaced
 * here by a fake window backed by a separate HTML document.
 */

let popup;

function fakePopup() {
    const doc = document.implementation.createHTMLDocument("popup");
    return { document: doc, close: vi.fn(), onbeforeunload: null };
}

beforeEach(() => {
    popup = fakePopup();
    window.open = vi.fn(() => popup);
    window.alert = vi.fn();
    window.pbomlParserScriptUrl = "https://example.org/assets/main.js";
});
afterEach(() => vi.restoreAllMocks());

const decodePayload = (el) =>
    Buffer.from(el.getAttribute("payload").split(",")[1], "base64").toString(
        "utf8",
    );

async function openPreview(pbomlDocument) {
    const view = render(EditorPreviews, { props: { pbomlDocument } });
    await fireEvent.click(view.getByTitle("Open enhanced preview"));
    await flush();
    return view;
}

describe("Enhanced preview window", () => {
    it("loads the parser script in the pop-up", async () => {
        await openPreview(reactive(new PBOMLDocument(yamlDocument())));
        const script = popup.document.head.querySelector("script");
        expect(script.getAttribute("src")).toBe(
            "https://example.org/assets/main.js",
        );
        expect(script.getAttribute("type")).toBe("module");
    });

    it("shows the document side by side in English and French", async () => {
        const doc = reactive(PBOMLDocument.initFromYaml(loadSample("leg0")));
        await openPreview(doc);
        const en = popup.document.getElementById("en-pboml-preview");
        const fr = popup.document.getElementById("fr-pboml-preview");
        expect(en.tagName).toBe("PBOML-PARSER");
        expect(en.getAttribute("language")).toBe("en");
        expect(fr.getAttribute("language")).toBe("fr");
        expect(en.getAttribute("payload")).toMatch(/^data:text\/yaml;base64,/);
        expect(decodePayload(en)).toBe(doc.serialize());
        expect(decodePayload(fr)).toBe(doc.serialize());
    });

    it("keeps accented characters intact in the payload", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    document: { title: { en: "Cost", fr: "Coût à l'été" } },
                }),
            ),
        );
        await openPreview(doc);
        const fr = popup.document.getElementById("fr-pboml-preview");
        expect(decodePayload(fr)).toContain("Coût à l'été");
    });

    it("updates the pop-up when the document changes", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    slices: [{ type: "markdown", content: { en: "Before" } }],
                }),
            ),
        );
        await openPreview(doc);
        doc.slices[0].content.en = "After";
        await flush();
        const en = popup.document.getElementById("en-pboml-preview");
        expect(decodePayload(en)).toContain("After");
        // The same elements are reused, not added again.
        expect(popup.document.querySelectorAll("pboml-parser")).toHaveLength(2);
    });

    it("toggles: a second click closes the pop-up", async () => {
        const view = await openPreview(
            reactive(new PBOMLDocument(yamlDocument())),
        );
        const button = view.getByTitle("Close enhanced preview");
        expect(button.getAttribute("aria-pressed")).toBe("true");
        await fireEvent.click(button);
        expect(popup.close).toHaveBeenCalled();
        expect(
            view
                .getByTitle("Open enhanced preview")
                .getAttribute("aria-pressed"),
        ).toBe("false");
    });

    it("notices when the author closes the pop-up", async () => {
        const view = await openPreview(
            reactive(new PBOMLDocument(yamlDocument())),
        );
        popup.onbeforeunload();
        await flush();
        expect(view.getByTitle("Open enhanced preview")).toBeTruthy();
    });

    it("warns when the pop-up is blocked", async () => {
        window.open = vi.fn(() => null);
        const view = render(EditorPreviews, {
            props: {
                pbomlDocument: reactive(new PBOMLDocument(yamlDocument())),
            },
        });
        await fireEvent.click(view.getByTitle("Open enhanced preview"));
        expect(window.alert).toHaveBeenCalledWith(
            expect.stringContaining("popup blocker"),
        );
        expect(
            view
                .getByTitle("Open enhanced preview")
                .getAttribute("aria-pressed"),
        ).toBe("false");
    });

    // KNOWN BUG: the window features are passed as "1024x768,toolbar=no,…".
    // "WxH" is not a valid feature, so browsers ignore the size; it should be
    // "width=1024,height=768".
    it.fails("asks for a pop-up the size of the editor window", async () => {
        await openPreview(reactive(new PBOMLDocument(yamlDocument())));
        const features = window.open.mock.calls[0][2];
        expect(features).toMatch(/width=\d+/);
        expect(features).toMatch(/height=\d+/);
    });
});
