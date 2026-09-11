document.addEventListener("DOMContentLoaded", function () {
  // १. आकर्षक Header HTML
  const headerHTML = `
    <header class="app-global-header">
      <div class="header-content">
        <a href="dashboard.html" class="brand-logo">
          <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          <span class="brand-text">LoksewaQuest</span>
        </a>
        <div class="header-actions">
          <a href="dashboard.html" class="header-icon-btn" title="ड्यासबोर्ड"><i class="fa-solid fa-house"></i></a>
        </div>
      </div>
    </header>
  `;

  // २. आकर्षक Footer HTML
  const footerHTML = `
    <footer class="app-global-footer">
      <div class="footer-content">
        <p>&copy; 2026 <strong>LoksewaQuest</strong>. All rights reserved.</p>
        <p class="footer-sub">लोकसेवा आयोग तयारी डिजिटल चौतारी</p>
      </div>
    </footer>
  `;

  // ३. अटोमेटिक Header इन्जेक्ट गर्ने (बडीको सुरुमा)
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // ४. अटोमेटिक Footer इन्जेक्ट गर्ने (बडीको अन्त्यमा)
  document.body.insertAdjacentHTML('beforeend', footerHTML);
});
