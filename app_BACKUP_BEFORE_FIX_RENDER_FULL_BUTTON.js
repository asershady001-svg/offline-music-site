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
      '<div class="cover">'+image+'<div class="badge">Play</div></div>'+
      '<div class="song-info">'+
      '<div class="song-title">'+song.title+'</div>'+
      '<div class="song-artist">'+song.artist+'</div>'+
      '</div>'+
      '<div class="song-actions">'+
      '<button class="small-btn" onclick="event.stopPropagation(); playFullInsidePlatform('+index+')">▶</button>'+
      '<button class="small-btn" onclick="event.stopPropagation(); playFullInsidePlatform('+index+')">Full</button>'+
      '<button class="small-btn" onclick="event.stopPropagation(); showSongInfo('+index+')">⋯</button>'+
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

window.addEventListener("DOMContentLoaded",()=>{
  showHome();
});



function playFullInsidePlatform(index){
  const song = currentSongs[index];
  if(!song) return;

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

  const query = song.title + " " + song.artist + " official song";
  const embedUrl = "https://www.youtube.com/embed?listType=search&list=" + encodeURIComponent(query) + "&autoplay=1";

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
}

