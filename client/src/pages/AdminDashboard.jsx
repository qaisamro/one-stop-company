// src/pages/AdminDashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location]);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login/J89Li7iBorOS8cBMrPJEmAi10fy66gczWWeIxsv4uCJ4JJqWOFbnXuyTE4gTkeQKe7lF2DT8KNZWD7750rVF8w==');
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-row-reverse font-sans">
            {/* الشريط الجانبي */}
            <div
                ref={sidebarRef}
 style={{ height: '100%' }}
  className={`${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:static fixed md:translate-x-0 top-0 right-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col`}            >
                {/* زر إغلاق الشريط الجانبي (يظهر فقط على الشاشات الصغيرة) */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden absolute top-4 left-4 text-white hover:text-gray-300 focus:outline-none"
                    aria-label="إغلاق الشريط الجانبي"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-2xl font-bold mb-8 tracking-tight">لوحة التحكم</h2>
                
                <nav className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-3">
                        <button onClick={() => navigate('/admin/dashboard')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">🏠</span> لوحة التحكم الرئيسية
                        </button>
                        <button onClick={() => navigate('/admin/company-intro')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">🏢</span> إدارة مقدمة الشركة
                        </button>
                        <button onClick={() => navigate('/admin/story')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">📖</span> إدارة قصة الشركة
                        </button>
                        <button onClick={() => navigate('/admin/about')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">✏️</span> تعديل "من نحن"
                        </button>
                        <button onClick={() => navigate('/admin/services')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">🛠️</span> إدارة الخدمات
                        </button>
                        <button onClick={() => navigate('/admin/statistics')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">📊</span> إدارة الإحصائيات
                        </button>
                        <button onClick={() => navigate('/admin/team')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">👥</span> إدارة الفريق
                        </button>
                        <button onClick={() => navigate('/admin/certificates')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">🏆</span> إدارة الشهادات
                        </button>
                        <button onClick={() => navigate('/admin/blogs')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">📰</span> إدارة المدونات
                        </button>
                        <button onClick={() => navigate('/admin/messages')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">✉️</span> إدارة الرسائل
                        </button>
                        <button onClick={() => navigate('/admin/projects')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">📂</span> إدارة المشاريع
                        </button>
                        <button onClick={() => navigate('/admin/csr')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">🌍</span> إدارة CSR
                        </button>
                        <button onClick={() => navigate('/admin/why-choose-us')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">❓</span> إدارة Why Choose Us?
                        </button>
                        {/* -------------------- زر إدارة الصور الجديد -------------------- */}
                        <button onClick={() => navigate('/admin/gallery')} className="w-full text-right py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors duration-200">
                            <span className="text-lg">🖼️</span> إدارة معرض الصور
                        </button>
                    </div>

                    {/* زر تسجيل الخروج */}
                    <button onClick={handleLogout} className="w-full text-right py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-3 transition-colors duration-200 mt-4">
                        <span className="text-lg">🚪</span> تسجيل الخروج
                    </button>
                </nav>
            </div>

            {/* Overlay للخلفية عند فتح الشريط الجانبي على الشاشات الصغيرة */}
            {isSidebarOpen && window.innerWidth < 768 && (
                <div className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40 transition-opacity duration-300" onClick={toggleSidebar}></div>
            )}

            {/* منطقة المحتوى الرئيسية */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden mb-6 text-gray-700 focus:outline-none p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors float-left"
                    aria-label="فتح الشريط الجانبي"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="clear-both"></div>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminDashboard;