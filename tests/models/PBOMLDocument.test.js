// Vitest
import { describe, test, expect } from "vitest";

// Models
import PBOMLDocument from "../../src/models/PBOMLDocument.js";

// Samples
import fileIsEmpty from "../samples/pboml/fileIsEmpty.yaml?raw";
import pbomlIsUndefined from "../samples/pboml/pbomlIsUndefined.yaml?raw";
import pbomlIsNull from "../samples/pboml/pbomlIsNull.yaml?raw";
import versionIsEmptyString from "../samples/pboml/versionIsEmptyString.yaml?raw";
import versionIsNull from "../samples/pboml/versionIsNull.yaml?raw";
import versionIsNotSupported from "../samples/pboml/versionIsNotSupported.yaml?raw";
import slicesIsNull from "../samples/pboml/slicesIsNull.yaml?raw";
import annotationsIsNull from "../samples/pboml/annotationsIsNull.yaml?raw";

// Error Messages
import { PBOMLDocumentErrors } from "../../src/models/PBOMLDocument.errors.js";

describe("PBOMLDocument", () => {
  it("throws an error when YAML file is empty", () => {
    expect(() => PBOMLDocument.initFromYaml(fileIsEmpty)).toThrow(
      PBOMLDocumentErrors.fileIsEmpty,
    );
  });

  it("throws an error when pboml is undefined", () => {
    expect(() => PBOMLDocument.initFromYaml(pbomlIsUndefined)).toThrow(
      PBOMLDocumentErrors.pbomlIsUndefined,
    );
  });

  it("throws an error when pboml is null", () => {
    expect(() => PBOMLDocument.initFromYaml(pbomlIsNull)).toThrow(
      PBOMLDocumentErrors.pbomlIsNull,
    );
  });

  it("throws an error when version is null", () => {
    expect(() => PBOMLDocument.initFromYaml(versionIsNull)).toThrow(
      PBOMLDocumentErrors.versionIsNull,
    );
  });

  it("throws an error when version is empty string", () => {
    expect(() => PBOMLDocument.initFromYaml(versionIsEmptyString)).toThrow(
      PBOMLDocumentErrors.versionIsEmptyString,
    );
  });

  it("throws an error when version is not supported", () => {
    expect(() => PBOMLDocument.initFromYaml(versionIsNotSupported)).toThrow(
      PBOMLDocumentErrors.versionIsNotSupported,
    );
  });

  it("returns empty slices array when slices is null", () => {
    const document = PBOMLDocument.initFromYaml(slicesIsNull);

    expect(document.slices).toBeInstanceOf(Array);
    expect(document.slices).toHaveLength(0);
  });

  it("returns empty annotations array when annotations is null", () => {
    const document = PBOMLDocument.initFromYaml(annotationsIsNull);

    expect(document.annotations).toBeInstanceOf(Array);
    expect(document.annotations).toHaveLength(0);
  });
});
