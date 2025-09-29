import 'zx/globals'

import { program } from '@commander-js/extra-typings'
import { catchProcessError } from '@jahands/cli-tools'
import { createDaggerCommandRunner } from 'dagger-env/run'

import { dagEnv } from '../../../src/dagger-env'
import { getRepoRoot } from '../path'

program.name('daggerx').description('A CLI for running Dagger commands with 1Password secrets')

export const runDaggerCommand = createDaggerCommandRunner({
	opVault: 'xxcrgwtyu2wmeh2jdcnee2eqda', // GitHub Actions
	opItem: 'dzxntwosd46ykwyz7qjdijfr2m', // GitHub Actions Secrets (1P-0whym)
	opSections: [{ label: 'Shared', id: 'cpbkdydzyexdubry5g4rofcpny' }],
	daggerEnv: dagEnv,
})

// dagger targets
program.command('test').action(() => runDaggerCommand('test'))

// other helpers
program.command('develop').action(async () => {
	await $`dagger develop`.finally(async () => {
		await $({
			cwd: getRepoRoot(),
		})`rm -f .dagger/.gitignore .dagger/.gitattributes`
	})
})

await program
	// Don't hang for unresolved promises
	.hook('postAction', () => process.exit(0))
	.parseAsync()
	.catch(catchProcessError())
