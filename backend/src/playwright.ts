import { chromium } from "playwright";

export async function youtubeToSpotify() {
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });
    const page = await context.newPage();

    // YouTube Music'te giriş yap
    await page.goto("https://music.youtube.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://music.youtube.com/"); // Girişten sonraki URL'yi bekle
    await page.waitForTimeout(2000);

    // Beğenilen şarkıları al
    await page.goto("https://music.youtube.com/playlist?list=LM");
    await page.waitForSelector("ytmusic-responsive-list-item-renderer");
    await page.waitForTimeout(2000);

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

    await page.goto("https://accounts.spotify.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://www.spotify.com/"); // Girişten sonraki URL'yi bekle
    await page.waitForTimeout(2000);

    // Şarkıları beğen
    for (const song of songs) {
      await page.goto(
        `https://open.spotify.com/search/${song.title} ${song.artist}`
      );
      await page.click('button[aria-label="Save to your Liked Songs"]');
      await page.waitForTimeout(2000);
    }
  } catch (error: any) {
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
    browser = await chromium.launch({
      headless: false,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });
    const page = await context.newPage();

    // Spotify'da giriş yap
    await page.goto("https://accounts.spotify.com/");
    // Spotify hesap durumuna yönlendirmeler var, doğru son URL'yi bekleyelim
    await page.waitForURL(/https:\/\/open\.spotify\.com\/.*/);

    // Beğenilen şarkıları al
    await page.goto("https://open.spotify.com/collection/tracks");
    await page.waitForSelector('button[aria-label^="Play "]', { timeout: 6000000 });

    const tracks = await page.$$eval('button[aria-label^="Play "]', (buttons) =>
      buttons.map((button) => {
        const ariaLabel = button.getAttribute("aria-label");
        if (ariaLabel) {
          const [_, title, artist] = ariaLabel.match(/Play (.+) by (.+)/) || [];

          console.log(title, artist);
          

          localStorage.setItem(artist, title);

          return { title: title?.trim() || "", artist: artist?.trim() || "" };
        }
        return null;
      }).filter(track => track !== null)
    );

    console.log("Tracks:", tracks);


    // YouTube Music'e giriş yap
    await page.goto("https://music.youtube.com/");
    // Kullanıcı bilgilerini girecek ve giriş yapacak
    await page.waitForURL("https://music.youtube.com/"); 
    
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
      await page.waitForTimeout(2000);
    }
  } catch (error: any) {
    console.error("Error in spotifyToYoutube:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
