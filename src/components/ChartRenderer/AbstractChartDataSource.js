
export default class AbstractChartDataSource {


    constructor(language, data) {
        this.data = data;
        this.language = language;



        // Manually observe for dark mode.
        this.is_dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            // TODO Currently does nothing; force re-render on mode switch
            this.is_dark = event.matches ? true : false;
        });
    }


    serialize() {
        return {}
    }

    get colorPalette() {
        if (this.is_dark) {
            return ['#3F709E', '#7A70A4', '#B174A1', '#D77C90', '#E88D6F', '#DDAF54', '#ABBDDE', '#9F3D00']
        }
        return ['#2d5071', '#61588a', '#9d598c', '#cd5e76', '#e37651', '#d69e2e', '#98aed6', '#532000']
    }

}