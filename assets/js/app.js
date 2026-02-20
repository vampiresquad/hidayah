const app = document.getElementById("app");

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <h1>স্বাগতম Hidayah-এ</h1>
      <p>বাংলা ভাষায় প্রামাণ্য ইসলামিক জ্ঞানভান্ডার</p>
    </section>

    <section class="modules">
      <div class="card" onclick="location.hash='#quran'">আল-কুরআন</div>
      <div class="card" onclick="location.hash='#hadith'">সহিহ হাদিস</div>
      <div class="card" onclick="location.hash='#pillars'">ইসলামের মূল ভিত্তি</div>
      <div class="card" onclick="location.hash='#iman'">ঈমানের ৬টি মূলনীতি</div>
      <div class="card" onclick="location.hash='#ramadan'">রমজান বিভাগ</div>
      <div class="card" onclick="location.hash='#dua'">দৈনিক দোয়া</div>
    </section>
  `;
}

async function renderPillars() {
  const response = await fetch("data/pillars.json");
  const data = await response.json();

  let content = `<h2>${data.title}</h2><div class="modules">`;

  data.pillars.forEach(pillar => {
    content += `
      <div class="card">
        <h3>${pillar.name}</h3>
        <p>${pillar.description}</p>
        <small>রেফারেন্স: ${pillar.reference}</small>
      </div>
    `;
  });

  content += `</div>`;
  app.innerHTML = content;
}

async function renderIman() {
  const response = await fetch("data/iman.json");
  const data = await response.json();

  let content = `<h2>${data.title}</h2><div class="modules">`;

  data.articles.forEach(item => {
    content += `
      <div class="card">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <small>রেফারেন্স: ${item.reference}</small>
      </div>
    `;
  });

  content += `</div>`;
  app.innerHTML = content;
}

async function renderQuran() {
  const response = await fetch("data/quran/surah-list.json");
  const data = await response.json();

  let content = `<h2>আল-কুরআন</h2><div class="modules">`;

  data.surahs.forEach(surah => {
    content += `
      <div class="card" onclick="loadSurah('${surah.file}')">
        <h3>${surah.number}. ${surah.name}</h3>
        <p>${surah.arabic_name}</p>
        <small>আয়াত সংখ্যা: ${surah.ayah_count}</small>
      </div>
    `;
  });

  content += `</div>`;
  app.innerHTML = content;
}

async function loadSurah(fileName) {
  try {
    const response = await fetch(`data/quran/${fileName}`);
    const data = await response.json();

    let content = `
      <div style="text-align:center; margin-bottom:30px;">
        <h2>${data.name}</h2>
        <h3 class="arabic">${data.arabic_name}</h3>
      </div>
    `;

    data.verses.forEach(verse => {
      const ayahText = `${data.name} ${verse.ayah}\n\n${verse.arabic}\n${verse.transliteration}\n${verse.bangla}`;

      content += `
        <div class="card">
          <div class="ayah-header">
            <span class="ayah-badge">আয়াত ${verse.ayah}</span>
            <button class="copy-btn" onclick="copyAyah(\`${ayahText}\`)">Copy</button>
          </div>

          <p class="arabic">${verse.arabic}</p>
          <p class="transliteration">${verse.transliteration}</p>
          <p class="translation">${verse.bangla}</p>

          <div class="tafsir">
            <strong>সংক্ষিপ্ত ব্যাখ্যা:</strong>
            <p>${verse.tafsir}</p>
          </div>
        </div>
      `;
    });

    content += `<button class="button" onclick="location.hash='#quran'">← সূরা তালিকায় ফিরে যান</button>`;
    app.innerHTML = content;

  } catch (error) {
    app.innerHTML = `<p>এই সূরাটি এখনো যুক্ত হয়নি।</p>
    <button class="button" onclick="location.hash='#quran'">← ফিরে যান</button>`;
  }
}

function copyAyah(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("আয়াত কপি হয়েছে");
  });
}

function renderHadith() {
  app.innerHTML = `<h2>সহিহ হাদিস বিভাগ</h2>`;
}

function renderRamadan() {
  app.innerHTML = `<h2>রমজান বিভাগ</h2>`;
}

function renderDua() {
  app.innerHTML = `<h2>দৈনিক দোয়া</h2>`;
}
