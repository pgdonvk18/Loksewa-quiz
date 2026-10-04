/* ==========================================================
   LoksewaQuest shared components (components.js)
   Public API (unchanged): renderNameWithBadge, loadBottomNav,
   loadCreateRoomCard, showSuccessPopup, showConfirmPopup,
   toggleGlobalChat, triggerGlobalFloatingEmoji, sendGlobalQuickEmoji,
   selectedMaxPlayers, selectedTotalRounds
   Safe to include in <head> or at the end of <body>, and safe to
   include twice: the one-time setup below only ever runs once.
   ========================================================== */

// Run fn once the DOM is ready (works when loaded from <head> too)
function lqOnReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

// Escape text before putting it into HTML strings
function lqEscape(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// युजरको नाम र ब्याजेज मिलाएर HTML फर्काउने Helper Function
function renderNameWithBadge(userName, userData) {
  if (!userName) userName = "User";
  const safeName = lqEscape(userName);

  // युजरले किनेको वा इक्विप गरेको ब्याजेज चेक गर्ने
  let purchasedBadges = userData?.purchasedBadges || userData?.inventory || [];
  let equipped = userData?.equippedBadge;
  let activeBadgeKey = equipped || (Array.isArray(purchasedBadges) && purchasedBadges.length > 0 ? purchasedBadges[purchasedBadges.length - 1] : null);

  if (!activeBadgeKey) {
    // यदि कुनै ब्याजेज किनेको छैन भने केवल नाम मात्र फिर्ता गर्ने
    return `<span class="name-with-badge"><span>${safeName}</span></span>`;
  }

  // ब्याजेजको आइकन वा अक्षर छान्ने
  let badgeContent = `<i class="fa-solid fa-crown"></i>`;
  if (activeBadgeKey.includes("aspirant") || activeBadgeKey === "badge_aspirant") {
    badgeContent = `<span style="font-weight:800; font-size:10px;">A</span>`;
  } else if (activeBadgeKey.includes("pro") || activeBadgeKey === "badge_pro") {
    badgeContent = `<span style="font-weight:800; font-size:10px;">P</span>`;
  } else if (activeBadgeKey.includes("master") || activeBadgeKey === "badge_master") {
    badgeContent = `<span style="font-weight:800; font-size:10px;">M</span>`;
  }

  // नाम र ब्याजेज जोडिएको HTML स्ट्रक्चर
  return `
    <span class="name-with-badge">
      <span>${safeName}</span>
      <span class="inline-store-badge" title="Store Badge">${badgeContent}</span>
    </span>
  `;
}


/* ---------- One-time global setup: theme sync + footer ---------- */
(function () {
  if (window.__lqGlobalsReady) return;
  window.__lqGlobalsReady = true;

  lqOnReady(function () {
    // Keep both dark-mode hooks in sync with the saved theme (body.dark and html[data-theme])
    try {
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark');
      }
    } catch (e) { /* storage unavailable */ }

    if (document.getElementById('global-components-style')) return;

    const style = document.createElement('style');
    style.id = 'global-components-style';
    style.textContent = `
      /* Global footer */
      .global-site-footer {
        background: var(--ink, #0F1F3D);
        color: #AEBDD8;
        padding: 28px 20px calc(96px + env(safe-area-inset-bottom, 0px));
        font-size: 13px;
        margin-top: auto;
        width: 100%;
        border-top: 3px solid var(--blue, #2554B8);
      }
      .footer-content {
        max-width: 640px;
        margin: 0 auto 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 22px;
      }
      .footer-col h4 { color: #fff; font-size: 15px; font-weight: 700; margin: 0 0 8px; font-family: var(--head, 'Bricolage Grotesque', 'Mukta', sans-serif); }
      .footer-col p { color: #AEBDD8; line-height: 1.65; margin: 0 0 6px; }
      .footer-socials { display: flex; gap: 10px; margin-top: 12px; }
      .footer-socials a {
        width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
        border-radius: 12px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14);
        color: #fff; font-size: 16px; text-decoration: none;
      }
      .footer-socials a:active { background: var(--blue, #2554B8); }
      .footer-bottom {
        max-width: 640px; margin: 0 auto; padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,.12);
        display: flex; flex-direction: column; gap: 6px; font-size: 12px; text-align: center;
      }
      @media (min-width: 700px) {
        .footer-bottom { flex-direction: row; justify-content: space-between; text-align: left; }
      }
    `;
    document.head.appendChild(style);

    const footer = document.createElement('footer');
    footer.className = 'global-site-footer';
    footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-col">
          <h4>LoksewaQuest</h4>
          <p>लोकसेवा आयोग (Loksewa Aayog) तथा शिक्षक सेवा आयोगका परीक्षार्थीहरूका लागि तयार पारिएको स्मार्ट अनलाइन क्विज र तयारी प्लेटफर्म।</p>
        </div>
        <div class="footer-col">
          <h4>हामीसँग जोडिनुहोस्</h4>
          <p>अपडेट र नयाँ प्रश्नहरूको लागि हाम्रा कम्युनिटीहरूमा जोडिँनुहोस्।</p>
          <div class="footer-socials">
            <a href="https://www.facebook.com/share/1EvbsXtXRD/" title="Facebook" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" title="Telegram" aria-label="Telegram"><i class="fa-brands fa-telegram"></i></a>
            <a href="#" title="Viber" aria-label="Viber"><i class="fa-brands fa-viber"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 LoksewaQuest. All rights reserved.</span>
        <span>Designed for Aspirants with ❤️ in Nepal</span>
      </div>
    `;
    document.body.appendChild(footer);
  });
})();


/* ---------- Group chat drawer + floating emoji (created on first use) ---------- */
function lqEnsureChatDrawer() {
  if (document.getElementById('globalChatDrawer')) return;

  const style = document.createElement('style');
  style.id = 'global-chat-style';
  style.textContent = `
    .floating-emoji-container { position: fixed; bottom: 0; right: 20px; width: 100px; height: 100vh; pointer-events: none; overflow: hidden; z-index: 9999; }
    .floating-emoji { position: absolute; font-size: 28px; animation: floatUpGlobal 2s ease-out forwards; opacity: 1; }
    @keyframes floatUpGlobal {
      0% { transform: translateY(0) scale(.5); opacity: 1; }
      50% { transform: translateY(-220px) scale(1.3) rotate(15deg); opacity: .9; }
      100% { transform: translateY(-400px) scale(1) rotate(-15deg); opacity: 0; }
    }
    .chat-drawer { position: fixed; right: -320px; top: 0; width: min(300px, 88vw); height: 100%; background: var(--card, #fff); color: var(--text, #15213A); border-left: 1px solid var(--line, #E1E6EF); display: flex; flex-direction: column; transition: right .3s ease; z-index: 10000; box-shadow: -8px 0 28px rgba(15,31,61,.12); }
    .chat-drawer.open { right: 0; }
    .chat-header-bar { padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 14px; background: var(--ink, #0F1F3D); color: #fff; font-weight: 700; font-size: 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .close-chat { background: rgba(255,255,255,.1); border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 15px; cursor: pointer; color: #fff; }
    .chat-messages { flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: var(--paper, #F4F6FA); min-height: 0; }
    .chat-msg { font-size: 13px; background: var(--card, #fff); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line, #E1E6EF); word-break: break-word; }
    .chat-msg .c-user { font-weight: 700; color: var(--blue, #2554B8); margin-bottom: 2px; }
    .quick-emojis { display: flex; gap: 6px; padding: 8px 12px; background: var(--card, #fff); border-top: 1px solid var(--line, #E1E6EF); overflow-x: auto; flex-shrink: 0; }
    .emoji-pill { background: var(--paper, #F4F6FA); border: 1px solid var(--line, #E1E6EF); border-radius: 20px; min-width: 40px; min-height: 40px; font-size: 16px; cursor: pointer; }
    .emoji-pill:active { transform: scale(1.1); }
    .chat-input-box { padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)); background: var(--card, #fff); border-top: 1px solid var(--line, #E1E6EF); display: flex; gap: 8px; align-items: center; width: 100%; flex-shrink: 0; }
    .chat-input { flex: 1; min-height: 44px; padding: 0 12px; border: 1.5px solid var(--line, #E1E6EF); border-radius: 12px; font-size: 14px; outline: none; background: var(--paper, #F4F6FA); color: var(--text, #15213A); }
    .chat-input:focus { border-color: var(--blue, #2554B8); }
    .chat-send-btn { background: var(--blue, #2554B8); color: #fff; border: none; min-width: 48px; min-height: 44px; border-radius: 12px; cursor: pointer; }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="floating-emoji-container" id="globalFloatingEmojiContainer"></div>
    <div class="chat-drawer" id="globalChatDrawer">
      <div class="chat-header-bar">
        <span>ग्रुप च्याट</span>
        <button type="button" class="close-chat" id="closeChatBtn" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="chat-messages" id="globalChatMessagesContainer">
        <div style="text-align:center;color:var(--muted,#5B6A82);font-size:12px;">च्याट लोड हुँदैछ...</div>
      </div>
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
        <button type="submit" class="chat-send-btn" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  `;
  while (wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);

  document.getElementById('closeChatBtn').addEventListener('click', window.toggleGlobalChat);

  document.getElementById('globalChatForm').addEventListener('submit', (e) => {
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

// सुधारेको र भरपर्दो toggleGlobalChat फंक्सन
window.toggleGlobalChat = function () {
  lqEnsureChatDrawer();
  const chatDrawer = document.getElementById('globalChatDrawer');
  if (chatDrawer) chatDrawer.classList.toggle('open');
};

window.triggerGlobalFloatingEmoji = function (emojiChar) {
  lqEnsureChatDrawer();
  const container = document.getElementById('globalFloatingEmojiContainer');
  if (!container) return;

  const span = document.createElement('span');
  span.className = 'floating-emoji';
  span.innerText = emojiChar;
  span.style.left = (Math.floor(Math.random() * 60) + 10) + 'px';
  container.appendChild(span);

  setTimeout(() => { span.remove(); }, 2000);
};

window.sendGlobalQuickEmoji = function (emoji) {
  triggerGlobalFloatingEmoji(emoji);
  if (window.sendChatMessageToDB) {
    window.sendChatMessageToDB(emoji);
  }
};


/* ---------- Room config card ---------- */
// ग्लोबल कन्फिगरेसन चरहरू (Variables)
window.selectedMaxPlayers = 4;
window.selectedTotalRounds = 3;

function loadCreateRoomCard(containerId) {
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
    style.textContent = `
      .card { background: var(--card, #fff); padding: 16px; border-radius: 16px; box-shadow: var(--shadow, 0 8px 24px rgba(15,31,61,.06)); margin-bottom: 14px; border: 1px solid var(--line, #E1E6EF); }
      .card h3 { font-size: 15px; font-weight: 700; margin-bottom: 14px; color: var(--text, #15213A); display: flex; align-items: center; gap: 8px; }
      .form-group { margin-bottom: 14px; }
      .form-group label { display: block; font-size: 13px; font-weight: 700; color: var(--text, #15213A); margin-bottom: 7px; }
      .select-grid { display: grid; gap: 8px; }
      .select-grid-3 { grid-template-columns: repeat(3, 1fr); }
      .option-btn { min-height: 46px; padding: 8px; background: var(--paper, #F4F6FA); border: 1.5px solid var(--line, #E1E6EF); border-radius: 12px; font-size: 13px; font-weight: 700; color: var(--muted, #5B6A82); cursor: pointer; text-align: center; transition: all .15s ease; }
      .option-btn.active { background: var(--blue-bg, #E8EEFA); border-color: var(--blue, #2554B8); color: var(--blue, #2554B8); }
      .btn { width: 100%; min-height: 48px; padding: 0 16px; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .15s, transform .1s; }
      .btn:active { transform: scale(.98); }
      .btn-primary { background: var(--blue, #2554B8); color: #fff; }
      .btn-primary:active { background: var(--blue-d, #1B418F); }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('#maxPlayersGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#maxPlayersGroup .option-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      window.selectedMaxPlayers = parseInt(e.currentTarget.getAttribute('data-value'));
    });
  });

  document.querySelectorAll('#totalRoundsGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#totalRoundsGroup .option-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      window.selectedTotalRounds = parseInt(e.currentTarget.getAttribute('data-value'));
    });
  });
}


/* ---------- Bottom navigation ---------- */
function loadBottomNav(activePage) {
  if (!document.getElementById('bottom-nav-style')) {
    const styleElem = document.createElement('style');
    styleElem.id = 'bottom-nav-style';
    styleElem.textContent = `
      .bottom-nav {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000;
        display: flex; align-items: stretch;
        padding: 4px 6px calc(4px + env(safe-area-inset-bottom, 0px));
        background: var(--card, #FFFFFF);
        border-top: 1px solid var(--line, #E1E6EF);
      }
      .nav-link {
        position: relative; flex: 1; min-height: 56px;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
        text-decoration: none; color: var(--muted, #5B6A82);
        font-size: 11px; font-weight: 600; line-height: 1;
        -webkit-tap-highlight-color: transparent;
      }
      .nav-link i { font-size: 18px; transition: transform .15s ease; }
      .nav-link:active i { transform: scale(.88); }
      .nav-link.active { color: var(--blue, #2554B8); font-weight: 700; }
      .nav-link.active::before {
        content: ""; position: absolute; top: -5px; left: 50%; width: 28px; height: 3px;
        margin-left: -14px; border-radius: 0 0 3px 3px; background: var(--blue, #2554B8);
      }
      :is(body.dark, [data-theme="dark"]) .bottom-nav { background: var(--card, #14203A); border-top-color: var(--line, #25345A); }
      :is(body.dark, [data-theme="dark"]) .nav-link { color: var(--muted, #9AA8C0); }
      :is(body.dark, [data-theme="dark"]) .nav-link.active { color: var(--blue, #6E97EA); }
      :is(body.dark, [data-theme="dark"]) .nav-link.active::before { background: var(--blue, #6E97EA); }
      @media (min-width: 700px) {
        .bottom-nav { left: 50%; right: auto; width: 520px; transform: translateX(-50%); border: 1px solid var(--line, #E1E6EF); border-bottom: 0; border-radius: 14px 14px 0 0; }
      }
    `;
    document.head.appendChild(styleElem);
  }

  if (document.querySelector('.bottom-nav')) return;   // never add a second nav

  const tab = (page, href, icon, label) => `
      <a href="${href}" class="nav-link ${activePage === page ? 'active' : ''}"${activePage === page ? ' aria-current="page"' : ''}>
        <i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span>
      </a>`;

  const navHTML = `
    <nav class="bottom-nav" aria-label="Main navigation">
      ${tab('home', 'dashboard.html', 'fa-house', 'Home')}
      ${tab('study', 'study.html', 'fa-book-open', 'Study')}
      ${tab('practice', 'practice.html', 'fa-brain', 'Practice')}
      ${tab('analytics', 'analytics.html', 'fa-chart-pie', 'Stats')}
      ${tab('profile', 'profile.html', 'fa-user', 'Profile')}
    </nav>
  `;
  document.body.insertAdjacentHTML('beforeend', navHTML);
}


/* ---------- Global popups (success / error / warning / confirm) ---------- */
function lqEnsureModals() {
  if (document.getElementById('customGlobalModal')) return;
  if (!document.body) return;

  const modalHTML = `
    <div id="customGlobalModal" class="cg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cgModalTitle">
      <div class="cg-modal-card">
        <div id="cgModalIconBox" class="cg-icon-box success">
          <i id="cgModalIcon" class="fa-solid fa-check"></i>
        </div>
        <h3 id="cgModalTitle" class="cg-title">सफल भयो!</h3>
        <p id="cgModalMessage" class="cg-message">तपाईंको कार्य सफलतापूर्वक पूरा भयो।</p>
        <button id="cgModalBtn" class="cg-btn" type="button">ठीक छ</button>
      </div>
    </div>

    <div id="customConfirmModal" class="cg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cgConfirmTitle">
      <div class="cg-modal-card">
        <div class="cg-icon-box warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 id="cgConfirmTitle" class="cg-title">पुष्टि गर्नुहोस्</h3>
        <p id="cgConfirmMessage" class="cg-message">के तपाईं यो कार्य गर्न चाहनुहुन्छ?</p>
        <div style="display:flex;gap:10px;">
          <button id="cgCancelBtn" class="cg-btn cg-btn-secondary" type="button">रद्द गर्ने</button>
          <button id="cgOkBtn" class="cg-btn" type="button">हुन्छ (OK)</button>
        </div>
      </div>
    </div>

    <style id="global-modal-style">
      .cg-modal-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(8, 15, 30, .62);
        display: flex; align-items: center; justify-content: center; padding: 24px;
        opacity: 0; visibility: hidden; transition: opacity .2s ease, visibility .2s ease;
      }
      .cg-modal-overlay.active { opacity: 1; visibility: visible; }
      .cg-modal-card {
        background: var(--card, #FFFFFF); color: var(--text, #15213A);
        width: 100%; max-width: 360px; border-radius: 18px;
        padding: 26px 22px 22px; text-align: center;
        border: 1px solid var(--line, #E1E6EF);
        box-shadow: 0 24px 60px rgba(0, 0, 0, .3);
        transform: translateY(10px) scale(.97); transition: transform .22s ease;
      }
      .cg-modal-overlay.active .cg-modal-card { transform: none; }
      .cg-icon-box {
        width: 56px; height: 56px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; margin: 0 auto 14px;
      }
      .cg-icon-box.success { background: #E3F4EC; color: #1E7F5C; }
      .cg-icon-box.error { background: #FBE7E9; color: #C8323F; }
      .cg-icon-box.warning { background: #FCEFD6; color: #B26A00; }
      .cg-title { font-family: var(--head, 'Bricolage Grotesque', 'Mukta', sans-serif); font-size: 18px; font-weight: 700; margin: 0 0 6px; color: var(--text, #15213A); }
      .cg-message { font-size: 13.5px; color: var(--muted, #5B6A82); line-height: 1.55; margin: 0 0 20px; }
      .cg-btn {
        flex: 1; width: 100%; min-height: 46px; padding: 0 14px;
        background: var(--blue, #2554B8); color: #fff; border: none; border-radius: 12px;
        font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit;
        transition: background .15s, transform .1s;
      }
      .cg-btn:active { background: var(--blue-d, #1B418F); transform: scale(.97); }
      .cg-btn-secondary { background: var(--paper, #F4F6FA); color: var(--text, #15213A); border: 1.5px solid var(--line, #E1E6EF); }
      .cg-btn-secondary:active { background: var(--line, #E1E6EF); }
      :is(body.dark, [data-theme="dark"]) .cg-icon-box.success { background: #12332A; color: #4FC08D; }
      :is(body.dark, [data-theme="dark"]) .cg-icon-box.error { background: #3A1B22; color: #F08A97; }
      :is(body.dark, [data-theme="dark"]) .cg-icon-box.warning { background: #3A2B12; color: #E7B15B; }
      :is(body.dark, [data-theme="dark"]) .cg-modal-card { background: var(--card, #14203A); border-color: var(--line, #25345A); }
      @media (prefers-reduced-motion: reduce) {
        .cg-modal-overlay, .cg-modal-card { transition: none; }
      }
    </style>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}
lqOnReady(lqEnsureModals);

// ग्लोबल पपअप फंक्सन (Success, Error, Warning)
window.showSuccessPopup = function (message, redirectUrl, type = 'success', titleText = '') {
  lqEnsureModals();
  const modal = document.getElementById('customGlobalModal');
  const msgEl = document.getElementById('cgModalMessage');
  const titleEl = document.getElementById('cgModalTitle');
  const iconBox = document.getElementById('cgModalIconBox');
  const iconEl = document.getElementById('cgModalIcon');
  const okBtn = document.getElementById('cgModalBtn');
  if (!modal) return;

  if (msgEl) msgEl.textContent = message;

  iconBox.className = `cg-icon-box ${type}`;
  if (type === 'success') {
    if (!titleText) titleText = 'सफल भयो!';
    iconEl.className = 'fa-solid fa-check';
  } else if (type === 'error') {
    if (!titleText) titleText = 'त्रुटि (Error)';
    iconEl.className = 'fa-solid fa-triangle-exclamation';
  } else if (type === 'warning') {
    if (!titleText) titleText = 'सचेत गराइएको छ';
    iconEl.className = 'fa-solid fa-circle-exclamation';
  }
  if (titleEl) titleEl.textContent = titleText;

  modal.classList.add('active');
  if (okBtn) okBtn.focus();

  if (okBtn) {
    okBtn.onclick = function () {
      modal.classList.remove('active');
      if (redirectUrl) {
        setTimeout(() => { window.location.href = redirectUrl; }, 200);
      }
    };
  }
};

// कन्फर्मेसन (Cancel / OK) पपअपको लागि ग्लोबल फंक्सन (सुधारेको)
window.showConfirmPopup = function (message, onConfirm, titleText = 'पुष्टि गर्नुहोस्') {
  lqEnsureModals();
  const modal = document.getElementById('customConfirmModal');
  const msgEl = document.getElementById('cgConfirmMessage');
  const titleEl = document.getElementById('cgConfirmTitle');
  const okBtn = document.getElementById('cgOkBtn');
  const cancelBtn = document.getElementById('cgCancelBtn');
  if (!modal) return;

  if (msgEl) msgEl.textContent = message;
  if (titleEl) titleEl.textContent = titleText;
  modal.classList.add('active');
  if (cancelBtn) cancelBtn.focus();

  okBtn.onclick = function () {
    modal.classList.remove('active');
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  cancelBtn.onclick = function () {
    modal.classList.remove('active');
  };
};
