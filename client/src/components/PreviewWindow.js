import React from 'react';

export default function PreviewWindow({ htmlContent, isLoading }) {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-2xl font-bold">2. Live Preview</h2>
      </div>
      <div className="relative w-full h-[600px] bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">Building your custom website...</p>
              <p className="text-gray-500">The AI is warming up!</p>
            </div>
          </div>
        )}
        <iframe
          srcDoc={htmlContent || "<p class='p-4 text-center text-gray-500'>Your generated website will appear here.</p>"}
          title="Website Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts" // Allows scripts but maintains security
        />
      </div>
    </div>
  );
}