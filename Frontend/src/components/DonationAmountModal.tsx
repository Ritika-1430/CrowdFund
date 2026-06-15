import React, { useState } from 'react';

type Props = {
  open: boolean;
  fundTitle: string;
  onClose: () => void;
  onDonate: (amount: number) => void;
};

const DonationAmountModal: React.FC<Props> = ({ open, fundTitle, onClose, onDonate }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const presets = [500, 1100, 1500, 2000, 5000, 10000];

  const handleDonate = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (amount && amount > 0) {
      onDonate(amount);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md shadow-xl animate-in slide-in-from-bottom-1/2">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Select Amount</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">{fundTitle}</p>

          {/* Preset Amounts */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {presets.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`py-3 rounded-lg font-semibold text-sm transition ${
                  selectedAmount === amount
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                ₹{amount.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Or enter custom amount</label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg px-3 py-2">
              <span className="text-gray-700 font-semibold mr-2">₹</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="Enter amount"
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
              <span>✓</span>
              <span className="text-gray-700">100% Secure payment</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
              <span>✓</span>
              <span className="text-gray-700">Tax benefit under 80G</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <button
            onClick={handleDonate}
            disabled={!selectedAmount && !customAmount}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold mb-3 disabled:opacity-50 hover:shadow-lg transition"
          >
            Proceed to Payment
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationAmountModal;
