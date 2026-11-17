import { describe, it, expect } from "vite-plus/test";
import KvListSlice from "../../src/models/contents/KvListSlice";
import KvListVariablePair from "../../src/models/contents/KvListVariablePair";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { loadSample, mountVnode, plain } from "../helpers";

const prototype = (overrides = {}) => ({
    key: { type: "markdown", label: { en: "Name", fr: "Nom" } },
    value: { type: "markdown", label: { en: "Role", fr: "Rôle" } },
    ...overrides,
});

const kvPayload = (extra = {}) => ({
    type: "kvlist",
    prototype: prototype(),
    content: [
        {
            key: { content: { en: "Alice", fr: "Alice" } },
            value: { content: { en: "Analyst", fr: "Analyste" } },
        },
    ],
    ...extra,
});

describe("KvListSlice", () => {
    it("reads the prototype and the pairs", () => {
        const slice = new KvListSlice(kvPayload());
        expect(slice.prototype.key.type).toBe("markdown");
        expect(slice.prototype.value.label.fr).toBe("Rôle");
        expect(slice.prototype.display_labels).toBe(false);
        expect(slice.content).toHaveLength(1);
        expect(slice.content[0]).toBeInstanceOf(KvListVariablePair);
        expect(slice.content[0].key.content.en).toBe("Alice");
    });

    it("treats content that is not a list as empty", () => {
        expect(
            new KvListSlice({ type: "kvlist", content: "x" }).content,
        ).toEqual([]);
    });

    it("adds and removes entries", () => {
        const slice = new KvListSlice(kvPayload());
        slice.appendKvEntry();
        expect(slice.content).toHaveLength(2);
        const added = slice.content[1];
        expect(added.key.content).toEqual({ en: "", fr: "" });
        slice.removeKvEntry(added);
        expect(slice.content).toHaveLength(1);
    });

    it("serializes the prototype, pairs, and display_labels only when true", () => {
        const out = new KvListSlice(kvPayload()).toArray();
        expect(out.prototype).toEqual({
            key: { type: "markdown", label: { en: "Name", fr: "Nom" } },
            value: { type: "markdown", label: { en: "Role", fr: "Rôle" } },
        });
        expect(out.content).toEqual(kvPayload().content);

        const withLabels = new KvListSlice(
            kvPayload({ prototype: prototype({ display_labels: true }) }),
        ).toArray();
        expect(withLabels.prototype.display_labels).toBe(true);
    });

    it("keeps the leg0.yaml lists unchanged through save and reload", () => {
        const doc = PBOMLDocument.initFromYaml(loadSample("leg0"));
        const lists = doc.slices.filter((s) => s.type === "kvlist");
        const reloaded = PBOMLDocument.initFromYaml(
            doc.serialize(),
        ).slices.filter((s) => s.type === "kvlist");
        expect(plain(reloaded.map((s) => s.toArray()))).toEqual(
            plain(lists.map((s) => s.toArray())),
        );
    });
});

describe("KvListVariablePair", () => {
    // KNOWN BUG: a new pair's key and value point to the same
    // { en, fr } object, so typing in the key also changes the value.
    it.fails("gives a new pair separate key and value objects", () => {
        const pair = new KvListVariablePair(prototype());
        pair.key.content.en = "Key";
        expect(pair.value.content.en).toBe("");
    });

    // KNOWN BUG: the value's default is chosen from the key's type.
    it.fails("uses the value type for the default value", () => {
        const pair = new KvListVariablePair(
            prototype({ value: { type: "number", label: {} } }),
        );
        expect(pair.value.content).toBe(0);
    });

    // KNOWN BUG: a pair-level display_labels is read but not saved.
    it.fails("saves a pair-level display_labels setting", () => {
        const pair = new KvListVariablePair(
            prototype({ display_labels: true }),
            {
                key: { content: { en: "a" } },
                value: { content: { en: "b" } },
                display_labels: false,
            },
        );
        expect(pair.display_labels).toBe(false);
        expect(pair.toArray().display_labels).toBe(false);
    });

    it("inherits display_labels from the prototype", () => {
        const pair = new KvListVariablePair(
            prototype({ display_labels: true }),
            {
                key: { content: {} },
                value: { content: {} },
            },
        );
        expect(pair.display_labels).toBe(true);
    });

    it("joins list values with a separator", () => {
        const pair = new KvListVariablePair(prototype());
        const html = pair.renderKeyOrValueContentToHtml(
            "markdown",
            { en: ["One", "Two"] },
            "en",
        );
        expect(html).toContain("One");
        expect(html).toContain("Two");
        expect(html).toContain("role='separator'");
    });

    it("formats numbers for the language", () => {
        const pair = new KvListVariablePair(prototype());
        expect(pair.renderKeyOrValueContentToHtml("number", 1500, "en")).toBe(
            "1,500",
        );
    });

    it("renders a dt/dd pair, with labels when display_labels is on", async () => {
        const pair = new KvListVariablePair(
            prototype({ display_labels: true }),
            {
                key: { content: { en: "Alice" } },
                value: { content: { en: "Analyst" } },
            },
        );
        const { container } = await mountVnode(() => pair.getKvNode("en"));
        expect(container.querySelector("dt").textContent).toContain("Name");
        expect(container.querySelector("dt").textContent).toContain("Alice");
        expect(container.querySelector("dd").textContent).toContain("Role");
        expect(container.querySelector("dd").textContent).toContain("Analyst");
    });
});
