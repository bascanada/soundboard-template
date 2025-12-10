const defaults = {
    volume: 1.0,
    podSize: 1.0, // Scale factor: 0.5 to 2.0
    isOpen: false,
    darkMode: true
};

function loadSettings() {
    if (typeof localStorage === 'undefined') return defaults;
    try {
        const stored = localStorage.getItem('settings');
        if (stored) {
            return { ...defaults, ...JSON.parse(stored) };
        }
    } catch {
        // ignore error
    }
    return defaults;
}

export const settingsState = $state(loadSettings());

export function saveSettings() {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('settings', JSON.stringify(settingsState));
    }
}
