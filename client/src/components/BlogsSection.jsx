import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const BlogsSection = () => {
  const { t, i18n } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';

  const colors = {
    turquoise: '#218A7A',
    darkBlue: '#003366',
    yellow: '#FFDD33',
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/blogs?lang=${i18n.language}`);
        setBlogs(response.data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(t('error_loading_blogs') || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [i18n.language, t]);

  return (
    <section
      id="blogs"
      className={`py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${directionClass} relative`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2
          className={`text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-10 md:mb-16 text-center tracking-tight leading-tight opacity-0 translate-y-4 animate-fade-in-up`}
        >
          {t('blogs_news_title') || 'Blogs & News'}
        </h2>

        {loading && (
          <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''} justify-center gap-3 text-blue-600 dark:text-blue-300 text-xl font-medium mb-8`}>
            <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p>{t('loading_blogs') || 'Loading blogs...'}</p>
          </div>
        )}

        {error && (
          <p className={`text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-5 rounded-lg mb-8 text-center shadow-md animate-pulse text-lg`}>
            {error}
          </p>
        )}

        {blogs.length === 0 && !error && !loading && (
          <p className={`text-gray-600 dark:text-gray-400 text-center text-xl py-10 ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('no_blogs_available') || 'No blogs available'}
          </p>
        )}

        {!loading && blogs.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, A11y, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="mySwiper !pb-10"
              dir={directionClass}
            >
              {blogs.map((blog, index) => (
                <SwiperSlide key={blog.id}>
                  <Link
                    to={`/blogs/${blog.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group flex flex-col h-full"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    {blog.image && (
                      <div className="relative w-full h-56 overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-in-out group-hover:scale-105 rounded-t-2xl"
                        />
                        <div
                          className={`absolute top-0 px-4 py-2 text-white font-bold text-center ${
                            isArabic ? 'right-0 rounded-bl-xl' : 'left-0 rounded-br-xl'
                          }`}
                          style={{ backgroundColor: colors.turquoise }}
                        >
                          <p className="text-3xl leading-none">{new Date(blog.date).getDate()}</p>
                          <p className="text-xs">
                            {new Date(blog.date).toLocaleString(i18n.language, { month: 'short' })}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="p-6 md:p-7 pt-3 flex flex-col flex-grow">
                      <p className={`text-sm text-gray-500 dark:text-gray-400 mb-2 ${isArabic ? 'text-right' : 'text-left'}`}>
                        {blog.author || t('by_admin') || 'By Admin'} • {blog.category || 'Construction'}
                      </p>
                      <h3
                        className={`text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2 ${
                          isArabic ? 'text-right' : 'text-left'
                        } relative`}
                        style={{ minHeight: '3rem' }}
                      >
                        {blog.title}
                        <span
                          className={`absolute bottom-0 ${isArabic ? 'right-0' : 'left-0'} w-0 h-0.5 transition-all duration-300 transform group-hover:w-full`}
                          style={{ backgroundColor: colors.yellow }}
                        ></span>
                      </h3>
                      <p
                        className={`text-gray-700 dark:text-gray-300 leading-relaxed text-base line-clamp-3 ${
                          isArabic ? 'text-right' : 'text-left'
                        } mb-4`}
                        style={{ minHeight: '4.875rem' }}
                      >
                        {blog.description}
                      </p>
                      <div className={`mt-auto ${isArabic ? 'text-left' : 'text-right'}`}>
                        <span
                          className="inline-flex items-center font-semibold transition-colors duration-200"
                          style={{ color: colors.yellow }}
                        >
                          {t('read_more') || 'Read More'}
                          {isArabic ? (
                            <svg
                              className="w-4 h-4 mr-2 transform rotate-180"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              ></path>
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            <div
              className={`swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-300 ${
                isArabic ? 'right-0 -translate-x-2' : 'left-0 translate-x-2'
              } bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{ color: colors.darkBlue, outlineColor: colors.yellow }}
            >
              <svg
                className={`w-6 h-6 transform ${isArabic ? 'rotate-0' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </div>
            <div
              className={`swiper-button-next-custom absolute top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-300 ${
                isArabic ? 'left-0 translate-x-2' : 'right-0 -translate-x-2'
              } bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{ color: colors.darkBlue, outlineColor: colors.yellow }}
            >
              <svg
                className={`w-6 h-6 transform ${isArabic ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;