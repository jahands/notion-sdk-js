import { $ } from '@repo/tools'

// Global setup runs inside Node.js, not `workerd`
export default async function (): Promise<void> {
	const label = 'Built Worker'
	console.time(label)
	await $({ cwd: __dirname })`turbo build`
	console.timeEnd(label)
}
