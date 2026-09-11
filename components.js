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
      .nav-link i { font-size: 18px; }
      .nav-link.active { 
        color: #2563eb !important; 
        font-weight: 700;
      }
      .nav-link.active i {
        transform: translateY(-2px);
      }

      /* बीचको Practice बटनको लागि विशेष आकर्षक डिजाइन */
      .nav-link.practice-btn i {
        background: #eff6ff;
        color: #2563eb;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        margin-top: -8px;
        transition: all 0.2s ease;
      }
      .nav-link.practice-btn.active i {
        background: #2563eb !important;
        color: #ffffff !important;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
      }
      .nav-link.practice-btn span {
        color: #64748b;
      }
      .nav-link.practice-btn.active span {
        color: #2563eb !important;
      }
    `;
    document.head.appendChild(styleElem);
  }

  // ५ वटा बटनसहितको HTML संरचना
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
      <a href="practice.html" class="nav-link practice-btn ${activePage === 'practice' ? 'active' : ''}">
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



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkKCU1re5b9MtdsAF1F4xI6rGxmxhGZak",
  authDomain: "loksewaquest-227b6.firebaseapp.com",
  projectId: "loksewaquest-227b6",
  storageBucket: "loksewaquest-227b6.firebasestorage.app",
  messagingSenderId: "779234903809",
  appId: "1:779234903809:web:dd0dd0ffb742e1c218bd00"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// हालको पेजको नाम पत्ता लगाउने (जस्तै login.html मा छ भने चेक गर्नु पर्दैन)
const currentPage = window.location.pathname.split("/").pop();

// यदि युजर लगइन पेजमा छैन भने मात्र सुरक्षा जाँच गर्ने
if (currentPage !== "login.html" && currentPage !== "signup.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // लगइन छैन भने सीधै login.html मा रिडाइरेक्ट गर्ने
      window.location.href = "login.html";
    }
  });
}



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
