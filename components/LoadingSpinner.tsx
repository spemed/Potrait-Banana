import React, { useState, useEffect } from 'react';

const messages = [
  "Warming up the AI artist...",
  "Applying professional styles...",
  "Rendering artistic portraits...",
  "Adding the final touches...",
  "Almost there, crafting perfection..."
];

export const LoadingSpinner: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-gray-900 dark:border-white"></div>
      <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">{messages[messageIndex]}</p>
    </div>
  );
};
