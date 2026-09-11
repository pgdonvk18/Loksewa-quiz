document.addEventListener("DOMContentLoaded", function () {
  // १. css/footer.css फाइललाई अटोमेटिक <head> मा लिङ्क गर्ने
  if (!document.querySelector('link[href="css/footer.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/footer.css';
    document.head.appendChild(link);
  }

  // २. आकर्षक Footer HTML
  const footerHTML = `
    <footer class="app-global-footer">
      <div class="footer-glow"></div>
      <div class="footer-content">
        <div class="footer-brand">
          <div class="footer-logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          <span class="footer-title">LoksewaQuest</span>
        </div>
        <p class="footer-desc">लोकसेवा आयोग तथा अन्य प्रतिस्पर्धात्मक परीक्षा तयारीका लागि भरपर्दो डिजिटल चौतारी।</p>
        <div class="footer-divider"></div>
        <div class="footer-bottom-row">
          <p>&copy; 2026 <strong>LoksewaQuest</strong>. All rights reserved.</p>
          <div class="footer-links">
            <a href="dashboard.html">ड्यासबोर्ड</a>
            <span>•</span>
            <a href="404.html">सम्पर्क</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  // ३. बडीको अन्त्यमा Footer इन्जेक्ट गर्ने
  document.body.insertAdjacentHTML('beforeend', footerHTML);
});
