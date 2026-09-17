// translator.js - Sabai page ma auto-inject hune script
document.addEventListener("DOMContentLoaded", () => {
  // 1. Header ko kunai thau ma slide toggle button automatically inject garne
  const headerContainer = document.querySelector('.app-header > div:last-child') || document.body;
  
  if (!document.getElementById('lang-switch')) {
    const toggleHTML = `
      <div id="google_translate_element" style="display:none;"></div>
      <div id="lang-switch" class="lang-switch-container" onclick="toggleLanguage()" style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 2px; position: relative; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.2);">
        <div class="lang-slider" style="position: absolute; top: 2px; left: 2px; width: 28px; height: 24px; background: #ffffff; border-radius: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1;"></div>
        <span class="lang-option" style="padding: 4px 8px; font-size: 11px; font-weight: 800; color: #ffffff; z-index: 2; user-select: none;">ने</span>
        <span class="lang-option" style="padding: 4px 8px; font-size: 11px; font-weight: 800; color: #ffffff; z-index: 2; user-select: none;">EN</span>
      </div>
    `;
    // Header ko right side ma button thapdine
    const targetDiv = document.querySelector('.app-header') ? document.querySelector('.app-header').lastElementChild : null;
    if(targetDiv) {
      targetDiv.insertAdjacentHTML('afterbegin', toggleHTML);
    }
  }

  // 2. Google Translate Script load garne
  if (!document.getElementById('google-translate-script')) {
    const script1 = document.createElement('script');
    script1.id = 'google-translate-script';
    script1.type = 'text/javascript';
    script1.text = `
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({ pageLanguage: 'ne', includedLanguages: 'en,ne', autoDisplay: false }, 'google_translate_element');
      }
    `;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script2);
  }
});

// Language Toggle Logic
let currentLang = 'ne';
function toggleLanguage() {
  const switchEl = document.getElementById('lang-switch');
  if(!switchEl) return;
  
  switchEl.classList.toggle('en-active');
  const slider = switchEl.querySelector('.lang-slider');
  if (switchEl.classList.contains('en-active')) {
    slider.style.transform = 'translateX(28px)';
    currentLang = 'en';
  } else {
    slider.style.transform = 'translateX(0px)';
    currentLang = 'ne';
  }
  
  triggerGoogleTranslate(currentLang);
}

function triggerGoogleTranslate(lang) {
  const selectField = document.querySelector('.goog-te-combo');
  if (selectField) {
    selectField.value = lang;
    selectField.dispatchEvent(new Event('change'));
  } else {
    setTimeout(() => triggerGoogleTranslate(lang), 400);
  }
}
