// MyComponent.test.js
import { render, fireEvent, screen } from '@testing-library/vue'
import Renderer from '../src/components/Renderer/Renderer.js'
import bitmap0 from './samples/bitmap0.yaml?raw'
import PBOMLDocument from '../src/models/PBOMLDocument.js'
import yaml from 'js-yaml'

test('bitmap0', async () => {

    let pbomlDocument = PBOMLDocument.initFromYaml(bitmap0);
    const { container } = await render(Renderer, {
        props: {
            pbomlDocument,
            language: 'en'
        }
    })

    const img = container.querySelector('picture>img')
    let payload = yaml.loadAll(bitmap0);
    expect(img.src).toBe(payload[0].slices[0].content.en)

    const webpMd = container.querySelector('picture>source[type="image/webp"][media="(max-width: 768px)"]');
    expect(webpMd.getAttribute("srcset")).toBe(`${payload[0].slices[0].thumbnails.en.md_1x_webp} 1x, ${payload[0].slices[0].thumbnails.en.md_2x_webp} 2x`)

})
