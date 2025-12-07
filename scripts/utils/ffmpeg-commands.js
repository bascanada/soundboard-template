import { execSync } from 'child_process';
import path from 'path';

/**
 * Extracts audio from a video file.
 * @param {string} inputFile - Path to the input video.
 * @param {string} start - Start time (e.g. "0:42").
 * @param {string} end - End time (e.g. "1:15").
 * @param {string} outputFile - Path to the output audio file.
 */
export function extractAudio(inputFile, start, end, outputFile) {
    // -vn: no video
    // -c:a libmp3lame: use mp3 codec
    // -q:a 2: high quality (VBR)
    const cmd = `ffmpeg -y -i "${inputFile}" -ss ${start} -to ${end} -vn -c:a libmp3lame -q:a 2 "${outputFile}"`;
    execSync(cmd, { stdio: 'ignore' });
}

/**
 * Extracts a video clip.
 * @param {string} inputFile - Path to the input video.
 * @param {string} start - Start time.
 * @param {string} end - End time.
 * @param {string} outputFile - Path to the output video file.
 */
export function extractVideo(inputFile, start, end, outputFile) {
    // -c:v libvpx-vp9: VP9 codec for WebM
    // -crf 31: Constant Rate Factor (quality/size balance)
    // -b:v 0: Must be 0 for CRF to work
    // -c:a libopus: Opus audio codec
    const cmd = `ffmpeg -y -i "${inputFile}" -ss ${start} -to ${end} -c:v libvpx-vp9 -crf 31 -b:v 0 -c:a libopus -b:a 128k "${outputFile}"`;
    execSync(cmd, { stdio: 'ignore' });
}

/**
 * Generates a thumbnail from a video.
 * @param {string} inputFile - Path to the input video.
 * @param {string} start - Time to take the screenshot.
 * @param {string} outputFile - Path to the output image file.
 */
export function generateThumbnail(inputFile, start, outputFile) {
    // -vframes 1: Output a single frame
    // -q:v 2: High quality jpg
    const cmd = `ffmpeg -y -ss ${start} -i "${inputFile}" -vframes 1 -q:v 2 "${outputFile}"`;
    execSync(cmd, { stdio: 'ignore' });
}
