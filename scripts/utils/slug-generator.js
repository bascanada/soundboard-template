/**
 * Generates a unique slug for a clip based on its title.
 * @param {string} title - The title of the clip.
 * @param {Set<string>} existingIds - A set of already generated IDs to ensure uniqueness.
 * @returns {string} The generated unique slug.
 */
export function generateSlug(title, existingIds) {
    // 1. Convert to lowercase
    let slug = title.toLowerCase();

    // 2. Slugify: replace spaces with hyphens, remove special characters
    slug = slug
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end

    if (!slug) slug = 'clip';

    // 3. Append unique incrementing number
    let counter = 1;
    let uniqueSlug = `${slug}-${counter}`;

    while (existingIds.has(uniqueSlug)) {
        counter++;
        uniqueSlug = `${slug}-${counter}`;
    }

    existingIds.add(uniqueSlug);
    return uniqueSlug;
}
