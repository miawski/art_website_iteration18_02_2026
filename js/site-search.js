document.addEventListener("DOMContentLoaded", () => {
  const desktopSearchToggle = document.getElementById("desktopSearchToggle");
  const mobileSearchToggle = document.getElementById("mobileSearchToggle");
  const headerSearchPanel = document.getElementById("headerSearchPanel");
  const headerSearchInput = document.getElementById("headerSearchInput");
  const headerSearchForm = document.getElementById("headerSearchForm");
  const headerSearchSuggestions = document.getElementById("headerSearchSuggestions");

  if (!headerSearchPanel || !headerSearchInput || !headerSearchForm || !headerSearchSuggestions) return;

  const pathname = window.location.pathname.toLowerCase();
  const isDanishPage = pathname.includes("/da/");
  const sitePages = isDanishPage
    ? [
        { title: "Hjem", url: "index.html" },
        { title: "Om", url: "about.html" },
        { title: "Leo", url: "leo.html" },
        { title: "Clara", url: "clara.html" },
      ]
    : [
        { title: "Home", url: "index.html" },
        { title: "About", url: "about.html" },
        { title: "Leo", url: "leo.html" },
        { title: "Clara", url: "clara.html" },
        { title: "Extra", url: "extra.html" },
      ];

  let siteIndex = [];

  async function loadSiteIndex() {
    if (siteIndex.length) return siteIndex;

    const results = await Promise.all(
      sitePages.map(async (page) => {
        const response = await fetch(page.url);
        if (!response.ok) {
          return { ...page, content: "", words: [] };
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        doc.querySelectorAll("script, style, noscript").forEach((node) => node.remove());

        const content = (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
        const words = Array.from(new Set(content.toLowerCase().match(/[\p{L}0-9'-]+/gu) || []));

        return { ...page, content, words };
      }),
    );

    siteIndex = results;
    return siteIndex;
  }

  function openSearch() {
    headerSearchPanel.classList.add("open");
    if (desktopSearchToggle) desktopSearchToggle.setAttribute("aria-expanded", "true");
    if (mobileSearchToggle) mobileSearchToggle.setAttribute("aria-expanded", "true");
    headerSearchInput.focus();
  }

  function closeSearch() {
    headerSearchPanel.classList.remove("open");
    headerSearchSuggestions.classList.remove("open");
    headerSearchSuggestions.innerHTML = "";
    if (desktopSearchToggle) desktopSearchToggle.setAttribute("aria-expanded", "false");
    if (mobileSearchToggle) mobileSearchToggle.setAttribute("aria-expanded", "false");
  }

  function toggleSearch() {
    if (headerSearchPanel.classList.contains("open")) {
      closeSearch();
    } else {
      openSearch();
    }
  }

  function getSuggestions(query, pages) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = new Set();

    pages.forEach((page) => {
      page.words.forEach((word) => {
        if (word.includes(q) && word.length > 1) {
          matches.add(word);
        }
      });
    });

    return Array.from(matches)
      .sort((a, b) => {
        const aStarts = a.startsWith(q) ? 0 : 1;
        const bStarts = b.startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.localeCompare(b);
      })
      .slice(0, 8);
  }

  function renderSuggestions(items) {
    if (!items.length) {
      headerSearchSuggestions.innerHTML = "";
      headerSearchSuggestions.classList.remove("open");
      return;
    }

    headerSearchSuggestions.innerHTML = items.map((item) => `<button type="button" class="search_suggestion_item" data-value="${item}">${item}</button>`).join("");

    headerSearchSuggestions.classList.add("open");
  }

  async function updateSuggestions() {
    const query = headerSearchInput.value;
    if (!query.trim()) {
      headerSearchSuggestions.innerHTML = "";
      headerSearchSuggestions.classList.remove("open");
      return;
    }

    try {
      const pages = await loadSiteIndex();
      renderSuggestions(getSuggestions(query, pages));
    } catch (error) {
      console.error(error);
    }
  }

  function findBestPage(query, pages) {
    const q = query.trim().toLowerCase();

    const ranked = pages
      .map((page) => {
        const haystack = `${page.title} ${page.content}`.toLowerCase();
        let score = 0;

        if (page.title.toLowerCase().includes(q)) score += 5;
        if (haystack.includes(q)) score += 2;
        if (page.words.some((word) => word === q)) score += 4;
        if (page.words.some((word) => word.startsWith(q))) score += 3;

        return { page, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return ranked.length ? ranked[0].page : null;
  }

  if (desktopSearchToggle) {
    desktopSearchToggle.addEventListener("click", toggleSearch);
  }

  if (mobileSearchToggle) {
    mobileSearchToggle.addEventListener("click", toggleSearch);
  }

  headerSearchInput.addEventListener("input", updateSuggestions);

  headerSearchSuggestions.addEventListener("click", async (event) => {
    const button = event.target.closest(".search_suggestion_item");
    if (!button) return;

    headerSearchInput.value = button.dataset.value;
    headerSearchSuggestions.innerHTML = "";
    headerSearchSuggestions.classList.remove("open");
    headerSearchForm.requestSubmit();
  });

  headerSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = headerSearchInput.value.trim();
    if (!query) return;

    try {
      const pages = await loadSiteIndex();
      const bestPage = findBestPage(query, pages);

      if (bestPage) {
        window.location.href = bestPage.url;
      }
    } catch (error) {
      console.error(error);
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInside = event.target.closest(".header_search_panel") || event.target.closest("#desktopSearchToggle") || event.target.closest("#mobileSearchToggle");

    if (!clickedInside) {
      closeSearch();
    }
  });
});
