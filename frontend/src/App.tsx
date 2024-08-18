import React, { useState } from "react";

const App = () => {
  const [from, setFrom] = useState("spotify");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const to = from === "spotify" ? "youtube" : "spotify";

    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to }),
    });
    const result = await response.json();

    console.log(result.message );
    
    alert(result.message);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sync Liked Songs</h1>
        <form onSubmit={handleSubmit}>
          <label>
            From:
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="spotify">Spotify to YouTubeMusic</option>
              <option value="youtube">YouTubeMusic to Spotify</option>
            </select>
          </label>
          <br />
          <br />
          <button type="submit">Sync</button>
        </form>
      </header>
    </div>
  );
};

export default App;
