import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  // تم تعديل اللغة الافتراضية إلى 'ar' كما كانت في الكود الأصلي، وتأكد من وجودها في النموذج
  const [form, setForm] = useState({ title: '', description: '', icon: '', language: 'ar' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // التحقق من التوكن عند تحميل المكون
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      // عند التحميل الأولي، جلب الخدمات باللغة الافتراضية (العربية)
      fetchServices(form.language); 
    }
  }, [navigate, form.language]); // أضف form.language إلى التبعيات لإعادة الجلب عند تغيير اللغة

  // دالة لجلب الخدمات بناءً على اللغة المحددة
  const fetchServices = async (lang) => {
    setLoading(true);
    try {
      // استخدام اللغة الممررة للدالة
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services?lang=${lang}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setServices(response.data);
      setError('');
    } catch (err) {
      console.error("Error fetching services:", err);
      setError('فشل تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.title || !form.description) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    try {
      // إرسال اللغة المختارة من النموذج
      await axios.post('${import.meta.env.VITE_API_URL}/api/services', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('تمت الإضافة بنجاح! ✅');
      setError('');
      // إعادة تعيين النموذج واللغة إلى الافتراضي بعد الإضافة
      setForm({ title: '', description: '', icon: '', language: form.language }); 
      fetchServices(form.language); // إعادة جلب الخدمات للغة الحالية
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error adding service:", err);
      setError('فشل إضافة الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('تم الحذف بنجاح! ✅');
      setError('');
      fetchServices(form.language); // إعادة جلب الخدمات للغة الحالية
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error deleting service:", err);
      setError('فشل حذف الخدمة');
    } finally {
      setLoading(false);
    }
  };

  // إغلاق الشريط الجانبي عند النقر خارج نطاقه على الهواتف
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
      {/* Sidebar */}
   

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
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
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">إدارة الخدمات</h2>
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
            {/* حقل اختيار اللغة */}
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
              name="title"
              placeholder="العنوان"
              value={form.title}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="icon"
              placeholder="رابط الأيقونة (اختياري)"
              value={form.icon}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <textarea
              name="description"
              placeholder="الوصف"
              value={form.description}
              onChange={handleChange}
              className="p-4 border border-gray-200 rounded-lg w-full h-32 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-shadow duration-200 hover:shadow-md"
            />
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
          </div>

          <hr className="my-6 border-gray-200" />

          <ul className="space-y-4">
            {services.length === 0 && !error && !loading ? (
              <p className="text-gray-600 text-center">لا توجد خدمات متاحة حاليًا</p>
            ) : (
              services.map((service) => (
                <li
                  key={service.id}
                  className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                    {service.icon && (
                      <img
                        src={service.icon}
                        alt={`${service.title} icon`}
                        className="w-12 mt-2 rounded"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                    disabled={loading}
                  >
                    🗑 حذف
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
