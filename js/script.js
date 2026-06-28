const songs = [
  { title: "تملي معاك", artist: "عمرو دياب", query: "Amr Diab Tamally Maak" },
  { title: "نور العين", artist: "عمرو دياب", query: "Amr Diab Nour El Ain" },
  { title: "قمرين", artist: "عمرو دياب", query: "Amr Diab Amarain" },
  { title: "العالم الله", artist: "عمرو دياب", query: "Amr Diab El Alem Allah" },

  { title: "وسع وسع", artist: "أحمد سعد", query: "Ahmed Saad Wasa Wasa" },
  { title: "اختياراتي", artist: "أحمد سعد", query: "Ahmed Saad Ekhtayaraty" },
  { title: "اليوم الحلو ده", artist: "أحمد سعد", query: "Ahmed Saad El Youm El Helw Dah" },

  { title: "يا ليالي", artist: "أحمد سعد وروبي", query: "Ahmed Saad Ruby Ya Layaly" },
  { title: "مخاصماك", artist: "نوال", query: "Nawal Mekhasmak" },
  { title: "بنت الجيران", artist: "حسن شاكوش وعمر كمال", query: "Bint El Geran Hassan Shakosh Omar Kamal" },

  { title: "Shape of You", artist: "Ed Sheeran", query: "Ed Sheeran Shape of You" },
  { title: "Perfect", artist: "Ed Sheeran", query: "Ed Sheeran Perfect" },
  { title: "Believer", artist: "Imagine Dragons", query: "Imagine Dragons Believer" },
  { title: "Faded", artist: "Alan Walker", query: "Alan Walker Faded" }
];

function renderSongs(list = songs) {
  const container = document.getElementById("songsContainer");
  if (!container) return;

  container.innerHTML = "";

  list.forEach((song, index) => {
    const card = document.createElement("div");
    card.className = "song-card";

    card.innerHTML = `
      <h3>${song.title}</h3>
      <p>${song.artist}</p>
      <button onclick="playVideo('${song.query}')">تشغيل فيديو</button>
      <button onclick="saveSong(${index})">حفظ في My Library</button>
    `;

    container.appendChild(card);
  });
}

function playVideo(query) {
  const player = document.getElementById("playerBox");
  if (!player) return;

  const q = encodeURIComponent(query);

  player.innerHTML = `
    <iframe
      width="100%"
      height="280"
      src="https://www.youtube.com/embed?listType=search&list=${q}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

function searchSongs() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const word = input.value.toLowerCase();

  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(word) ||
    song.artist.toLowerCase().includes(word) ||
    song.query.toLowerCase().includes(word)
  );

  renderSongs(filtered);
}

function saveSong(index) {
  const saved = JSON.parse(localStorage.getItem("myLibrary") || "[]");
  const song = songs[index];

  const exists = saved.some(item => item.query === song.query);
  if (!exists) {
    saved.push(song);
    localStorage.setItem("myLibrary", JSON.stringify(saved));
    alert("تم حفظ الأغنية في My Library");
  } else {
    alert("الأغنية محفوظة بالفعل");
  }
}

function showLibrary() {
  const saved = JSON.parse(localStorage.getItem("myLibrary") || "[]");
  renderSongs(saved);
}

function changeBackground(bg) {
  document.body.style.backgroundImage = `url('${bg}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundPosition = "center";
  localStorage.setItem("siteBackground", bg);
}

function loadSavedBackground() {
  const bg = localStorage.getItem("siteBackground");
  if (bg) {
    document.body.style.backgroundImage = `url('${bg}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
  }
}

window.onload = function () {
  loadSavedBackground();
  renderSongs();
};