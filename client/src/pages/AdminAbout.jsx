import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminAbout = () => {
  const [formData, setFormData] = useState({
    title_small: '',
    title_main: '',
    description: '',
    image_file: null,
    current_image_url: '',
    experience_year: '',
    experience_text: '',
    blocks: [],
    button_text: '',
    button_url: '',
    features: [], // New field for features
  });
  const [lang, setLang] = useState('en');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/about?lang=${lang}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const data = response.data || {};
      setFormData({
        title_small: data.title_small || '',
        title_main: data.title_main || '',
        description: data.description || '',
        image_file: null,
        current_image_url: data.image_url || '',
        experience_year: data.experience_year || '',
        experience_text: data.experience_text || '',
        blocks: data.blocks || [],
        button_text: data.button_text || '',
        button_url: data.button_url || '',
        features: data.features || [], // Initialize features from fetched data
      });
    } catch (err) {
      console.error('Error fetching about content:', err);
      setError('فشل تحميل المحتوى');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchContent();
    }
  }, [lang, navigate, fetchContent]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlockChange = (index, e) => {
    const { name, value } = e.target;
    const newBlocks = [...formData.blocks];
    newBlocks[index] = { ...newBlocks[index], [name]: value };
    setFormData((prev) => ({ ...prev, blocks: newBlocks }));
  };

  const addBlock = () => {
    setFormData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { block_title: '', block_description: '' }],
    }));
  };

  const removeBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
  };

  // --- Features Handlers ---
  const handleFeatureChange = (index, e) => {
    const { name, value } = e.target;
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [name]: value };
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { title: '', description: '' }],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };
  // --- End Features Handlers ---

  const saveContent = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    const data = new FormData();
    data.append('lang', lang);
    Object.keys(formData).forEach((key) => {
      if (key === 'image_file' && formData[key]) {
        data.append(key, formData[key]);
      } else if (key === 'blocks' || key === 'features') { // Ensure 'features' is stringified
        data.append(key, JSON.stringify(formData[key]));
      } else if (key !== 'current_image_url') {
        data.append(key, formData[key]);
      }
    });

    if (!formData.image_file && formData.current_image_url) {
      data.append('current_image_url', formData.current_image_url);
    }

    try {
      await axios.put('${process.env.REACT_APP_API_URL}/api/about', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('تم الحفظ بنجاح! ✅');
      setError('');
      fetchContent(); // Re-fetch to update current_image_url if a new image was uploaded
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving about content:', err);
      setError(err.response?.data?.error || 'فشل حفظ المحتوى');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen && window.innerWidth < 768) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-row-reverse font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <button
          onClick={toggleSidebar}
          className="md:hidden mb-6 text-gray-700 focus:outline-none p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label="فتح الشريط الجانبي"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-2xl mx-auto transition-all duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">تعديل قسم "من نحن"</h2>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p>جار التحميل...</p>
            </div>
          )}
          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
          )}
          {message && (
            <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
          )}
          <div className="mb-4">
            <label htmlFor="lang-select" className="block text-gray-700 text-sm font-bold mb-2">اللغة:</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title_small" className="block text-gray-700 text-sm font-bold mb-2">العنوان الصغير:</label>
              <input
                type="text"
                id="title_small"
                name="title_small"
                value={formData.title_small}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label htmlFor="title_main" className="block text-gray-700 text-sm font-bold mb-2">العنوان الرئيسي:</label>
              <input
                type="text"
                id="title_main"
                name="title_main"
                value={formData.title_main}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">الوصف:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 resize-y"
              />
            </div>
            <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
              <label htmlFor="image_file" className="block text-gray-700 text-sm font-bold mb-2">صورة القسم الرئيسية:</label>
              {formData.current_image_url && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">الصورة الحالية:</p>
                  <img src={formData.current_image_url} alt="Current About" className="max-w-xs h-auto rounded-lg shadow-md" />
                </div>
              )}
              <input
                type="file"
                id="image_file"
                name="image_file"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">الحد الأقصى للحجم 5 ميجابايت (JPG, PNG, GIF)</p>
            </div>
            <div>
              <label htmlFor="experience_year" className="block text-gray-700 text-sm font-bold mb-2">سنة الخبرة:</label>
              <input
                type="number"
                id="experience_year"
                name="experience_year"
                value={formData.experience_year}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label htmlFor="experience_text" className="block text-gray-700 text-sm font-bold mb-2">نص الخبرة:</label>
              <input
                type="text"
                id="experience_text"
                name="experience_text"
                value={formData.experience_text}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label htmlFor="button_text" className="block text-gray-700 text-sm font-bold mb-2">نص زر "تعرف على المزيد":</label>
              <input
                type="text"
                id="button_text"
                name="button_text"
                value={formData.button_text}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label htmlFor="button_url" className="block text-gray-700 text-sm font-bold mb-2">رابط زر "تعرف على المزيد":</label>
              <input
                type="text"
                id="button_url"
                name="button_url"
                value={formData.button_url}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
          </div>
          <div className="mt-8 border-t pt-6 border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">إدارة كتل المحتوى ("من نحن")</h3>
            {formData.blocks.map((block, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">الكتلة #{index + 1}</h4>
                  <button
                    onClick={() => removeBlock(index)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor={`block_title_${index}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    عنوان الكتلة:
                  </label>
                  <textarea
                    id={`block_title_${index}`}
                    name="block_title"
                    value={block.block_title}
                    onChange={(e) => handleBlockChange(index, e)}
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-y"
                    placeholder="أدخل عنوان الكتلة هنا..."
                  />
                </div>
                <div>
                  <label
                    htmlFor={`block_description_${index}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    وصف الكتلة (اختياري):
                  </label>
                  <textarea
                    id={`block_description_${index}`}
                    name="block_description"
                    value={block.block_description}
                    onChange={(e) => handleBlockChange(index, e)}
                    className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-y"
                    placeholder="أدخل وصف الكتلة هنا (اختياري)..."
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addBlock}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-4 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة كتلة جديدة
            </button>
          </div>
          {/* Features Section - Added */}
          <div className="mt-8 border-t pt-6 border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">إدارة المميزات (لصفحة "فلسفتنا والتزامنا")</h3>
            {formData.features.map((feature, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">الميزة #{index + 1}</h4>
                  <button
                    onClick={() => removeFeature(index)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor={`feature_title_${index}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    عنوان الميزة:
                  </label>
                  <input
                    type="text"
                    id={`feature_title_${index}`}
                    name="title" // Changed to 'title' to match feature object structure
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, e)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                    placeholder="أدخل عنوان الميزة هنا..."
                  />
                </div>
                <div>
                  <label
                    htmlFor={`feature_description_${index}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    وصف الميزة:
                  </label>
                  <textarea
                    id={`feature_description_${index}`}
                    name="description" // Changed to 'description'
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, e)}
                    className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-y"
                    placeholder="أدخل وصف الميزة هنا..."
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addFeature}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-4 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة ميزة جديدة
            </button>
          </div>
          <button
            onClick={saveContent}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-8"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>جار الحفظ...</span>
              </div>
            ) : (
              'حفظ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;