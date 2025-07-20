import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const { i18n, t } = useTranslation();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const isArabic = i18n.language === 'ar';
    const textAlignmentClass = isArabic ? 'text-right' : 'text-left';
    const dirAttribute = isArabic ? 'rtl' : 'ltr';

    const colors = {
        yellow: '#FFDD33',
        darkBlue: '#003366',
        turquoise: '#218A7A',
        grayTextDark: '#D1D5DB',
        grayTextLight: '#4B5563',
        blueAccentLight: '#3B82F6',
        blueAccentDark: '#60A5FA',
    };

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            console.log(`Fetching project with ID: ${id}, language: ${i18n.language}`);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${id}?lang=${i18n.language}`);
                setProject(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching project:', err);
                setError(err.response?.data?.error || t('error_loading_project'));
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, i18n.language, t]);

    return (
        <main
            className="pt-24 md:pt-32 p-4 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 font-sans text-gray-900 dark:text-gray-100 antialiased"
            dir={dirAttribute}
        >
            <div className="container mx-auto max-w-4xl">
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-4 text-xl py-20 animate-pulse">
                        <svg className="animate-spin w-10 h-10" style={{ color: colors.darkBlue }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="font-semibold text-lg md:text-xl text-gray-700 dark:text-gray-300">
                            {t('loading_project')}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 p-6 rounded-xl text-center shadow-lg animate-fade-in transition-all duration-300">
                        <p className="text-lg font-medium mb-4">{error}</p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {t('back_to_home')}
                            <svg
                                className={`h-5 w-5 ${isArabic ? 'order-first ml-0 mr-2 rtl:rotate-180' : 'ml-2'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>
                )}

                {project && !loading && !error && (
                    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-6 md:p-10 transform hover:scale-100 transition-transform duration-300 ease-out">
                        {project.extra_title && (
                            <p className={`text-xl font-medium text-gray-600 dark:text-gray-400 mb-2 ${textAlignmentClass}`}>
                                {project.extra_title}
                            </p>
                        )}
                        <h1
                            className={`text-4xl md:text-5xl font-extrabold mb-6 leading-tight ${textAlignmentClass}`}
                            style={{ color: colors.darkBlue }}
                        >
                            {project.title}
                        </h1>

                        {project.title_description && (
                            <p className={`text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed ${textAlignmentClass}`}>
                                {project.title_description}
                            </p>
                        )}

                        {(project.image || (project.additional_images && project.additional_images.length > 0)) && (
                            <div className="relative mb-10 overflow-hidden rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                <Swiper
                                    modules={[Navigation, Pagination, A11y]}
                                    spaceBetween={15}
                                    slidesPerView={1}
                                    navigation={{
                                        prevEl: prevRef.current,
                                        nextEl: nextRef.current,
                                    }}
                                    onBeforeInit={(swiper) => {
                                        swiper.params.navigation.prevEl = prevRef.current;
                                        swiper.params.navigation.nextEl = nextRef.current;
                                    }}
                                    pagination={{
                                        clickable: true,
                                        dynamicBullets: true,
                                        el: '.swiper-pagination',
                                    }}
                                    className="rounded-2xl"
                                >
                                    {project.image && (
                                        <SwiperSlide>
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}${project.image}`}
                                                alt={project.title}
                                                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                                            />
                                        </SwiperSlide>
                                    )}
                                    {project.additional_images?.map((img, index) => (
                                        <SwiperSlide key={index}>
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}${img}`}
                                                alt={`${project.title} - ${index + 1}`}
                                                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                                            />
                                        </SwiperSlide>
                                    ))}

                                    <div
                                        ref={prevRef}
                                        className={`
                                            swiper-button-prev
                                            absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                                            flex items-center justify-center cursor-pointer select-none
                                            bg-black/40 hover:bg-black/60 transition-colors duration-300
                                            text-white
                                            ${isArabic ? 'left-auto right-4' : 'left-4'}
                                            after:content-[''] after:!bg-none
                                            ${isArabic ? 'rtl:before:content-["\\u2192"]' : 'before:content-["\\u2190"]'}
                                            before:text-2xl before:font-bold
                                            dark:bg-white/30 dark:hover:bg-white/50 dark:text-gray-900
                                        `}
                                    ></div>
                                    <div
                                        ref={nextRef}
                                        className={`
                                            swiper-button-next
                                            absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                                            flex items-center justify-center cursor-pointer select-none
                                            bg-black/40 hover:bg-black/60 transition-colors duration-300
                                            text-white
                                            ${isArabic ? 'right-auto left-4' : 'right-4'}
                                            after:content-[''] after:!bg-none
                                            ${isArabic ? 'rtl:before:content-["\\u2190"]' : 'before:content-["\\u2192"]'}
                                            before:text-2xl before:font-bold
                                            dark:bg-white/30 dark:hover:bg-white/50 dark:text-gray-900
                                        `}
                                    ></div>

                                    <div
                                        className={`
                                            swiper-pagination absolute bottom-4 left-0 w-full flex justify-center z-10
                                            [&>.swiper-pagination-bullet]:w-3 [&>.swiper-pagination-bullet]:h-3 [&>.swiper-pagination-bullet]:bg-white/60
                                            [&>.swiper-pagination-bullet]:rounded-full [&>.swiper-pagination-bullet]:mx-1
                                            [&>.swiper-pagination-bullet]:transition-all [&>.swiper-pagination-bullet]:duration-300
                                            [&>.swiper-pagination-bullet-active]:bg-${colors.turquoise.replace('#', '[#')}
                                            [&>.swiper-pagination-bullet-active]:w-4 [&>.swiper-pagination-bullet-active]:h-4
                                            dark:[&>.swiper-pagination-bullet]:bg-gray-400/60
                                            dark:[&>.swiper-pagination-bullet-active]:bg-${colors.yellow.replace('#', '[#')}
                                        `}
                                    ></div>
                                </Swiper>
                            </div>
                        )}

                        <div className="space-y-8">
                            <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${textAlignmentClass}`}>
                                {project.description}
                            </p>

                            {project.detailed_description && (
                                <div>
                                    <h2
                                        className={`text-3xl font-bold mb-4 ${textAlignmentClass}`}
                                        style={{ color: colors.turquoise }}
                                    >
                                        {t('project_details')}
                                    </h2>
                                    <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${textAlignmentClass}`}>
                                        {project.detailed_description}
                                    </p>
                                </div>
                            )}

                            {project.sections?.length > 0 && (
                                <div>
                                    <h2
                                        className={`text-3xl font-bold mb-4 ${textAlignmentClass}`}
                                        style={{ color: colors.turquoise }}
                                    >
                                        {t('project_sections')}
                                    </h2>
                                    <div className="space-y-6">
                                        {project.sections.map((section, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600"
                                            >
                                                <h3
                                                    className={`text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 ${textAlignmentClass}`}
                                                >
                                                    {section.title}
                                                </h3>
                                                <p
                                                    className={`text-base text-gray-700 dark:text-gray-300 leading-relaxed ${textAlignmentClass}`}
                                                >
                                                    {section.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`mt-10 flex gap-4 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                            {project.url && (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white transition-all duration-300
                                               bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900
                                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                               dark:from-blue-700 dark:to-blue-900 dark:hover:from-blue-800 dark:hover:to-blue-950"
                                >
                                    {t('visit_project')}
                                    <svg
                                        className={`h-5 w-5 ${isArabic ? 'order-first ml-0 mr-2 rtl:rotate-180' : 'ml-2'}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                    </svg>
                                </a>
                            )}

                            <Link
                                to="/"
                                className="inline-flex items-center px-8 py-4 border border-blue-600 dark:border-blue-400 text-lg font-medium rounded-full shadow-lg transition-all duration-300
                                           text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700
                                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t('back_to_home')}
                                <svg
                                    className={`h-5 w-5 ${isArabic ? 'order-first ml-0 mr-2 rtl:rotate-180' : 'ml-2'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ProjectDetailPage;