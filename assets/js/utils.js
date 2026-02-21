// assets/js/utils.js

/* =========================================
   Global Settings: Theme & Typography
========================================= */
let arabicFontSize = 28; 
let translationFontSize = 18; 

function initSettings() {
    // থিম রিস্টোর
    const savedTheme = localStorage.getItem('hidayah_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // ফন্ট সাইজ রিস্টোর
    const savedArabic = localStorage.getItem('hidayah_arabic_font');
    const savedTrans = localStorage.getItem('hidayah_trans_font');
    if (savedArabic) arabicFontSize = parseInt(savedArabic);
    if (savedTrans) translationFontSize = parseInt(savedTrans);

    updateThemeButtonText();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('hidayah_theme', isDark ? 'dark' : 'light');
    updateThemeButtonText();
}

function updateThemeButtonText() {
    const isDark = document.body.classList.contains('dark-mode');
    const themeBtns = document.querySelectorAll('#theme-toggle-btn');
    themeBtns.forEach(btn => {
        btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i> লাইট মোড' : '<i class="fa-solid fa-moon"></i> ডার্ক মোড';
    });
}

function changeFontSize(type, changeAmount) {
    if (type === 'arabic') {
        arabicFontSize += changeAmount;
        if(arabicFontSize < 20) arabicFontSize = 20;
        if(arabicFontSize > 60) arabicFontSize = 60;
        localStorage.setItem('hidayah_arabic_font', arabicFontSize);
    } else if (type === 'translation') {
        translationFontSize += changeAmount;
        if(translationFontSize < 14) translationFontSize = 14;
        if(translationFontSize > 30) translationFontSize = 30;
        localStorage.setItem('hidayah_trans_font', translationFontSize);
    }
    applyFontSizes();
}

function applyFontSizes() {
    const arabicElements = document.querySelectorAll('.arabic-text');
    const transElements = document.querySelectorAll('.translation-text');
    arabicElements.forEach(el => el.style.fontSize = `${arabicFontSize}px`);
    transElements.forEach(el => el.style.fontSize = `${translationFontSize}px`);
}

// স্ক্রিপ্ট লোড হওয়ার সাথে সাথেই সেটিংস ইনিশিয়ালাইজ করা
initSettings();

/* =========================================
   Utility Functions: Fetch & Common UI
========================================= */

async function fetchJSONData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("ডেটা লোড করতে সমস্যা হয়েছে:", error);
        return null;
    }
}

/* =========================================
   App Navigation & Layout Rendering
========================================= */

function loadCommonComponents() {
    const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
    
    // টপ অ্যাপ বার (গ্লাসমরফিজম ইফেক্টসহ)
    const headerHTML = `
        <header style="position: sticky; top: 0; z-index: 1000; background: var(--color-bg-surface); opacity: 0.95; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--color-border); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm);">
            <a href="${basePath}index.html" style="text-decoration: none; display: flex; align-items: center; gap: 10px; color: var(--color-primary); font-size: 1.4rem; font-weight: bold;">
                <i class="fa-solid fa-leaf"></i> Hidayah
            </a>
            <button id="theme-toggle-btn" onclick="toggleTheme()" style="background: var(--color-bg-body); border: 1px solid var(--color-border); padding: 8px 12px; border-radius: 20px; color: var(--color-text-main); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; box-shadow: var(--shadow-sm);">
                </button>
        </header>
    `;

    // বটম নেভিগেশন বার (মোবাইল অ্যাপের মতো নিচে ফিক্সড থাকবে)
    const footerHTML = `
        <nav style="position: fixed; bottom: 0; width: 100%; z-index: 1000; background: var(--color-bg-surface); opacity: 0.95; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-top: 1px solid var(--color-border); display: flex; justify-content: space-around; align-items: center; padding: 10px 5px 20px 5px; box-shadow: 0 -4px 15px rgba(0,0,0,0.05);">
            <a href="${basePath}index.html" class="nav-item">
                <i class="fa-solid fa-house"></i>
                <span>হোম</span>
            </a>
            <a href="${basePath}pages/quran.html" class="nav-item">
                <i class="fa-solid fa-book-open-reader"></i>
                <span>কুরআন</span>
            </a>
            <a href="${basePath}pages/hadith.html" class="nav-item">
                <i class="fa-solid fa-book"></i>
                <span>হাদিস</span>
            </a>
            <a href="${basePath}pages/prayer-times.html" class="nav-item">
                <i class="fa-solid fa-clock"></i>
                <span>ওয়াক্ত</span>
            </a>
        </nav>
    `;

    const headerElement = document.getElementById('header-placeholder');
    const footerElement = document.getElementById('footer-placeholder');

    if (headerElement) headerElement.innerHTML = headerHTML;
    if (footerElement) footerElement.innerHTML = footerHTML;

    // টপ বারের ডার্ক মোড বাটনের টেক্সট ঠিক করা
    updateThemeButtonText();
    highlightActiveLink();
}

function highlightActiveLink() {
    const links = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    links.forEach(link => {
        if (link.getAttribute('href').includes(currentPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


function createEvidenceCard(evidence) {
    const badgeClass = evidence.type === 'quran' ? 'badge-quran' : 'badge-hadith';
    const badgeText = evidence.type === 'quran' ? 'আল-কুরআন' : 'হাদিস';

    return `
        <div class="evidence-card surface" style="margin-bottom: 15px;">
            <div class="evidence-header">
                <span class="badge ${badgeClass}">${badgeText}</span>
                <span class="reference">${evidence.reference}</span>
            </div>
            <div class="evidence-body">
                ${evidence.arabic ? `<p class="arabic-text" dir="rtl">${evidence.arabic}</p>` : ''}
                ${evidence.pronunciation ? `<p class="pronunciation-text"><strong>উচ্চারণ:</strong> ${evidence.pronunciation}</p>` : ''}
                <p class="translation-text"><strong>অর্থ:</strong> ${evidence.translation}</p>
            </div>
            ${evidence.explanation ? `<div class="evidence-explanation"><strong>ব্যাখ্যা:</strong> <p>${evidence.explanation}</p></div>` : ''}
        </div>
    `;
}
