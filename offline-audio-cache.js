(function () {
  const CACHE_NAME = "offline-my-songs-v1";

  async function saveAudioForOffline(url) {
    try {
      if (!url || url.startsWith("blob:") || url.startsWith("data:")) return;

      const cache = await caches.open(CACHE_NAME);
      const existing = await cache.match(url);
      if (existing) return;

      const response = await fetch(url, { cache: "reload" });
      if (response && response.ok) {
        await cache.put(url, response.clone());
        console.log("Saved for offline:", url);
      }
    } catch (e) {
      console.log("Could not save audio offline:", url, e);
    }
  }

  async function loadOfflineIfNeeded(audio) {
    try {
      if (!audio || !audio.src) return;

      const url = audio.src;
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);

      if (cached) {
        const blob = await cached.blob();
        const offlineUrl = URL.createObjectURL(blob);
        audio.src = offlineUrl;
        await audio.play().catch(function(){});
        console.log("Playing offline copy");
      }
    } catch (e) {
      console.log("Offline load failed:", e);
    }
  }

  function attachOfflineAudioSystem() {
    const audios = document.querySelectorAll("audio");

    audios.forEach(function (audio) {
      audio.addEventListener("play", function () {
        saveAudioForOffline(audio.src);
      });

      audio.addEventListener("loadedmetadata", function () {
        saveAudioForOffline(audio.src);
      });

      audio.addEventListener("error", function () {
        if (!navigator.onLine) {
          loadOfflineIfNeeded(audio);
        }
      });
    });

    document.addEventListener("click", function () {
      setTimeout(function () {
        document.querySelectorAll("audio").forEach(function (audio) {
          if (audio.src) saveAudioForOffline(audio.src);
        });
      }, 800);
    });
  }

  window.addEventListener("load", attachOfflineAudioSystem);

  window.addEventListener("offline", function () {
    console.log("Offline mode enabled");
  });
})();
