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
