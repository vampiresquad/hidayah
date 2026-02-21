// assets/js/app.js

// ফাইলের উপরের অংশে এইটুকু পরিবর্তন করুন:
document.addEventListener('DOMContentLoaded', () => {
    loadCommonComponents();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'pillars.html') {
        loadPillarsData();
    } else if (currentPage === 'quran.html') {
        loadSurahList(); 
    } else if (currentPage === 'hadith.html') {
        loadHadithBooks(); // নতুন লজিক কল করা হলো
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
   Hadith Module
========================================= */
async function loadHadithBooks() {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '<p class="loading" style="grid-column: 1 / -1; text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> বইয়ের তালিকা লোড হচ্ছে...</p>';
    
    const booksList = await fetchJSONData('../data/hadith/book-list.json');
    
    if (booksList && booksList.length > 0) {
        let htmlContent = '';
        booksList.forEach(book => {
            htmlContent += `
                <div class="module-card surface" style="cursor: pointer; border-bottom: 4px solid ${book.color};" onclick="loadBookData('${book.id}', '${book.name_bn}', '${book.name_ar}')">
                    <div style="text-align: center; padding: 15px 0;">
                        <i class="fa-solid fa-book-quran" style="font-size: 3rem; color: ${book.color}; margin-bottom: 15px;"></i>
                        <h3 style="margin-bottom: 5px;">${book.name_bn}</h3>
                        <p style="color: var(--color-accent); font-family: var(--font-arabic); font-size: 1.5rem; margin-bottom: 10px;">${book.name_ar}</p>
                        <p style="font-size: 0.85rem; color: var(--color-text-muted);"><i class="fa-solid fa-pen-nib"></i> ${book.compiler}</p>
                        <p style="font-size: 0.85rem; color: var(--color-text-muted);"><i class="fa-solid fa-list-ol"></i> মোট হাদিস: ${book.total_hadith}</p>
                    </div>
                </div>
            `;
        });
        booksGrid.innerHTML = htmlContent;
    } else {
        booksGrid.innerHTML = `<p class="error surface">ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
    }
}

// নির্দিষ্ট বইয়ে ক্লিক করলে ডেমো ডেটা দেখানোর ফাংশন (আপাতত)
function loadBookData(bookId, nameBn, nameAr) {
    document.getElementById('hadith-books-view').style.display = 'none';
    document.getElementById('single-book-view').style.display = 'block';
    window.scrollTo(0, 0);

    const bookHeader = document.getElementById('book-header');
    const hadithContainer = document.getElementById('hadith-container');

    bookHeader.innerHTML = `
        <h2 style="color: var(--color-primary); font-size: 2rem; text-align: center; margin-bottom: 10px;">${nameBn} <span style="font-family: var(--font-arabic); color: var(--color-accent);">(${nameAr})</span></h2>
    `;

    // ডেমো হাদিস রেন্ডার করা (পরবর্তীতে আমরা API বা JSON থেকে আনবো)
    hadithContainer.innerHTML = `
        <div class="evidence-card surface" style="margin-bottom: 25px; padding: 25px;">
            <div class="evidence-header" style="margin-bottom: 20px;">
                <span class="badge badge-hadith" style="font-size: 1rem; padding: 5px 15px;"><i class="fa-solid fa-book-open"></i> হাদিস ১</span>
            </div>
            <div class="evidence-body">
                <p class="arabic-text" dir="rtl" style="margin-bottom: 20px; line-height: 2.2;">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى</p>
                <p class="translation-text" style="line-height: 1.8; color: var(--color-text-main);"><strong>অর্থ:</strong> নিশ্চয়ই সমস্ত কাজ নিয়তের ওপর নির্ভরশীল। আর প্রতিটি মানুষ তাই পাবে, যার নিয়ত সে করবে। (সহীহ বুখারী: ১)</p>
            </div>
        </div>
        <p style="text-align: center; color: var(--color-text-muted); margin-top: 30px;">(এখানে পরবর্তীতে ডাইনামিকভাবে ক্লাউড থেকে হাজার হাজার হাদিস লোড হবে...)</p>
    `;
    
    applyFontSizes(); // ফন্ট সাইজ অ্যাপ্লাই করা
}

function showBooksList() {
    document.getElementById('single-book-view').style.display = 'none';
    document.getElementById('hadith-books-view').style.display = 'block';
    window.scrollTo(0, 0);
}
