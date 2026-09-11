document.addEventListener("DOMContentLoaded", function() {
  const path = window.location.pathname;
  let activePage = 'home';

  if (path.includes('study')) activePage = 'study';
  else if (path.includes('practice')) activePage = 'practice';
  else if (path.includes('analytics') || path.includes('stats')) activePage = 'analytics';
  else if (path.includes('profile')) activePage = 'profile';
  else if (path.includes('dashboard') || path.includes('home')) activePage = 'home';

  const isDesktop = window.innerWidth > 768;

  // पुरानो डुप्लिकेट नेभिगेसन वा हेडर हटाउने सुरक्षा जाँच
  const existingNav = document.querySelector('.bottom-nav');
  if (existingNav) existingNav.remove();

  const existingHeader = document.querySelector('.desktop-header');
  if (existingHeader) existingHeader.remove();

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
        // मोबाइलका लागि सफا र मिलेको Bottom Nav HTML
    const mobileNavHTML = `
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

    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    // मोबाइलमा स्क्रोल गर्दा लुक्ने लजिक
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
