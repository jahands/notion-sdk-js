import * as esbuild from 'esbuild'

import { $, fs } from '@repo/tools'

import { entryPoints } from './entrypoints'

await fs.rm('./dist/', { force: true, recursive: true })

await Promise.all([
	$`bun ./scripts/build-types.ts`,
	esbuild.build({
		entryPoints,
		outdir: './dist/',
		logLevel: 'info',
		outExtension: {
			'.js': '.mjs',
		},
		format: 'esm',
		bundle: true,
		treeShaking: true,
		external: ['node-fetch'],
	}),
])
