import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://one-stop.ps/api';

const CompanyIntro = () => {
    const { t, i18n } = useTranslation();
    const sliderRef = useRef(null);
    const [intro, setIntro] = useState({ title: '', description: [], images: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);

    const { isArabic, textAlignmentClass } = useMemo(() => {
        const arabic = i18n.language === 'ar';
        return {
            isArabic: arabic,
            textAlignmentClass: arabic ? 'text-right' : 'text-left',
        };
    }, [i18n.language]);

    const fetchCompanyIntro = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/company-intro?lang=${i18n.language}`);
            setIntro({
                title: response.data.title || '',
                description: Array.isArray(response.data.description) ? response.data.description : [],
                images: Array.isArray(response.data.images) ? response.data.images : [],
            });
            setCurrentDescriptionIndex(0);
        } catch (err) {
            console.error('Failed to fetch company introduction:', err);
            setError(t('failed_to_load_company_intro', 'Failed to load company introduction.'));
        } finally {
            setLoading(false);
        }
    }, [i18n.language, t]);

    useEffect(() => {
        fetchCompanyIntro();
    }, [fetchCompanyIntro]);

    useEffect(() => {
        if (intro.description.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentDescriptionIndex((prevIndex) =>
                prevIndex === intro.description.length - 1 ? 0 : prevIndex + 1
            );
        }, 8000);

        return () => clearInterval(interval);
    }, [intro.description.length]);

    const sliderSettings = useMemo(
        () => ({
            dots: true,
            infinite: true,
            speed: 1000,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 8000,
            arrows: false,
            pauseOnHover: false,
            fade: true,
            cssEase: 'ease-in-out',
            appendDots: (dots) => (
                <div style={{ bottom: '40px', position: 'absolute', width: '100%', textAlign: 'center' }}>
                    <ul style={{ margin: '0', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        {dots}
                    </ul>
                </div>
            ),
            customPaging: (i) => (
                <div
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                    }}
                    className="slick-dot-custom"
                    aria-label={t('go_to_slide', { slideNumber: i + 1 })}
                ></div>
            ),
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        dots: false,
                    },
                },
                {
                    breakpoint: 475,
                    settings: {
                        dots: false,
                    },
                },
            ],
        }),
        [t]
    );

    const sliderCustomCss = useMemo(
        () => `
    .slick-dots {
        position: absolute;
        bottom: 40px !important;
        width: 100%;
        text-align: center;
    }
    .slick-dots li button:before {
        font-size: 0;
        width: 12px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        opacity: 0.5;
        transition: all 0.3s ease;
        content: '';
    }
    .slick-dots li.slick-active button:before {
        opacity: 1;
        background-color: #FFDD33;
        border-color: #FFDD33;
    }
    `,
        []
    );

    const defaultPlaceholderImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=80';

    const descriptionVariants = {
        initial: {
            opacity: 0,
            y: isArabic ? -20 : 20,
            scale: 0.98,
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.2, 0.8, 0.2, 1],
            },
        },
        exit: {
            opacity: 0,
            y: isArabic ? 20 : -20,
            scale: 0.98,
            transition: {
                duration: 0.4,
                ease: [0.6, -0.05, 0.01, 0.99],
            },
        },
    };

    return (
        <section
            id="company-intro"
            className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#003366]"
            tabIndex={0}
            aria-label={t('company_introduction_section', 'Company Introduction Section')}
        >
            {/* Dynamic Background: Image Slider or Placeholder */}
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#003366]/80 z-10 animate-pulse">
                    <div className="flex flex-col items-center gap-4 text-white">
                        <svg
                            className="animate-spin w-10 h-10 text-[#FFDD33]"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                        <p className="text-xl font-semibold">{t('loading_images', 'Loading images...')}</p>
                    </div>
                </div>
            ) : error && !intro.images.length ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 z-10 animate-fade-in">
                    <p className="text-white text-xl font-semibold bg-[#003366]/50 p-6 rounded-lg text-center">
                        {t('image_load_error', 'Failed to load images. Please try again.')}
                    </p>
                </div>
            ) : intro.images && intro.images.length > 0 ? (
                <div className="absolute inset-0 z-0">
                    <Slider ref={sliderRef} {...sliderSettings}>
                        {intro.images.map((image, index) => (
                            <div key={image || index} className="w-full h-screen">
                                {/* هنا، image ستكون المسار الكامل والصحيح القادم من Laravel */}
                                <img
                                    src={image} // استخدام `image` مباشرة بدون أي تعديل
                                    alt={`Company Image ${index + 1}`}
                                    className="w-full h-full object-cover animate-image-fade"
                                          loading="lazy"

                                />
                            </div>
                        ))}
                    </Slider>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[5px] z-10"></div>
                    <style dangerouslySetInnerHTML={{ __html: sliderCustomCss }} />
                </div>
            ) : (
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${defaultPlaceholderImage})` }}
                    aria-label={t('default_background_image', 'Default background image')}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[5px] z-10"></div>
                </div>
            )}

            {/* Content Area */}
            <div
                className={`absolute inset-0 z-20 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 ${textAlignmentClass}`}
            >
                <div
                    className={`max-w-4xl mx-auto text-center transform transition-all duration-500 ease-out relative`}
                    style={{ paddingBottom: '2rem' }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                        {intro.title || t('company_intro_title', 'QUALITY CONSTRUCTION. HONEST SERVICE. GREAT VALUE.')}
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center gap-4 text-white text-lg sm:text-xl mb-6 sm:mb-8 animate-pulse">
                            <svg
                                className="animate-spin w-7 h-7 text-[#FFDD33]"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                            <p>{t('loading_company_intro', 'Loading company introduction...')}</p>
                        </div>
                    ) : error ? (
                        <p className="text-red-400 bg-[#003366]/60 p-4 rounded-lg mb-6 text-base sm:text-lg shadow-inner animate-shake backdrop-blur-sm">
                            {error}
                        </p>
                    ) : (
                        <AnimatePresence mode="wait">
                            {intro.description.length > 0 ? (
                                <motion.p
                                    key={currentDescriptionIndex}
                                    variants={descriptionVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={`text-white text-base xs:text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 sm:mb-8 font-semibold ${textAlignmentClass} bg-[#003366]/60 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 backdrop-blur-sm`}
                                    aria-live="polite"
                                >
                                    {intro.description[currentDescriptionIndex]}
                                </motion.p>
                            ) : (
                                <motion.p
                                    key="no-description"
                                    variants={descriptionVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className={`text-white text-base xs:text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 sm:mb-8 font-semibold ${textAlignmentClass} bg-[#003366]/60 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 backdrop-blur-sm`}
                                    aria-live="polite"
                                >
                                    {t('no_company_description', 'Our diverse portfolio represents decades of construction experience backed by a passion for quality, outstanding client service and the latest industry.')}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    )}

                    <div className="flex flex-col xs:flex-row justify-center gap-4 mt-8">
                        <a
                            href="#services"
                            className={`inline-flex items-center justify-center bg-[#FFDD33] text-[#003366] px-8 py-3 rounded-full text-base font-bold
                                            hover:bg-[#218A7A] hover:text-white transition-all duration-300 ease-in-out
                                            shadow-lg hover:shadow-xl z-30
                                            w-full xs:w-auto sm:px-10 sm:py-4 sm:text-lg`}
                            aria-label={t('our_services_button', 'Our Services')}
                        >
                            {t('our_services', 'OUR SERVICES')}
                            <svg
                                className={`w-5 h-5 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </a>
                        <a
                            href="#about"
                            className={`inline-flex items-center justify-center bg-white text-[#003366] px-8 py-3 rounded-full text-base font-bold
                                            hover:bg-[#218A7A] hover:text-white transition-all duration-300 ease-in-out
                                            shadow-lg hover:shadow-xl z-30
                                            w-full xs:w-auto sm:px-10 sm:py-4 sm:text-lg`}
                            aria-label={t('about_us_button', 'About Us')}
                        >
                            {t('about_us', 'ABOUT US')}
                            <svg
                                className={`w-5 h-5 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                .animate-image-fade { animation: fadeIn 1.5s ease-out forwards; }
            `}</style>
        </section>
    );
};

export default CompanyIntro;