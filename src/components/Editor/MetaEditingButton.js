import { h } from 'vue'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'
export default {
    props: ["isEditing"],
    emits: ['editing'],

    render() {

        let actionNode = h(TinyButton, {
            'class': this.isEditing ? 'bg-amber-300 hover:bg-amber-500 shadow-inner' : 'bg-amber-100 hover:bg-amber-300', innerText: '⚙️', onClick: (e) => {
                this.$emit("editing", !this.isEditing)
            },
        })



        return [
            actionNode,
        ];

    }

}