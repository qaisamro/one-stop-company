// src/pages/GalleryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Gallery from '../components/Gallery';
import { FaSpinner } from 'react-icons/fa';

const GalleryPage = () => {
    const { t } = useTranslation();
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get('https://one-stop.ps/api/gallery');

                if (Array.isArray(response.data.images)) {
                    setImages(response.data.images);
                } else {
                    console.error('API response is not an array:', response.data);
                    setError('Received invalid data from server.');
                }
            } catch (err) {
                console.error('Failed to fetch gallery images:', err);
                setError('Failed to load images. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <section className="pt-48 md:pt-64 p-4 md:p-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-[#3C4196] dark:text-[#F4EB27] text-center mb-12 animate-fade-in-up">
                    {t('gallery.page_title')}
                </h1>

                <div className="max-w-7xl mx-auto">
                    {isLoading && (
                        <div className="flex flex-col justify-center items-center min-h-[50vh]">
                            <FaSpinner className="animate-spin text-5xl text-blue-600 dark:text-blue-400" />
                            <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">
                                {t('common.loading')}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center items-center min-h-[50vh] p-8">
                            <div className="text-center">
                                <p className="text-red-500 text-lg mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {t('common.retry')}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {!isLoading && !error && images.length > 0 && <Gallery images={images} />}
                    
                    {!isLoading && !error && images.length === 0 && (
                        <div className="text-center p-8">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                {t('gallery.no_images')}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default GalleryPage;