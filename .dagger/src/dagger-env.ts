import { createDaggerEnv } from 'dagger-env'
import { z } from 'zod'

export const dagEnv = createDaggerEnv({
	args: z.object({}),
	env: z.object({
		CI: z.string().optional(),
		GITHUB_ACTIONS: z.string().optional(),
	}),
	secrets: z.object({
		TURBO_TOKEN: z.string(),
		TURBO_REMOTE_CACHE_SIGNATURE_KEY: z.string(),
	}),
	secretPresets: {
		turbo: ['TURBO_TOKEN', 'TURBO_REMOTE_CACHE_SIGNATURE_KEY'],
	} as const,
	derivedEnvVars: {
		TURBO_TOKEN: {
			TURBO_API: 'https://turbo.uuid.rocks',
			TURBO_TEAM: 'team_jahands_notion-sdk-js',
			TURBO_LOG_ORDER: 'grouped',
			DO_NOT_TRACK: '1',
		},
	} as const,
})

export type DaggerOptions = z.output<ReturnType<typeof dagEnv.getOptionsSchema>>
export const DaggerOptions = dagEnv.getOptionsSchema()
