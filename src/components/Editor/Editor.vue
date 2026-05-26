<template>
  <main class="flex flex-col justify-between gap-4">
    <div
      class="rounded bg-orange-100 p-4 font-medium text-orange-800"
      v-show="hasUnlockedContent"
    >
      <Unlock class="mr-2 inline h-6 w-6 align-middle" />
      {{ strings.unlocked_content_warning }}
    </div>

    <header class="flex flex-row items-center justify-between">
      <div class="tabs">
        <div class="flex flex-row items-center justify-between">
          <div role="tablist" class="mb-4 flex flex-row gap-4">
            <Tab
              :controls="'content'"
              :selected="currentTab === 'content'"
              @click="currentTab = 'content'"
            >
              {{ strings.main_content_section_title }}
            </Tab>
            <Tab
              :controls="'meta'"
              :selected="currentTab === 'meta'"
              @click="currentTab = 'meta'"
            >
              {{ strings.meta_section_title }}
            </Tab>
            <Tab
              :controls="'advanced'"
              :selected="currentTab === 'advanced'"
              @click="currentTab = 'advanced'"
            >
              {{ strings.advanced_section_title }}
            </Tab>
          </div>
        </div>
      </div>

      <editor-previews
        :pboml-document="pbomlDocument"
        :disabled="shouldEditRaw"
      ></editor-previews>
    </header>

    <template v-if="!shouldEditRaw">
      <div
        id="content"
        role="tabpanel"
        tabindex="0"
        aria-labelledby="tab-content"
        v-if="currentTab === 'content'"
      >
        <editor-main-content
          :pboml-document="pbomlDocument"
        ></editor-main-content>
      </div>
      <div
        v-if="currentTab === 'meta'"
        id="meta"
        role="tabpanel"
        tabindex="0"
        aria-labelledby="tab-meta"
      >
        <document-meta-editor
          :pboml-document="pbomlDocument"
        ></document-meta-editor>
      </div>
      <div
        v-if="currentTab === 'advanced'"
        id="advanced"
        role="tabpanel"
        tabindex="0"
        aria-labelledby="tab-advanced"
      >
        <editor-advanced
          :pboml-document="pbomlDocument"
          @update="handlePbomlUpdate"
          :prefix="prefix"
        ></editor-advanced>
      </div>
    </template>
  </main>
</template>
<script>
import { defineAsyncComponent } from "vue";
import PBOMLDocument from "../../models/PBOMLDocument";
import EditorPreviews from "./EditorPreviews.vue";
import EditorMainContent from "./EditorMainContent/EditorMainContent.js";
import Button from "./Button.vue";
import TinyButton from "./TinyButton.vue";
import DocumentMetaEditor from "./DocumentMetaEditor/DocumentMetaEditor";
import strings from "../../editor-strings";
import Tab from "./Tabs/Tab.vue";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/vue/24/solid";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { FileCode, Unlock } from "lucide-vue-next";

export default {
  props: {
    pbomlDocument: PBOMLDocument,
    prefix: String,
  },

  data() {
    return {
      shouldEditRaw: false,
      strings: strings[document.documentElement.lang],
      currentTab: "content",
    };
  },

  components: {
    EditorPreviews,
    EditorMainContent,
    Button,
    TinyButton,
    FileCode,
    EditorAdvanced: defineAsyncComponent(
      () => import("./EditorAdvanced/EditorAdvanced.vue"),
    ),
    DocumentMetaEditor,
    Tab,
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
    ChevronRightIcon,
    Unlock,
  },

  watch: {
    pbomlDocument: {
      handler(newVal, oldValue) {
        const event = new CustomEvent("pboml-editor-document-updated", {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            pbomlDocument: newVal.serialize(),
          },
        });
        document.dispatchEvent(event);
      },
      deep: true,
    },
  },

  methods: {
    handlePbomlUpdate(newPbomlDocument) {
      this.pbomlDocument = newPbomlDocument;
    },
  },

  computed: {
    hasUnlockedContent() {
      return (
        (this.pbomlDocument?.slices?.some((slice) => slice.state._unlocked) ??
          false) ||
        (this.pbomlDocument?.annotations?.some(
          (annotation) => annotation.state._unlocked,
        ) ??
          false)
      );
    },
  },
};
</script>
