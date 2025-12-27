
import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Get all points
app.get('/points', async (req, res) => {
    await db.read(); // Ensure we have the latest data
    res.json(db.data.points);
});

// Add a new point
app.post('/points', async (req, res) => {
    const newPoint = req.body;

    // Basic validation
    if (!newPoint.CityName || !newPoint.limit) {
        return res.status(400).json({ error: "Missing required fields (CityName, limit)" });
    }

    await db.update(({ points }) => {
        points.push(newPoint);
    });

    res.status(201).json(newPoint);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
