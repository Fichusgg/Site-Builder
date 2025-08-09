import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig'; // Your initialized Firebase services

import SiteForm from '../components/SiteForm';
import PreviewWindow from '../components/PreviewWindow';

// Create a reference to the Firebase Cloud Function 'generateWebsite'
const generateWebsiteCallable = httpsCallable(functions, 'generateWebsite');

/**
 * The main builder page component.
 * It orchestrates the form, the call to the AI backend, and the preview display.
 * @param {object} props - The component props.
 * @param {object} props.user - The authenticated user object from Firebase.
 */
export default function Builder({ user }) {
  // State to hold the HTML code returned by the AI
  const [generatedHtml, setGeneratedHtml] = useState('');
  
  // State to manage the loading status while the AI is working
  const [isLoading, setIsLoading] = useState(false);
  
  // State to hold any potential error messages
  const [error, setError] = useState(null);

  /**
   * Handles the form submission.
   * This function calls the backend Firebase Function with the user's form data.
   * @param {object} formData - The data collected from the SiteForm component.
   */
  const handleGenerate = async (formData) => {
    // 1. Check if a user is logged in before proceeding
    if (!user) {
      setError("Please log in to generate and save your website.");
      return;
    }

    // 2. Set loading state and clear previous results/errors
    setIsLoading(true);
    setError(null);
    setGeneratedHtml('');

    try {
      // 3. Call the Firebase Cloud Function with the form data.
      // Firebase automatically includes user authentication context on the backend.
      console.log("Sending data to AI:", formData);
      const result = await generateWebsiteCallable(formData);
      
      // 4. Extract the HTML from the response
      const { html } = result.data;
      
      if (!html) {
          throw new Error("The AI returned an empty response. Please try a different prompt or adjust your details.");
      }

      // 5. Update the state with the generated HTML to display it in the preview
      setGeneratedHtml(html);

    } catch (err) {
      // 6. If an error occurs, log it and update the error state to inform the user
      console.error("Error calling Firebase Function:", err);
      setError(err.message || 'An unknown error occurred while generating the site.');
    } finally {
      // 7. Reset the loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Form */}
        <div className="lg:col-span-1">
          <SiteForm onGenerate={handleGenerate} isLoading={isLoading} />
          
          {/* Display an error message if one exists */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg shadow">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Right Column: The Preview Window */}
        <div className="lg:col-span-2">
          <PreviewWindow htmlContent={generatedHtml} isLoading={isLoading} />
        </div>

      </main>
    </div>
  );
}