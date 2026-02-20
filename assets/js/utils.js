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
