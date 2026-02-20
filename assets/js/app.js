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
      <div class="card" onclick="location.hash='#ramadan'">রমজান বিভাগ</div>
      <div class="card" onclick="location.hash='#dua'">দৈনিক দোয়া</div>
    </section>
  `;
}

function renderQuran() {
  app.innerHTML = `<h2>আল-কুরআন বিভাগ</h2><p>শীঘ্রই সম্পূর্ণ সূরা তালিকা যুক্ত হবে।</p>`;
}

function renderHadith() {
  app.innerHTML = `<h2>সহিহ হাদিস বিভাগ</h2><p>হাদিস ডেটাবেস প্রস্তুত হচ্ছে।</p>`;
}

function renderPillars() {
  app.innerHTML = `<h2>ইসলামের মূল ভিত্তি</h2><p>৫টি স্তম্ভ ও ৬টি ঈমান বিস্তারিত আসছে।</p>`;
}

function renderRamadan() {
  app.innerHTML = `<h2>রমজান বিভাগ</h2><p>রমজান গাইড প্রস্তুত হচ্ছে।</p>`;
}

function renderDua() {
  app.innerHTML = `<h2>দৈনিক দোয়া</h2><p>দোয়া তালিকা যুক্ত হবে।</p>`;
}
