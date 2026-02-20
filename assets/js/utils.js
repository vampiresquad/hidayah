// assets/js/utils.js

/**
 * JSON ফাইল থেকে ডেটা ফেচ (Fetch) করার গ্লোবাল ফাংশন
 * @param {string} url - JSON ফাইলের লোকেশন
 * @returns {Promise<Object>} - ফেচ করা ডেটা
 */
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

/**
 * একটি একক দলীল (Evidence) থেকে HTML কার্ড তৈরি করার ফাংশন
 * এটি আপনার সেই নিখুঁত JSON স্কিমার উপর ভিত্তি করে তৈরি
 * @param {Object} evidence - দলীলের ডেটা অবজেক্ট
 * @returns {string} - জেনারেট করা HTML স্ট্রিং
 */
function createEvidenceCard(evidence) {
    // দলীলের ধরন (কুরআন নাকি হাদিস) অনুযায়ী ব্যাজ বা লেবেল নির্ধারণ
    const badgeClass = evidence.type === 'quran' ? 'badge-quran' : 'badge-hadith';
    const badgeText = evidence.type === 'quran' ? 'আল-কুরআন' : 'হাদিস';

    return `
        <div class="evidence-card">
            <div class="evidence-header">
                <span class="badge ${badgeClass}">${badgeText}</span>
                <span class="reference">${evidence.reference}</span>
            </div>
            
            <div class="evidence-body">
                ${evidence.arabic ? `<p class="arabic-text" dir="rtl">${evidence.arabic}</p>` : ''}
                ${evidence.pronunciation ? `<p class="pronunciation-text"><strong>উচ্চারণ:</strong> ${evidence.pronunciation}</p>` : ''}
                <p class="translation-text"><strong>অর্থ:</strong> ${evidence.translation}</p>
            </div>

            ${evidence.explanation ? `
            <div class="evidence-explanation">
                <strong>ব্যাখ্যা:</strong> <p>${evidence.explanation}</p>
            </div>` : ''}

            <div class="evidence-footer">
                <small><strong>উৎস:</strong> 
                    ${evidence.source_details.tafsir_source || evidence.source_details.book || 'Verified Source'} 
                    (${evidence.source_details.authenticity})
                </small>
            </div>
        </div>
    `;
}
// assets/js/utils.js (আগের কোডের নিচে এই অংশটুকু যোগ করুন)

/**
 * সব পেজের জন্য সাধারণ Header এবং Footer লোড করার ফাংশন
 */
function loadCommonComponents() {
    // আমরা কোন ফোল্ডারে আছি তার ওপর ভিত্তি করে পাথ ঠিক করা
    const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
    
    const headerHTML = `
        <header class="site-header">
            <div class="container header-content">
                <a href="${basePath}index.html" class="logo"><h2>Hidayah</h2></a>
                <nav class="main-nav">
                    <ul>
                        <li><a href="${basePath}index.html">মূল পাতা</a></li>
                        <li><a href="${basePath}pages/quran.html">কুরআন</a></li>
                        <li><a href="${basePath}pages/hadith.html">হাদিস</a></li>
                        <li><a href="${basePath}pages/pillars.html">ইসলামের ভিত্তি</a></li>
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

    // HTML-এর প্লেসহোল্ডারগুলোতে কন্টেন্ট বসানো
    const headerElement = document.getElementById('header-placeholder');
    const footerElement = document.getElementById('footer-placeholder');

    if (headerElement) headerElement.innerHTML = headerHTML;
    if (footerElement) footerElement.innerHTML = footerHTML;

    // বর্তমানে কোন পেজে আছি, মেনুতে সেই লিংকটি অ্যাকটিভ (Active) করা
    highlightActiveLink();
}

/**
 * মেনুর অ্যাকটিভ লিংক হাইলাইট করার ফাংশন
 */
function highlightActiveLink() {
    const links = document.querySelectorAll('.main-nav a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    links.forEach(link => {
        // লিংকের href-এর সাথে বর্তমান পেজের নাম মিলে গেলে active ক্লাস যুক্ত হবে
        if (link.getAttribute('href').includes(currentPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
