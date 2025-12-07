import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { exec } from 'child_process';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		{
			name: 'soundboard-watcher',
			configureServer(server) {
				server.watcher.add(path.resolve('config/clips.js'));
				server.watcher.on('change', (file) => {
					if (file.endsWith('config/clips.js')) {
						console.log('🔄 Configuration changed, regenerating clips...');
						exec('npm run generate', (error, stdout, stderr) => {
							if (error) {
								console.error(`❌ Generation error: ${error}`);
								return;
							}
							console.log(stdout);
							console.log('✨ Regenerated! Reloading...');
							server.ws.send({ type: 'full-reload' });
						});
					}
				});
			}
		}
	],
	server: {
		fs: {
			allow: ['config']
		}
	}
});
