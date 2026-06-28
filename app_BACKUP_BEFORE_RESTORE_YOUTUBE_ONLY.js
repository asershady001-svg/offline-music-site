let currentSongs=[];
let currentIndex=-1;

const contentArea=document.getElementById("contentArea");
const pageTitle=document.getElementById("pageTitle");
const searchInput=document.getElementById("searchInput");
const audioPlayer=document.getElementById("audioPlayer");
const nowTitle=document.getElementById("nowTitle");
const nowArtist=document.getElementById("nowArtist");

const artists=[
"Amr Diab","Tamer Hosny","Sherine","Ariana Grande","Taylor Swift",
"The Weeknd","Ed Sheeran","Adele","Arctic Monkeys","Coldplay",
"Michael Jackson","Queen"
];

function setTitle(t){
  if(pageTitle) pageTitle.textContent=t;
}

function showMessage(t){
  if(contentArea) contentArea.innerHTML='<div class="empty">'+t+'</div>';
}

async function loadSongs(q){
  setTitle("Loading songs...");
  showMessage("Please wait...");

  try{
    const url="https://itunes.apple.com/search?term="+encodeURIComponent(q)+"&media=music&entity=song&limit=25";
    const res=await fetch(url);
    const data=await res.json();

    currentSongs=(data.results||[])
      .filter(x=>x.previewUrl)
      .map(x=>({
        id:x.trackId,
        title:x.trackName,
        artist:x.artistName,
        url:x.previewUrl,
        artwork:x.artworkUrl100||""
      }));

    currentIndex=-1;
    setTitle("Results: "+q);
    renderSongs();
  }catch(e){
    showMessage("Internet loading error");
  }
}

function renderSongs(){
  contentArea.innerHTML="";

  if(currentSongs.length===0){
    showMessage("No songs found");
    return;
  }

  currentSongs.forEach((song,index)=>{
    const card=document.createElement("div");
    card.className="song-card";
    card.onclick=()=>playFullInsidePlatform(index);

    const image=song.artwork
      ? '<img src="'+song.artwork+'" style="width:100%;height:100%;object-fit:cover;border-radius:9px;">'
      : "♪";

    card.innerHTML=
      '<div class="cover">'+image+'<div class="badge">Full</div></div>'+
      '<div class="song-info">'+
      '<div class="song-title">'+song.title+'</div>'+
      '<div class="song-artist">'+song.artist+'</div>'+
      '</div>'+
      '<div class="song-actions">'+
      '<button class="small-btn" onclick="event.stopPropagation(); playFullInsidePlatform('+index+')">Play Full</button>'+
      '<button class="small-btn" onclick="event.stopPropagation(); saveSongToLibrary('+index+')">Save</button>'+
      '<button class="small-btn" onclick="event.stopPropagation(); showSongInfo('+index+')">Info</button>'+
      '</div>';

    contentArea.appendChild(card);
  });
}

function playSong(index){
  const song=currentSongs[index];
  if(!song) return;

  currentIndex=index;

  nowTitle.textContent=song.title;
  nowArtist.textContent=song.artist;

  audioPlayer.pause();
  audioPlayer.removeAttribute("src");
  audioPlayer.load();

  audioPlayer.src=song.url;
  audioPlayer.load();

  audioPlayer.addEventListener("loadedmetadata", function startFromBeginning(){
    audioPlayer.removeEventListener("loadedmetadata", startFromBeginning);
    audioPlayer.currentTime = 0;

    const playPromise = audioPlayer.play();
    if(playPromise){
      playPromise.catch(function(error){
        console.log("Audio play blocked or failed:", error);
      });
    }
  });
}

function playNextSong(){
  if(currentSongs.length===0) return;

  currentIndex++;

  if(currentIndex>=currentSongs.length || currentIndex<0){
    currentIndex=0;
  }

  playSong(currentIndex);
}

audioPlayer.onended=playNextSong;

function togglePlay(){
  if(currentSongs.length===0) return;

  if(currentIndex===-1){
    playSong(0);
    return;
  }

  if(audioPlayer.paused){
    audioPlayer.play();
  }else{
    audioPlayer.pause();
  }
}

function showHome(){
  loadSongs("top hits");
}

function showOnline(){
  const q=searchInput.value.trim() || "top songs";
  loadSongs(q);
}

function showDownloads(){
  setTitle("Files");
  showMessage("Files will be added later");
}

function showArtists(){
  setTitle("Artists");
  contentArea.innerHTML="";

  artists.forEach(artist=>{
    const card=document.createElement("div");
    card.className="list-card";
    card.onclick=()=>loadSongs(artist);

    card.innerHTML=
      '<div class="list-title">'+artist+'</div>'+
      '<div class="list-sub">Play</div>';

    contentArea.appendChild(card);
  });
}

function searchMusic(){
  const q=searchInput.value.trim();

  if(q===""){
    showHome();
    return;
  }

  loadSongs(q);
}

function focusSearch(){
  searchInput.focus();
  setTitle("Search");
}

function showSongInfo(index){
  const song=currentSongs[index];
  if(!song) return;

  nowTitle.textContent=song.title;
  nowArtist.textContent=song.artist;
}

function showSettings(){
  setTitle("Settings");

  contentArea.innerHTML=
    '<div class="list-card" onclick="changeTheme(\'#ff1768\')"><div class="list-title">Pink</div><div class="list-sub">Theme</div></div>'+
    '<div class="list-card" onclick="changeTheme(\'#1582ff\')"><div class="list-title">Blue</div><div class="list-sub">Theme</div></div>'+
    '<div class="list-card" onclick="changeTheme(\'#facc15\')"><div class="list-title">Gold</div><div class="list-sub">Theme</div></div>';
}

function changeTheme(c){
  document.documentElement.style.setProperty("--main",c);
}

function showMore(){
  setTitle("More");

  contentArea.innerHTML=
    '<div class="list-card" onclick="shuffleSongs()"><div class="list-title">Shuffle</div><div class="list-sub">Play</div></div>'+
    '<div class="list-card" onclick="showArtists()"><div class="list-title">Artists</div><div class="list-sub">List</div></div>';
}

function shuffleSongs(){
  if(currentSongs.length===0) return;

  currentSongs.sort(()=>Math.random()-0.5);
  currentIndex=-1;
  renderSongs();
  playSong(0);
}

window.addEventListener("DOMContentLoaded",()=>{ showHome(); addLibraryButton(); });



async function playFullInsidePlatform(index){
  const song = currentSongs[index];
  if(!song) return;

  if(audioPlayer){
    audioPlayer.pause();
  }

  let box = document.getElementById("youtubeFullPlayerBox");

  if(!box){
    box = document.createElement("div");
    box.id = "youtubeFullPlayerBox";
    box.style.margin = "15px 0";
    box.style.padding = "12px";
    box.style.borderRadius = "16px";
    box.style.background = "rgba(0,0,0,0.35)";
    box.style.border = "1px solid rgba(255,255,255,0.15)";

    if(contentArea && contentArea.parentNode){
      contentArea.parentNode.insertBefore(box, contentArea);
    }else{
      document.body.prepend(box);
    }
  }

  box.innerHTML = '<div style="padding:20px;text-align:center;font-weight:800;">Searching for full song...</div>';

  const YOUTUBE_API_KEY = "AIzaSyBGUHSObM92pgobQJVFW45pqd9TqbyMNvg";
  const query = song.title + " " + song.artist + " official audio";

  try{
    const apiUrl =
      "https://www.googleapis.com/youtube/v3/search" +
      "?part=snippet" +
      "&type=video" +
      "&videoEmbeddable=true" +
      "&maxResults=5" +
      "&q=" + encodeURIComponent(query) +
      "&key=" + encodeURIComponent(YOUTUBE_API_KEY);

    const res = await fetch(apiUrl);
    const data = await res.json();

    if(data.error){
      box.innerHTML = '<div style="padding:20px;text-align:center;">YouTube API error: ' + data.error.message + '</div>';
      return;
    }

    if(!data.items || data.items.length === 0){
      box.innerHTML = '<div style="padding:20px;text-align:center;">No full video found.</div>';
      return;
    }

    const videoId = data.items[0].id.videoId;
    const embedUrl = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";

    box.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<div style="font-weight:800;font-size:16px;">Full song inside your platform</div>' +
          '<div style="opacity:.8;font-size:13px;">' + song.title + ' - ' + song.artist + '</div>' +
        '</div>' +
        '<button class="small-btn" onclick="document.getElementById(\'youtubeFullPlayerBox\').remove()">Close</button>' +
      '</div>' +
      '<iframe width="100%" height="315" src="' + embedUrl + '" ' +
      'title="YouTube player" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen style="border-radius:14px;"></iframe>';

  }catch(error){
    console.log("YouTube API error:", error);
    box.innerHTML = '<div style="padding:20px;text-align:center;">YouTube API error. Check internet or API key.</div>';
  }
}





function saveSongToLibrary(index){
  const song = currentSongs[index];
  if(!song) return;

  let saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

  const exists = saved.some(x => x.id === song.id);

  if(!exists){
    saved.push(song);
    localStorage.setItem("savedSongs", JSON.stringify(saved));
    alert("Song saved to your library");
  }else{
    alert("Song already saved");
  }
}

function showSavedSongs(){
  const saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

  currentSongs = saved;
  currentIndex = -1;

  setTitle("My Saved Songs");
  renderSongs();

  if(saved.length === 0){
    showMessage("No saved songs yet");
  }
}


function addLibraryButton(){
  if(document.getElementById("myLibraryBtn")) return;

  const btn = document.createElement("button");
  btn.id = "myLibraryBtn";
  btn.textContent = "My Library";
  btn.className = "small-btn";
  btn.style.position = "fixed";
  btn.style.top = "15px";
  btn.style.right = "15px";
  btn.style.zIndex = "9999";
  btn.style.padding = "10px 14px";
  btn.style.borderRadius = "14px";
  btn.onclick = function(){
    showSavedSongs();
  };

  document.body.appendChild(btn);
}


/* ===== REAL OFFLINE LIBRARY SAFE PATCH ===== */

(function () {
  const DB_NAME = "offline_music_library_db";
  const STORE_NAME = "songs";

  function openOfflineDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  async function saveOfflineBlob(id, data) {
    const db = await openOfflineDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(data);

      tx.oncomplete = function () {
        resolve();
      };

      tx.onerror = function () {
        reject(tx.error);
      };
    });
  }

  async function getOfflineBlob(id) {
    const db = await openOfflineDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(id);

      request.onsuccess = function () {
        resolve(request.result || null);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function makeSongId(song) {
    return btoa(unescape(encodeURIComponent((song.title || "") + "|" + (song.artist || "") + "|" + (song.url || ""))));
  }

  window.saveSongToLibrary = async function (index) {
    const song = currentSongs[index];
    if (!song) return;

    const id = makeSongId(song);

    let saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

    const already = saved.some((s) => s.offlineId === id || s.url === song.url);

    if (!already) {
      const songToSave = {
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        url: song.url,
        offlineId: id,
        isOfflineReady: false
      };

      saved.push(songToSave);
      localStorage.setItem("savedSongs", JSON.stringify(saved));
    }

    try {
      alert("Saving song for offline... please wait");

      const response = await fetch(song.url);
      const blob = await response.blob();

      await saveOfflineBlob(id, {
        id: id,
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        blob: blob
      });

      saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");
      saved = saved.map((s) => {
        if (s.offlineId === id || s.url === song.url) {
          s.offlineId = id;
          s.isOfflineReady = true;
        }
        return s;
      });

      localStorage.setItem("savedSongs", JSON.stringify(saved));

      alert("Song saved offline successfully");
    } catch (error) {
      console.log("Offline save failed:", error);
      alert("Saved to library, but offline download failed. Try again while internet is ON.");
    }
  };

  window.playSong = async function (index) {
    const song = currentSongs[index];
    if (!song) return;

    currentIndex = index;

    nowTitle.textContent = song.title || "Unknown";
    nowArtist.textContent = song.artist || "Unknown";

    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    let finalUrl = song.url;

    if (song.offlineId) {
      try {
        const offlineData = await getOfflineBlob(song.offlineId);

        if (offlineData && offlineData.blob) {
          finalUrl = URL.createObjectURL(offlineData.blob);
        }
      } catch (error) {
        console.log("Offline play failed:", error);
      }
    }

    audioPlayer.src = finalUrl;
    audioPlayer.load();

    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Audio play blocked or failed:", error);
        alert("اضغط على الأغنية مرة أخرى للتشغيل.");
      });
    }
  };

  window.showSavedSongs = function () {
    const saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

    currentSongs = saved;
    currentIndex = 0;

    setTitle("My Library");
    renderSongs();

    if (saved.length === 0) {
      showMessage("No saved songs yet");
    }
  };

  function hideExternalButtons() {
    const buttons = document.querySelectorAll("button");

    buttons.forEach((btn) => {
      const text = (btn.textContent || "").toLowerCase();

      if (
        text.includes("youtube") ||
        text.includes("full") ||
        text.includes("mp3") ||
        text.includes("m4a")
      ) {
        btn.style.display = "none";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    hideExternalButtons();

    const observer = new MutationObserver(hideExternalButtons);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();

/* ===== MY LIBRARY OFFLINE FINAL - MP3 ONLY HIDDEN / YOUTUBE ALLOWED ===== */

(function () {
  const DB_NAME = "my_library_offline_audio_db";
  const STORE_NAME = "offline_songs_store";

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function makeOfflineId(song) {
    return btoa(unescape(encodeURIComponent(
      (song.title || "") + "|" + (song.artist || "") + "|" + (song.url || "")
    )));
  }

  async function saveBlobToDB(song, blob) {
    const db = await openDB();
    const id = makeOfflineId(song);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");

      tx.objectStore(STORE_NAME).put({
        id: id,
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        url: song.url,
        blob: blob
      });

      tx.oncomplete = function () {
        resolve(id);
      };

      tx.onerror = function () {
        reject(tx.error);
      };
    });
  }

  async function getBlobFromDB(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(id);

      request.onsuccess = function () {
        resolve(request.result || null);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  window.saveSongToLibrary = async function (index) {
    const song = currentSongs[index];
    if (!song) return;

    const id = makeOfflineId(song);

    let saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

    const exists = saved.some((s) => s.offlineId === id || s.url === song.url);

    if (!exists) {
      saved.push({
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        url: song.url,
        offlineId: id,
        offlineReady: false
      });

      localStorage.setItem("savedSongs", JSON.stringify(saved));
    }

    try {
      alert("Saving to My Library for offline use...");

      const response = await fetch(song.url);

      if (!response.ok) {
        throw new Error("Audio download failed");
      }

      const blob = await response.blob();

      await saveBlobToDB(song, blob);

      saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

      saved = saved.map((s) => {
        if (s.offlineId === id || s.url === song.url) {
          s.offlineId = id;
          s.offlineReady = true;
        }
        return s;
      });

      localStorage.setItem("savedSongs", JSON.stringify(saved));

      alert("Saved successfully. This song should now work from My Library without internet.");
    } catch (error) {
      console.log("Offline save failed:", error);
      alert("The song was added to My Library, but offline saving failed. Try again while internet is ON.");
    }
  };

  window.showSavedSongs = function () {
    const saved = JSON.parse(localStorage.getItem("savedSongs") || "[]");

    currentSongs = saved;
    currentIndex = 0;

    setTitle("My Library");
    renderSongs();

    if (saved.length === 0) {
      showMessage("No saved songs yet");
    }
  };

  window.playSong = async function (index) {
    const song = currentSongs[index];
    if (!song) return;

    currentIndex = index;

    nowTitle.textContent = song.title || "Unknown";
    nowArtist.textContent = song.artist || "Unknown";

    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    let finalUrl = song.url;

    if (song.offlineId) {
      try {
        const offlineData = await getBlobFromDB(song.offlineId);

        if (offlineData && offlineData.blob) {
          finalUrl = URL.createObjectURL(offlineData.blob);
        }
      } catch (error) {
        console.log("Could not load offline version:", error);
      }
    }

    audioPlayer.src = finalUrl;
    audioPlayer.load();

    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Play failed:", error);

        if (!navigator.onLine && !song.offlineReady) {
          alert("هذه الأغنية ليست محفوظة أوفلاين. افتح الإنترنت واضغط Save عليها مرة أخرى.");
        } else {
          alert("اضغط على الأغنية مرة أخرى للتشغيل.");
        }
      });
    }
  };

  function hideMp3OnlyAndRestoreYoutube() {
    document.querySelectorAll("button, a").forEach((el) => {
      const text = (el.textContent || "").toLowerCase();

      if (text.includes("mp3") || text.includes("m4a")) {
        el.style.display = "none";
      } else if (text.includes("youtube") || text.includes("full")) {
        el.style.display = "";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    hideMp3OnlyAndRestoreYoutube();

    const observer = new MutationObserver(function () {
      hideMp3OnlyAndRestoreYoutube();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();

/* ===== AUTO UPGRADE OLD + NEW MY LIBRARY TO OFFLINE / MP3 ONLY HIDDEN ===== */

(function () {
  const DB_NAME = "auto_upgrade_my_library_offline_db";
  const STORE_NAME = "songs";

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function makeOfflineId(song) {
    return btoa(unescape(encodeURIComponent(
      (song.title || "") + "|" + (song.artist || "") + "|" + (song.url || "")
    )));
  }

  async function saveBlob(id, song, blob) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");

      tx.objectStore(STORE_NAME).put({
        id: id,
        title: song.title || "Unknown",
        artist: song.artist || "Unknown",
        cover: song.cover || "",
        url: song.url || "",
        blob: blob
      });

      tx.oncomplete = function () {
        resolve();
      };

      tx.onerror = function () {
        reject(tx.error);
      };
    });
  }

  async function getBlob(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(id);

      req.onsuccess = function () {
        resolve(req.result || null);
      };

      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function getSavedSongs() {
    return JSON.parse(localStorage.getItem("savedSongs") || "[]");
  }

  function setSavedSongs(saved) {
    localStorage.setItem("savedSongs", JSON.stringify(saved));
  }

  function showOfflineMessage(text) {
    let box = document.getElementById("offlineUpgradeMessage");

    if (!box) {
      box = document.createElement("div");
      box.id = "offlineUpgradeMessage";
      box.style.margin = "12px auto";
      box.style.padding = "10px 12px";
      box.style.maxWidth = "520px";
      box.style.borderRadius = "12px";
      box.style.background = "rgba(0,0,0,0.35)";
      box.style.color = "white";
      box.style.fontSize = "14px";
      box.style.textAlign = "center";

      const target = document.getElementById("contentArea") || document.body;
      target.prepend(box);
    }

    box.textContent = text;
  }

  async function cacheOneSong(song) {
    if (!song || !song.url) return false;

    const id = song.offlineId || makeOfflineId(song);

    const existing = await getBlob(id);
    if (existing && existing.blob) {
      return true;
    }

    const response = await fetch(song.url);

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();

    await saveBlob(id, song, blob);

    return true;
  }

  async function upgradeOldLibraryToOffline() {
    if (!navigator.onLine) {
      showOfflineMessage("Offline mode: only songs already upgraded will play.");
      return;
    }

    let saved = getSavedSongs();

    if (saved.length === 0) return;

    showOfflineMessage("Upgrading My Library for offline use... keep internet ON.");

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < saved.length; i++) {
      const song = saved[i];
      const id = song.offlineId || makeOfflineId(song);

      try {
        await cacheOneSong({
          title: song.title,
          artist: song.artist,
          cover: song.cover,
          url: song.url,
          offlineId: id
        });

        saved[i].offlineId = id;
        saved[i].offlineReady = true;
        successCount++;
      } catch (error) {
        console.log("Could not upgrade song:", song.title, error);
        saved[i].offlineId = id;
        saved[i].offlineReady = false;
        failCount++;
      }

      setSavedSongs(saved);
      showOfflineMessage("Offline upgrade: " + (i + 1) + " / " + saved.length);
    }

    showOfflineMessage("My Library offline upgrade finished. Ready: " + successCount + " / Failed: " + failCount);
  }

  window.saveSongToLibrary = async function (index) {
    const song = currentSongs[index];
    if (!song) return;

    const id = makeOfflineId(song);

    let saved = getSavedSongs();

    const exists = saved.some((s) => s.offlineId === id || s.url === song.url);

    if (!exists) {
      saved.push({
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        url: song.url,
        offlineId: id,
        offlineReady: false
      });

      setSavedSongs(saved);
    }

    if (!navigator.onLine) {
      alert("Song added to My Library, but offline saving needs internet.");
      return;
    }

    try {
      alert("Saving song for offline use...");

      await cacheOneSong({
        title: song.title,
        artist: song.artist,
        cover: song.cover,
        url: song.url,
        offlineId: id
      });

      saved = getSavedSongs();

      saved = saved.map((s) => {
        if (s.offlineId === id || s.url === song.url) {
          s.offlineId = id;
          s.offlineReady = true;
        }
        return s;
      });

      setSavedSongs(saved);

      alert("Saved successfully for offline use.");
    } catch (error) {
      console.log("Offline save failed:", error);
      alert("Added to My Library, but offline saving failed. Try with internet ON.");
    }
  };

  window.showSavedSongs = function () {
    const saved = getSavedSongs();

    currentSongs = saved;
    currentIndex = 0;

    setTitle("My Library");
    renderSongs();

    if (saved.length === 0) {
      showMessage("No saved songs yet");
      return;
    }

    upgradeOldLibraryToOffline();
  };

  window.playSong = async function (index) {
    const song = currentSongs[index];
    if (!song) return;

    currentIndex = index;

    nowTitle.textContent = song.title || "Unknown";
    nowArtist.textContent = song.artist || "Unknown";

    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    let finalUrl = song.url;

    if (song.offlineId) {
      try {
        const offlineData = await getBlob(song.offlineId);

        if (offlineData && offlineData.blob) {
          finalUrl = URL.createObjectURL(offlineData.blob);
        }
      } catch (error) {
        console.log("Offline load failed:", error);
      }
    }

    if (!navigator.onLine && finalUrl === song.url) {
      alert("هذه الأغنية لم يتم تجهيزها أوفلاين بعد. افتح الإنترنت وافتح My Library مرة واحدة حتى يتم تجهيزها.");
      return;
    }

    audioPlayer.src = finalUrl;
    audioPlayer.load();

    const playPromise = audioPlayer.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Play failed:", error);
        alert("اضغط على الأغنية مرة أخرى للتشغيل.");
      });
    }
  };

  function hideMp3Only() {
    document.querySelectorAll("button, a").forEach((el) => {
      const text = (el.textContent || "").toLowerCase();

      if (text.includes("mp3") || text.includes("m4a")) {
        el.style.display = "none";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    hideMp3Only();

    const observer = new MutationObserver(function () {
      hideMp3Only();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();
