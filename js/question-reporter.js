// question-reporter.js - Reusable Report System for All Quiz Pages

(function () {
  // १. आवश्यक HTML (Report Button र Modal) स्वतः पेजमा इन्जेक्टर गर्ने
  const reportHTML = `
    <!-- REPORT QUESTION MODAL -->
    <div id="globalReportModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.3s ease;">
      <div class="modal-card" style="background: #ffffff; width: 90%; max-width: 340px; border-radius: 24px; padding: 24px 20px; text-align: left; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin:0;">प्रश्न रिपोर्ट गर्नुहोस्</h3>
          <button id="closeGlobalReport" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">यो प्रश्न वा उत्तरमा के समस्या छ लेख्नुहोस्:</p>
        <textarea id="globalReportReason" placeholder="उदा: सही उत्तर मिलेको छैन।" style="min-height: 100px; margin-bottom: 12px; width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box;"></textarea>
        <div style="display: flex; gap: 10px;">
          <button id="submitGlobalReport" style="flex: 1; background: #2563eb; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">पठाउनुहोस्</button>
          <button id="cancelGlobalReport" style="flex: 1; background: #e2e8f0; color: #475569; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">रद्द गर्नुहोस्</button>
        </div>
      </div>
    </div>
  `;

  // पेज लोड भएपछि यो HTML स्वतः बडीमा थपिदिने
  const div = document.createElement('div');
  div.innerHTML = reportHTML;
  document.body.appendChild(div);

  // २. रिपोर्ट बटनलाई क्विज पेजको प्रश्न मुन ne (जहाँ जहाँ राख्न मन लाग्छ वा स्वतः म्यानेज गर्न) जोड्ने वा पेजमा भएको बटनलाई ट्रिगर गर्ने
  // यदि तपाइँ हरेक क्विज पेजमा तलको सानो बटन मात्र राख्नुहुन्छ भने पुग्छ:
  // <button onclick="openGlobalReportModal()" class="global-report-btn">⚠️ यो प्रश्न रिपोर्ट गर्नुहोस्</button>

  window.openGlobalReportModal = function() {
    const modal = document.getElementById('globalReportModal');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.querySelector('.modal-card').style.transform = 'scale(1)';
  }

  window.closeGlobalReportModal = function() {
    const modal = document.getElementById('globalReportModal');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.querySelector('.modal-card').style.transform = 'scale(0.9)';
    document.getElementById('globalReportReason').value = '';
  }

  document.getElementById('closeGlobalReport').onclick = window.closeGlobalReportModal;
  document.getElementById('cancelGlobalReport').onclick = window.closeGlobalReportModal;

  // ३. डेटाबेसमा पठाउने मुख्य लजिक
  document.getElementById('submitGlobalReport').onclick = async function() {
    const reason = document.getElementById('globalReportReason').value.trim();
    if (!reason) {
      alert('कृपया समस्या के हो लेख्नुहोस्!');
      return;
    }

    // नोट: तपाइँको जुनसुकै क्विज पेजमा पनि हालको प्रश्न देखाइरहेको रिएबल वा अब्जेक्टको नाम फरक हुन सक्छ 
    // (जस्तै: examQuestions[currentIdx] वा activeQuestion)। 
    // त्यसैले हामी एउटा स्ट्यान्डर्ड युनिभर्सल विन्डो अब्जेक्ट प्रयोग गर्छौं।
    let currentQ = null;
    if (typeof window.getCurrentQuestion === 'function') {
      currentQ = window.getCurrentQuestion();
    } else if (typeof examQuestions !== 'undefined' && typeof currentIdx !== 'undefined') {
      currentQ = examQuestions[currentIdx];
    }

    if (!currentQ) {
      alert('हालको प्रश्न फेला परेन!');
      return;
    }

    // Supabase मा डेटा पठाउने (window.supabaseClient वा ग्लोबल क्लाइन्ट प्रयोग गरेर)
    if (typeof supabaseClient === 'undefined') {
      alert('डेटाबेस कनेक्सन फेला परेन!');
      return;
    }

    const { error } = await supabaseClient
      .from('reported_questions')
      .insert([{ 
        question_id: currentQ.id || null, 
        question_text: currentQ.question || currentQ.title, 
        reason: reason,
        status: 'Pending'
      }]);

    if (error) {
      alert('रिपोर्ट पठाउन असफल भयो: ' + error.message);
    } else {
      alert('सफलतापूर्वक रिपोर्ट पठाइयो! धन्यवाद! 🙏');
      window.closeGlobalReportModal();
    }
  };
})();
