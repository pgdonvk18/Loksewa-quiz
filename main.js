// १. पपअपको HTML संरचना (HTML Structure) आफैँ वेब पेजमा थप्ने फंक्सन
function injectGlobalPopup() {
  if (document.getElementById('globalPopup')) return; // यदि पहिले नै छ भने दोहोर्याएर नथप्ने

  const popupHTML = `
    <div id="globalPopup" class="custom-popup-overlay">
      <div class="custom-popup-box">
        <div id="popupIcon" class="popup-icon-container success">
          <i id="popupIconClass" class="fa-solid fa-check"></i>
        </div>
        <h3 id="popupTitle">सुचना</h3>
        <p id="popupMessage">यहाँ म्यासेज देखिनेछ...</p>
        <button class="popup-btn" onclick="closePopup()">ठीक छ (OK)</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// २. पपअपको लागि आवश्यक पर्ने CSS डिजाइन (Styles) आफैँ पेजमा इन्जेक्ट गर्ने
function injectGlobalStyles() {
  if (document.getElementById('globalPopupStyles')) return;

  const styleCSS = `
    <style id="globalPopupStyles">
      .custom-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      .custom-popup-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      .custom-popup-box {
        background: #ffffff;
        width: 90%;
        max-width: 380px;
        border-radius: 24px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      .custom-popup-overlay.active .custom-popup-box {
        transform: scale(1);
      }
      .popup-icon-container {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin: 0 auto 16px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .popup-icon-container.success { background: #dcfce7; color: #16a34a; }
      .popup-icon-container.error { background: #fee2e2; color: #dc2626; }
      .popup-icon-container.info { background: #e0f2fe; color: #0284c7; }

      .custom-popup-box h3 {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
      }
      .custom-popup-box p {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 24px;
        line-height: 1.5;
      }
      .popup-btn {
        background: #2563eb;
        color: white;
        border: none;
        width: 100%;
        padding: 12px;
        border-radius: 14px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .popup-btn:hover {
        background: #1d4ed8;
      }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styleCSS);
}

// ३. ग्लोबल पपअप देखाउने फंक्सन
window.showPopup = function(title, message, type = 'success', callback = null) {
  injectGlobalStyles();
  injectGlobalPopup();

  const popup = document.getElementById('globalPopup');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');
  const popupIcon = document.getElementById('popupIcon');
  const popupIconClass = document.getElementById('popupIconClass');

  popupTitle.textContent = title;
  popupMessage.textContent = message;

  popupIcon.className = "popup-icon-container " + type;
  if (type === 'success') {
    popupIconClass.className = "fa-solid fa-check";
  } else if (type === 'error') {
    popupIconClass.className = "fa-solid fa-triangle-exclamation";
  } else {
    popupIconClass.className = "fa-solid fa-circle-info";
  }

  popup.classList.add('active');
  window.popupCallback = callback;
};

// ४. पपअप बन्द गर्ने फंक्सन
window.closePopup = function() {
  const popup = document.getElementById('globalPopup');
  if (popup) {
    popup.classList.remove('active');
  }

  if (typeof window.popupCallback === 'function') {
    window.popupCallback();
    window.popupCallback = null;
  }
};
