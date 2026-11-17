import { describe, it, expect } from "vite-plus/test";
import * as yaml from "js-yaml";
import PBOMLDocument from "../../src/models/PBOMLDocument";
import { loadSample, plain } from "../helpers";

/**
 * Round-trip: parse a sample → serialize to YAML → parse again.
 * Saving a document in the editor goes through exactly this path, so any
 * difference here means data is lost or changed when an author saves.
 */

const SLICE_KEYS_TO_COMPARE = [
    "type",
    "id",
    "label",
    "referenced_as",
    "content",
    "level",
    "presentation",
    "sources",
    "notes",
    "alts",
    "css",
    "thumbnails",
];

function roundTrip(name) {
    const source = loadSample(name);
    const original = PBOMLDocument.initFromYaml(source);
    const serialized = original.serialize();
    const reparsed = PBOMLDocument.initFromYaml(serialized);
    return { source, original, serialized, reparsed };
}

describe("Round-trip of the sample documents", () => {
    describe.each(["bitmap0", "html0", "latex0", "leg0", "visuals0"])(
        "%s.yaml",
        (name) => {
            it("serializes without throwing", () => {
                const doc = PBOMLDocument.initFromYaml(loadSample(name));
                expect(() => doc.serialize()).not.toThrow();
            });

            it("gives the same model after parse → serialize → parse", () => {
                const { original, reparsed } = roundTrip(name);
                expect(plain(reparsed.toArray())).toEqual(
                    plain(original.toArray()),
                );
            });

            it("serializes to the same YAML twice in a row (stable output)", () => {
                const { serialized, reparsed } = roundTrip(name);
                expect(reparsed.serialize()).toEqual(serialized);
            });

            it("keeps every slice, in order, with the same type", () => {
                const { source, reparsed } = roundTrip(name);
                const rawSlices = yaml.loadAll(source)[0].slices;
                expect(reparsed.slices.map((s) => s.type)).toEqual(
                    rawSlices.map((s) => s.type),
                );
            });

            it("keeps the authored values of each slice", () => {
                const { source, serialized } = roundTrip(name);
                const rawSlices = yaml.loadAll(source)[0].slices;
                const outSlices = yaml.loadAll(serialized)[0].slices;

                rawSlices.forEach((raw, index) => {
                    SLICE_KEYS_TO_COMPARE.forEach((key) => {
                        if (raw[key] === undefined || raw[key] === null) return;
                        expect(
                            plain(outSlices[index][key]),
                            `slice #${index + 1} (${raw.type}) → ${key}`,
                        ).toEqual(plain(raw[key]));
                    });
                });
            });

            it("keeps the document title, type and release date", () => {
                const { original, reparsed } = roundTrip(name);
                expect(reparsed.title).toEqual(original.title);
                // A missing type comes back as {}; compare the actual strings.
                expect(reparsed.type?.en).toEqual(original.type?.en);
                expect(reparsed.type?.fr).toEqual(original.type?.fr);
                expect(reparsed.release_date?.toISOString()).toEqual(
                    original.release_date?.toISOString(),
                );
            });
        },
    );

    describe("charts0.yaml (chart slices)", () => {
        // KNOWN BUG: ChartSlice.toArray() returns the DataTable / ArrayTable
        // instances instead of calling .toArray() on them. js-yaml refuses
        // to dump them, so saving any document with a chart crashes.
        it.fails("serializes without throwing", () => {
            const doc = PBOMLDocument.initFromYaml(loadSample("charts0"));
            expect(() => doc.serialize()).not.toThrow();
        });

        it.fails("gives the same model after parse → serialize → parse", () => {
            const { original, reparsed } = roundTrip("charts0");
            expect(plain(reparsed.toArray())).toEqual(
                plain(original.toArray()),
            );
        });

        it.fails("serializes each chart's datatable as plain data", () => {
            const doc = PBOMLDocument.initFromYaml(loadSample("charts0"));
            const chart = doc.slices.find((s) => s.type === "chart");
            const serialized = chart.toArray().datatable;
            // A plain object, not a DataTable instance carrying `state`.
            expect(serialized.constructor.name).toBe("Object");
            expect(serialized).not.toHaveProperty("state");
            expect(serialized).toEqual(chart.datatable.toArray());
        });
    });

    // POSSIBLE BUG (confirm intent): `document.form` (present in html0, leg0,
    // visuals0 and charts0) is not read by PBOMLDocument and disappears when
    // the document is saved.
    it.fails("keeps document fields the model does not use (document.form)", () => {
        const { source, serialized } = roundTrip("html0");
        const before = yaml.loadAll(source)[0].document;
        const after = yaml.loadAll(serialized)[0].document;
        expect(after.form).toEqual(before.form);
    });

    it("keeps extra YAML documents in the same file", () => {
        const source = [
            "pboml:\n  version: 1.0.0\nslices: []",
            "extra: true\nnote: second document",
        ].join("\n---\n");
        const doc = PBOMLDocument.initFromYaml(source);
        const reparsed = yaml.loadAll(doc.serialize());

        expect(reparsed).toHaveLength(2);
        expect(reparsed[1]).toEqual({ extra: true, note: "second document" });
    });

    it("keeps user_data on the document", () => {
        const source =
            "pboml:\n  version: 1.0.0\ndocument:\n  user_data:\n    owner: pbo\n    tags: [a, b]\nslices: []";
        const reparsed = PBOMLDocument.initFromYaml(
            PBOMLDocument.initFromYaml(source).serialize(),
        );
        expect(reparsed.user_data).toEqual({ owner: "pbo", tags: ["a", "b"] });
    });
});
