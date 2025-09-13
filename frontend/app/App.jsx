'use client';
import React from 'react';
import Cars from './components/Cars';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">
              Compra Tu Auto
            </h1>
          </div>
        </div>
      </header>

      <main>
        <Cars />
      </main>
    </div>
  );
}

export default App;