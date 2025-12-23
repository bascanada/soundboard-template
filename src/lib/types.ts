export interface ClipStats {
	'7d': number;
	'30d': number;
	'all': number;
}

export interface Clip {
	id: string;
	title: string;
	category: string;
	audioSrc: string;
	videoSrc: string | null;
	thumbnailSrc: string;
	start?: string; // Original start time string (e.g. "0:42")
	end?: string;   // Original end time string
	scale?: number; // Optional zoom scale (e.g. 1.5)
	playCount?: number; // Default sort stat (30d)
	stats?: ClipStats;  // All time period stats
}

export interface StatLabels {
	'7d': string;
	'30d': string;
	'all': string;
}

export interface Database {
	categories: string[];
	clips: Clip[];
	statLabels?: StatLabels;
}

export interface SiteConfig {
	title: string;
	gaMeasurementId?: string;
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
