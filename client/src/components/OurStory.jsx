import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const OurStory = () => {
    const { i18n, t } = useTranslation();
    const [story, setStory] = useState({ id: null, title: '', content: '', image_url: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // تعريف الألوان كمتغيرات لتسهيل الوصول إليها والتعديل عليها
    const darkBlueIT = '#003366'; // أزرق غامق IT
    const turquoiseIT = '#218A7A'; // تركواز IT
    const yellowIT = '#FFDD33';   // أصفر IT

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios
            .get(`https://one-stop-company-1.onrender.com/api/story?lang=${i18n.language}`)
            .then((res) => {
                const fetchedStory = res.data || { id: null, title: '', content: '', image_url: null };
                setStory(fetchedStory);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch story:', err);
                setError(t('failed_to_load_story', 'Failed to load story.'));
                setLoading(false);
            });
    }, [i18n.language, t]);

    const textAlignmentClass = i18n.language === 'ar' ? 'text-right' : 'text-left';

    if (loading) {
        return (
            <section className="relative w-full min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4" style={{ color: darkBlueIT }}>
                    <svg
                        className="animate-spin w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        style={{ color: yellowIT }}
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
                    <p className="text-xl font-semibold">{t('loading_story', 'Loading story...')}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative w-full min-h-screen bg-red-100 flex items-center justify-center">
                <p className="text-red-700 text-xl font-semibold p-6 rounded-lg text-center bg-red-200 shadow-md">
                    {error}
                </p>
            </section>
        );
    }

    const defaultStory = {
        title: t('our_history_title', 'Our History'),
        content: t(
            'our_history_content',
            'Existing operational change management enable of refresh as established. Promotion. Taking seamless drummer, realising clients in remodelling the long fall, prior year, eye on the field while performing a deep dive the start-up mentality to deliver convergence on cross-'
        ),
        image_url: null,
    };

    const displayStory = story.id ? story : defaultStory;
    const fullImageUrl = displayStory.image_url;

    return (
        <section 
            className="relative w-full min-h-screen flex items-center justify-center bg-white overflow-hidden"
            style={{ backgroundColor: '#f8fafc' }}
        >
            <div className="relative w-full max-w-7xl flex flex-col md:flex-row min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                {/* Left Section: Text Content */}
                <div
                    className={`w-full md:w-1/2 lg:w-3/5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center rounded-3xl ${textAlignmentClass}`}
                    style={{ 
                        backgroundColor: 'white',
                        boxShadow: '0 10px 30px rgba(0, 51, 102, 0.1)'
                    }}
                >
                    <div className="mb-6">
                        <div 
                            className="w-16 h-1 rounded-full mb-4"
                            style={{ backgroundColor: yellowIT }}
                        ></div>
                        <h2 
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif"
                            style={{ color: darkBlueIT }}
                        >
                            {displayStory.title}
                        </h2>
                    </div>
                    
                    <p className="text-gray-700 text-lg lg:text-xl leading-relaxed mb-8">
                        {displayStory.content}
                    </p>
                    
                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center">
                           
                            
                        </div>
                        <div className="flex items-center">
                           
                        </div>
                    </div>
                </div>

                {/* Right Section: Image */}
                <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center relative p-6 md:p-8 lg:p-10">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {fullImageUrl ? (
                            <div 
                                className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden"
                                style={{ 
                                    border: `12px solid ${turquoiseIT}`,
                                    boxShadow: '0 15px 40px rgba(33, 138, 122, 0.3)'
                                }}
                            >
                                <div 
                                    className="absolute inset-0 z-0 rounded-xl"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${turquoiseIT} 0%, ${darkBlueIT} 100%)`
                                    }}
                                ></div>
                                <img
                                    src={fullImageUrl}
                                    alt={t('story_image_alt', 'Our story image')}
                                    className="relative z-10 w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div 
                                className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden flex items-center justify-center"
                                style={{ 
                                    border: `12px solid ${turquoiseIT}`,
                                    boxShadow: '0 15px 40px rgba(33, 138, 122, 0.3)',
                                    background: `linear-gradient(135deg, ${turquoiseIT} 0%, ${darkBlueIT} 100%)`
                                }}
                            >
                                <div className="text-center p-6 z-10">
                                    <div className="mb-4 flex justify-center">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-white text-lg font-medium">
                                        {t('no_image_available', 'No image available')}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Decorative elements */}
                        <div 
                            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 z-0"
                            style={{ backgroundColor: yellowIT }}
                        ></div>
                        <div 
                            className="absolute -top-6 -left-6 w-16 h-16 rounded-full opacity-30 z-0"
                            style={{ backgroundColor: turquoiseIT }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurStory;