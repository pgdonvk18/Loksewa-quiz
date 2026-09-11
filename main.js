// १. अटोमेटिक HTML र CSS पेजमा थप्ने (DOM लोड हुनेबित्तिकै)
document.addEventListener("DOMContentLoaded", function() {
  if (!document.getElementById('globalPopup')) {
    const popupHTML = `
      <div id="globalPopup" class="custom-popup-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; opacity: 0; visibility: hidden; transition: all 0.3s ease;">
        <div class="custom-popup-box" style="background: #ffffff; width: 90%; max-width: 380px; border-radius: 24px; padding: 24px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); transform: scale(0.9); transition: transform 0.3s ease;">
          <div id="popupIcon" class="popup-icon-container success" style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 24px; background: #dcfce7; color: #16a34a;">
            <i id="popupIconClass" class="fa-solid fa-check"></i>
          </div>
          <h3 id="popupTitle" style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">सुचना</h3>
          <p id="popupMessage" style="font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.5;">म्यासेज...</p>
          <button onclick="closePopup()" style="background: #2563eb; color: white; border: none; width: 100%; padding: 12px; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer;">ठीक छ (OK)</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }
});

// २. ग्लोबल पपअप देखाउने फंक्सन
window.showPopup = function(title, message, type = 'success', callback = null) {
  const popup = document.getElementById('globalPopup');
  if (!popup) {
    alert(message); // यदि कुनै कारणवश पपअप फेला परेन भने डिफल्ट alert देखाइहाल्छ
    if (callback) callback();
    return;
  }

  document.getElementById('popupTitle').textContent = title;
  document.getElementById('popupMessage').textContent = message;

  const popupIcon = document.getElementById('popupIcon');
  const popupIconClass = document.getElementById('popupIconClass');

  if (type === 'success') {
    popupIcon.style.background = '#dcfce7';
    popupIcon.style.color = '#16a34a';
    popupIconClass.className = "fa-solid fa-check";
  } else {
    popupIcon.style.background = '#fee2e2';
    popupIcon.style.color = '#dc2626';
    popupIconClass.className = "fa-solid fa-triangle-exclamation";
  }

  popup.style.opacity = '1';
  popup.style.visibility = 'visible';
  popup.querySelector('.custom-popup-box').style.transform = 'scale(1)';

  window.popupCallback = callback;
};

// ३. पपअप बन्द गर्ने फंक्सन
window.closePopup = function() {
  const popup = document.getElementById('globalPopup');
  if (popup) {
    popup.style.opacity = '0';
    popup.style.visibility = 'hidden';
    popup.querySelector('.custom-popup-box').style.transform = 'scale(0.9)';
  }

  if (typeof window.popupCallback === 'function') {
    window.popupCallback();
    window.popupCallback = null;
  }
};
