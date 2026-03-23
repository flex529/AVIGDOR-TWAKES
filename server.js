const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'licenses.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'kinan12355';

function readDB() {
    if (!fs.existsSync(DB_PATH)) return { licenses: {} };
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function makeKey() {
    return Array.from({ length: 3 }).map(() =>
        Math.random().toString(36).substring(2, 6).toUpperCase()
    ).join('-');
}

function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (token !== ADMIN_TOKEN) {
        return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    next();
}

// בדיקה
app.get('/', (req, res) => {
    res.json({ status: "OK", name: "AVIGDOR SERVER" });
});

// יצירת קוד
app.post('/create-license', requireAdmin, (req, res) => {
    const db = readDB();
    const key = makeKey();

    db.licenses[key] = {
        active: true,
        createdAt: Date.now()
    };

    writeDB(db);

    res.json({ ok: true, key });
});

// רשימה
app.get('/licenses', requireAdmin, (req, res) => {
    const db = readDB();
    res.json({ ok: true, licenses: db.licenses });
});

// מחיקה
app.post('/deactivate', requireAdmin, (req, res) => {
    const { key } = req.body;
    const db = readDB();

    if (!db.licenses[key]) {
        return res.json({ ok: false, error: "not found" });
    }

    db.licenses[key].active = false;
    writeDB(db);

    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER RUNNING"));
