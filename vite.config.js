import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	build: {
		outDir: 'dist',
		sourcemap: true
	},
	server: {
		port: 3000
	},
	esbuild: {
		loader: 'jsx',
		include: /src\/.*\.[jt]sx?$/,
		exclude: []
	}
});