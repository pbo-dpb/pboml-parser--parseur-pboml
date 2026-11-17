import "../helpers/lang-en.js";
import { describe, it, expect } from "vite-plus/test";
import { reactive } from "vue";
import { render, fireEvent } from "@testing-library/vue";
import BilingualInput from "../../src/components/Editor/Inputs/BilingualInput.vue";
import NumberInput from "../../src/components/Editor/Inputs/NumberInput.vue";
import MarkdownTextarea from "../../src/components/Editor/Inputs/MarkdownTextarea.vue";
import SliceLabelEditor from "../../src/components/Editor/SliceLabelEditor";
import SliceReferenceEditor from "../../src/components/Editor/SliceReferenceEditor";
import SlicePresentationEditor from "../../src/components/Editor/SlicePresentationEditor";
import DocumentMetaEditor from "../../src/components/Editor/DocumentMetaEditor/DocumentMetaEditor";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { flush, yamlDocument } from "../helpers";

/** Fires a paste event carrying the given clipboard data. */
function paste(el, data) {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    event.clipboardData = { getData: (type) => data[type] ?? "" };
    el.dispatchEvent(event);
    return event;
}

describe("BilingualInput", () => {
    it("shows both languages and emits the whole object on change", async () => {
        const { container, emitted } = render(BilingualInput, {
            props: {
                modelValue: { en: "Hello", fr: "Bonjour" },
                label: "Title",
            },
        });
        const [en, fr] = container.querySelectorAll("input");
        expect(en.value).toBe("Hello");
        expect(fr.value).toBe("Bonjour");
        await fireEvent.update(fr, "Salut");
        expect(emitted()["update:modelValue"].at(-1)[0]).toEqual({
            en: "Hello",
            fr: "Salut",
        });
    });

    it("keeps the other language when one is cleared", async () => {
        const { container, emitted } = render(BilingualInput, {
            props: { modelValue: { en: "Hello", fr: "Bonjour" } },
        });
        await fireEvent.update(container.querySelector("input"), "");
        expect(emitted()["update:modelValue"].at(-1)[0]).toEqual({
            en: "",
            fr: "Bonjour",
        });
    });

    it("uses side-by-side text areas for the large size", () => {
        const { container } = render(BilingualInput, {
            props: { modelValue: { en: "a", fr: "b" }, inputSize: "lg" },
        });
        expect(container.querySelectorAll("textarea")).toHaveLength(2);
    });

    it("links each label to its field", () => {
        const { getByLabelText } = render(BilingualInput, {
            props: { modelValue: { en: "a", fr: "b" } },
        });
        expect(getByLabelText("EN").value).toBe("a");
        expect(getByLabelText("FR").value).toBe("b");
    });
});

describe("NumberInput", () => {
    it("emits numbers while typing", async () => {
        const { container, emitted } = render(NumberInput, {
            props: { modelValue: 1 },
        });
        await fireEvent.update(container.querySelector("input"), "2.5");
        expect(emitted()["update:modelValue"].at(-1)).toEqual([2.5]);
    });

    it("emits null when emptied and left", async () => {
        const { container, emitted } = render(NumberInput, {
            props: { modelValue: 1 },
        });
        const input = container.querySelector("input");
        input.value = "";
        await fireEvent.blur(input);
        expect(emitted()["update:modelValue"].at(-1)).toEqual([null]);
    });

    it("keeps zero as a number when left", async () => {
        const { container, emitted } = render(NumberInput, {
            props: { modelValue: 1 },
        });
        const input = container.querySelector("input");
        input.value = "0";
        await fireEvent.blur(input);
        expect(emitted()["update:modelValue"].at(-1)).toEqual([0]);
    });
});

describe("MarkdownTextarea paste handling", () => {
    it("converts pasted HTML to markdown", async () => {
        const { container, emitted } = render(MarkdownTextarea, {
            props: { modelValue: "" },
        });
        await flush();
        const area = container.querySelector("textarea");
        const event = paste(area, {
            "text/html": "<p><strong>Bold</strong> text</p>",
        });
        expect(event.defaultPrevented).toBe(true);
        expect(emitted()["update:modelValue"].at(-1)).toEqual([
            "**Bold** text",
        ]);
    });

    it("inserts at the cursor position", async () => {
        const { container, emitted } = render(MarkdownTextarea, {
            props: { modelValue: "Hello world" },
        });
        await flush();
        const area = container.querySelector("textarea");
        area.value = "Hello world";
        area.setSelectionRange(6, 6);
        paste(area, { "text/html": "<p>big</p>" });
        expect(emitted()["update:modelValue"].at(-1)).toEqual([
            "Hello bigworld",
        ]);
    });

    // KNOWN BUG: plain-text clipboard content is also run through the
    // HTML → markdown converter, which escapes characters and drops anything
    // that looks like a tag (e.g. "<3" or "a < b > c").
    it.fails("inserts plain text as written", async () => {
        const { container, emitted } = render(MarkdownTextarea, {
            props: { modelValue: "" },
        });
        await flush();
        const text = "Rate is 5 * 2 and a_b_c, a < b > c";
        paste(container.querySelector("textarea"), { "text/plain": text });
        expect(emitted()["update:modelValue"].at(-1)).toEqual([text]);
    });

    it("uses a single-line input when multiline is false", () => {
        const { container } = render(MarkdownTextarea, {
            props: { modelValue: "x", multiline: false },
        });
        expect(container.querySelector("textarea")).toBeNull();
        expect(container.querySelector("input[type=text]").value).toBe("x");
    });
});

describe("Slice meta editors", () => {
    it("SliceLabelEditor shows both labels when not editing", () => {
        const { container } = render(SliceLabelEditor, {
            props: { label: { en: "Costs", fr: "Coûts" }, isEditing: false },
        });
        expect(container.textContent).toContain("Costs");
        expect(container.textContent).toContain("Coûts");
    });

    it("SliceLabelEditor hides an incomplete label when not editing", () => {
        const { container } = render(SliceLabelEditor, {
            props: { label: { en: "Costs" }, isEditing: false },
        });
        expect(container.textContent).toBe("");
    });

    it("SliceLabelEditor emits the edited label", async () => {
        const { container, emitted } = render(SliceLabelEditor, {
            props: { label: { en: "Costs", fr: "Coûts" }, isEditing: true },
        });
        await fireEvent.update(container.querySelector("input"), "Spending");
        expect(emitted()["update:modelValue"].at(-1)[0]).toEqual({
            en: "Spending",
            fr: "Coûts",
        });
    });

    it("SliceReferenceEditor emits the edited reference", async () => {
        const { container, emitted } = render(SliceReferenceEditor, {
            props: {
                referenced_as: { en: "Table 1", fr: "Tableau 1" },
                isEditing: true,
            },
        });
        const fr = container.querySelectorAll("input")[1];
        await fireEvent.update(fr, "Tableau 2");
        expect(emitted()["update:modelValue"].at(-1)[0]).toEqual({
            en: "Table 1",
            fr: "Tableau 2",
        });
    });

    it("SlicePresentationEditor checks the current presentation and emits changes", async () => {
        const { container, emitted } = render(SlicePresentationEditor, {
            props: { presentation: "aside", isEditing: true },
        });
        const radios = [...container.querySelectorAll("input[type=radio]")];
        expect(radios).toHaveLength(4);
        expect(radios.map((r) => r.checked)).toEqual([
            false,
            false,
            true,
            false,
        ]);
        await fireEvent.input(radios[1]);
        expect(emitted()["update:modelValue"].at(-1)).toEqual(["figure"]);
    });

    it("SlicePresentationEditor renders nothing when not editing", () => {
        const { container } = render(SlicePresentationEditor, {
            props: { presentation: null, isEditing: false },
        });
        expect(container.querySelector("input")).toBeNull();
    });

    // KNOWN BUG (accessibility): the radios have no shared `name`, so they
    // are not one radio group (arrow keys do not move between them).
    it.fails("SlicePresentationEditor puts its radios in one named group", () => {
        const { container } = render(SlicePresentationEditor, {
            props: { presentation: null, isEditing: true },
        });
        const names = [...container.querySelectorAll("input[type=radio]")].map(
            (r) => r.name,
        );
        expect(names[0]).toBeTruthy();
        expect(new Set(names).size).toBe(1);
    });
});

describe("DocumentMetaEditor", () => {
    it("edits the title, id and copyright of the document", async () => {
        const doc = reactive(
            new PBOMLDocument(
                yamlDocument({
                    document: { id: "RP-1", title: { en: "T", fr: "T-fr" } },
                }),
            ),
        );
        const { container } = render(DocumentMetaEditor, {
            props: { pbomlDocument: doc },
        });
        await flush();
        const inputs = container.querySelectorAll("input");
        // title EN, title FR, id, copyright EN, copyright FR
        await fireEvent.update(inputs[0], "New title");
        await fireEvent.update(inputs[2], "RP-2");
        await fireEvent.update(inputs[4], "© DPB");
        expect(doc.title).toEqual({ en: "New title", fr: "T-fr" });
        expect(doc.id).toBe("RP-2");
        expect(doc.copyright.fr).toBe("© DPB");
    });
});
