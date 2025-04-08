import { Manager } from '../manager.ts'

Manager.registerModule('crawl', async ({ url, page, manager }) => {
	const hrefs = await page.evaluate(findHrefs)
	const { origin } = new URL(url)
	const normalizedHrefs = hrefs.map((href) => {
		const url = new URL(href)
		if (url.origin != origin) return null
		url.hash = ''
		return url.href
	}).filter((href: string | null) => href)
	const uniqueHrefs = new Set(normalizedHrefs)
	manager.scan(...uniqueHrefs)
	return [...uniqueHrefs]
})

function findHrefs() {
	function piercingQuery(
		root: Document | ShadowRoot | null,
		selector: string,
	): Element[] {
		if (!root) return []
		const matches = [...root.querySelectorAll(selector)]
		const hosts = [...root.querySelectorAll(':defined')]
		const shadows = hosts.map((host) => host.shadowRoot)
		const deep = shadows.flatMap((shadow) =>
			piercingQuery(shadow, selector)
		)
		return [...matches, ...deep]
	}
	const as = piercingQuery(document, 'a[href]') as HTMLAnchorElement[]
	const hrefs = as.map((a) => a.href)
	return hrefs
}
