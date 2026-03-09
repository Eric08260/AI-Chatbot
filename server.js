import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// ══════════════════════════════════════════════════════════
// 🔑  Set your API key in a .env file:
//     GEMINI_API_KEY=your_key_here
// ══════════════════════════════════════════════════════════
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set. Create a .env file with GEMINI_API_KEY=your_key');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve the frontend
app.use(express.static(join(__dirname, 'public')));

// Parse JSON bodies (20 MB limit for base64 file uploads)
app.use(express.json({ limit: '20mb' }));

// Proxy endpoint
app.post('/api/chat', async (req, res) => {
  const { contents } = req.body;

  if (!Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json({ error: 'Invalid request: contents array is required' });
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to reach Gemini API' } });
  }
});

app.listen(PORT, () => {
  console.log(`✅  Server running at http://localhost:${PORT}`);
});
