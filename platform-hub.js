(function () {
  const YOUTUBE_API_KEY = "AIzaSyBGUHSObM92pgobQJVFW45pqd9TqbyMNvg";

  let contentMode = localStorage.getItem("contentMode") || "songs";

  const originalLoadSongs = window.loadSongs;
  const originalSearchMusic = window.searchMusic;
  const originalShowHome = window.showHome;

  function getContentArea() {
    return document.getElementById("contentArea") || document.body;
  }

  function getSearchValue() {
    const searchInput = document.getElementById("searchInput");
    return searchInput && searchInput.value.trim()
      ? searchInput.value.trim()
      : contentMode === "songs"
        ? "top songs"
        : "trending";
  }

  function setPlatformTitle(text) {
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) pageTitle.textContent = text;
  }

  function ensurePlatformTabs() {
    if (document.getElementById("platformTabs")) {
      updatePlatformTabs();
      return;
    }

    const area = getContentArea();

    const tabs = document.createElement("div");
    tabs.id = "platformTabs";
    tabs.className = "platform-tabs";

    tabs.innerHTML = `
      <button class="platform-tab" data-mode="songs">🎵 Songs</button>
      <button class="platform-tab" data-mode="videos">🎬 Videos</button>
      <button class="platform-tab" data-mode="shorts">⚡ Shorts</button>
      <button class="platform-tab" data-mode="stories">📖 Stories</button>
    `;

    area.parentNode.insertBefore(tabs, area);

    tabs.querySelectorAll(".platform-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        contentMode = btn.dataset.mode;
        localStorage.setItem("contentMode", contentMode);
        updatePlatformTabs();
        runPlatformSearch(getSearchValue());
      });
    });

    updatePlatformTabs();
  }

  function updatePlatformTabs() {
    document.querySelectorAll(".platform-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === contentMode);
    });
  }

  async function runPlatformSearch(query) {
    ensurePlatformTabs();

    if (contentMode === "songs") {
      setPlatformTitle("Songs");
      if (typeof originalLoadSongs === "function") {
        return originalLoadSongs(query);
      }
      return;
    }

    if (contentMode === "videos") {
      setPlatformTitle("Videos");
      return searchYouTube(query, "videos");
    }

    if (contentMode === "shorts") {
      setPlatformTitle("Shorts");
      return searchYouTube(query + " shorts", "shorts");
    }

    if (contentMode === "stories") {
      setPlatformTitle("Stories");
      return searchYouTube(query + " story short video", "stories");
    }
  }

  async function searchYouTube(query, type) {
    const area = getContentArea();

    area.innerHTML = `
      <div class="platform-loading">
        Loading ${type}...
      </div>
    `;

    try {
      let duration = "";

      if (type === "shorts" || type === "stories") {
        duration = "&videoDuration=short";
      }

      const url =
        "https://www.googleapis.com/youtube/v3/search" +
        "?part=snippet" +
        "&type=video" +
        "&maxResults=18" +
        duration +
        "&q=" + encodeURIComponent(query) +
        "&key=" + encodeURIComponent(YOUTUBE_API_KEY);

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        area.innerHTML = `
          <div class="platform-message">
            YouTube API error: ${data.error.message}
          </div>
        `;
        return;
      }

      const items = data.items || [];

      if (items.length === 0) {
        area.innerHTML = `
          <div class="platform-message">
            No ${type} found.
          </div>
        `;
        return;
      }

      renderYouTubeResults(items, type);
    } catch (error) {
      console.log("YouTube search error:", error);
      area.innerHTML = `
        <div class="platform-message">
          Check internet connection or YouTube API.
        </div>
      `;
    }
  }

  function renderYouTubeResults(items, type) {
    const area = getContentArea();

    area.innerHTML = `
      <div class="platform-grid">
        ${items.map((item) => {
          const videoId = item.id.videoId;
          const title = item.snippet.title || "Video";
          const channel = item.snippet.channelTitle || "YouTube";
          const thumb =
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url ||
            "";

          return `
            <button class="platform-card" data-video-id="${escapeHtml(videoId)}" data-title="${escapeHtml(title)}" data-channel="${escapeHtml(channel)}">
              <img src="${escapeHtml(thumb)}" alt="">
              <div class="platform-card-body">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(channel)}</span>
                <small>${type}</small>
              </div>
            </button>
          `;
        }).join("")}
      </div>
    `;

    area.querySelectorAll(".platform-card").forEach((card) => {
      card.addEventListener("click", () => {
        openPlatformVideo(
          card.dataset.videoId,
          card.dataset.title,
          card.dataset.channel
        );
      });
    });
  }

  function openPlatformVideo(videoId, title, channel) {
    let box = document.getElementById("platformVideoBox");

    if (!box) {
      box = document.createElement("div");
      box.id = "platformVideoBox";
      box.className = "platform-video-box";
      document.body.appendChild(box);
    }

    const embedUrl =
      "https://www.youtube.com/embed/" +
      encodeURIComponent(videoId) +
      "?autoplay=1&rel=0&playsinline=1&origin=http://localhost:5500";

    box.innerHTML = `
      <div class="platform-video-header">
        <button id="closePlatformVideo">Close</button>
        <div>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(channel)}</p>
        </div>
      </div>

      <iframe
        src="${embedUrl}"
        title="YouTube player"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>
      </iframe>
    `;

    document.getElementById("closePlatformVideo").onclick = function () {
      box.remove();
    };
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.loadSongs = function (query) {
    return runPlatformSearch(query);
  };

  window.searchMusic = function () {
    return runPlatformSearch(getSearchValue());
  };

  window.showHome = function () {
    if (typeof originalShowHome === "function") {
      originalShowHome();
    }

    ensurePlatformTabs();
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensurePlatformTabs();
  });
})();
