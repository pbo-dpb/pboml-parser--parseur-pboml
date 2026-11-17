import editorStrings from "../../../editor-strings";
import StructureTree from "./StructureTree/StructureTree.js";
import { h, defineAsyncComponent } from "vue";
import { ClipboardDocumentListIcon } from "@heroicons/vue/24/outline";
import Button from "../Button.vue";
const StructureImporter = defineAsyncComponent(
    () => import("./StructureImporter/StructureImporter.vue"),
);

export default {
    props: ["pbomlDocument"],
    data() {
        return {
            displayImporter: false,
        };
    },

    render() {
        let strings = editorStrings[document.documentElement.lang];
        return h("div", {}, [
            h(StructureTree, { pbomlDocument: this.pbomlDocument }),
            this.displayImporter
                ? h(StructureImporter, {
                      pbomlDocument: this.pbomlDocument,
                      onClose: () => (this.displayImporter = false),
                  })
                : h(
                      Button,
                      { onClick: () => (this.displayImporter = true) },
                      () => [
                          h(ClipboardDocumentListIcon, { class: "h-4 w-4" }),
                          strings["append_structure_by_import"],
                      ],
                  ),
        ]);
    },
};
