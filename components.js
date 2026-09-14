// १. अटोमेटिक Bottom Navigation Bar इन्जेक्ट गर्ने फंक्सन
function loadBottomNav(activePage) {
  if (!document.getElementById('bottom-nav-style')) {
    const styleElem = document.createElement('style');
    styleElem.id = 'bottom-nav-style';
    styleElem.innerHTML = `
      .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #ffffff;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 8px 4px 14px 4px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        border-radius: 20px 20px 0 0;
        z-index: 1000;
      }
      .nav-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-decoration: none;
        color: #94a3b8;
        font-size: 10px;
        font-weight: 600;
        gap: 3px;
        flex: 1;
        transition: color 0.2s ease;
      }
      .nav-link i { font-size: 18px; }
      .nav-link.active { color: #2563eb !important; font-weight: 700; }
      .nav-link.active i { transform: translateY(-2px); }
    `;
    document.head.appendChild(styleElem);
  }

  const navHTML = `
    <div class="bottom-nav">
      <a href="dashboard.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">
        <i class="fa-solid fa-house"></i><span>Home</span>
      </a>
      <a href="study.html" class="nav-link ${activePage === 'study' ? 'active' : ''}">
        <i class="fa-solid fa-book-open"></i><span>Study</span>
      </a>
      <a href="practice.html" class="nav-link ${activePage === 'practice' ? 'active' : ''}">
        <i class="fa-solid fa-brain"></i><span>Practice</span>
      </a>
      <a href="analytics.html" class="nav-link ${activePage === 'analytics' ? 'active' : ''}">
        <i class="fa-solid fa-chart-pie"></i><span>Stats</span>
      </a>
      <a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">
        <i class="fa-solid fa-user"></i><span>Profile</span>
      </a>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', navHTML);
}

// २. पेज लोड हुँदा ग्लोबल पपअप र कन्फर्मेसन मोडलहरू इन्जेक्ट गर्ने
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById('customGlobalModal')) {
    const modalHTML = `
      <!-- Success/Error/Warning Modal -->
      <div id="customGlobalModal" class="cg-modal-overlay">
        <div class="cg-modal-card">
          <div id="cgModalIconBox" class="cg-icon-box success">
            <i id="cgModalIcon" class="fa-solid fa-check"></i>
          </div>
          <h3 id="cgModalTitle" class="cg-title">सफल भयो!</h3>
          <p id="cgModalMessage" class="cg-message">तपाईंको कार्य सफलतापूर्वक पूरा भयो।</p>
          <button id="cgModalBtn" class="cg-btn">ठीक्क छ (OK)</button>
        </div>
      </div>

      <!-- Confirm Modal -->
      <div id="customConfirmModal" class="cg-modal-overlay">
        <div class="cg-modal-card">
          <div class="cg-icon-box warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3 id="cgConfirmTitle" class="cg-title">पुष्टि गर्नुहोस्</h3>
          <p id="cgConfirmMessage" class="cg-message">के तपाईं यो कार्य गर्न चाहनुहुन्छ?</p>
          <div style="display: flex; gap: 10px;">
            <button id="cgCancelBtn" style="background: #e2e8f0; color: #475569;" class="cg-btn">रद्द गर्ने (Cancel)</button>
            <button id="cgOkBtn" class="cg-btn">हुन्छ (OK)</button>
          </div>
        </div>
      </div>

      <style>
        .cg-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px); z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; visibility: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cg-modal-overlay.active { opacity: 1; visibility: visible; }
        .cg-modal-card {
          background: #ffffff; width: 88%; max-width: 340px; border-radius: 24px;
          padding: 28px 24px; text-align: center; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.2);
          transform: scale(0.85) translateY(20px); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .cg-modal-overlay.active .cg-modal-card { transform: scale(1) translateY(0); }
        .cg-icon-box {
          width: 65px; height: 65px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 18px auto;
          box-shadow: 0 10px 20px rgba(0,0,0,0.08);
        }
        .cg-icon-box.success { background: #dcfce7; color: #16a34a; }
        .cg-icon-box.error { background: #fee2e2; color: #dc2626; }
        .cg-icon-box.warning { background: #fef3c7; color: #d97706; }
        .cg-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .cg-message { font-size: 13.5px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }
        .cg-btn {
          width: 100%; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white; border: none; padding: 13px; border-radius: 14px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .cg-btn:active { transform: scale(0.97); }
      </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
});

// ३. ग्लोबल पपअप फंक्सन (Success, Error, Warning)
window.showSuccessPopup = function(message, redirectUrl, type = 'success', titleText = '') {
  const modal = document.getElementById('customGlobalModal');
  const msgEl = document.getElementById('cgModalMessage');
  const titleEl = document.getElementById('cgModalTitle');
  const iconBox = document.getElementById('cgModalIconBox');
  const iconEl = document.getElementById('cgModalIcon');
  const okBtn = document.getElementById('cgModalBtn');
  
  if (msgEl) msgEl.textContent = message;
  
  iconBox.className = `cg-icon-box ${type}`;
  if (type === 'success') {
    if (!titleText) titleText = 'सफल भयो! 🎉';
    iconEl.className = 'fa-solid fa-check';
  } else if (type === 'error') {
    if (!titleText) titleText = 'त्रुटि (Error)! ❌';
    iconEl.className = 'fa-solid fa-triangle-exclamation';
  } else if (type === 'warning') {
    if (!titleText) titleText = 'सचेत गराइएको छ! ⚠️';
    iconEl.className = 'fa-solid fa-circle-exclamation';
  }
  if (titleEl) titleEl.textContent = titleText;

  if (modal) modal.classList.add('active');

  if (okBtn) {
    okBtn.onclick = function() {
      modal.classList.remove('active');
      if (redirectUrl) {
        setTimeout(() => { window.location.href = redirectUrl; }, 200);
      }
    };
  }
};

// ४. कन्फर्मेसन (Cancel / OK) पपअपको लागि ग्लोबल फंक्सन (अलग राखिएको)
window.showConfirmPopup = function(message, onConfirm, titleText = 'पुष्टि गर्नुहोस् ⚠️') {
  const modal = document.getElementById('customConfirmModal');
  const msgEl = document.getElementById('cgConfirmMessage');
  const titleEl = document.getElementById('cgConfirmTitle');
  const okBtn = document.getElementById('cgOkBtn');
  const cancelBtn = document.getElementById('cgCancelBtn');

  if (msgEl) msgEl.textContent = message;
  if (titleEl) titleEl.textContent = titleText;
  if (modal) modal.classList.add('active');

  okBtn.onclick = function() {
    modal.classList.remove('active');
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  cancelBtn.onclick = function() {
    modal.classList.remove('active');
  };
};
