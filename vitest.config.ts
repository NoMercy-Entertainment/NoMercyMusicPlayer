import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { nomercyTranslationsPlugin } from '../nomercy-player-kit/src/vite-plugin';

const kitRoot = fileURLToPath(new URL('../nomercy-player-kit/src', import.meta.url));

export default defineConfig({
	plugins: [nomercyTranslationsPlugin()],
	resolve: {
		alias: [
			{
				find: '@nomercy-entertainment/nomercy-player-core/testing',
				replacement: `${kitRoot}/testing/index.ts`,
			},
			{
				find: '@nomercy-entertainment/nomercy-player-core/vite-plugin',
				replacement: `${kitRoot}/vite-plugin.ts`,
			},
			// Subpath plugin imports — must be more specific than the bare-package
			// alias below, and resolved as a regex prefix so any plugin file is
			// served from the kit src tree.
			{
				find: /^@nomercy-entertainment\/nomercy-player-core\/plugins\/(.+)$/,
				replacement: `${kitRoot}/plugins/$1.ts`,
			},
			{
				find: '@nomercy-entertainment/nomercy-player-core',
				replacement: `${kitRoot}/index.ts`,
			},
		],
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		include: ['src/**/__tests__/**/*.test.ts'],
	},
});
