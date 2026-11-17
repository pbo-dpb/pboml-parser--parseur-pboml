import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vite-plus/test";
import RendererIntersectionManager from "../../src/components/Renderer/RendererIntersectionManager";

class FakeObserver {
    static instances = [];
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observed = [];
        this.disconnect = vi.fn();
        FakeObserver.instances.push(this);
    }
    observe(el) {
        this.observed.push(el);
    }
    trigger(ratio) {
        this.callback([{ intersectionRatio: ratio }], this);
    }
}

const fakeSlice = (anchor) => ({ anchor });

const rootWith = (...ids) => {
    const root = document.createElement("div");
    root.innerHTML = ids.map((id) => `<section id="${id}"></section>`).join("");
    return root;
};

describe("RendererIntersectionManager", () => {
    beforeEach(() => {
        FakeObserver.instances = [];
        vi.stubGlobal("IntersectionObserver", FakeObserver);
    });
    afterEach(() => vi.unstubAllGlobals());

    it("observes the element whose id is the slice anchor", () => {
        const root = rootWith("markdown-1");
        new RendererIntersectionManager().startObservingForSlice(
            root,
            fakeSlice("markdown-1"),
        );
        expect(FakeObserver.instances).toHaveLength(1);
        expect(FakeObserver.instances[0].observed[0].id).toBe("markdown-1");
        expect(FakeObserver.instances[0].options.threshold).toBe(1);
    });

    it("does nothing when the element is not in the page", () => {
        new RendererIntersectionManager().startObservingForSlice(
            rootWith(),
            fakeSlice("markdown-1"),
        );
        expect(FakeObserver.instances).toHaveLength(0);
    });

    it("does nothing when IntersectionObserver is not available", () => {
        vi.stubGlobal("IntersectionObserver", undefined);
        expect(() =>
            new RendererIntersectionManager().startObservingForSlice(
                rootWith("markdown-1"),
                fakeSlice("markdown-1"),
            ),
        ).not.toThrow();
    });

    it("emits an event with the anchor when the slice is fully visible", () => {
        const listener = vi.fn();
        document.addEventListener(
            "pboml-renderer-intersection-visible",
            listener,
        );
        new RendererIntersectionManager().startObservingForSlice(
            rootWith("table-2"),
            fakeSlice("table-2"),
        );
        FakeObserver.instances[0].trigger(0.5);
        expect(listener).not.toHaveBeenCalled();
        FakeObserver.instances[0].trigger(1);
        document.removeEventListener(
            "pboml-renderer-intersection-visible",
            listener,
        );
        expect(listener).toHaveBeenCalledOnce();
        expect(listener.mock.calls[0][0].detail).toEqual({ anchor: "table-2" });
    });

    // KNOWN BUG: observers are never stored in `this.observers`, so the
    // same slice can be observed twice and stopObserving() does nothing.
    it.fails("observes each slice only once", () => {
        const manager = new RendererIntersectionManager();
        const root = rootWith("markdown-1");
        manager.startObservingForSlice(root, fakeSlice("markdown-1"));
        manager.startObservingForSlice(root, fakeSlice("markdown-1"));
        expect(FakeObserver.instances).toHaveLength(1);
    });

    it.fails("disconnects every observer in stopObserving()", () => {
        const manager = new RendererIntersectionManager();
        const root = rootWith("a-1", "a-2");
        manager.startObservingForSlice(root, fakeSlice("a-1"));
        manager.startObservingForSlice(root, fakeSlice("a-2"));
        manager.stopObserving();
        expect(FakeObserver.instances).toHaveLength(2);
        FakeObserver.instances.forEach((o) =>
            expect(o.disconnect).toHaveBeenCalled(),
        );
    });
});
