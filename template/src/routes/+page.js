/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
    const res = await fetch('/db.json');
    const db = await res.json();
    return {
        db
    };
};
