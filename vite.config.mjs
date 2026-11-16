import { defineConfig, lazyPlugins } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    lint: {
        jsPlugins: [
            { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
        ],
        rules: { "vite-plus/prefer-vite-plus-imports": "error" },
        options: { typeAware: true, typeCheck: true },
    },
    fmt: {
        bracketSameLine: true,
        semi: true,
        singleAttributePerLine: true,
        tabWidth: 4,
        useTabs: false,
        vueIndentScriptAndStyle: true,
        printWidth: 80,
        sortPackageJson: false,
        sortTailwindcss: {},
        ignorePatterns: ["node_modules"],
    },
    base: "./",
    plugins: lazyPlugins(() => [
        basicSsl(),
        tailwindcss(),
        vue({
            compilerOptions: {
                customElement: true,
            },
        }),
    ]),
    build: {
        manifest: true,
        rolldownOptions: {
            input: [
                "./src/main.js",
                "./index.html",
                "/index.fr.html",
                "/editor.html",
            ],
        },
    },
    test: {
        globals: true,
        environment: "happy-dom",
        onConsoleLog(log) {
            if (log.includes("KaTeX")) {
                return false;
            }
        },
    },
    optimizeDeps: {
        exclude: ["*.keep"],
    },
});
