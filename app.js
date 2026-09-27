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
