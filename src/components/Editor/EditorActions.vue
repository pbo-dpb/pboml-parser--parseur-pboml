<template>
    <div class="flex flex-col gap-2">
        <nav class="flex flex-row justify-end gap-2">

            <slot></slot>
            <Button :disabled="disabled" @click="shouldDisplayPreview = (shouldDisplayPreview ? false : 'en')"
                :toggled="shouldDisplayPreview ? true : false" :title="strings.editor_actions_preview">
                <EyeIcon class="size-6"></EyeIcon>
                <span class="sr-only">{{ strings.editor_actions_preview }}</span>
            </Button>

            <Button :disabled="disabled" @click="shouldDisplayExportActions = !shouldDisplayExportActions"
                :toggled="shouldDisplayExportActions" :title="strings.editor_actions_export">
                <ArrowUpOnSquareStackIcon class="size-6"></ArrowUpOnSquareStackIcon>
                <span class="sr-only">{{ strings.editor_actions_export }}</span>
            </Button>
        </nav>

        <div class="flex flex-col gap-2 bg-blue-100 shadow-sm p-4" v-if="shouldDisplayExportActions">
            <nav class="flex flex-row gap-2 justify-end ">
                <Button @click="downloadPboml">
                    PBOML
                </Button>
            </nav>
        </div>

        <dialog ref="previewDialog"
            class="w-3/4 mx-auto h-3/4 mt-16 fborder-4 border-slate-100 border-dashed shadow-inner rounded-sm flex flex-col"
            v-if="shouldDisplayPreview"
            @click="$event.target === $event.currentTarget ? shouldDisplayPreview = false : null">
            <div class="flex flex-col gap-2 h-full w-full p-4">
                <nav class="flex flex-row gap-2 justify-end align-center">
                    <Tab @click="shouldDisplayPreview = 'en'" :selected="shouldDisplayPreview === 'en'">
                        EN
                    </Tab>
                    <Tab @click="shouldDisplayPreview = 'fr'" :selected="shouldDisplayPreview === 'fr'">
                        FR
                    </Tab>

                    <button @click="shouldDisplayPreview = false" class="ml-8 text-blue-500 hover:text-blue-800"
                        :title="strings.close_preview">
                        <X class="size-6" aria-hidden="true"></X>
                        <span class="sr-only">{{ strings.close }}</span>
                    </button>

                </nav>

                <Renderer :pboml-document="pbomlDocument" :language="shouldDisplayPreview"></Renderer>


            </div>
        </dialog>



    </div>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import Button from './Button.vue';
import Renderer from '../Renderer/Renderer';
import strings from "../../editor-strings"
import Tab from '../Editor/Tabs/Tab.vue';
import { X } from 'lucide-vue-next'
import { EyeIcon, ArrowUpOnSquareStackIcon } from '@heroicons/vue/24/outline';

export default {
    props: {
        pbomlDocument: PBOMLDocument,
        disabled: Boolean,
    },
    data() {
        return {
            shouldDisplayExportActions: false,
            shouldDisplayPreview: false,
            strings: strings[document.documentElement.lang]
        }
    },
    components: {
        Button,
        Renderer,
        EyeIcon,
        ArrowUpOnSquareStackIcon,
        Tab,
        X
    },

    methods: {
        downloadPboml() {
            const rawtext = this.pbomlDocument.serialize();
            const element = document.createElement('a');
            element.setAttribute('aria-hidden', true);
            element.setAttribute('href', 'data:text/pboml;charset=utf-8,' + encodeURIComponent(rawtext));
            element.setAttribute('download', `${this.pbomlDocument.id}.pboml.yaml`);

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    },

    watch: {
        shouldDisplayPreview(newVal, oldVal) {
            if (newVal && !oldVal) {
                this.$nextTick(() => this.$refs.previewDialog.showModal());
            } else if (!newVal) {
                this.$refs.previewDialog?.close();
            }
        }

    }
}
</script>