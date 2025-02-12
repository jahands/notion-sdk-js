import { Client as NotionClient } from '@jahands/notion-client'
import { describe, expect, it, test } from 'vitest'
import { z } from 'zod'

test('current runtime', () => {
	expect(navigator.userAgent).toMatchInlineSnapshot(`"Node.js/22"`)
})

describe('app', () => {
	it('is able to fetch from notion', async () => {
		const notion = new NotionClient({
			auth: 'testtoken',
			baseUrl: 'https://echoback.uuid.rocks',
		})

		const res = await notion.pages.retrieve({
			page_id: '0e1008143b434d33b8b2f8616444e4e4',
		})
		const page = z.object({ path: z.string() }).parse(res)
		expect(page).toMatchInlineSnapshot(`
			{
			  "path": "/v1/pages/0e1008143b434d33b8b2f8616444e4e4",
			}
		`)
	})
})
