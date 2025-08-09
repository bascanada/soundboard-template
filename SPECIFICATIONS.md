# Technical Specifications: SounboardTemplate

This document details the architecture and functionality of the SounboardTemplate project. It serves as a guide for implementation and maintenance.

### 1. Vision & Project Structure

* **Objective:** To provide an open-source starter kit that allows anyone to easily create and publish a modern, high-performance, and customizable soundboard website.

* **Philosophy:** 100% static. The project generates a blazing-fast website with no backend or database, which can be hosted for free on platforms like GitHub Pages, Vercel, or Netlify.

* **Project Language:** All code, comments, and documentation will be in **English**.

* **Repository Structure:**

  * `/template`: The core SvelteKit project, ready to be copied and customized.

  * `/example`: A complete example site (e.g., about Marc Tanguay) that uses the template. It serves as a demo and will be deployed automatically via GitHub Actions.

### 2. Part 1: The Extraction Scripts

The scripts automate the creation of the soundboard's content.

* **Workflow:**

  1. The user configures the `config.js` file at the project root.

  2. They run the `npm run generate` command.

  3. The scripts download the videos, cut the clips, generate thumbnails, compress the media, and create the entire required file structure within the `static` directory.

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

    1. Take the clip's `title` (e.g., "First Clip!").

    2. Convert to lowercase: `"first clip!"`.

    3. "Slugify" it by replacing spaces with hyphens and removing special characters: `"first-clip"`.

    4. Append a unique, incrementing number (e.g., `-1`, `-2`) to guarantee no duplicates across the entire project.

  * **Example:** `first-clip-1`, `another-great-clip-2`.

* **Audio Handling in Video Clips:**

  * To ensure perfect audio/video synchronization and simplify the frontend player, the audio track **will be included** directly within the `.webm` file.

  * While this creates minor data redundancy (audio exists in both the `.mp3` and `.webm`), it eliminates significant technical complexity and potential playback issues associated with syncing separate `<audio>` and `<video>` elements.

#### 2.2. FFmpeg Commands

* **For `audio.mp3`:**

  ```
  ffmpeg -i "input.mp4" -ss [START] -to [END] -vn -c:a libmp3lame -q:a 2 "output/audio.mp3"
  
  ```

* **For `video.webm`:**

  ```
  ffmpeg -i "input.mp4" -ss [START] -to [END] -c:v libvpx-vp9 -crf 31 -b:v 0 -c:a libopus -b:a 128k "output/video.webm"
  
  ```

* **For `thumbnail.jpg`:**

  ```
  ffmpeg -ss [START] -i "input.mp4" -vframes 1 -q:v 2 "output/thumbnail.jpg"
  
  ```

#### 2.3. Configuration File (`config.js`)

```
export default {
  sources: [
    {
      videoUrl: "[https://www.youtube.com/watch?v=VIDEO_ID_1](https://www.youtube.com/watch?v=VIDEO_ID_1)",
      clips: [
        { title: "First clip", category: "Category A", start: "0:42", end: "0:45" },
        { title: "Clip with video", category: "Category B", start: "1:52", end: "1:58", video: true },
      ]
    },
  ]
};

```

### 3. Part 2: The SvelteKit Template

* **Technical Stack:**

  * **Framework:** SvelteKit

  * **Language:** TypeScript

  * **Styling:** Tailwind CSS

  * **UI Components:** Skeleton UI (**Must use v3 documentation**)

* **Styling Guidelines:**

  * **Priority Order:**

    1. **Skeleton UI Components & Props**

    2. **Tailwind CSS Utility Classes**

    3. **Custom CSS Classes** (only as a last resort)

* **Site Configuration (`src/lib/site.config.js`):**

  ```
  export default {
    title: "My Awesome Soundboard",
    favicon: "/favicon.png",
    theme: "modern"
  };
  
  ```

* **Key Components & Logic:**

  * **`CategoryScroller.svelte`:** Allows multiple category selection.

  * `Clip.svelte` ("Story" Concept): See detailed specification below.

#### 3.1. Core TypeScript Interfaces

To ensure type safety throughout the SvelteKit application, the following interfaces will be defined (e.g., in a `src/lib/types.ts` file).

* **`Clip`**: Represents a single soundboard clip.
    ```typescript
    export interface Clip {
      id: string;
      title: string;
      category: string;
      audioSrc: string;
      videoSrc: string | null;
      thumbnailSrc: string;
    }
    ```

* **`Database`**: Defines the structure of the `db.json` file.
    ```typescript
    import type { Clip } from './types';

    export interface Database {
      categories: string[];
      clips: Clip[];
    }
    ```

* **`SiteConfig`**: Defines the structure of the `site.config.js` file.
    ```typescript
    export interface SiteConfig {
      title: string;
      favicon: string;
      theme: string;
    }
    ```

#### 3.2. Component Specification: `Clip.svelte`

This component is the core interactive element of the soundboard.

* **Structure (HTML/Svelte):**

  * A main container `<div>` with a fixed size (e.g., `100px` x `100px`) will act as the bounding box.
  * Inside, a `<div>` will contain the media (`<img>` for the thumbnail or `<video>`). This div will be circular and slightly smaller than the container to create a margin.
  * An `<svg>` element will be positioned absolutely on top of everything, with the same dimensions as the container, to draw the border and progress animation.

* **States:** The component will manage several states: `idle`, `playing`, `paused`, `viewed`.

* **Visuals & Styling (SVG Approach):**

  * The SVG will contain two `<circle>` elements and a `<defs>` section for the gradient.
  * **Gradient Definition:** A `<linearGradient>` will be defined in `<defs>` with an ID (e.g., `story-gradient`). It will use the primary and secondary colors from the selected Skeleton theme.
  * **Background Circle:** A full circle with a muted grey stroke (e.g., `surface-400`). This is the "track" for the progress bar.
  * **Progress Circle:** A second circle placed on top.
    * **Idle State:** Its `stroke` will be set to `url(#story-gradient)`. The `stroke-dasharray` and `stroke-dashoffset` will be set to `0` so the full gradient border is visible.
    * **Viewed State:** The `stroke` will be changed to the same muted grey as the background, making it appear as a single grey ring.

* **Behavior & Animation:**

  * **On First Click:**
    * The component's state changes to `playing`.
    * If a video exists, it replaces the thumbnail and starts playing.
    * The corresponding `.mp3` audio starts playing.
    * The progress animation begins.
  * **Progress Bar Animation (SVG `stroke-dashoffset`):**
    * The animation will be driven by a Svelte reactive statement or `requestAnimationFrame`.
    * The script will calculate the circle's circumference (`C = 2 * π * r`).
    * The `stroke-dasharray` of the progress circle will be set to `C`.
    * On each frame, the script will get the audio's `currentTime` and `duration` to calculate a progress percentage (`P`).
    * The `stroke-dashoffset` will be dynamically updated using the formula: `offset = C * (1 - P)`. This will "undraw" the dash, revealing the grey track underneath and creating the progress effect.
  * **On Clip End:** The audio `ended` event transitions the component's state to `viewed`, and the SVG progress circle's stroke is set to the final grey color.

#### 3.3. Interaction Logic & Edge Cases

* **Category Filtering Logic:**
  * When multiple categories are selected, the filter uses **OR logic**.
  * A clip will be displayed if its category matches **any** of the selected categories.
  * If no categories are selected, all clips are displayed.

* **Playback Model (Single Clip Focus):** To prevent auditory chaos and create a predictable experience, **only one clip can be playing at a time.**

  * When a user clicks a new clip, any currently `playing` or `paused` clip is immediately stopped and reset to its `idle` (or `viewed`) state.

* **Click Behavior:**

  * **Clicking an `idle` clip:** Starts playback and transitions the state to `playing`.

  * **Clicking a `playing` clip:** Pauses playback and transitions the state to `paused`.

  * **Clicking a `paused` clip:** Resumes playback and transitions the state back to `playing`.

* **Progress Bar State:** The progress bar animation loop (`requestAnimationFrame` or Svelte reactivity) is directly tied to the `playing` state.

  * The animation **must pause** when the clip's state is `paused`.

  * The animation resumes when the clip's state returns to `playing`.

* **Mobile Autoplay Restrictions (iOS/Safari):** The application is designed to be fully compliant with mobile browser restrictions.

  * Playback is **never** initiated automatically on page load.

  * The `.play()` method for any audio or video element is **only** called as a direct result of a user `click` or `tap` event on a `Clip.svelte` component. This satisfies the user gesture requirement.

