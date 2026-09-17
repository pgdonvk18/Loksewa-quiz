document.addEventListener("DOMContentLoaded", () => {
  // 1. Google Translate Element को लागि आवश्यक hidden div बनाउने
  if (!document.getElementById('google_translate_element')) {
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'google_translate_element';
    hiddenDiv.style.display = 'none';
    document.body.appendChild(hiddenDiv);
  }

  // 2. Professional & Modern Slide Toggle को CSS Style इन्जेक्ट गर्ने
  if (!document.getElementById('lang-switch-style')) {
    const style = document.createElement('style');
    style.id = 'lang-switch-style';
    style.innerHTML = `
      .lang-switch-container {
        display: inline-flex;
        align-items: center;
        background: rgba(241, 245, 249, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-radius: 30px;
        padding: 3px;
        position: relative;
        cursor: pointer;
        border: 1px solid rgba(203, 213, 225, 0.8);
        margin-bottom: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .lang-switch-container:hover {
        border-color: #2563eb;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.12);
      }
      .lang-option {
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 800;
        color: #64748b;
        z-index: 2;
        user-select: none;
        letter-spacing: 0.3px;
        transition: color 0.2s ease;
      }
      .lang-slider {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 44px;
        height: 28px;
        background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
        border-radius: 20px;
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
      }
      .lang-switch-container.en-active .lang-slider {
        transform: translateX(44px);
      }
      .lang-switch-container.en-active .lang-option:last-child {
        color: #ffffff;
      }
      .lang-switch-container:not(.en-active) .lang-option:first-child {
        color: #ffffff;
      }
      
      /* गुगल ट्रान्सलेटले माथि थप्ने ब्यानर र स्पेस हटाउनको लागि */
      .goog-te-banner-frame { display: none !important; }
      body { top: 0px !important; position: static !important; }
      .skiptranslate { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  // 3. Quiz Screen को भित्र प्रश्न देखाउने ठाउँको ठ्याक्कै माथि Professional Slide Toggle Button राख्ने
  const quizScreen = document.getElementById('quiz-screen');
  if (quizScreen && !document.getElementById('lang-switch')) {
    const toggleHTML = `
      <div id="lang-switch" class="lang-switch-container" onclick="toggleLanguage()" title="भाषा परिवर्तन गर्नुहोस् / Change Language">
        <div class="lang-slider"></div>
        <span class="lang-option">नेपाली</span>
        <span class="lang-option">English</span>
      </div>
    `;
    const progressSection = quizScreen.querySelector('.progress-section');
    if (progressSection) {
      progressSection.insertAdjacentHTML('afterend', toggleHTML);
    }
  }

  // 4. पहिले नै अंग्रेजी छनोट भएको छ भने स्विचको स्टेट मिलाउने
  setTimeout(() => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      if (cookie.trim().startsWith('googtrans=')) {
        if (cookie.includes('/ne/en')) {
          currentLang = 'en';
          const switchEl = document.getElementById('lang-switch');
          if (switchEl) switchEl.classList.add('en-active');
        }
      }
    }
  }, 300);

  // 5. Google Translate Script लोड गर्ने
  if (!document.getElementById('google-translate-api')) {
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({
          pageLanguage: 'ne',
          includedLanguages: 'en,ne',
          autoDisplay: false
        }, 'google_translate_element');
      }
    `;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.id = 'google-translate-api';
    script2.type = 'text/javascript';
    script2.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script2);
  }
});

// भाषा परिवर्तन गर्ने फंक्सन
let currentLang = 'ne';
function toggleLanguage() {
  const switchEl = document.getElementById('lang-switch');
  if (!switchEl) return;
  
  switchEl.classList.toggle('en-active');
  currentLang = currentLang === 'ne' ? 'en' : 'ne';
  
  triggerGoogleTranslate(currentLang);
}

function triggerGoogleTranslate(lang) {
  const selectField = document.querySelector('.goog-te-combo');
  if (selectField) {
    selectField.value = lang;
    selectField.dispatchEvent(new Event('change'));
  } else {
    // यदि ड्रपडाउन अझै लोड भइसकेको छैन भने अलिकति पछि फेरि प्रयास गर्ने
    setTimeout(() => triggerGoogleTranslate(lang), 300);
  }
}
