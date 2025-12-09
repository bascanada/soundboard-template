import { scale } from "svelte/transition";

export default {
    sources: [
        {
            videoUrl: "https://www.youtube.com/watch?v=pJjtnyg_nVQ",
            clips: [
                { title: "J'ai le droit", category: "Jambon", start: "0:01", end: "0:05", video: true },
                { title: "Huile Usée", category: "Jambon", start: "0:11", end: "0:15", video: true },
                { title: "Perdu Lazy-Boy", category: "Madame", start: "0:30.8", end: "0:32.5", video: true, scale: 1.25 },
                { title: "Retour Bête Noire", category: "Madame", start: "0:35.5", end: "0:41.5", video: true, scale: 1.25 },
                { title: "Chier dessus", category: "Parodie", start: "2:11.5", end: "2:15", video: true, scale: 1.75 },
                { title: "Doight dans le cul", category: "Parodie", start: "2:15.01", end: "2:18", video: true, scale: 1.75 },
                { title: "Roux méchant", category: "Parodie", start: "2:32", end: "2:34", video: true, scale: 1.75 },
                { title: "On est des roux", category: "Parodie", start: "2:38", end: "2:39.5", video: true, scale: 1.75 },
                { title: "Tasse toi", category: "Parodie", start: "2:43", end: "2:45", video: true, scale: 1.75 },
                { title: "Vas y mon roux", category: "Parodie", start: "2:45.8", end: "2:47.7", video: true, scale: 1.75 },


                { title: "Femme vomis", category: "Parodie", start: "3:22.8", end: "3:26.8", video: true, scale: 1.75 },
                { title: "Viens sur toi", category: "Parodie", start: "3:43.8", end: "3:45.5", video: true, scale: 1.75 },

                { title: "Une fois au chalet", category: "Vieux Criss", start: "4:01.8", end: "4:04.01", video: true, scale: 1.25 },


                { title: "Kevin continue", category: "Jambon", start: "4:04.8", end: "4:06.8", video: true, scale: 1.25 },


                { title: "Bitch assis", category: "New Generation", start: "11:53.5", end: "11:54.3", video: true, scale: 1.25 },
                { title: "Bitch assis 2", category: "New Generation", start: "11:53.5", end: "11:54.3", video: true, scale: 1.25 },


            ]
        }
    ]
};
