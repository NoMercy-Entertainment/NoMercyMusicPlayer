/// <reference types="vitest" />
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nomercyTranslationsPlugin } from '@nomercy-entertainment/nomercy-player-core/vite-plugin';

const selfRoot = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
	base: '/',
	publicDir: resolve(__dirname, 'public'),
	plugins: [dts(), nomercyTranslationsPlugin()],
	resolve: {
		alias: [
			{
				find: '@nomercy-entertainment/nomercy-music-player',
				replacement: `${selfRoot}/index.ts`,
			},
		],
	},
	build: {
		sourcemap: false,
		minify: 'terser',
		target: 'es2022',
		rollupOptions: {
			input: ['./src/index.ts'],
			external: ['hls.js'],
			output: {
				globals: {
					'hls.js': 'Hls',
				},
			},
		},
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'nmMPlayer',
			formats: ['es', 'cjs', 'umd'],
			fileName: 'nomercy-music-player',
		},
	},
	clearScreen: true,
});
