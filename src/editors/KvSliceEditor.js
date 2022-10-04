import { h } from 'vue'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                props.slice.renderReadonlyVnode(false, "en"),
                props.slice.renderReadonlyVnode(false, "fr"),
            ])
        }



        return () => {

            let rows = [];
            props.slice.content.forEach((entry) => {
                let kvBlock = h('div', { 'class': 'grid grid-cols-2 gap-2  py-2' }, [
                    h(BilingualInput, {
                        modelValue: entry.key.content,
                        'onUpdate:modelValue': (value) => {
                            entry.key.content = value;
                        }
                    }),
                    h(BilingualInput, {
                        modelValue: entry.value.content,
                        'onUpdate:modelValue': (value) => {
                            entry.value.content = value;
                        }
                    }),
                ])

                rows.push(kvBlock);
            });



            return h('div', { class: 'flex flex-col gap-2' }, rows)


        }



    }
}
