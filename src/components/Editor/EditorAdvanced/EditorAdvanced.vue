<template>
    <main class="flex flex-col">
        <div class="tabs">
            <div class="flex flex-row justify-between items-center">
                <div role="tablist" class="flex flex-row gap-4 mb-4">
                    <Tab :controls="'raw'" :selected="currentTab === 'raw'" @click="currentTab = 'raw'">
                        {{ strings.advanced_section_code_tab }}
                    </Tab>

                </div>
            </div>

        </div>

        <div v-if="currentTab === 'raw'" id="raw" role="tabpanel" tabindex="0" aria-labelledby="tab-raw"
            class="flex flex-col gap-2">
            <Button :primary="true" @click="handleSave" class="w-fit self-end" :disabled="!isDirty">
                <GitCommit class="size-6"></GitCommit>{{ strings.commit_changes }}
            </Button>
            <yaml-editor :pboml-document="pbomlDocument" @update="handlePbomlUpdate"></yaml-editor>
        </div>
    </main>
</template>
<script>

import { defineAsyncComponent } from 'vue'
import PBOMLDocument from '../../../models/PBOMLDocument';
import strings from "../../../editor-strings"
import Tab from "../Tabs/Tab.vue"
import Button from '../Button.vue';
import { GitCommit } from 'lucide-vue-next';

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    data() {
        return {
            workingPboml: '',
            strings: strings[document.documentElement.lang],
            currentTab: "raw",
        }
    },

    components: {
        YamlEditor: defineAsyncComponent(() => import('../YamlEditor.vue')),
        Tab,
        Button,
        GitCommit
    },

    computed: {
        isDirty() {
            if (!this.workingPboml) return false;
            return this.workingPboml !== this.pbomlDocument.serialize();
        },
    },

    methods: {

        handlePbomlUpdate(newContent) {
            this.workingPboml = newContent;
        },
        handleSave() {

            try {
                this.$root.pbomlDocument = PBOMLDocument.initFromYaml(this.workingPboml, this.prefix);
                this.shouldEditRaw = false;
            } catch (e) {
                alert(this.strings.error_invalid_pboml + "\n\n" + e);
                console.error(e);
            }

        },

    }

}
</script>