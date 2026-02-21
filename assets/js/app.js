// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    loadCommonComponents();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'pillars.html') {
        loadPillarsData();
    } else if (currentPage === 'quran.html') {
        loadSurahList(); 
    } else if (currentPage === 'hadith.html') {
        loadHadithBooks();
    } else if (currentPage === 'prayer-times.html') {
        loadPrayerTimes();
    } else if (currentPage === 'zakat.html') {
        // Zakat module has no auto-load on start
    } else if (currentPage === 'hisnul-muslim.html') {
        loadHisnulMuslimData(); // নতুন মডিউল কল করা হলো
    }
});





/* =========================================
   Pillars Module
========================================= */
async function loadPillarsData() {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) contentContainer.innerHTML = '<p class="loading"><i class="fa-solid fa-spinner fa-spin"></i> ডেটা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>';

    const data = await fetchJSONData('../data/pillars.json');

    if (data && contentContainer) {
        let htmlContent = `
            <div class="section-header">
                <h2><i class="fa-solid fa-mosque"></i> ${data.module_name}</h2>
            </div>
        `;
        data.topics.forEach(topic => {
            htmlContent += `<section class="topic-section"><h3 class="topic-title surface" style="padding:15px; background:var(--color-primary); color:white;">${topic.title}</h3>`;
            topic.sections.forEach(section => {
                htmlContent += `
                    <div class="sub-section">
                        <h4 class="section-subtitle">${section.subtitle}</h4>
                        <p class="intro-text" style="margin-bottom:15px;">${section.intro_text}</p>
                        <div class="evidences-container">
                            ${section.evidences.map(evidence => createEvidenceCard(evidence)).join('')}
                        </div>
                    </div>
                `;
            });
            htmlContent += `</section>`;
        });
        contentContainer.innerHTML = htmlContent;
        applyFontSizes(); // ফন্ট সাইজ অ্যাপ্লাই করা
    }
}

/* =========================================
   Quran Module
========================================= */
async function loadSurahList() {
    const surahGrid = document.getElementById('surah-grid');
    const lastReadContainer = document.getElementById('last-read-container');
    if (!surahGrid) return;
    
    // Last Read ব্যানার সেটআপ
    const lastReadData = JSON.parse(localStorage.getItem('hidayah_last_read'));
    if (lastReadData && lastReadContainer) {
        lastReadContainer.style.display = 'block';
        lastReadContainer.innerHTML = `
            <div class="surface" style="padding: 20px; border-left: 5px solid var(--color-accent); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s;" onclick="loadSurahData(${lastReadData.id}, '${lastReadData.name}')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                <div>
                    <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 5px;"><i class="fa-solid fa-clock-rotate-left"></i> সর্বশেষ পঠিত</p>
                    <h3 style="color: var(--color-primary); margin: 0; font-size: 1.5rem;">সূরা ${lastReadData.name}</h3>
                </div>
                <button class="theme-btn" style="background-color: var(--color-primary); color: white; border: none; margin-top: 10px;">
                    পড়া চালিয়ে যান <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    surahGrid.innerHTML = '<p class="loading" style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;"><i class="fa-solid fa-spinner fa-spin"></i> সূরার তালিকা লোড হচ্ছে...</p>';
    
    const surahList = await fetchJSONData('../data/quran/surah-list.json');
    
    if (surahList && surahList.length > 0) {
        let htmlContent = '';
        surahList.forEach(surah => {
            htmlContent += `
                <div class="module-card surah-card surface" onclick="loadSurahData(${surah.id}, '${surah.bangla_name}')">
                    <div class="surah-card-inner" style="width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                        <div class="surah-info">
                            <span class="badge badge-quran">${surah.id}</span>
                            <h3 style="margin-top: 10px;">${surah.bangla_name}</h3>
                            <p>${surah.revelation_type === 'Meccan' ? 'মাক্কী' : 'মাদানী'} • ${surah.total_verses} আয়াত</p>
                        </div>
                        <div class="surah-arabic-name" style="color: var(--color-accent);">${surah.arabic_name}</div>
                    </div>
                </div>
            `;
        });
        surahGrid.innerHTML = htmlContent;
    }
}

async function loadSurahData(surahId, banglaName) {
    document.getElementById('surah-list-view').style.display = 'none';
    document.getElementById('single-surah-view').style.display = 'block';
    window.scrollTo(0, 0);

    const surahHeader = document.getElementById('surah-header');
    const ayahContainer = document.getElementById('ayah-container');
    
    ayahContainer.innerHTML = '<p class="loading" style="text-align: center; font-size: 1.2rem;"><i class="fa-solid fa-spinner fa-spin"></i> কুরআনের আয়াত লোড হচ্ছে...</p>';

    // Last Read সেভ করা
    localStorage.setItem('hidayah_last_read', JSON.stringify({ id: surahId, name: banglaName }));

    const apiUrl = `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/bn/${surahId}.json`;
    const data = await fetchJSONData(apiUrl);

    if (data) {
        surahHeader.innerHTML = `
            <h2 style="color: var(--color-primary); font-size: 2rem; text-align: center; margin-bottom: 10px;">সূরা ${banglaName} <span style="font-family: var(--font-arabic); color: var(--color-accent);">(${data.name})</span></h2>
            <div style="display: flex; justify-content: center; gap: 15px; color: var(--color-text-muted); font-size: 0.95rem;">
                <span><i class="fa-solid fa-location-dot"></i> ${data.type === 'meccan' ? 'মাক্কী' : 'মাদানী'}</span>
                <span>|</span>
                <span><i class="fa-solid fa-list-ol"></i> আয়াত: ${data.total_verses}</span>
            </div>
            <p style="text-align: center; font-size: 0.85rem; color: var(--color-text-muted); margin-top: 15px; border-top: 1px dashed var(--color-border); padding-top: 10px;">উৎস: Tanzil.net | অনুবাদ: মহিউদ্দিন খান</p>
        `;

        let htmlContent = '';
        
        // বিসমিল্লাহ যোগ করা (সূরা আত-তাওবা বাদে)
        if (surahId !== 1 && surahId !== 9) {
            htmlContent += `
                <div class="surface" style="text-align: center; padding: 20px; margin-bottom: 30px; border-radius: 50px;">
                    <p class="arabic-text" style="margin: 0;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                </div>
            `;
        }

        data.verses.forEach(verse => {
            htmlContent += `
                <div class="evidence-card ayah-card surface" style="margin-bottom: 25px; padding: 25px;">
                    <div class="evidence-header" style="margin-bottom: 20px;">
                        <span class="badge badge-quran" style="font-size: 1rem; padding: 5px 15px;"><i class="fa-solid fa-book-quran"></i> আয়াত ${verse.id}</span>
                    </div>
                    <div class="evidence-body">
                        <p class="arabic-text" dir="rtl" style="margin-bottom: 20px; line-height: 2.2;">${verse.text}</p>
                        <p class="translation-text" style="line-height: 1.8; color: var(--color-text-main);"><strong>অর্থ:</strong> ${verse.translation}</p>
                    </div>
                </div>
            `;
        });
        ayahContainer.innerHTML = htmlContent;

        // ডেটা লোড হওয়ার পর ইউজারের সেট করা ফন্ট সাইজ অ্যাপ্লাই করা
        applyFontSizes();

    } else {
        ayahContainer.innerHTML = `<p class="error surface" style="text-align: center; padding: 30px; color: red;"><i class="fa-solid fa-triangle-exclamation fa-2x" style="margin-bottom: 15px; display: block;"></i> ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন।</p>`;
    }
}

function showSurahList() {
    document.getElementById('single-surah-view').style.display = 'none';
    document.getElementById('surah-list-view').style.display = 'block';
    
    // সূরার লিস্টে ফেরার সময় লাস্ট রিড ব্যানারটি আপডেট করার জন্য লিস্টটি পুনরায় লোড করা
    loadSurahList(); 
    window.scrollTo(0, 0);
}
/* =========================================
   Hadith Module (100% Dynamic & Perfected)
========================================= */

async function loadHadithBooks() {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '<p class="loading" style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;"><i class="fa-solid fa-spinner fa-spin"></i> বইয়ের তালিকা লোড হচ্ছে...</p>';
    
    const booksList = await fetchJSONData('../data/hadith/book-list.json');
    
    if (booksList && booksList.length > 0) {
        let htmlContent = '';
        booksList.forEach(book => {
            // প্রতিটি বইয়ের কার্ডে loadBookData কল করা হচ্ছে
            htmlContent += `
                <div class="module-card surface" style="cursor: pointer; border-bottom: 4px solid ${book.color}; transition: transform 0.2s;" onclick="loadBookData('${book.id}', '${book.color}')" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; padding: 20px 0;">
                        <i class="fa-solid fa-book-quran" style="font-size: 3rem; color: ${book.color}; margin-bottom: 15px;"></i>
                        <h3 style="margin-bottom: 5px; font-size: 1.4rem;">${book.name_bn}</h3>
                        <p style="color: var(--color-accent); font-family: var(--font-arabic); font-size: 1.5rem; margin-bottom: 15px;">${book.name_ar}</p>
                        <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 5px;"><i class="fa-solid fa-pen-nib"></i> সংকলক: ${book.compiler}</p>
                        <p style="font-size: 0.9rem; color: var(--color-text-muted);"><i class="fa-solid fa-list-ol"></i> মোট হাদিস: ${book.total_hadith}</p>
                    </div>
                </div>
            `;
        });
        booksGrid.innerHTML = htmlContent;
    } else {
        booksGrid.innerHTML = `<p class="error surface" style="grid-column: 1 / -1; text-align: center; color: red;"><i class="fa-solid fa-triangle-exclamation"></i> ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
    }
}

async function loadBookData(bookId, themeColor) {
    document.getElementById('hadith-books-view').style.display = 'none';
    document.getElementById('single-book-view').style.display = 'block';
    window.scrollTo(0, 0);

    const bookHeader = document.getElementById('book-header');
    const hadithContainer = document.getElementById('hadith-container');

    hadithContainer.innerHTML = '<p class="loading" style="text-align: center; font-size: 1.2rem;"><i class="fa-solid fa-spinner fa-spin"></i> হাদিস লোড হচ্ছে...</p>';

    // JSON ফাইল থেকে ডাইনামিকভাবে নির্দিষ্ট বইয়ের ডেটা আনা
    const bookData = await fetchJSONData(`../data/hadith/${bookId}.json`);

    if (bookData) {
        // বইয়ের হেডার রেন্ডার করা
        bookHeader.innerHTML = `
            <h2 style="color: ${themeColor}; font-size: 2rem; text-align: center; margin-bottom: 10px;">${bookData.book_meta.name_bn} <span style="font-family: var(--font-arabic); color: var(--color-accent);">(${bookData.book_meta.name_ar})</span></h2>
            <p style="text-align: center; color: var(--color-text-muted);"><i class="fa-solid fa-pen-nib"></i> ${bookData.book_meta.compiler} | <i class="fa-solid fa-list-ol"></i> হাদিস সংখ্যা: ${bookData.book_meta.total_hadith}</p>
        `;

        let htmlContent = '';

        // অধ্যায় এবং হাদিসগুলো লুপ করে রেন্ডার করা
        bookData.chapters.forEach(chapter => {
            htmlContent += `
                <div class="chapter-section" style="margin-bottom: 40px;">
                    <div class="surface" style="background: ${themeColor}; color: white; padding: 15px 20px; border-radius: var(--border-radius); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 1.2rem;"><i class="fa-solid fa-folder-open"></i> অধ্যায় ${chapter.chapter_id}: ${chapter.chapter_name_bn}</h3>
                        <span style="font-family: var(--font-arabic); font-size: 1.5rem;">${chapter.chapter_name_ar}</span>
                    </div>
            `;

            chapter.hadiths.forEach(hadith => {
                htmlContent += `
                    <div class="evidence-card surface" style="margin-bottom: 25px; padding: 25px; border-left: 4px solid ${themeColor};">
                        <div class="evidence-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 15px;">
                            <span class="badge badge-hadith" style="background: ${themeColor}; color: white; padding: 5px 15px; border-radius: 20px;"><i class="fa-solid fa-book-open"></i> হাদিস ${hadith.hadith_id}</span>
                            <span style="background: var(--color-bg-body); padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; color: ${hadith.grade === 'সহীহ' ? 'var(--color-primary)' : 'var(--color-accent)'};"><i class="fa-solid fa-certificate"></i> মান: ${hadith.grade}</span>
                        </div>
                        
                        <div class="evidence-body">
                            <p style="color: var(--color-text-muted); margin-bottom: 15px; font-weight: bold;"><i class="fa-solid fa-user"></i> বর্ণনাকারী: ${hadith.narrator}</p>
                            <p class="arabic-text" dir="rtl" style="margin-bottom: 20px; line-height: 2.2;">${hadith.arabic}</p>
                            <p class="translation-text" style="line-height: 1.8; color: var(--color-text-main); margin-bottom: 15px;"><strong>অর্থ:</strong> ${hadith.translation}</p>
                        </div>
                        
                        ${hadith.explanation ? `
                            <div class="evidence-explanation" style="background: var(--color-bg-body); padding: 15px; border-radius: 10px; border-left: 3px solid var(--color-accent);">
                                <strong><i class="fa-solid fa-lightbulb" style="color: var(--color-accent);"></i> সংক্ষিপ্ত ব্যাখ্যা:</strong>
                                <p style="margin-top: 5px; font-size: 0.95rem;">${hadith.explanation}</p>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            htmlContent += `</div>`; // চ্যাপ্টার সেকশন শেষ
        });

        hadithContainer.innerHTML = htmlContent;
        applyFontSizes(); // ইউজারের সেট করা ফন্ট সাইজ অ্যাপ্লাই করা

    } else {
        hadithContainer.innerHTML = `<p class="error surface" style="text-align: center; color: red; padding: 30px;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><br><br>এই বইয়ের ডেটা পাওয়া যায়নি। (${bookId}.json ফাইলটি চেক করুন)</p>`;
    }
}

function showBooksList() {
    document.getElementById('single-book-view').style.display = 'none';
    document.getElementById('hadith-books-view').style.display = 'block';
    window.scrollTo(0, 0);
}
/* =========================================
   Prayer Times Module (Aladhan API)
========================================= */

async function loadPrayerTimes() {
    const container = document.getElementById('prayer-times-container');
    const gregorianDateEl = document.getElementById('gregorian-date');
    const hijriDateEl = document.getElementById('hijri-date');
    
    if (!container) return;

    // আপাতত ডিফল্ট লোকেশন ঢাকা, বাংলাদেশ রাখা হয়েছে
    const city = "Dhaka";
    const country = "Bangladesh";
    
    // Aladhan API কল (University of Islamic Sciences, Karachi মেথড = 1)
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=1`;

    const data = await fetchJSONData(apiUrl);

    if (data && data.code === 200) {
        const timings = data.data.timings;
        const date = data.data.date;

        // তারিখ সেট করা
        gregorianDateEl.innerHTML = `<i class="fa-regular fa-calendar"></i> ${date.readable}`;
        hijriDateEl.innerHTML = `<i class="fa-solid fa-moon"></i> ${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} হিজরি`;

        // 24-hour time কে 12-hour AM/PM এ কনভার্ট করার ফাংশন
        const formatTime = (time) => {
            let [hours, minutes] = time.split(':');
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        };

        // ওয়াক্তের তালিকা এবং আইকন
        const prayers = [
            { id: "Fajr", name: "ফজর", icon: "fa-cloud-sun", time: timings.Fajr },
            { id: "Sunrise", name: "সূর্যোদয়", icon: "fa-sun", time: timings.Sunrise, isNafl: true },
            { id: "Dhuhr", name: "যোহর", icon: "fa-sun", time: timings.Dhuhr },
            { id: "Asr", name: "আসর", icon: "fa-cloud-sun", time: timings.Asr },
            { id: "Maghrib", name: "মাগরিব", icon: "fa-moon", time: timings.Maghrib },
            { id: "Isha", name: "ইশা", icon: "fa-star-and-crescent", time: timings.Isha }
        ];

        let htmlContent = '';

        prayers.forEach(prayer => {
            // সূর্যোদয়ের কার্ডের ডিজাইন একটু আলাদা হবে
            const cardStyle = prayer.isNafl ? 'background: var(--color-bg-body); border-left-color: var(--color-border); opacity: 0.8;' : 'background: var(--color-bg-surface);';
            const iconColor = prayer.isNafl ? 'color: var(--color-text-muted);' : '';

            htmlContent += `
                <div class="prayer-card surface" style="${cardStyle}">
                    <div style="display: flex; align-items: center;">
                        <i class="fa-solid ${prayer.icon} prayer-icon" style="${iconColor}"></i>
                        <span>${prayer.name}</span>
                    </div>
                    <div>
                        <span style="font-family: var(--font-bangla);">${formatTime(prayer.time)}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = htmlContent;

    } else {
        container.innerHTML = `<p class="error surface" style="text-align: center; color: red;"><i class="fa-solid fa-triangle-exclamation"></i> সময়সূচি লোড করতে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।</p>`;
    }
}
/* =========================================
   Zakat Calculator Module
========================================= */
function calculateZakat() {
    // ইনপুট থেকে ভ্যালু নেওয়া (খালি থাকলে 0 ধরা হবে)
    const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;

    const cash = getVal('cash');
    const gold = getVal('gold');
    const silver = getVal('silver');
    const business = getVal('business');
    const debts = getVal('debts');
    const nisab = getVal('nisab');

    // মোট সম্পদ এবং নিট সম্পদ হিসাব করা
    const totalAssets = cash + gold + silver + business;
    const netWealth = totalAssets - debts;

    const resultBox = document.getElementById('zakat-result');
    resultBox.style.display = 'block';

    // বাংলা ফরম্যাটে টাকা দেখানোর ফাংশন (যেমন: ১,০০,০০০)
    const formatBDT = (amount) => {
        return amount.toLocaleString('en-IN') + ' ৳';
    };

    if (netWealth >= nisab) {
        // যাকাত ফরজ হয়েছে (২.৫%)
        const zakatAmount = netWealth * 0.025;
        
        resultBox.style.borderTop = '5px solid var(--color-primary)';
        resultBox.style.backgroundColor = 'rgba(14, 124, 58, 0.05)';
        resultBox.innerHTML = `
            <h3 style="color: var(--color-text-main);">আলহামদুলিল্লাহ, আপনার ওপর যাকাত ফরজ হয়েছে।</h3>
            <p style="color: var(--color-text-muted); margin-top: 10px;">আপনার নিট সম্পদ: ${formatBDT(netWealth)}</p>
            <div class="result-amount">${formatBDT(zakatAmount)}</div>
            <p style="color: var(--color-text-muted); font-size: 0.9rem;">(মোট সম্পদের ২.৫%)</p>
            <button onclick="window.print()" class="theme-btn" style="margin-top: 15px; font-size: 0.9rem;">
                <i class="fa-solid fa-print"></i> হিসাব সেভ/প্রিন্ট করুন
            </button>
        `;
    } else if (netWealth > 0 && netWealth < nisab) {
        // নিসাবের চেয়ে কম সম্পদ
        resultBox.style.borderTop = '5px solid var(--color-accent)';
        resultBox.style.backgroundColor = 'rgba(200, 169, 81, 0.05)';
        resultBox.innerHTML = `
            <h3 style="color: var(--color-text-main);">আপনার ওপর যাকাত ফরজ হয়নি।</h3>
            <p style="color: var(--color-text-muted); margin-top: 10px;">আপনার নিট সম্পদ (${formatBDT(netWealth)}) যাকাতের নিসাব (${formatBDT(nisab)}) এর চেয়ে কম।</p>
        `;
    } else {
        // সম্পদ শূন্য বা ঋণের পরিমাণ বেশি
        resultBox.style.borderTop = '5px solid #E74C3C';
        resultBox.style.backgroundColor = 'rgba(231, 76, 60, 0.05)';
        resultBox.innerHTML = `
            <h3 style="color: var(--color-text-main);">আপনার ওপর যাকাত ফরজ হয়নি।</h3>
            <p style="color: var(--color-text-muted); margin-top: 10px;">আপনার ঋণ বা দেনার পরিমাণ আপনার সম্পদের চেয়ে বেশি অথবা সমান।</p>
        `;
    }
}
/* =========================================
   Hisnul Muslim Module
========================================= */
let hisnulDataCache = null;

async function loadHisnulMuslimData() {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '<p class="loading" style="grid-column: 1 / -1; text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> দোয়ার তালিকা লোড হচ্ছে...</p>';
    
    // JSON ডেটা ফেচ করা
    hisnulDataCache = await fetchJSONData('../data/hisnul-muslim.json');
    
    if (hisnulDataCache && hisnulDataCache.categories) {
        let htmlContent = '';
        hisnulDataCache.categories.forEach((category, index) => {
            htmlContent += `
                <div class="module-card surface" style="cursor: pointer; border-bottom: 4px solid ${category.color || 'var(--color-primary)'}; transition: transform 0.2s;" onclick="showDuaCategory(${index})" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; padding: 20px 0;">
                        <i class="fa-solid ${category.icon}" style="font-size: 2.5rem; color: ${category.color || 'var(--color-primary)'}; margin-bottom: 15px;"></i>
                        <h3 style="margin-bottom: 5px; font-size: 1.3rem;">${category.title}</h3>
                        <p style="font-size: 0.9rem; color: var(--color-text-muted);"><i class="fa-solid fa-list-ol"></i> মোট দোয়া: ${category.duas.length}</p>
                    </div>
                </div>
            `;
        });
        categoriesGrid.innerHTML = htmlContent;
    } else {
        categoriesGrid.innerHTML = `<p class="error surface" style="grid-column: 1 / -1; text-align: center; color: red;"><i class="fa-solid fa-triangle-exclamation"></i> ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
    }
}

function showDuaCategory(categoryIndex) {
    if (!hisnulDataCache) return;

    const category = hisnulDataCache.categories[categoryIndex];
    
    document.getElementById('hisnul-categories-view').style.display = 'none';
    document.getElementById('single-category-view').style.display = 'block';
    window.scrollTo(0, 0);

    const categoryHeader = document.getElementById('category-header');
    const duasContainer = document.getElementById('duas-container');

    categoryHeader.innerHTML = `
        <i class="fa-solid ${category.icon}" style="font-size: 2rem; color: ${category.color || 'var(--color-primary)'}; margin-bottom: 10px;"></i>
        <h2 style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: 5px;">${category.title}</h2>
    `;

    let htmlContent = '';
    category.duas.forEach((dua, idx) => {
        htmlContent += `
            <div class="evidence-card surface" style="margin-bottom: 25px; padding: 25px; border-left: 4px solid ${category.color || 'var(--color-primary)'};">
                <div class="evidence-header" style="margin-bottom: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 15px;">
                    <span class="badge" style="background: ${category.color || 'var(--color-primary)'}; color: white; padding: 5px 15px; border-radius: 20px;"><i class="fa-solid fa-pray"></i> দোয়া ${idx + 1}</span>
                </div>
                
                <div class="evidence-body">
                    <p class="arabic-text" dir="rtl" style="margin-bottom: 20px; line-height: 2.2; color: var(--color-primary-dark); text-align: right;">${dua.arabic}</p>
                    <p class="pronunciation-text" style="color: var(--color-text-muted); margin-bottom: 15px; font-style: italic;"><strong>উচ্চারণ:</strong> ${dua.pronunciation}</p>
                    <p class="translation-text" style="line-height: 1.8; color: var(--color-text-main); margin-bottom: 15px;"><strong>অর্থ:</strong> ${dua.translation}</p>
                </div>
                
                <div class="evidence-explanation" style="background: var(--color-bg-body); padding: 10px 15px; border-radius: 5px; font-size: 0.9rem; color: var(--color-text-muted);">
                    <i class="fa-solid fa-book-open"></i> <strong>রেফারেন্স:</strong> ${dua.reference}
                </div>
            </div>
        `;
    });

    duasContainer.innerHTML = htmlContent;
    applyFontSizes(); // ইউজারের ফন্ট সেটিং অ্যাপ্লাই করা
}

function showHisnulCategories() {
    document.getElementById('single-category-view').style.display = 'none';
    document.getElementById('hisnul-categories-view').style.display = 'block';
    window.scrollTo(0, 0);
}
