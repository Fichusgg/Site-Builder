const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Firebase services once
admin.initializeApp();
const db = admin.firestore();

// Initialize the AI model from the environment configuration
// Ensure you've set this with the CLI: firebase functions:config:set generative_ai.api_key="..."
const API_KEY = functions.config().generative_ai.api_key;
if (!API_KEY) {
  console.error("FATAL ERROR: Generative AI API Key is not set in function configuration.");
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * A callable function to generate a website using AI and save it to Firestore.
 */
exports.generateWebsite = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check: Ensure the user is logged in.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to perform this action."
    );
  }
  const userId = context.auth.uid;

  // 2. Data Validation: Expect data to be wrapped in a 'formData' object.
  const { formData } = data;
  if (!formData || !formData.businessName || !formData.branding.primaryColor) {
      throw new functions.https.HttpsError(
        "invalid-argument", 
        "The function must be called with a valid 'formData' object."
      );
  }

  // 3. Prompt Engineering: Construct a highly detailed prompt for the AI.
  const prompt = `
    You are an expert front-end developer specializing in modern, responsive websites using Tailwind CSS.
    Generate a complete, single-file HTML document based on the following JSON data:
    ${JSON.stringify(formData, null, 2)}

    **Strict Requirements:**
    - **Document Type:** Must be a full HTML5 document starting with \`<!DOCTYPE html>\`.
    - **Styling:** You MUST use the Tailwind CSS CDN script in the \`<head>\`. All styling MUST be done with Tailwind utility classes directly in the HTML elements. Do NOT use \`<style>\` blocks or inline \`style=""\` attributes.
    - **Branding:** The primary brand color is \`${formData.branding.primaryColor}\`. Use this color for important elements like buttons, headlines, and link hover states (e.g., \`bg-blue-600\`, \`text-blue-600\`). Choose appropriate light and dark shades of gray for text and backgrounds (e.g., \`text-gray-800\`, \`bg-gray-100\`).
    - **Layout & Sections:** The layout must be fully responsive. It should include:
        1. A clean header with the business name.
        2. A hero section with a large, engaging headline and a call-to-action button.
        3. A "Our Services" section that lists each service with its name, price, and duration in a grid or flexbox layout.
        4. A simple "About Us" or contact section with the provided email and phone number.
        5. A simple footer.
    - **Output Format:** Your entire response MUST be only the raw HTML code. Do not include any explanations, comments, or markdown formatting like \`\`\`html.
  `;

  try {
    // 4. AI Generation
    const result = await model.generateContent(prompt);
    const response = result.response;
    let htmlContent = response.text();

    // Clean the response to ensure it's pure HTML
    htmlContent = htmlContent.replace(/^```html\n?/, "").replace(/```$/, "").trim();

    if (!htmlContent.startsWith("<!DOCTYPE html>")) {
        throw new Error("AI returned invalid HTML format.");
    }
    
    // 5. Save to Firestore
    const websiteRef = db.collection("users").doc(userId).collection("websites").doc();
    await websiteRef.set({
      formData: formData,
      generatedHtml: htmlContent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isPaid: false,
    });

    // 6. Return to Client
    return { html: htmlContent };

  } catch (error) {
    console.error("Error in generateWebsite function:", error);
    // Throw a user-friendly error back to the client
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while generating the website. Please try again later.",
      error.message
    );
  }
});