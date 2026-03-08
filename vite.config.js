import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/enchatted': {
				target: 'https://enchatted.xyz',
				changeOrigin: true,
				secure: false
			},
			'/ws': {
				target: 'wss://enchatted.xyz',
				ws: true,
				changeOrigin: true,
				secure: false
			}
		}
	}
});
