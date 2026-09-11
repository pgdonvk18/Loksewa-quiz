document.addEventListener("DOMContentLoaded", function() {
  const path = window.location.pathname;
  let activePage = 'home';

  if (path.includes('study')) activePage = 'study';
  else if (path.includes('practice')) activePage = 'practice';
  else if (path.includes('analytics') || path.includes('stats')) activePage = 'analytics';
  else if (path.includes('profile')) activePage = 'profile';
  else if (path.includes('dashboard') || path.includes('home')) activePage = 'home';

  const isDesktop = window.innerWidth > 768;

  if (!document.getElementById('responsive-layout-style')) {
    const styleElem = document.createElement('style');
    styleElem.id = 'responsive-layout-style';
    styleElem.innerHTML = `
      /* --- मोबाइलको लागि मात्र (७६८px वा कम) --- */
      @media (max-width: 768px) {
        .desktop-header { display: none !important; }
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
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bottom-nav.nav-hidden { transform: translateY(110%); }
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
        }
        .nav-link i { font-size: 18px; }
        .nav-link.active { color: #2563eb !important; font-weight: 700; }
      }

      /* --- विन्डोज / कम्प्युटरको लागि मात्र (७६८px भन्दा ठूलो) --- */
      @media (min-width: 769px) {
        .bottom-nav { display: none !important; }
        
        body {
          background: #f1f5f9 !important;
          padding-bottom: 40px !important;
        }

        /* मुख्य कन्टेनरलाई डेस्कटपमा फराकिलो बनाउने */
        .container, .profile-header, .stats-grid, .menu-card {
          max-width: 1100px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        /* डेस्कटपको लागि माथिल्लो 헤डर (Top Navigation Bar) */
        .desktop-header {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px;
          z-index: 1000;
        }

        .desktop-logo {
          font-size: 20px;
          font-weight: 800;
          color: #2563eb;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .desktop-nav-links {
          display: flex;
          gap: 25px;
          align-items: center;
        }

        .desktop-link {
          text-decoration: none;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .desktop-link:hover {
          background: #f8fafc;
          color: #2563eb;
        }

        .desktop-link.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 700;
        }

        /* डेस्कटपमा ग्रिड र बक्सहरूलाई मिलाउने */
        .stats-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 20px !important;
        }
      }
    `;
    document.head.appendChild(styleElem);
  }

  if (isDesktop) {
    // विन्डोज/कम्प्युटरका लागि माथिल्लो Header इन्जेक्ट गर्ने
    const desktopHeaderHTML = `
      <header class="desktop-header">
        <a href="dashboard.html" class="desktop-logo">
          <i class="fa-solid fa-graduation-cap"></i> LoksewaQuest
        </a>
        <nav class="desktop-nav-links">
          <a href="dashboard.html" class="desktop-link ${activePage === 'home' ? 'active' : ''}"><i class="fa-solid fa-house"></i> Home</a>
          <a href="study.html" class="desktop-link ${activePage === 'study' ? 'active' : ''}"><i class="fa-solid fa-book-open"></i> Study</a>
          <a href="practice.html" class="desktop-link ${activePage === 'practice' ? 'active' : ''}"><i class="fa-solid fa-brain"></i> Practice</a>
          <a href="analytics.html" class="desktop-link ${activePage === 'analytics' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i> Stats</a>
          <a href="profile.html" class="desktop-link ${activePage === 'profile' ? 'active' : ''}"><i class="fa-solid fa-user"></i> Profile</a>
        </nav>
      </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', desktopHeaderHTML);
  } else {
    // मोबाइलका लागि तलको Bottom Nav इन्जेक्ट गर्ने
    const mobileNavHTML = `
      <div class="bottom-nav" id="mainBottomNav">
        <a href="dashboard.html" class="nav-link ${activePage === 'home' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home</span></a>
        <a href="study.html" class="nav-link ${activePage === 'study' ? 'active' : ''}"><i class="fa-solid fa-book-open"></i><span>Study</span></a>
        <a href="practice.html" class="nav-link ${activePage === 'practice' ? 'active' : ''}"><i class="fa-solid fa-brain"></i><span>Practice</span></a>
        <a href="analytics.html" class="nav-link ${activePage === 'analytics' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i><span>Stats</span></a>
        <a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}"><i class="fa-solid fa-user"></i><span>Profile</span></a>
      </div>
    `;
      // यदि पेजमा पहिल्यै कुनै nav वा header छ भने हटाउने (Double Guard)
  const existingNav = document.querySelector('.bottom-nav');
  if (existingNav) existingNav.remove();

  const existingHeader = document.querySelector('.desktop-header');
  if (existingHeader) existingHeader.remove();

  if (isDesktop) {
    // विन्डोज/कम्प्युटरका लागि मात्र माथिल्लो Header इन्जेक्ट गर्ने
    const desktopHeaderHTML = `
      <header class="desktop-header">
        <a href="dashboard.html" class="desktop-logo">
          <i class="fa-solid fa-graduation-cap"></i> LoksewaQuest
        </a>
        <nav class="desktop-nav-links">
          <a href="dashboard.html" class="desktop-link ${activePage === 'home' ? 'active' : ''}"><i class="fa-solid fa-house"></i> Home</a>
          <a href="study.html" class="desktop-link ${activePage === 'study' ? 'active' : ''}"><i class="fa-solid fa-book-open"></i> Study</a>
          <a href="practice.html" class="desktop-link ${activePage === 'practice' ? 'active' : ''}"><i class="fa-solid fa-brain"></i> Practice</a>
          <a href="analytics.html" class="desktop-link ${activePage === 'analytics' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i> Stats</a>
          <a href="profile.html" class="desktop-link ${activePage === 'profile' ? 'active' : ''}"><i class="fa-solid fa-user"></i> Profile</a>
        </nav>
      </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', desktopHeaderHTML);
  } else {
    // मोबाइलका लागि मात्र तलको Bottom Nav इन्जेक्ट गर्ने
    const mobileNavHTML = `
      <div class="bottom-nav" id="mainBottomNav">
        <a href="dashboard.html" class="nav-link ${activePage === 'home' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home</span></a>
        <a href="study.html" class="nav-link ${activePage === 'study' ? 'active' : ''}"><i class="fa-solid fa-book-open"></i><span>Study</span></a>
        <a href="practice.html" class="nav-link ${activePage === 'practice' ? 'active' : ''}"><i class="fa-solid fa-brain"></i><span>Practice</span></a>
        <a href="analytics.html" class="nav-link ${activePage === 'analytics' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i><span>Stats</span></a>
        <a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}"><i class="fa-solid fa-user"></i><span>Profile</span></a>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    let lastScrollTop = 0;
    const bottomNav = document.getElementById('mainBottomNav');
    window.addEventListener('scroll', function() {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop && st > 20) {
        bottomNav.classList.add('nav-hidden');
      } else {
        bottomNav.classList.remove('nav-hidden');
      }
      lastScrollTop = st <= 0 ? 0 : st;
    }, false);
  }

    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    // मोबाइलमा मात्र स्क्रोल गर्दा लुक्ने लजिक
    let lastScrollTop = 0;
    const bottomNav = document.getElementById('mainBottomNav');
    window.addEventListener('scroll', function() {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop && st > 20) {
        bottomNav.classList.add('nav-hidden');
      } else {
        bottomNav.classList.remove('nav-hidden');
      }
      lastScrollTop = st <= 0 ? 0 : st;
    }, false);
  }
});
