import { Client as NotionClient } from '@jahands/notion-client'
import { Hono } from 'hono'

const app = new Hono()
	// routes

	.get('/hello', async (c) => {
		return c.text('hello, world!')
	})

	.get('/notion', async (c) => {
		const notion = new NotionClient({
			baseUrl: 'https://echoback.uuid.rocks',
			auth: 'testtoken',
		})

		const page = await notion.pages.retrieve({
			page_id: '0e1008143b434d33b8b2f8616444e4e4',
		})

		return c.json(page)
	})

export default app
