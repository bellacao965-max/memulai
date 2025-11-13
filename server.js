import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
from_url = None
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 10000;
app.use(express.static(path.join(process.cwd())));

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

// Chat endpoint using gpt-3.5-turbo and fallback behavior
app.post('/api/ai/chat', async (req, res) => {
  const prompt = req.body.prompt || '';
  if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set. Copy .env.example to .env and put your key.' });
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400
      })
    });
    const j = await r.json();
    if (j.error) return res.status(500).json({ error: j.error });
    const reply = j.choices?.[0]?.message?.content || 'Tidak ada balasan.';
    res.json({ response: reply, model: 'gpt-3.5-turbo' });
  } catch (err) {
    console.error('AI request failed', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// preview endpoint
app.get('/api/preview', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const r = await fetch(url);
    const text = await r.text();
    const ogImage = (text.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [null, null])[1]
      || (text.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [null, null])[1];
    const ogTitle = (text.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [null, null])[1]
      || (text.match(/<title>([^<]+)<\/title>/i) || [null, null])[1];
    res.json({ ogImage, title: ogTitle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'preview failed' });
  }
});

app.listen(PORT, ()=> console.log('Server running on http://localhost:'+PORT));
