import React from 'react';
import type { GeneratedImage } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { LockIcon } from './icons/LockIcon';

interface ImageGridProps {
  images: GeneratedImage[];
  selectedImages: string[];
  onImageSelect: (id: string) => void;
  onDownload: () => void;
  isSubscribed: boolean;
}

const ImageCard: React.FC<{ image: GeneratedImage; isSelected: boolean; onSelect: (id: string) => void }> = ({ image, isSelected, onSelect }) => {
  return (
    <div className="relative group cursor-pointer aspect-[1/1]" onClick={() => onSelect(image.id)}>
      <img src={image.src} alt={image.name} className="w-full h-full object-cover rounded-lg shadow-lg transition-transform transform group-hover:scale-105" />
      
      <div className={`absolute inset-0 bg-black transition-opacity rounded-lg ${isSelected ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`}></div>
      
      {isSelected && (
        <div className="absolute top-3 right-3 text-white z-20">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
      )}

      {image.isPremium && (
        <div className="absolute top-3 right-3 bg-black/50 text-white py-1 px-3 rounded-full backdrop-blur-sm z-10 flex items-center gap-1.5">
            <LockIcon className="w-4 h-4" />
            <span className="font-bold text-xs tracking-wider">PRO</span>
        </div>
      )}

       <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity`}>
         <p className="text-white text-sm font-semibold tracking-wide line-clamp-2">{image.name}</p>
      </div>
    </div>
  );
};

export const ImageGrid: React.FC<ImageGridProps> = ({ images, selectedImages, onImageSelect, onDownload, isSubscribed }) => {
  const freeSelectionCount = images.filter(img => selectedImages.includes(img.id) && !img.isPremium).length;
  const proSelectionCount = images.filter(img => selectedImages.includes(img.id) && img.isPremium).length;
  
  return (
    <section className="py-16">
      <div className="text-center">
        <h2 className="font-serif text-5xl md:text-6xl font-medium tracking-tighter">Your AI Portraits</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {isSubscribed 
            ? 'Select any images to download.' 
            : 'Select up to 3 free images to download or upgrade to get them all.'
          }
        </p>
        
        <div className="mt-8">
            <button 
              onClick={onDownload}
              disabled={selectedImages.length === 0}
              className="mb-8 inline-flex items-center bg-gray-900 text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download {selectedImages.length > 0 ? `${selectedImages.length} Selected` : 'Selection'}
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map(image => (
            <ImageCard 
              key={image.id}
              image={image}
              isSelected={selectedImages.includes(image.id)}
              onSelect={onImageSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
};