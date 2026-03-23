
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'licenses.json');

function readDb() {
  if (!fs.existsSync(DB_PATH)) return { licenses: {} };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

app.get('/', (req, res) => {
  res.json({ status: "OK", name: "AVIGDOR SERVER" });
});

app.post('/check', (req, res) => {
  const { key } = req.body;
  const db = readDb();
  const valid = key && db.licenses[key] && db.licenses[key].active;
  res.json({ valid: !!valid });
});

app.post('/create', (req, res) => {
  const db = readDb();
  const key = Array.from({length:3})
    .map(()=>Math.random().toString(36).slice(2,6).toUpperCase())
    .join('-');

  db.licenses[key] = { active:true, createdAt:new Date().toISOString() };
  writeDb(db);

  res.json({ key });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("Server running on port " + PORT);
});
