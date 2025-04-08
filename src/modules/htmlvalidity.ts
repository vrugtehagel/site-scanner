import { HtmlValidate, StaticConfigLoader } from "html-validate";
import { Manager } from '../manager.ts'

const configLoader = new StaticConfigLoader();
const htmlValidate = new HtmlValidate(configLoader);

Manager.registerModule('htmlvalidity', async ({ page, response }) => {
	const source = await response.text()
	const report = await htmlValidate.validateString(source)
	const [{ messages, errorCount, warningCount }] = report.results
	return { errorCount, warningCount, messages }
})
