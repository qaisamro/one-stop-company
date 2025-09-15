import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', icon: '', language: 'ar' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    const [editingServiceId, setEditingServiceId] = useState(null); // جديد: لتتبع معرف الخدمة التي يتم تعديلها

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        } else {
            // لا حاجة لجلب CSRF token هنا، تم إزالته
            fetchServices(form.language);
        }
    }, [navigate, form.language]);

    const fetchServices = async (lang) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://one-stop.ps/api/services?lang=${lang}`, {
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

    // وظيفة لتعبئة النموذج عند النقر على "تعديل"
    const handleEditClick = (service) => {
        setForm({
            title: service.title,
            description: service.description,
            icon: service.icon || '',
            language: service.language, // تعبئة حقل اللغة أيضًا
        });
        setEditingServiceId(service.id); // تعيين معرف الخدمة التي يتم تعديلها
        setError('');
        setMessage('');
    };

    const handleSave = async () => {
        if (!form.title || !form.description) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        setLoading(true);
        try {
            if (editingServiceId) {
                // إذا كان هناك معرف خدمة للتعديل، أرسل طلب PUT مباشرة
                await axios.put(`https://one-stop.ps/api/services/${editingServiceId}`, form, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setMessage('تم التحديث بنجاح! ✅');
            } else {
                // إذا لم يكن هناك معرف خدمة، أرسل طلب POST للإضافة
                await axios.post('https://one-stop.ps/api/services', form, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setMessage('تمت الإضافة بنجاح! ✅');
            }
            setError('');
            // إعادة تعيين النموذج بعد الحفظ، مع الحفاظ على اللغة المختارة
            setForm({ title: '', description: '', icon: '', language: form.language });
            setEditingServiceId(null); // مسح حالة التعديل
            fetchServices(form.language); // إعادة جلب الخدمات للغة الحالية
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Error saving service:", err.response || err); // سجل استجابة الخطأ الكاملة
            setError(`فشل ${editingServiceId ? 'تحديث' : 'إضافة'} الخدمة: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://one-stop.ps/api/services/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMessage('تم الحذف بنجاح! ✅');
            setError('');
            fetchServices(form.language); // إعادة جلب الخدمات للغة الحالية
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Error deleting service:", err.response || err);
            setError(`فشل حذف الخدمة: ${err.response?.data?.message || err.message}`);
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
                            onClick={handleSave}
                            className="bg-green-600 text-white py-3 px-6 rounded-lg w-full hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>{editingServiceId ? 'جار التحديث...' : 'جار الإضافة...'}</span>
                                </div>
                            ) : (
                                editingServiceId ? 'تحديث' : 'إضافة' // تغيير نص الزر بناءً على حالة التعديل
                            )}
                        </button>
                        {editingServiceId && (
                            <button
                                onClick={() => {
                                    setEditingServiceId(null);
                                    setForm({ title: '', description: '', icon: '', language: form.language });
                                    setError('');
                                    setMessage('');
                                }}
                                className="bg-gray-500 text-white py-3 px-6 rounded-lg w-full hover:bg-gray-600 transition-colors duration-200 mt-2 shadow-md hover:shadow-lg"
                            >
                                إلغاء التعديل
                            </button>
                        )}
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <ul className="space-y-4">
                        {services.length === 0 && !error && !loading ? (
                            <p className="text-gray-600 text-center">لا توجد خدمات متاحة حاليًا لهذه اللغة.</p>
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
                                        <span className="text-xs text-gray-500 mt-1 block">اللغة: {service.language.toUpperCase()}</span> {/* عرض اللغة هنا */}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(service)} // زر التعديل الجديد
                                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                        >
                                            ✏️ تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
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

export default AdminServices;