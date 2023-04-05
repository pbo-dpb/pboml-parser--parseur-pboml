import { h, defineAsyncComponent } from 'vue'
import ApexDataSource from './ApexDataSource.js';

export default {
    props: ['language', 'data'],
    computed: {
        renderingEngine() {
            return "apex";
        },
        dataSource() {

            if (this.renderingEngine === 'apex') {
                return new ApexDataSource(this.language, this.data);
            }
            return null
        }
    },

    render() {

        if (this.dataSource && this.renderingEngine === 'apex') {
            return h(defineAsyncComponent(() => import('./ApexRenderer.js')), { dataSource: this.dataSource }, () => [])
        }

    }
}