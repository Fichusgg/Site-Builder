const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();

// Initialize the Gemini AI model from API key in environment config
const API_KEY = functions.config().generative_ai.api_key;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.generateWebsite = functions.https.onCall(async (data, context) => {
  // 1. Check for Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a website."
    );
  }

  const userId = context.auth.uid;
  const { formData } = data; // Expect formData to be passed in

  // 2. Construct the Detailed AI Prompt
  const prompt = `
    You are an expert front-end developer specializing in Tailwind CSS.
    Based on this JSON data: ${JSON.stringify(formData, null, 2)}

    Generate a complete, single, responsive HTML file for a professional business website.

    **Strict Requirements:**
    1.  **HTML Structure:** Must be a full HTML5 document starting with <!DOCTYPE html>.
    2.  **Styling:** Use ONLY Tailwind CSS via the official CDN link in the <head>. Do not use any <style> blocks or inline style attributes.
    3.  **Colors:** The primary brand color is ${formData.branding.primaryColor}. Use this for main buttons, links, and section headers. Use shades of gray for body text and backgrounds.
    4.  **Responsiveness:** Must look excellent on mobile, tablet, and desktop screens. Use responsive prefixes like md: and lg:.
    5.  **Sections:** Include a header with the business name, a hero section with a compelling headline, a detailed services section (listing each service with its name, price, and duration), a simple "About Us" section, and a footer with contact information.
    6.  **Output:** Return ONLY the raw HTML code. Do not include any explanations, comments, or markdown "```html" backticks.
  `;

  try {
    // 3. Call the AI Model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let htmlContent = response.text();

    // Clean the response just in case markdown is included
    htmlContent = htmlContent.replace(/^```html\n?/, "").replace(/```$/, "");

    // 4. Save to Firestore
    const websiteRef = db.collection("users").doc(userId).collection("websites").doc();
    await websiteRef.set({
      formData: formData,
      generatedHtml: htmlContent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isPaid: false, // For future monetization
    });

    // 5. Return HTML to the client
    return { html: htmlContent };

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "The AI failed to generate the website. Please try again."
    );
  }
});