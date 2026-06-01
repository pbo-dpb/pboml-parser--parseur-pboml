// YAML
import yaml from "js-yaml";

// Errors
import { PBOMLDocumentErrors } from "./PBOMLDocument.errors";

// Annotations
import Annotation from "./Annotation";

// Slices
import BitmapSlice from "./contents/BitmapSlice";
import ChartSlice from "./contents/ChartSlice";
import HeadingSlice from "./contents/HeadingSlice";
import HtmlSlice from "./contents/HtmlSlice";
import KvListSlice from "./contents/KvListSlice";
import LaTeXSlice from "./contents/LaTeXSlice";
import MarkdownSlice from "./contents/MarkdownSlice";
import SvgSlice from "./contents/SvgSlice";
import TableSlice from "./contents/TableSlice";

export default class PBOMLDocument {
  static initFromYaml(yamlPayload, prefix = null) {
    let payload = yaml.loadAll(yamlPayload);

    return new PBOMLDocument(payload, prefix);
  }

  constructor(payload = [], prefix = null) {
    if (payload.length === 0) throw new Error(PBOMLDocumentErrors.fileIsEmpty);

    const mainDocument = payload.find(
      (document) => document?.pboml !== undefined,
    );

    // pboml
    if (mainDocument === undefined)
      throw new Error(PBOMLDocumentErrors.pbomlIsUndefined);

    if (mainDocument.pboml === null)
      throw new Error(PBOMLDocumentErrors.pbomlIsNull);

    if (mainDocument.pboml.version === null)
      throw new Error(PBOMLDocumentErrors.versionIsNull);

    if (mainDocument.pboml.version === "")
      throw new Error(PBOMLDocumentErrors.versionIsEmptyString);

    if (mainDocument.pboml.version !== "1.0.0")
      throw new Error(PBOMLDocumentErrors.versionIsNotSupported);

    this.pbomlVersion = mainDocument.pboml.version;

    // document
    this.id = mainDocument.document?.id;

    this.release_date = mainDocument.document?.release_date ?? null;

    if (this.release_date) {
      this.release_date = new Date(this.release_date);
    }

    this.title = {
      en: mainDocument.document?.title?.en,
      fr: mainDocument.document?.title?.fr,
    };

    this.type = mainDocument.document?.type;

    this.copyright = {
      en: mainDocument.document?.copyright?.en,
      fr: mainDocument.document?.copyright?.fr,
    };

    this.user_data = mainDocument.document?.user_data;

    // slices
    let counter = 0;

    this.slices =
      mainDocument.slices
        ?.map((element) => {
          let slice = PBOMLDocument.provisionSliceFromPayload(element);

          counter++;

          if (slice) {
            slice.state.sequence = counter;
            slice.state.prefix = prefix;
            //slice.state.callbacks.move = (s) => this.handleSliceMove(s);
            //slice.state.callbacks.delete = (s) => this.handleSliceDelete(s);
            if (counter === 1) {
              slice.state.canMoveUp = false;
            }

            if (counter === mainDocument.slices.length) {
              slice.state.canMoveDown = false;

              return slice;
            }
          }
        })
        .filter((n) => n) ?? [];

    // annotations
    this.annotations =
      mainDocument.annotations
        ?.map((element) => {
          let annotation = new Annotation(element);

          annotation.state.prefix = prefix;

          return annotation;
        })
        .filter((n) => n)
        .sort((a, b) =>
          `${a.id}`.localeCompare(`${b.id}`, undefined, { numeric: true }),
        ) ?? [];

    this.state = {
      prefix,
    };

    // Supports multiple PBOML documents in one file
    this.otherDocuments = payload.filter(
      (document) => document != mainDocument,
    );
  }

  static provisionSliceFromPayload(element) {
    const sliceType = element.type;

    switch (sliceType) {
      case "bitmap":
        return new BitmapSlice(element);
      case "chart":
        return new ChartSlice(element);
      case "heading":
        return new HeadingSlice(element);
      case "html":
        return new HtmlSlice(element);
      case "kvlist":
        return new KvListSlice(element);
      case "LaTeX":
        return new LaTeXSlice(element);
      case "markdown":
        return new MarkdownSlice(element);
      case "svg":
        return new SvgSlice(element);
      case "table":
        return new TableSlice(element);
    }
  }

  get localizedReleaseDate() {
    if (!this.release_date) return;

    return {
      fr: this.release_date.toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      en: this.release_date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }

  toArray() {
    const documents = [];

    let mainDocument = {
      pboml: {
        version: "1.0.0",
      },
      document: {
        version: this.version,
        id: this.id,
        release_date: this.release_date
          ? this.release_date.toISOString()
          : null,
        title: {
          en: this.title?.en,
          fr: this.title?.fr,
        },
        type: {
          en: this.type?.en,
          fr: this.type?.fr,
        },
        copyright: {
          en: this.copyright?.en,
          fr: this.copyright?.fr,
        },
        user_data: this.user_data,
      },

      slices: this.slices.map((slice) => slice.toArray()),
      annotations: this.annotations.map((annotation) => annotation.toArray()),
    };

    documents.push(mainDocument);

    this.otherDocuments.forEach((document) => documents.push(document));

    return documents;
  }

  serialize() {
    return this.toArray()
      .map((document) => yaml.dump(document))
      .join("---\n");
  }

  addSlice(slice, index = null) {
    if (index || index === 0) {
      this.slices.splice(index, 0, slice);
    } else {
      this.slices.push(slice);
    }

    this.resetSlicesMoveability();

    this.scrollToSliceAtIndex(
      index || index === 0 ? index : this.slices.length - 1,
    );
  }

  scrollToSliceAtIndex(index) {
    let slice = this.slices[index];

    if (!location.hash || /^\#[a-zA-Z0-9]{1}.*/.test(location.hash)) {
      location.hash = slice.anchor;
    } else {
      // Do not use hash navigation if hash seems to be used for single page application navigation purposes.
      const event = new CustomEvent("pbomlnavigate", {
        bubbles: true,
        detail: slice.anchor,
      });

      dispatchEvent(event);
    }
  }

  resetSlicesMoveability() {
    let counter = 0;

    this.slices.forEach((slice) => {
      counter++;

      slice.state.sequence = counter;
      slice.state.canMoveUp = counter > 1;
      slice.state.canMoveDown = this.slices.length > counter;
    });
  }

  moveSlice(slice, direction) {
    const from = slice.state.sequence - 1;
    const to = direction == "up" ? from - 1 : from + 1;
    const element = this.slices.splice(from, 1)[0];

    this.slices.splice(to, 0, element);
    this.resetSlicesMoveability();
    this.scrollToSliceAtIndex(to);
  }

  deleteSlice(slice) {
    let nearestSlicePosition = slice.state.sequence;

    if (this.slices.length === nearestSlicePosition) {
      // Slice was last
      nearestSlicePosition = this.slices.length - 1;
    }

    this.slices.splice(slice.state.sequence - 1, 1);

    this.resetSlicesMoveability();

    if (nearestSlicePosition > 0) {
      this.scrollToSliceAtIndex(nearestSlicePosition - 1);
    }
  }

  duplicateSlice(slice) {
    let newSlice = PBOMLDocument.provisionSliceFromPayload(slice.toArray());

    this.addSlice(newSlice);
  }
}
