import { Manager } from '../manager.ts'

Manager.registerModule('storage', async ({ page, processing }) => {
	await processing['cookies']
	await page.waitForNetworkIdle().catch(() => null)
	const { local, session } = await page.evaluate(getStorage)
	return { local, session }
})


function getStorage(): { local: string[], session: string[] } {
	const local = Array.from(localStorage, (_, index) => {
		return localStorage.key(index)
	})
	const session = Array.from(sessionStorage, (_, index) => {
		return sessionStorage.key(index)
	})
	return { local, session }
}
