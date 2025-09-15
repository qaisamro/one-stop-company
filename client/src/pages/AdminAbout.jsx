import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api/axiosConfig'; // Updated import: use named import

const AdminAbout = () => {
  const { i18n, t } = useTranslation();
  const [formData, setFormData] = useState({
    title_small: '',
    title_main: '',
    description: '',
    image_file: null,
    current_image_url: null,
    delete_image: false,
    experience_year: '',
    experience_text: '',
    button_text: '',
    button_url: '',
    blocks: [],
    features: [],
  });
  const [lang, setLang] = useState(i18n.language || 'en');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Unified function to handle messages (success/error)
  const showMessage = useCallback((msg, type = 'success') => {
    if (type === 'success') {
      setMessage(msg);
      setError('');
    } else {
      setError(msg);
      setMessage('');
    }
    const timer = setTimeout(() => {
      setMessage('');
      setError('');
    }, 5000); // Messages disappear after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      showMessage(t('auth_token_missing', 'Authentication token missing. Please log in again.'), 'error');
      setLoading(false);
      navigate('/admin/login');
      return false;
    }
    return token;
  }, [navigate, t, showMessage]);

  const fetchContent = useCallback(async () => {
    const token = checkAuth();
    if (!token) return;

    setLoading(true);
    try {
      // Use axiosInstance for API calls
      const response = await axiosInstance.get(`/api/about?lang=${lang}`);

      const data = response.data || {};
      setFormData({
        title_small: data.title_small || '',
        title_main: data.title_main || '',
        description: data.description || '',
        image_file: null,
        current_image_url: data.image_url || null,
        delete_image: false,
        experience_year: data.experience_year || '',
        experience_text: data.experience_text || '',
        button_text: data.button_text || '',
        button_url: data.button_url || '',
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
        features: Array.isArray(data.features) ? data.features : [],
      });
      setImagePreview(data.image_url || '');
    } catch (err) {
      console.error('Error fetching about content:', err);
      if (err.response?.status === 401) {
        showMessage(t('unauthorized', 'Unauthorized access. Please log in again.'), 'error');
        navigate('/admin/login');
      } else {
        showMessage(t('failed_to_load_content', 'Failed to load content: ') + (err.response?.data?.error || err.message), 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [lang, navigate, t, checkAuth, showMessage]);

  useEffect(() => {
    const token = checkAuth();
    if (token) {
      fetchContent();
    }
  }, [lang, fetchContent, checkAuth]);

  useEffect(() => {
    setLang(i18n.language || 'en');
  }, [i18n.language]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image_file: file,
        current_image_url: null,
        delete_image: false,
      }));
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(formData.current_image_url || '');
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClearImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_file: null,
      current_image_url: null,
      delete_image: true,
    }));
    setImagePreview('');
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

  const saveContent = async () => {
    const token = checkAuth();
    if (!token) return;

    setLoading(true);
    showMessage('');

    const data = new FormData();
    data.append('lang', lang);

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image_file' && value) {
        data.append('image_file', value);
      } else if (key === 'blocks' || key === 'features') {
        data.append(key, JSON.stringify(value));
      } else if (key === 'delete_image') {
        data.append('delete_image', value ? '1' : '0');
      } else if (key !== 'current_image_url' || (key === 'current_image_url' && value && !formData.delete_image)) {
        data.append(key, value || '');
      }
    });

    data.append('_method', 'PUT'); // Important for Laravel to treat POST as PUT

    try {
      // Use axiosInstance for API calls
      const response = await axiosInstance.post('/api/about', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showMessage(response.data.message || t('saved_successfully', '✅ Saved successfully!'));
      setFormData((prev) => ({
        ...prev,
        image_file: null,
        current_image_url: response.data.data.image_url || null,
        delete_image: false,
      }));
      setImagePreview(response.data.data.image_url || '');
      fetchContent();
    } catch (err) {
      console.error('Error saving about content:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        showMessage(t('unauthorized', 'Unauthorized access. Please log in again.'), 'error');
        navigate('/admin/login');
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors || {};
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        showMessage(t('validation_error', 'Validation error: ') + (errorMessages || err.response?.data?.error || t('invalid_data', 'Invalid data')), 'error');
      } else {
        showMessage(t('failed_to_save', 'Failed to save content: ') + (err.response?.data?.error || err.message), 'error');
      }
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
          aria-label={t('open_sidebar', 'Open sidebar')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-2xl mx-auto transition-all duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">{t('edit_about_section', 'Edit About Us Section')}</h2>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p>{t('loading', 'Loading...')}</p>
            </div>
          )}
          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
          )}
          {message && (
            <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
          )}
          <div className="mb-4">
            <label htmlFor="lang-select" className="block text-gray-700 text-sm font-bold mb-2">{t('language', 'Language')}:</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                i18n.changeLanguage(e.target.value);
              }}
              className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title_small" className="block text-gray-700 text-sm font-bold mb-2">{t('small_title', 'Small Title')}:</label>
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
              <label htmlFor="title_main" className="block text-gray-700 text-sm font-bold mb-2">{t('main_title', 'Main Title')}:</label>
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
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">{t('description', 'Description')}:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 resize-y"
              />
            </div>
            <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
              <label htmlFor="image_file" className="block text-gray-700 text-sm font-bold mb-2">{t('main_section_image', 'Main Section Image')}:</label>
              {imagePreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{t('image_preview', 'Image Preview')}:</p>
                  <img src={imagePreview} alt={t('current_about_image', 'Current About Image')} className="max-w-xs h-auto rounded-lg shadow-md" />
                  <button
                    onClick={handleClearImage}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    {t('clear_image', 'Clear Image')}
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image_file"
                name="image_file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleChange}
                className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">{t('max_file_size', 'Maximum size 5MB (JPG, PNG, GIF)')}</p>
            </div>
            <div>
              <label htmlFor="experience_year" className="block text-gray-700 text-sm font-bold mb-2">{t('experience_year', 'Experience Year')}:</label>
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
              <label htmlFor="experience_text" className="block text-gray-700 text-sm font-bold mb-2">{t('experience_text', 'Experience Text')}:</label>
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
              <label htmlFor="button_text" className="block text-gray-700 text-sm font-bold mb-2">{t('learn_more_button_text', 'Learn More Button Text')}:</label>
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
              <label htmlFor="button_url" className="block text-gray-700 text-sm font-bold mb-2">{t('learn_more_button_url', 'Learn More Button URL')}:</label>
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
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('manage_content_blocks', 'Manage Content Blocks ("About Us")')}</h3>
            {formData.blocks.map((block, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">{t('block', 'Block')} #{index + 1}</h4>
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
                    {t('block_title', 'Block Title')}:
                  </label>
                  <textarea
                    id={`block_title_${index}`}
                    name="block_title"
                    value={block.block_title || ''}
                    onChange={(e) => handleBlockChange(index, e)}
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-y"
                    placeholder={t('enter_block_title', 'Enter block title here...')}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`block_description_${index}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    {t('block_description', 'Block Description (Optional)')}:
                  </label>
                  <textarea
                    id={`block_description_${index}`}
                    name="block_description"
                    value={block.block_description || ''}
                    onChange={(e) => handleBlockChange(index, e)}
                    className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-y"
                    placeholder={t('enter_block_description', 'Enter block description here (optional)...')}
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
              {t('add_new_block', 'Add New Block')}
            </button>
          </div>
          <div className="mt-8 border-t pt-6 border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('manage_features', 'Manage Features (for "Our Philosophy and Commitment")')}</h3>
            {formData.features.map((feature, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">{t('feature', 'Feature')} #{index + 1}</h4>
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
                    {t('feature_title', 'Feature Title')}:
                  </label>
                  <input
                    type="text"
                    id={`feature_title_${index}`}
                    name="title"
                    value={feature.title || ''}
                    onChange={(e) => handleFeatureChange(index, e)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                    placeholder={t('enter_feature_title', 'Enter feature title here...')}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`feature_description_${index}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    {t('feature_description', 'Feature Description')}:
                  </label>
                  <textarea
                    id={`feature_description_${index}`}
                    name="description"
                    value={feature.description || ''}
                    onChange={(e) => handleFeatureChange(index, e)}
                    className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-y"
                    placeholder={t('enter_feature_description', 'Enter feature description here...')}
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
              {t('add_new_feature', 'Add New Feature')}
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
                <span>{t('saving', 'Saving...')}</span>
              </div>
            ) : (
              t('save', 'Save')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;