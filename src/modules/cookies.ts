import { Cookie } from 'puppeteer'
import { Manager } from '../manager.ts'

const acceptCookies = await import('../../input/cookies.ts').then(mod => {
	return mod.default
}).catch(() => {
	throw Error(`The "cookies" module requires an "input/cookies.ts" file`)
})

Manager.registerModule('cookies', async ({ page }) => {
	const context = page.browserContext()
	await page.waitForNetworkIdle().catch(() => null)
	const badCookies = await context.cookies()
	const consentOk = await page.evaluate(acceptCookies).catch(() => false)
	await page.waitForNetworkIdle().catch(() => null)
	const allCookies = await context.cookies()
	const goodCookies = allCookies.filter((cookie) => {
		return !badCookies.some(({ name }) => cookie.name == name)
	})
	return [
		...badCookies.map((cookie) => formatCookie(cookie, true)),
		...goodCookies.map((cookie) => formatCookie(cookie, false)),
	]
})

function formatCookie(cookie: Cookie, bad: boolean): {
	name: string
	domain: string
	expires: number
	session: boolean
	bad: boolean
} {
	const { name, domain, expires, session } = cookie
	return { name, domain, expires, session, bad }
}
