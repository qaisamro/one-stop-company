import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BlogDetailPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the image modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');
    const [modalImageAlt, setModalImageAlt] = useState('');

    const isArabic = i18n.language === 'ar';
    const directionClass = isArabic ? 'rtl' : 'ltr';
    const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

    useEffect(() => {
        setLoading(true);
        setError(null);

        axios
            .get(`http://localhost:5000/api/blogs/${id}?lang=${i18n.language}`)
            .then((res) => {
                setBlog(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load blog details:', err);
                setError(t('error_loading_content') || 'Failed to load blog');
                setLoading(false);
            });
    }, [id, i18n.language, t]);

    // Function to open the image modal
    const openModal = (src, alt) => {
        setModalImageSrc(src);
        setModalImageAlt(alt);
        setIsModalOpen(true);
    };

    // Function to close the image modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageSrc('');
        setModalImageAlt('');
    };

    if (loading) {
        return (
            <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20 animate-pulse">
                <div className="flex items-center justify-center gap-4 text-white text-xl">
                    <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p>{t('loading') || 'Loading...'}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20">
                <p className="text-it-yellow text-center text-xl py-6 px-10 bg-it-dark-blue/80 rounded-2xl shadow-xl border border-it-yellow">
                    {error}
                </p>
            </section>
        );
    }

    if (!blog || (Array.isArray(blog) && blog.length === 0)) {
        return (
            <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20">
                <p className="text-gray-400 text-center text-xl py-6 px-10 bg-it-dark-blue/80 rounded-2xl shadow-xl">
                    {t('no_blog_content_available') || 'No blog content available for this section in the current language.'}
                </p>
            </section>
        );
    }

    const actualBlog = Array.isArray(blog) ? blog[0] : blog;
    if (!actualBlog) {
        return (
            <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20">
                <p className="text-gray-400 text-center text-xl py-6 px-10 bg-it-dark-blue/80 rounded-2xl shadow-xl">
                    {t('no_blog_content_available') || 'No blog content available for this section in the current language.'}
                </p>
            </section>
        );
    }

    return (
        <section
            className={`relative min-h-screen pt-32 md:pt-40 pb-16 overflow-hidden ${directionClass}`}
            style={{
                background: `linear-gradient(to bottom, #003366 0%, #003366 50%, #218A7A 100%)`,
            }}
        >
            {/* Background pattern - subtle and modern */}
            <div
                className="absolute inset-0 opacity-10 z-0"
                style={{
                    backgroundImage: `url('/assets/images/pattern-light.png')`, // Ensure this path is correct
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            ></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl relative z-10">
                {/* Back to blogs link - prominent and clear */}
                <div className={`mb-8 ${textAlignmentClass}`}>
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 text-it-yellow hover:text-white transition-colors duration-300 group"
                    >
                        {isArabic ? (
                            <svg className="h-5 w-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        )}
                        <span className="text-lg font-medium group-hover:underline">
                            {t('back_to_blogs') || 'Back to Blogs'}
                        </span>
                    </Link>
                </div>

                {/* Main Title - Increased font size and margin */}
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter text-it-yellow mb-10 ${textAlignmentClass}`}>
                    {actualBlog.title}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Left Column - Image with refined styling and hover effect */}
                    {actualBlog.image && (
                        <div
                            className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.01] border-2 border-it-yellow/50 group cursor-pointer"
                            onClick={() => openModal(actualBlog.image, actualBlog.title)}
                        >
                            <img
                                src={actualBlog.image}
                                alt={actualBlog.title}
                                className="w-full h-[350px] md:h-[550px] lg:h-[650px] object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Subtle overlay for design depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            {/* Eye icon overlay on hover */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white transform group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                    {/* Right Column - Content with refined styling */}
                    <div className={`flex flex-col ${isArabic ? 'items-end' : 'items-start'}`}>
                        <div className={`space-y-8 ${textAlignmentClass} text-white`}>
                            {/* Meta Info: Author, Category, Date - all visible and formatted */}
                            <p className="text-gray-300 text-base font-light">
                                {actualBlog.author || t('admin_default') || 'Admin'} • {actualBlog.category || t('category_default') || 'N/A'} • {new Date(actualBlog.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            {/* Description - displaying description directly */}
                            <p className="text-white text-xl leading-relaxed font-light">
                                {actualBlog.description}
                            </p>
                            {/* Main Content - displaying content directly with prose styling */}
                            <div
                                className={`prose prose-lg prose-invert max-w-none ${textAlignmentClass} text-gray-100`}
                                dangerouslySetInnerHTML={{ __html: actualBlog.content }}
                            />

                            {/* Additional Images - refined layout, hover effects, and click to open modal */}
                            {actualBlog.additional_images && Array.isArray(actualBlog.additional_images) && actualBlog.additional_images.length > 0 && (
                                <div className="mt-12">
                                    <h2 className={`text-3xl font-bold mb-6 text-it-yellow ${textAlignmentClass}`}>
                                        {t('additional_images') || 'Additional Images'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {actualBlog.additional_images.map((image, index) => (
                                            <div
                                                key={index}
                                                className="relative rounded-xl overflow-hidden shadow-lg border border-it-dark-blue transform transition-transform duration-300 hover:scale-[1.02] group cursor-pointer"
                                                onClick={() => openModal(image, `${t('additional_image')} ${index + 1}`)}
                                            >
                                                <img
                                                    src={image} // Assuming these are full paths
                                                    alt={`${t('additional_image')} ${index + 1}`}
                                                    className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                {/* Eye icon overlay on hover */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white transform group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn"
                    onClick={closeModal} // Close modal when clicking outside the image
                >
                    <div
                        className="relative max-w-full max-h-full overflow-hidden rounded-lg shadow-2xl animate-zoomIn"
                        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking on the image
                    >
                        <img
                            src={modalImageSrc}
                            alt={modalImageAlt}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white hover:text-it-yellow transition-colors duration-200 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-it-yellow"
                            aria-label={t('close_modal') || 'Close image modal'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default BlogDetailPage;