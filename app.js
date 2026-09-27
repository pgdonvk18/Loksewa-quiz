/* =========================
   FIREBASE MODULE IMPORTS
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* =========================
   FIREBASE CONFIG
========================= */
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
let currentUser = null;

/* =========================
   SUPABASE INITIALIZATION
========================= */
const SUPABASE_URL = "https://edyirdedkiarguvurpxq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWlyZGVka2lhcmd1dnVycHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTg2NjIsImV4cCI6MjEwNDU5NDY2Mn0.yhNn3YKmFSkxRdefk2F22qxTFhuKS90NH5fa3zzKSaY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// PDF.js Worker Configuration
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/* =========================
   GEMINI API CONFIGURATION
========================= */
// Replace with your actual Gemini API key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; 
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/* =========================
   DOM ELEMENTS
========================= */
const userStatus = document.getElementById('userStatus');
const uploadBtn = document.getElementById('uploadBtn') || document.getElementById('processBtn');
const fileInput = document.getElementById('fileInput');
const statusMsg = document.getElementById('statusMsg');
const previewBox = document.getElementById('textPreview');
const previewContainer = document.getElementById('previewContainer');

/* =========================
   FIREBASE AUTH MONITORING
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    if (userStatus) {
      userStatus.innerText = `Logged in as: ${user.email || user.uid}`;
      userStatus.style.color = '#15803d';
    }
  } else {
    currentUser = null;
    if (userStatus) {
      userStatus.innerText = 'Not logged in. Redirecting to login...';
      userStatus.style.color = '#dc2626';
    }
  }
});

/* =========================
   HELPER FUNCTIONS
========================= */

// 1. PDF Text Extraction
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `\n--- Page ${pageNum} ---\n` + pageText;
  }

  return fullText;
}

// 2. Chunking Text by Word Limit
function createTextChunks(text, wordsPerChunk = 600) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunkText = words.slice(i, i + wordsPerChunk).join(' ');
    if (chunkText.trim().length > 0) {
      chunks.push(chunkText);
    }
  }

  return chunks;
}

// 3. Generate Loksewa Questions via Gemini API
async function generateLoksewaQuestions(chunkContent, documentId) {
  if (!currentUser) {
    throw new Error("User must be authenticated.");
  }

  const prompt = `
You are an expert examiner for Nepal Loksewa Aayog (Public Service Commission).
Analyze the following text extract and generate 3 to 5 high-quality, objective Multiple-Choice Questions (MCQs) relevant for Loksewa preparation.

Text Content:
"""
${chunkContent}
"""

Return your response strictly as a JSON array where each object has the following structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]
`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Failed to generate questions from Gemini.");
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("No response content generated from Gemini.");
  }

  const questionsArray = JSON.parse(rawText);

  // Map and insert generated questions into Supabase
  const recordsToInsert = questionsArray.map((q) => ({
    document_id: documentId,
    user_id: currentUser.uid,
    question_text: q.question,
    options: q.options,
    correct_option: q.correct_index,
    explanation: q.explanation || ""
  }));

  const { data: savedQuestions, error: dbError } = await supabaseClient
    .from("quiz_questions")
    .insert(recordsToInsert)
    .select();

  if (dbError) throw dbError;

  return savedQuestions;
}

/* =========================
   UPLOAD & PROCESS EVENT
========================= */
if (uploadBtn) {
  uploadBtn.addEventListener('click', async () => {
    // 1. Verify User Session
    if (!currentUser) {
      alert('You must be logged in to process documents.');
      return;
    }

    // 2. Verify Selected File
    const file = fileInput ? fileInput.files[0] : null;
    if (!file) {
      alert('Please select a PDF or text file first.');
      return;
    }

    uploadBtn.disabled = true;

    try {
      // Step 1: Extract Text
      if (statusMsg) statusMsg.innerText = 'Step 1/5: Extracting document text...';
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error('Could not extract readable text from this file.');
      }

      // Step 2: Text Chunking
      if (statusMsg) statusMsg.innerText = 'Step 2/5: Chunking content for processing...';
      const chunks = createTextChunks(extractedText, 600);

      if (previewContainer && previewBox) {
        previewContainer.style.display = 'block';
        previewBox.innerText = chunks[0] || 'Preview unavailable.';
      }

      // Step 3: Upload File to Supabase Storage
      if (statusMsg) statusMsg.innerText = 'Step 3/5: Uploading file to storage...';
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${currentUser.uid}/${Date.now()}_${sanitizedName}`;

      const { data: storageData, error: storageError } = await supabaseClient.storage
        .from('loksewa_documents')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Step 4: Insert Document Metadata into Supabase DB
      if (statusMsg) statusMsg.innerText = 'Step 4/5: Saving metadata & text chunks...';
      const { data: docData, error: dbError } = await supabaseClient
        .from('documents')
        .insert({
          user_id: currentUser.uid,
          title: file.name,
          file_path: storageData.path,
          file_type: fileExt,
          file_size_bytes: file.size,
          status: 'completed'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Step 5: Save Text Chunks
      const chunkRecords = chunks.map((chunkContent, index) => ({
        document_id: docData.id,
        chunk_index: index,
        content: chunkContent,
        token_count: chunkContent.split(/\s+/).length
      }));

      const { error: chunkError } = await supabaseClient
        .from('document_chunks')
        .insert(chunkRecords);

      if (chunkError) throw chunkError;

      // Step 6: Generate Questions using Gemini API
      if (statusMsg) statusMsg.innerText = 'Step 5/5: Generating Loksewa MCQs via Gemini AI...';
      const generatedQuestions = await generateLoksewaQuestions(chunks[0], docData.id);

      if (statusMsg) {
        statusMsg.innerText = `Success! Saved document, created ${chunks.length} chunks, and generated ${generatedQuestions.length} Loksewa questions.`;
      }

    } catch (err) {
      console.error('Processing error:', err);
      if (statusMsg) statusMsg.innerText = 'Error: ' + err.message;
    } finally {
      uploadBtn.disabled = false;
    }
  });
}
