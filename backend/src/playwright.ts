import { chromium } from 'playwright';

export async function youtubeToSpotify() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // YouTube Music'te giriş yap
  await page.goto('https://accounts.google.com/');
  // Kullanıcı bilgilerini girecek ve giriş yapacak
  await page.waitForNavigation();
  // Beğenilen şarkıları al
  await page.goto('https://music.youtube.com/library/liked_songs');
  const songs = await page.$$eval('ytmusic-responsive-list-item-renderer', songs =>
    songs.map(song => {
      const title = song.querySelector('.title')?.textContent?.trim() || '';
      const artist = song.querySelector('.subtitle')?.textContent?.trim() || '';
      return { title, artist };
    })
  );

  // Spotify'a giriş yap
  await page.goto('https://accounts.spotify.com/');
  // Kullanıcı bilgilerini girecek ve giriş yapacak
  await page.waitForNavigation();
  // Şarkıları beğen
  for (const song of songs) {
    await page.goto(`https://open.spotify.com/search/${song.title} ${song.artist}`);
    await page.click('button[aria-label="Save to your Liked Songs"]');
  }

  await browser.close();
}

export async function spotifyToYoutube() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Spotify'da giriş yap
  await page.goto('https://accounts.spotify.com/');
  // Kullanıcı bilgilerini girecek ve giriş yapacak
  await page.waitForNavigation();
  // Beğenilen şarkıları al
  await page.goto('https://open.spotify.com/collection/tracks');
  const tracks = await page.$$eval('.tracklist-name', tracks =>
    tracks.map(track => {
      const title = track.querySelector('.track-name')?.textContent?.trim() || '';
      const artist = track.querySelector('.artists-albums')?.textContent?.trim() || '';
      return { title, artist };
    })
  );

  // YouTube Music'e giriş yap
  await page.goto('https://accounts.google.com/');
  // Kullanıcı bilgilerini girecek ve giriş yapacak
  await page.waitForNavigation();
  // Şarkıları beğen
  for (const track of tracks) {
    await page.goto(`https://music.youtube.com/search?q=${track.title} ${track.artist}`);
    await page.click('ytmusic-responsive-list-item-renderer');
    await page.click('button[aria-label="Beğen"]');
  }

  await browser.close();
}
