import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rute untuk menganalisis cerita dan mencari lagu
app.post('/api/analyze', async (req, res) => {
  try {
    const { moodText } = req.body;

    // 1. Minta Gemini menganalisis sentimen dan mencari kata kunci musik
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Saya sedang merasa: "${moodText}".
    Sebagai sistem psikolog musik, berikan saya 1 kata kunci pencarian lagu dalam bahasa Inggris yang cocok untuk menemani perasaan saya di Apple Music (contoh: "lofi sleep", "acoustic chill", "upbeat pop").
    Berikan juga 1 kalimat singkat empati dalam bahasa Indonesia tentang perasaanku.
    
    Format balasan (harus persis seperti ini beda baris):
    Keyword: [kata kunci]
    Pesan: [kalimat empati]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 2. Ekstrak data dari balasan Gemini
    const keywordMatch = responseText.match(/Keyword:\s*(.*)/i);
    const pesanMatch = responseText.match(/Pesan:\s*(.*)/i);

    const keyword = keywordMatch ? keywordMatch[1].trim() : "chill lofi";
    const pesan = pesanMatch ? pesanMatch[1].trim() : "Musik ini dipilihkan khusus untuk menemanimu.";

    // 3. Tembak iTunes Search API menggunakan keyword dari Gemini
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&media=music&limit=3`;
    const itunesResponse = await axios.get(itunesUrl);
    
    const songsData = itunesResponse.data.results.map(track => ({
      title: track.trackName,
      artist: track.artistName,
      cover: track.artworkUrl100, // Cover album
      previewUrl: track.previewUrl, // Audio preview 30 detik
      genre: track.primaryGenreName
    }));

    // 4. Kirim data yang sudah rapi ke Frontend React
    res.json({
      pesan: pesan,
      keyword: keyword,
      songs: songsData
    });

  } catch (error) {
    console.error("Error Sistem:", error);
    res.status(500).json({ error: "Gagal menganalisis data." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server nyala di http://localhost:${PORT}`));