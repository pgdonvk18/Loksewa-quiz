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
    // Optional: Redirect to login if user is not authenticated
    // window.location.href = "login.html";
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
      // Step A: Extract Text
      if (statusMsg) statusMsg.innerText = 'Step 1/4: Extracting document text...';
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error('Could not extract readable text from this file.');
      }

      // Step B: Text Chunking
      if (statusMsg) statusMsg.innerText = 'Step 2/4: Chunking content for processing...';
      const chunks = createTextChunks(extractedText, 600);

      if (previewContainer && previewBox) {
        previewContainer.style.display = 'block';
        previewBox.innerText = chunks[0] || 'Preview unavailable.';
      }

      // Step C: Upload File to Supabase Storage
      if (statusMsg) statusMsg.innerText = 'Step 3/4: Uploading file to storage...';
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${currentUser.uid}/${Date.now()}_${sanitizedName}`;

      const { data: storageData, error: storageError } = await supabaseClient.storage
        .from('loksewa_documents')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Step D: Insert Record into Supabase DB
      if (statusMsg) statusMsg.innerText = 'Step 4/4: Saving metadata & chunks...';
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

      // Step E: Save Chunks
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

      if (statusMsg) {
        statusMsg.innerText = `Success! Created ${chunks.length} text chunks successfully.`;
      }

    } catch (err) {
      console.error('Processing error:', err);
      if (statusMsg) statusMsg.innerText = 'Error: ' + err.message;
    } finally {
      uploadBtn.disabled = false;
    }
  });
}
