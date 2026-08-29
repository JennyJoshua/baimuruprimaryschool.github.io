// Baimuru Primary School E-Library
// Reads documents/elibrary/resources.json directly in the browser.
// No server, no database, no accounts — matches free static hosting.

const ELIB = {
  dataUrl: "documents/elibrary/resources.json",
  pageSize: 12,

  async loadResources() {
    if (this._cache) return this._cache;
    const res = await fetch(this.dataUrl);
    if (!res.ok) throw new Error("Could not load the library catalogue.");
    const json = await res.json();
    this._cache = json.resources || [];
    return this._cache;
  },

  qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  actionLabel(type) {
    var t = (type || "").toLowerCase();
    if (t.indexOf("video") > -1) return "WATCH";
    if (t.indexOf("audio") > -1) return "LISTEN";
    return "READ";
  },

  cardHTML(r) {
    var badge = r.origin ? '<span class="lib-badge">' + r.origin + '</span>' : "";
    var sub = [r.grades && r.grades[0], r.subjects && r.subjects[0]].filter(Boolean).join(" • ");
    return (
      '<a class="lib-card" href="elibrary-resource.html?id=' + encodeURIComponent(r.id) + '">' +
        '<div class="lib-cover" aria-hidden="true">' + (r.type || "Resource").slice(0,1) + '</div>' +
        '<div class="lib-card-body">' +
          badge +
          '<h3>' + r.title + '</h3>' +
          '<p class="lib-meta">' + (r.type || "") + (sub ? " • " + sub : "") + '</p>' +
          '<p class="lib-collection">' + (r.collections ? r.collections.join(", ") : "") + '</p>' +
        '</div>' +
      '</a>'
    );
  },

  // Simple filter: every provided field must match (array fields use "includes")
  matches(r, filters) {
    if (filters.grade && !(r.grades || []).includes(filters.grade)) return false;
    if (filters.subject && !(r.subjects || []).includes(filters.subject)) return false;
    if (filters.collection && !(r.collections || []).includes(filters.collection)) return false;
    if (filters.type && r.type !== filters.type) return false;
    if (filters.q) {
      var q = filters.q.toLowerCase();
      var hay = (r.title + " " + (r.description || "")).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }
};

document.addEventListener("DOMContentLoaded", function () {

  // ---------- Home page: featured + recently added ----------
  var featuredEl = document.getElementById("lib-featured");
  var recentEl = document.getElementById("lib-recent");
  if (featuredEl || recentEl) {
    ELIB.loadResources().then(function (all) {
      if (featuredEl) {
        var featured = all.filter(function (r) { return r.featured; }).slice(0, 4);
        featuredEl.innerHTML = featured.map(ELIB.cardHTML.bind(ELIB)).join("") ||
          '<p class="lib-empty">No featured resources yet.</p>';
      }
      if (recentEl) {
        var recent = all.slice().sort(function (a, b) {
          return (b.dateAdded || "").localeCompare(a.dateAdded || "");
        }).slice(0, 4);
        recentEl.innerHTML = recent.map(ELIB.cardHTML.bind(ELIB)).join("") ||
          '<p class="lib-empty">No resources yet.</p>';
      }
    }).catch(function (e) {
      if (featuredEl) featuredEl.innerHTML = '<p class="lib-empty">' + e.message + '</p>';
    });

    var homeSearch = document.getElementById("lib-home-search");
    if (homeSearch) {
      homeSearch.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = document.getElementById("lib-home-search-input").value.trim();
        window.location.href = "elibrary-list.html" + (q ? "?q=" + encodeURIComponent(q) : "");
      });
    }
  }

  // ---------- Resource List page ----------
  var listEl = document.getElementById("lib-list");
  if (listEl) {
    var filters = {
      grade: ELIB.qs("grade") || "",
      subject: ELIB.qs("subject") || "",
      collection: ELIB.qs("collection") || "",
      type: ELIB.qs("type") || "",
      q: ELIB.qs("q") || ""
    };

    var titleEl = document.getElementById("lib-list-title");
    if (titleEl) {
      var label = filters.grade || filters.subject || filters.collection || filters.type ||
        (filters.q ? 'Search: "' + filters.q + '"' : "All Resources");
      titleEl.textContent = label;
    }

    var shown = ELIB.pageSize;

    ELIB.loadResources().then(function (all) {
      var results = all.filter(function (r) { return ELIB.matches(r, filters); });

      var countEl = document.getElementById("lib-list-count");
      var moreBtn = document.getElementById("lib-load-more");

      function render() {
        var slice = results.slice(0, shown);
        listEl.innerHTML = slice.map(ELIB.cardHTML.bind(ELIB)).join("") ||
          '<p class="lib-empty">No resources match this yet. Check back as the library grows.</p>';
        if (countEl) {
          countEl.textContent = "Showing " + slice.length + " of " + results.length;
        }
        if (moreBtn) {
          moreBtn.style.display = shown < results.length ? "inline-block" : "none";
        }
      }

      if (moreBtn) {
        moreBtn.addEventListener("click", function () {
          shown += ELIB.pageSize;
          render();
        });
      }

      render();
    }).catch(function (e) {
      listEl.innerHTML = '<p class="lib-empty">' + e.message + '</p>';
    });
  }

  // ---------- Resource Details page ----------
  var detailsEl = document.getElementById("lib-details");
  if (detailsEl) {
    var id = ELIB.qs("id");
    ELIB.loadResources().then(function (all) {
      var r = all.find(function (x) { return x.id === id; });
      if (!r) {
        detailsEl.innerHTML = '<p class="lib-empty">This resource could not be found.</p>';
        return;
      }

      var isExternal = r.hostType === "external";
      var primaryAction = isExternal
        ? '<a class="btn btn-primary" href="' + r.externalUrl + '" target="_blank" rel="noopener">OPEN RESOURCE</a>'
        : '<a class="btn btn-primary" href="elibrary-reader.html?id=' + encodeURIComponent(r.id) + '">' + ELIB.actionLabel(r.type) + ' NOW</a>';

      var downloadBtn = (!isExternal && r.filePath)
        ? '<button class="btn btn-outline" id="lib-download-btn">DOWNLOAD<br><span class="lib-filesize">PDF' + (r.fileSizeMB ? " • " + r.fileSizeMB + " MB" : "") + '</span></button>'
        : "";

      detailsEl.innerHTML =
        '<div class="lib-details-top">' +
          '<div class="lib-cover lib-cover-lg" aria-hidden="true">' + (r.type || "R").slice(0,1) + '</div>' +
          '<div>' +
            '<span class="lib-badge">' + (r.origin || "") + '</span>' +
            '<h2>' + r.title + '</h2>' +
            '<p class="lib-meta">' + (r.type || "") + " • " + (r.grades || []).join(", ") + " • " + (r.subjects || []).join(", ") + '</p>' +
            '<div class="lib-actions">' + primaryAction + downloadBtn + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="doc-group"><h3>About This Resource</h3><p>' + (r.description || "") + '</p></div>' +

        '<div class="doc-group"><h3>Resource Information</h3>' +
          '<ul class="lib-info-list">' +
            '<li><strong>Author:</strong> ' + (r.author || "—") + '</li>' +
            '<li><strong>Publisher:</strong> ' + (r.publisher || "—") + '</li>' +
            '<li><strong>Year:</strong> ' + (r.year || "—") + '</li>' +
            '<li><strong>Language:</strong> ' + (r.language || "—") + '</li>' +
            '<li><strong>Collections:</strong> ' + (r.collections || []).join(", ") + '</li>' +
          '</ul>' +
        '</div>' +

        '<div class="doc-group"><h3>Access &amp; Rights</h3>' +
          '<ul class="lib-info-list">' +
            '<li><strong>Rights status:</strong> ' + (r.rightsStatus || "—") + '</li>' +
            '<li><strong>Source:</strong> ' + (r.source || "—") + '</li>' +
          '</ul>' +
        '</div>' +

        '<div class="doc-group" id="lib-related"><h3>Related Resources</h3><div class="lib-grid" id="lib-related-grid"></div></div>';

      // Related: same first subject, excluding self
      var related = all.filter(function (x) {
        return x.id !== r.id && r.subjects && x.subjects && x.subjects.some(function (s) { return r.subjects.includes(s); });
      }).slice(0, 3);
      var relatedGrid = document.getElementById("lib-related-grid");
      if (relatedGrid) {
        relatedGrid.innerHTML = related.map(ELIB.cardHTML.bind(ELIB)).join("") ||
          '<p class="lib-empty">No related resources yet.</p>';
      }

      // Download confirmation modal (rule: never auto-download)
      var dlBtn = document.getElementById("lib-download-btn");
      if (dlBtn) {
        dlBtn.addEventListener("click", function () {
          showDownloadModal(r);
        });
      }
    }).catch(function (e) {
      detailsEl.innerHTML = '<p class="lib-empty">' + e.message + '</p>';
    });
  }

  function showDownloadModal(r) {
    var modal = document.createElement("div");
    modal.className = "lib-modal-backdrop";
    modal.innerHTML =
      '<div class="lib-modal" role="dialog" aria-modal="true" aria-label="Confirm download">' +
        '<h3>Download resource?</h3>' +
        '<p><strong>' + r.title + '</strong><br>PDF' + (r.fileSizeMB ? " • " + r.fileSizeMB + " MB" : "") + '</p>' +
        '<p class="lib-modal-note">This will use your mobile data if you are not on Wi-Fi.</p>' +
        '<div class="lib-modal-actions">' +
          '<button class="btn btn-outline" id="lib-modal-cancel">CANCEL</button>' +
          '<a class="btn btn-primary" id="lib-modal-confirm" href="' + r.filePath + '" download>DOWNLOAD</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector("#lib-modal-cancel").addEventListener("click", function () {
      document.body.removeChild(modal);
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) document.body.removeChild(modal);
    });
  }

  // ---------- Digital Reader page ----------
  var readerEl = document.getElementById("lib-reader");
  if (readerEl) {
    var rid = ELIB.qs("id");
    ELIB.loadResources().then(function (all) {
      var r = all.find(function (x) { return x.id === rid; });
      if (!r || !r.filePath) {
        readerEl.innerHTML = '<p class="lib-empty">This resource is not available to read here.</p>';
        return;
      }
      document.getElementById("lib-reader-title").textContent = r.title;
      document.getElementById("lib-reader-frame").src = r.filePath;
      document.getElementById("lib-reader-open").href = r.filePath;
      var dl = document.getElementById("lib-reader-download");
      dl.href = r.filePath;
      dl.addEventListener("click", function (e) {
        e.preventDefault();
        showDownloadModal(r);
      });

      document.getElementById("lib-reader-frame").addEventListener("error", function () {
        readerEl.querySelector(".lib-reader-error").style.display = "block";
      });
    }).catch(function (e) {
      readerEl.innerHTML = '<p class="lib-empty">' + e.message + '</p>';
    });

    var fsBtn = document.getElementById("lib-reader-fullscreen");
    if (fsBtn) {
      fsBtn.addEventListener("click", function () {
        var frame = document.getElementById("lib-reader-frame");
        if (frame.requestFullscreen) frame.requestFullscreen();
      });
    }
  }
});
