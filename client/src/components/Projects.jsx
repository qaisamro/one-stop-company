import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Projects = () => {
    const { i18n, t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');

    const isArabic = i18n.language === 'ar';
    const textAlignmentClass = isArabic ? 'text-right' : 'text-left';
    const flexDirectionClass = isArabic ? 'flex-row-reverse' : 'flex-row';

    const colors = {
        yellow: '#FFDD33',
        darkBlue: '#003366',
        turquoise: '#218A7A',
    };

    useEffect(() => {
        const fetchProjectsAndBackground = async () => {
            setLoading(true);
            try {
                // Fetch projects
                const projectsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects?lang=${i18n.language}`);
                console.log('Fetched projects:', projectsResponse.data);
                setProjects(projectsResponse.data.filter(project => project.id));

                // Fetch background image
                try {
                    const backgroundResponse = await axios.get('${process.env.REACT_APP_API_URL}/api/projects/background');
                    setBackgroundImage(backgroundResponse.data.imagePath ? `${process.env.REACT_APP_API_URL}${backgroundResponse.data.imagePath}` : '');
                } catch (bgErr) {
                    console.error('Error fetching background:', bgErr);
                    setBackgroundImage('');
                }
                setError('');
            } catch (err) {
                console.error("Error fetching data for projects section:", err);
                setError(t('error_loading_projects') || 'فشل تحميل المشاريع أو الخلفية.');
            } finally {
                setLoading(false);
            }
        };
        fetchProjectsAndBackground();
    }, [i18n.language, t]);

    return (
        <section
            id="projects"
            className="py-16 md:py-24 overflow-hidden relative bg-cover bg-center"
            style={{ backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none' }}
        >
            {backgroundImage && (
                <div className="absolute inset-0 bg-white opacity-90 dark:bg-gray-900 dark:opacity-80 z-0"></div>
            )}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <div className={`mb-12 md:mb-16 ${flexDirectionClass} items-center justify-between`}>
                    <h2
                        className={`text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight ${textAlignmentClass}`}
                        style={{ color: colors.darkBlue }}
                    >
                        {t('projects_main_title') || 'مشاريعنا تعكس التزامنا بالجودة والابتكار'}
                    </h2>
                </div>
                {loading && (
                    <div className="flex items-center justify-center gap-3 text-lg py-8" style={{ color: colors.darkBlue }}>
                        <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p>{t('loading_projects') || 'جارٍ تحميل المشاريع...'}</p>
                    </div>
                )}
                {error && (
                    <p className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center shadow-md animate-pulse">
                        {error}
                    </p>
                )}
                {!loading && !error && projects.length === 0 && (
                    <p className={`text-gray-600 dark:text-gray-400 text-center text-lg py-8 ${textAlignmentClass}`}>
                        {t('no_projects_available') || 'لا توجد مشاريع متاحة حاليًا.'}
                    </p>
                )}
                {!loading && !error && projects.length > 0 && (
                    <Swiper
                        modules={[Navigation, Pagination, A11y, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={true}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 20 },
                            768: { slidesPerView: 3, spaceBetween: 30 },
                            1024: { slidesPerView: 4, spaceBetween: 30 },
                        }}
                        className="mySwiper !pb-10"
                    >
                        {projects.map((project, index) => (
                            <SwiperSlide key={project.id}>
                                <div
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 transform overflow-hidden border border-gray-100 dark:border-gray-700 group relative flex flex-col items-stretch h-full hover:shadow-xl hover:scale-105"
                                    style={{
                                        borderLeftColor: 'transparent',
                                        transition: 'border-left-color 0.3s ease-in-out',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = colors.turquoise; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}
                                >
                                    {project.image && (
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}${project.image}`}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className={`absolute inset-0 flex items-center justify-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out text-white text-lg font-semibold ${flexDirectionClass}`}
                                                style={{ backgroundColor: `${colors.darkBlue}E6` }}
                                            >
                                                {t('view_more') || 'عرض المزيد'}
                                                {isArabic ? (
                                                    <svg className="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="ml-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L6.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </Link>
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <span className={`text-3xl font-bold mb-2 ${textAlignmentClass}`} style={{ color: colors.darkBlue }}>
                                            {`0${index + 1}.`}
                                        </span>
                                        {project.extra_title && (
                                            <h4 className={`text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 ${textAlignmentClass}`}>
                                                {project.extra_title}
                                            </h4>
                                        )}
                                        <h3 className={`font-bold text-xl md:text-2xl text-gray-900 dark:text-white mb-2 ${textAlignmentClass}`}>
                                            {project.title}
                                        </h3>
                                        {project.title_description && (
                                            <p className={`text-gray-600 dark:text-gray-400 mb-2 leading-relaxed ${textAlignmentClass}`}>
                                                {project.title_description}
                                            </p>
                                        )}
                                        <p className={`text-gray-700 dark:text-gray-300 mb-4 leading-relaxed flex-grow ${textAlignmentClass}`}>
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </section>
    );
};

export default Projects;