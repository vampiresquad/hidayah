// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // ১. প্রথমেই Header এবং Footer লোড করা
    loadCommonComponents();

    // ২. বর্তমানে কোন পেজে আছি তা নির্ধারণ করা
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // ৩. রাউটিং লজিক: পেজ অনুযায়ী ডেটা লোড করা
    if (currentPage === 'pillars.html') {
        loadPillarsData();
    } else if (currentPage === 'quran.html') {
        // আপাতত ডিফল্টভাবে সূরা আল-ফাতিহা লোড করছি
        loadSurahData('001-al-fatiha.json'); 
    }
});

/**
 * 'ইসলামের ভিত্তি' পেজের জন্য ডেটা লোড ও রেন্ডার করা
 */
async function loadPillarsData() {
    const contentContainer = document.getElementById('content-container');
    
    // লোডিং স্টেটমেন্ট দেখানো
    if (contentContainer) {
        contentContainer.innerHTML = '<p class="loading">ডেটা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>';
    }

    // JSON থেকে ডেটা আনা (লোকাল ফাইল পাথ)
    const data = await fetchJSONData('../data/pillars.json');

    if (data && contentContainer) {
        let htmlContent = `
            <header class="page-header">
                <h2>${data.module_name}</h2>
                <p>সর্বশেষ আপডেট: ${data.metadata.last_updated}</p>
            </header>
        `;

        // টপিক এবং সেকশনগুলো লুপ করে HTML তৈরি করা
        data.topics.forEach(topic => {
            htmlContent += `<section class="topic-section">
                <h3 class="topic-title">${topic.title}</h3>`;
            
            topic.sections.forEach(section => {
                htmlContent += `
                    <div class="sub-section">
                        <h4 class="section-subtitle">${section.subtitle}</h4>
                        <p class="intro-text">${section.intro_text}</p>
                        
                        <div class="evidences-container">
                            ${section.evidences.map(evidence => createEvidenceCard(evidence)).join('')}
                        </div>
                    </div>
                `;
            });

            htmlContent += `</section>`;
        });

        // কন্টেইনারে জেনারেট করা HTML বসিয়ে দেওয়া
        contentContainer.innerHTML = htmlContent;
    } else if (contentContainer) {
        contentContainer.innerHTML = '<p class="error">ডেটা লোড করতে ব্যর্থ হয়েছে।</p>';
    }
}

/**
 * নির্দিষ্ট সূরার ডেটা লোড ও রেন্ডার করার ফাংশন
 * @param {string} fileName - JSON ফাইলের নাম
 */
async function loadSurahData(fileName) {
    const surahHeader = document.getElementById('surah-header');
    const ayahContainer = document.getElementById('ayah-container');
    
    if (ayahContainer) {
        ayahContainer.innerHTML = '<p class="loading">কুরআনের আয়াত লোড হচ্ছে...</p>';
    }

    // JSON থেকে ডেটা আনা
    const data = await fetchJSONData(`../data/quran/${fileName}`);

    if (data && surahHeader && ayahContainer) {
        // ১. সূরার হেডার (Surah Meta) রেন্ডার করা
        surahHeader.innerHTML = `
            <h2>সূরা ${data.surah_meta.bangla_name} (${data.surah_meta.arabic_name})</h2>
            <p><strong>অবতীর্ণ:</strong> ${data.surah_meta.revelation_type === 'Meccan' ? 'মাক্কী' : 'মাদানী'} | <strong>আয়াত সংখ্যা:</strong> ${data.surah_meta.total_ayahs}</p>
            <p class="intro-text" style="margin-top: 10px;"><em>${data.surah_meta.intro_tafsir}</em></p>
        `;

        // ২. আয়াতগুলো লুপ করে রেন্ডার করা
        let htmlContent = '';
        data.verses.forEach(verse => {
            htmlContent += `
                <div class="evidence-card ayah-card" style="margin-bottom: 20px;">
                    <div class="evidence-header">
                        <span class="badge badge-quran">আয়াত ${verse.ayah_number}</span>
                    </div>
                    
                    <div class="evidence-body">
                        <p class="arabic-text" dir="rtl">${verse.arabic}</p>
                        <p class="pronunciation-text"><strong>উচ্চারণ:</strong> ${verse.pronunciation}</p>
                        <p class="translation-text"><strong>অর্থ:</strong> ${verse.translation}</p>
                    </div>

                    <div class="evidence-explanation">
                        <strong>সংক্ষিপ্ত তাফসির:</strong> <p>${verse.tafsir}</p>
                    </div>
                    
                    <div class="tags-container" style="margin-top: 15px;">
                        ${verse.tags.map(tag => `<span style="font-size: 0.8rem; background: #eee; padding: 4px 10px; border-radius: 12px; margin-right: 5px; color: #555;">#${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        });

        // ৩. কন্টেইনারে জেনারেট করা HTML বসিয়ে দেওয়া
        ayahContainer.innerHTML = htmlContent;
    } else if (ayahContainer) {
        ayahContainer.innerHTML = '<p class="error">ডেটা লোড করতে ব্যর্থ হয়েছে।</p>';
    }
}
