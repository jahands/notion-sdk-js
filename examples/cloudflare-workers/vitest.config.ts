import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
	test: {
		globalSetup: [`${__dirname}/src/test/global-setup.ts`],
		poolOptions: {
			workers: {
				main: `${__dirname}/dist/index.js`,
				isolatedStorage: true,
				singleWorker: true,
				miniflare: {
					compatibilityDate: '2024-09-23',
					compatibilityFlags: ['nodejs_compat'],
				},
			},
		},
	},
})
