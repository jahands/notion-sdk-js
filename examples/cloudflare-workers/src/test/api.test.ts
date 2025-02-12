import { fetchMock, SELF } from 'cloudflare:test'
import { httpStatus } from 'http-codex'
import { afterEach, beforeAll, describe, expect, it, test } from 'vitest'
import { z } from 'zod'

beforeAll(() => {
	fetchMock.activate()
	fetchMock.disableNetConnect()
})
afterEach(() => {
	fetchMock.assertNoPendingInterceptors()
})

test('current runtime', () => {
	expect(navigator.userAgent).toMatchInlineSnapshot(`"Cloudflare-Workers"`)
})

describe('api', () => {
	it('returns valid response', async () => {
		const res = await SELF.fetch('https://example.com/hello')
		expect(res.ok).toBe(true)
		expect(await res.text()).toMatchInlineSnapshot(`"hello, world!"`)
	})

	it('is able to fetch from notion', async () => {
		fetchMock
			.get('https://echoback.uuid.rocks')
			.intercept({ path: '/v1/pages/0e1008143b434d33b8b2f8616444e4e4' })
			.reply(200, examplePageResponse)

		const res = await SELF.fetch('https://example.com/notion')
		expect(res.status).toBe(httpStatus.OK)
		const page = z.object({ url: z.string() }).parse(await res.json())
		expect(page.url).toMatchInlineSnapshot(
			`"https://www.notion.so/0e1008143b434d33b8b2f8616444e4e4"`
		)
	})
})

const examplePageResponse = {
	object: 'page',
	id: '0e100814-3b43-4d33-b8b2-f8616444e4e4',
	created_time: '2025-02-12T13:25:00.000Z',
	last_edited_time: '2025-02-12T13:25:00.000Z',
	created_by: { object: 'user', id: '9385574e-f7c0-4d89-8465-d40dd8c4b85b' },
	last_edited_by: { object: 'user', id: '9385574e-f7c0-4d89-8465-d40dd8c4b85b' },
	cover: null,
	icon: null,
	parent: { type: 'workspace', workspace: true },
	archived: false,
	in_trash: false,
	properties: { title: { id: 'title', type: 'title', title: [] } },
	url: 'https://www.notion.so/0e1008143b434d33b8b2f8616444e4e4',
	public_url: null,
	request_id: 'fe7fe661-a868-445e-ac39-fc1324503ef8',
}
