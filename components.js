// यो फंक्सन्सले स्वतः ५ वटा bottom navigation bar लाई पेजको अन्त्यमा थपिदिन्छ र active पेजलाई हाइलाइट गर्छ
function loadBottomNav(activePage) {
  // नेभिगेसन बारको लागि आवश्यक CSS स्टाइल स्वतः इन्जेक्ट गर्ने
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
      .nav-link i { 
        font-size: 18px; 
      }
      .nav-link.active { 
        color: #2563eb !important; 
        font-weight: 700;
      }
      .nav-link.active i {
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(styleElem);
  }

  // ५ वटै बटनहरूलाई एकै किसिमको संरचना दिइएको HTML
  const navHTML = `
    <div class="bottom-nav">
      <a href="dashboard.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">
        <i class="fa-solid fa-house"></i>
        <span>Home</span>
      </a>
      <a href="study.html" class="nav-link ${activePage === 'study' ? 'active' : ''}">
        <i class="fa-solid fa-book-open"></i>
        <span>Study</span>
      </a>
      <a href="practice.html" class="nav-link ${activePage === 'practice' ? 'active' : ''}">
        <i class="fa-solid fa-brain"></i>
        <span>Practice</span>
      </a>
      <a href="analytics.html" class="nav-link ${activePage === 'analytics' ? 'active' : ''}">
        <i class="fa-solid fa-chart-pie"></i>
        <span>Stats</span>
      </a>
      <a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">
        <i class="fa-solid fa-user"></i>
        <span>Profile</span>
      </a>
    </div>
  `;

  // बडीको अन्त्यमा यसलाई इन्जेक्ट गर्ने
  document.body.insertAdjacentHTML('beforeend', navHTML);
}
// पेज लोड हुँदा अटोमेटिक पपअप मोडल DOM मा इन्जेक्ट (Inject) गर्ने
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById('successModal')) {
    const modalHTML = `
      <div id="successModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
        <div style="background: #ffffff; padding: 24px; border-radius: 20px; width: 90%; max-width: 320px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15); animation: scaleUp 0.3s ease;">
          <div style="width: 55px; height: 55px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px auto;">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">सफल भयो!</h3>
          <p id="popupMessage" style="font-size: 13px; color: #64748b; margin-bottom: 20px;">तपाईंको कार्य सफलतापूर्वक पूरा भयो।</p>
          <button id="popupOkBtn" style="background: #2563eb; color: white; border: none; width: 100%; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer;">ठीक्क छ (OK)</button>
        </div>
      </div>
      <style>
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
});

// ग्लोबल फंक्सन - जसलाई जुनसुकै पेजबाट कल गर्न सकिन्छ
window.showSuccessPopup = function(message, redirectUrl) {
  const modal = document.getElementById('successModal');
  const msgEl = document.getElementById('popupMessage');
  const okBtn = document.getElementById('popupOkBtn');
  
  if(msgEl) msgEl.textContent = message;
  if(modal) modal.style.display = 'flex';

  if(okBtn) {
    okBtn.onclick = function() {
      modal.style.display = 'none';
      if(redirectUrl) {
        window.location.href = redirectUrl;
      }
    };
  }
};

