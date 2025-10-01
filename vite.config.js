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
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
				secure: false
			}
		}
	},
	esbuild: {
		loader: 'jsx',
		include: /src\/.*\.[jt]sx?$/,
		exclude: []
	}
});