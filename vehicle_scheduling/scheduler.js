/**

 * 
 * 🔹 PART 1: VEHICLE MAINTENANCE SCHEDULER
 * 📌 Problem: 0/1 Knapsack Problem
 */
import { logger } from '../logger/logger.js';
import dotenv from 'dotenv';
dotenv.config();

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

function computeOptimal(vehicles, maxH) {
    const a = Array(maxH + 1).fill(0);
    const b = Array.from({ length: maxH + 1 }, () => []);
    
    for (const c of vehicles) {
        const d = c.Duration;
        const e = c.Impact;
        for (let i = maxH; i >= d; i--) {
            if (a[i - d] + e > a[i]) {
                a[i] = a[i - d] + e;
                b[i] = [...b[i - d], c.TaskID];
            }
        }
    }
    
    return { maxImpact: a[maxH], selectedTaskIDs: b[maxH] };
}

async function runScheduler() {
    logger.info("Initializing Vehicle Maintenance Scheduler...");
    
    const depotsData = await fetchAPI('http://20.207.122.201/evaluation-service/depots');
    const vehiclesData = await fetchAPI('http://20.207.122.201/evaluation-service/vehicles');
    
    const depots = depotsData?.depots || [];
    const vehicles = vehiclesData?.vehicles || [];
    
    logger.info(`Loaded ${depots.length} depots and ${vehicles.length} vehicles.`);
    
    for (const depot of depots) {
        logger.info(`Processing Depot ID: ${depot.ID} with Budget: ${depot.MechanicHours} hours`);
        const result = computeOptimal(vehicles, depot.MechanicHours);
        
        console.log(`\n--- Depot ID: ${depot.ID} ---`);
        console.log(`Selected Tasks: [${result.selectedTaskIDs.join(', ')}]`);
        const totalDurationUsed = result.selectedTaskIDs.reduce((acc, taskId) => {
            const v = vehicles.find(veh => veh.TaskID === taskId);
            return acc + (v ? v.Duration : 0);
        }, 0);
        console.log(`Total Duration: ${totalDurationUsed}`);
        console.log(`Total Impact: ${result.maxImpact}`);

        logger.info(`Depot ID ${depot.ID} Optimal Result:`, {
            MaxImpact: result.maxImpact,
            TaskCount: result.selectedTaskIDs.length,
            Tasks: result.selectedTaskIDs
        });
    }
    
    logger.info("Scheduling complete.");
}

runScheduler().catch(err => logger.error("Scheduler Error", err));
