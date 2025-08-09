import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function Dashboard({ user }) {
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebsites = async () => {
      if (!user) return;

      try {
        // Path to the user's subcollection of websites
        const websitesRef = collection(db, 'users', user.uid, 'websites');
        // Query to get all documents, ordered by creation date
        const q = query(websitesRef, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);

        const userWebsites = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().formData, // We'll display the form data
        }));

        setWebsites(userWebsites);
      } catch (err) {
        console.error("Error fetching websites:", err);
        setError("Failed to load your websites.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsites();
  }, [user]); // Re-run effect if the user object changes

  if (isLoading) {
    return <div className="p-8">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Websites</h1>
      {websites.length > 0 ? (
        <div className="space-y-4">
          {websites.map(site => (
            <div key={site.id} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{site.businessName}</h2>
                <p className="text-sm text-gray-500">Type: {site.businessType}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-800 rounded-lg">Preview</button>
                <button className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg">Edit</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p>You haven't created any websites yet.</p>
          <p className="mt-2">Go to the builder to get started!</p>
        </div>
      )}
    </div>
  );
}