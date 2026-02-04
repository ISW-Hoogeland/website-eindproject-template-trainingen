const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

// Accept larger payloads for base64 images from the visual editor
app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname)));

// Utility: read data.json
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data.json:', err);
    return { exercises: [], userData: {} };
  }
}

// Utility: write data.json
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET combined data (exercises + userdata)
app.get('/api/all', (req, res) => {
  const data = readData();
  res.json(data);
});

// POST new exercise
app.post('/api/exercises', (req, res) => {
  const { title, description, author, visual } = req.body;
  if (!title || !description || !author) {
    return res.status(400).json({ error: 'title, description and author are required' });
  }

  const data = readData();
  const maxId = data.exercises.reduce((m, ex) => Math.max(m, ex.id), 0);
  const newId = maxId + 1;
  const newEx = { id: newId, title, description, author, comments: [], visual: visual || null };

  data.exercises.push(newEx);
  data.userData[newId] = { favorite: false, saved: false, comments: [] };

  writeData(data);
  res.status(201).json(newEx);
});

// PUT update userdata for an exercise
app.put('/api/userdata/:id', (req, res) => {
  const id = String(req.params.id);
  const updates = req.body; // e.g. { favorite: true } or { comments: [...] }

  const data = readData();
  if (!data.userData[id]) data.userData[id] = { favorite: false, saved: false, comments: [] };

  // Merge updates
  data.userData[id] = { ...data.userData[id], ...updates };

  writeData(data);
  res.json({ id, data: data.userData[id] });
});

// POST comment on an exercise (adds to userData.comments)
app.post('/api/exercises/:id/comments', (req, res) => {
  const id = String(req.params.id);
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'author and text required' });

  const data = readData();
  if (!data.userData[id]) data.userData[id] = { favorite: false, saved: false, comments: [] };

  const newComment = { author, text, date: new Date().toISOString().split('T')[0] };
  data.userData[id].comments.push(newComment);

  writeData(data);
  res.status(201).json(newComment);
});

// Fallback: get single exercise
app.get('/api/exercises/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = readData();
  const ex = data.exercises.find(e => e.id === id);
  if (!ex) return res.status(404).json({ error: 'not found' });
  res.json(ex);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
