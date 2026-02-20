const routes = {
  "": renderHome,
  "#home": renderHome,
  "#quran": renderQuran,
  "#hadith": renderHadith,
  "#pillars": renderPillars,
  "#ramadan": renderRamadan,
  "#dua": renderDua
};

function router() {
  const hash = window.location.hash;
  const route = routes[hash] || renderHome;
  route();
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
