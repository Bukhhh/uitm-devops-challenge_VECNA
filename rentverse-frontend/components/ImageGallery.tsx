import Image from 'next/image'
import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
}

function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Ensure we have at least one image
  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto h-96 bg-slate-200 rounded-lg flex items-center justify-center">
        <span className="text-slate-500">No images available</span>
      </div>
    )
  }

  // Take only the first 5 images and pad with the first image if needed
  const displayImages = [...images.slice(0, 5)]
  while (displayImages.length < 5) {
    displayImages.push(images[0])
  }

  const [mainImage, ...gridImages] = displayImages

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Main image carousel */}
      <div className="relative h-96 mb-4 rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex]}
          alt={`Property image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
        
        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnail grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                index === currentIndex ? 'ring-2 ring-teal-500' : 'hover:opacity-80'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
