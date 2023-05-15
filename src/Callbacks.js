/**
 * This class lists static functions that are meant to provide a callback functions that
 * a page owning a <pboml-parser></pboml-parser> can define as global variables.
 */
export default class Callbacks {

    /**
     * This callback runs before markdown to HTML conversion. The string is provided
     * as the argument, while the return value will be processed
     * and converted to HTML.
     */
    static get getBeforeMarkdownRendering() {
        return document?.pbomlCallbacks?.beforeMarkdownRendering;
    }

    /**
     * This callback runs after markdown to HTML conversion. The argument is an
     * HTML string. The return value will be rendered as is (in an
     * unsafe manner).
     */
    static get getAfterMarkdownRendering() {
        return document?.pbomlCallbacks?.afterMarkdownRendering;
    }

}