import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { checkDependencies } from './utils/dependency-checker.js';
import { parseConfig } from './config-parser.js';
import { downloadVideo } from './video-downloader.js';
import { processClip } from './media-processor.js';
import { generateDatabase } from './database-generator.js';
import { CacheManager } from './cache-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'config/clips.json');
const STATIC_DIR = path.join(ROOT_DIR, 'static');
const MEDIA_DIR = path.join(STATIC_DIR, 'media');
const CACHE_DIR = path.join(ROOT_DIR, '.cache');
const DOWNLOADS_DIR = path.join(CACHE_DIR, 'downloads');

async function main() {
    console.log('🚀 Starting Soundboard Generation...');

    // 1. Check Dependencies
    checkDependencies();

    // 2. Parse Configuration
    console.log('📖 Reading configuration...');
    const sources = await parseConfig(CONFIG_PATH);
    console.log(`   Found ${sources.length} sources.`);

    // 3. Prepare Directories
    if (!fs.existsSync(MEDIA_DIR)) {
        fs.mkdirSync(MEDIA_DIR, { recursive: true });
    }

    // 4. Initialize Cache Manager
    const cacheManager = new CacheManager(CACHE_DIR);

    const processedClips = [];
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    try {
        // 5. Process Sources
        for (const source of sources) {
            try {
                // Download Video (Cached)
                const videoPath = downloadVideo(source.videoUrl, DOWNLOADS_DIR);

                // Process Clips for this source
                for (const clip of source.clips) {

                    // Check if clip needs processing
                    if (!cacheManager.shouldProcess(clip)) {
                        console.log(`  ⏭️  Skipping unchanged clip: ${clip.title} (${clip.id})`);

                        // Add to processed list (reconstruct paths)
                        processedClips.push({
                            id: clip.id,
                            title: clip.title,
                            category: clip.category,
                            audioSrc: `/media/${clip.id}/audio.mp3`,
                            thumbnailSrc: `/media/${clip.id}/thumbnail.jpg`,
                            videoSrc: clip.video ? `/media/${clip.id}/video.webm` : null,
                            scale: clip.scale
                        });
                        skippedCount++;
                        continue;
                    }

                    const result = processClip(clip, videoPath, MEDIA_DIR);
                    if (result) {
                        processedClips.push(result);
                        cacheManager.markProcessed(clip); // Update cache
                        successCount++;
                    } else {
                        failureCount++;
                    }
                }

            } catch (error) {
                console.error(`❌ Failed to process source ${source.videoUrl}: ${error.message}`);
                failureCount += source.clips.length; // Count all clips in this source as failed
            }
        }

        // 6. Cleanup Orphaned Clips
        const orphanedIds = cacheManager.getOrphanedClips(processedClips);
        if (orphanedIds.length > 0) {
            console.log(`🧹 Cleaning up ${orphanedIds.length} orphaned clips...`);
            for (const id of orphanedIds) {
                const clipDir = path.join(MEDIA_DIR, id);
                if (fs.existsSync(clipDir)) {
                    fs.rmSync(clipDir, { recursive: true, force: true });
                    console.log(`   - Removed ${id}`);
                }
                cacheManager.removeClip(id);
            }
        }

        // 7. Generate Database
        generateDatabase(processedClips, STATIC_DIR);

        // 8. Generate Manifest
        console.log('📄 Generating manifest.json...');
        // We need to import siteConfig. Since it's an ES module in src, we can import it directly if we use the right path.
        // However, src/lib/site.config.js might import types which node doesn't like if not compiled.
        // But our site.config.js is pure JS.
        const siteConfigPath = path.join(ROOT_DIR, 'config/site.json');
        const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));

        const manifest = {
            name: siteConfig.pwa.name,
            short_name: siteConfig.pwa.short_name,
            start_url: siteConfig.pwa.start_url,
            display: siteConfig.pwa.display,
            background_color: siteConfig.pwa.background_color,
            theme_color: siteConfig.pwa.theme_color,
            icons: [
                {
                    src: siteConfig.favicon,
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: siteConfig.favicon,
                    sizes: "512x512",
                    type: "image/png"
                }
            ]
        };

        fs.writeFileSync(path.join(STATIC_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

        // 9. Generate Build Metadata
        console.log('🕒 Generating build metadata...');
        const buildMetadata = {
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(path.join(ROOT_DIR, 'src/lib/build.json'), JSON.stringify(buildMetadata, null, 2));

        console.log('\n✨ Generation Complete!');
        console.log(`   ✅ Processed: ${successCount}`);
        console.log(`   ⏭️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Failures: ${failureCount}`);

    } catch (error) {
        console.error('\n❌ Fatal Error:', error);
    }
}

main();
