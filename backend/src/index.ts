import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { youtubeToSpotify, spotifyToYoutube } from './playwright';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/sync', async (req, res) => {
  const { from } = req.body;
  const to = from === 'youtube' ? 'spotify' : 'youtube';

  try {
    if (from === 'youtube' && to === 'spotify') {
      await youtubeToSpotify();
    } else if (from === 'spotify' && to === 'youtube') {
      await spotifyToYoutube();
    }

    res.json({ message: 'Sync işlemi tamamlandı' });
  } catch (error:any) {
    console.error('Sync error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: `Sync işlemi sırasında bir hata oluştu: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
