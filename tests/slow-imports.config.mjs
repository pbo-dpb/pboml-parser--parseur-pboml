/**
 * Runs the test suite with every dynamic import() in src/ delayed, to catch
 * tests that check async components before they have loaded (they pass on a
 * fast machine and fail on a slow one).
 *
 *     pnpm test:slow                      # 400 ms delay
 *     SLOW_IMPORT_MS=1200 pnpm test:slow  # longer delay
 */
import { defineConfig, mergeConfig } from "vite-plus";
import baseConfig from "../vite.config.mjs";

const delay = Number(process.env.SLOW_IMPORT_MS ?? 400);

const slowDynamicImports = {
    name: "slow-dynamic-imports",
    enforce: "pre",
    transform(code, id) {
        if (!id.includes("/src/") || id.includes("/node_modules/")) return;
        const delayed = code.replace(
            /(?<![\w.$])import\((["'`][^"'`]+["'`])\)/g,
            `(new Promise((resolve) => setTimeout(resolve, ${delay})).then(() => import($1)))`,
        );
        if (delayed === code) return;
        return { code: delayed, map: null };
    },
};

export default mergeConfig(
    baseConfig,
    defineConfig({ plugins: [slowDynamicImports] }),
);
