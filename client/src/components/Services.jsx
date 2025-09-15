import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { i18n, t } = useTranslation();
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = i18n.language === 'ar';
  const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://one-stop.ps/api/services?lang=${i18n.language}`);
        setServices(response.data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(t('failed_to_load_services') || 'Failed to load services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [i18n.language, t]);

  return (
    <section
      id="services"
      className={`py-16 md:py-24 bg-white dark:bg-it-dark-blue`}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }} // تعكس اتجاه الشبكة بالكامل
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-lg">

        {/* Section Title */}
        <div className="mb-12 md:mb-16 text-center">
          <h2
            className={`text-4xl font-light uppercase tracking-widest text-it-dark-blue dark:text-white mb-2
                       opacity-0 translate-y-4 animate-fade-in-up`}
          >
            {t('service_main_title') || 'OUR SERVICES'}
          </h2>
          <p
            className={`text-lg font-light uppercase tracking-widest text-it-turquoise dark:text-it-turquoise
                       opacity-0 translate-y-4 animate-fade-in-up`}
            style={{ animationDelay: '100ms' }}
          >
            {t('years_of_experience') || 'YEARS OF EXPERIENCE'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`flex items-center justify-center gap-3 text-it-dark-blue dark:text-it-yellow text-xl mb-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p>{t('loading_services') || 'Loading services...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <p className="text-it-yellow bg-it-dark-blue p-4 rounded-lg mb-6 text-center shadow-md animate-pulse">
            {error}
          </p>
        )}

        {/* No Services Message */}
        {services.length === 0 && !error && !loading ? (
          <p className={`text-it-dark-blue dark:text-gray-400 text-center text-lg py-8 ${textAlignmentClass}`}>
            {t('no_services_available') || 'No services available.'}
          </p>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ direction: isArabic ? 'rtl' : 'ltr' }} // RTL على الشبكة نفسها
          >
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`p-6 rounded-xl opacity-0 translate-y-4 animate-fade-in-up`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {service.icon && (
                  <div className="flex items-center justify-center w-24 h-24 bg-it-yellow text-it-dark-blue rounded-full mx-auto mb-6
                                  shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                    <img
                      src={service.icon}
                      alt={`${service.title} icon`}
                      className="w-14 h-14 object-contain"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.2))' }}
                    />
                  </div>
                )}
                <h3 className={`text-2xl font-bold text-it-dark-blue dark:text-white mb-3 ${textAlignmentClass}`}>
                  {service.title}
                </h3>
                <p className={`text-gray-700 dark:text-gray-300 leading-relaxed text-base ${textAlignmentClass}`}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Services;
