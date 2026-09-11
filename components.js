function loadBottomNav(activePage = 'home') {
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
}
