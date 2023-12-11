import { h } from "vue"
import StructureTreeSlice from "./StructureTreeSlice.vue"
export default {
    props: ["pbomlDocument"],
    components: {
        StructureTreeSlice
    },
    data() {
        return {
            currentlyDraggedSlice: null
        }
    },
    computed: {
        currentlyDraggedSliceIndex() {
            const index = this.pbomlDocument.slices.indexOf(this.currentlyDraggedSlice);
            return index >= 0 ? index : null;
        }
    },
    render() {
        let currentLevel = 0;
        return h('ul', { class: 'flex flex-col gap-2 pb-4' }, [
            ...this.pbomlDocument.slices.map((slice, index) => {
                if (slice.type === "heading") currentLevel = slice.level;
                return h(StructureTreeSlice, {
                    slice: slice,
                    index: index,
                    draggedSliceIndex: this.currentlyDraggedSliceIndex,
                    level: currentLevel,
                    onDragstart: (event) => {
                        this.currentlyDraggedSlice = slice
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', slice);
                    },
                    onDragend: () => {
                        this.currentlyDraggedSlice = null;
                    },
                    onDrop: (event) => {
                        event.preventDefault();

                        if (this.currentlyDraggedSliceIndex !== null && this.currentlyDraggedSliceIndex !== index) {
                            this.pbomlDocument.slices.splice(this.currentlyDraggedSliceIndex, 1);
                            this.pbomlDocument.slices.splice(index, 0, this.currentlyDraggedSlice);
                        }
                    },
                })
            })])
    }
}
