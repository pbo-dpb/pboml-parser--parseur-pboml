import "../helpers/lang-en.js";
import { describe, it, expect, vi } from "vite-plus/test";
import { render, fireEvent } from "@testing-library/vue";
import { PDFDocument } from "pdf-lib";
import FilePicker from "../../src/components/FilePicker/FilePicker.vue";
import FilePickerInput from "../../src/components/FilePicker/FilePickerInput.vue";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { loadSample, waitUntil } from "../helpers";

/** Selects a file in the picker's <input type=file>. */
async function pickFile(container, file) {
    const input = container.querySelector("input[type=file]");
    Object.defineProperty(input, "files", {
        value: [file],
        configurable: true,
    });
    await fireEvent.change(input);
}

const yamlFile = (text, name = "doc.yaml") =>
    new File([text], name, { type: "application/x-yaml" });

/** A real PDF made with pdf-lib, optionally carrying PBOML in its Subject. */
async function pdfFile(subject) {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    if (subject) pdf.setSubject(subject);
    const bytes = await pdf.save();
    return new File([bytes], "doc.pdf", { type: "application/pdf" });
}

const errorText = (container) =>
    container.querySelector("label")?.textContent ?? "";

describe("FilePickerInput", () => {
    it("opens a PBOML YAML file", async () => {
        const { container, emitted } = render(FilePickerInput, {
            props: { prefix: "p" },
        });
        await pickFile(container, yamlFile(loadSample("leg0")));
        await waitUntil(() => expect(emitted().pick).toBeTruthy());
        const [doc] = emitted().pick[0];
        expect(doc).toBeInstanceOf(PBOMLDocument);
        expect(doc.slices.length).toBeGreaterThan(0);
        expect(doc.state.prefix).toBe("p");
    });

    it("reports invalid YAML", async () => {
        const { container, emitted } = render(FilePickerInput);
        await pickFile(container, yamlFile("a: [unclosed"));
        await waitUntil(() =>
            expect(errorText(container)).toContain("invalid yaml"),
        );
        expect(emitted().pick).toBeUndefined();
    });

    it("reports YAML that is not PBOML", async () => {
        const { container } = render(FilePickerInput);
        await pickFile(container, yamlFile("hello: world"));
        await waitUntil(() =>
            expect(errorText(container)).toContain("invalid PBOML"),
        );
    });

    it("opens PBOML stored in a PDF's Subject", async () => {
        const { container, emitted } = render(FilePickerInput);
        await pickFile(
            container,
            await pdfFile(loadSample("slicesHasTwoSlices")),
        );
        await waitUntil(() => expect(emitted().pick).toBeTruthy());
        expect(emitted().pick[0][0].slices).toHaveLength(2);
    });

    it("reports a file that is not a readable PDF", async () => {
        const { container } = render(FilePickerInput);
        await pickFile(
            container,
            new File(["not a pdf"], "x.pdf", { type: "application/pdf" }),
        );
        await waitUntil(() =>
            expect(errorText(container)).toContain("Unable to open PDF"),
        );
    });

    // KNOWN BUG: after setting "The PDF does not contain PBOML content", the
    // code still tries to parse the (empty) subject, and that error message
    // replaces the useful one.
    it.fails("explains when a PDF has no PBOML in it", async () => {
        const { container } = render(FilePickerInput);
        await pickFile(container, await pdfFile(null));
        await waitUntil(() =>
            expect(errorText(container)).toContain("does not contain PBOML"),
        );
    });

    // KNOWN BUG: the input has `if="pboml-file-picker"` instead of
    // `id="pboml-file-picker"`, so the error label is not linked to it.
    it.fails("links the error message to the file input", async () => {
        const { container } = render(FilePickerInput);
        await pickFile(container, yamlFile("a: ["));
        await waitUntil(() => expect(errorText(container)).not.toBe(""));
        const label = container.querySelector("label");
        expect(
            container.querySelector(`#${label.getAttribute("for")}`),
        ).not.toBeNull();
    });
});

describe("FilePicker", () => {
    it("creates an empty document with New", async () => {
        const { getByText, emitted } = render(FilePicker);
        await fireEvent.click(getByText("New"));
        const [doc] = emitted().pick[0];
        expect(doc).toBeInstanceOf(PBOMLDocument);
        expect(doc.slices).toEqual([]);
        expect(doc.pbomlVersion).toBe("1.0.0");
    });

    it("passes on a picked file", async () => {
        const { container, emitted } = render(FilePicker);
        await pickFile(container, yamlFile(loadSample("slicesHasOneSlice")));
        await waitUntil(() => expect(emitted().pick).toBeTruthy());
        expect(emitted().pick[0][0].slices).toHaveLength(1);
    });
});
