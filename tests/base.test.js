// MyComponent.test.js
import { render } from '@testing-library/vue'
import Renderer from '../src/components/Renderer/Renderer.js'
import leg0 from './samples/leg0.yaml?raw'
import PBOMLDocument from '../src/models/PBOMLDocument.js'

test('it should work', () => {

    let pbomlDocument = PBOMLDocument.initFromYaml(leg0);
    const { getByText } = render(Renderer, {
        props: {
            pbomlDocument,
            language: 'en'
        }
    })

    // assert output
    getByText('The Sacred Flowers')
})