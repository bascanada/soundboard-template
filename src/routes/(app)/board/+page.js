/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch, url }) => {
    const res = await fetch('/db.json');
    const db = await res.json();

    // Parse base64 encoded board data
    let clipIds = [];
    let boardId = null;
    const encoded = url.searchParams.get('b');

    if (encoded) {
        try {
            const decoded = atob(encoded);
            const data = JSON.parse(decoded);
            clipIds = data.clips || [];
            boardId = data.id || null;
        } catch {
            // Invalid base64 or JSON, ignore
        }
    }

    // Filter clips to only those in the URL, preserving order
    const boardClips = clipIds
        .map((/** @type {string} */ id) => db.clips.find((/** @type {{ id: string }} */ c) => c.id === id))
        .filter(Boolean);

    return {
        db,
        clipIds,
        boardClips,
        boardId
    };
};
