import { defineConfig } from '@twind/core'
import presetTailwind from '@twind/preset-tailwind'
import presetTypography from '@twind/preset-typography'

export default defineConfig({
    presets: [presetTailwind(/* options */), presetTypography(/* options */)],
    /* config */
})