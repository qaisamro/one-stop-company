import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api/axiosConfig';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
// No longer need date-fns for this specific component, removed import
// import { format } from 'date-fns';
// import { ar, enUS } from 'date-fns/locale';

const BASE_URL = 'https://one-stop.ps';
// const BASE_URL = 'http://127.0.0.1:8000';

const CsrDetailPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const [csrContent, setCsrContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [lightboxIsOpen, setLightboxIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [images, setImages] = useState([]);

    const isArabic = i18n.language === 'ar';
    const directionClass = isArabic ? 'rtl' : 'ltr';
    const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

    // Removed unused backToCsrText object as it's directly used within the component.

    useEffect(() => {
        const fetchCsrDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axiosInstance.get(`/api/csr/${id}`);
                const fetchedData = res.data;
                const combinedImages = [];

                // Ensure fetchedData is not null or undefined before accessing properties
                if (fetchedData) {
                    if (fetchedData.image) {
                        combinedImages.push(`${BASE_URL}${fetchedData.image}`);
                    }
                    if (Array.isArray(fetchedData.additional_images)) {
                        fetchedData.additional_images.forEach(img => {
                            // Ensure img is a string and not empty before pushing
                            if (typeof img === 'string' && img.trim()) {
                                combinedImages.push(`${BASE_URL}${img}`);
                            }
                        });
                    }
                    setCsrContent(fetchedData);
                    setImages(combinedImages);
                } else {
                    // Handle case where API returns empty data for a valid ID
                    setError(t('error_no_content_found', 'No content found for this item.'));
                }
            } catch (err) {
                console.error('Failed to load CSR details:', err.response ? err.response.data : err);
                setError(t('error_loading_content', 'Failed to load content.'));
            } finally {
                setLoading(false);
            }
        };

        fetchCsrDetails();
    }, [id, t]); // Added t to dependency array as it's used inside

    const openLightbox = (index) => {
        setPhotoIndex(index);
        setLightboxIsOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir={directionClass}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        {t('loading_csr', 'Loading CSR details...')}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4" dir={directionClass}>
                <div className="text-red-600 dark:text-red-400 text-center text-xl font-medium mb-4">
                    {error}
                </div>
                <Link
                    to="/csr"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 font-medium"
                >
                    {t('back_to_csr', isArabic ? 'العودة إلى المسؤولية الاجتماعية' : 'Back to CSR')}
                </Link>
            </div>
        );
    }

    if (!csrContent) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-gray-500 dark:text-gray-400 text-xl font-medium" dir={directionClass}>
                {t('no_csr_content', 'No CSR content available.')}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen" dir={directionClass}>
            <div className="container mx-auto max-w-6xl px-4 pt-32 pb-16">
                {/* Back Button */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        to="/#csr" // Assuming you want to link back to the CSR section on the homepage
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ${isArabic ? 'rotate-180' : ''} -mt-4`}
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </Link>
                    <br></br>
                    <br></br>
                    <br></br>
                </div>

                <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
                    {/* Main Image and Title Label */}
                    {images.length > 0 && (
                        <div className="relative h-72 md:h-96 w-full overflow-hidden">
                            <img
                                src={images[0]}
                                alt={isArabic ? csrContent.title_ar : csrContent.title_en}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                <div className="p-6 md:p-8 text-white">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                        {isArabic ? csrContent.title_ar : csrContent.title_en}
                                    </h1>
                                    <h2 className="text-xl md:text-2xl font-medium opacity-90">
                                        {isArabic ? csrContent.title_label_ar : csrContent.title_label_en}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6 md:p-8">
                        {/* Title and Desc Label when no hero image */}
                        {!images.length && (
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {isArabic ? csrContent.title_ar : csrContent.title_en}
                                </h1>
                                <h2 className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300">
                                    {isArabic ? csrContent.title_label_ar : csrContent.title_label_en}
                                </h2>
                            </div>
                        )}

                        {/* Summary Paragraph */}
                        {(csrContent.desc_label_ar || csrContent.desc_label_en) && (
                            <div className={`bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mb-8 ${textAlignmentClass}`}>
                                <div
                                    className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: isArabic ? csrContent.desc_label_ar : csrContent.desc_label_en }}
                                />
                            </div>
                        )}

                        {/* Main Content */}
                        {/* CORRECTED: Using csrContent.description_ar/en instead of entry.description_ar/en */}
                        <div
                            className={`prose prose-lg max-w-none dark:prose-invert
                                prose-headings:text-gray-900 dark:prose-headings:text-white
                                prose-p:text-gray-700 dark:prose-p:text-gray-300
                                prose-a:text-blue-600 dark:prose-a:text-blue-400
                                prose-img:rounded-xl prose-img:shadow-md mb-10 ${textAlignmentClass}`}
                            dangerouslySetInnerHTML={{
                                __html: isArabic ? csrContent.description_ar : csrContent.description_en
                            }}
                        />

                        {/* Gallery Section for additional images */}
                        {images.length > 1 && (
                            <div className="mt-12">
                                <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-6 ${textAlignmentClass}`}>
                                    {isArabic ? 'معرض الصور' : 'Photo Gallery'}
                                </h2>

                                {images.length <= 4 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {images.slice(1).map((image, index) => (
                                            <div
                                                key={index + 1}
                                                className="group relative overflow-hidden rounded-xl cursor-pointer transform transition-transform duration-300 hover:-translate-y-1"
                                                onClick={() => openLightbox(index + 1)}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${isArabic ? csrContent.title_ar : csrContent.title_en} ${index + 2}`}
                                                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {images.slice(1, 5).map((image, index) => (
                                            <div
                                                key={index + 1}
                                                className={`group relative overflow-hidden rounded-xl cursor-pointer ${index === 3 && images.length > 5 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                                                onClick={() => openLightbox(index + 1)}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${isArabic ? csrContent.title_ar : csrContent.title_en} ${index + 2}`}
                                                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                {index === 3 && images.length > 5 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                                        <span className="text-white text-lg font-bold">
                                                            +{images.length - 5} {isArabic ? 'المزيد' : 'More'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </article>
            </div>

            {lightboxIsOpen && (
                <Lightbox
                    mainSrc={images[photoIndex]}
                    nextSrc={images[(photoIndex + 1) % images.length]}
                    prevSrc={images[(photoIndex + images.length - 1) % images.length]}
                    onCloseRequest={() => setLightboxIsOpen(false)}
                    onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
                    onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
                    imageTitle={`${isArabic ? csrContent.title_ar : csrContent.title_en} ${photoIndex + 1}/${images.length}`}
                />
            )}
        </div>
    );
};

export default CsrDetailPage;