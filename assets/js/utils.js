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

function loadCommonComponents() {
    const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
    
    const headerHTML = `
        <header class="site-header">
            <div class="container header-content">
                <a href="${basePath}index.html" class="logo" style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-leaf"></i> <h2>Hidayah</h2>
                </a>
                <nav class="main-nav">
                    <ul>
                        <li><a href="${basePath}index.html"><i class="fa-solid fa-house"></i> মূল পাতা</a></li>
                        <li><a href="${basePath}pages/quran.html"><i class="fa-solid fa-book-open"></i> কুরআন</a></li>
                        <li><a href="${basePath}pages/pillars.html"><i class="fa-solid fa-mosque"></i> ভিত্তি</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    `;

    const footerHTML = `
        <footer class="site-footer">
            <div class="container footer-content">
                <p>&copy; 2026 Hidayah. সম্পূর্ণ বিনামূল্যে, বিজ্ঞাপনমুক্ত ও অলাভজনক উদ্দেশ্যে পরিচালিত।</p>
                <p class="disclaimer">সকল তথ্য কুরআন ও সহীহ সুন্নাহ ভিত্তিক।</p>
            </div>
        </footer>
    `;

    const headerElement = document.getElementById('header-placeholder');
    const footerElement = document.getElementById('footer-placeholder');

    if (headerElement) headerElement.innerHTML = headerHTML;
    if (footerElement) footerElement.innerHTML = footerHTML;

    highlightActiveLink();
}

function highlightActiveLink() {
    const links = document.querySelectorAll('.main-nav a');
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
