import { defineProject } from 'vitest/config'

export default defineProject({
	test: {
		globalSetup: [`${__dirname}/src/test/global-setup.ts`],
		environment: 'node',
	},
})
