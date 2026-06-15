import React from 'react';
import { categoryKits, fallbackKitImage, kitImageSrc } from '../utils/donationKits';
import { useNavigate } from 'react-router-dom';

type Props = {
  open: boolean;
  category: string;
  fundId: string;
  onClose: () => void;
};

const KitSelectorModal: React.FC<Props> = ({ open, category, fundId, onClose }) => {
  const navigate = useNavigate();
  if (!open) return null;

  const kits = (categoryKits[category] || { bannerQuery: category, items: [] }) as typeof categoryKits[string];

  const handleSelect = (itemId: string) => {
    // navigate to donate page with selected kit
    navigate(`/funds/${fundId}/donate?kit=${encodeURIComponent(itemId)}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg overflow-auto max-w-4xl w-full max-h-[90vh]">
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-semibold">Choose a donation kit</h2>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kits.items.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex gap-4 items-center">
              <img
                src={kitImageSrc(item, 400, 240)}
                alt={item.name}
                className="w-32 h-20 object-cover rounded bg-gray-100"
                onError={(event) => {
                  event.currentTarget.src = fallbackKitImage;
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">₹{item.unitPrice.toLocaleString('en-IN')}</p>
                {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleSelect(item.id)} className="px-4 py-2 bg-green-600 text-white rounded">Donate for this kit</button>
              </div>
            </div>
          ))}
          {kits.items.length === 0 && (
            <div className="p-6 text-center text-gray-600">No kits available for this category.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitSelectorModal;
