const routes = {
  "": "Home",
  "#home": "Home",
  "#quran": "Quran",
  "#hadith": "Hadith",
  "#pillars": "Pillars",
  "#ramadan": "Ramadan",
  "#dua": "Dua"
};

function loadContent(hash) {
  const section = document.querySelector('.container');
  const routeName = routes[hash] || "Home";

  section.innerHTML = `<h2>${routeName} বিভাগ আসছে…</h2><p>তথ্য পেয়ে গেলে এখানে বিষয়টি ডাইনামিকভাবে রেন্ডার হবে।</p>`;
}

// Router listener
window.addEventListener("hashchange", () => {
  loadContent(location.hash);
});

// Initial load
window.addEventListener("DOMContentLoaded", () => {
  loadContent(location.hash);
});
