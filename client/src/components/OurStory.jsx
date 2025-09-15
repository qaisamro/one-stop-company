import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const OurStory = () => {
    const { i18n, t } = useTranslation();
    const [story, setStory] = useState({ id: null, title: '', content: '', image_url: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // تعريف الألوان كمتغيرات
    const darkBlueIT = '#003366';
    const turquoiseIT = '#218A7A';
    const yellowIT = '#FFDD33';
    const lightBlueIT = '#e6f0ff';
    const gradientBackground = `linear-gradient(135deg, ${lightBlueIT} 0%, #ffffff 100%)`;

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios
            .get(`http://one-stop.ps/api/story?lang=${i18n.language}`)
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
            <section className="relative w-full min-h-screen flex items-center justify-center" style={{ background: gradientBackground }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-t-transparent" style={{ borderColor: darkBlueIT, animation: 'spin 1s linear infinite' }}></div>
                        <div className="absolute inset-2 rounded-full border-4 border-b-transparent" style={{ borderColor: turquoiseIT, animation: 'spin 1.5s linear infinite reverse' }}></div>
                    </div>
                    <p className="text-xl font-semibold" style={{ color: darkBlueIT }}>{t('loading_story', 'Loading story...')}</p>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative w-full min-h-screen flex items-center justify-center" style={{ background: gradientBackground }}>
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-600 text-xl font-semibold">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-6 px-6 py-2 rounded-full text-white font-medium transition-all duration-300 hover:shadow-lg"
                        style={{ backgroundColor: darkBlueIT }}
                    >
                        {t('try_again', 'Try Again')}
                    </button>
                </div>
            </section>
        );
    }

    const defaultStory = {
        title: t('our_history_title', 'Our History'),
        content: t(
            'our_history_content',
            'Existing operational change management enable of refresh as established. Promotion. Taking seamless drummer, realising clients in remodelling the long fall, prior year, eye on the field while performing a deep dive the start-up mentality to deliver convergence on cross- platform integration. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution. User generated content in real-time will have multiple touchpoints for offshoring. Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide with additional clickthroughs from DevOps. Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line. Podcasting operational change management inside of workflows to establish a framework. Taking seamless key performance indicators offline to maximise the long tail. Keeping your eye on the ball while performing a deep dive on the start-up mentality to derive convergence on cross-platform integration.'
        ),
        image_url: null,
    };

    const displayStory = story.id ? story : defaultStory;
    const fullImageUrl = displayStory.image_url;

    return (
        <section 
            className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-12"
            style={{ background: gradientBackground }}
        >
            {/* عناصر زخرفية خلفية */}
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: turquoiseIT, filter: 'blur(50px)', transform: 'translate(-30%, -30%)' }}></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: yellowIT, filter: 'blur(50px)', transform: 'translate(30%, 30%)' }}></div>
            
            <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 xl:gap-12 px-4 sm:px-6 lg:px-8">
                {/* Left Section: Text Content */}
                <div
                    className={`w-full lg:w-2/5 xl:w-2/5 p-8 sm:p-10 flex flex-col justify-center rounded-3xl ${textAlignmentClass} backdrop-blur-sm bg-white/90 shadow-2xl`}
                    style={{ 
                        border: `1px solid rgba(255, 255, 255, 0.5)`,
                        boxShadow: `0 25px 50px -12px rgba(0, 51, 102, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)`
                    }}
                >
                    <div className="mb-8">
                        <div 
                            className="w-20 h-1.5 rounded-full mb-6 transition-all duration-500 hover:w-24"
                            style={{ backgroundColor: yellowIT }}
                        ></div>
                        <h2 
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8"
                            style={{ 
                                color: darkBlueIT,
                                fontFamily: "'Playfair Display', serif",
                                lineHeight: '1.2'
                            }}
                        >
                            {displayStory.title}
                        </h2>
                    </div>
                    
                    <div className="overflow-y-auto max-h-96 pr-4 custom-scrollbar">
                        <p 
                            className="text-gray-700 text-lg lg:text-xl leading-relaxed mb-8"
                            style={{ lineHeight: '1.8' }}
                        >
                            {displayStory.content}
                        </p>
                    </div>
                    
                    {/* <div className="mt-8 flex flex-wrap gap-4">
                        <button 
                            className="px-8 py-3 rounded-full text-white font-medium transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                            style={{ backgroundColor: turquoiseIT }}
                        >
                            {t('read_more', 'Read More')}
                        </button>
                        <button 
                            className="px-8 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg border hover:translate-y-[-2px]"
                            style={{ 
                                borderColor: darkBlueIT,
                                color: darkBlueIT,
                                backgroundColor: 'transparent'
                            }}
                        >
                            {t('contact_us', 'Contact Us')}
                        </button>
                    </div> */}
                </div>

                {/* Right Section: Image */}
                <div className="w-full lg:w-3/5 xl:w-3/5 flex items-center justify-center relative">
                    <div className="relative w-full max-w-2xl flex items-center justify-center">
                        {fullImageUrl ? (
                            <div className="relative group">
                                <div 
                                    className="absolute inset-0 rounded-3xl transform group-hover:rotate-3 transition-transform duration-700"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${turquoiseIT} 0%, ${darkBlueIT} 100%)`,
                                        opacity: 0.8
                                    }}
                                ></div>
                                <div 
                                    className="absolute inset-4 rounded-2xl transform group-hover:-rotate-2 transition-transform duration-700"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${yellowIT} 0%, ${turquoiseIT} 100%)`,
                                        opacity: 0.4
                                    }}
                                ></div>
                                <div 
                                    className="relative rounded-2xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-700"
                                    style={{ 
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        border: `2px solid rgba(255, 255, 255, 0.3)`
                                    }}
                                >
                                    <div 
                                        className="absolute inset-0 z-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${turquoiseIT}20 0%, ${darkBlueIT}20 100%)`
                                        }}
                                    ></div>
                                    <img
                                        src={fullImageUrl}
                                        alt={t('story_image_alt', 'Our story image')}
                                        className={`relative z-10 w-full h-auto object-cover transition-all duration-700 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                        onLoad={() => setIsImageLoaded(true)}
                                        style={{
                                            maxHeight: '75vh',
                                            minHeight: '500px'
                                        }}
                                    />
                                    {!isImageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div 
                                className="relative w-full max-w-2xl aspect-[3/4] rounded-2xl overflow-hidden flex items-center justify-center group"
                                style={{ 
                                    boxShadow: '0 25px 50px -12px rgba(33, 138, 122, 0.3)',
                                    border: `2px solid rgba(255, 255, 255, 0.3)`
                                }}
                            >
                                <div 
                                    className="absolute inset-0 z-0 rounded-xl transform group-hover:scale-110 transition-transform duration-700"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${turquoiseIT} 0%, ${darkBlueIT} 100%)`
                                    }}
                                ></div>
                                <div className="text-center p-6 z-10">
                                    <div className="mb-6 flex justify-center">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-white text-xl font-medium">
                                        {t('no_image_available', 'No image available')}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Decorative elements */}
                        <div 
                            className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 z-0 transform hover:scale-125 transition-transform duration-300"
                            style={{ backgroundColor: yellowIT }}
                        ></div>
                        <div 
                            className="absolute -top-6 -left-6 w-20 h-20 rounded-full opacity-30 z-0 transform hover:scale-125 transition-transform duration-300"
                            style={{ backgroundColor: turquoiseIT }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* أنماط CSS مخصصة */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 51, 102, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${turquoiseIT};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${darkBlueIT};
                }
                
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </section>
    );
};

export default OurStory;