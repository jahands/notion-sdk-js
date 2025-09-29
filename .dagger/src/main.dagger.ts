/* eslint-disable @typescript-eslint/no-unused-vars */
import { argument, Container, dag, Directory, func, object, Secret } from '@dagger.io/dagger'
import { envStorage, shell } from '@jahands/dagger-helpers'
import { dagEnv } from './dagger-env'

const sh = shell('bash')

const projectIncludes: string[] = [
	// dirs
	'examples/',
	'packages/',

	// files
	'.gitignore',
	'.npmrc',
	'.prettierignore',
	'.prettierrc.cjs',
	'.sentryclirc',
	'.syncpackrc.cjs',
	'Justfile',
	'.eslintrc.cjs',
	'.eslintignore',
	'package.json',
	'pnpm-lock.yaml',
	'pnpm-workspace.yaml',
	'tsconfig.json',
	'turbo.jsonc',
	'vitest.workspace.ts',
]

@object()
export class Dotfiles {
	source: Directory

	constructor(
		@argument({
			defaultPath: '/',
			ignore: [
				'**/.DS_Store',
				'**/.dev.vars',
				'**/.env',
				'**/.dagger/sdk/',
				'**/.turbo/',
				'**/*.env',
				'**/dist/',
				'**/node_modules/',
			],
		})
		source: Directory
	) {
		this.source = source
	}

	@func()
	getSource(): Directory {
		return this.source
	}

	@func()
	async setupWorkspace(): Promise<Container> {
		return dag
			.container()
			.from(`public.ecr.aws/debian/debian:12-slim`)
			.withWorkdir('/work')
			.withEnvVariable('HOME', '/root')
			.withEnvVariable('DOTFILES_DIR', '/work')
			.withExec(
				sh(
					[
						'apt-get update',
						'apt-get install -y curl jq git unzip bash zsh',
						'rm -rf /var/lib/apt/lists/*',
					].join(' && ')
				)
			)
			.withExec(sh('curl -fsSL https://sh.uuid.rocks/install/mise | bash'))
			.withEnvVariable('PATH', '$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH', {
				expand: true,
			})
			.withFile('.mise.toml', this.source.file('/.mise.toml'))
			.withExec(sh('mise trust --yes && mise install --yes && mise reshim'))
			.sync()
	}

	@func()
	async installDeps(options: Secret): Promise<Container> {
		const workspace = await this.setupWorkspace()
		const withEnv = await dagEnv.getWithEnv(options, ['turbo'])

		const con = withEnv(workspace)
			// copy over minimal files needed for installing tools/deps
			.withDirectory('/work', this.source.directory('/'), {
				include: [
					'patches/',
					'pnpm-lock.yaml',
					'pnpm-workspace.yaml',
					'package.json',
					'**/package.json',
					'.npmrc',
					'packages/tools/bin',
				],
			})

			// install pnpm deps for the entire workspace
			.withMountedCache('/pnpm-store', dag.cacheVolume(`dotfiles-pnpm-store`))
			.withExec(sh('pnpm config set store-dir /pnpm-store'))
			.withExec(sh('FORCE_COLOR=1 pnpm install --frozen-lockfile --child-concurrency=10'))

			// copy over the rest of the project
			.withDirectory('/work', this.source.directory('/'), { include: projectIncludes })

			// git dir is used for tests and other tooling
			.withDirectory('.git', this.source.directory('/.git'))
		return con
	}

	@func()
	async test(options: Secret): Promise<void> {
		const con = await this.installDeps(options)

		await con.withExec(sh('FORCE_COLOR=1 pnpm turbo check:ci')).sync()
	}

	// =============================== //
	// =========== Helpers =========== //
	// =============================== //

	/**
	 * Calculate derived environment variables based on variables present in the env object.
	 */
	private getDerivedEnvVars(
		env: Record<string, string | Secret | undefined>
	): Record<string, string> {
		const derivedVars: Record<string, string> = {}

		// Set Turbo environment variables for dotfiles
		derivedVars.TURBO_TEAM = 'team_dotfiles'
		derivedVars.DO_NOT_TRACK = '1'

		return derivedVars
	}

	/**
	 * Add env vars / secrets to a container based on AsyncLocalStorage context
	 */
	private withEnv(
		con: Container,
		{
			color = true,
		}: {
			/**
			 * Set FORCE_COLOR=1
			 * @default true
			 */
			color?: boolean
		} = {}
	): Container {
		let c = con
		const context = envStorage.getStore()

		if (color) {
			c = c.withEnvVariable('FORCE_COLOR', '1')
		}

		if (context) {
			const { currentParams, mergedEnv } = context

			/** Set derived env vars based on trigger vars in the current context */
			const derivedEnvVars = this.getDerivedEnvVars(mergedEnv)
			for (const [key, value] of Object.entries(derivedEnvVars)) {
				c = c.withEnvVariable(key, value)
			}

			for (const [key, value] of Object.entries(mergedEnv)) {
				if (currentParams.has(key) && value) {
					if (typeof value === 'string') {
						c = c.withEnvVariable(key, value)
					} else {
						c = c.withSecretVariable(key, value as Secret)
					}
				}
			}
		} else {
			throw new Error('AsyncLocalStorage store not found in withEnv')
		}
		return c
	}
}
