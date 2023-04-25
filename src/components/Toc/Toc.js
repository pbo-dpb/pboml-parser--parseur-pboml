import { h } from 'vue'

import PBOMLDocument from "../../models/PBOMLDocument"

const liStyles = {
    0: ['text-sm font-semibold', 'pb__toc_item_l0'],
    1: ['ml-2', 'pb__toc_item_l1'],
    2: ['ml-2', 'text-xs', 'pb__toc_item_l2']
}
export default {
    props: {
        pbomlDocument: {
            required: true,
            type: PBOMLDocument
        },
        language: {
            type: String,
            default: document.documentElement.lang
        },
        shouldFollowAnchorIntersectionVisibility: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            currentlyVisibleAnchor: null
        }
    },

    computed: {
        rawHeaderSlices() {
            return this.pbomlDocument.slices.filter(slice => slice.type === 'heading');
        },
        rawLabels() {
            return this.pbomlDocument.slices.filter(slice => slice.label && slice.label[this.language] && slice.display_label !== false);
        },
        headerTree() {
            let flatArray = this.rawHeaderSlices;

            const tree = [];
            const levels = {};

            flatArray.forEach((item) => {
                const { level, ...rest } = item;
                const node = {
                    label: item.content[this.language],
                    anchor: item.anchor
                };

                if (!levels[level]) {
                    levels[level] = [];
                }

                levels[level].push(node);

                if (level === 0) {
                    tree.push(node);
                } else {
                    const parentLevel = level - 1;
                    const parentNodes = levels[parentLevel];
                    const parentNode = parentNodes[parentNodes.length - 1];

                    if (!parentNode.children) {
                        parentNode.children = [];
                    }

                    parentNode.children.push(node);
                }
            });

            return tree;

        },
        labelTree() {
            return this.rawLabels.map((slice) => {
                return {
                    label: slice.label[this.language],
                    anchor: slice.anchor
                }
            })
        },
        tree() {
            if (this.rawHeaderSlices && this.rawHeaderSlices.length > 0) {
                return this.headerTree;
            } else if (this.rawLabels && this.rawLabels.length > 0) {
                return this.labelTree;
            }
            return []
        },
        // A list of anchors id that are present in the tree
        anchors() {
            return this.tree.map((t) => this.getAnchorsFromObjectAndChildren(t)).flat(Infinity);
        }
    },
    methods: {
        buildVnodeForItem(item, level = 0) {
            const levelSpecificClasses = liStyles[level];
            let aClasses = ['hover:text-blue-800', 'select-none', 'hover:dark:text-blue-200', 'hover:underline', 'print:text-black', 'print:no-underline', 'transition-all', 'duration-500'];

            if (this.shouldFollowAnchorIntersectionVisibility && item.anchor === this.currentlyVisibleAnchor) {
                aClasses.push(...['text-gray-900', 'dark:text-gray-100'])
            } else {
                aClasses.push(...['text-blue-900', 'dark:text-blue-100',])
            }

            return h('li', { class: [...levelSpecificClasses, ''].join(' ') }, [
                h('a',
                    {
                        class: aClasses.join(' '),
                        href: `#${item.anchor}`,
                        id: `toci-${item.anchor}`,
                        onClick: (e) => {
                            if (location.hash && !/^\#[a-zA-Z0-9]{1}.*/.test(location.hash)) {
                                e.preventDefault();
                                const evt = new CustomEvent("pbomlnavigate", { bubbles: true, detail: item.anchor });
                                dispatchEvent(evt);
                            }
                        }
                    }, item.label),
                ((item.children && level <= 2) ? h('ol', {}, ...item.children.map(e => this.buildVnodeForItem(e, level + 1))) : null)
            ])
        },
        getAnchorsFromObjectAndChildren(parent) {
            let family = [parent.anchor];
            if (parent.children) {
                family.push(parent.children.map(ch => this.getAnchorsFromObjectAndChildren(ch)));
            }
            return family
        },
        listenForIntersectionEvents(e) {
            if (e.detail?.anchor && this.anchors.includes(e.detail.anchor)) {
                this.currentlyVisibleAnchor = e.detail.anchor;
            }
        },

        initializeAnchorFollowing() {
            let hash = location.hash ? location.hash.replace("#", "") : null;
            if (hash && this.anchors.includes(hash)) {
                this.currentlyVisibleAnchor = hash;
            } else {
                this.currentlyVisibleAnchor = this.tree[0]?.anchor ?? null;
            }

            addEventListener("scroll", (event) => {
                const startListeningForIntersectionEventsFunc = this.listenForIntersectionEvents;
                document.addEventListener("pboml-renderer-intersection-visible", startListeningForIntersectionEventsFunc);
            }, { once: true });
        }
    },
    render() {
        return this.tree.length ? h('nav', { class: 'pb__toc' }, [

            h('ol', { class: 'pb__toc_root' }, [
                ...this.tree.map(t => this.buildVnodeForItem(t))
            ])
        ]) : null
    },

    mounted() {
        this.initializeAnchorFollowing();
    },

    beforeUnmount() {
        const startListeningForIntersectionEventsFunc = this.listenForIntersectionEvents;
        addEventListener("pboml-renderer-intersection-visible", startListeningForIntersectionEventsFunc);
    },
}