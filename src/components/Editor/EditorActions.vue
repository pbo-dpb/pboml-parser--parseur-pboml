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

        <div class="flex flex-col gap-2 border-4 border-slate-100 border-dashed shadow-inner rounded-sm p-4 -mx-4"
            v-if="shouldDisplayPreview">
            <nav class="flex flex-row gap-2 justify-end align-center">
                <span
                    class="mr-auto uppercase text-xl font-bold text-slate-500 mb-2 pb-2 border-b-4 border-slate-100 border-dashed">{{
                        strings.editor_actions_preview
                    }} ({{ shouldDisplayPreview }})</span>

                <Button @click="shouldDisplayPreview = 'en'" :toggled="shouldDisplayPreview === 'en'">
                    EN
                </Button>
                <Button @click="shouldDisplayPreview = 'fr'" :toggled="shouldDisplayPreview === 'fr'">
                    FR
                </Button>
            </nav>

            <Renderer :pboml-document="pbomlDocument" :language="shouldDisplayPreview"></Renderer>

            <span class="mr-auto uppercase text-xl font-bold text-slate-500">/{{ strings.editor_actions_preview
                }}</span>

        </div>



    </div>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import Button from './Button.vue';
import Renderer from '../Renderer/Renderer';
import strings from "../../editor-strings"
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
        ArrowUpOnSquareStackIcon
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


}
</script>