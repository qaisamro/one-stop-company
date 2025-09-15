// AdminStory.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AdminStory = () => {
    const { i18n, t } = useTranslation();
    const [story, setStory] = useState({ id: null, title: '', content: '', image_url: null, language: i18n.language });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        // --- تمت إزالة استرجاع رمز CSRF ---
        // const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        // if (csrfToken) {
        //     axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        // } else {
        //     console.warn('CSRF token not found. Forms may not submit correctly.');
        // }
        // --- نهاية إزالة استرجاع رمز CSRF ---

        setLoading(true);
        // تأكد من بروتوكول متسق (https إذا كان موقعك المباشر يستخدمه)
        axios
            .get(`https://one-stop.ps/api/story?lang=${i18n.language}`)
            .then((res) => {
                const fetchedStory = res.data || { id: null, title: '', content: '', image_url: null, language: i18n.language };
                setStory(fetchedStory);
                setImagePreview(fetchedStory.image_url || '');
                setLoading(false);
            })
            .catch((err) => {
                console.error('خطأ في جلب القصة:', err);
                setStatus(t('failed_to_load_story', 'فشل في تحميل القصة.'));
                setLoading(false);
            });
    }, [i18n.language, t]); // تظل مصفوفة الاعتماديات كما هي حيث لا تزال اللغة و t مستخدمتين.

    const handleChange = (e) => {
        setStory({ ...story, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(story.image_url || '');
        }
    };

    const handleSubmit = () => {
        setStatus(null);
        setLoading(true);
        const formData = new FormData();
        formData.append('title', story.title);
        formData.append('content', story.content);
        formData.append('language', i18n.language);

        if (selectedFile) {
            formData.append('image', selectedFile);
        } else if (story.image_url === null && imagePreview === '') {
            // تم التحديث إلى 'delete_image' وفقًا لتوقع المتحكم في Laravel
            formData.append('delete_image', 'true');
        }

        let request;
        if (story.id) {
            // للتحديثات (PUT): أضف _method إلى formData
            formData.append('_method', 'PUT'); // ستقوم Laravel بقراءة هذا والتعامل مع الطلب على أنه PUT
            // تمت إزالة الرؤوس (headers) والمعاملات (params) لأن FormData يتعامل مع Content-Type تلقائيًا،
            // و _method أصبح الآن جزءًا من FormData، وليس معاملًا في الاستعلام.
            request = axios.post(`https://one-stop.ps/api/story/${story.id}`, formData);
        } else {
            // للإنشاء (POST)
            request = axios.post(`https://one-stop.ps/api/story`, formData);
        }

        request
            .then((res) => {
                setStatus(t(story.id ? 'story_updated' : 'story_created', story.id ? '✅ تم تحديث القصة بنجاح' : '✅ تم إنشاء القصة بنجاح'));
                setStory(prevStory => ({
                    ...prevStory, // احتفظ بالمعرف (ID) واللغة الحاليين
                    id: res.data.id || prevStory.id, // تأكد من تعيين المعرف للقصص التي تم إنشاؤها حديثًا
                    title: res.data.title,
                    content: res.data.content,
                    image_url: res.data.image_url,
                }));
                setImagePreview(res.data.image_url || '');
                setSelectedFile(null); // مسح الملف المحدد بعد التحميل/التحديث بنجاح
                setLoading(false);
            })
            .catch((err) => {
                console.error('خطأ:', err.response || err); // سجل استجابة الخطأ الكاملة لتصحيح الأخطاء
                setStatus(t('error_saving', `❌ خطأ في حفظ القصة: ${err.response?.data?.message || err.message}`));
                setLoading(false);
            });
    };

    // مساعد لمسح الصورة
    const handleClearImage = () => {
        setSelectedFile(null);
        setImagePreview(''); // مسح المعاينة
        setStory(prevStory => ({ ...prevStory, image_url: null })); // وضع image_url كـ null في الحالة
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <label htmlFor="language" className="block mb-2 font-medium">
                    {t('select_language', 'اختر اللغة')}:
                </label>
                <select
                    id="language"
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="p-2 border rounded w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                </select>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-it-dark-blue">
                {t('edit_our_story', 'تعديل قسم "قصتنا"')}
            </h2>

            {loading && !story.id ? ( // إظهار التحميل الكامل فقط إذا كان الجلب الأول
                <div className="flex items-center justify-center gap-4 text-it-dark-blue">
                    <svg className="animate-spin w-5 h-5 text-it-yellow" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p>{t('loading', 'جاري التحميل...')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        value={story.title}
                        onChange={handleChange}
                        placeholder={t('story_title_placeholder', 'عنوان القصة')}
                        className="w-full p-3 border rounded bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                    />
                    <textarea
                        name="content"
                        value={story.content}
                        onChange={handleChange}
                        rows={10}
                        placeholder={t('story_content_placeholder', 'محتوى القصة')}
                        className="w-full p-3 border rounded resize-y bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                    />
                    <div className="mb-4">
                        <label htmlFor="image" className="block mb-2 font-medium">
                            {t('story_image', 'صورة القصة')}:
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-3 border rounded bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-it-turquoise"
                        />
                        {imagePreview && (
                            <div className="mt-4 flex flex-col items-start">
                                <p className="mb-2">{t('image_preview', 'معاينة الصورة')}:</p>
                                <img
                                    src={imagePreview}
                                    alt={t('story_image_alt', 'معاينة صورة القصة')}
                                    className="max-w-xs h-auto border rounded shadow-md"
                                />
                                <button
                                    onClick={handleClearImage}
                                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    {t('clear_image', 'مسح الصورة')}
                                </button>
                            </div>
                        )}
                        {!imagePreview && !story.image_url && (
                            <div className="mt-4 text-gray-500">
                                {t('no_image_available', 'لا توجد صورة متاحة')}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-it-dark-blue text-white rounded hover:bg-it-turquoise transition disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span>{t('saving', 'جاري الحفظ...')}</span>
                            </div>
                        ) : (
                            t('save', 'حفظ')
                        )}
                    </button>
                    {status && (
                        <p className={`mt-3 font-medium ${status.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                            {status}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminStory;