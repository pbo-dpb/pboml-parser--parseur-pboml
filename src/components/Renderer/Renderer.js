import PBOMLDocument from "../../models/PBOMLDocument";
import { h } from 'vue'
import AnnotationAnchorsRenderer from "./AnnotationAnchorsRenderer";
import Annotations from "./Annotations";
import RendererIntersectionManager from "./RendererIntersectionManager";
// import all html renderers with glob for vite compatibility
const sliceHtmlRenderers = import.meta.glob('../../Renderers/Html/*.js', { eager: true })

export default {

  props: {
    pbomlDocument: PBOMLDocument,
    language: String,
    standalone: Boolean
  },

  data() {
    return {
      intersectionManager: new RendererIntersectionManager
    }
  },

  methods: {

    _buildHeaderVnodes(language) {
      if (this.standalone) return [];
      return [h("header", { class: 'flex flex-col gap-1' },
        [
          (this.pbomlDocument.type?.[language] ? (h("div", { class: "text-xl", innerHTML: this.pbomlDocument.type[language] })) : null),
          (this.pbomlDocument.title?.[language] ? h("h1", { class: "font-thin text-4xl text-balance", innerHTML: this.pbomlDocument.title[language] }) : null),
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

    getSliceRenderer(slice) {
      const rendererObjectName = slice.constructor.rendererObjectForSliceRendererType('html');
      let htmlRenderer = new sliceHtmlRenderers[`../../Renderers/Html/${rendererObjectName}.js`].default(slice);
      return htmlRenderer;
    },

    renderSliceAsVnode(slice, language) {
      const sliceRenderer = this.getSliceRenderer(slice);
      return (sliceRenderer && sliceRenderer.renderAsVnode) ? sliceRenderer.renderAsVnode(language) : null;
    },

  },


  render() {
    const language = this.language ? this.language : document.documentElement.lang;

    let slices = [];

    let previousSliceReferenceName = null;

    this.pbomlDocument.slices.forEach((slice) => {
      if (slice.referenced_as?.[language]) {
        if (previousSliceReferenceName === slice.referenced_as[language]) {
          slices[slices.length - 1].push(slice);
        } else {
          slices.push([slice]);
          previousSliceReferenceName = slice.referenced_as[language];
        }
      } else {
        slices.push(slice);
        previousSliceReferenceName = null;
      }
    });

    return h('div', { 'class': 'flex flex-col gap-8 print:block', 'ref': 'main' }, [
      ...this._buildHeaderVnodes(language),
      ...slices.map((slice) => {
        if (Array.isArray(slice)) {

          let wrapperVnode = this.getSliceRenderer(slice[0]).getSliceWrapperVnode(language);
          wrapperVnode.children = slice.map((s, i) => this.getSliceRenderer(s).buildVnodes(language, i > 0));
          return wrapperVnode;
        } else {
          return this.renderSliceAsVnode(slice, language);
        }
      }),
      ...this._buildAnnotationsVnodes(language),
      ...this._buildFooterVnodes(language),
    ]);
  },

  mounted() {
    this.$nextTick(() => {
      this.renderAnnotationAnchors();
    })

    this.pbomlDocument.slices.forEach((slice) => {
      this.$nextTick(() => this.intersectionManager.startObservingForSlice(this.$el, slice))
    })
  },

  beforeUnmount() {
    this.intersectionManager.stopObserving()
  },

  updated() {
    this.$nextTick(() => {
      this.renderAnnotationAnchors();
    })
  }
}