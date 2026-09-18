const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { Translate } = require("@google-cloud/translate").v2;

// ---------------------------------------------------------
// GLOBAL SETTINGS
// ---------------------------------------------------------

setGlobalOptions({
  region: "asia-south1",
  maxInstances: 10,
});

// Google Cloud Translation client.
// Firebase's service account is used automatically.
const translate = new Translate();


// ---------------------------------------------------------
// NEPALI → ENGLISH TRANSLATION
// ---------------------------------------------------------

exports.translateNepaliToEnglish = onCall(
  {
    region: "asia-south1",
    timeoutSeconds: 30,
    memory: "256MiB",
  },

  async (request) => {

    // -----------------------------------------------------
    // REQUIRE LOGIN
    // -----------------------------------------------------

    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Please login before using translation."
      );
    }


    // -----------------------------------------------------
    // READ DATA
    // -----------------------------------------------------

    const data = request.data || {};

    const texts = data.texts;


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!Array.isArray(texts)) {
      throw new HttpsError(
        "invalid-argument",
        "texts must be an array."
      );
    }


    if (texts.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "No text was provided."
      );
    }


    // A LoksewaQuest question normally contains:
    //
    // 1 question
    // + 4 options
    //
    // So 20 is already more than enough.
    if (texts.length > 20) {
      throw new HttpsError(
        "invalid-argument",
        "Maximum 20 text items are allowed per request."
      );
    }


    // -----------------------------------------------------
    // CLEAN TEXT
    // -----------------------------------------------------

    const cleanTexts = texts.map((text) => {

      if (typeof text !== "string") {
        throw new HttpsError(
          "invalid-argument",
          "Every text item must be a string."
        );
      }

      return text.trim();

    });


    // Reject empty text
    if (cleanTexts.some((text) => text.length === 0)) {
      throw new HttpsError(
        "invalid-argument",
        "Text items cannot be empty."
      );
    }


    // Prevent unexpectedly large requests.
    const totalCharacters = cleanTexts.reduce(
      (total, text) => total + text.length,
      0
    );

    if (totalCharacters > 10000) {
      throw new HttpsError(
        "invalid-argument",
        "Translation request is too large."
      );
    }


    // -----------------------------------------------------
    // TRANSLATE
    // -----------------------------------------------------

    try {

      const [translations] = await translate.translate(
        cleanTexts,
        {
          from: "ne",
          to: "en",
          format: "text",
        }
      );


      const translatedTexts =
        Array.isArray(translations)
          ? translations
          : [translations];


      return {
        success: true,
        sourceLanguage: "ne",
        targetLanguage: "en",
        translations: translatedTexts,
      };


    } catch (error) {

      console.error(
        "Google Cloud Translation error:",
        error
      );

      throw new HttpsError(
        "internal",
        "Unable to translate the question right now."
      );
    }
  }
);
