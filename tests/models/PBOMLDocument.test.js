// YAML
import yaml from "js-yaml";

// Vitest
import { describe, test, expect } from "vitest";

// Models
import PBOMLDocument from "../../src/models/PBOMLDocument.js";
import HeadingSlice from "../../src/models/contents/HeadingSlice.js";

// Samples
import annotationsIsNotArrayOrObject from "../samples/annotationsIsNotArrayOrObject.yaml?raw";
import annotationsIsNull from "../samples/annotationsIsNull.yaml?raw";
import annotationsIsObject from "../samples/annotationsIsObject.yaml?raw";
import annotationsIsUndefined from "../samples/annotationsIsUndefined.yaml?raw";
import fileIsEmpty from "../samples/fileIsEmpty.yaml?raw";
import sliceIsHeading from "../samples/sliceIsHeading.yaml?raw";
import pbomlIsUndefined from "../samples/pbomlIsUndefined.yaml?raw";
import pbomlIsNull from "../samples/pbomlIsNull.yaml?raw";
import slicesHasOneSlice from "../samples/slicesHasOneSlice.yaml?raw";
import slicesHasTwoSlices from "../samples/slicesHasTwoSlices.yaml?raw";
import slicesIsNotArrayOrObject from "../samples/slicesIsNotArrayOrObject.yaml?raw";
import slicesIsNull from "../samples/slicesIsNull.yaml?raw";
import slicesIsObject from "../samples/slicesIsObject.yaml?raw";
import slicesIsUndefined from "../samples/slicesIsUndefined.yaml?raw";
import versionIsEmptyString from "../samples/versionIsEmptyString.yaml?raw";
import versionIsNull from "../samples/versionIsNull.yaml?raw";
import versionIsNotSupported from "../samples/versionIsNotSupported.yaml?raw";

// Error Messages
import { PBOMLDocumentErrors } from "../../src/models/PBOMLDocument.errors.js";
import { YAMLException } from "js-yaml";

describe("PBOMLDocument", () => {
    it("throws an error when the YAML file is empty", () => {
        expect(() => PBOMLDocument.initFromYaml(fileIsEmpty)).toThrow(
            PBOMLDocumentErrors.fileIsEmpty,
        );
    });

    it("throws an error when the key 'pboml' is undefined", () => {
        expect(() => PBOMLDocument.initFromYaml(pbomlIsUndefined)).toThrow(
            PBOMLDocumentErrors.pbomlIsUndefined,
        );
    });

    it("throws an error when the value of key 'pboml' is null", () => {
        expect(() => PBOMLDocument.initFromYaml(pbomlIsNull)).toThrow(
            PBOMLDocumentErrors.pbomlIsNull,
        );
    });

    it("throws an error when the value of key 'version' is null", () => {
        expect(() => PBOMLDocument.initFromYaml(versionIsNull)).toThrow(
            PBOMLDocumentErrors.versionIsNull,
        );
    });

    it("throws an error when the value of key 'version' is an empty string", () => {
        expect(() => PBOMLDocument.initFromYaml(versionIsEmptyString)).toThrow(
            PBOMLDocumentErrors.versionIsEmptyString,
        );
    });

    it("throws an error when the value of key 'version' is not supported", () => {
        expect(() => PBOMLDocument.initFromYaml(versionIsNotSupported)).toThrow(
            PBOMLDocumentErrors.versionIsNotSupported,
        );
    });

    it("returns an empty array when the key 'slices' is undefined", () => {
        const document = PBOMLDocument.initFromYaml(slicesIsUndefined);

        expect(document.slices).toBeInstanceOf(Array);
        expect(document.slices).toHaveLength(0);
    });

    it("returns an empty array when the value of key 'slices' is null", () => {
        const document = PBOMLDocument.initFromYaml(slicesIsNull);

        expect(document.slices).toBeInstanceOf(Array);
        expect(document.slices).toHaveLength(0);
    });

    it("returns an array when the value of key 'slices' is an object", () => {
        const document = PBOMLDocument.initFromYaml(slicesIsObject);

        expect(document.annotations).toBeInstanceOf(Array);
    });

    it("throws an error when the value of key 'slices' is not an array or an object", () => {
        expect(() => PBOMLDocument.initFromYaml(slicesIsNotArrayOrObject));
    });

    it("returns an empty array when the key 'annotations' is undefined", () => {
        const document = PBOMLDocument.initFromYaml(annotationsIsUndefined);

        expect(document.annotations).toBeInstanceOf(Array);
        expect(document.annotations).toHaveLength(0);
    });

    it("returns an empty array when the value of key 'annotations' is null", () => {
        const document = PBOMLDocument.initFromYaml(annotationsIsNull);

        expect(document.annotations).toBeInstanceOf(Array);
        expect(document.annotations).toHaveLength(0);
    });

    it("returns an array when the value of key 'annotations' is an object", () => {
        const document = PBOMLDocument.initFromYaml(annotationsIsObject);

        expect(document.annotations).toBeInstanceOf(Array);
    });

    it("throws an error when the value of key 'annotations' is not an array or an object", () => {
        expect(() =>
            PBOMLDocument.initFromYaml(annotationsIsNotArrayOrObject).toThrow(
                PBOMLDocumentErrors.annotationsIsNotArrayOrObject,
            ),
        );
    });

    it("adds a slice in the correct position to the slices array", () => {
        const document = PBOMLDocument.initFromYaml(slicesHasTwoSlices);
        const parsedSlice = yaml.load(sliceIsHeading)[0];
        const slice = new HeadingSlice(parsedSlice);

        document.addSlice(slice, 1);

        expect(document.slices).toHaveLength(3);
        expect(document.slices.map((slice) => slice.id)).toEqual([1, 2, 3]);
    });

    it("duplicates a slice and adds it to the end of the slices array", () => {
        const document = PBOMLDocument.initFromYaml(slicesHasOneSlice);
        const originalSlice = document.slices[0];

        document.duplicateSlice(originalSlice);

        expect(document.slices).toHaveLength(2);
        expect(document.slices[1]).toHaveProperty("type", originalSlice.type);
        expect(document.slices[1]).toHaveProperty(
            "content",
            originalSlice.content,
        );
    });

    it("deletes a slice from the slices array", () => {
        const document = PBOMLDocument.initFromYaml(slicesHasOneSlice);
        const slice = document.slices[0];

        document.deleteSlice(slice);

        expect(document.slices).toHaveLength(0);
    });
});
