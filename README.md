# SounboardTemplate 🎶

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/YOUR_REPO/deploy.yml?branch=main&style=for-the-badge)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)

**SounboardTemplate** is an open-source starter kit to create and deploy modern, blazing-fast soundboard websites, extracted directly from YouTube videos (or other sources).

The goal is to make creating a themed soundboard (about a politician, an influencer, a meme, etc.) as simple as filling out a configuration file.

➡️ **[See Live Demo](https://YOUR_USERNAME.github.io/YOUR_REPO/)** ⬅️

---

### ✨ Features

* **100% Static:** No backend, no database. Just pure HTML/CSS/JS files for maximum performance and free hosting.
* **Automated Extraction Scripts:** Provide YouTube links and timestamps, and let the scripts download, cut, and compress all your clips.
* **Modern "Story" UI:** Clips are presented as interactive bubbles, inspired by Instagram stories, with the video playing inside and a circular progress bar.
* **Easy Customization:** Change the title, color theme, and favicon by editing a single configuration file.
* **Continuous Deployment:** A GitHub Actions pipeline is pre-configured to deploy your site to GitHub Pages on every update.

---

### 🚀 How to Create Your Own Soundboard

#### Step 1: Use this template

Click the green **"Use this template"** button at the top of the GitHub page to create your own copy of the repository.

#### Step 2: Configure your clips

Open the `config.js` file at the root of the project. This is where you list the source videos and the clips you want to extract.

```javascript
// config.js
export default {
  sources: [
    {
      videoUrl: "[https://www.youtube.com/watch?v=dQw4w9WgXcQ](https://www.youtube.com/watch?v=dQw4w9WgXcQ)",
      clips: [
        { title: "The chorus", category: "Music", start: "0:42", end: "1:15" },
        { title: "The dance", category: "Dance", start: "1:52", end: "1:58", video: true },
      ]
    },
  ]
};
```

#### Step 3: Generate the media

Once your configuration is ready, run the following command. The scripts will download and prepare all your files.

```bash
npm install
npm run generate
```

#### Step 4: Customize the site's appearance

Open `src/lib/site.config.js` to change the title, color theme (from the [Skeleton UI themes](https://www.skeleton.dev/docs/themes)), and favicon.

```javascript
// src/lib/site.config.js
export default {
  title: "Rick Astley's Soundboard",
  favicon: "/favicon.png",
  theme: "vintage"
};
```

#### Step 5: Run the site locally

To see the result live while you develop:

```bash
npm run dev
```

---

### 📁 Repository Structure

* `/template`: The base SvelteKit project, ready to be copied. **This is where you should work.**
* `/example`: A complete example site that uses the template. This folder is used for the demo deployed on GitHub Pages.

---

### 🤝 Contributing

This project is open-source and contributions are welcome! Feel free to open an issue to report a bug or suggest a new feature.

### 📄 License

This project is licensed under the **MIT License**.

