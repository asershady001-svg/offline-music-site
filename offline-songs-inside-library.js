(function () {
  const DB_NAME = "OFFLINE_SAVED_SONGS_DB";
  const STORE_NAME = "songs";
  let db = null;
  let audioUrl = null;

  function openOfflineDB() {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = function (event) {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = function () {
        db = request.result;
        resolve();
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function saveOfflineFile(file) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      store.add({
        name: file.name,
        type: file.type || "audio/mpeg",
        blob: file,
        createdAt: Date.now()
      });

      tx.oncomplete = resolve;
      tx.onerror = function () {
        reject(tx.error);
      };
    });
  }

  function getOfflineSongs() {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = function () {
        resolve(req.result || []);
      };

      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function deleteOfflineSong(id) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);

      tx.oncomplete = resolve;
      tx.onerror = function () {
        reject(tx.error);
      };
    });
  }

  async function renderOfflineSection() {
    if (!db) {
      await openOfflineDB();
    }

    const box = document.getElementById("contentArea") || document.body;

    let section = document.getElementById("offlineSongsInsideLibrary");
    if (!section) {
      section = document.createElement("div");
      section.id = "offlineSongsInsideLibrary";
      section.innerHTML = `
        <div style="margin:18px 0;padding:16px;border-radius:16px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15);">
          <h2 style="margin:0 0 8px 0;">Offline Songs</h2>
          <p style="opacity:.8;margin:0 0 12px 0;">الأغاني هنا تعمل بدون إنترنت بعد إضافتها مرة واحدة كملف MP3.</p>

          <label style="display:block;text-align:center;padding:13px;border-radius:12px;background:#00c853;color:white;font-weight:bold;margin-bottom:12px;">
            + Add MP3 Offline Song
            <input id="offlineSongFileInput" type="file" accept="audio/*" multiple style="display:none;">
          </label>

          <div id="offlineSongsList"></div>

          <audio id="offlineSongsAudio" controls style="width:100%;margin-top:12px;"></audio>
        </div>
      `;
      box.prepend(section);

      document.getElementById("offlineSongFileInput").addEventListener("change", async function (e) {
        const files = Array.from(e.target.files || []);
        for (const file of files) {
          await saveOfflineFile(file);
        }
        e.target.value = "";
        await renderOfflineSection();
        alert("تم حفظ الأغاني Offline داخل My Saved Songs");
      });
    }

    const list = document.getElementById("offlineSongsList");
    const audio = document.getElementById("offlineSongsAudio");
    const songs = await getOfflineSongs();

    if (!songs.length) {
      list.innerHTML = '<div style="padding:12px;text-align:center;opacity:.7;">لا توجد أغاني Offline حتى الآن.</div>';
      return;
    }

    list.innerHTML = "";

    songs.forEach(function (song) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:8px;align-items:center;margin:8px 0;padding:10px;border-radius:12px;background:rgba(255,255,255,.08);";

      const name = document.createElement("div");
      name.textContent = song.name;
      name.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

      const play = document.createElement("button");
      play.textContent = "Play";
      play.style.cssText = "padding:8px 10px;border:0;border-radius:8px;font-weight:bold;";
      play.onclick = function () {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioUrl = URL.createObjectURL(song.blob);
        audio.src = audioUrl;
        audio.play();
      };

      const del = document.createElement("button");
      del.textContent = "Delete";
      del.style.cssText = "padding:8px 10px;border:0;border-radius:8px;font-weight:bold;";
      del.onclick = async function () {
        await deleteOfflineSong(song.id);
        await renderOfflineSection();
      };

      row.appendChild(name);
      row.appendChild(play);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function watchLibraryPage() {
    setInterval(function () {
      const title = document.body.innerText || "";
      if (title.includes("My Saved Songs")) {
        renderOfflineSection().catch(console.log);
      }
    }, 800);
  }

  window.addEventListener("load", async function () {
    await openOfflineDB();
    watchLibraryPage();
  });
})();
