import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

export async function getClipStats() {
    // If no credentials, return empty stats (dev mode or first run)
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !process.env.GA_PROPERTY_ID) {
        console.warn('⚠️  Analytics credentials missing. Skipping popularity fetch.');
        return {};
    }

    try {
        // Initialize client with credentials from ENV
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials
        });

        console.log('📊 Fetching analytics data from Google...');

        // Run report: Get eventCount for 'play_clip', grouped by 'clip_id'
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${process.env.GA_PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: '30daysAgo', // Analyze last 30 days
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'customEvent:clip_id', // Group by the clip_id parameter
                },
            ],
            metrics: [
                {
                    name: 'eventCount', // Count how many times it happened
                },
            ],
        });

        // Transform response into a simple map: { 'clip-id': 150, 'other-clip': 42 }
        const stats = {};
        if (response.rows) {
            response.rows.forEach((row) => {
                const clipId = row.dimensionValues[0].value;
                const count = parseInt(row.metricValues[0].value, 10);
                stats[clipId] = count;
            });
        }

        console.log(`   ✅ Retrieved stats for ${Object.keys(stats).length} clips.`);
        return stats;

    } catch (error) {
        console.error('❌ Error fetching analytics:', error.message);
        return {}; // Return empty on failure to not break the build
    }
}
