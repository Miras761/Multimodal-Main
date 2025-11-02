import React, { useEffect, useState } from 'react';
import { CloseIcon } from './icons';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="relative inline-block">
      <img
        src={previewUrl}
        alt="Preview"
        className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-300"
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
        aria-label="Remove image"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ImagePreview;
