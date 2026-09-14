// question-reporter.js - Fully Automated Universal Report System for All Quiz Pages

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

  const div = document.createElement('div');
  div.innerHTML = reportHTML;
  document.body.appendChild(div);

  // २. पपअप खोल्ने र बन्द गर्ने फंक्सनहरू
  window.openGlobalReportModal = function() {
    const modal = document.getElementById('globalReportModal');
    if (modal) {
      modal.style.opacity = '1';
      modal.style.visibility = 'visible';
      const card = modal.querySelector('.modal-card');
      if (card) card.style.transform = 'scale(1)';
    }
  }

  window.closeGlobalReportModal = function() {
    const modal = document.getElementById('globalReportModal');
    if (modal) {
      modal.style.opacity = '0';
      modal.style.visibility = 'hidden';
      const card = modal.querySelector('.modal-card');
      if (card) card.style.transform = 'scale(0.9)';
      const reasonBox = document.getElementById('globalReportReason');
      if (reasonBox) reasonBox.value = '';
    }
  }

  // इभेन्ट लिसनर सुरक्षित रूपमा जोड्ने
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'closeGlobalReport' || e.target.id === 'cancelGlobalReport' || e.target.closest('#closeGlobalReport') || e.target.closest('#cancelGlobalReport'))) {
      window.closeGlobalReportModal();
    }
  });

  // ३. जुनसुकै पेजबाट पनि हालको प्रश्न अटोमेटिक पत्ता लगाउने स्मार्ट लजिक
  function detectCurrentQuestion() {
    // क. यदि पेजमा कसैले कस्टम फंक्सन बनाएको छ भने
    if (typeof window.getCurrentQuestion === 'function') {
      try { return window.getCurrentQuestion(); } catch(err) {}
    }

    // ख. ग्लोबल रिएबलहरूको विभिन्न नामहरू स्वतः चेक गर्ने
    const possibleArrays = [
      typeof examQuestions !== 'undefined' ? examQuestions : null,
      typeof questions !== 'undefined' ? questions : null,
      typeof quizList !== 'undefined' ? quizList : null,
      typeof allQuestions !== 'undefined' ? allQuestions : null
    ];

    const possibleIndices = [
      typeof currentIdx !== 'undefined' ? currentIdx : null,
      typeof currentIndex !== 'undefined' ? currentIndex : null,
      typeof index !== 'undefined' ? index : null,
      typeof i !== 'undefined' ? i : null
    ];

    for (let arr of possibleArrays) {
      if (Array.isArray(arr) && arr.length > 0) {
        for (let idx of possibleIndices) {
          if (idx !== null && typeof idx === 'number' && arr[idx]) {
            return arr[idx];
          }
        }
        // यदि इन्डेक्स फेला परेन तर पहिलो प्रश्न दिन सकिन्छ भने वा active इंडेक्स ० छ भने
        return arr[0];
      }
    }

    // ग. यदि सिंगल अब्जेक्टको रूपमा स्टोर छ भने
    if (typeof activeQuestion !== 'undefined' && activeQuestion) return activeQuestion;
    if (typeof currentQuestion !== 'undefined' && currentQuestion) return currentQuestion;

    return null;
  }

  // ४. डेटाबेसमा पठाउने मुख्य लजिक
  document.addEventListener('click', async function(e) {
    if (e.target && e.target.id === 'submitGlobalReport') {
      const reasonBox = document.getElementById('globalReportReason');
      const reason = reasonBox ? reasonBox.value.trim() : '';
      
      if (!reason) {
        alert('कृपया समस्या के हो लेख्नुहोस्!');
        return;
      }

      const currentQ = detectCurrentQuestion();

      if (!currentQ) {
        alert('हालको प्रश्न फेला परेन!');
        return;
      }

      if (typeof supabaseClient === 'undefined') {
        alert('डेटाबेस कनेक्सन फेला परेन!');
        return;
      }

      const { error } = await supabaseClient
        .from('reported_questions')
        .insert([{ 
          question_id: currentQ.id || currentQ.question_id || null, 
          question_text: currentQ.question || currentQ.title || currentQ.text || 'Unknown Question', 
          reason: reason,
          status: 'Pending'
        }]);

      if (error) {
        alert('रिपोर्ट पठाउन असफल भयो: ' + error.message);
      } else {
        alert('सफलतापूर्वक रिपोर्ट पठाइयो! धन्यवाद! 🙏');
        window.closeGlobalReportModal();
      }
    }
  });
})();
