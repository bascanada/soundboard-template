import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const VIDEO_URL = process.argv[2]; // Get URL from command line
const CATEGORY = "Culture";        // Default category for new clips
const TEMP_DIR = ".cache/subs";
// ---------------------

function main() {
    if (!VIDEO_URL) {
        console.error("Please provide a YouTube URL.");
        console.log("Usage: node scripts/draft-clips.js <YOUTUBE_URL>");
        return;
    }

    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    console.log(`🔍 Fetching subtitles for: ${VIDEO_URL}`);

    try {
        // 1. Download subtitles using yt-dlp (skip video download)
        // --write-auto-sub: Get auto-generated subs (often available when manual ones aren't)
        // --sub-lang fr: Prefer French
        // --convert-subs vtt: Ensure standard format
        const outputFile = path.join(TEMP_DIR, 'transcript');
        try {
            execSync(`yt-dlp --write-auto-sub --write-sub --sub-lang fr,en --skip-download --convert-subs vtt -o "${outputFile}" "${VIDEO_URL}"`, { stdio: 'inherit' });
        } catch (e) {
            console.warn("⚠️  yt-dlp reported an error (likely partial download failure). Checking for downloaded files...", e.message);
        }

        // Find the generated .vtt file
        const files = fs.readdirSync(TEMP_DIR);
        const vttFile = files.find(f => f.endsWith('.vtt'));

        if (!vttFile) {
            throw new Error("No subtitle file found. The video might not have captions.");
        }

        // 2. Parse the VTT file
        const content = fs.readFileSync(path.join(TEMP_DIR, vttFile), 'utf-8');
        const lines = content.split('\n');

        const clips = [];
        let currentStart = null;
        let currentEnd = null;
        let currentText = [];

        // Regex to match VTT timestamps: 00:00:00.000 --> 00:00:05.000
        const timeRegex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.match(timeRegex)) {
                // If we have a previous caption pending, push it
                if (currentStart && currentText.length > 0) {
                    clips.push(createClipEntry(currentStart, currentEnd, currentText.join(' ')));
                    currentText = [];
                }

                const match = line.match(timeRegex);
                currentStart = formatTime(match[1]);
                currentEnd = formatTime(match[2]);
            } else if (line && !line.includes('WEBVTT') && isNaN(line)) {
                // Clean up text (remove HTML tags like <c.color> etc often found in auto-subs)
                const cleanLine = line.replace(/<[^>]*>/g, '');
                // Avoid duplicates (auto-subs often repeat lines)
                if (!currentText.includes(cleanLine)) {
                    currentText.push(cleanLine);
                }
            }
        }

        // Push the last one
        if (currentStart && currentText.length > 0) {
            clips.push(createClipEntry(currentStart, currentEnd, currentText.join(' ')));
        }

        // 3. Output the result
        console.log('\n✅ COPY THIS INTO YOUR CONFIG:\n');
        console.log(`{`);
        console.log(`    videoUrl: "${VIDEO_URL}",`);
        console.log(`    clips: [`);
        clips.forEach(c => console.log(`        ${c},`));
        console.log(`    ]`);
        console.log(`}\n`);

        // Cleanup
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });

    } catch (e) {
        console.error("Error:", e.message);
    }
}

function formatTime(timestamp) {
    // Convert 00:00:01.540 to 0:01.54 to match your format
    // Removes leading hour zeros if they are 00
    let [h, m, s] = timestamp.split(':');
    if (h === '00') {
        return `${parseInt(m)}:${s.slice(0, -1)}`; // Trim last ms digit for brevity
    }
    return `${parseInt(h)}:${m}:${s.slice(0, -1)}`;
}

function createClipEntry(start, end, text) {
    // Sanitize title (escape quotes)
    const title = text.replace(/"/g, '\\"');
    return `{ title: "${title}", category: "${CATEGORY}", start: "${start}", end: "${end}", video: true }`;
}

main();
