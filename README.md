# Soundboard Template 🎵

A **backend-less, Jamstack** soundboard template built with **SvelteKit**. This project is designed to be purely static: **no database, no API servers, just files.**

All data is generated at build time from your configuration and static assets. This means:
- **Zero maintenance**: No servers to patch or databases to scale.
- **Unbeatable speed**: Served entirely from the edge (CDN).
- **Free hosting**: Deploys easily to Cloudflare Pages, Vercel, or GitHub Pages.

## ✨ Features

- **🚀 Backend-less Architecture**: Powered entirely by static files (`.json`, `.mp3`, `.webm`).
- **📦 Video-to-Audio Pipeline**: Automated build scripts download YouTube/Social links, extract audio, and crop clips.
- **⚡ Jamstack Performance**: Pre-rendered and optimized for instant loading.
- **🎨 Theming**: Comes with built-in theme switching (Skeleton UI) and dark/light mode support.
- **🔎 Search & Filter**: Instantly filter clips by category or title (performed client-side).
- **📊 Analytics**: Integrated Google Analytics support.
- **📱 PWA Support**: Installable on mobile and desktop.
- **🤖 Decoupled Configuration**: Keep your site content separate from the template code.

## 🛠️ How to Fork & Setup

This template is designed to be forked. To keep your unique configuration (clips, site settings) separate from the template code (allowing you to pull updates easily), we recommend the following workflow:

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy of `soundboard-template`.

### 2. Setup Configuration

You have two options for configuration:

#### Option A: External Configuration (Recommended)
Create a **separate repository** (e.g., `my-soundboard-config`) to hold your configuration files. This prevents merge conflicts when you pull updates from the main template.

Your config repo should look like this:
```
my-soundboard-config/
├── config/
│   ├── clips.json  # Your clips definitions
│   └── site.json   # Your site metadata (title, icons, etc.)
└── ...
```

#### Option B: Local Configuration
Modify the files directly in `soundboard-template/config/`. Note that this might cause conflicts if you try to update the template later.

### 3. Setup Deployment (Cloudflare Pages)

We recommend **Cloudflare Pages** for free and fast hosting.

1.  Log in to the Cloudflare Dashboard and go to **Pages**.
2.  Connect your GitHub account and select your forked `soundboard-template` repository.
3.  **Build Settings**:
    - **Framework Preset**: SvelteKit
    - **Build Command**: `npm run build`
    - **Output Directory**: `.svelte-kit/output` (or `build` if using adapter-static)
4.  **Environment Variables**:
    - `NODE_VERSION`: `20` (or compatible version)
    - `CONFIG_DIR`: Set this to the path where your config is located.
        - *Note*: If you use **Option A (External Config)**, you will need to clone your config repo during the build process or use a submodule.
        - *Simpler Approach for Cloudflare*: If using Cloudflare, it's often easier to just commit your config to the main repo (Option B) OR use a Git Submodule for the `config` folder pointing to your private config repo.

### 4. Setup Pipeline Cookies (YouTube DL)

To download high-quality audio from some YouTube videos, `yt-dlp` might need cookies to bypass bot detection or age restrictions.

1.  **Extract Cookies**: Use a browser extension like "Get cookies.txt LOCALLY" to export cookies from YouTube while logged in.
2.  **Save Cookies**: Rename the file to `cookies.txt` and place it in the root or a secure location available to the build script.
3.  **CI/CD**: If running in GitHub Actions, you can store the cookies as a secret and write them to a file during the build.

> **Guide**: [How to use cookies with yt-dlp](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#cookies)

### 5. Setup Google Analytics (Optional)

To track which clips are played most often:

1.  Create a **Google Analytics 4** property.
2.  Create a **Service Account** in Google Cloud Console and give it access to your GA4 property.
3.  Download the JSON credentials.
4.  Set the following Environment Variables in your deployment (e.g., Cloudflare or .env):
    - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: The content of your service account JSON file.
    - `GA_PROPERTY_ID`: Your GA4 Property ID (numeric).

## 🧬 Configuration Reference

### `config/site.json`
Metadata for your site.
```json
{
  "title": "My Soundboard",
  "meta": {
    "description": "The best sounds."
  },
  "pwa": { ... }
}
```

### `config/clips.json`
Define your clips.
```json
[
  {
    "videoUrl": "https://youtube.com/watch?v=...",
    "clips": [
      {
        "id": "wow-1",
        "title": "Wow!",
        "start": "00:05",
        "end": "00:08",
        "category": "Memes"
      }
    ]
  }
]
```
