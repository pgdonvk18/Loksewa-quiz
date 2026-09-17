document.addEventListener("DOMContentLoaded", () => {
  // 1. Google Translate Element को लागि आवश्यक hidden div बनाउने
  if (!document.getElementById('google_translate_element')) {
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'google_translate_element';
    hiddenDiv.style.display = 'none';
    document.body.appendChild(hiddenDiv);
  }

  // 2. Slide Toggle को CSS Style इन्जेक्ट गर्ने
  if (!document.getElementById('lang-switch-style')) {
    const style = document.createElement('style');
    style.id = 'lang-switch-style';
    style.innerHTML = `
      .lang-switch-container {
        display: flex;
        align-items: center;
        background: #f1f5f9;
        border-radius: 20px;
        padding: 2px;
        position: relative;
        cursor: pointer;
        border: 1px solid #cbd5e1;
        margin-left: 8px;
      }
      .lang-option {
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 800;
        color: #475569;
        z-index: 2;
        user-select: none;
      }
      .lang-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 28px;
        height: 24px;
        background: #2563eb;
        border-radius: 14px;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
      }
      .lang-switch-container.en-active .lang-slider {
        transform: translateX(28px);
      }
      .lang-switch-container.en-active .lang-option:last-child {
        color: #ffffff;
      }
      .lang-switch-container:not(.en-active) .lang-option:first-child {
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);
  }

  // 3. Header (.top-nav वा .app-header) को दायाँतिर Slide Toggle Button राख्ने
  const header = document.querySelector('.top-nav') || document.querySelector('.app-header');
  if (header && !document.getElementById('lang-switch')) {
    const toggleHTML = `
      <div id="lang-switch" class="lang-switch-container" onclick="toggleLanguage()">
        <div class="lang-slider"></div>
        <span class="lang-option">ने</span>
        <span class="lang-option">EN</span>
      </div>
    `;
    // हेडरको सबैभन्दा अन्त्यमा (दायाँतिर) थप्ने
    header.insertAdjacentHTML('beforeend', toggleHTML);
  }

  // 4. Google Translate Script लोड गर्ने
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
    setTimeout(() => triggerGoogleTranslate(lang), 500);
  }
}
