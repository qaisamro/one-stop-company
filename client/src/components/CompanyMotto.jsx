import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = '${process.env.REACT_APP_API_URL}/api';

const CompanyMotto = () => {
    const { t, i18n } = useTranslation();
    const [mottoList, setMottoList] = useState([]); // Renamed for clarity
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMottoIndex, setCurrentMottoIndex] = useState(0); // Renamed for clarity

    const { isArabic, textAlignmentClass } = useMemo(() => {
        const arabic = i18n.language === 'ar';
        return {
            isArabic: arabic,
            textAlignmentClass: arabic ? 'text-right' : 'text-left',
        };
    }, [i18n.language]);

    const fetchCompanyMottos = useCallback(async () => { // Renamed for clarity
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/company-intro?lang=${i18n.language}`);
            // Assuming 'description' from API contains the mottos/phrases
            setMottoList(Array.isArray(response.data.description) ? response.data.description : []);
            setCurrentMottoIndex(0); // Reset index on new data
        } catch (err) {
            console.error('Failed to fetch company mottos:', err);
            setError(t('failed_to_load_company_mottos', 'Failed to load company mottos.'));
        } finally {
            setLoading(false);
        }
    }, [i18n.language, t]);

    useEffect(() => {
        fetchCompanyMottos();
    }, [fetchCompanyMottos]);

    // Cycle through mottos
    useEffect(() => {
        if (mottoList.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentMottoIndex((prevIndex) =>
                prevIndex === mottoList.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [mottoList.length]);

    // Animation variants for the motto text
    const mottoVariants = {
        initial: {
            opacity: 0,
            y: isArabic ? -15 : 15, // Slightly less vertical movement
            scale: 0.99,
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.8, // Slightly longer duration for smoother entry
                ease: [0.2, 0.8, 0.2, 1],
            },
        },
        exit: {
            opacity: 0,
            y: isArabic ? 15 : -15,
            scale: 0.99,
            transition: {
                duration: 0.5, // Slightly longer duration for smoother exit
                ease: [0.6, -0.05, 0.01, 0.99],
            },
        },
    };

    // Placeholder text if no mottos are fetched
    const defaultMotto = t(
        'default_company_motto',
        'Building Excellence, Delivering Trust.'
    );

    return (
        <div
            className={`relative w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8 
                        bg-gradient-to-r from-[#003366] via-[#218A7A] to-[#FFDD33] 
                        text-white overflow-hidden flex items-center justify-center 
                        text-center shadow-lg transform translate-y-0.5 z-20`} // Added shadow and slight translateY for separation
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-textile.png")' }}></div> {/* Subtle texture */}
            <div className="absolute inset-0 z-0 bg-black/30"></div> {/* Subtle dark overlay */}

            <div className="relative z-10 max-w-5xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center gap-4 text-white text-base sm:text-lg animate-pulse">
                        <svg
                            className="animate-spin w-6 h-6 text-white"
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
                        <p>{t('loading_motto', 'Loading inspiring thoughts...')}</p>
                    </div>
                ) : error ? (
                    <p className="text-red-200 bg-black/40 p-3 rounded-md text-sm sm:text-base shadow-inner animate-shake backdrop-blur-sm">
                        {error}
                    </p>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentMottoIndex} // Key is crucial for AnimatePresence to detect changes
                            variants={mottoVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={`text-white text-xl xs:text-2xl sm:text-3xl md:text-4xl 
                                       font-extrabold tracking-tight 
                                       ${textAlignmentClass}`}
                            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }} // Add text shadow for pop
                        >
                            {mottoList.length > 0
                                ? mottoList[currentMottoIndex]
                                : defaultMotto}
                        </motion.p>
                    </AnimatePresence>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                    20%, 40%, 60%, 80% { transform: translateX(3px); }
                }
                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

export default CompanyMotto;