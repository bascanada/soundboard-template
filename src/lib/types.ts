export interface Clip {
	id: string;
	title: string;
	category: string;
	audioSrc: string;
	videoSrc: string | null;
	thumbnailSrc: string;
	start?: string; // Original start time string (e.g. "0:42")
	end?: string;   // Original end time string
}

export interface Database {
	categories: string[];
	clips: Clip[];
}

export interface SiteConfig {
	title: string;
	description: string;
	keywords: string[];
	favicon: string;
	theme: string;
	author: string;
	pwa: {
		name: string;
		short_name: string;
		start_url: string;
		display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
		background_color: string;
		theme_color: string;
	};
}
