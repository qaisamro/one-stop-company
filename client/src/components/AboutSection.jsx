import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AboutSection = () => {
  const { t, i18n } = useTranslation();
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0); // State for carousel

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';
  // Adjust text alignment for content inside blocks based on RTL
  const blockTextAlignmentClass = isArabic ? 'text-right' : 'text-left';
  const contentStartClass = isArabic ? 'items-end' : 'items-start';


  useEffect(() => {
    setIsLoading(true);
    setError(null);

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/about?lang=${i18n.language}`)
      .then((res) => {
        setAboutData(res.data);
        setIsLoading(false);
        // Reset block index when data or language changes
        setCurrentBlockIndex(0);
      })
      .catch((err) => {
        console.error("Error fetching about content:", err);
        setError(t('error_loading_content') || 'Failed to load content.');
        setIsLoading(false);
      });
  }, [i18n.language, t]);

  // Carousel navigation functions
  const goToNextBlock = () => {
    if (aboutData && aboutData.blocks && aboutData.blocks.length > 0) {
      setCurrentBlockIndex((prevIndex) =>
        (prevIndex + 1) % aboutData.blocks.length
      );
    }
  };

  const goToPrevBlock = () => {
    if (aboutData && aboutData.blocks && aboutData.blocks.length > 0) {
      setCurrentBlockIndex((prevIndex) =>
        (prevIndex - 1 + aboutData.blocks.length) % aboutData.blocks.length
      );
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-br from-it-dark-blue to-gray-800 animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column Skeleton */}
            <div className="relative h-[500px] bg-it-dark-blue/70 rounded-3xl overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-full bg-it-dark-blue/80 flex flex-col justify-center items-center text-it-yellow font-bold p-4">
                <div className="h-10 w-16 bg-it-dark-blue/60 rounded mb-2"></div>
                <div className="h-6 w-24 bg-it-dark-blue/60 rounded"></div>
              </div>
            </div>
            {/* Right Column Skeleton */}
            <div className="p-8 space-y-6">
              <div className="h-6 w-48 bg-it-dark-blue/40 rounded"></div>
              <div className="h-12 w-3/4 bg-it-dark-blue/50 rounded"></div>
              <div className="h-24 w-full bg-it-dark-blue/40 rounded"></div>
              <div className="bg-it-dark-blue p-6 h-48 rounded-xl relative overflow-hidden">
                <div className="h-full w-full bg-it-dark-blue/80 animate-pulse"></div>
              </div>
              <div className="h-10 w-40 bg-it-dark-blue/50 rounded-full mt-8"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center">
        <p className="text-it-yellow text-center py-6 px-8 bg-it-dark-blue/80 rounded-2xl shadow-xl">
          {error}
        </p>
      </section>
    );
  }

  if (!aboutData || !aboutData.title_main) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center">
        <p className="text-gray-400 text-center text-lg">
          {t('no_about_content_available') || 'No content available for this section in the current language.'}
        </p>
      </section>
    );
  }

  const {
    title_small,
    title_main,
    description,
    image_url,
    experience_year,
    experience_text,
    blocks,
    button_text,
    button_url
  } = aboutData;

  const currentBlock = blocks && blocks.length > 0 ? blocks[currentBlockIndex] : null;

  return (
    <section
      id="about"
      className={`relative py-16 md:py-24 overflow-hidden ${directionClass}`}
      style={{
        background: `linear-gradient(to bottom, #003366 0%, #003366 50%, #218A7A 100%)`
      }}
    >
      {/* Background pattern from image_b52825.png */}
      <div
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: `url('/assets/images/pattern-light.png')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image and Experience Block */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.01]">
            <div className="h-[400px] md:h-[600px] lg:h-[700px] w-full">
              {image_url ? (
                <img
                  src={image_url}
                  alt={title_main}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-it-dark-blue flex items-center justify-center text-it-yellow text-xl font-semibold">
                  {t('no_image_available') || 'No Image Available'}
                </div>
              )}
            </div>
            {/* Experience Block */}
            {experience_year && experience_text && (
              <div
                className={`absolute ${isArabic ? 'left-0 rounded-l-none' : 'right-0 rounded-r-none'} top-0 w-40 md:w-52 h-full text-white flex flex-col justify-center items-center text-center p-4 shadow-xl
                             transform -skew-x-6 md:-skew-x-12 origin-top-${isArabic ? 'left' : 'right'}`}
                style={{ backgroundColor: '#218A7A' }}
              >
                <div className={`transform ${isArabic ? 'skew-x-6 md:skew-x-12' : 'skew-x-6 md:skew-x-12'} flex flex-col items-center ${isArabic ? 'pr-4' : 'pl-4'}`}>
                  <span className="text-6xl md:text-7xl font-extrabold leading-none text-white">
                    {experience_year}
                  </span>
                  <span className="text-base md:text-lg font-medium tracking-wide mt-2 uppercase text-white">
                    {experience_text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Content */}
          <div className={`p-6 md:p-10 lg:p-12 space-y-6 flex flex-col ${contentStartClass}`}>
            {title_small && (
              <p className={`text-sm font-bold uppercase tracking-widest animate-fade-in-down delay-100 text-it-yellow ${blockTextAlignmentClass}`}>
                {title_small}
              </p>
            )}
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter animate-fade-in-up delay-200 text-it-yellow ${blockTextAlignmentClass}`}> {/* تم التعديل هنا: text-it-dark-blue إلى text-it-yellow */}
              {title_main}
            </h2>
            {description && (
              <p className={`text-white text-lg leading-relaxed mb-6 animate-fade-in-up delay-300 ${blockTextAlignmentClass}`}>
                {description}
              </p>
            )}

            {/* Dynamic Single Block - Designed as a Carousel Item */}
            {currentBlock && (blocks.length > 0) && (
              <div className="relative w-full rounded-xl shadow-lg mt-8 animate-fade-in-up delay-400 overflow-hidden"
                   style={{ backgroundColor: '#003366' }}>

                {/* IT Yellow vertical line */}
                <div
                  className={`absolute top-0 h-full w-2 ${isArabic ? 'right-0' : 'left-0'}`}
                  style={{ backgroundColor: '#FFDD33' }}
                ></div>

                {/* Top Section for Navigation Arrows */}
                {blocks.length > 1 && (
                  <div className={`flex justify-end p-4 pb-0`} style={{ direction: 'ltr' }}>
                    <div className="flex space-x-2">
                      <button
                        onClick={goToPrevBlock}
                        className="bg-it-dark-blue hover:bg-it-turquoise p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-it-yellow focus:ring-opacity-75"
                        aria-label={t('previous_block')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={goToNextBlock}
                        className="bg-it-dark-blue hover:bg-it-turquoise p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-it-yellow focus:ring-opacity-75"
                        aria-label={t('next_block')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Content area for text */}
                <div className="p-6 md:p-8 pt-2 text-white relative">
                  <p className={`text-lg md:text-xl leading-relaxed mb-2 ${blockTextAlignmentClass}`}>
                    {currentBlock.block_title}
                  </p>
                  {currentBlock.block_description && (
                    <p className={`text-gray-400 text-sm ${blockTextAlignmentClass}`}>
                      {currentBlock.block_description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Learn More Button */}
            {button_text && button_url && (
              <div className={`mt-10 ${isArabic ? 'text-right' : 'text-left'} animate-fade-in-up delay-500`}>
               <a
  href="/about-details"
  className="inline-flex items-center gap-3 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 text-lg font-medium"
  style={{ backgroundColor: '#218A7A' }}
>
  {button_text}
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isArabic ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
</a>

              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;