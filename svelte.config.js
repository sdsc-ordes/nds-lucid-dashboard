import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		paths: { base: process.env.BASE_PATH ?? '' },
		prerender: {
			origin: process.env.PUBLIC_SITE_URL || 'http://localhost:5173'
		}
	}
};

export default config;
