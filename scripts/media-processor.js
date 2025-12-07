import fs from 'fs';
import path from 'path';
import { extractAudio, extractVideo, generateThumbnail } from './utils/ffmpeg-commands.js';

export function processClip(clip, inputVideoPath, outputBaseDir) {
    const clipDir = path.join(outputBaseDir, clip.id);

    if (!fs.existsSync(clipDir)) {
        fs.mkdirSync(clipDir, { recursive: true });
    }

    const results = {
        id: clip.id,
        title: clip.title,
        category: clip.category,
        audioSrc: `/media/${clip.id}/audio.mp3`,
        thumbnailSrc: `/media/${clip.id}/thumbnail.jpg`,
        videoSrc: null
    };

    try {
        console.log(`  Processing clip: ${clip.title} (${clip.id})...`);

        // 1. Extract Audio
        const audioPath = path.join(clipDir, 'audio.mp3');
        extractAudio(inputVideoPath, clip.start, clip.end, audioPath);

        // 2. Generate Thumbnail
        const thumbnailPath = path.join(clipDir, 'thumbnail.jpg');
        generateThumbnail(inputVideoPath, clip.start, thumbnailPath);

        // 3. Extract Video (if requested)
        if (clip.video) {
            const videoPath = path.join(clipDir, 'video.webm');
            extractVideo(inputVideoPath, clip.start, clip.end, videoPath);
            results.videoSrc = `/media/${clip.id}/video.webm`;
        }

        return results;

    } catch (error) {
        console.error(`  ❌ Error processing clip ${clip.id}: ${error.message}`);
        // Clean up if possible?
        return null;
    }
}
