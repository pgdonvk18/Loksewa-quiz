// Initialize Supabase Client
const SUPABASE_URL = 'https://edyirdedkiarguvurpxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWlyZGVka2lhcmd1dnVycHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTg2NjIsImV4cCI6MjEwNDU5NDY2Mn0.yhNn3YKmFSkxRdefk2F22qxTFhuKS90NH5fa3zzKSaY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const statusMsg = document.getElementById('statusMsg');

uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file to upload.');
    return;
  }
// Configure PDF.js Worker location
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 1. EXTRACT TEXT FROM PDF FILE
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

// 2. CHUNK TEXT INTO ~600 WORD SNIPPETS
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

// 3. MAIN PROCESSOR TRIGGER
document.getElementById('processBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const statusMsg = document.getElementById('statusMsg');
  const previewBox = document.getElementById('textPreview');
  const previewContainer = document.getElementById('previewContainer');

  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    statusMsg.innerText = 'Please log in first.';
    return;
  }

  try {
    statusMsg.innerText = 'Step 1/3: Extracting text from document...';
    let extractedText = '';

    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else {
      extractedText = await file.text();
    }

    statusMsg.innerText = 'Step 2/3: Chunking extracted text...';
    const chunks = createTextChunks(extractedText, 600);

    // Show preview of first chunk
    previewContainer.style.display = 'block';
    previewBox.innerText = chunks[0] || 'No text found.';

    statusMsg.innerText = `Step 3/3: Uploading document & ${chunks.length} chunks to database...`;

    // Upload Document metadata
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    await supabase.storage.from('loksewa_documents').upload(filePath, file);

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: file.name,
        file_path: filePath,
        file_type: file.name.split('.').pop(),
        file_size_bytes: file.size,
        status: 'completed'
      })
      .select()
      .single();

    if (docError) throw docError;

    // Insert chunks into document_chunks table
    const chunkRecords = chunks.map((chunkContent, index) => ({
      document_id: docData.id,
      chunk_index: index,
      content: chunkContent,
      token_count: chunkContent.split(/\s+/).length
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords);

    if (chunkError) throw chunkError;

    statusMsg.innerText = `Success! Parsed ${chunks.length} text chunk(s) stored in database.`;

  } catch (err) {
    console.error(err);
    statusMsg.innerText = 'Extraction failed: ' + err.message;
  }
});

  // 1. Verify User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    statusMsg.innerText = 'Error: You must be logged in to upload files.';
    return;
  }

  uploadBtn.disabled = true;
  statusMsg.innerText = 'Uploading document to storage...';

  try {
    // 2. Prepare Storage File Path: userId/timestamp_filename
    const fileExt = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

    // 3. Upload File to Supabase Storage Bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('loksewa_documents')
      .upload(filePath, file);

    if (storageError) throw storageError;

    statusMsg.innerText = 'Saving document record in database...';

    // 4. Create Entry in "documents" Database Table
    const { data: docData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: file.name,
        file_path: storageData.path,
        file_type: fileExt,
        file_size_bytes: file.size,
        status: 'processing'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    statusMsg.innerText = 'Upload successful! Ready for text extraction.';
    console.log('Document created:', docData);

    // Trigger next step logic here (e.g., pass docData.id and file to parser)
    
  } catch (err) {
    console.error('Error during upload:', err);
    statusMsg.innerText = 'Upload failed: ' + err.message;
  } finally {
    uploadBtn.disabled = false;
  }
});
