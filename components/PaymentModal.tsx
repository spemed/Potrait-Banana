import React, { useState } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: () => void;
}

type PaymentMethod = 'Card' | 'PayPal' | 'Alipay';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSubscriptionSuccess }) => {
  const [activeTab, setActiveTab] = useState<PaymentMethod>('Card');
  const [testCode, setTestCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApplyCode = () => {
    if (testCode === 'BANANA2024') {
      setError('');
      onSubscriptionSuccess();
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  const paymentMethods: PaymentMethod[] = ['Card', 'PayPal', 'Alipay'];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
        <div className="p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Close payment modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <SparkleIcon className="w-10 h-10 text-pink-500 mx-auto mb-2" />
            <h2 className="text-3xl font-bold font-serif tracking-tight text-gray-900 dark:text-white">Upgrade to Pro</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Unlock all 20+ portrait styles and unlimited downloads.</p>
          </div>

          <div className="mt-8">
            <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method}
                  onClick={() => setActiveTab(method)}
                  className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                    activeTab === method 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>This is a demo. No real payment will be processed.</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <label htmlFor="test-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Have a test code?
            </label>
            <div className="mt-2 flex gap-3">
              <input
                type="text"
                id="test-code"
                value={testCode}
                onChange={(e) => {
                  setTestCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter test code"
                className="flex-grow px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
              />
              <button
                onClick={handleApplyCode}
                className="px-5 py-2 bg-gray-800 text-white dark:bg-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div className="mt-8">
             <button
                disabled={true}
                className="w-full py-3 bg-pink-600 text-white rounded-lg font-semibold text-base hover:bg-pink-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Pay $9.99 (Disabled)
              </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fadeInScale 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};