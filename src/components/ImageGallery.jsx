import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Trash2 } from 'lucide-react';

export default function ImageGallery({ images = [], editable = false, onRemoveImage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const defaultImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
  const activeImage = images.length > 0 ? images[activeIndex] : defaultImage;

  const nextImage = (e) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Primary Gallery Container */}
      <div
        style={{
          position: 'relative',
          height: '350px',
          width: '100%',
          backgroundColor: '#000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={activeImage}
          alt="Room listing photo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'zoom-in'
          }}
          onClick={toggleFullscreen}
        />

        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 20
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 20
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Action Badges */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 30 }}>
          <button
            onClick={toggleFullscreen}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Maximize2 size={16} />
          </button>
          {editable && images.length > 0 && onRemoveImage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(activeIndex);
                setActiveIndex(0);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.8)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Counter */}
        {images.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 500,
              zIndex: 30
            }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Row */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-sm)',
                border: idx === activeIndex ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '24px'
          }}
        >
          {/* Top Panel */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              gap: '12px',
              zIndex: 100
            }}
          >
            <button
              onClick={toggleZoom}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isZoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>
          </div>

          {/* Zoomable Image Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto'
            }}
          >
            <img
              src={activeImage}
              alt=""
              style={{
                maxWidth: isZoomed ? 'none' : '90%',
                maxHeight: isZoomed ? 'none' : '90%',
                transform: isZoomed ? 'scale(1.8)' : 'none',
                transition: 'transform 0.2s ease',
                objectFit: 'contain',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in'
              }}
              onClick={toggleZoom}
            />
          </div>

          {/* Footer controls inside Fullscreen */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={prevImage}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>
                {activeIndex + 1} / {images.length}
              </span>
              <button
                onClick={nextImage}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
