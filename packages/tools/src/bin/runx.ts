import 'zx/globals'

import { program } from '@commander-js/extra-typings'
import { catchProcessError } from '@jahands/cli-tools'

import { checkCmd } from '../cmd/check'
import { fixCmd } from '../cmd/fix'
import { parseChangesetCmd } from '../cmd/parse-changeset'
import { updateCmd } from '../cmd/update'

program
	.name('runx')
	.description('A CLI for scripts that automate this repo')

	.addCommand(checkCmd)
	.addCommand(fixCmd)
	.addCommand(updateCmd)
	.addCommand(parseChangesetCmd)

	// Don't hang for unresolved promises
	.hook('postAction', () => process.exit(0))
	.parseAsync()
	.catch(catchProcessError())
