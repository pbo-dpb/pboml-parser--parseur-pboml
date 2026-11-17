import "../helpers/lang-en.js";
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vite-plus/test";
import { reactive, h } from "vue";
import { render, fireEvent } from "@testing-library/vue";
import SliceEditor from "../../src/editors/SliceEditor";
import LockStateToggler from "../../src/components/LockStateToggler";
import MoveButton from "../../src/components/Editor/MoveButton";
import PreviewingButton from "../../src/components/Editor/PreviewingButton";
import SliceSourceCodeEditButton from "../../src/components/Editor/SliceSourceCodeEditButton";
import MarkdownSlice from "../../src/models/contents/MarkdownSlice";
import { flush, waitForSelector } from "../helpers";

const makeSlice = (extra = {}) =>
    reactive(
        new MarkdownSlice({
            type: "markdown",
            label: { en: "My label", fr: "Mon libellé" },
            content: { en: "English body", fr: "Texte français" },
            ...extra,
        }),
    );

const unlocked = (extra = {}) =>
    makeSlice({ state: { _unlocked: true }, ...extra });

const mountEditor = async (slice, listeners = {}) => {
    const result = render(SliceEditor, {
        props: { slice, language: "en" },
        attrs: listeners,
    });
    await flush(10);
    return result;
};

const findIdInput = (container) => {
    const fieldset = [...container.querySelectorAll("fieldset")].find(
        (f) => f.querySelector("legend")?.textContent.trim() === "ID",
    );
    if (!fieldset) throw new Error("ID field not rendered yet");
    return fieldset.querySelector("input, textarea");
};

const button = (container, label) =>
    container.querySelector(`button[aria-label="${label}"]`);

describe("SliceEditor", () => {
    beforeEach(() => {
        window.confirm = vi.fn(() => true);
        Element.prototype.scrollIntoViewIfNeeded = vi.fn();
    });
    afterEach(() => {
        vi.restoreAllMocks();
        delete Element.prototype.scrollIntoViewIfNeeded;
    });

    it("shows read-only EN and FR previews while the slice is locked", async () => {
        const { container } = await mountEditor(makeSlice());
        expect(container.querySelector("fieldset")).toBeNull();
        expect(container.textContent).toContain("English body");
        expect(container.textContent).toContain("Texte français");
        const preview = container.querySelector("[inert]");
        expect(preview.getAttribute("aria-hidden")).toBe("true");
    });

    it("shows the editing form with the slice type once unlocked", async () => {
        const { container } = await mountEditor(unlocked());
        expect(
            container.querySelector("fieldset legend").textContent,
        ).toContain("Text Block (markdown)");
    });

    it("unlocks the slice with the lock button", async () => {
        const slice = makeSlice();
        const { container } = await mountEditor(slice, {
            onMoveSlice: vi.fn(),
        });
        await fireEvent.click(container.querySelector("button[id]"));
        await flush();
        expect(slice.state._unlocked).toBe(true);
        expect(container.querySelector("fieldset")).not.toBeNull();
    });

    it("only shows delete, duplicate and move buttons when the parent listens", async () => {
        const { container } = await mountEditor(unlocked());
        expect(button(container, "Delete")).toBeNull();
        expect(container.querySelector("button[id]")).toBeNull(); // lock toggle
    });

    it("emits delete-slice after confirmation", async () => {
        const onDeleteSlice = vi.fn();
        const slice = unlocked();
        const { container } = await mountEditor(slice, { onDeleteSlice });
        await fireEvent.click(
            await waitForSelector(container, "button.bg-red-100"),
        );
        expect(window.confirm).toHaveBeenCalled();
        expect(onDeleteSlice).toHaveBeenCalledWith(slice);
    });

    it("does not delete when the confirmation is cancelled", async () => {
        window.confirm = vi.fn(() => false);
        const onDeleteSlice = vi.fn();
        const { container } = await mountEditor(unlocked(), { onDeleteSlice });
        await fireEvent.click(
            await waitForSelector(container, "button.bg-red-100"),
        );
        expect(onDeleteSlice).not.toHaveBeenCalled();
    });

    it("emits move-slice with the direction", async () => {
        const onMoveSlice = vi.fn();
        const slice = unlocked();
        const { container } = await mountEditor(slice, { onMoveSlice });
        await fireEvent.click(
            await waitForSelector(
                container,
                'button[aria-label="Push the slice towards the start"]',
            ),
        );
        expect(onMoveSlice).toHaveBeenCalledWith(slice, "up");
    });

    it("switches to the source code editor", async () => {
        const slice = unlocked();
        const { container } = await mountEditor(slice);
        await fireEvent.click(
            await waitForSelector(
                container,
                'button[title="Edit source code"]',
            ),
        );
        await flush();
        expect(slice.state.isEditingSourceCode).toBe(true);
        expect(container.querySelector("textarea.font-mono").value).toContain(
            "English body",
        );
    });

    it("shows a French preview and leaves other modes", async () => {
        const slice = unlocked();
        slice.state.isEditingSourceCode = true;
        const { container } = await mountEditor(slice);
        const frButton = [...container.querySelectorAll("button")].find(
            (b) => b.textContent.trim() === "FR",
        );
        await fireEvent.click(frButton);
        await flush();
        expect(slice.state.isPreviewing).toBe("fr");
        expect(slice.state.isEditingSourceCode).toBe(false);
        expect(container.textContent).toContain("Preview (fr)");
    });

    it("shows the ID field in meta editing mode and saves it on blur", async () => {
        const slice = unlocked({ id: "old-id" });
        slice.state.isEditingMeta = true;
        const { container } = await mountEditor(slice);
        const idInput = await vi.waitFor(() => findIdInput(container));
        expect(idInput.value).toBe("old-id");
        idInput.value = "new-id";
        await fireEvent.blur(idInput);
        expect(slice.id).toBe("new-id");
    });

    it("saves an emptied ID as null", async () => {
        const slice = unlocked({ id: "old-id" });
        slice.state.isEditingMeta = true;
        const { container } = await mountEditor(slice);
        const idInput = await vi.waitFor(() => findIdInput(container));
        idInput.value = "";
        await fireEvent.blur(idInput);
        expect(slice.id).toBeNull();
    });
});

describe("Editor buttons", () => {
    it("MoveButton disables the directions that are not allowed", async () => {
        const { container } = render(MoveButton, {
            props: { canMoveUp: false, canMoveDown: true },
        });
        expect(
            container.querySelector(
                '[aria-label="Push the slice towards the start"]',
            ).disabled,
        ).toBe(true);
        expect(
            container.querySelector(
                '[aria-label="Push the slice towards the end"]',
            ).disabled,
        ).toBe(false);
    });

    it("PreviewingButton toggles the same language off", async () => {
        const { container, emitted } = render(PreviewingButton, {
            props: { isPreviewing: "en" },
        });
        const [en, fr] = container.querySelectorAll("button");
        await fireEvent.click(en);
        await fireEvent.click(fr);
        expect(emitted().previewing).toEqual([[false], ["fr"]]);
        expect(en.getAttribute("aria-pressed")).toBe("true");
    });

    // KNOWN BUG (accessibility): both buttons have aria-label "Preview slice",
    // which hides the visible EN / FR text from screen readers.
    it.fails("gives the EN and FR preview buttons different accessible names", () => {
        const { container } = render(PreviewingButton, { props: {} });
        const [en, fr] = container.querySelectorAll("button");
        expect(en.getAttribute("aria-label")).not.toBe(
            fr.getAttribute("aria-label"),
        );
    });

    // KNOWN BUG (accessibility): the source code button reuses the
    // "Preview slice" aria-label.
    it.fails("labels the source code button as a source code button", () => {
        const { container } = render(SliceSourceCodeEditButton, {
            props: { isEditingSource: false },
        });
        expect(
            container.querySelector("button").getAttribute("aria-label"),
        ).toBe("Edit source code");
    });
});

describe("LockStateToggler", () => {
    beforeEach(() => {
        Element.prototype.scrollIntoViewIfNeeded = vi.fn();
    });
    afterEach(() => {
        delete Element.prototype.scrollIntoViewIfNeeded;
    });

    it("toggles the unlocked state and the icon colour", async () => {
        const target = reactive({ state: { _unlocked: false } });
        const { container } = render(LockStateToggler, {
            props: { unlockableObject: target },
        });
        const btn = container.querySelector("button");
        expect(btn.className).toContain("text-green-800");
        await fireEvent.click(btn);
        expect(target.state._unlocked).toBe(true);
        expect(btn.className).toContain("text-red-800");
        await flush();
        expect(Element.prototype.scrollIntoViewIfNeeded).toHaveBeenCalled();
    });

    // KNOWN BUG: the id is built with `-` instead of `+`, so it is "NaN"
    // for every toggle on the page (duplicate ids).
    it.fails("gives each toggle a unique, valid id", () => {
        const a = render(LockStateToggler, {
            props: { unlockableObject: { state: {} } },
        }).container.querySelector("button").id;
        const b = render(LockStateToggler, {
            props: { unlockableObject: { state: {} } },
        }).container.querySelector("button").id;
        expect(a).toMatch(/^toggle-lock-/);
        expect(a).not.toBe(b);
    });

    // NOTE: scrollIntoViewIfNeeded() does not exist in Firefox, so clicking
    // the lock there throws in the nextTick callback. Not tested here because
    // the error surfaces as an unhandled rejection outside the test.
    it("is rendered as a button", () => {
        const { container } = render(() =>
            h(LockStateToggler, { unlockableObject: { state: {} } }),
        );
        expect(container.querySelector("button")).not.toBeNull();
    });
});
