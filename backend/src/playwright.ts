import { chromium } from "playwright";

export async function youtubeToSpotify() {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // YouTube Music'te giriş yap
    await page.goto("https://accounts.google.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://myaccount.google.com/"); // Girişten sonraki URL'yi bekle

    // Beğenilen şarkıları al
    await page.goto("https://music.youtube.com/playlist?list=LM");
    await page.waitForSelector("ytmusic-responsive-list-item-renderer");

    const songs = await page.$$eval(
      "ytmusic-responsive-list-item-renderer",
      (songs) =>
        songs.map((song) => {
          const titleElement = song.querySelector(".title a");
          const artistElement = song.querySelector(
            ".secondary-flex-columns .flex-column a"
          );

          const title = titleElement?.textContent?.trim() || "";
          const artist = artistElement?.textContent?.trim() || "";

          return { title, artist };
        })
    );

    console.log("Songs:", songs);

    // Spotify'a giriş yap
    await page.goto("https://accounts.spotify.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://www.spotify.com/"); // Girişten sonraki URL'yi bekle

    // Şarkıları beğen
    for (const song of songs) {
      await page.goto(
        `https://open.spotify.com/search/${song.title} ${song.artist}`
      );
      await page.click('button[aria-label="Save to your Liked Songs"]');
    }
  } catch (error:any) {
    console.error("Error in youtubeToSpotify:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function spotifyToYoutube() {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Spotify'da giriş yap
    await page.goto("https://accounts.spotify.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://www.spotify.com/"); // Girişten sonraki URL'yi bekle

    // Beğenilen şarkıları al
    await page.goto("https://open.spotify.com/collection/tracks");
    await page.waitForSelector(".tracklist-name");

    const tracks = await page.$$eval(".tracklist-name", (tracks) =>
      tracks.map((track) => {
        const titleElement = track.querySelector(".track-name");
        const artistElement = track.querySelector(".artists-albums");

        const title = titleElement?.textContent?.trim() || "";
        const artist = artistElement?.textContent?.trim() || "";

        return { title, artist };
      })
    );

    console.log("Tracks:", tracks);

    // YouTube Music'e giriş yap
    await page.goto("https://accounts.google.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://myaccount.google.com/"); // Girişten sonraki URL'yi bekle

    // Şarkıları beğen
    for (const track of tracks) {
      await page.goto(
        `https://music.youtube.com/search?q=${track.title} ${track.artist}`
      );
      await page.waitForSelector("ytmusic-responsive-list-item-renderer");
      const firstResult = await page.$("ytmusic-responsive-list-item-renderer");
      if (firstResult) {
        await firstResult.click();
      }
      await page.click('button[aria-label="Beğen"]');
    }
  } catch (error:any) {
    console.error("Error in spotifyToYoutube:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
