const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOptions = {
    origin: [
      "https://junho.uk",
      "https://www.junho.uk",
      // 개발 중이면 필요 시 추가
      // "http://localhost:5173",
      // "http://localhost:3000",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // 지금은 쿠키/세션 안 쓰니 false 권장
    maxAge: 86400,      // preflight 캐시 24h
  };

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight 명시 처리
app.use(express.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'visitor-stats.json');

// Initialize data file if it doesn't exist
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const initialData = {
            totalVisitors: 128,
            totalViews: 456,
            totalRealVisitors: 0,
            totalRealViews: 0
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Read data
async function readData() {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

// Write data
async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Track visitor - just increment numbers!
app.post('/api/visit', async (req, res) => {
    try {
        const data = await readData();
        
        // Just add 1 to visitors
        data.totalRealVisitors += 1;
        data.totalVisitors += 1;
        data.totalRealViews += 1;
        data.totalViews += 1;
        
        await writeData(data);
        
        res.json({
            success: true,
            visitors: data.totalVisitors,
            views: data.totalViews
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/view', async (req, res) => {
    try {
        const data = await readData();
        
        // Just add 1 to visitors
        data.totalRealViews += 1;
        data.totalVisitors += 1;

        const viewsToAdd = Math.floor(Math.random() * 10) + 1;
        data.totalViews += viewsToAdd;
        
        // Add random 1-10 to views
        await writeData(data);
        
        res.json({
            success: true,
            visitors: data.totalVisitors,
            views: data.totalViews
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const data = await readData();
        res.json({
            success: true,
            visitors: data.totalVisitors,
            views: data.totalViews
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Auto increment every 2 hours
function startAutoIncrement() {
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    setInterval(async () => {
        try {
            const data = await readData();

            data.totalVisitors += 1;

            const viewsToAdd = Math.floor(Math.random() * 10) + 1;
            data.totalViews += viewsToAdd;

            await writeData(data);

            console.log(
                `⏰ Auto increment: +1 visitor, +${viewsToAdd} views`
            );
        } catch (error) {
            console.error('Auto increment error:', error);
        }
    }, TWO_HOURS);
}

// Initialize and start server
initDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Stats file: ${DATA_FILE}`);
    });

    // Start auto increment job
    startAutoIncrement();
});
