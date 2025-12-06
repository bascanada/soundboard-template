# Soundboard Template 🎶

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/YOUR_REPO/deploy.yml?branch=main&style=for-the-badge)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)

**SoundboardTemplate** is an open-source starter kit to create and deploy modern, blazing-fast soundboard websites, extracted directly from YouTube videos.

## ✨ Features

* **100% Static:** No backend, no database.
* **Automated Extraction:** Scripts to download and process clips from YouTube.
* **Modern UI:** SvelteKit + Skeleton UI + Tailwind CSS.
* **Responsive:** Works on mobile and desktop.

## 🚀 Getting Started

### 1. Installation

```bash
cd template
npm install
```

### 2. Configuration

Edit `config.js` to define your clips:

```javascript
export default {
  sources: [
    {
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      clips: [
        { title: "Chorus", category: "Music", start: "0:42", end: "1:15" }
      ]
    }
  ]
};
```

Edit `src/lib/site.config.js` for site metadata:

```javascript
export default {
  title: "My Soundboard",
  theme: "cerberus"
};
```

### 3. Generate Clips
Run the generation script to download videos and create clips:

```bash
npm run generate
```

This script will:
1.  Check for `yt-dlp` and `ffmpeg`.
2.  Download videos defined in `config.js` to `.cache/downloads`.
3.  Extract audio/video clips and thumbnails to `static/media`.
4.  Generate `static/db.json`.

**Caching:**
- Downloaded videos are cached in `.cache/downloads`.
- Clips are only re-processed if their configuration (start/end time) changes.
- Orphaned clips (removed from config) are automatically deleted.

### 4. Development

```bash
npm run dev
```

### 5. Deployment

#### GitHub Pages
The included `.github/workflows/deploy.yml` will automatically deploy to GitHub Pages on push to `main`.
Ensure you have enabled GitHub Pages in your repository settings (Source: GitHub Actions).

#### Vercel
Import the project into Vercel. It should auto-detect SvelteKit.
Override the build command if necessary: `cd template && npm install && npm run generate && npm run build`.
