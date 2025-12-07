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

All configuration files are located in the `config/` directory.

#### Clips Configuration (`config/clips.js`)
Define your video sources and clips here.

```javascript
export default [
  {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    clips: [
      {
        id: "the-chorus-1",
        title: "The chorus",
        start: "00:43",
        end: "00:53",
        category: "Music"
      }
    ]
  }
];
```

#### Site Configuration (`config/site.js`)
Customize your site's metadata, theme, and PWA settings.

```javascript
export default {
  title: "My Soundboard",
  description: "Best clips ever",
  theme: "cerberus", // Skeleton UI theme
  // ...
};
```

### 3. Generate Clips
Run the generation script to download videos and create clips:

```bash
npm run generate
```

This script will:
1.  Check for `yt-dlp` and `ffmpeg`.
2.  Download videos defined in `config/clips.js` to `.cache/downloads`.
3.  Extract audio/video clips and thumbnails to `static/media`.
4.  Generate `static/db.json` and `static/manifest.json`.

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
