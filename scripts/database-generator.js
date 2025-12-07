import fs from 'fs';
import path from 'path';

export function generateDatabase(clips, outputDir) {
    console.log('💾 Generating database...');

    const categories = new Set();
    clips.forEach(clip => {
        if (clip.category) {
            categories.add(clip.category);
        }
    });

    const db = {
        categories: Array.from(categories).sort(),
        clips: clips
    };

    const dbPath = path.join(outputDir, 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    console.log(`✅ Database saved to ${dbPath}`);
    console.log(`   - Total Clips: ${clips.length}`);
    console.log(`   - Categories: ${db.categories.length}`);
}
