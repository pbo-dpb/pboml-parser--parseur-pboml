// Chart.js needs a real <canvas> 2D context, which the test DOM does not
// provide. Test files that render charts use this stand-in instead:
//
//     vi.mock("chart.js/auto", () => import("../helpers/chartjs-stub.js"));
//
// It keeps the config so tests can still inspect what would be drawn.
export default class ChartStub {
    static instances = [];
    constructor(context, config) {
        this.context = context;
        this.config = config;
        ChartStub.instances.push(this);
    }
    update() {}
    destroy() {}
}
