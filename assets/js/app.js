// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // বর্তমানে কোন পেজে আছি তা নির্ধারণ করা
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // রাউটিং লজিক: পেজ অনুযায়ী ডেটা লোড করা
    if (currentPage === 'pillars.html') {
        loadPillarsData();
    }
    // ভবিষ্যতে quran.html বা hadith.html এর জন্য এখানে লজিক যুক্ত হবে
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
