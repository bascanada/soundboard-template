import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const VIDEO_URL = process.argv[2];
const CATEGORY = "Culture";
const TEMP_DIR = ".cache/whisper_draft";
// ---------------------

function main() {
    if (!VIDEO_URL) {
        console.error("Please provide a YouTube URL.");
        console.log("Usage: node scripts/draft-whisper.js <YOUTUBE_URL>");
        return;
    }

    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    console.log(`🔍 Fetching audio for: ${VIDEO_URL}`);

    try {
        // 1. Download Audio using yt-dlp
        const audioFile = path.join(TEMP_DIR, 'audio');
        // Download as best audio, convert to mp3 for whisper compatibility
        execSync(`yt-dlp -f "bestaudio" -x --audio-format mp3 -o "${audioFile}.%(ext)s" "${VIDEO_URL}"`, { stdio: 'inherit' });

        // Find the file (it will be audio.mp3)
        const downloadedAudio = path.join(TEMP_DIR, 'audio.mp3');
        if (!fs.existsSync(downloadedAudio)) {
            throw new Error("Audio download failed.");
        }

        console.log('🗣️  Running Whisper (this may take a moment)...');
        // 2. Run Whisper
        // --model base (balanced speed/accuracy)
        // --output_format vtt
        // --output_dir TEMP_DIR
        execSync(`whisper "${downloadedAudio}" --model base --output_format vtt --output_dir "${TEMP_DIR}"`, { stdio: 'inherit' });

        const vttFile = path.join(TEMP_DIR, 'audio.vtt');
        if (!fs.existsSync(vttFile)) {
            // Fallback try with original name if whisper names it differently
            const files = fs.readdirSync(TEMP_DIR);
            const found = files.find(f => f.endsWith('.vtt'));
            if (!found) throw new Error("Whisper output not found.");
            fs.renameSync(path.join(TEMP_DIR, found), vttFile);
        }

        // 3. Parse VTT
        console.log('📝 Parsing transcript...');
        const content = fs.readFileSync(vttFile, 'utf-8');
        const lines = content.split('\n');

        const clips = [];
        let currentStart = null;
        let currentEnd = null;
        let currentText = [];

        const timeRegex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.match(timeRegex)) {
                if (currentStart && currentText.length > 0) {
                    clips.push(createClipEntry(currentStart, currentEnd, currentText.join(' ')));
                    currentText = [];
                }
                const match = line.match(timeRegex);
                currentStart = formatTime(match[1]);
                currentEnd = formatTime(match[2]);
            } else if (line && !line.includes('WEBVTT') && isNaN(line)) {
                const cleanLine = line.replace(/<[^>]*>/g, '');
                if (!currentText.includes(cleanLine) && cleanLine.length > 0) {
                    currentText.push(cleanLine);
                }
            }
        }
        if (currentStart && currentText.length > 0) {
            clips.push(createClipEntry(currentStart, currentEnd, currentText.join(' ')));
        }

        // 4. Output
        console.log('\n✅ COPY THIS INTO YOUR CONFIG:\n');
        console.log(`{`);
        console.log(`    videoUrl: "${VIDEO_URL}",`);
        console.log(`    clips: [`);
        clips.forEach(c => console.log(`        ${c},`));
        console.log(`    ]`);
        console.log(`}\n`);

        // Cleanup
        // fs.rmSync(TEMP_DIR, { recursive: true, force: true });

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

function formatTime(timestamp) {
    let [h, m, s] = timestamp.split(':');
    if (h === '00') {
        const seconds = parseFloat(s);
        // Round to 2 decimals for cleaner config
        const sClean = seconds.toFixed(2);
        const sStr = sClean.startsWith('0') && sClean.indexOf('.') === 1 ? sClean.substring(1) : sClean;
        // actually sticking to simple string slicing is safer to preserve structure
        // return `${parseInt(m)}:${s.slice(0, -1)}`; 
        return `${parseInt(m)}:${s.slice(0, 5)}`; // 01:23.456 -> 01:23.45
    }
    return `${parseInt(h)}:${m}:${s.slice(0, 5)}`;
}

function createClipEntry(start, end, text) {
    const title = text.replace(/"/g, '\\"').trim();
    return `{ title: "${title}", category: "${CATEGORY}", start: "${start}", end: "${end}", video: true }`;
}

main();
