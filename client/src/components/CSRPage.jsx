import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../api/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const BACKEND_URL = 'https://one-stop.ps';

const CSRPage = () => {
    const [csrEntries, setCsrEntries] = useState([]);
    const [fixedParagraph, setFixedParagraph] = useState({
        paragraph_ar: '',
        paragraph_en: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch CSR entries
                const csrResponse = await axiosInstance.get('/api/csr');
                setCsrEntries(csrResponse.data);

                // Fetch fixed paragraph
                const paragraphResponse = await axiosInstance.get('/api/csr/fixed-paragraph');
                if (paragraphResponse.data) {
                    setFixedParagraph({
                        paragraph_ar: paragraphResponse.data.paragraph_ar || '',
                        paragraph_en: paragraphResponse.data.paragraph_en || ''
                    });
                }
            } catch (err) {
                setError(t('fail_fetch_content', 'Failed to fetch content.'));
                toast.error(t('fail_fetch_content_short', 'Error fetching content.'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [t]);

    const isArabic = i18n.language === 'ar';
    const directionClass = isArabic ? 'rtl' : 'ltr';

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300" dir={directionClass}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <div className="mx-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                    <p className="text-xl font-semibold" >{t('loading_csr', 'loading_csr ...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4" dir={directionClass}>
                <div className="text-red-600 dark:text-red-400 text-center text-xl font-medium mb-4">
                    {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors duration-300"
                >
                    {t('try_again', 'Try Again')}
                </button>
            </div>
        );
    }

    if (!csrEntries || csrEntries.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 text-gray-500 dark:text-gray-400 text-xl font-medium" dir={directionClass}>
                {t('no_csr_content', 'No CSR content available.')}
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300 py-16" dir={directionClass}>
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="container mx-auto px-4">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-4" style={{ color: '#3C4196' }}>
                    {isArabic ? 'المسؤولية الاجتماعية' : 'CSR'}
                </h2>
                
                {/* Display the fixed paragraph */}
                {fixedParagraph.paragraph_ar || fixedParagraph.paragraph_en ? (
                    <div 
                        className="text-xl font-medium text-gray-700 dark:text-gray-300 text-center mb-12 prose max-w-none"
                        dangerouslySetInnerHTML={{ 
                            __html: isArabic ? fixedParagraph.paragraph_ar : fixedParagraph.paragraph_en 
                        }}
                    />
                ) : null}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {csrEntries.map(entry => (
                        <Link to={`/csr/${entry.id}`} key={entry.id} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={`${BACKEND_URL}${entry.image}`}
                                        alt={isArabic ? entry.title_ar : entry.title_en}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300 mb-2">
                                            {isArabic ? entry.title_ar : entry.title_en}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 text-base mb-4 line-clamp-3">
                                            {isArabic ? entry.description_ar : entry.description_en}
                                        </p>
                                    </div>
                                    <div className="mt-auto">
                                        <span className="inline-flex items-center text-blue-600 font-semibold group-hover:underline">
                                            {t('read_more', 'Read More')}
                                            {isArabic ? (
                                                <svg className="w-4 h-4 mr-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                            ) : (
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CSRPage;