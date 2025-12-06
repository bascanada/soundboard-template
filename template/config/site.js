/** @type {import('./types').SiteConfig} */
export default {
    title: "My Awesome Soundboard",
    description: "A collection of my favorite sound clips.",
    keywords: ["soundboard", "clips", "funny"],
    favicon: "/favicon.png",
    theme: "cerberus",
    author: "Soundboard User",
    pwa: {
        name: "My Awesome Soundboard",
        short_name: "Soundboard",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff"
    }
};
