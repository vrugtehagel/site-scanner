import type { Browser } from 'puppeteer'
import type {
	JSONData,
	ModulesProcessing,
	PageInput,
	ScanModule,
} from './types.ts'

export class Manager {
	static #registrations: ScanModule[] = []
	static registerModule(name: string, run: ScanModule['run']): void {
		this.#registrations.push({ name, run })
	}

	#browser: Browser
	#scanning = false
	#modules: ScanModule[] = []
	#urls = new Set<string>()
	#seenUrls = new Set<string>()
	#results = new Map<string, { [key: string]: JSONData }>()

	constructor(browser: Browser, modules: string[]) {
		this.#browser = browser
		for (const name of modules) this.#addModule(name)
	}

	#addModule(name: string): void {
		const registrations = Manager.#registrations
		const module = registrations.find((module) => module.name == name)
		if (!module) throw Error(`Module "${name}" not found`)
		this.#modules.push(module)
	}

	async scan(...urls: string[]): Promise<void> {
		if (urls.length == 0) return this.#runScan()
		const url = urls.pop()!
		const seen = this.#seenUrls.has(url)
		if (!seen) this.#urls.add(url)
		return this.scan(...urls)
	}

	async #runScan(): Promise<void> {
		if (this.#scanning) return
		this.#scanning = true
		for (const url of this.#urls) await this.#process(url)
		this.#scanning = false
	}

	async #process(url: string): Promise<void> {
		const start = Date.now()
		console.log(`Processing ${url}`)
		const context = await this.#browser.createBrowserContext()
		const page = await context.newPage()
		const response = await page.goto(url)
		if (response == null) return
		const manager = this
		const { promises, resolvers } = this.#getModulePromises(this.#modules)
		const processing = promises
		const input = { url, page, response, manager, processing }
		const modules = this.#modules
		for (const module of modules) this.#runModule(module, input, resolvers)
		await Promise.all(Object.values(promises))
		await page.close()
		const elapsed = Math.floor((Date.now() - start) / 100) / 10
		console.log(`           Took ${elapsed}s`)
	}

	#getModulePromises(modules: ScanModule[]): ModulesProcessing {
		const names = modules.map((module) => module.name)
		const promises = {}
		const resolvers = {}
		const processing = { promises, resolvers }
		for (const name of names) this.#addModulePromise(name, processing)
		return processing
	}

	#addModulePromise(name: string, processing: ModulesProcessing): void {
		const { promise, resolve } = Promise.withResolvers<void>()
		processing.promises[name] = promise
		processing.resolvers[name] = resolve
	}

	async #runModule(
		module: ScanModule,
		input: PageInput,
		resolvers: { [key: string]: () => void },
	): Promise<void> {
		const { url } = input
		if(!this.#results.has(url)) this.#results.set(url, {})
		const results = this.#results.get(url)
		results[module.name] = await module.run(input)
		this.#results.set(url, results)
		resolvers[module.name]!()
	}

	async write(): Promise<void> {
		await Deno.remove('./output', { recursive: true })
		await Deno.mkdir('./output', { recursive: true })
		for (const module of this.#modules) await this.#writeModule(module)
	}

	async #writeModule(module: ScanModule): Promise<void> {
		const { name } = module
		const entries = [...this.#results]
		const results = entries.map(([url, results]) => [url, results[name]])
		const json = Object.fromEntries(results)
		const path = `./output/${name}.json`
		const content = JSON.stringify(json, null, 2)
		await Deno.writeTextFile(path, content)
	}
}
