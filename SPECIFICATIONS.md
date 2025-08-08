# Technical Specifications: SounboardTemplate

This document details the architecture and functionality of the SounboardTemplate project. It serves as a guide for implementation and maintenance.

---

### 1. Vision & Project Structure

* **Objective:** To provide an open-source starter kit that allows anyone to easily create and publish a modern, high-performance, and customizable soundboard website.
* **Philosophy:** 100% static. The project generates a blazing-fast website with no backend or database, which can be hosted for free on platforms like GitHub Pages, Vercel, or Netlify.
* **Project Language:** All code, comments, and documentation will be in **English**.
* **Repository Structure:**
    * `/template`: The core SvelteKit project, ready to be copied and customized.
    * `/example`: A complete example site (e.g., about Marc Tanguay) that uses the template. It serves as a demo and will be deployed automatically via GitHub Actions.

---

### 2. Part 1: The Extraction Scripts

The scripts automate the creation of the soundboard's content.

* **Workflow:**
    1.  The user configures the `config.js` file at the project root.
    2.  They run the `npm run generate` command.
    3.  The scripts download the videos, cut the clips, generate thumbnails, compress the media, and create the entire required file structure within the `static` directory.

#### 2.1. Implementation Details & Requirements

* **Technology:** The scripts will be written in **Node.js** to maintain a consistent JavaScript/TypeScript ecosystem. They will use Node's `child_process` module to execute command-line tools.
* **Dependencies:** The user must have **`yt-dlp`** and **`ffmpeg`** installed and available in their system's PATH. The script will check for the existence of these tools on startup and provide a clear error message with installation links if they are not found.
* **Error Handling:**
    * The script will wrap critical operations (video download, clip processing) in `try...catch` blocks.
    * If a single clip fails to process (e.g., invalid timestamp), the script will log a detailed error to the console and **continue to the next clip**.
    * A summary of any failed clips will be displayed at the end of the process.
* **Clip ID Generation:**
    * Clip IDs are generated automatically to ensure uniqueness.
    * **Algorithm:**
        1.  Take the clip's `title` (e.g., "First Clip!").
        2.  Convert to lowercase: `"first clip!"`.
        3.  "Slugify" it by replacing spaces with hyphens and removing special characters: `"first-clip"`.
        4.  Append a unique, incrementing number (e.g., `-1`, `-2`) to guarantee no duplicates across the entire project.
    * **Example:** `first-clip-1`, `another-great-clip-2`.

* **Configuration File (`config.js`):**
    ```javascript
    export default {
      sources: [
        {
          videoUrl: "[https://www.youtube.com/watch?v=VIDEO_ID_1](https://www.youtube.com/watch?v=VIDEO_ID_1)",
          clips: [
            { title: "First clip", category: "Category A", start: "0:42", end: "0:45" },
            { title: "Clip with video", category: "Category B", start: "1:52", end: "1:58", video: true },
          ]
        },
        // ... other video sources
      ]
    };
    ```

* **Output Structure (in `static/`):**
    The scripts generate a modular file structure and a `db.json` file that serves as the site's database.

    * **Folders (`static/media/`):**
        ```
        media/
        ├── first-clip-1/
        │   ├── audio.mp3
        │   └── thumbnail.jpg
        └── clip-with-video-2/
            ├── audio.mp3
            ├── video.webm
            └── thumbnail.jpg
        ```

    * **Database (`static/db.json`):**
        ```json
        {
          "categories": ["Category A", "Category B"],
          "clips": [
            {
              "id": "first-clip-1",
              "title": "First clip",
              "category": "Category A",
              "audioSrc": "/media/first-clip-1/audio.mp3",
              "videoSrc": null,
              "thumbnailSrc": "/media/first-clip-1/thumbnail.jpg"
            }
            // ... other clips
          ]
        }
        ```

---

### 3. Part 2: The SvelteKit Template

The template is the customizable website that displays the clips.

* **Technical Stack:**
    * **Framework:** SvelteKit
    * **Language:** TypeScript
    * **Styling:** Tailwind CSS
    * **UI Components:** Skeleton UI (**Must use v3 documentation**)

* **Styling Guidelines:**
    * **Priority Order:** Styling must follow this hierarchy to ensure consistency and maintainability:
        1.  **Skeleton UI Components & Props:** Always prefer using pre-built components and their props.
        2.  **Tailwind CSS Utility Classes:** Use utility classes for custom layouts, spacing, and fine-tuning.
        3.  **Custom CSS Classes:** To be used only as a last resort for complex styles not achievable with the above methods (e.g., complex animations, the circular progress bar).

* **Site Configuration (`src/lib/site.config.js`):**
    A single file to customize the site's appearance. This information is applied at **compile time**.
    ```javascript
    export default {
      title: "My Awesome Soundboard",
      favicon: "/favicon.png", // Placed in /static
      theme: "modern" // Name of a Skeleton theme (e.g., 'modern', 'rocket', etc.)
    };
    ```

* **Key Components & Logic:**
    * **`CategoryScroller.svelte`:**
        * Displays categories as clickable tags.
        * Allows for **multiple category selection** to filter clips.
        * If no category is selected, all clips are displayed.

    * **`Clip.svelte` ("Story" Concept):**
        * **Visuals:** A circular bubble with a colored border. The clip's thumbnail is displayed in the center.
        * **Interaction:** On click:
            1.  The audio (`audio.mp3`) plays.
            2.  If a video (`video.webm`) exists, it replaces the thumbnail and plays **directly inside the bubble**.
            3.  The **bubble's border** transforms into a **circular progress bar** indicating playback progress.

---

### 4. Deployment

* The example site located in the `/example` directory will be automatically built and deployed to **GitHub Pages** on every push to the main branch, using a **GitHub Actions** pipeline.

