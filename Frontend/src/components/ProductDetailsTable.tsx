import React from 'react';

type BreakdownItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: { url: string; alt?: string };
  description?: string;
};

type Props = {
  items: BreakdownItem[];
  totalRequired: number;
};

const ProductDetailsTable: React.FC<Props> = ({ items, totalRequired }) => {
  return (
    <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">💰 Where Your Money Goes</h2>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 flex gap-4">
            {/* Image */}
            {item.image?.url ? (
              <img src={item.image.url} alt={item.image.alt || item.name} className="w-20 h-20 object-cover rounded" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-2xl">📦</div>
            )}

            {/* Details */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}

              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  Qty: <span className="font-semibold">{item.quantity}</span>
                </span>
                <span className="text-gray-700">
                  @ <span className="font-semibold">₹{item.unitPrice.toLocaleString('en-IN')}</span> each
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{item.totalPrice.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">total</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t-2 border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Campaign Goal:</span>
          <span className="text-3xl font-bold text-green-600">₹{totalRequired.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsTable;
