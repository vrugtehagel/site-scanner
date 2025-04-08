# Site scanner

A tool for scanning websites using puppeteer.

Install dependencies using

```bash
deno install --allow-scripts=npm:puppeteer
```

Then run different scan modules, on one or more URLs, using

```bash
deno run scan --modules=pixels,htmlvalidity \
	--url=https://example.com/ \
	--url=https://example.org/
```

The output for each module can then be found as JSON in `output/[name].json` where `[name]` is the name of the module.
