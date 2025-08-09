const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// Initialize the Gemini AI model
const API_KEY = functions.config().generative_ai.api_key;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Firebase Callable Function to generate a website.
 *
 * @param {object} data - The form data from the client.
 * @param {object} context - The authentication context of the user.
 * @returns {Promise<{html: string}>} A promise that resolves with the generated HTML.
 */
exports.generateWebsite = functions.https.onCall(async (data, context) => {
  // Optional: Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to create a website.",
    );
  }

  // --- The Magic Prompt ---
  // This prompt is highly detailed to guide the AI effectively.
  const prompt = `
    You are an expert web developer. Based on the following JSON data, generate a complete, 
    single, responsive HTML file for a professional small business website.

    Business Data:
    ${JSON.stringify(data, null, 2)}

    Requirements:
    1.  **Structure**: Create a standard layout: Header (with business name), Hero section (with a catchy tagline), Services section, About/Contact section, and a simple Footer.
    2.  **Styling**: Use the Tailwind CSS CDN link in the <head>. Do NOT use any custom CSS in a <style> tag. All styling must be done with Tailwind utility classes directly on the HTML elements. The primary color for buttons, headings, and accents must be ${data.branding.primaryColor}.
    3.  **Responsiveness**: The layout must be fully responsive and look great on both mobile and desktop screens. Use flexbox or grid for layouts.
    4.  **Content**: Populate all sections with the provided business data. Create a grid or list for the services, displaying the name, price, and duration for each. Include all contact information. If a Google Maps address is provided, embed it using an iframe.
    5.  **Code Quality**: The final output should be ONLY the HTML code, starting with <!DOCTYPE html> and ending with </html>. Do not include any explanations, comments, or markdown ticks. The code must be clean, semantic, and production-ready.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let htmlContent = response.text();

    // Clean up the response from the AI, removing markdown backticks if they exist
    htmlContent = htmlContent.replace(/^```html\n?/, "").replace(/```$/, "");

    // Optional: Save the generated HTML to Firestore for the user
    const userId = context.auth.uid;
    await admin.firestore().collection("users").doc(userId).collection("websites").add({
        formData: data,
        generatedHtml: htmlContent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { html: htmlContent };

  } catch (error) {
    console.error("AI generation failed:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to generate website. Please try again later.",
    );
  }
});