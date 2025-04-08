import type { HTTPResponse, Page } from 'puppeteer'
import type { Manager } from './manager.ts'

export type JSONData =
	| string
	| number
	| boolean
	| null
	| JSONData[]
	| { [key: string]: JSONData }

export type ScanModule = {
	name: string
	run: (input: PageInput) => JSONData | Promise<JSONData>
}

export type PageInput = {
	url: string
	page: Page
	response: HTTPResponse
	manager: Manager
	processing: { [scanModuleName: string]: Promise<void> }
}

export type ModulesProcessing = {
	promises: { [key: string]: Promise<void> }
	resolvers: { [key: string]: () => void }
}
