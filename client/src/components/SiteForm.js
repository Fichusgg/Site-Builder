import React, { useState } from 'react';

// A simple form to collect the essential data. You can expand this into a multi-step form later.
export default function SiteForm({ onGenerate, isLoading }) {
  const [formData, setFormData] = useState({
    businessName: "Dan's Barber Shop",
    businessType: "Barber Shop",
    branding: {
      primaryColor: "#059669", // A nice default green
    },
    contact: {
      email: "contact@dansbarbers.com",
      phone: "555-123-4567",
    },
    services: [
      { name: "Men's Haircut", price: "45", duration: "30" },
      { name: "Beard Trim", price: "25", duration: "15" },
      { name: "Hot Towel Shave", price: "50", duration: "45" },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'primaryColor') {
      setFormData(prev => ({ ...prev, branding: { ...prev.branding, primaryColor: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">1. Enter Your Business Details</h2>
      
      <div className="mb-4">
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
        <input
          type="text"
          name="businessName"
          id="businessName"
          value={formData.businessName}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Brand Color</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            name="primaryColor"
            id="primaryColor"
            value={formData.branding.primaryColor}
            onChange={handleChange}
            className="p-1 h-10 w-10 block bg-white border border-gray-300 rounded-md cursor-pointer"
          />
          <span className="font-mono text-gray-600">{formData.branding.primaryColor}</span>
        </div>
      </div>

      {/* You would add more form fields for services, contact, etc. here */}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '🤖 Generating Your Site...' : '🚀 Generate My Website'}
      </button>
    </form>
  );
}