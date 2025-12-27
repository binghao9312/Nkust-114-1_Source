import fs from 'fs';
import csv from 'csv-parser';
import db from './db.js';

const results = [];

// Function to clean headers (remove BOM)
// The BOM is \ufeff
const mapHeaders = ({ header }) => header.trim().replace(/^\ufeff/, '');

fs.createReadStream('NPA_TD1.csv')
    .pipe(csv({ mapHeaders }))
    .on('data', (data) => {
        // Filter out the second header line in the CSV
        if (data.CityName !== '設置縣市') {
            results.push(data);
        }
    })
    .on('end', async () => {
        console.log(`Parsed ${results.length} records.`);

        console.log('Overwriting database with clean data...');
        // Overwrite the entire points array
        await db.update((data) => {
            data.points = results;
        });

        console.log('Migration completed.');
    });
