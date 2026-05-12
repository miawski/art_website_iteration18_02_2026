document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("headerSearchPanel");
  const input = document.getElementById("headerSearchInput");
  const form = document.getElementById("headerSearchForm");
  const suggestions = document.getElementById("headerSearchSuggestions");
  const toggles = ["desktopSearchToggle", "mobileSearchToggle"].map((id) => document.getElementById(id)).filter(Boolean);

  if (!panel || !input || !form || !suggestions) return;

  const indexUrl = window.location.pathname.toLowerCase().includes("/da/") ? "../js/search_index.json" : "js/search_index.json";
  let pagesPromise;

  const clear = () => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("open");
  };

  const setOpen = (isOpen) => {
    panel.classList.toggle("open", isOpen);
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(isOpen)));
    isOpen ? input.focus() : clear();
  };

  const loadPages = () =>
    (pagesPromise ||= fetch(indexUrl)
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => (Array.isArray(items) ? items : []))
      .catch(() => []));

  const getMatches = async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return [];

    return (await loadPages())
      .map((page) => {
        const title = (page.title || "").toLowerCase();
        const text = `${page.title || ""} ${page.content || ""}`.toLowerCase();
        const score = (title === query ? 4 : 0) + (title.startsWith(query) ? 3 : 0) + (title.includes(query) ? 2 : 0) + (text.includes(query) ? 1 : 0);
        return score ? { page, score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
      .slice(0, 4);
  };

  const render = (matches) => {
    if (!matches.length) return clear();
    suggestions.innerHTML = matches.map(({ page }) => `<button type="button" class="search_suggestion_item" data-url="${page.url}">${page.title}</button>`).join("");
    suggestions.classList.add("open");
  };

  toggles.forEach((toggle) => toggle.addEventListener("click", () => setOpen(!panel.classList.contains("open"))));
  input.addEventListener("input", async () => render(await getMatches()));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const [bestMatch] = await getMatches();
    if (bestMatch) window.location.href = bestMatch.page.url;
  });

  suggestions.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest(".search_suggestion_item");
    if (button) window.location.href = button.dataset.url;
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (!toggles.some((toggle) => toggle.contains(event.target)) && !event.target.closest(".header_search_panel")) {
      setOpen(false);
    }
  });
});
