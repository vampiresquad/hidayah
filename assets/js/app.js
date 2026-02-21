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
        // Zakat logic is handled on button click
    } else if (currentPage === 'hisnul-muslim.html') {
        loadHisnulMuslimData();
    } else if (currentPage === 'planner.html') {
        loadKhatamPlanner();
    } else if (currentPage === 'subjects.html') {
        loadSubjectsData(); 
    }
});


/* =========================================
   PWA & Service Worker Configuration (NEW)
========================================= */

// 1. Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // মনে রাখবেন, sw.js ফাইলটি আপনার প্রোজেক্টের রুট ডিরেক্টরিতে থাকতে হবে
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('PWA ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((error) => {
                console.error('PWA ServiceWorker registration failed: ', error);
            });
    });
}

// 2. Offline / Online Status Handling
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus(event) {
    if (!navigator.onLine) {
        console.warn("ইন্টারনেট সংযোগ বিচ্ছিন্ন! কিছু ডেটা (যেমন: API) লোড নাও হতে পারে।");
        // আপনি চাইলে এখানে একটি কাস্টম টোস্ট (Toast) বা অ্যালার্ট যুক্ত করতে পারেন
        // উদাহরণ: showToast('আপনি এখন অফলাইনে আছেন।');
    } else {
        console.log("ইন্টারনেট সংযোগ ফিরে এসেছে!");
    }
}

// 3. PWA Install Prompt Handling (Add to Home Screen)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // ব্রাউজারের ডিফল্ট ইনস্টল প্রম্পট বন্ধ করা হচ্ছে
    e.preventDefault();
    // ইভেন্টটি সেভ করে রাখা হচ্ছে যাতে পরে কাস্টম বাটনে ট্রিগার করা যায়
    deferredPrompt = e;
    console.log("PWA Install prompt is ready. You can trigger it via a custom button.");
    
    // নোট: আপনি চাইলে আপনার UI তে একটি 'Install App' বাটন দেখাতে পারেন 
    // এবং সেটিতে ক্লিক করলে deferredPrompt.prompt() কল করতে পারেন।
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
        applyFontSizes(); 
    }
}

/* =========================================
   Quran Module
========================================= */
async function loadSurahList() {
    const surahGrid = document.getElementById('surah-grid');
    const lastReadContainer = document.getElementById('last-read-container');
    if (!surahGrid) return;
    
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
        applyFontSizes();

    } else {
        ayahContainer.innerHTML = `<p class="error surface" style="text-align: center; padding: 30px; color: red;"><i class="fa-solid fa-triangle-exclamation fa-2x" style="margin-bottom: 15px; display: block;"></i> ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন।</p>`;
    }
}

function showSurahList() {
    document.getElementById('single-surah-view').style.display = 'none';
    document.getElementById('surah-list-view').style.display = 'block';
    loadSurahList(); 
    window.scrollTo(0, 0);
}

/* =========================================
   Hadith Module 
========================================= */
async function loadHadithBooks() {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '<p class="loading" style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;"><i class="fa-solid fa-spinner fa-spin"></i> বইয়ের তালিকা লোড হচ্ছে...</p>';
    
    const booksList = await fetchJSONData('../data/hadith/book-list.json');
    
    if (booksList && booksList.length > 0) {
        let htmlContent = '';
        booksList.forEach(book => {
            let apiBookName = '';
            if(book.id === 'bukhari') apiBookName = 'Bukhari';
            else if(book.id === 'muslim') apiBookName = 'Muslim';
            else if(book.id === 'abu-dawud') apiBookName = 'AbuDaud';

            htmlContent += `
                <div class="module-card surface" style="cursor: pointer; border-bottom: 4px solid ${book.color}; transition: transform 0.2s;" onclick="loadBookFromAPI('${book.id}', '${apiBookName}', '${book.name_bn}', '${book.name_ar}', '${book.color}')" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
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

async function loadBookFromAPI(bookId, apiBookName, nameBn, nameAr, themeColor) {
    document.getElementById('hadith-books-view').style.display = 'none';
    document.getElementById('single-book-view').style.display = 'block';
    window.scrollTo(0, 0);

    const bookHeader = document.getElementById('book-header');
    const hadithContainer = document.getElementById('hadith-container');

    bookHeader.innerHTML = `
        <h2 style="color: ${themeColor}; font-size: 2rem; text-align: center; margin-bottom: 5px;">${nameBn} <span style="font-family: var(--font-arabic); color: var(--color-accent);">(${nameAr})</span></h2>
        <p style="text-align: center; color: var(--color-text-muted); font-size: 0.9rem;">(অধ্যায় ১ এর হাদিসসমূহ)</p>
    `;

    hadithContainer.innerHTML = '<p class="loading" style="text-align: center; font-size: 1.2rem; margin-top: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> হাদিস লোড হচ্ছে...</p>';

    try {
        let hadiths = null;
        const apiUrl = `https://raw.githubusercontent.com/md-rifatkhan/hadithbangla/main/${apiBookName}/hadith/1.json`;
        hadiths = await fetchJSONData(apiUrl);

        if (!hadiths || hadiths.length === 0) {
            console.warn("API Down! Loading from local backup...");
            const localData = await fetchJSONData(`../data/hadith/${bookId}.json`);
            
            if(localData && localData.chapters && localData.chapters[0].hadiths) {
                hadiths = localData.chapters[0].hadiths.map(h => ({
                    hadith_id: h.hadith_id,
                    grade: h.grade,
                    narrator: h.narrator,
                    ar: h.arabic,
                    bn: h.translation
                }));
            }
        }

        if (hadiths && hadiths.length > 0) {
            let htmlContent = '';

            hadiths.forEach(hadith => {
                htmlContent += `
                    <div class="evidence-card surface" style="margin-bottom: 25px; padding: 25px; border-left: 4px solid ${themeColor};">
                        <div class="evidence-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 15px;">
                            <span class="badge badge-hadith" style="background: ${themeColor}; color: white; padding: 5px 15px; border-radius: 20px;"><i class="fa-solid fa-book-open"></i> হাদিস ${hadith.hadith_id || hadith.id || '১'}</span>
                            <span style="background: var(--color-bg-body); padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; color: ${hadith.grade === 'সহিহ হাদিস' || hadith.grade === 'সহীহ' ? 'var(--color-primary)' : 'var(--color-accent)'};"><i class="fa-solid fa-certificate"></i> মান: ${hadith.grade || 'সহীহ'}</span>
                        </div>
                        
                        <div class="evidence-body">
                            <p style="color: var(--color-text-muted); margin-bottom: 15px; font-weight: bold;"><i class="fa-solid fa-user"></i> বর্ণনাকারী: ${hadith.narrator || 'সাহাবী (রাঃ)'}</p>
                            <p class="arabic-text" dir="rtl" style="margin-bottom: 20px; line-height: 2.2; font-size: 28px;">${hadith.ar || hadith.arabic}</p>
                            <p class="translation-text" style="line-height: 1.8; color: var(--color-text-main); margin-bottom: 15px; font-size: 18px;"><strong>অর্থ:</strong> ${hadith.bn || hadith.translation}</p>
                        </div>
                    </div>
                `;
            });

            hadithContainer.innerHTML = htmlContent;
            applyFontSizes(); 

        } else {
            throw new Error("Data not found locally or in API.");
        }
    } catch (error) {
        hadithContainer.innerHTML = `<p class="error surface" style="text-align: center; color: red; padding: 30px;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><br><br>ডেটা লোড করা সম্ভব হয়নি। দয়া করে আপনার <code>data/hadith/bukhari.json</code> ফাইলটি সঠিকভাবে আছে কি না চেক করুন।</p>`;
    }
}

function showBooksList() {
    document.getElementById('single-book-view').style.display = 'none';
    document.getElementById('hadith-books-view').style.display = 'block';
    window.scrollTo(0, 0);
}

/* =========================================
   Prayer Times Module
========================================= */
async function loadPrayerTimes() {
    const container = document.getElementById('prayer-times-container');
    const gregorianDateEl = document.getElementById('gregorian-date');
    const hijriDateEl = document.getElementById('hijri-date');
    
    if (!container) return;

    const city = "Dhaka";
    const country = "Bangladesh";
    
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=1`;

    const data = await fetchJSONData(apiUrl);

    if (data && data.code === 200) {
        const timings = data.data.timings;
        const date = data.data.date;

        gregorianDateEl.innerHTML = `<i class="fa-regular fa-calendar"></i> ${date.readable}`;
        hijriDateEl.innerHTML = `<i class="fa-solid fa-moon"></i> ${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} হিজরি`;

        const formatTime = (time) => {
            let [hours, minutes] = time.split(':');
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        };

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
    const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;

    const cash = getVal('cash');
    const gold = getVal('gold');
    const silver = getVal('silver');
    const business = getVal('business');
    const debts = getVal('debts');
    const nisab = getVal('nisab');

    const totalAssets = cash + gold + silver + business;
    const netWealth = totalAssets - debts;

    const resultBox = document.getElementById('zakat-result');
    resultBox.style.display = 'block';

    const formatBDT = (amount) => {
        return amount.toLocaleString('en-IN') + ' ৳';
    };

    if (netWealth >= nisab) {
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
        resultBox.style.borderTop = '5px solid var(--color-accent)';
        resultBox.style.backgroundColor = 'rgba(200, 169, 81, 0.05)';
        resultBox.innerHTML = `
            <h3 style="color: var(--color-text-main);">আপনার ওপর যাকাত ফরজ হয়নি।</h3>
            <p style="color: var(--color-text-muted); margin-top: 10px;">আপনার নিট সম্পদ (${formatBDT(netWealth)}) যাকাতের নিসাব (${formatBDT(nisab)}) এর চেয়ে কম।</p>
        `;
    } else {
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
    applyFontSizes(); 
}

function showHisnulCategories() {
    document.getElementById('single-category-view').style.display = 'none';
    document.getElementById('hisnul-categories-view').style.display = 'block';
    window.scrollTo(0, 0);
}

/* =========================================
   Khatam Planner & Tracker Module
========================================= */
async function loadKhatamPlanner() {
    const container = document.getElementById('planner-grid');
    if (!container) return;

    const surahList = await fetchJSONData('../data/quran/surah-list.json');
    let savedProgress = JSON.parse(localStorage.getItem('hidayah_khatam_progress')) || {};

    if (surahList && surahList.length > 0) {
        let htmlContent = '';
        let completedCount = 0;

        surahList.forEach(surah => {
            const isCompleted = savedProgress[surah.id] ? true : false;
            if (isCompleted) completedCount++;
            
            const bgClass = isCompleted ? 'var(--color-primary)' : 'var(--color-bg-surface)';
            const iconClass = isCompleted ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle';
            const textClass = isCompleted ? 'white' : 'var(--color-text-main)';
            const borderStyle = isCompleted ? 'none' : '1px solid var(--color-border)';

            htmlContent += `
                <div id="surah-card-${surah.id}" class="surface" style="padding: 15px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; background-color: ${bgClass}; border: ${borderStyle}; box-shadow: var(--shadow-sm);" onclick="toggleSurahProgress(${surah.id})">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.4rem;"><i id="icon-${surah.id}" class="${iconClass}" style="color: ${textClass};"></i></span>
                        <h4 id="title-${surah.id}" style="margin: 0; font-size: 1rem; color: ${textClass};">${surah.id}. ${surah.bangla_name}</h4>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = htmlContent;
        updateProgressUI(completedCount, surahList.length);
    } else {
        container.innerHTML = `<p class="error surface" style="grid-column: 1 / -1; text-align: center;">সূরার তালিকা লোড করতে সমস্যা হয়েছে।</p>`;
    }
}

function toggleSurahProgress(surahId) {
    let savedProgress = JSON.parse(localStorage.getItem('hidayah_khatam_progress')) || {};
    const isCompleted = !savedProgress[surahId]; 
    
    if (isCompleted) {
        savedProgress[surahId] = true;
    } else {
        delete savedProgress[surahId];
    }
    localStorage.setItem('hidayah_khatam_progress', JSON.stringify(savedProgress));
    
    const card = document.getElementById(`surah-card-${surahId}`);
    const icon = document.getElementById(`icon-${surahId}`);
    const title = document.getElementById(`title-${surahId}`);
    
    if(isCompleted) {
        card.style.backgroundColor = 'var(--color-primary)';
        card.style.border = 'none';
        icon.className = 'fa-solid fa-circle-check';
        icon.style.color = 'white';
        title.style.color = 'white';
    } else {
        card.style.backgroundColor = 'var(--color-bg-surface)';
        card.style.border = '1px solid var(--color-border)';
        icon.className = 'fa-regular fa-circle';
        icon.style.color = 'var(--color-text-main)';
        title.style.color = 'var(--color-text-main)';
    }
    
    const total = 114;
    const completedCount = Object.keys(savedProgress).length;
    updateProgressUI(completedCount, total);
}

function updateProgressUI(completed, total) {
    const percentage = ((completed / total) * 100).toFixed(1);
    document.getElementById('progress-text').innerText = `${percentage}% সম্পন্ন (${total} এর মধ্যে ${completed} টি সূরা)`;
    document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
}

function resetPlanner() {
    if(confirm('আপনি কি সত্যিই আপনার খতমের সকল প্রোগ্রেস মুছে ফেলতে চান? এটি আর ফেরত পাওয়া যাবে না।')) {
        localStorage.removeItem('hidayah_khatam_progress');
        loadKhatamPlanner(); 
    }
}

/* =========================================
   Subject-wise Index Module
========================================= */
let subjectsDataCache = null;

async function loadSubjectsData() {
    const subjectsGrid = document.getElementById('subjects-grid');
    if (!subjectsGrid) return;

    subjectsGrid.innerHTML = '<p class="loading" style="grid-column: 1 / -1; text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> বিষয়ের তালিকা লোড হচ্ছে...</p>';
    
    subjectsDataCache = await fetchJSONData('../data/subjects.json');
    
    if (subjectsDataCache && subjectsDataCache.subjects) {
        let htmlContent = '';
        subjectsDataCache.subjects.forEach((subject, index) => {
            htmlContent += `
                <div class="module-card surface" style="cursor: pointer; border-bottom: 4px solid ${subject.color}; transition: transform 0.2s;" onclick="showSubjectDetails(${index})" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; padding: 20px 0;">
                        <i class="fa-solid ${subject.icon}" style="font-size: 3rem; color: ${subject.color}; margin-bottom: 15px;"></i>
                        <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${subject.title}</h3>
                        <p style="font-size: 0.9rem; color: var(--color-text-muted);"><i class="fa-solid fa-book-open"></i> মোট দলীল: ${subject.evidences.length}</p>
                    </div>
                </div>
            `;
        });
        subjectsGrid.innerHTML = htmlContent;
    } else {
        subjectsGrid.innerHTML = `<p class="error surface" style="grid-column: 1 / -1; text-align: center; color: red;"><i class="fa-solid fa-triangle-exclamation"></i> ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
    }
}

function showSubjectDetails(subjectIndex) {
    if (!subjectsDataCache) return;

    const subject = subjectsDataCache.subjects[subjectIndex];
    
    document.getElementById('subjects-list-view').style.display = 'none';
    document.getElementById('single-subject-view').style.display = 'block';
    window.scrollTo(0, 0);

    const subjectHeader = document.getElementById('subject-header');
    const evidencesContainer = document.getElementById('evidences-container');

    subjectHeader.innerHTML = `
        <i class="fa-solid ${subject.icon}" style="font-size: 2.5rem; color: ${subject.color}; margin-bottom: 15px;"></i>
        <h2 style="color: var(--color-primary); font-size: 2rem; margin-bottom: 5px;">${subject.title}</h2>
        <p style="color: var(--color-text-muted);">কুরআন ও হাদিস থেকে সংগৃহীত দলীলসমূহ</p>
    `;

    let htmlContent = '';
    subject.evidences.forEach(evidence => {
        htmlContent += createEvidenceCard(evidence);
    });

    evidencesContainer.innerHTML = htmlContent;
    applyFontSizes(); 
}

function showSubjectsList() {
    document.getElementById('single-subject-view').style.display = 'none';
    document.getElementById('subjects-list-view').style.display = 'block';
    window.scrollTo(0, 0);
}
