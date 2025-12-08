import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function downloadVideo(url, cacheDir) {
    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Generate a consistent filename based on the URL (e.g., MD5 hash or just the video ID)
    // For simplicity with yt-dlp, we'll let it handle the ID, but we need to know the output filename.
    // We can use the video ID as the filename prefix.

    // Extract video ID from URL (basic regex for youtube)
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : 'video';

    // We look for any existing file with this video ID in the cache dir
    const files = fs.readdirSync(cacheDir);
    const existingFile = files.find(f => f.startsWith(videoId) && (f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv')));

    if (existingFile) {
        console.log(`📦 Using cached video for: ${url}`);
        return path.join(cacheDir, existingFile);
    }

    const outputTemplate = path.join(cacheDir, `${videoId}.%(ext)s`);

    // Check for cookies file in root directory
    let cookieArg = '';
    const cookiePath = path.resolve('cookies.txt');
    if (fs.existsSync(cookiePath)) {
        console.log('TZ🍪 Using provided cookies for authentication.');
        cookieArg = `--cookies "${cookiePath}"`;
    }

    console.log(`⬇️  Downloading: ${url}`);

    try {
        // Download best video+audio, merge into mp4 or webm
        // --no-playlist to ensure we only get one video if it's a playlist URL
        execSync(`yt-dlp ${cookieArg} --extractor-args "youtube:player_client=ios" -f "bestvideo+bestaudio/best" --merge-output-format mp4 --no-playlist -o "${outputTemplate}" "${url}"`, { stdio: 'inherit' });

        // Find the downloaded file
        const newFiles = fs.readdirSync(cacheDir);
        const videoFile = newFiles.find(f => f.startsWith(videoId));

        if (!videoFile) {
            throw new Error('Download appeared to succeed but no file was found.');
        }

        return path.join(cacheDir, videoFile);

    } catch (error) {
        console.error(`❌ Failed to download ${url}`);
        try {
            console.log('🔍 Listing available formats for debugging:');
            execSync(`yt-dlp ${cookieArg} --extractor-args "youtube:player_client=ios" -F "${url}"`, { stdio: 'inherit' });
        } catch (e) {
            console.log('Could not list formats.');
        }
        throw error;
    }
}
