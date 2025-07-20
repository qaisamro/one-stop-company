import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminStatistics = () => {
  const [stats, setStats] = useState([]);
  const [form, setForm] = useState({ label: '', value: '', icon: '', language: 'en' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // مغلق افتراضيًا على الهواتف
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // التحقق من التوكن
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchStats();
    }
  }, [form.language, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/statistics?lang=${form.language}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('فشل تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await axios.post('${process.env.REACT_APP_API_URL}/api/statistics', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('تمت الإضافة بنجاح! ✅');
      setError('');
      setForm({ ...form, label: '', value: '', icon: '' });
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('فشل إضافة الإحصائية');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/statistics/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('تم الحذف بنجاح! ✅');
      setError('');
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('فشل حذف الإحصائية');
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
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">إدارة الإحصائيات</h2>
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
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            <input
              name="label"
              placeholder="الاسم (مثلاً: المشاريع)"
              value={form.label}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="value"
              placeholder="العدد"
              value={form.value}
              onChange={handleChange}
              type="number"
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="icon"
              placeholder="رابط الأيقونة (اختياري)"
              value={form.icon}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
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
            {stats.length === 0 && !error && !loading ? (
              <p className="text-gray-600 text-center">لا توجد إحصائيات متاحة حاليًا</p>
            ) : (
              stats.map((stat) => (
                <li
                  key={stat.id}
                  className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{stat.label}</h3>
                    <p className="text-xl text-gray-600">{stat.value}</p>
                    {stat.icon && (
                      <img
                        src={stat.icon}
                        alt={`${stat.label} icon`}
                        className="w-8 mt-2 rounded"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(stat.id)}
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

export default AdminStatistics;