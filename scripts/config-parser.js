import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { generateSlug } from './utils/slug-generator.js';

export async function parseConfig(configPath) {
    try {
        // Read the config file synchronously
        // JSON parsing is safer and easier for external tools
        const fileContent = fs.readFileSync(path.resolve(configPath), 'utf-8');
        const config = JSON.parse(fileContent);

        if (!config || !config.sources || !Array.isArray(config.sources)) {
            throw new Error('Invalid configuration: "sources" array is missing.');
        }

        const existingIds = new Set();
        const parsedSources = [];

        for (const source of config.sources) {
            if (!source.videoUrl) {
                console.warn('Skipping source with missing videoUrl.');
                continue;
            }

            if (!source.clips || !Array.isArray(source.clips)) {
                console.warn(`Skipping source ${source.videoUrl}: "clips" array is missing.`);
                continue;
            }

            const parsedClips = [];
            for (const clip of source.clips) {
                if (!clip.title || !clip.start || !clip.end) {
                    console.warn(`Skipping invalid clip in ${source.videoUrl}: missing title, start, or end.`);
                    continue;
                }

                const id = generateSlug(clip.title, existingIds);

                parsedClips.push({
                    ...clip,
                    id,
                    // Ensure category is present, default to "Uncategorized" if missing
                    category: clip.category || 'Uncategorized'
                });
            }

            if (parsedClips.length > 0) {
                parsedSources.push({
                    videoUrl: source.videoUrl,
                    clips: parsedClips
                });
            }
        }

        return parsedSources;

    } catch (error) {
        console.error('Error parsing configuration:', error.message);
        process.exit(1);
    }
}
