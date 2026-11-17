import fs from "node:fs";
import { vi } from "vite-plus/test";
import path from "node:path";
import { h } from "vue";
import { render } from "@testing-library/vue";

const samplesDir = path.resolve(__dirname, "../samples");

/** Reads a YAML file from tests/samples. */
export function loadSample(name) {
    return fs.readFileSync(path.join(samplesDir, `${name}.yaml`), "utf8");
}

/** Removes class instances, undefined values and functions so objects compare as plain data. */
export function plain(value) {
    return JSON.parse(JSON.stringify(value ?? null));
}

/** Wraps a minimal PBOML document around the given slices (and annotations). */
export function yamlDocument({ slices = [], annotations, document } = {}) {
    return [
        {
            pboml: { version: "1.0.0" },
            ...(document ? { document } : {}),
            slices,
            ...(annotations ? { annotations } : {}),
        },
    ];
}

/**
 * Mounts a vnode (or a function returning vnodes) and returns the container.
 * Waits a few ticks so async components have time to resolve.
 */
export async function mountVnode(vnodeOrFn, { ticks = 5 } = {}) {
    const renderFn =
        typeof vnodeOrFn === "function" ? vnodeOrFn : () => vnodeOrFn;
    const result = render({ render: () => h("div", {}, [renderFn()]) });
    await flush(ticks);
    return result;
}

export async function flush(ticks = 5) {
    for (let i = 0; i < ticks; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
}

/** Collects the HTML of every open shadow root inside the container. */
export function shadowHtml(container) {
    return [...container.querySelectorAll("*")]
        .filter((el) => el.shadowRoot)
        .map((el) => el.shadowRoot.innerHTML)
        .join("\n");
}

/**
 * How long tests wait for async components, uploads, etc. Generous on
 * purpose: on a slow machine, a chain of lazy-loaded components can take
 * more than a second. Tests still continue as soon as the content appears.
 */
export const ASYNC_TIMEOUT = 5000;

/** vi.waitFor with the suite's timeout. Use this instead of vi.waitFor. */
export function waitUntil(callback, options = {}) {
    return vi.waitFor(callback, {
        timeout: ASYNC_TIMEOUT,
        interval: 20,
        ...options,
    });
}

/** Waits until `selector` matches inside the container (async components). */
export async function waitForSelector(
    container,
    selector,
    timeout = ASYNC_TIMEOUT,
) {
    const start = Date.now();
    for (;;) {
        const el = container.querySelector(selector);
        if (el) return el;
        if (Date.now() - start > timeout) {
            throw new Error(`Timed out waiting for ${selector}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}
