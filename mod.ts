import puppeteer from 'puppeteer'
import { parseArgs } from '@std/cli'
import { Manager } from './src/manager.ts'
import './src/modules/cookies.ts'
import './src/modules/crawl.ts'
import './src/modules/htmlvalidity.ts'
import './src/modules/pixels.ts'
import './src/modules/storage.ts'

const browser = await puppeteer.launch({ headless: 'shell' })
const args = parseArgs(Deno.args, {
	collect: ['url'],
	string: ['url', 'modules'],
})
const urls = args.url
const modules = args.modules?.split(',') ?? []
const manager = new Manager(browser, modules)
await manager.scan(...urls)
await manager.write()
await browser.close()
