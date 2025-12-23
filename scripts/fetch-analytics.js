import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

// Time periods to fetch
const TIME_PERIODS = {
    '7d': { startDate: '7daysAgo', endDate: 'today', label: '7 derniers jours' },
    '30d': { startDate: '30daysAgo', endDate: 'today', label: '30 derniers jours' },
    'all': { startDate: '2020-01-01', endDate: 'today', label: 'Depuis toujours' }
};

/**
 * Fetch clip stats for a specific time period
 */
async function fetchPeriodStats(analyticsDataClient, propertyId, period) {
    const [response] = await analyticsDataClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: period.startDate, endDate: period.endDate }],
        dimensions: [{ name: 'customEvent:clip_id' }],
        metrics: [{ name: 'eventCount' }],
    });

    const stats = {};
    if (response.rows) {
        response.rows.forEach((row) => {
            const clipId = row.dimensionValues[0].value;
            const count = parseInt(row.metricValues[0].value, 10);
            stats[clipId] = count;
        });
    }
    return stats;
}

/**
 * Get clip stats for all time periods
 * Returns: {
 *   periods: { '7d': {...}, '30d': {...}, 'all': {...} },
 *   combined: { 'clip-id': { '7d': 10, '30d': 50, 'all': 200 } }
 * }
 */
export async function getClipStats() {
    // If no credentials, return empty stats (dev mode or first run)
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !process.env.GA_PROPERTY_ID) {
        console.warn('⚠️  Analytics credentials missing. Skipping popularity fetch.');
        return { periods: {}, combined: {}, labels: TIME_PERIODS };
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

        console.log('📊 Fetching analytics data from Google...');

        // Sanitize Property ID
        let propertyId = process.env.GA_PROPERTY_ID;
        if (propertyId.startsWith('G-')) {
            console.warn(`⚠️  Warning: GA_PROPERTY_ID ('${propertyId}') looks like a Measurement ID.`);
            console.warn(`   The Data API expects a numeric Property ID from GA4 Admin > Property Settings.`);
        }
        if (!propertyId.startsWith('properties/')) {
            propertyId = `properties/${propertyId}`;
        }

        // Fetch all time periods
        const periods = {};
        const combined = {};

        for (const [key, period] of Object.entries(TIME_PERIODS)) {
            console.log(`   📈 Fetching ${period.label}...`);
            periods[key] = await fetchPeriodStats(analyticsDataClient, propertyId, period);

            // Build combined stats per clip
            for (const [clipId, count] of Object.entries(periods[key])) {
                if (!combined[clipId]) combined[clipId] = {};
                combined[clipId][key] = count;
            }
        }

        const totalClips = Object.keys(combined).length;
        console.log(`   ✅ Retrieved stats for ${totalClips} clips across ${Object.keys(TIME_PERIODS).length} time periods.`);

        return { periods, combined, labels: TIME_PERIODS };

    } catch (error) {
        if (error.message.includes('INVALID_ARGUMENT')) {
            console.warn('⚠️  Analytics Error: Custom dimension "clip_id" not found or invalid.');
            console.warn('   Create it in GA4: Admin > Custom Definitions. Takes 24-48h to appear.');
        } else {
            console.error('❌ Error fetching analytics:', error.message);
        }
        return { periods: {}, combined: {}, labels: TIME_PERIODS };
    }
}

/**
 * Legacy function for backwards compatibility - returns 30d stats as flat object
 */
export async function getClipStats30d() {
    const { periods } = await getClipStats();
    return periods['30d'] || {};
}
