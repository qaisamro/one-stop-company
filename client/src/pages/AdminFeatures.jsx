// C:\Users\Lenovo\one-stop-company\client\src\pages\AdminFeatures.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Placeholder image from a reliable source
const placeholderImage = 'https://placehold.co/150x150?text=Image+Not+Found';

const AdminFeatures = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [sectionData, setSectionData] = useState({
    id: null,
    title: '',
    subtitle: '',
    description: '',
    tab1_title: '',
    tab2_title: '',
    tab3_title: '',
    tab4_title: '',
    button_text: '',
    button_url: '',
    image_url: '',
    language: 'en',
  });
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState({ text: '', icon: '✔️', tab_index: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false); // حالة لتتبع ما إذا كان يجب حذف الصورة الحالية صراحةً

  // Base URL for API calls
  const API_BASE_URL = 'https://one-stop.ps';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      setSectionData((prev) => ({ ...prev, language }));
      fetchData();
    }
  }, [language, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/features?lang=${language}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.section) {
        setSectionData({
          id: response.data.section.id || null,
          title: response.data.section.title?.trim() || '',
          subtitle: response.data.section.subtitle?.trim() || '',
          description: response.data.section.description?.trim() || '',
          tab1_title: response.data.section.tab1_title?.trim() || '',
          tab2_title: response.data.section.tab2_title?.trim() || '',
          tab3_title: response.data.section.tab3_title?.trim() || '',
          tab4_title: response.data.section.tab4_title?.trim() || '',
          button_text: response.data.section.button_text?.trim() || '',
          button_url: response.data.section.button_url?.trim() || '',
          image_url: response.data.section.image_url?.trim() || '',
          language: language,
        });
        setFeatures(response.data.items || []);
        setImageFile(null);
        setShouldDeleteImage(false); // إعادة تعيين علامة الحذف عند جلب بيانات جديدة
      } else {
        setSectionData({
          id: null,
          title: '',
          subtitle: '',
          description: '',
          tab1_title: '',
          tab2_title: '',
          tab3_title: '',
          tab4_title: '',
          button_text: '',
          button_url: '',
          image_url: '',
          language: language,
        });
        setFeatures([]);
        setImageFile(null);
        setShouldDeleteImage(false); // إعادة تعيين علامة الحذف عند جلب بيانات جديدة
      }
    } catch (err) {
      console.error('خطأ في جلب بيانات الخصائص:', err);
      const errorMessage =
        err.response?.data?.error || (language === 'ar' ? 'فشل في تحميل البيانات.' : 'Failed to load data.');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSectionData((prev) => ({ ...prev, [name]: value?.trim() || '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.' : 'Image size must not exceed 5MB.');
        e.target.value = null;
        setImageFile(null);
        setShouldDeleteImage(false); // إذا تم اختيار ملف جديد، فلا نحذف الصورة القديمة
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error(
          language === 'ar'
            ? 'الصورة يجب أن تكون بصيغة: jpeg، jpg، png، أو gif.'
            : 'The image must be in: jpeg, jpg, png, or gif format.',
        );
        e.target.value = null;
        setImageFile(null);
        setShouldDeleteImage(false); // إذا تم اختيار ملف جديد، فلا نحذف الصورة القديمة
        return;
      }
      setImageFile(file);
      setShouldDeleteImage(false); // إذا تم اختيار ملف جديد، فلا نحذف الصورة القديمة
    } else {
      setImageFile(null);
    }
  };

  const handleSaveSection = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!sectionData.title.trim()) {
        const errorMessage = language === 'ar' ? 'عنوان القسم مطلوب!' : 'Section title is required!';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      const formData = new FormData();
      const fields = [
        'title',
        'subtitle',
        'description',
        'tab1_title',
        'tab2_title',
        'tab3_title',
        'tab4_title',
        'button_text',
        'button_url',
        'language',
      ];
      fields.forEach((key) => {
        const value = sectionData[key] !== null && sectionData[key] !== undefined ? sectionData[key].trim() : '';
        formData.append(key, value);
      });

      if (imageFile) {
        formData.append('image', imageFile);
        setShouldDeleteImage(false);
      } else if (shouldDeleteImage && sectionData.id) {
        // ✨ التغيير هنا: إرسال '1' بدلاً من 'true' لضمان توافق أفضل مع Laravel validator
        formData.append('delete_image', '1'); // إرسال "1" كسلسلة نصية لـ FormData
      }

      let res;
      if (sectionData.id) {
        formData.append('_method', 'PUT');
        console.log(`Sending POST (with _method=PUT) to ${API_BASE_URL}/api/features/${sectionData.id}`);
        res = await axios.post(`${API_BASE_URL}/api/features/${sectionData.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(language === 'ar' ? 'تم تحديث القسم بنجاح! ✅' : 'Section updated successfully! ✅');
      } else {
        console.log(`Sending POST to ${API_BASE_URL}/api/features`);
        res = await axios.post(`${API_BASE_URL}/api/features`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(language === 'ar' ? 'تم إنشاء القسم بنجاح! ✅' : 'Section created successfully! ✅');
      }

      if (res.data.section && res.data.section.image_url !== undefined) {
        setSectionData((prev) => ({ ...prev, image_url: res.data.section.image_url || '' }));
      }
      setImageFile(null);
      setShouldDeleteImage(false); // إعادة تعيين علامة الحذف بعد الحفظ بنجاح
      fetchData();
    } catch (err) {
      console.error('خطأ في حفظ القسم:', err);
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.error || (language === 'ar' ? 'فشل في حفظ القسم.' : 'Failed to save section.');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('تفاصيل الخطأ:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = async () => {
    setLoading(true);
    setError(null);
    if (!newFeature.text.trim()) {
      toast.warn(language === 'ar' ? 'نص الميزة لا يمكن أن يكون فارغًا.' : 'Feature text cannot be empty.');
      setLoading(false);
      return;
    }
    if (!sectionData.id) {
      toast.error(
        language === 'ar' ? 'يجب حفظ القسم أولاً قبل إضافة المميزات.' : 'You must save the section first before adding features.',
      );
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/features/${sectionData.id}/item`,
        {
          ...newFeature,
          language,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewFeature({ text: '', icon: '✔️', tab_index: newFeature.tab_index });
      fetchData();
      toast.success(language === 'ar' ? 'تمت إضافة الميزة بنجاح! ✅' : 'Feature added successfully! ✅');
    } catch (err) {
      console.error('خطأ في إضافة الميزة:', err);
      const errorMessage =
        err.response?.data?.error || (language === 'ar' ? 'فشل في إضافة الميزة.' : 'Failed to add feature.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeature = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/features/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      toast.success(language === 'ar' ? 'تم حذف الميزة بنجاح! ✅' : 'Feature deleted successfully! ✅');
    } catch (err) {
      console.error('خطأ في حذف الميزة:', err);
      const errorMessage =
        err.response?.data?.error || (language === 'ar' ? 'فشل في حذف الميزة.' : 'Failed to delete feature.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const tabTitles = [
    sectionData.tab1_title || (language === 'ar' ? 'التاب 1' : 'Tab 1'),
    sectionData.tab2_title || (language === 'ar' ? 'التاب 2' : 'Tab 2'),
    sectionData.tab3_title || (language === 'ar' ? 'التاب 3' : 'Tab 3'),
    sectionData.tab4_title || (language === 'ar' ? 'التاب 4' : 'Tab 4'),
  ].filter((title, index) => {
    if (index === 0) return true;
    const defaultTitle = language === 'ar' ? `التاب ${index + 1}` : `Tab ${index + 1}`;
    return sectionData[`tab${index + 1}_title`].trim() !== '' && sectionData[`tab${index + 1}_title`].trim() !== defaultTitle;
  });


  const [selectedAdminTab, setSelectedAdminTab] = useState(0);
  const filteredAdminFeatures = features.filter((f) => f.tab_index === selectedAdminTab);

  if (loading)
    return (
      <div className="p-6 max-w-5xl mx-auto text-center flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  if (error) return <div className="p-6 max-w-5xl mx-auto text-center text-red-500">{error}</div>;

  return (
    <div className={`p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {language === 'ar' ? 'إدارة قسم "لماذا نحن؟"' : 'Manage "Why Us?" Section'}
      </h2>

      <div className="mb-4">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ar' ? 'اختر اللغة:' : 'Select Language:'}
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="space-y-4 mb-6">
        <input
          name="title"
          placeholder={language === 'ar' ? 'العنوان الرئيسي' : 'Main Title'}
          value={sectionData.title}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
          required
        />
        <input
          name="subtitle"
          placeholder={language === 'ar' ? 'العنوان الفرعي' : 'Subtitle'}
          value={sectionData.subtitle}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <textarea
          name="description"
          placeholder={language === 'ar' ? 'الوصف' : 'Description'}
          value={sectionData.description}
          onChange={handleChange}
          rows="4"
          className="border border-gray-300 p-2 w-full rounded-md"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="tab1_title"
            placeholder={language === 'ar' ? 'عنوان التاب 1' : 'Tab 1 Title'}
            value={sectionData.tab1_title}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            name="tab2_title"
            placeholder={language === 'ar' ? 'عنوان التاب 2' : 'Tab 2 Title'}
            value={sectionData.tab2_title}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            name="tab3_title"
            placeholder={language === 'ar' ? 'عنوان التاب 3' : 'Tab 3 Title'}
            value={sectionData.tab3_title}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            name="tab4_title"
            placeholder={language === 'ar' ? 'عنوان التاب 4' : 'Tab 4 Title'}
            value={sectionData.tab4_title}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>

        <input
          name="button_text"
          placeholder={language === 'ar' ? 'نص الزر' : 'Button Text'}
          value={sectionData.button_text}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <input
          name="button_url"
          placeholder={language === 'ar' ? 'رابط الزر (مثال: /contact أو https://example.com)' : 'Button URL (e.g., /contact or https://example.com)'}
          value={sectionData.button_url}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />

        <div className="mb-4">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ar' ? 'صورة القسم:' : 'Section Image:'}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {(sectionData.image_url || imageFile) && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'الصورة الحالية/المعروضة:' : 'Current/Uploaded Image:'}
              </p>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : sectionData.image_url || placeholderImage}
                alt="preview"
                className="w-48 h-auto object-cover rounded-md border border-gray-200"
                onError={(e) => {
                  e.target.src = placeholderImage;
                  console.warn('فشل تحميل الصورة، يتم استخدام الصورة البديلة:', sectionData.image_url || 'لا يوجد رابط');
                }}
              />
              {sectionData.image_url && !imageFile && (
                <button
                  onClick={() => {
                    setSectionData((prev) => ({ ...prev, image_url: '' }));
                    setShouldDeleteImage(true);
                  }}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md"
                >
                  {language === 'ar' ? 'حذف الصورة الحالية' : 'Delete Current Image'}
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveSection}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out shadow-md"
          disabled={loading}
        >
          {sectionData.id
            ? language === 'ar'
              ? '💾 حفظ التغييرات'
              : '💾 Save Changes'
            : language === 'ar'
              ? '✨ إنشاء القسم'
              : '✨ Create Section'}
        </button>
      </div>

      <hr className="my-8 border-t-2 border-gray-200" />

      <h3 className="text-xl font-bold mb-4 text-gray-800">{language === 'ar' ? 'إدارة المميزات' : 'Manage Features'}</h3>

      <div className="mb-4">
        <label htmlFor="feature-tab-select" className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ar' ? 'اختر التاب للميزة:' : 'Select Tab for Feature:'}
        </label>
        <select
          id="feature-tab-select"
          value={newFeature.tab_index}
          onChange={(e) => setNewFeature({ ...newFeature, tab_index: parseInt(e.target.value) })}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto"
        >
          {tabTitles.map((title, index) => (
            <option key={index} value={index}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mb-6">
        <input
          placeholder={language === 'ar' ? 'أيقونة (مثال: ✔️)' : 'Icon (e.g., ✔️)'}
          value={newFeature.icon}
          onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
          className="border border-gray-300 p-2 rounded-md w-full md:w-24"
        />
        <input
          placeholder={language === 'ar' ? 'نص الميزة' : 'Feature Text'}
          value={newFeature.text}
          onChange={(e) => setNewFeature({ ...newFeature, text: e.target.value })}
          className="border border-gray-300 p-2 rounded-md flex-1"
        />
        <button
          onClick={handleAddFeature}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 ease-in-out shadow-md"
          disabled={loading}
        >
          {language === 'ar' ? '➕ إضافة ميزة' : '➕ Add Feature'}
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="view-features-tab-select" className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'ar' ? 'عرض مميزات التاب:' : 'View Features for Tab:'}
        </label>
        <select
          id="view-features-tab-select"
          value={selectedAdminTab}
          onChange={(e) => setSelectedAdminTab(parseInt(e.target.value))}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto"
        >
          {tabTitles.map((title, index) => (
            <option key={index} value={index}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {filteredAdminFeatures.length === 0 ? (
        <p className="text-gray-600 text-center mt-4">
          {language === 'ar' ? 'لا توجد مميزات لهذا التاب بعد.' : 'No features for this tab yet.'}
        </p>
      ) : (
        <ul className="space-y-3 mt-4">
          {filteredAdminFeatures.map((feature) => (
            <li
              key={feature.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm"
            >
              <span className="text-gray-800">
                <span className="font-semibold">{feature.icon}</span> {feature.text}
              </span>
              <button
                onClick={() => handleDeleteFeature(feature.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md transition duration-300"
                disabled={loading}
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminFeatures;