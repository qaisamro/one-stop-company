import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AboutDetails = () => {
  const { t, i18n } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';
  const blockTextAlignmentClass = isArabic ? 'text-right' : 'text-left';
  // For the title, we want to push the inline-block to the right in RTL.
  const titleAlignmentClass = isArabic ? 'mr-auto' : 'ml-auto';


  // Define IT colors based on your provided palette for consistent use
  const itColors = {
    turquoise: '#218A7A',     // تركواز IT 158-1
    darkBlue: '#003366',      // أزرق غامق IT 160-3
    yellow: '#FFDD33',        // أصفر IT 58-5
    grayText: '#A0AEC0', // A lighter gray for secondary text in dark mode (tailwind gray-400)
    white: '#FFFFFF',
    black: '#000000',
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Fetch only the data needed for features
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/about?lang=${i18n.language}`)
      .then((res) => {
        setFeatures(res.data.features || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load about details', err);
        setError(t('error_loading_content') || 'Failed to load content');
        setIsLoading(false);
      });
  }, [i18n.language, t]);


  if (isLoading) {
    return (
      <section className={`py-20 md:py-32 bg-gradient-to-br from-[${itColors.darkBlue}] to-gray-800 animate-pulse pt-32`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          {/* Skeleton for the philosophy section title - UPDATED CLASS HERE */}
          <div className={`h-10 w-80 bg-it-dark-blue/50 rounded mb-10 ${isArabic ? 'mr-auto' : 'ml-auto'}`}></div>
          {/* Skeleton for feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => ( // Render 3 skeleton cards
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg h-48 flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-20 md:py-32 bg-gradient-to-br from-[${itColors.darkBlue}] to-gray-800 flex items-center justify-center pt-32`}>
        <p className={`text-[${itColors.yellow}] text-center py-6 px-8 bg-[${itColors.darkBlue}]/80 rounded-2xl shadow-xl`}>
          {error}
        </p>
      </section>
    );
  }

  // If no features are available after loading, show a message
  if (features.length === 0) {
    return (
      <section className={`py-20 md:py-32 bg-gradient-to-br from-[${itColors.darkBlue}] to-gray-800 flex items-center justify-center pt-32 ${directionClass}`}>
        <p className="text-gray-400 text-center text-lg">
          {t('no_philosophy_content_available') || 'No philosophy and commitment content available in the current language.'}
        </p>
      </section>
    );
  }

  return (
    <section
      id="philosophy-commitment"
      className={`relative py-16 md:py-24 overflow-hidden ${directionClass} pt-24 md:pt-32`}
      style={{
        background: `linear-gradient(to bottom, ${itColors.darkBlue} 0%, ${itColors.darkBlue} 50%, ${itColors.turquoise} 100%)`,
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: `url('/assets/images/pattern-light.png')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl relative z-10">
        {/* Features Section - Main and Only Content */}
        <div className="mt-12 w-full">
          {/* UPDATED H2 CLASS HERE */}
           <h2 className={`text-3xl sm:text-4xl font-bold mb-8 text-yellow-400 ${blockTextAlignmentClass}`}>
                  {t('our_Philosophy') || 'Our Philosophy & Commitment'}
                </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
                  bg-white text-[${itColors.darkBlue}] p-6 rounded-xl shadow-lg border border-gray-100
                  hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out
                  flex flex-col items-center text-center
                  group
                `}
              >
                {/* Icon Container with dynamic colors */}
                <div className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ease-in-out group-hover:bg-[${itColors.yellow}]`}>
                  <svg className={`w-8 h-8 text-[${itColors.turquoise}] group-hover:text-[${itColors.darkBlue}] transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-3 text-[${itColors.darkBlue}]`}>{feature.title}</h3>

                {feature.description && (
                  <ul className={`text-gray-700 text-base leading-relaxed w-full ${isArabic ? 'text-right' : 'text-left'}`}>
                    {feature.description.split('\n').map((item, idx) => (
                      item.trim() && (
                        <li
                          key={idx}
                          className={`
                            flex items-start mb-2
                            ${isArabic ? 'flex-row-reverse' : 'flex-row'} // Reverse order for RTL
                          `}
                        >
                          {/* Custom Checkmark Icon for each list item */}
                          <svg
                            className={`w-5 h-5 flex-shrink-0
                              ${isArabic ? 'mr-2' : 'ml-2'} // Adjust margin for RTL/LTR
                              text-[${itColors.turquoise}]
                            `}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className={`${isArabic ? 'pr-2' : 'pl-2'}`}>{item.trim()}</span> {/* Add padding to separate text from icon */}
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDetails;