// 1. INITIALIZE SUPABASE CLIENT
// Use window.supabase or a different variable name to avoid scope collision
const SUPABASE_URL = 'https://edyirdedkiarguvurpxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWlyZGVka2lhcmd1dnVycHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTg2NjIsImV4cCI6MjEwNDU5NDY2Mn0.yhNn3YKmFSkxRdefk2F22qxTFhuKS90NH5fa3zzKSaY';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configure PDF.js Worker location
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const uploadBtn = document.getElementById('uploadBtn') || document.getElementById('processBtn');
const fileInput = document.getElementById('fileInput');
const statusMsg = document.getElementById('statusMsg');
const previewBox = document.getElementById('textPreview');
const previewContainer = document.getElementById('previewContainer');

// 2. HELPER: EXTRACT TEXT FROM PDF FILE
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

// 3. HELPER: CHUNK TEXT INTO ~600 WORD SNIPPETS
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

// 4. MAIN ACTION EVENT LISTENER
uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file to upload.');
    return;
  }

  // Check Authentication
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    statusMsg.innerText = 'Error: You must be logged in to process files.';
    return;
  }

  uploadBtn.disabled = true;

  try {
    // STEP A: Extract Text
    statusMsg.innerText = 'Step 1/4: Extracting text from document...';
    let extractedText = '';

    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else {
      extractedText = await file.text();
    }

    if (!extractedText.trim()) {
      throw new Error('Could not extract any readable text from this file.');
    }

    // STEP B: Chunk Text
    statusMsg.innerText = 'Step 2/4: Chunking text for AI processing...';
    const chunks = createTextChunks(extractedText, 600);

    // Render Preview if elements exist in HTML
    if (previewContainer && previewBox) {
      previewContainer.style.display = 'block';
      previewBox.innerText = chunks[0] || 'No text snippet available.';
    }

    // STEP C: Upload File to Storage Bucket
    statusMsg.innerText = 'Step 3/4: Uploading original file to storage...';
    const fileExt = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

    const { data: storageData, error: storageError } = await supabaseClient.storage
      .from('loksewa_documents')
      .upload(filePath, file);

    if (storageError) throw storageError;

    // STEP D: Insert Document Record into Database
    statusMsg.innerText = 'Step 4/4: Saving document & text chunks to database...';
    const { data: docData, error: dbError } = await supabaseClient
      .from('documents')
      .insert({
        user_id: user.id,
        title: file.name,
        file_path: storageData.path,
        file_type: fileExt,
        file_size_bytes: file.size,
        status: 'completed'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // STEP E: Insert Chunks into document_chunks Table
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

    statusMsg.innerText = `Success! Parsed and saved ${chunks.length} text chunk(s).`;
    console.log('Document & Chunks created successfully:', docData.id);

  } catch (err) {
    console.error('Processing error:', err);
    statusMsg.innerText = 'Error: ' + err.message;
  } finally {
    uploadBtn.disabled = false;
  }
});
