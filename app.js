/* =========================================================
   LOKSEWAQUEST - SOURCE PARSER
   Firebase Auth + Supabase + PDF.js + Gemini Edge Function

   IMPORTANT:
   1. Firebase handles user authentication.
   2. Supabase uses the PUBLIC/PUBLISHABLE key.
   3. Do NOT put Supabase service_role/secret key here.
   4. Replace YOUR_SUPABASE_PUBLISHABLE_KEY below.
========================================================= */


/* =========================================================
   1. FIREBASE MODULE IMPORTS
========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


/* =========================================================
   2. FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCkKCU1re5b9MtdAF1F4xI6rGxmxhGZak",
  authDomain: "loksewaquest-227b6.firebaseapp.com",
  projectId: "loksewaquest-227b6",
  storageBucket: "loksewaquest-227b6.firebasestorage.app",
  messagingSenderId: "779234903809",
  appId: "1:779234903809:web:dd0dd0ffb742e1c218bd00"
};


/* =========================================================
   3. INITIALIZE FIREBASE
========================================================= */

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

let currentUser = null;


/* =========================================================
   4. SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  "https://edyirdedkiarguvurpxq.supabase.co";

/*
 * IMPORTANT:
 *
 * Replace this with your CURRENT Supabase
 * Publishable key from:
 *
 * Supabase Dashboard
 * → Project Settings
 * → API
 * → Publishable key
 *
 * It normally starts with:
 *
 * sb_publishable_...
 *
 * DO NOT use:
 *
 * - service_role
 * - secret
 * - Supabase secret key
 *
 */

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWlyZGVka2lhcmd1dnVycHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTg2NjIsImV4cCI6MjEwNDU5NDY2Mn0.yhNn3YKmFSkxRdefk2F22qxTFhuKS90NH5fa3zzKSaY";


/* =========================================================
   5. CHECK SUPABASE KEY
========================================================= */

if (
  !SUPABASE_KEY ||
  SUPABASE_KEY === "YOUR_SUPABASE_PUBLISHABLE_KEY"
) {

  console.error(
    "Supabase publishable key has not been configured."
  );

  throw new Error(
    "Supabase Publishable Key is missing. Add your current Supabase Publishable key in app.js."
  );
}


/* =========================================================
   6. CHECK SUPABASE LIBRARY
========================================================= */

if (!window.supabase) {

  console.error(
    "Supabase library was not loaded."
  );

  throw new Error(
    "Supabase library failed to load. Check your HTML CDN."
  );
}


/* =========================================================
   7. CREATE SUPABASE CLIENT
========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );


console.log(
  "Supabase client initialized."
);


/* =========================================================
   8. CHECK PDF.JS
========================================================= */

if (!window.pdfjsLib) {

  console.error(
    "PDF.js was not loaded."
  );

  throw new Error(
    "PDF.js failed to load. Check your HTML CDN."
  );
}


/* =========================================================
   9. PDF.JS WORKER
========================================================= */

window.pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


/* =========================================================
   10. DOM ELEMENTS
========================================================= */

const userStatus =
  document.getElementById("userStatus");

const uploadBtn =
  document.getElementById("uploadBtn") ||
  document.getElementById("processBtn");

const fileInput =
  document.getElementById("fileInput");

const statusMsg =
  document.getElementById("statusMsg");

const previewBox =
  document.getElementById("textPreview");

const previewContainer =
  document.getElementById("previewContainer");


/* =========================================================
   11. STATUS HELPER
========================================================= */

function setStatus(
  message,
  type = "info"
) {

  if (!statusMsg) {
    return;
  }

  statusMsg.innerText = message;

  statusMsg.className = "";

  if (type === "success") {
    statusMsg.classList.add("success");
  }

  if (type === "error") {
    statusMsg.classList.add("error");
  }
}


/* =========================================================
   12. FIREBASE AUTH MONITORING
========================================================= */

onAuthStateChanged(
  auth,
  (user) => {

    if (user) {

      currentUser = user;

      console.log(
        "Firebase user logged in:",
        user.uid
      );

      console.log(
        "Firebase email:",
        user.email || "No email"
      );

      if (userStatus) {

        userStatus.innerText =
          `Logged in as: ${user.email || user.uid}`;

        userStatus.style.color =
          "#15803d";
      }

    } else {

      currentUser = null;

      console.log(
        "No Firebase user logged in."
      );

      if (userStatus) {

        userStatus.innerText =
          "Not logged in.";

        userStatus.style.color =
          "#dc2626";
      }
    }
  }
);


/* =========================================================
   13. PDF TEXT EXTRACTION
========================================================= */

async function extractTextFromPDF(file) {

  if (!file) {

    throw new Error(
      "No PDF file supplied."
    );
  }

  console.log(
    "Reading PDF:",
    file.name
  );

  const arrayBuffer =
    await file.arrayBuffer();

  const pdf =
    await window.pdfjsLib
      .getDocument({
        data: arrayBuffer
      })
      .promise;

  console.log(
    `PDF pages: ${pdf.numPages}`
  );

  let fullText = "";

  for (
    let pageNum = 1;
    pageNum <= pdf.numPages;
    pageNum++
  ) {

    setStatus(
      `Extracting PDF page ${pageNum}/${pdf.numPages}...`
    );

    const page =
      await pdf.getPage(pageNum);

    const textContent =
      await page.getTextContent();

    const pageText =
      textContent.items
        .map(
          item => item.str || ""
        )
        .join(" ");

    fullText +=
      `\n--- Page ${pageNum} ---\n${pageText}`;
  }

  return fullText.trim();
}


/* =========================================================
   14. TEXT EXTRACTION
========================================================= */

async function extractTextFromFile(file) {

  if (!file) {

    throw new Error(
      "No file selected."
    );
  }

  const isPDF =
    file.type === "application/pdf" ||
    file.name
      .toLowerCase()
      .endsWith(".pdf");

  if (isPDF) {

    return await extractTextFromPDF(file);

  }

  return await file.text();
}


/* =========================================================
   15. CREATE TEXT CHUNKS
========================================================= */

function createTextChunks(
  text,
  wordsPerChunk = 600
) {

  if (
    !text ||
    !text.trim()
  ) {

    return [];
  }

  const words =
    text
      .trim()
      .split(/\s+/);

  const chunks = [];

  for (
    let i = 0;
    i < words.length;
    i += wordsPerChunk
  ) {

    const chunkText =
      words
        .slice(
          i,
          i + wordsPerChunk
        )
        .join(" ");

    if (
      chunkText.trim()
    ) {

      chunks.push(
        chunkText.trim()
      );
    }
  }

  return chunks;
}


/* =========================================================
   16. UPLOAD FILE TO SUPABASE STORAGE
========================================================= */

async function uploadFileToStorage(
  file,
  filePath
) {

  console.log(
    "Starting Supabase Storage upload..."
  );

  console.log(
    "Bucket:",
    "loksewa_documents"
  );

  console.log(
    "Path:",
    filePath
  );

  console.log(
    "File:",
    file.name,
    file.size,
    file.type
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .storage
        .from("loksewa_documents")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type ||
              "application/octet-stream"
          }
        );


    if (error) {

      console.error(
        "Supabase Storage error:",
        error
      );

      throw new Error(
        error.message ||
        "Unknown Supabase Storage error."
      );
    }


    if (!data) {

      throw new Error(
        "Supabase Storage returned an empty response."
      );
    }


    console.log(
      "Storage upload successful:",
      data
    );


    return data;

  } catch (error) {

    console.error(
      "Storage upload exception:",
      error
    );

    throw error;
  }
}


/* =========================================================
   17. GENERATE LOKSEWA QUESTIONS
      USING SUPABASE EDGE FUNCTION
========================================================= */

async function generateLoksewaQuestions(
  chunkContent,
  documentId
) {

  if (!currentUser) {

    throw new Error(
      "Firebase user is not authenticated."
    );
  }

  if (
    !chunkContent ||
    !chunkContent.trim()
  ) {

    throw new Error(
      "No text content available for AI generation."
    );
  }


  console.log(
    "Calling Supabase Edge Function..."
  );


  const {
    data,
    error
  } =
    await supabaseClient.functions.invoke(
      "generate-ai-quiz",
      {
        body: {
          chunkContent:
            chunkContent
        }
      }
    );


  console.log(
    "Edge Function data:",
    data
  );

  console.log(
    "Edge Function error:",
    error
  );


  if (error) {

    throw new Error(
      `Edge Function Error: ${error.message}`
    );
  }


  if (!data) {

    throw new Error(
      "Edge Function returned no data."
    );
  }


  if (
    data.success === false
  ) {

    throw new Error(
      data.error ||
      data.details ||
      "AI generation failed."
    );
  }


  if (
    !Array.isArray(
      data.questions
    )
  ) {

    console.error(
      "Invalid Edge Function response:",
      data
    );

    throw new Error(
      "Edge Function did not return a valid questions array."
    );
  }


  const questionsArray =
    data.questions;


  if (
    questionsArray.length === 0
  ) {

    throw new Error(
      "AI generated zero questions."
    );
  }


  /* =======================================================
     VALIDATE AI QUESTIONS
  ======================================================= */

  const validQuestions =
    questionsArray.filter(
      (q) => {

        return (
          q &&
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          Number.isInteger(q.correct_index) &&
          q.correct_index >= 0 &&
          q.correct_index <= 3
        );

      }
    );


  if (
    validQuestions.length === 0
  ) {

    throw new Error(
      "AI returned questions, but none passed validation."
    );
  }


  /* =======================================================
     PREPARE DATABASE RECORDS
  ======================================================= */

  const recordsToInsert =
    validQuestions.map(
      (q) => ({

        document_id:
          documentId,

        user_id:
          currentUser.uid,

        question_text:
          q.question,

        options:
          q.options,

        correct_option:
          q.correct_index,

        explanation:
          q.explanation || ""

      })
    );


  console.log(
    "Saving generated questions..."
  );


  const {
    data: savedQuestions,
    error: dbError
  } =
    await supabaseClient
      .from("quiz_questions")
      .insert(
        recordsToInsert
      )
      .select();


  if (dbError) {

    console.error(
      "quiz_questions error:",
      dbError
    );

    throw new Error(
      `Failed to save questions: ${dbError.message}`
    );
  }


  return savedQuestions || [];
}


/* =========================================================
   18. MAIN UPLOAD/PROCESS FUNCTION
========================================================= */

async function processDocument() {

  /* =======================================================
     CHECK FIREBASE LOGIN
  ======================================================= */

  if (!currentUser) {

    throw new Error(
      "You must be logged in with Firebase."
    );
  }


  /* =======================================================
     CHECK FILE
  ======================================================= */

  const file =
    fileInput?.files?.[0];


  if (!file) {

    throw new Error(
      "Please select a PDF or text file first."
    );
  }


  /* =======================================================
     STEP 1 — EXTRACT TEXT
  ======================================================= */

  setStatus(
    "Step 1/6: Extracting document text..."
  );


  const extractedText =
    await extractTextFromFile(file);


  if (
    !extractedText ||
    !extractedText.trim()
  ) {

    throw new Error(
      "Could not extract readable text from this file."
    );
  }


  console.log(
    "Extracted characters:",
    extractedText.length
  );


  /* =======================================================
     STEP 2 — CHUNK TEXT
  ======================================================= */

  setStatus(
    "Step 2/6: Chunking content..."
  );


  const chunks =
    createTextChunks(
      extractedText,
      600
    );


  if (
    chunks.length === 0
  ) {

    throw new Error(
      "No usable text chunks were created."
    );
  }


  console.log(
    `Created ${chunks.length} chunks.`
  );


  /* =======================================================
     PREVIEW
  ======================================================= */

  if (
    previewContainer &&
    previewBox
  ) {

    previewContainer.style.display =
      "block";

    previewBox.innerText =
      chunks[0] ||
      "Preview unavailable.";
  }


  /* =======================================================
     STEP 3 — STORAGE UPLOAD
  ======================================================= */

  setStatus(
    "Step 3/6: Uploading document to Supabase Storage..."
  );


  const fileExt =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "unknown";


  const sanitizedName =
    file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    );


  const filePath =
    `${currentUser.uid}/${Date.now()}_${sanitizedName}`;


  const storageData =
    await uploadFileToStorage(
      file,
      filePath
    );


  if (!storageData?.path) {

    throw new Error(
      "Upload succeeded but no storage path was returned."
    );
  }


  /* =======================================================
     STEP 4 — DOCUMENT METADATA
  ======================================================= */

  setStatus(
    "Step 4/6: Saving document metadata..."
  );


  const {
    data: docData,
    error: dbError
  } =
    await supabaseClient
      .from("documents")
      .insert({

        user_id:
          currentUser.uid,

        title:
          file.name,

        file_path:
          storageData.path,

        file_type:
          fileExt,

        file_size_bytes:
          file.size,

        status:
          "completed"

      })
      .select()
      .single();


  if (dbError) {

    console.error(
      "Document database error:",
      dbError
    );

    throw new Error(
      `Failed to save document: ${dbError.message}`
    );
  }


  if (!docData?.id) {

    throw new Error(
      "Document saved but no document ID was returned."
    );
  }


  console.log(
    "Document created:",
    docData.id
  );


  /* =======================================================
     STEP 5 — SAVE TEXT CHUNKS
  ======================================================= */

  setStatus(
    `Step 5/6: Saving ${chunks.length} text chunks...`
  );


  const chunkRecords =
    chunks.map(
      (
        chunkContent,
        index
      ) => ({

        document_id:
          docData.id,

        chunk_index:
          index,

        content:
          chunkContent,

        token_count:
          chunkContent
            .split(/\s+/)
            .length

      })
    );


  const {
    error: chunkError
  } =
    await supabaseClient
      .from("document_chunks")
      .insert(
        chunkRecords
      );


  if (chunkError) {

    console.error(
      "Chunk insert error:",
      chunkError
    );

    throw new Error(
      `Failed to save text chunks: ${chunkError.message}`
    );
  }


  /* =======================================================
     STEP 6 — GENERATE MCQs
  ======================================================= */

  setStatus(
    "Step 6/6: Generating Loksewa MCQs with AI..."
  );


  /*
   * Currently generating from FIRST CHUNK ONLY.
   *
   * This keeps Gemini usage lower.
   */

  const generatedQuestions =
    await generateLoksewaQuestions(
      chunks[0],
      docData.id
    );


  /* =======================================================
     SUCCESS
  ======================================================= */

  setStatus(
    `Success! Saved document, created ${chunks.length} chunks, and generated ${generatedQuestions.length} Loksewa questions.`,
    "success"
  );


  console.log(
    "PROCESS COMPLETED SUCCESSFULLY"
  );

  console.log(
    "Document:",
    docData
  );

  console.log(
    "Questions:",
    generatedQuestions
  );
}


/* =========================================================
   19. UPLOAD BUTTON
========================================================= */

if (uploadBtn) {

  uploadBtn.addEventListener(
    "click",
    async () => {

      if (uploadBtn.disabled) {
        return;
      }

      uploadBtn.disabled = true;

      try {

        await processDocument();

      } catch (err) {

        console.error(
          "PROCESSING ERROR:",
          err
        );


        const message =
          err?.message ||
          String(err) ||
          "Unknown error";


        setStatus(
          `Error: ${message}`,
          "error"
        );

      } finally {

        uploadBtn.disabled = false;
      }
    }
  );

} else {

  console.error(
    "Upload button was not found."
  );
}


/* =========================================================
   20. INITIAL STATUS
========================================================= */

setStatus(
  "Ready. Please select a PDF or text file."
);

console.log(
  "LoksewaQuest Source Parser initialized."
);
