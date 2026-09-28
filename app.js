/* =========================================================
   LOKSEWAQUEST SOURCE PARSER
   Firebase Auth + Supabase + PDF.js + Gemini Edge Function

   FEATURES:
   - PDF/TXT extraction
   - 600-word chunks
   - Supabase document storage
   - Supabase chunk storage
   - Process EVERY chunk sequentially
   - Send documentId with every Gemini request
   - Duplicate protection handled by Edge Function
   - Collect all generated questions
   - Save questions to quiz_questions
   - Display final unique question count
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

const firebaseApp =
  initializeApp(firebaseConfig);

const auth =
  getAuth(firebaseApp);

let currentUser = null;


/* =========================================================
   4. SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://edyirdedkiarguvurpxq.supabase.co";

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

function setStatus(
  message,
  type = "info"
) {

  if (!statusMsg) {
    return;
  }

  statusMsg.innerText =
    message;


  if (type === "success") {

    statusMsg.style.color =
      "#15803d";

  } else if (type === "error") {

    statusMsg.style.color =
      "#dc2626";

  } else {

    statusMsg.style.color =
      "#1e40af";

  }

}


/* =========================================================
   10. FIREBASE AUTH STATE
========================================================= */

onAuthStateChanged(
  auth,
  (user) => {

    if (user) {

      currentUser =
        user;

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

        anonLoginBtn.style.display =
          "none";

      }

    } else {

      currentUser =
        null;

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

        anonLoginBtn.style.display =
          "block";

      }

    }

  }
);


/* =========================================================
   11. QUICK GUEST LOGIN
========================================================= */

if (anonLoginBtn) {

  anonLoginBtn.addEventListener(
    "click",
    async () => {

      anonLoginBtn.disabled =
        true;

      anonLoginBtn.innerText =
        "Signing in...";


      try {

        setStatus(
          "Signing in as guest..."
        );


        const result =
          await signInAnonymously(
            auth
          );


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
          (
            error.message ||
            error
          ),
          "error"
        );


        alert(
          "Firebase Guest Login failed.\n\n" +
          (
            error.message ||
            error
          )
        );


        anonLoginBtn.disabled =
          false;

        anonLoginBtn.innerText =
          "Quick Guest Login";

      }

    }
  );

}


/* =========================================================
   12. PDF TEXT EXTRACTION
========================================================= */

async function extractTextFromPDF(
  file
) {

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


  let fullText =
    "";


  for (
    let pageNum = 1;
    pageNum <= pdf.numPages;
    pageNum++
  ) {

    setStatus(
      `Extracting PDF page ${pageNum}/${pdf.numPages}...`
    );


    const page =
      await pdf.getPage(
        pageNum
      );


    const textContent =
      await page.getTextContent();


    const pageText =
      textContent.items
        .map(
          item =>
            item.str || ""
        )
        .join(" ");


    fullText +=
      `\n--- Page ${pageNum} ---\n${pageText}`;

  }


  return fullText.trim();

}


/* =========================================================
   13. TEXT/PDF EXTRACTION
========================================================= */

async function extractTextFromFile(
  file
) {

  if (!file) {

    throw new Error(
      "No file selected."
    );

  }


  const isPDF =
    file.type ===
      "application/pdf" ||
    file.name
      .toLowerCase()
      .endsWith(".pdf");


  if (isPDF) {

    return await extractTextFromPDF(
      file
    );

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


  const chunks =
    [];


  for (
    let i = 0;
    i < words.length;
    i += wordsPerChunk
  ) {

    const chunk =
      words
        .slice(
          i,
          i + wordsPerChunk
        )
        .join(" ")
        .trim();


    if (chunk) {

      chunks.push(
        chunk
      );

    }

  }


  return chunks;

}


/* =========================================================
   15. GENERATE QUESTIONS FOR ONE CHUNK
========================================================= */

async function generateQuestionsForChunk(
  chunkContent,
  documentId,
  chunkIndex,
  totalChunks
) {

  if (!currentUser) {

    throw new Error(
      "Firebase authentication required."
    );

  }


  const cleanChunk =
    String(
      chunkContent || ""
    ).trim();


  if (!cleanChunk) {

    console.warn(
      `Chunk ${chunkIndex + 1} is empty. Skipping.`
    );

    return [];

  }


  console.log(
    `Processing chunk ${chunkIndex + 1}/${totalChunks}`
  );


  console.log(
    "Chunk length:",
    cleanChunk.length
  );


  setStatus(
    `Step 6/6: Generating MCQs from chunk ${chunkIndex + 1}/${totalChunks}...`
  );


  const {
    data,
    error
  } =
    await supabaseClient
      .functions
      .invoke(
        "generate-ai-quiz",
        {
          body: {

            chunkContent:
              cleanChunk,

            documentId:
              documentId

          }
        }
      );


  console.log(
    `Chunk ${chunkIndex + 1} Edge Function response:`,
    data
  );


  if (error) {

    throw new Error(
      `Chunk ${chunkIndex + 1} Edge Function Error: ${error.message}`
    );

  }


  if (!data) {

    throw new Error(
      `Chunk ${chunkIndex + 1}: Edge Function returned no data.`
    );

  }


  if (data.error) {

    throw new Error(
      `Chunk ${chunkIndex + 1}: ${data.error}`
    );

  }


  if (
    !Array.isArray(
      data.questions
    )
  ) {

    throw new Error(
      `Chunk ${chunkIndex + 1}: questions array missing.`
    );

  }


  console.log(
    `Chunk ${chunkIndex + 1} generated ${data.questions.length} unique questions.`
  );


  return data.questions;

}


/* =========================================================
   16. REMOVE DUPLICATES CLIENT-SIDE
       
   Extra safety layer.
========================================================= */

function normalizeQuestion(
  question
) {

  return String(
    question || ""
  )
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(
      /[?？!！.,।,:;'"“”‘’\-–—()[\]{}]/g,
      ""
    )
    .trim();

}


/* =========================================================
   17. UNIQUE QUESTION FILTER
========================================================= */

function removeDuplicateQuestions(
  questions
) {

  const seen =
    new Set();


  const unique =
    [];


  for (
    const question
    of questions
  ) {

    const key =
      normalizeQuestion(
        question.question
      );


    if (!key) {
      continue;
    }


    if (
      seen.has(key)
    ) {

      console.log(
        "Client-side duplicate removed:",
        question.question
      );

      continue;

    }


    seen.add(key);

    unique.push(
      question
    );

  }


  return unique;

}


/* =========================================================
   18. MAIN PROCESS
========================================================= */

if (uploadBtn) {

  uploadBtn.addEventListener(
    "click",
    async () => {

      /* ===================================================
         AUTH
      =================================================== */

      if (!currentUser) {

        alert(
          "Please login first using Quick Guest Login."
        );

        return;

      }


      /* ===================================================
         FILE
      =================================================== */

      const file =
        fileInput?.files?.[0];


      if (!file) {

        alert(
          "Please select a PDF or TXT file."
        );

        return;

      }


      uploadBtn.disabled =
        true;


      try {

        /* =================================================
           STEP 1
        ================================================= */

        setStatus(
          "Step 1/6: Extracting document..."
        );


        const extractedText =
          await extractTextFromFile(
            file
          );


        if (
          !extractedText.trim()
        ) {

          throw new Error(
            "Could not extract readable text."
          );

        }


        console.log(
          "Extracted characters:",
          extractedText.length
        );


        /* =================================================
           STEP 2
        ================================================= */

        setStatus(
          "Step 2/6: Creating text chunks..."
        );


        const chunks =
          createTextChunks(
            extractedText,
            600
          );


        if (
          !chunks.length
        ) {

          throw new Error(
            "No usable chunks were created."
          );

        }


        console.log(
          "Total chunks:",
          chunks.length
        );


        /* =================================================
           PREVIEW
        ================================================= */

        if (
          previewContainer &&
          previewBox
        ) {

          previewContainer.style.display =
            "block";


          previewBox.innerText =
            chunks[0];

        }


        /* =================================================
           STEP 3
        ================================================= */

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
            .from(
              "loksewa_documents"
            )
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  "3600",

                upsert:
                  false
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


        /* =================================================
           STEP 4
        ================================================= */

        setStatus(
          "Step 4/6: Saving document..."
        );


        const {
          data: docData,
          error: docError
        } =
          await supabaseClient
            .from(
              "documents"
            )
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


        const documentId =
          docData.id;


        console.log(
          "Document ID:",
          documentId
        );


        /* =================================================
           STEP 5
        ================================================= */

        setStatus(
          `Step 5/6: Saving ${chunks.length} chunks...`
        );


        const chunkRecords =
          chunks.map(
            (
              content,
              index
            ) => ({

              document_id:
                documentId,

              chunk_index:
                index,

              content:
                content,

              token_count:
                content
                  .split(/\s+/)
                  .length

            })
          );


        const {
          error: chunkError
        } =
          await supabaseClient
            .from(
              "document_chunks"
            )
            .insert(
              chunkRecords
            );


        if (chunkError) {

          throw new Error(
            `Chunk save failed: ${chunkError.message}`
          );

        }


        /* =================================================
           STEP 6
           PROCESS EVERY CHUNK SEQUENTIALLY
        ================================================= */

        setStatus(
          `Step 6/6: Generating MCQs from ${chunks.length} chunks...`
        );


        const allGeneratedQuestions =
          [];


        let skippedChunks =
          0;


        for (
          let i = 0;
          i < chunks.length;
          i++
        ) {

          const chunk =
            chunks[i];


          console.log(
            `Starting chunk ${i + 1}/${chunks.length}`
          );


          try {

            const questions =
              await generateQuestionsForChunk(
                chunk,
                documentId,
                i,
                chunks.length
              );


            if (
              Array.isArray(
                questions
              )
            ) {

              allGeneratedQuestions.push(
                ...questions
              );

            }


          } catch (chunkError) {

            console.error(
              `Chunk ${i + 1} failed:`,
              chunkError
            );


            /*
              Continue with remaining chunks
              instead of destroying the entire
              upload process.
            */

            skippedChunks++;


            setStatus(
              `Chunk ${i + 1} failed. Continuing with remaining chunks...`,
              "error"
            );

          }


          /* =============================================
             Small delay between Gemini calls
             Helps avoid rapid-fire requests.
          ============================================= */

          if (
            i <
            chunks.length - 1
          ) {

            await new Promise(
              resolve =>
                setTimeout(
                  resolve,
                  500
                )
            );

          }

        }


        /* =================================================
           REMOVE CLIENT-SIDE DUPLICATES
        ================================================= */

        const uniqueQuestions =
          removeDuplicateQuestions(
            allGeneratedQuestions
          );


        /* =================================================
           FINAL COUNT
        ================================================= */

        console.log(
          "Total Gemini questions:",
          allGeneratedQuestions.length
        );


        console.log(
          "Final unique questions:",
          uniqueQuestions.length
        );


        console.log(
          "Skipped chunks:",
          skippedChunks
        );


        /* =================================================
           NOTE
           
           The Edge Function is already responsible
           for saving questions in your current setup.

           Therefore we DO NOT insert them again here.
        ================================================= */


        /* =================================================
           SUCCESS MESSAGE
        ================================================= */

        if (
          skippedChunks > 0
        ) {

          setStatus(
            `Completed with warnings: ${chunks.length - skippedChunks}/${chunks.length} chunks processed. ${uniqueQuestions.length} unique MCQs generated.`,
            "success"
          );

        } else {

          setStatus(
            `Success! ${chunks.length} chunks processed and ${uniqueQuestions.length} unique MCQs generated.`,
            "success"
          );

        }


        /* =================================================
           FINAL ALERT
        ================================================= */

        alert(
          `AI Quiz Generation Complete!\n\n` +

          `📄 Chunks: ${chunks.length}\n` +

          `🤖 Questions generated: ${allGeneratedQuestions.length}\n` +

          `✅ Final unique questions: ${uniqueQuestions.length}\n` +

          (
            skippedChunks > 0
              ? `⚠️ Chunks skipped: ${skippedChunks}\n`
              : ""
          )
        );


        /* =================================================
           FINAL CONSOLE DATA
        ================================================= */

        console.log(
          "Completed successfully:",
          {

            document:
              docData,

            chunks:
              chunks.length,

            generated:
              allGeneratedQuestions.length,

            unique:
              uniqueQuestions.length,

            skippedChunks:
              skippedChunks,

            questions:
              uniqueQuestions

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


        alert(
          "Processing failed.\n\n" +
          (
            error?.message ||
            String(error)
          )
        );


      } finally {

        uploadBtn.disabled =
          false;

      }

    }
  );


} else {

  console.error(
    "Upload button not found."
  );

       }
