// src/components/Gallery.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Masonry from 'react-masonry-css';
import './Gallery.css'; // Make sure this file exists for Masonry effects

const Gallery = ({ images }) => {
    const { t } = useTranslation();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const lightboxRef = useRef(null);

    const openLightbox = useCallback((index) => {
        setSelectedIndex(index);
        setLightboxOpen(true);
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
        setSelectedIndex(null);
        // Restore scrolling
        document.body.style.overflow = 'unset';
    }, []);

    const navigateLightbox = useCallback((direction) => {
        let newIndex = selectedIndex + direction;
        if (newIndex < 0) {
            newIndex = images.length - 1;
        } else if (newIndex >= images.length) {
            newIndex = 0;
        }
        setSelectedIndex(newIndex);
    }, [selectedIndex, images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                navigateLightbox(1);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [lightboxOpen, closeLightbox, navigateLightbox]);

    // Close lightbox on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (lightboxRef.current && !lightboxRef.current.contains(e.target)) {
                closeLightbox();
            }
        };

        if (lightboxOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [lightboxOpen, closeLightbox]);

    if (!images || images.length === 0) {
        return (
            <p className="text-center text-gray-500 dark:text-gray-400 text-lg p-8">
                {t('gallery.no_images')}
            </p>
        );
    }

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    return (
        <>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className="my-masonry-item p-2"
                        onClick={() => openLightbox(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                openLightbox(index);
                            }
                        }}
                    >
                        <div className="relative overflow-hidden rounded-xl shadow-xl group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
                            <img
                                src={image.path}
                                alt={t('gallery.image_alt', { index: index + 1 })}
                                className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </div>
                    </div>
                ))}
            </Masonry>

            {lightboxOpen && selectedIndex !== null && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm animate-fade-in"
                >
                    <div
                        ref={lightboxRef}
                        className="relative w-full max-w-5xl max-h-full overflow-hidden flex flex-col items-center justify-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-50 focus:outline-none"
                            aria-label={t('gallery.close_lightbox')}
                        >
                            <FaTimes />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                            className="absolute left-4 text-white text-3xl hover:text-gray-300 transition-colors z-50 focus:outline-none"
                            aria-label={t('gallery.previous_image')}
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                            className="absolute right-4 text-white text-3xl hover:text-gray-300 transition-colors z-50 focus:outline-none"
                            aria-label={t('gallery.next_image')}
                        >
                            <FaChevronRight />
                        </button>

                        {/* Large Image */}
                        <img
                            src={images[selectedIndex].path}
                            alt={t('gallery.selected_image_alt')}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-500 transform scale-95 animate-zoom-in"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;