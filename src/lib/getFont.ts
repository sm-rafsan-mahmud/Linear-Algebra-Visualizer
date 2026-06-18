import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import type { Font } from 'three/addons/loaders/FontLoader.js'

let cachedFont: Font | null = null

export async function getFont(): Promise<Font> {
    if (cachedFont) return cachedFont
    const loader = new FontLoader()
    cachedFont = await loader.loadAsync(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
    )
    return cachedFont
}