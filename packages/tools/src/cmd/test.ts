import { Command } from '@commander-js/extra-typings'

import { getRepoRoot } from '../path'

export const testCmd = new Command('test')
	.description('Run vitest tests')
	.option('-a, --all', 'Run tests from root of repo. Defaults to cwd', false)
	.option('-w, --watch', 'Run vitest in watch mode')
	.argument(
		'[args...]',
		'Arguments to pass to vitest. Use -- before passing options starting with -'
	)
	.action(async (args, { all, watch }) => {
		if (all) {
			cd(getRepoRoot())
		}
		const cmd: string[] = ['bun', 'vitest', '--testTimeout', '15000']
		if (!watch) {
			cmd.push('--run')
		}

		$.stdio = 'inherit'
		await $`${cmd} ${args}`.verbose()
	})
