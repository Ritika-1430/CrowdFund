import React from 'react';
import { fallbackKitImage, kitImageSrc } from '../utils/donationKits';

type Props = {
  id: string;
  name: string;
  unitPrice: number;
  imageQuery: string;
  imageUrl?: string;
  description?: string;
  icons?: string[];
  quantity?: number;
  obtained?: number;
  onAdd: (itemId: string) => void;
};

const ProductCard: React.FC<Props> = ({
  id,
  name,
  unitPrice,
  imageQuery,
  imageUrl,
  description,
  icons = [],
  quantity = 100,
  obtained = 45,
  onAdd,
}) => {
  const progress = Math.min((obtained / quantity) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Product Image */}
      <div className="h-40 overflow-hidden bg-gray-100">
        <img
          src={kitImageSrc({ imageQuery, imageUrl }, 600, 400)}
          alt={name}
          className="w-full h-40 object-cover"
          onError={(event) => {
            event.currentTarget.src = fallbackKitImage;
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Name & Price */}
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}

        {/* Icons */}
        {icons.length > 0 && (
          <div className="mt-2 flex gap-2 text-lg" aria-hidden>
            {icons.map((ic, i) => (
              <span key={i} title={ic}>
                {ic}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4 mb-3">
          <div className="bg-gray-200 h-3 rounded-full overflow-hidden mb-2">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{obtained} obtained</span>
            <span>{quantity} needed</span>
          </div>
          <div className="text-xs text-green-600 font-semibold mt-1">{progress.toFixed(0)}% complete</div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">₹{unitPrice.toLocaleString('en-IN')}</span>
          <button
            onClick={() => onAdd(id)}
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-green-700 transition"
          >
            ADD +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
