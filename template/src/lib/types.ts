export interface Clip {
	id: string;
	title: string;
	category: string;
	audioSrc: string;
	videoSrc: string | null;
	thumbnailSrc: string;
}

export interface Database {
	categories: string[];
	clips: Clip[];
}

export interface SiteConfig {
	title: string;
	favicon: string;
	theme: string;
}
