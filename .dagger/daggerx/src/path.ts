import * as find from 'empathic/find'
import { z } from 'zod'

export function getRepoRoot() {
	const pnpmLock = z
		.string()
		.trim()
		.startsWith('/')
		.endsWith('/pnpm-lock.yaml')
		.parse(find.up('pnpm-lock.yaml'))
	return path.dirname(pnpmLock)
}
