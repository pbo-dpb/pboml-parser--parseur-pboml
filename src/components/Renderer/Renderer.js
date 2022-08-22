import PBOMLDocument from "../../models/PBOMLDocument";
import { h } from 'vue'

export default {
  props: {
    pbomlDocument: PBOMLDocument,
  },

  render() {
    return h('main', { 'class': 'flex flex-col gap-4' }, this.pbomlDocument.slices.map((slice) => {
      return slice.renderAsVnode();
    }));
  }
}