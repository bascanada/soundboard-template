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
			configureServer(server) {
				const configDir = process.env.CONFIG_DIR
					? path.resolve(process.env.CONFIG_DIR)
					: path.resolve('config');
				const configFile = path.join(configDir, 'clips.json');

				server.watcher.add(configFile);
				server.watcher.on('change', (file) => {
					if (file === configFile) {
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
			allow: [
				'config', // Keeping this for default cases
				process.env.CONFIG_DIR ? path.resolve(process.env.CONFIG_DIR) : 'config'
			]
		}
	}
});
