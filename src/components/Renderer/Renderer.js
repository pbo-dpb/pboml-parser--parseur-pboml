import PBOMLDocument from "../../models/PBOMLDocument";
import { h } from 'vue'

export default {
  props: {
    pbomlDocument: PBOMLDocument,
    print: Boolean,
    language: String,
    standalone: Boolean
  },

  methods: {
    _buildHeaderVnodes(language) {
      if (this.standalone) return [];
      return [h("header", { class: 'flex flex-col gap-1' },
        [
          h("div", { class: "text-xl", innerHTML: this.pbomlDocument.type[language] }),
          h("h1", { class: "font-thin text-4xl", innerHTML: this.pbomlDocument.title[language] }),
          h("div", { class: "text-sm text-gray-800", innerHTML: this.pbomlDocument.localizedReleaseDate?.[language] })
        ]
      )
      ];
    },
    _buildFooterVnodes(language) {
      if (this.standalone) return [];
      return [h("footer", { class: 'flex flex-row gap-2 text-xs text-gray-800 justify-center items-center print:mt-8' },
        [
          h("div", { class: "", innerHTML: this.pbomlDocument.copyright[language] }),
        ]
      )
      ];
    },
  },


  render() {
    const language = this.language ? this.language : document.documentElement.lang;

    return h('main', { 'class': 'flex flex-col gap-4 print:block' }, [
      ...this._buildHeaderVnodes(language),
      ...this.pbomlDocument.slices.map((slice) => {
        return slice.renderAsVnode(this.print, language);
      }),
      ...this._buildFooterVnodes(language),
    ]);
  }
}