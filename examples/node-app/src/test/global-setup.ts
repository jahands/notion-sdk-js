import { $ } from '@repo/tools'

export default async function (): Promise<void> {
	const label = 'Built packages'
	console.time(label)
	await $({ cwd: __dirname })`turbo build`
	console.timeEnd(label)
}
