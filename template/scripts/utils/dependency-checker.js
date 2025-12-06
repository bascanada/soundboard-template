import { execSync } from 'child_process';

export function checkDependencies() {
    console.log('Checking dependencies...');
    let missing = [];

    try {
        execSync('yt-dlp --version', { stdio: 'ignore' });
    } catch (e) {
        missing.push('yt-dlp');
    }

    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
    } catch (e) {
        missing.push('ffmpeg');
    }

    if (missing.length > 0) {
        console.error('❌ Missing dependencies:');
        if (missing.includes('yt-dlp')) {
            console.error('  - yt-dlp: Required to download videos. Install it from https://github.com/yt-dlp/yt-dlp#installation');
        }
        if (missing.includes('ffmpeg')) {
            console.error('  - ffmpeg: Required to process media. Install it from https://ffmpeg.org/download.html');
        }
        process.exit(1);
    }

    console.log('✅ Dependencies found.');
}
