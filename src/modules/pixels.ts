import { Cookie } from 'puppeteer'
import { getImageInfo } from '@retraigo/image-size'
import { Manager } from '../manager.ts'

Manager.registerModule('pixels', async ({ page, processing }) => {
	const pixels = []
	page.on('response', async (response) => {
		const headers = response.headers()
		const contentType = headers['content-type']
		if (!contentType) return
		if (!contentType.startsWith('image/')) return
		if (contentType == 'image/svg+xml') return
		const url = response.url()
		const isPixel = await isOneByOneImage(url)
		if(!isPixel) return
		pixels.push(url)
	})
	await processing['cookies']
	await page.waitForNetworkIdle().catch(() => null)
	return pixels
})

async function isOneByOneImage(url: string): boolean {
	const response = await fetch(url)
	const bytes = await response.bytes()
	const { width, height } = getImageInfo(bytes)
	return width <= 1 && height <= 1
}
