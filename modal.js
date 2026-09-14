// modal.js - Global Custom Popup Component
(function() {
  // 1. Inject CSS into Head
  const style = document.createElement('style');
  style.innerHTML = `
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 42, 74, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; opacity: 0; pointer-events: none; transition: all 0.3s ease; }
    .modal-overlay.active { opacity: 1; pointer-events: auto; }
    .custom-modal { background: white; width: 90%; max-width: 320px; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transform: scale(0.9); transition: transform 0.3s ease; }
    .modal-overlay.active .custom-modal { transform: scale(1); }
    .modal-icon { font-size: 40px; margin-bottom: 12px; }
    .modal-title { font-size: 18px; font-weight: 800; color: #0f2a4a; margin-bottom: 8px; }
    .modal-desc { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.4; }
    .modal-btn { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; width: 100%; }
    .modal-btn:hover { background: #1d4ed8; }
  `;
  document.head.appendChild(style);

  // 2. Inject HTML into Body
  const modalHTML = `
    <div class="modal-overlay" id="customModal">
      <div class="custom-modal">
        <div class="modal-icon" id="modalIcon">🎉</div>
        <div class="modal-title" id="modalTitle">शीर्षक</div>
        <div class="modal-desc" id="modalDesc">विवरण यहाँ आउनेछ...</div>
        <button class="modal-btn" onclick="closeCustomModal()">ठिक छ (OK)</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
})();

// 3. Global Functions to Show/Hide Popup
function showPopup(title, desc, icon = "🎉") {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalDesc').innerText = desc;
  document.getElementById('modalIcon').innerText = icon;
  document.getElementById('customModal').classList.add('active');
}

function closeCustomModal() {
  document.getElementById('customModal').classList.remove('active');
}
