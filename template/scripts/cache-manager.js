import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class CacheManager {
    constructor(cacheDir) {
        this.cacheDir = cacheDir;
        this.stateFile = path.join(cacheDir, 'state.json');
        this.state = this.loadState();
    }

    loadState() {
        if (fs.existsSync(this.stateFile)) {
            try {
                return JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
            } catch (e) {
                console.warn('⚠️ Could not read cache state, starting fresh.');
            }
        }
        return { clips: {} };
    }

    saveState() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
        fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    }

    /**
     * Generates a hash for the clip configuration.
     * If the hash matches the cached hash, the clip is unchanged.
     */
    generateSignature(clip) {
        const data = JSON.stringify({
            id: clip.id,
            start: clip.start,
            end: clip.end,
            video: clip.video || false,
            // We don't include title/category in the hash because changing them
            // doesn't require re-processing the media files.
        });
        return crypto.createHash('md5').update(data).digest('hex');
    }

    shouldProcess(clip) {
        const signature = this.generateSignature(clip);
        const cached = this.state.clips[clip.id];

        if (cached && cached.signature === signature) {
            return false; // Unchanged
        }
        return true; // New or changed
    }

    markProcessed(clip) {
        const signature = this.generateSignature(clip);
        this.state.clips[clip.id] = {
            signature,
            lastProcessed: Date.now()
        };
        this.saveState();
    }

    /**
     * Returns a list of clip IDs that are in the cache but not in the provided list of current clips.
     */
    getOrphanedClips(currentClips) {
        const currentIds = new Set(currentClips.map(c => c.id));
        const cachedIds = Object.keys(this.state.clips);
        return cachedIds.filter(id => !currentIds.has(id));
    }

    removeClip(clipId) {
        delete this.state.clips[clipId];
        this.saveState();
    }
}
