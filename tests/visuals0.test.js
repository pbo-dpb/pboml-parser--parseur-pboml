// MyComponent.test.js
import { render } from '@testing-library/vue'
import Renderer from '../src/components/Renderer/Renderer.js'
import visuals0 from './samples/visuals0.yaml?raw'
import PBOMLDocument from '../src/models/PBOMLDocument.js'

test('visuals0-e', () => {

    let pbomlDocument = PBOMLDocument.initFromYaml(visuals0);
    const { getByText } = render(Renderer, {
        props: {
            pbomlDocument,
            language: 'en'
        }
    })
    // assert output
    getByText('EN')
})

test('visuals0-f', () => {

    let pbomlDocument = PBOMLDocument.initFromYaml(visuals0);
    const { getByText } = render(Renderer, {
        props: {
            pbomlDocument,
            language: 'fr'
        }
    })
    // assert output
    getByText('FR')
})