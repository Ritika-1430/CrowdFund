import React from 'react';

type Props = {
  open: boolean;
  images: { src: string; alt?: string }[];
  startIndex?: number;
  onClose: () => void;
};

const GalleryModal: React.FC<Props> = ({ open, images, startIndex = 0, onClose }) => {
  const [index, setIndex] = React.useState(startIndex);

  React.useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, open]);

  if (!open) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full">
        <div className="relative">
          <button onClick={onClose} className="absolute top-3 right-3 z-20 bg-white rounded-full p-2 shadow">✕</button>
          <img src={images[index].src} alt={images[index].alt || `image-${index}`} className="w-full h-96 object-cover" />
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow">◀</button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow">▶</button>
        </div>
        <div className="p-4">
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-20 h-14 flex-shrink-0 overflow-hidden rounded ${i === index ? 'ring-2 ring-green-500' : ''}`}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
