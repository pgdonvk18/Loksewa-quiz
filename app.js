/* =========================================================
   LOKSEWAQUEST SOURCE PARSER
   Firebase Auth + Supabase + PDF.js + Gemini Edge Function
========================================================= */


/* =========================================================
   1. FIREBASE IMPORTS
========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


/* =========================================================
   2. FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCkKCU1re5b9MtdsAF1F4xI6rGxmxhGZak",
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
   4. SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://edyirdedkiarguvurpxq.supabase.co";

/*
 IMPORTANT:
 Replace this with your REAL Supabase
 Publishable/Anon key.

 Do NOT put the service_role/secret key here.
*/

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWlyZGVka2lhcmd1dnVycHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTg2NjIsImV4cCI6MjEwNDU5NDY2Mn0.yhNn3YKmFSkxRdefk2F22qxTFhuKS90NH5fa3zzKSaY";


/* =========================================================
   5. CHECK SUPABASE
========================================================= */

if (!window.supabase) {
  throw new Error(
    "Supabase library failed to load. Check your HTML CDN."
  );
}

if (
  SUPABASE_KEY ===
  "PASTE_YOUR_REAL_SUPABASE_PUBLISHABLE_KEY_HERE"
) {
  console.warn(
    "WARNING: Supabase publishable key has not been configured."
  );
}

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   6. CHECK PDF.JS
========================================================= */

if (!window.pdfjsLib) {
  throw new Error(
    "PDF.js failed to load. Check your HTML CDN."
  );
}


/* =========================================================
   7. PDF.JS WORKER
========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


/* =========================================================
   8. DOM ELEMENTS
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

const anonLoginBtn =
  document.getElementById("anonLoginBtn");


/* =========================================================
   9. STATUS FUNCTION
========================================================= */

function setStatus(message, type = "info") {

  if (!statusMsg) return;

  statusMsg.innerText = message;

  if (type === "success") {
    statusMsg.style.color = "#15803d";
  } else if (type === "error") {
    statusMsg.style.color = "#dc2626";
  } else {
    statusMsg.style.color = "#1e40af";
  }
}


/* =========================================================
   10. FIREBASE AUTH STATE
========================================================= */

onAuthStateChanged(auth, (user) => {

  if (user) {

    currentUser = user;

    console.log(
      "Firebase authenticated:",
      user.uid
    );

    if (userStatus) {

      userStatus.innerText =
        `Logged in • ${user.email || "Guest User"}`;

      userStatus.style.color =
        "#15803d";
    }

    if (anonLoginBtn) {
      anonLoginBtn.style.display = "none";
    }

  } else {

    currentUser = null;

    console.log(
      "Firebase: no authenticated user."
    );

    if (userStatus) {

      userStatus.innerText =
        "Not logged in";

      userStatus.style.color =
        "#dc2626";
    }

    if (anonLoginBtn) {
      anonLoginBtn.style.display = "block";
    }
  }
});


/* =========================================================
   11. QUICK GUEST LOGIN
========================================================= */

if (anonLoginBtn) {

  anonLoginBtn.addEventListener(
    "click",
    async () => {

      anonLoginBtn.disabled = true;

      anonLoginBtn.innerText =
        "Signing in...";

      try {

        setStatus(
          "Signing in as guest..."
        );

        const result =
          await signInAnonymously(auth);

        currentUser =
          result.user;

        console.log(
          "Guest Firebase user:",
          currentUser.uid
        );

        setStatus(
          "Guest login successful.",
          "success"
        );

      } catch (error) {

        console.error(
          "Firebase anonymous login error:",
          error
        );

        setStatus(
          "Login failed: " +
          (error.message || error),
          "error"
        );

        alert(
          "Firebase Guest Login failed.\n\n" +
          (error.message || error)
        );

        anonLoginBtn.disabled = false;

        anonLoginBtn.innerText =
          "Quick Guest Login";
      }
    }
  );
}


/* =========================================================
   12. PDF TEXT EXTRACTION
========================================================= */

async function extractTextFromPDF(file) {

  if (!file) {
    throw new Error(
      "No PDF file supplied."
    );
  }

  const arrayBuffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib
      .getDocument({
        data: arrayBuffer
      })
      .promise;

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
        .map(item => item.str || "")
        .join(" ");

    fullText +=
      `\n--- Page ${pageNum} ---\n${pageText}`;
  }

  return fullText.trim();
}


/* =========================================================
   13. TEXT/PDF EXTRACTION
========================================================= */

async function extractTextFromFile(file) {

  if (!file) {
    throw new Error(
      "No file selected."
    );
  }

  const isPDF =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (isPDF) {
    return await extractTextFromPDF(file);
  }

  return await file.text();
}


/* =========================================================
   14. CREATE CHUNKS
========================================================= */

function createTextChunks(
  text,
  wordsPerChunk = 600
) {

  if (!text || !text.trim()) {
    return [];
  }

  const words =
    text.trim().split(/\s+/);

  const chunks = [];

  for (
    let i = 0;
    i < words.length;
    i += wordsPerChunk
  ) {

    const chunk =
      words
        .slice(i, i + wordsPerChunk)
        .join(" ")
        .trim();

    if (chunk) {
      chunks.push(chunk);
    }
  }

  return chunks;
}


/* =========================================================
   15. GENERATE AI QUESTIONS
========================================================= */

async function generateLoksewaQuestions(
  chunkContent,
  documentId
) {

  if (!currentUser) {
    throw new Error(
      "Firebase authentication required."
    );
  }

  if (!chunkContent?.trim()) {
    throw new Error(
      "No text available for AI generation."
    );
  }

  console.log(
    "Calling generate-ai-quiz..."
  );

  const {
    data,
    error
  } =
    await supabaseClient.functions.invoke(
      "generate-ai-quiz",
      {
        body: {
          chunkContent
        }
      }
    );

  console.log(
    "Edge Function response:",
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

  if (data.error) {
    throw new Error(
      data.error
    );
  }

  if (!Array.isArray(data.questions)) {
    throw new Error(
      "Invalid response: questions array missing."
    );
  }

  const validQuestions =
    data.questions.filter((q) => {

      return (
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        Number.isInteger(q.correct_index) &&
        q.correct_index >= 0 &&
        q.correct_index <= 3
      );

    });


  if (!validQuestions.length) {

    throw new Error(
      "Gemini returned no valid MCQs."
    );
  }


  /* =======================================================
     SAVE QUESTIONS
  ======================================================= */

  const records =
    validQuestions.map((q) => ({

      document_id:
        documentId,

      /*
       Firebase UID stored as TEXT
      */

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

    }));


  const {
    data: savedQuestions,
    error: dbError
  } =
    await supabaseClient
      .from("quiz_questions")
      .insert(records)
      .select();


  if (dbError) {

    throw new Error(
      `Failed to save questions: ${dbError.message}`
    );
  }


  return savedQuestions || [];
}


/* =========================================================
   16. MAIN PROCESS
========================================================= */

if (uploadBtn) {

  uploadBtn.addEventListener(
    "click",
    async () => {

      /* AUTH */

      if (!currentUser) {

        alert(
          "Please login first using Quick Guest Login."
        );

        return;
      }


      /* FILE */

      const file =
        fileInput?.files?.[0];

      if (!file) {

        alert(
          "Please select a PDF or TXT file."
        );

        return;
      }


      uploadBtn.disabled = true;


      try {

        /* =========================================
           STEP 1
        ========================================= */

        setStatus(
          "Step 1/6: Extracting document..."
        );

        const extractedText =
          await extractTextFromFile(file);


        if (!extractedText.trim()) {

          throw new Error(
            "Could not extract readable text."
          );
        }


        /* =========================================
           STEP 2
        ========================================= */

        setStatus(
          "Step 2/6: Creating text chunks..."
        );

        const chunks =
          createTextChunks(
            extractedText,
            600
          );


        if (!chunks.length) {

          throw new Error(
            "No usable chunks were created."
          );
        }


        /* PREVIEW */

        if (
          previewContainer &&
          previewBox
        ) {

          previewContainer.style.display =
            "block";

          previewBox.innerText =
            chunks[0];
        }


        /* =========================================
           STEP 3
        ========================================= */

        setStatus(
          "Step 3/6: Uploading document..."
        );


        const fileExt =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "unknown";


        const safeName =
          file.name.replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
          );


        const filePath =
          `${currentUser.uid}/${Date.now()}_${safeName}`;


        console.log(
          "Storage path:",
          filePath
        );


        const {
          data: storageData,
          error: storageError
        } =
          await supabaseClient
            .storage
            .from("loksewa_documents")
            .upload(
              filePath,
              file,
              {
                cacheControl: "3600",
                upsert: false
              }
            );


        if (storageError) {

          console.error(
            "Storage upload error:",
            storageError
          );

          throw new Error(
            `Storage upload failed: ${storageError.message}`
          );
        }


        /* =========================================
           STEP 4
        ========================================= */

        setStatus(
          "Step 4/6: Saving document..."
        );


        const {
          data: docData,
          error: docError
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


        if (docError) {

          throw new Error(
            `Document save failed: ${docError.message}`
          );
        }


        if (!docData?.id) {

          throw new Error(
            "Document ID was not returned."
          );
        }


        /* =========================================
           STEP 5
        ========================================= */

        setStatus(
          `Step 5/6: Saving ${chunks.length} chunks...`
        );


        const chunkRecords =
          chunks.map(
            (content, index) => ({

              document_id:
                docData.id,

              chunk_index:
                index,

              content,

              token_count:
                content.split(/\s+/).length

            })
          );


        const {
          error: chunkError
        } =
          await supabaseClient
            .from("document_chunks")
            .insert(chunkRecords);


        if (chunkError) {

          throw new Error(
            `Chunk save failed: ${chunkError.message}`
          );
        }


        /* =========================================
           STEP 6
        ========================================= */

        setStatus(
          "Step 6/6: Generating Loksewa MCQs..."
        );


        /*
          Only first chunk is sent to Gemini
          to control API usage.
        */

        const questions =
          await generateLoksewaQuestions(
            chunks[0],
            docData.id
          );


        /* =========================================
           SUCCESS
        ========================================= */

        setStatus(
          `Success! ${chunks.length} chunks saved and ${questions.length} MCQs generated.`,
          "success"
        );


        console.log(
          "Completed successfully:",
          {
            document: docData,
            questions
          }
        );


      } catch (error) {

        console.error(
          "PROCESSING ERROR:",
          error
        );


        setStatus(
          "Error: " +
          (
            error?.message ||
            String(error)
          ),
          "error"
        );

      } finally {

        uploadBtn.disabled = false;
      }

    }
  );

} else {

  console.error(
    "Upload button not found."
  );
           }
