
import { db } from './src/firebase.js';
import { collection, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read data from server/db.json
// Navigate up to web-app/server/db.json from web-app/client/migrate.js
const dbPath = path.resolve(__dirname, '../server/db.json');

console.log(`Reading data from: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.error("db.json not found!");
    process.exit(1);
}

const rawData = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(rawData);
const points = data.points;

if (!points || points.length === 0) {
    console.log("No points to migrate.");
    process.exit(0);
}

console.log(`Found ${points.length} points to migrate.`);

// Firestore batch writes (limit 500 operations per batch)
const BATCH_SIZE = 500;

async function migrate() {
    let batch = writeBatch(db);
    let count = 0;
    let totalMigrated = 0;

    for (const point of points) {
        const pointRef = doc(collection(db, "points"));
        batch.set(pointRef, point);
        count++;

        if (count === BATCH_SIZE) {
            console.log(`Committing batch of ${count} documents...`);
            await batch.commit();
            totalMigrated += count;
            console.log(`Migrated ${totalMigrated} points.`);
            batch = writeBatch(db); // creating new batch
            count = 0;
        }
    }

    if (count > 0) {
        console.log(`Committing final batch of ${count} documents...`);
        await batch.commit();
        totalMigrated += count;
    }

    console.log(`Migration complete! Total migrated: ${totalMigrated}`);
    process.exit(0);
}

migrate().catch(console.error);
