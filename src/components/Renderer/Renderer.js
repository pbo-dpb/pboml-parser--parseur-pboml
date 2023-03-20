import PBOMLDocument from "../../models/PBOMLDocument";
import { h } from 'vue'
import AnnotationAnchorsRenderer from "./AnnotationAnchorsRenderer";
import Annotations from "./Annotations";

export default {

  props: {
    pbomlDocument: PBOMLDocument,
    language: String,
    standalone: Boolean
  },

  methods: {
    _buildHeaderVnodes(language) {
      if (this.standalone) return [];
      return [h("header", { class: 'flex flex-col gap-1' },
        [
          (this.pbomlDocument.type?.[language] ? (h("div", { class: "text-xl", innerHTML: this.pbomlDocument.type[language] })) : null),
          (this.pbomlDocument.title?.[language] ? h("h1", { class: "font-thin text-4xl", innerHTML: this.pbomlDocument.title[language] }) : null),
          h("div", { class: "text-sm text-gray-800 dark:text-gray-200", innerHTML: this.pbomlDocument.localizedReleaseDate?.[language] })
        ]
      )
      ];
    },

    _buildFooterVnodes(language) {
      if (this.standalone) return [];
      return [h("footer", { class: "flex flex-row gap-2 text-xs text-gray-800 justify-center items-center print:mt-8" },
        [
          this.pbomlDocument.copyright?.[language] ? h("div", { class: "", innerHTML: this.pbomlDocument.copyright[language] }) : null,
          (this.pbomlDocument.copyright?.[language] && this.pbomlDocument.id) ? h("div", { role: "separator", ariaHidden: true, innerHTML: "•", class: "text-gray-500" }) : null,
          this.pbomlDocument.id ? h("div", { class: "", innerHTML: this.pbomlDocument.id }) : null,
        ]
      )
      ];
    },

    _buildAnnotationsVnodes(language) {
      return [
        h(Annotations, { pbomlDocument: this.pbomlDocument, language: this.language })
      ]

    },

    async renderAnnotationAnchors() {
      (new AnnotationAnchorsRenderer(this.$refs.main, this.pbomlDocument.annotations)).render();
    },

    /*
     *  Manually observe hash (/hello.html#myanchor) changes so we can scroll to the appropriate
     *  content on hash change, as this will not work natively with the shadow dom.
     */
    handleHashChange(e) {
      const hash = location.hash.replace(/[^a-zA-Z0-9\-_]+/g, "");
      if (!hash) return;
      let childel = this.$el.querySelector(`#${hash}`)
      if (hash && childel) {
        childel.scrollIntoView();
      }

    }
  },


  render() {
    const language = this.language ? this.language : document.documentElement.lang;

    return h('main', { 'class': 'flex flex-col gap-4 print:block', 'ref': 'main' }, [
      ...this._buildHeaderVnodes(language),
      ...this.pbomlDocument.slices.map((slice) => {
        return slice.renderAsVnode(language);
      }),
      ...this._buildAnnotationsVnodes(language),
      ...this._buildFooterVnodes(language),
    ]);
  },

  mounted() {
    this.$nextTick(() => {
      this.renderAnnotationAnchors();
    })


    const handleHashChangeFunc = this.handleHashChange
    addEventListener('hashchange', handleHashChangeFunc);


  },

  beforeUnmount() {
    const handleHashChangeFunc = this.handleHashChange
    removeEventListener('hashchange', handleHashChangeFunc);
  },

  updated() {
    this.$nextTick(() => {
      this.renderAnnotationAnchors();
    })
  }
}