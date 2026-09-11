document.addEventListener("DOMContentLoaded", function() {
  const path = window.location.pathname;
  let activePage = 'home';

  if (path.includes('study')) activePage = 'study';
  else if (path.includes('practice')) activePage = 'practice';
  else if (path.includes('analytics') || path.includes('stats')) activePage = 'analytics';
  else if (path.includes('profile')) activePage = 'profile';
  else if (path.includes('dashboard') || path.includes('home')) activePage = 'home';

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
        /* सहज रूपमा ट्रान्जिसन हुनका लागि */
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .bottom-nav.nav-hidden {
        transform: translateY(110%);
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

  const navHTML = `
    <div class="bottom-nav" id="mainBottomNav">
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

  // यदि स्क्रिनको चौडाइ ७६८px भन्दा सानो (मोबाइल) छ भने मात्र Bottom Nav देखाउने
if (window.innerWidth <= 768) {
  document.body.insertAdjacentHTML('beforeend', navHTML);
}


  document.body.insertAdjacentHTML('beforeend', navHTML);

  // भरपर्दो स्क्रोल डिटेक्टर
  let lastScrollTop = 0;
  const bottomNav = document.getElementById('mainBottomNav');
  const delta = 5; // कम्तिमा कति पिक्सेल स्क्रोल हुँदा पत्ता लगाउने

  window.addEventListener('scroll', function() {
    let st = window.pageYOffset || document.documentElement.scrollTop;

    // यदि स्क्रोल धेरै सानो छ भने इग्नोर गर्ने
    if (Math.abs(lastScrollTop - st) <= delta) return;

    if (st > lastScrollTop && st > 20) {
      // तल जाँदा (Scroll Down) लुकाउने
      bottomNav.classList.add('nav-hidden');
    } else {
      // माथि आउँदा (Scroll Up) देखाउने
      bottomNav.classList.remove('nav-hidden');
    }
    lastScrollTop = st <= 0 ? 0 : st;
  }, false);
});
