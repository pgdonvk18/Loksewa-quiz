/* =========================================================
   LOKSEWAQUEST - SOURCE PARSER
   Firebase Auth + Supabase + PDF.js + Gemini Edge Function
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
   4. SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  "https://edyirdedkiarguvurpxq.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWlyZGVka2lhcmd1dnVycHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTg2NjIsImV4cCI6MjEwNDU5NDY2Mn0.yhNn3YKmFSkxRdefk2F22qxTFhuKS90NH5fa3zzKSaY";


/* =========================================================
   5. CHECK SUPABASE LIBRARY
========================================================= */

if (!window.supabase) {
  console.error(
    "Supabase library was not loaded."
  );

  throw new Error(
    "Supabase library failed to load. Check your HTML CDN."
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

  console.error(
    "PDF.js was not loaded."
  );

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
   9. STATUS HELPER
========================================================= */

function setStatus(message, type = "info") {

  if (!statusMsg) return;

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
   10. FIREBASE AUTH MONITORING
========================================================= */

onAuthStateChanged(auth, (user) => {

  if (user) {

    currentUser = user;

    console.log(
      "Firebase user logged in:",
      user.uid
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
});


/* =========================================================
   11. PDF TEXT EXTRACTION
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
    await pdfjsLib
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
        .map(item => item.str || "")
        .join(" ");

    fullText +=
      `\n--- Page ${pageNum} ---\n${pageText}`;
  }

  return fullText.trim();
}


/* =========================================================
   12. TEXT EXTRACTION FOR TXT FILE
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

  } else {

    return await file.text();
  }
}


/* =========================================================
   13. CREATE TEXT CHUNKS
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
   14. GENERATE LOKSEWA QUESTIONS
      USING SUPABASE EDGE FUNCTION
========================================================= */

async function generateLoksewaQuestions(
  chunkContent,
  documentId
) {

  if (!currentUser) {

    throw new Error(
      "User must be authenticated."
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

  console.log(
    "Function:",
    "generate-ai-quiz"
  );

  console.log(
    "Chunk length:",
    chunkContent.length
  );


  /* -----------------------------------------
     CALL EDGE FUNCTION
  ----------------------------------------- */

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


  /* -----------------------------------------
     LOG RESPONSE
  ----------------------------------------- */

  console.log(
    "Edge Function data:",
    data
  );

  console.log(
    "Edge Function error:",
    error
  );


  /* -----------------------------------------
     SUPABASE CLIENT ERROR
  ----------------------------------------- */

  if (error) {

    console.error(
      "Supabase Function Error:",
      error
    );

    throw new Error(
      `Edge Function Error: ${error.message}`
    );
  }


  /* -----------------------------------------
     EMPTY RESPONSE
  ----------------------------------------- */

  if (!data) {

    throw new Error(
      "Edge Function returned no data."
    );
  }


  /* -----------------------------------------
     APPLICATION ERROR FROM EDGE FUNCTION
  ----------------------------------------- */

  if (
    data.success === false
  ) {

    console.error(
      "AI generation failed:",
      data
    );

    const details =
      data.details ||
      data.error ||
      "Unknown AI generation error.";

    throw new Error(
      details
    );
  }


  /* -----------------------------------------
     CHECK QUESTIONS ARRAY
  ----------------------------------------- */

  if (
    !Array.isArray(data.questions)
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
      "AI generated zero valid questions."
    );
  }


  console.log(
    `AI generated ${questionsArray.length} questions.`
  );


  /* -----------------------------------------
     VALIDATE QUESTIONS
  ----------------------------------------- */

  const validQuestions =
    questionsArray.filter((q) => {

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


  if (
    validQuestions.length === 0
  ) {

    throw new Error(
      "AI returned questions, but none passed validation."
    );
  }


  /* -----------------------------------------
     PREPARE DATABASE RECORDS
  ----------------------------------------- */

  const recordsToInsert =
    validQuestions.map((q) => ({

      document_id:
        documentId,

      /*
       * Firebase UID
       *
       * Make sure your Supabase
       * user_id column can store
       * Firebase UID as TEXT.
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


  console.log(
    "Saving generated questions:",
    recordsToInsert
  );


  /* -----------------------------------------
     INSERT INTO SUPABASE
  ----------------------------------------- */

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
      "quiz_questions insert error:",
      dbError
    );

    throw new Error(
      `Failed to save questions: ${dbError.message}`
    );
  }


  console.log(
    "Questions saved:",
    savedQuestions
  );


  return savedQuestions || [];
}


/* =========================================================
   15. UPLOAD BUTTON EVENT
========================================================= */

if (uploadBtn) {

  uploadBtn.addEventListener(
    "click",
    async () => {

      /* -----------------------------------------
         CHECK AUTH
      ----------------------------------------- */

      if (!currentUser) {

        alert(
          "You must be logged in to process documents."
        );

        return;
      }


      /* -----------------------------------------
         CHECK FILE
      ----------------------------------------- */

      const file =
        fileInput?.files?.[0];


      if (!file) {

        alert(
          "Please select a PDF or text file first."
        );

        return;
      }


      /* -----------------------------------------
         DISABLE BUTTON
      ----------------------------------------- */

      uploadBtn.disabled = true;


      try {

        /* ========================================
           STEP 1
        ======================================== */

        setStatus(
          "Step 1/6: Extracting document text..."
        );


        let extractedText =
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


        /* ========================================
           STEP 2
        ======================================== */

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


        /* ========================================
           PREVIEW
        ======================================== */

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


        /* ========================================
           STEP 3
        ======================================== */

        setStatus(
          "Step 3/6: Uploading document to storage..."
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


        console.log(
          "Uploading:",
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
              file
            );


        if (storageError) {

          console.error(
            "Storage error:",
            storageError
          );

          throw new Error(
            `Storage upload failed: ${storageError.message}`
          );
        }


        if (!storageData?.path) {

          throw new Error(
            "File uploaded but no storage path was returned."
          );
        }


        /* ========================================
           STEP 4
        ======================================== */

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
            "Document was saved but no document ID was returned."
          );
        }


        console.log(
          "Document created:",
          docData.id
        );


        /* ========================================
           STEP 5
        ======================================== */

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


        /* ========================================
           STEP 6
        ======================================== */

        setStatus(
          "Step 6/6: Generating Loksewa MCQs with AI..."
        );


        /*
         * Currently generating questions
         * from the FIRST chunk only.
         *
         * This keeps Gemini usage lower.
         */

        const generatedQuestions =
          await generateLoksewaQuestions(
            chunks[0],
            docData.id
          );


        /* ========================================
           SUCCESS
        ======================================== */

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


      } catch (err) {

        /* ========================================
           ERROR HANDLING
        ======================================== */

        console.error(
          "PROCESSING ERROR:",
          err
        );


        const message =
          err?.message ||
          String(err) ||
          "Unknown error";


        setStatus(
          "Error: " + message,
          "error"
        );

      } finally {

        /* ========================================
           RE-ENABLE BUTTON
        ======================================== */

        uploadBtn.disabled = false;
      }

    }
  );

} else {

  console.error(
    "Upload button was not found."
  );
    }
