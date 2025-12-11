import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-static configuration
		adapter: adapter({
			fallback: '404.html' // For SPA mode if needed, or just static
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
		alias: {
			$config: process.env.CONFIG_DIR
				? path.resolve(process.env.CONFIG_DIR)
				: path.resolve('config')
		}
	}
};

export default config;
