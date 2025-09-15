import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// رابط القاعدة الأساسي للصور - يمكن إزالته إذا كان الـ image_url دائماً يأتي كاملاً من الـ API
// ولكن لنقم بإبقائه للآن فقط لتجنب كسر أي استخدامات أخرى، مع الأخذ في الاعتبار أن image_url يأتي كاملاً
const BASE_URL = 'http://one-stop.ps';

// AnimatedNumber component for statistics
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!inView) {
      setCurrentValue(0);
      return;
    }

    let startTimestamp = null;
    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percentage = Math.min(progress / duration, 1);
      const easedValue = Math.floor(percentage * value);

      setCurrentValue(easedValue);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, inView]);

  return <span ref={ref}>{currentValue}</span>;
};

const CombinedChooseUsAndStatistics = () => {
  const { i18n, t } = useTranslation();
  const [featuresData, setFeaturesData] = useState(null);
  const [statisticsData, setStatisticsData] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorFeatures, setErrorFeatures] = useState(null);
  const [errorStats, setErrorStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';
  const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

  // Fetch Features data
  useEffect(() => {
    const fetchFeatures = async () => {
      setLoadingFeatures(true);
      setErrorFeatures(null);
      try {
        const res = await axios.get(`${BASE_URL}/api/features?lang=${i18n.language}`);
        setFeaturesData(res.data);
        const currentTabs = [
          res.data.section?.tab1_title,
          res.data.section?.tab2_title,
          res.data.section?.tab3_title,
          res.data.section?.tab4_title,
        ].filter(Boolean);
        if (activeTab >= currentTabs.length && currentTabs.length > 0) {
          setActiveTab(0);
        } else if (currentTabs.length === 0) {
          setActiveTab(-1);
        }
      } catch (err) {
        console.error("Error fetching 'Why Choose Us' data:", err);
        setErrorFeatures(t('failed_to_load_choose_us') || "Failed to load 'Why Choose Us' section.");
      } finally {
        setLoadingFeatures(false);
      }
    };
    fetchFeatures();
  }, [i18n.language, t]);

  // Fetch Statistics data
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const response = await axios.get(`${BASE_URL}/api/statistics?lang=${i18n.language}`);
        const formattedStats = response.data.map(stat => {
          const originalValue = String(stat.value);
          const numericValue = originalValue.endsWith('k') ? parseFloat(originalValue) * 1000 : parseInt(originalValue, 10);
          return {
            ...stat,
            value: numericValue,
            originalValueString: originalValue,
          };
        });
        setStatisticsData(formattedStats);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setErrorStats(t('failed_to_load_statistics') || 'Failed to load statistics.');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [i18n.language, t]);

  if (loadingFeatures || loadingStats) {
    return (
      <section className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-[#fdfdf6] to-[#f3f5ff] rounded-3xl shadow-xl p-8">
        <div className="text-center space-y-6">
          <div className="h-12 w-2/3 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="h-8 w-1/2 bg-gray-100 rounded animate-pulse mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="bg-gray-100 rounded-lg h-40 animate-pulse"></div>
            <div className="bg-gray-100 rounded-lg h-40 animate-pulse"></div>
            <div className="bg-gray-100 rounded-lg h-40 animate-pulse"></div>
            <div className="bg-gray-100 rounded-lg h-40 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (errorFeatures || errorStats) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-[#fdfdf6] to-[#f3f5ff] rounded-3xl shadow-xl p-8">
        {errorFeatures && <p className="text-lg text-red-500 mb-2">{errorFeatures}</p>}
        {errorStats && <p className="text-lg text-red-500">{errorStats}</p>}
      </section>
    );
  }

  const section = featuresData?.section;
  const items = featuresData?.items || [];
  const tabs = [
    section?.tab1_title,
    section?.tab2_title,
    section?.tab3_title,
    section?.tab4_title,
  ].filter(Boolean);
  const filteredItems = items.filter(item => item.tab_index === activeTab);

  return (
    <section
      id="why-choose-us"
      className={`relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#fdfdf6] to-[#f3f5ff] ${directionClass}`}
    >
      <div className="container mx-auto relative z-10 max-w-screen-xl">
        {/* Main Title and Description Section */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          {section?.subtitle && (
            <p className="text-sm text-[#218A7A] font-semibold uppercase tracking-wider mb-2 animate-fade-in-down">
              {section.subtitle}
            </p>
          )}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#003366] mb-6 leading-tight tracking-tight animate-fade-in-up">
            {section?.title || t('default_why_choose_us_title')}
          </h2>
          {section?.description && (
            <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-xl mx-auto animate-fade-in-up delay-100">
              {section.description}
            </p>
          )}
        </div>

        {/* Combined Content Area */}
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.005]">
          {/* Left Side: Image and additional info */}
          <div className="lg:w-1/2 w-full h-[300px] md:h-[550px] relative overflow-hidden group">
            {section?.image_url ? (
              <>
                <img
                  src={section.image_url}
                  alt={section.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition duration-500" />
                <div
                  className={`absolute bottom-6 ${isArabic ? 'right-6' : 'left-6'} text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 ${textAlignmentClass}`}
                >
                  <h3 className="text-xl font-bold">{section.title}</h3>
                  <p className="text-sm">{section.subtitle}</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
                {t('no_image_available') || 'No Image Available'}
              </div>
            )}
          </div>

          {/* Right Side: Tabs, Features */}
          <div className="lg:w-1/2 w-full p-8 md:p-12 lg:p-16 flex flex-col justify-between">
            <div>
              {/* Tabs */}
              {tabs.length > 0 && (
                <div className={`flex flex-wrap gap-3 mb-8 ${isArabic ? 'justify-end' : 'justify-start'} animate-fade-in-up delay-200`}>
                  {tabs.map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`px-5 py-2 rounded-full border text-sm sm:text-base font-semibold transition-all duration-300 shadow-sm
                        ${activeTab === idx
                          ? 'bg-[#FFDD33] text-[#003366] border-[#FFDD33] hover:bg-[#FFDD33]/90'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-[#FFDD33]/20 hover:text-[#003366]'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* Features (Items) */}
              {filteredItems.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  {filteredItems.map((item, i) => (
                    <li
                      key={item.id || i}
                      className={`flex items-start gap-4 ${isArabic ? 'flex-row-reverse' : 'flex-row'} p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up`}
                      style={{ animationDelay: `${300 + i * 100}ms` }}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#003366] text-white text-xl">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className={`text-gray-800 font-medium text-base leading-snug flex-grow ${textAlignmentClass}`}>
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-gray-500 italic mb-10 ${textAlignmentClass} animate-fade-in-up delay-400`}>
                  {t('no_features_for_tab') || 'No features to display for this tab currently.'}
                </p>
              )}
            </div>

            {/* Button */}
            {section?.button_url && section?.button_text && (
              <div className={`mt-10 ${isArabic ? 'text-right' : 'text-left'} animate-fade-in-up delay-500`}>
                <a
                  href={section.button_url}
                  className="inline-flex items-center gap-2 bg-[#218A7A] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 text-lg font-medium"
                >
                  {section.button_text}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        {statisticsData.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 p-8 bg-[#003366] rounded-3xl shadow-2xl text-white"
            style={{ direction: isArabic ? 'rtl' : 'ltr' }}
          >
            {statisticsData.map((stat, index) => (
              <div
                key={stat.id || index}
                className={`animate-fade-in-up ${textAlignmentClass}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <h3 className="text-5xl md:text-6xl font-extrabold text-[#FFDD33] mb-2 leading-none">
                  <AnimatedNumber value={stat.value} />
                  {stat.originalValueString && stat.originalValueString.endsWith('k') ? 'k' : ''}
                </h3>
                <p className="text-xl font-medium text-gray-100">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-gray-500 italic mt-16 text-center ${textAlignmentClass}`}>
            {t('no_statistics_available') || 'No statistics available.'}
          </p>
        )}
      </div>
    </section>
  );
};

export default CombinedChooseUsAndStatistics;