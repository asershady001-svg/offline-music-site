let currentSongs = [];
let currentSong = null;

const contentArea = document.getElementById("contentArea");
const pageTitle = document.getElementById("pageTitle");
const searchInput = document.getElementById("searchInput");
const audioPlayer = document.getElementById("audioPlayer");
const nowTitle = document.getElementById("nowTitle");
const nowArtist = document.getElementById("nowArtist");

const artists = [
  "Amr Diab",
  "Tamer Hosny",
  "Sherine",
  "Ariana Grande",
  "Taylor Swift",
  "The Weeknd",
  "Ed Sheeran",
  "Adele",
  "Arctic Monkeys",
  "Coldplay",
  "Michael Jackson",
  "Queen"
];

function setTitle(text) {
  pageTitle.textContent = text;
}

function showMessage(text) {
  contentArea.innerHTML = '<div class="empty">' + text + '</div>';
}

async function loadSongs(query) {
  setTitle("Loading songs...");
  showMessage("Please wait...");

  try {
    const url =
      "https://itunes.apple.com/search?term=" +
      encodeURIComponent(query) +
      "&media=music&entity=song&limit=25";

    const response = await fetch(url);
    const data = await response.json();

    currentSongs = data.results
      .filter(item => item.previewUrl)
      .map(item => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        url: item.previewUrl,
        artwork: item.artworkUrl100 || ""
      }));

    setTitle("Results: " + query);
    renderSongs();
  } catch (error) {
    showMessage("Internet loading error");
  }
}

function renderSongs() {
  contentArea.innerHTML = "";

  if (currentSongs.length === 0) {
    showMessage("No songs found");
    return;
  }

  currentSongs.forEach((song, index) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.onclick = () => playSong(index);

    const image = song.artwork
      ? '<img src="' + song.artwork + '" style="width:100%;height:100%;object-fit:cover;border-radius:9px;">'
      : "♪";

    card.innerHTML = `
      <div class="cover">
        ${image}
        <div class="badge">Play</div>
      </div>

      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>

      <div class="song-actions">
        <button class="small-btn" onclick="event.stopPropagation(); playSong(${index})">▶</button>
        <button class="small-btn" onclick="event.stopPropagation(); showSongInfo(${index})">⋯</button>
      </div>
    `;

    contentArea.appendChild(card);
  });
}

function playSong(index) {
  const song = currentSongs[index];
  if (!song) return;

  currentSong = song;
  nowTitle.textContent = song.title;
  nowArtist.textContent = song.artist;

  audioPlayer.src = song.url;
  audioPlayer.play();
}

function playNextSong() {
  if (!currentSong || currentSongs.length === 0) return;

  let index = currentSongs.findIndex(song => song.id === currentSong.id);
  index++;

  if (index >= currentSongs.length || index < 0) {
    index = 0;
  }

  playSong(index);
}

audioPlayer.onended = playNextSong;

function togglePlay() {
  if (!currentSong) {
    if (currentSongs.length > 0) {
      playSong(0);
    }
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
}

function showHome() {
  loadSongs("top hits");
}

function showOnline() {
  const query = searchInput.value.trim() || "top songs";
  loadSongs(query);
}

function showDownloads() {
  setTitle("Files");
  showMessage("Files will be added later");
}

function showArtists() {
  setTitle("Artists");
  contentArea.innerHTML = "";

  artists.forEach(artist => {
    const card = document.createElement("div");
    card.className = "list-card";
    card.onclick = () => loadSongs(artist);

    card.innerHTML = `
      <div class="list-title">${artist}</div>
      <div class="list-sub">Play</div>
    `;

    contentArea.appendChild(card);
  });
}

function searchMusic() {
  const query = searchInput.value.trim();

  if (query === "") {
    showHome();
    return;
  }

  loadSongs(query);
}

function focusSearch() {
  searchInput.focus();
  setTitle("Search");
}

function showSongInfo(index) {
  const song = currentSongs[index];
  if (!song) return;

  nowTitle.textContent = song.title;
  nowArtist.textContent = song.artist;
}

function showSettings() {
  setTitle("Settings");

  contentArea.innerHTML = `
    <div class="list-card" onclick="changeTheme('#ff1768')">
      <div class="list-title">Pink</div>
      <div class="list-sub">Theme</div>
    </div>

    <div class="list-card" onclick="changeTheme('#1582ff')">
      <div class="list-title">Blue</div>
      <div class="list-sub">Theme</div>
    </div>

    <div class="list-card" onclick="changeTheme('#facc15')">
      <div class="list-title">Gold</div>
      <div class="list-sub">Theme</div>
    </div>
  `;
}

function changeTheme(color) {
  document.documentElement.style.setProperty("--main", color);
}

function showMore() {
  setTitle("More");

  contentArea.innerHTML = `
    <div class="list-card" onclick="shuffleSongs()">
      <div class="list-title">Shuffle</div>
      <div class="list-sub">Play</div>
    </div>

    <div class="list-card" onclick="showArtists()">
      <div class="list-title">Artists</div>
      <div class="list-sub">List</div>
    </div>
// إصلاح: أي أغنية تبدأ من أولها دائمًا
function playSong(index) {
  const song = currentSongs[index];
  if (!song) return;

  currentSong = song;

  nowTitle.textContent = song.title;
  nowArtist.textContent = song.artist;

  audioPlayer.pause();
  audioPlayer.src = song.url;
  audioPlayer.currentTime = 0;

  audioPlayer.play();
}

// إصلاح: الزر الوردي يبدأ من أول أغنية في القائمة
function togglePlay() {
  if (currentSongs.length === 0) return;

  if (!currentSong) {
    playSong(0);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
}

// بعد انتهاء الأغنية يشغل التالية من أولها
audioPlayer.onended = function () {
  if (!currentSongs || currentSongs.length === 0 || !currentSong) return;

  let index = currentSongs.findIndex(song => song.id === currentSong.id);
  index++;

  if (index >= currentSongs.length || index < 0) {
    index = 0;
  }

  playSong(index);
};
