import { h } from "vue";
import editorStrings from "../../editor-strings";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";

export default {
    props: ["presentation", "isEditing"],
    emits: ["update:modelValue"],

    render() {
        let choicesMap = [
            {
                value: null,
                label: editorStrings[document.documentElement.lang][
                    "presentation_none"
                ],
                classes: ["items-center", "border", "border-gray-300"],
            },
            {
                value: "figure",
                label: editorStrings[document.documentElement.lang][
                    "presentation_figure"
                ],
                classes: ["items-center", "bg-gray-100", "rounded-tr-lg"],
            },
            {
                value: "aside",
                label: editorStrings[document.documentElement.lang][
                    "presentation_aside"
                ],
                classes: [
                    "items-center",
                    "bg-linear-to-tr",
                    "from-sky-50",
                    "to-sky-100",
                    "rounded-tr-lg",
                ],
            },
            {
                value: "aside-2",
                label: editorStrings[document.documentElement.lang][
                    "presentation_aside-2"
                ],
                classes: [
                    "items-center",
                    "bg-linear-to-tr",
                    "from-sky-50",
                    "to-sky-100",
                    "border-l-3",
                    "border-l-sky-900",
                    "rounded-tr-lg",
                ],
            },
        ];
        let contentNodes;

        if (this.isEditing) {
            contentNodes = h("div", { class: "grid grid-cols-4 gap-4" }, [
                ...choicesMap.map((choiceType) => {
                    return h(
                        "label",
                        {
                            class: [
                                "p-2",
                                "text-blue-800",
                                "text-sm",
                                "font-semibold",
                                "gap-1",
                                "flex",
                                "flex-col",
                                ...choiceType.classes,
                            ].join(" "),
                        },
                        [
                            // The input must come first: peer-checked: only
                            // styles siblings that follow the peer in the DOM.
                            h("input", {
                                class: "peer sr-only",
                                type: "radio",
                                value: choiceType.value,
                                checked: choiceType.value === this.presentation,
                                onInput: (e) => {
                                    this.$emit(
                                        "update:modelValue",
                                        choiceType.value,
                                    );
                                },
                            }),
                            h(
                                CheckCircleIcon,
                                {
                                    class: "self-center h-4 w-4 invisible peer-checked:visible fill-green-800",
                                    "aria-hidden": true,
                                },
                                () => [],
                            ),
                            h("span", {}, choiceType.label),
                        ],
                    );
                }),
            ]);
        }

        return contentNodes;
    },
};
