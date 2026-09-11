// १. पेज लोड हुनेबित्तिकै ग्लोबल पपअपको HTML संरचना अटोमेटिक थप्ने
document.addEventListener("DOMContentLoaded", function() {
  if (!document.getElementById('globalPopup')) {
    const popupHTML = `
      <div id="globalPopup" class="custom-popup-overlay">
        <div class="custom-popup-box">
          <div id="popupIcon" class="popup-icon-container success">
            <i id="popupIconClass" class="fa-solid fa-check"></i>
          </div>
          <h3 id="popupTitle">सुचना</h3>
          <p id="popupMessage">म्यासेज...</p>
          <button class="popup-btn" onclick="closePopup()">ठीक छ (OK)</button>
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
    alert(message);
    if (callback) callback();
    return;
  }

  document.getElementById('popupTitle').textContent = title;
  document.getElementById('popupMessage').textContent = message;

  const popupIcon = document.getElementById('popupIcon');
  const popupIconClass = document.getElementById('popupIconClass');

  popupIcon.className = "popup-icon-container " + type;
  if (type === 'success') {
    popupIconClass.className = "fa-solid fa-check";
  } else {
    popupIconClass.className = "fa-solid fa-triangle-exclamation";
  }

  popup.classList.add('active');
  window.popupCallback = callback;
};

// ३. पपअप बन्द गर्ने फंक्सन
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
