import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * युजरको कोइन अपडेट गर्ने र स्वचालित रूपमा coin_history मा रेकर्ड राख्ने फंक्सन
 * @param {object} db - Firestore database instance
 * @param {string} userId - Firebase User UID
 * @param {number} amount - कोइनको मात्रा (बढाउँदा सकारात्मक जस्तै 50, घटाउँदा नकारात्मक जस्तै -20)
 * @param {string} description - कारण (जस्तै: "Speed Blitz खेल जित बापत")
 */
export async function updateUserCoinsWithHistory(db, userId, amount, description) {
  try {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    
    // १. मुख्य युजरको 'coins' field लाई increment/decrement गर्ने
    await updateDoc(userRef, {
      coins: increment(amount)
    });

    // २. ट्रान्जेक्सन इतिहास (coin_history) सब-कलेक्सनमा सेभ गर्ने
    const type = amount >= 0 ? 'earn' : 'spend';
    const historyRef = collection(db, "users", userId, "coin_history");
    
    await addDoc(historyRef, {
      amount: Math.abs(amount), // सधैं पोजिटिभ नम्बर सेभ हुन्छ, type ले earn/spend छुट्याउँछ
      description: description,
      type: type, // 'earn' वा 'spend'
      created_at: serverTimestamp()
    });

    console.log("Coin updated and history logged successfully!");
  } catch (error) {
    console.error("Error updating coins with history:", error);
  }
}

// Global Components (Chat, Footer, Floating Emojis, Room Config, Bottom Nav & Other Pages Header)
(function() {
  // Inject CSS styles dynamically for all global components
  const style = document.createElement('style');
  style.id = 'global-components-style';
  style.innerHTML = `
    /* Global Floating Emoji Animation Container */
    .floating-emoji-container { position: fixed; bottom: 0; right: 20px; width: 100px; height: 100vh; pointer-events: none; overflow: hidden; z-index: 9999; }
    .floating-emoji { position: absolute; font-size: 28px; animation: floatUpGlobal 2s ease-out forwards; opacity: 1; }
    @keyframes floatUpGlobal {
      0% { transform: translateY(0) scale(0.5); opacity: 1; }
      50% { transform: translateY(-220px) scale(1.3) rotate(15deg); opacity: 0.9; }
      100% { transform: translateY(-400px) scale(1) rotate(-15deg); opacity: 0; }
    }

    /* Chat Drawer Styling */
    .chat-drawer { position: fixed; right: -320px; top: 0; width: 300px; height: 100vh; background: white; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: right 0.3s ease; z-index: 10000; box-shadow: -5px 0 15px rgba(0,0,0,0.05); }
    .chat-drawer.open { right: 0; }
    .chat-header-bar { padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .close-chat { background: none; border: none; font-size: 16px; cursor: pointer; color: #64748b; }
    
    .chat-messages { flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #f1f5f9; min-height: 0; }
    .chat-msg { font-size: 12px; background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; word-break: break-word; }
    .chat-msg .c-user { font-weight: 700; color: #2563eb; margin-bottom: 2px; }
    
    /* Quick Emojis Bar */
    .quick-emojis { display: flex; gap: 6px; padding: 8px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; overflow-x: auto; flex-shrink: 0; }
    .emoji-pill { background: white; border: 1px solid #cbd5e1; border-radius: 20px; padding: 4px 8px; font-size: 15px; cursor: pointer; transition: transform 0.1s; }
    .emoji-pill:hover { transform: scale(1.15); background: #e2e8f0; }

    .chat-input-box { padding: 10px 12px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; align-items: center; width: 100%; flex-shrink: 0; }
    .chat-input { flex: 1; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; background: #fff; color: #000; }
    .chat-send-btn { background: #2563eb; color: white; border: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; }

    /* Professional Global Footer Styling */
    .global-site-footer {
      background: #0f2a4a;
      color: #94a3b8;
      padding: 30px 20px 20px 20px;
      font-size: 13px;
      border-top: 1px solid #1e293b;
      margin-top: auto;
      width: 100%;
    }
    .footer-content {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 25px;
      margin-bottom: 25px;
    }
    .footer-col h4 {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .footer-col p, .footer-col a {
      color: #94a3b8;
      text-decoration: none;
      line-height: 1.6;
      display: block;
      margin-bottom: 6px;
      transition: color 0.2s;
    }
    .footer-col a:hover {
      color: #60a5fa;
    }
    .footer-socials {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    .footer-socials a {
      background: rgba(255,255,255,0.08);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
      font-size: 14px;
    }
    .footer-socials a:hover {
      background: #2563eb;
    }
    .footer-bottom {
      max-width: 1100px;
      margin: 0 auto;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      font-size: 12px;
    }
    @media(min-width: 768px) {
      .footer-bottom {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `;
  document.head.appendChild(style);

  // Inject Chat Drawer & Footer Container
  const containerDiv = document.createElement('div');
  containerDiv.innerHTML = `
    <!-- Floating Emoji Animation Container -->
    <div class="floating-emoji-container" id="globalFloatingEmojiContainer"></div>

    <!-- Global Chat Drawer -->
    <div class="chat-drawer" id="globalChatDrawer">
      <div class="chat-header-bar">
        <span>ग्रुप च्याट</span>
        <button type="button" class="close-chat" id="closeChatBtn"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="chat-messages" id="globalChatMessagesContainer">
        <div style="text-align: center; color: #94a3b8; font-size: 11px;">च्याट लोड हुँदैछ...</div>
      </div>
      
      <!-- Quick Emojis Bar -->
      <div class="quick-emojis">
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('👍')">👍</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('🔥')">🔥</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('👏')">👏</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('😂')">😂</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('❤️')">❤️</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('🎯')">🎯</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('😎')">😎</button>
        <button type="button" class="emoji-pill" onclick="sendGlobalQuickEmoji('💡')">💡</button>
      </div>

      <form class="chat-input-box" id="globalChatForm">
        <input type="text" class="chat-input" id="globalChatInputText" placeholder="सन्देश लेख्नुहोस्..." autocomplete="off">
        <button type="submit" class="chat-send-btn"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>

    <!-- Professional Global Footer -->
    <footer class="global-site-footer">
      <div class="footer-content">
        <div class="footer-col">
          <h4>LoksewaQuest</h4>
          <p>लोकसेवा आयोग (Loksewa Aayog) तथा शिक्षक सेवा आयोगका परीक्षार्थीहरूका लागि तयार पारिएको स्मार्ट अनलाइन क्विज र तयारी प्लेटफर्म।</p>
        </div>
        <div class="footer-col">
          <h4>हामीसँग जोडिनुहोस्</h4>
          <p>अपडेट र नयाँ प्रश्नहरूको लागि हाम्रा कम्युनिटीहरूमा जोडिँनुहोस्।</p>
          <div class="footer-socials">
            <a href="https://www.facebook.com/share/1EvbsXtXRD/" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" title="Telegram"><i class="fa-brands fa-telegram"></i></a>
            <a href="#" title="Viber"><i class="fa-brands fa-viber"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 LoksewaQuest. All rights reserved.</span>
        <span>Designed for Aspirants with ❤️ in Nepal</span>
      </div>
    </footer>
  `;

  document.body.appendChild(containerDiv);

  // toggleGlobalChat फंक्सन
  window.toggleGlobalChat = function() {
    const chatDrawer = document.getElementById('globalChatDrawer');
    if (chatDrawer) {
      chatDrawer.classList.toggle('open');
    }
  };

  // बन्द गर्ने बटनमा इभेन्ट जोडिएको
  const closeChatBtn = document.getElementById('closeChatBtn');
  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', window.toggleGlobalChat);
  }

  window.triggerGlobalFloatingEmoji = function(emojiChar) {
    const container = document.getElementById('globalFloatingEmojiContainer');
    if (!container) return;

    const span = document.createElement('span');
    span.className = 'floating-emoji';
    span.innerText = emojiChar;
    
    const randomLeft = Math.floor(Math.random() * 60) + 10;
    span.style.left = randomLeft + 'px';

    container.appendChild(span);

    setTimeout(() => {
      span.remove();
    }, 2000);
  };

  window.sendGlobalQuickEmoji = function(emoji) {
    triggerGlobalFloatingEmoji(emoji);
    if (window.sendChatMessageToDB) {
      window.sendChatMessageToDB(emoji);
    }
  };

  const chatForm = document.getElementById('globalChatForm');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('globalChatInputText');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      if (/^\p{Emoji}+$/u.test(text)) {
        triggerGlobalFloatingEmoji(text);
      }

      if (window.sendChatMessageToDB) {
        window.sendChatMessageToDB(text);
      }
    });
  }
})();

// ग्लोबल कन्फिगरेसन चरहरू (Variables)
window.selectedMaxPlayers = 4;
window.selectedTotalRounds = 3;

window.loadCreateRoomCard = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <h3><i class="fa-solid fa-circle-plus"></i> नयाँ रुम बनाउनुहोस् (Create Room)</h3>
      
      <div class="form-group">
        <label>खेलाडी संख्या (Players Limit):</label>
        <div class="select-grid select-grid-3" id="maxPlayersGroup">
          <button type="button" class="option-btn" data-value="2">1 vs 1 (2)</button>
          <button type="button" class="option-btn" data-value="3">3 जना</button>
          <button type="button" class="option-btn active" data-value="4">4 जना (Max)</button>
        </div>
      </div>

      <div class="form-group">
        <label>कुल राउन्डहरू (Total Rounds):</label>
        <div class="select-grid select-grid-3" id="totalRoundsGroup">
          <button type="button" class="option-btn" data-value="1">१ राउन्ड</button>
          <button type="button" class="option-btn" data-value="2">२ राउन्ड</button>
          <button type="button" class="option-btn active" data-value="3">३ राउन्ड</button>
        </div>
      </div>

      <button class="btn btn-primary" id="createRoomBtn">रुम सुरु गर्नुहोस्</button>
    </div>
  `;

  if (!document.getElementById('room-component-style')) {
    const style = document.createElement('style');
    style.id = 'room-component-style';
    style.innerHTML = `
      .card { background: white; padding: 18px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); margin-bottom: 14px; border: 1px solid #e2e8f0; }
      .card h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #1e40af; display: flex; align-items: center; gap: 8px; }
      .form-group { margin-bottom: 14px; }
      .form-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
      .select-grid { display: grid; gap: 8px; }
      .select-grid-3 { grid-template-columns: repeat(3, 1fr); }
      .option-btn {
        padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1;
        border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569;
        cursor: pointer; text-align: center; transition: all 0.2s ease;
      }
      .option-btn.active {
        background: #eff6ff; border-color: #2563eb; color: #2563eb;
        box-shadow: 0 2px 5px rgba(37, 99, 235, 0.1);
      }
      .btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
      .btn-primary { background: #2563eb; color: white; }
      .btn-primary:hover { background: #1d4ed8; }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('#maxPlayersGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#maxPlayersGroup .option-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      window.selectedMaxPlayers = parseInt(e.target.getAttribute('data-value'));
    });
  });

  document.querySelectorAll('#totalRoundsGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#totalRoundsGroup .option-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      window.selectedTotalRounds = parseInt(e.target.getAttribute('data-value'));
    });
  });
};

window.loadBottomNav = function(activePage) {
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
};

// पपअप र मोडल कोड
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
          <button id="cgModalBtn" class="cg-btn">ठीक छ</button>
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
            <button id="cgCancelBtn" class="cg-btn cg-btn-secondary">रद्द गर्ने</button>
            <button id="cgOkBtn" class="cg-btn">हुन्छ (OK)</button>
          </div>
        </div>
      </div>

      <style>
        .cg-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px); z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; visibility: hidden; transition: all 0.25s ease-in-out;
        }
        .cg-modal-overlay.active { opacity: 1; visibility: visible; }
        .cg-modal-card {
          background: #ffffff; width: 90%; max-width: 360px; border-radius: 24px;
          padding: 26px 20px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: scale(0.9) translateY(15px); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid #f1f5f9;
        }
        .cg-modal-overlay.active .cg-modal-card { transform: scale(1) translateY(0); }
        .cg-icon-box {
          width: 58px; height: 58px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px auto;
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
        }
        .cg-icon-box.success { background: #dcfce7; color: #16a34a; }
        .cg-icon-box.error { background: #fee2e2; color: #dc2626; }
        .cg-icon-box.warning { background: #fef3c7; color: #d97706; }
        .cg-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .cg-message { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; }
        .cg-btn {
          flex: 1; background: #2563eb;
          color: white; border: none; padding: 12px; border-radius: 12px;
          font-weight: 700; font-size: 13.5px; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .cg-btn:hover { background: #1d4ed8; }
        .cg-btn:active { transform: scale(0.97); }
        .cg-btn-secondary {
          background: #f1f5f9; color: #475569;
        }
        .cg-btn-secondary:hover { background: #e2e8f0; }
      </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
});

// ग्लोबल पपअप फंक्सन (Success, Error, Warning)
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

// कन्फर्मेसन (Cancel / OK) पपअपको लागि ग्लोबल फंक्सन
window.showConfirmPopup = function(message, onConfirm, titleText = 'पुष्टि गर्नुहोस् ⚠️') {
  const modal = document.getElementById('customConfirmModal');
  const msgEl = document.getElementById('cgConfirmMessage');
  const titleEl = document.getElementById('cgConfirmTitle');
  const okBtn = document.getElementById('cgOkBtn');
  const cancelBtn = document.getElementById('cgCancelBtn');

  if (msgEl) msgEl.textContent = message;
  if (titleEl) titleEl.textContent = titleText;
  if (modal) modal.classList.add('active');

  if (okBtn) {
    okBtn.onclick = function() {
      if (modal) modal.classList.remove('active');
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = function() {
      if (modal) {
        modal.classList.remove('active');
      }
    };
  }
};
