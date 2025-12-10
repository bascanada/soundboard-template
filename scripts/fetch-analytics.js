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

        // Sanitize Property ID (The API wants numeric '123456', not 'G-123456')
        let propertyId = process.env.GA_PROPERTY_ID;
        if (propertyId.startsWith('G-')) {
            console.warn(`⚠️  Warning: GA_PROPERTY_ID ('${propertyId}') looks like a Measurement ID. The Data API expects a numeric Property ID.`);
            console.warn(`   Attempts to run report might fail. Please find the numeric Property ID in GA4 Admin > Property Settings.`);
        }
        if (!propertyId.startsWith('properties/')) {
            propertyId = `properties/${propertyId}`;
        }

        // Run report: Get eventCount for 'play_clip', grouped by 'clip_id'
        const [response] = await analyticsDataClient.runReport({
            property: propertyId,
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
        if (error.message.includes('INVALID_ARGUMENT')) {
            console.warn('⚠️  Analytics Error: User custom dimension "clip_id" not found or invalid.');
            console.warn('   Has it been created in GA4 (Admin > Custom Definitions)? It may take 24-48h to appear.');
        } else {
            console.error('❌ Error fetching analytics:', error.message);
        }
        return {}; // Return empty on failure to not break the build
    }
}
