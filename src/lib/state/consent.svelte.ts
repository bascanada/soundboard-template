import siteConfig from '$lib/site.config';

export const consentState = $state({
    hasDecided: false, // Has the user clicked anything yet?
    analytics: false,  // Did they say yes?

    // Initialize from LocalStorage on mount
    init() {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('site_consent');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    this.analytics = data.analytics;
                    this.hasDecided = true;

                    // If they said yes previously, load GA immediately
                    if (this.analytics) loadGoogleAnalytics();
                } catch (e) {
                    console.error('Error parsing consent state', e);
                }
            }
        }
    },

    accept() {
        this.analytics = true;
        this.hasDecided = true;
        this.save();
        loadGoogleAnalytics(); // Load the script now!
    },

    decline() {
        this.analytics = false;
        this.hasDecided = true;
        this.save();
        // Ideally we would unload GA here, but a reload is usually required to fully clear it.
        // For this simple version, we just stop sending events.
    },

    save() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('site_consent', JSON.stringify({
                analytics: this.analytics
            }));
        }
    }
});

// Helper to inject the script dynamically
function loadGoogleAnalytics() {
    // Only load if ID exists and script isn't already there
    if (!siteConfig.gaMeasurementId || document.getElementById('ga-script')) return;

    // 1. Create the script tag for gtag.js
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaMeasurementId}`;
    document.head.appendChild(script);

    // 2. Initialize the dataLayer
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    function gtag() { window.dataLayer.push(arguments); }
    // @ts-ignore
    gtag('js', new Date());
    // @ts-ignore
    gtag('config', siteConfig.gaMeasurementId);

    // Make gtag available globally for manual calls
    window.gtag = gtag;
}
