/**

 * 
 * 🔹 STAGE 6 → PRIORITY SYSTEM
 * 🎯 Task: Find top 10 important unread notifications based on Type and Recency
 */
import { logger } from '../logger/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const PRIORITY_WEIGHTS = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

async function fetchAPI(url) {
    try {
        const token = process.env.API_TOKEN;
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        logger.error(`Failed to fetch ${url}.`, { error: err.message });
        return null;
    }
}

function getTopNotifications(notifications, topN) {
    const a = [...notifications];
    a.sort((c, d) => {
        const b1 = PRIORITY_WEIGHTS[c.Type] || 0;
        const b2 = PRIORITY_WEIGHTS[d.Type] || 0;
        if (b1 !== b2) {
            return b2 - b1; 
        }
       
        return new Date(d.Timestamp) - new Date(c.Timestamp);
    });
    
    return a.slice(0, topN);
}

async function runInbox() {
    logger.info("Initializing Priority Inbox...");
    const data = await fetchAPI('http://20.207.122.201/evaluation-service/notifications');
    const notifications = data?.notifications || [];
    
    logger.info(`Fetched ${notifications.length} notifications.`);
    const top10 = getTopNotifications(notifications, 10);
    
    console.log("\n--- Top 10 Priority Notifications ---");
    top10.forEach((n, i) => {
        const date = n.Timestamp.split(' ')[0]; // YYYY-MM-DD
        console.log(`${i + 1}. ${n.Type} - ${n.Message} - ${date}`);
    });

    logger.info("Top 10 Priority Notifications:", top10);
}

runInbox().catch(err => logger.error("Inbox Error", err));
