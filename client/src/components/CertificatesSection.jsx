import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api/axiosConfig';

// Modal component for image enlargement
const ImageModal = ({ imageUrl, onClose, isArabic }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl max-w-3xl max-h-[90vh] overflow-hidden transform scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'} text-white bg-[#01A859] rounded-full p-2 hover:bg-opacity-80 transition-colors z-10`}
          aria-label={isArabic ? "إغلاق الصورة" : "Close image"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt="Enlarged Certificate"
          className="max-w-full max-h-[85vh] object-contain mx-auto"
        />
      </div>
    </div>
  );
};

const CertificatesSection = () => {
  const { t, i18n } = useTranslation();
  const [certs, setCerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';
  const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`https://one-stop.ps/api/certificates?lang=${i18n.language}`);
        setCerts(response.data);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError(t('error_loading_certificates') || 'فشل تحميل الشهادات.');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [i18n.language, t]);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const closeImageModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <section id="certificates" className={`py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${directionClass}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter animate-fade-in-up delay-200`}
              style={{ color: '#3C4196' }}>
            {t('certificates_title') || 'شهاداتنا واعتماداتنا'}
          </h2>
        </div>

        {loading && (
          <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''} justify-center gap-2 text-[#3C4196] dark:text-blue-300 text-lg mb-6 animate-pulse`}>
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p>{t('loading_certificates') || 'جارٍ تحميل الشهادات...'}</p>
          </div>
        )}

        {error && (
          <p className={`text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-6 text-center shadow-md animate-pulse`}>
            {error}
          </p>
        )}

        {certs.length === 0 && !error && !loading && (
          <p className={`text-gray-600 dark:text-gray-400 text-center text-lg py-8 ${textAlignmentClass}`}>
            {t('no_certificates_available') || 'لا توجد شهادات متاحة حاليًا.'}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {certs.map((cert, index) => (
            <div
              key={cert.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden
                         opacity-0 translate-y-4 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {cert.photo_url ? (
                <div 
                  className="relative p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 h-48 rounded-t-lg group"
                >
                  <img
                    src={cert.photo_url}
                    alt={cert.title}
                    className="max-w-full max-h-full object-contain transition-opacity duration-300 group-hover:opacity-60"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                      console.warn(`Failed to load image for ${cert.title}: ${cert.photo_url}`);
                    }}
                  />
                  <button
                    onClick={() => openImageModal(cert.photo_url)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white rounded-t-lg cursor-pointer"
                    aria-label={isArabic ? `تكبير صورة ${cert.title}` : `Enlarge image of ${cert.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 h-48 rounded-t-lg text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2zm2 4v10h12V7H6zm2 2h8v6H8V9z" />
                  </svg>
                  <span>{t('no_image_for_certificate') || 'لا توجد صورة'}</span>
                </div>
              )}
              <div className="p-4 flex flex-col justify-between h-full">
                <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-2 ${textAlignmentClass}`}>
                  {cert.title}
                </h3>
                {cert.issuer && (
                  <p className={`text-gray-700 dark:text-gray-300 text-sm mb-1 ${textAlignmentClass}`}>
                    <span className="font-semibold">{t('issuer') || 'الجهة'}:</span> {cert.issuer}
                  </p>
                )}
                {cert.year && (
                  <p className={`text-gray-600 dark:text-gray-400 text-xs mb-3 ${textAlignmentClass}`}>
                    <span className="font-semibold">{t('year') || 'السنة'}:</span> {cert.year}
                  </p>
                )}
                {cert.link && (
                  <div className="mt-auto pt-2">
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center text-white text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200 hover:opacity-90"
                      style={{ backgroundColor: '#01A859' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isArabic ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {t('view_certificate') || 'عرض الشهادة'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ImageModal imageUrl={selectedImage} onClose={closeImageModal} isArabic={isArabic} />
    </section>
  );
};

export default CertificatesSection;