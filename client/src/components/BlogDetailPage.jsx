import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api/axiosConfig'; // استبدل axios بـ axiosInstance

// رابط القاعدة الأساسي
const BASE_URL = 'https://one-stop.ps';

const BlogDetailPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';
  const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

  useEffect(() => {
    setLoading(true);
    setError(null); // إعادة تعيين الخطأ قبل كل طلب جديد

    axiosInstance
      .get(`/api/blogs/${id}?lang=${i18n.language}`)
      .then((res) => {
        // تحويل مسارات الصور إلى URLs كاملة
        // تحقق مما إذا كانت الاستجابة تحتوي على بيانات وأن المحتوى موجود
        if (res.data && res.data.title) { // نفترض أن وجود العنوان دليل على أن البيانات صالحة
          const blogData = {
            ...res.data,
            image: res.data.image ? `${BASE_URL}${res.data.image}` : null,
            additional_images: res.data.additional_images
              ? res.data.additional_images.map((img) => `${BASE_URL}${img}`)
              : [],
          };
          console.log('Fetched blog:', blogData); // تسجيل للتحقق
          setBlog(blogData);
        } else {
          // إذا لم يتم العثور على بيانات المدونة للغة المحددة
          setBlog(null);
          console.warn('No blog data found for the selected language or blog ID.');
          setError(t('no_blog_content_available') || 'No blog content available for this section in the current language.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog details:', err.response ? err.response.data : err);
        // تحديد نوع الخطأ لعرض رسالة مناسبة
        if (err.response && (err.response.status === 404 || !err.response.data || !err.response.data.title)) {
          setBlog(null); // تأكيد أن blog هو null
          setError(t('no_blog_content_available') || 'No blog content available for this section in the current language.');
        } else {
          setError(t('error_loading_content') || 'Failed to load blog');
        }
        setLoading(false);
      });
  }, [id, i18n.language, t]); // إضافة t كاعتمادية لتجنب تحذيرات ESLint

  // Function to open the image modal
  const openModal = (src, alt) => {
    setModalImageSrc(src);
    setModalImageAlt(alt);
    setIsModalOpen(true);
  };

  // Function to close the image modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc('');
    setModalImageAlt('');
  };

  if (loading) {
    return (
      <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20 animate-pulse">
        <div className="flex items-center justify-center gap-4 text-white text-xl">
          <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p>{t('loading_blogs') || 'Loading_blogs...'}</p>
        </div>
      </section>
    );
  }

  if (error && !blog) { // اعرض رسالة الخطأ فقط إذا لم يكن هناك مدونة بعد
    return (
      <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20">
        <p className="text-it-yellow text-center text-xl py-6 px-10 bg-it-dark-blue/80 rounded-2xl shadow-xl border border-it-yellow">
          {error}
        </p>
      </section>
    );
  }

  if (!blog) { // هذا الشرط سيعالج حالة عدم وجود محتوى بعد التأكد من أن التحميل اكتمل وليس هناك خطأ
    return (
      <section className="min-h-screen py-32 md:py-48 bg-gradient-to-br from-it-dark-blue to-gray-800 flex items-center justify-center pt-20">
        <p className="text-gray-400 text-center text-xl py-6 px-10 bg-it-dark-blue/80 rounded-2xl shadow-xl">
          {t('no_blog_content_available') || 'No blog content available for this section in the current language.'}
        </p>
      </section>
    );
  }

  return (
    <section
      className={`relative min-h-screen pt-32 md:pt-40 pb-16 overflow-hidden ${directionClass}`}
      style={{
        background: `linear-gradient(to bottom, #003366 0%, #003366 50%, #218A7A 100%)`,
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
        {/* Back to blogs link */}
        <div className={`mb-8 ${textAlignmentClass}`}>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-it-yellow hover:text-white transition-colors duration-300 group"
          >
            {isArabic ? (
              <svg className="h-5 w-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            )}
            <span className="text-lg font-medium group-hover:underline">
              {t('back_to_blogs') || 'Back to Blogs'}
            </span>
          </Link>
        </div>

        {/* Main Title */}
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter text-it-yellow mb-10 ${textAlignmentClass}`}>
          {blog.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Image */}
          {blog.image && (
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.01] border-2 border-it-yellow/50 group cursor-pointer"
              onClick={() => openModal(blog.image, blog.title)}
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-[350px] md:h-[550px] lg:h-[650px] object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg'; // صورة احتياطية
                  console.error('Failed to load main image:', blog.image);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-white transform group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          )}
          {/* Right Column - Content */}
          <div className={`flex flex-col ${isArabic ? 'items-end' : 'items-start'}`}>
            <div className={`space-y-8 ${textAlignmentClass} text-white`}>
              {/* Description */}
              <p className="text-white text-xl leading-relaxed font-light">{blog.description}</p>
              {/* Main Content */}
              <div
                className={`prose prose-lg prose-invert max-w-none ${textAlignmentClass} text-gray-100`}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Additional Images */}
              {blog.additional_images && blog.additional_images.length > 0 && (
                <div className="mt-12">
                  <h2 className={`text-3xl font-bold mb-6 text-it-yellow ${textAlignmentClass}`}>
                    {t('additional_images') || 'Additional Images'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blog.additional_images.map((image, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden shadow-lg border border-it-dark-blue transform transition-transform duration-300 hover:scale-[1.02] group cursor-pointer"
                        onClick={() => openModal(image, `${t('additional_image')} ${index + 1}`)}
                      >
                        <img
                          src={image}
                          alt={`${t('additional_image')} ${index + 1}`}
                          className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg'; // صورة احتياطية
                            console.error('Failed to load additional image:', image);
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-white transform group-hover:scale-110 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="relative max-w-full max-h-full overflow-hidden rounded-lg shadow-2xl animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImageSrc}
              alt={modalImageAlt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg'; // صورة احتياطية
                console.error('Failed to load modal image:', modalImageSrc);
              }}
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-it-yellow transition-colors duration-200 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-it-yellow"
              aria-label={t('close_modal') || 'Close image modal'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogDetailPage;