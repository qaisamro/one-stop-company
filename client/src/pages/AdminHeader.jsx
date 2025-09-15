import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Removed: import { useTranslation } from 'react-i18next';

const AdminHeader = () => {
  // Removed: const { t } = useTranslation();
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({ id: null, label: '', href: '', language: 'ar', isSection: false, content: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchLinks();
    }
  }, [form.language, navigate]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://one-stop.ps/api/header?lang=${form.language}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLinks(response.data);
      setError('');
    } catch (err) {
      setError('خطأ في تحميل الروابط.'); // Hardcoded Arabic error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddLink = async () => {
    if (!form.label || !form.href) {
      setError('الاسم والرابط مطلوبان.'); // Hardcoded Arabic error
      return;
    }
    if (form.isSection && !form.content) {
      setError('المحتوى مطلوب للأقسام.'); // Hardcoded Arabic error
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'http://one-stop.ps/api/header',
        { label: form.label, href: form.href, language: form.language, isSection: form.isSection, content: form.isSection ? form.content : null },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('تم إضافة الرابط بنجاح!'); // Hardcoded Arabic message
      setError('');
      setForm({ ...form, id: null, label: '', href: '', isSection: false, content: '' });
      fetchLinks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('خطأ في إضافة الرابط.'); // Hardcoded Arabic error
    } finally {
      setLoading(false);
    }
  };

  const handleEditLink = (link) => {
    setForm({ id: link.id, label: link.label, href: link.href, language: form.language, isSection: link.isSection, content: link.content || '' });
  };

  const handleUpdateLink = async () => {
    if (!form.id || !form.label || !form.href) {
      setError('الاسم والرابط مطلوبان.'); // Hardcoded Arabic error
      return;
    }
    if (form.isSection && !form.content) {
      setError('المحتوى مطلوب للأقسام.'); // Hardcoded Arabic error
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `http://one-stop.ps/api/header/${form.id}`,
        { label: form.label, href: form.href, language: form.language, isSection: form.isSection, content: form.isSection ? form.content : null },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('تم تحديث الرابط بنجاح!'); // Hardcoded Arabic message
      setError('');
      setForm({ ...form, id: null, label: '', href: '', isSection: false, content: '' });
      fetchLinks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('خطأ في تحديث الرابط.'); // Hardcoded Arabic error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://one-stop.ps/api/header/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('تم حذف الرابط بنجاح!'); // Hardcoded Arabic message
      setError('');
      fetchLinks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('خطأ في حذف الرابط.'); // Hardcoded Arabic error
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
          className="md:hidden mb-6 text-gray-700 focus:outline-none p-3 bg-white rounded-full shadow-md"
          aria-label="فتح الشريط الجانبي"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto transition-all duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">إدارة الهيدر</h2>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p>جاري التحميل...</p>
            </div>
          )}
          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
          )}
          {message && (
            <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
          )}

          <div className="space-y-4">
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
            >
              <option value="ar">العربية</option>
              <option value="en">الإنجليزية</option>
            </select>
            <input
              name="label"
              placeholder="اسم الرابط"
              value={form.label}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="href"
              placeholder="رابط (Href)"
              value={form.href}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isSection"
                checked={form.isSection}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">إظهار كقسم</span>
            </label>
            {form.isSection && (
              <textarea
                name="content"
                placeholder="محتوى القسم"
                value={form.content}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                rows="5"
              />
            )}
            <button
              onClick={form.id ? handleUpdateLink : handleAddLink}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>{form.id ? 'جاري التحديث...' : 'جاري الإضافة...'}</span>
                </div>
              ) : (
                form.id ? 'تحديث الرابط' : 'إضافة رابط'
              )}
            </button>
          </div>

          <hr className="my-6 border-gray-200" />

          <ul className="space-y-4">
            {links.length === 0 && !error && !loading ? (
              <p className="text-gray-600 text-center">لا توجد روابط متاحة.</p>
            ) : (
              links.map((link) => (
                <li
                  key={link.id}
                  className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-800">{link.label}</p>
                    <p className="text-gray-600">{link.href}</p>
                    <p className="text-sm text-gray-500">
                      {link.isSection ? 'يظهر كقسم' : 'رابط فقط'}
                    </p>
                    {link.isSection && link.content && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">{link.content}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditLink(link)}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      disabled={loading}
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                      disabled={loading}
                    >
                      🗑 حذف
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;