import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({ title: '', issuer: '', year: '', link: '', image: null, language: 'ar' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [editingCertId, setEditingCertId] = useState(null); // State to hold the ID of the certificate being edited

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchCertificates();
    }
  }, [form.language, navigate]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://one-stop-company-1.onrender.com/api/certificates?lang=${form.language}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCertificates(response.data);
      setError('');
    } catch (err) {
      setError('فشل تحميل الشهادات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleAdd = async () => {
    if (!form.title || !form.issuer || !form.image) {
      setError('يرجى ملء جميع الحقول المطلوبة (العنوان، الجهة المانحة، والصورة).');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('issuer', form.issuer);
    if (form.year) formData.append('year', form.year);
    if (form.link) formData.append('link', form.link);
    formData.append('image', form.image);
    formData.append('language', form.language);

    try {
      await axios.post('https://one-stop-company-1.onrender.com/api/certificates', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('تمت الإضافة بنجاح! ✅');
      setError('');
      setForm({ title: '', issuer: '', year: '', link: '', image: null, language: form.language });
      fetchCertificates();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding certificate:', err);
      setError(err.response?.data?.error || 'فشل إضافة الشهادة');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert) => {
    setEditingCertId(cert.id);
    // When setting form for editing, set image to null if it's a URL, as it expects a File object for new upload
    // Or you can store the existing image URL in a separate state if you want to display it
    setForm({
      title: cert.title,
      issuer: cert.issuer,
      year: cert.year || '', // Handle null year
      link: cert.link || '', // Handle null link
      image: null, // Image will be handled by re-upload
      language: cert.language
    });
  };

  const handleUpdate = async () => {
    if (!form.title || !form.issuer) {
      setError('يرجى ملء جميع الحقول المطلوبة (العنوان والجهة المانحة).');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('issuer', form.issuer);
    if (form.year) formData.append('year', form.year);
    if (form.link) formData.append('link', form.link);
    if (form.image) formData.append('image', form.image); // Only append if a new image is selected
    formData.append('language', form.language);

    try {
      await axios.put(`https://one-stop-company-1.onrender.com/api/certificates/${editingCertId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('تم التحديث بنجاح! ✅');
      setError('');
      setForm({ title: '', issuer: '', year: '', link: '', image: null, language: form.language });
      setEditingCertId(null); // Clear editing state
      fetchCertificates();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating certificate:', err);
      setError(err.response?.data?.error || 'فشل تحديث الشهادة');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.delete(`https://one-stop-company-1.onrender.com/api/certificates/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('تم الحذف بنجاح! ✅');
      setError('');
      fetchCertificates();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError(err.response?.data?.error || 'فشل حذف الشهادة');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex font-sans">

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

        <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto transition-all duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">
            {editingCertId ? 'تعديل الشهادة' : 'إدارة الشهادات'}
          </h2>
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

          <div className="space-y-4">
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
            <input
              name="title"
              placeholder="عنوان الشهادة"
              value={form.title}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="issuer"
              placeholder="الجهة المانحة"
              value={form.issuer}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              type="number"
              name="year"
              placeholder="سنة الإصدار (اختياري)"
              value={form.year}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              type="url"
              name="link"
              placeholder="رابط التحميل/العرض (اختياري)"
              value={form.link}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            {form.image && typeof form.image === 'object' && (
              <div className="mt-2 text-center">
                <p className="text-gray-600">معاينة الصورة المحددة:</p>
                <img
                  src={URL.createObjectURL(form.image)}
                  alt="معاينة الصورة"
                  className="w-32 h-32 object-contain mx-auto rounded"
                />
              </div>
            )}
            {/* Display current image if in edit mode and no new image is selected */}
            {editingCertId && !form.image && (
              <div className="mt-2 text-center">
                <p className="text-gray-600">الصورة الحالية:</p>
                <img
                  src={certificates.find(c => c.id === editingCertId)?.image}
                  alt="الصورة الحالية"
                  className="w-32 h-32 object-contain mx-auto rounded"
                />
              </div>
            )}

            {editingCertId ? (
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>جار التحديث...</span>
                  </div>
                ) : (
                  'تحديث'
                )}
              </button>
            ) : (
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white py-3 px-6 rounded-lg w-full hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>جار الإضافة...</span>
                  </div>
                ) : (
                  'إضافة'
                )}
              </button>
            )}
            {editingCertId && (
              <button
                onClick={() => {
                  setEditingCertId(null);
                  setForm({ title: '', issuer: '', year: '', link: '', image: null, language: form.language }); // Clear form
                  setError('');
                  setMessage('');
                }}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg w-full hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                إلغاء التعديل
              </button>
            )}
          </div>

          <hr className="my-6 border-gray-200" />

          <ul className="space-y-4">
            {certificates.length === 0 && !error && !loading ? (
              <p className="text-gray-600 text-center">لا يوجد شهادات حاليًا</p>
            ) : (
              certificates.map((cert) => (
                <li
                  key={cert.id}
                  className="border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-grow mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-800">{cert.title}</h3>
                    <p className="text-gray-700 text-sm">الجهة: {cert.issuer}</p>
                    {cert.year && <p className="text-gray-600 text-xs">السنة: {cert.year}</p>}
                    {cert.image && (
                      <img
                        src={cert.image}
                        alt={`${cert.title} photo`}
                        className="w-24 mt-2 rounded"
                      />
                    )}
                    {cert.link && (
                      <a 
                        href={cert.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline text-sm mt-2 block"
                      >
                        عرض الرابط
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => handleEdit(cert)}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      disabled={loading}
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
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

export default AdminCertificates;