const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'licenses.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'kinan12355';

function readDb() {
  if (!fs.existsSync(DB_PATH)) return { licenses: {} };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
function makeKey() {
  return Array.from({ length: 3 }).map(() =>
    Math.random().toString(36).slice(2, 6).toUpperCase()
  ).join('-');
}
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok:false, error:'unauthorized' });
  next();
}

app.get('/', (_req, res) => {
  res.json({ status: 'OK', name: 'AVIGDOR SERVER' });
});

app.post('/check', (req, res) => {
  const { key } = req.body || {};
  const db = readDb();
  const lic = key ? db.licenses[key] : null;
  const valid = !!(lic && lic.active);
  res.json({ valid, license: lic || null });
});

app.post('/create', requireAdmin, (req, res) => {
  const db = readDb();
  const key = makeKey();
  db.licenses[key] = {
    active: true,
    createdAt: new Date().toISOString(),
    note: req.body?.note || ''
  };
  writeDb(db);
  res.json({ ok:true, key });
});

app.get('/licenses', requireAdmin, (_req, res) => {
  const db = readDb();
  res.json({ ok:true, licenses: db.licenses });
});

app.post('/deactivate', requireAdmin, (req, res) => {
  const { key } = req.body || {};
  const db = readDb();
  if (!db.licenses[key]) return res.status(404).json({ ok:false, error:'not_found' });
  db.licenses[key].active = false;
  db.licenses[key].deactivatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ ok:true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
