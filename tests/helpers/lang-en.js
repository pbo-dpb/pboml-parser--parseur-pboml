// Several editor modules read document.documentElement.lang when they are
// imported (e.g. SliceStager) or when they render (editor-strings lookups).
// Import this file first so the language is set before those modules load.
document.documentElement.lang = "en";
