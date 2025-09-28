// src/pages/AdminDashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    // حالة الشريط الجانبي: مفتوح تلقائياً على الشاشات الكبيرة
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. التحقق من صلاحية الدخول (التوكن)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // 2. معالجة تغيير حجم الشاشة (فتح/إغلاق الشريط الجانبي عند تجاوز 768 بكسل)
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

    // 3. إغلاق الشريط الجانبي عند التنقل في وضع الجوال
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location]);

    // 4. منع تمرير الصفحة الرئيسية عند فتح الشريط الجانبي في وضع الجوال
    useEffect(() => {
        if (isSidebarOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    // 5. إغلاق الشريط الجانبي عند الضغط خارجه (في وضع الجوال)
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
    
    // المكوّن المساعد لزر التنقل (مع دعم RTL)
    const NavButton = ({ to, icon, text, target }) => (
        <button 
            onClick={() => {
                if (target === '_blank') {
                    window.open(to, '_blank');
                } else {
                    navigate(to);
                    if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                    }
                }
            }} 
            className="w-full text-right py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-3 flex-row-reverse transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 transform hover:translate-x-1"
        >
            <span className="text-xl">{icon}</span> 
            <span className="font-medium">{text}</span>
        </button>
    );

    return (
        // الشريط الأب: min-h-screen و flex
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-row-reverse font-sans">
            
            {/* الشريط الجانبي */}
            <div
                ref={sidebarRef}
                // الارتفاع: h-screen للجوال و md:min-h-screen للدسكتوب ليمتد مع المحتوى
                className={`${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:static fixed md:translate-x-0 top-0 right-0 w-64 bg-gradient-to-b from-[#07396a] to-[#052a4d] text-white p-6 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col h-screen md:h-auto md:min-h-screen`}
            >
                {/* زر إغلاق (ثابت) */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden absolute top-4 left-4 text-white hover:text-[#ffdd33] focus:outline-none shrink-0 transition-colors duration-200"
                    aria-label="إغلاق الشريط الجانبي"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* العنوان مع الشعار */}
                <div className="flex flex-col items-center mb-8 shrink-0 mt-4 md:mt-0">
                    <div className="w-16 h-16 rounded-full bg-[#ffffff] flex items-center justify-center mb-3 shadow-lg">
 <img
                                    src="/logo.svg"
                                    alt="One Stop Logo"
                                    className="w-10 h-10 transition-all duration-300 hover:scale-110"
                                    style={{ filter: 'drop-shadow(0 0 8px rgb(255, 255, 255))' }}
                                />                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-center">
                        <span className="text-white">لوحة تحكم</span>
                        <span className="block text-[#ffdd33] text-xl mt-1">ون ستوب</span>
                    </h2>
                </div>
                
                {/* قائمة التنقل: flex-1 لتأخذ المساحة المتبقية */}
                <nav className="flex-1 flex flex-col overflow-hidden">
                    {/* التمرير: flex-1 لأخذ المساحة المتبقية + overflow-y-auto لتمكين التمرير الداخلي */}
                    <div className="flex-1 overflow-y-auto space-y-3 pb-6 pr-2 custom-scrollbar">
                        <NavButton to="/" icon="🌐" text="الموقع الرسمي" target="_blank" />
                        <NavButton to="/admin/company-intro" icon="🏢" text="إدارة مقدمة الشركة" />
                        <NavButton to="/admin/story" icon="📖" text="إدارة قصة الشركة" />
                        <NavButton to="/admin/about" icon="✏️" text="تعديل &quot;من نحن&quot;" />
                        <NavButton to="/admin/services" icon="🛠️" text="إدارة الخدمات" />
                        <NavButton to="/admin/statistics" icon="📊" text="إدارة الإحصائيات" />
                        <NavButton to="/admin/team" icon="👥" text="إدارة الفريق" />
                        <NavButton to="/admin/certificates" icon="🏆" text="إدارة الشهادات" />
                        <NavButton to="/admin/blogs" icon="📰" text="إدارة المدونات" />
                        <NavButton to="/admin/messages" icon="✉️" text="إدارة الرسائل" />
                        <NavButton to="/admin/projects" icon="📂" text="إدارة المشاريع" />
                        <NavButton to="/admin/csr" icon="🌍" text="إدارة CSR" />
                        <NavButton to="/admin/why-choose-us" icon="❓" text="إدارة Why Choose Us?" />
                        <NavButton to="/admin/gallery" icon="🖼️" text="إدارة معرض الصور" />
                    </div>

                    {/* زر تسجيل الخروج (ثابت في الأسفل) */}
                    <button onClick={handleLogout} className="w-full text-right py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl flex items-center gap-3 flex-row-reverse transition-all duration-300 mt-2 shrink-0 shadow-lg hover:shadow-red-500/20">
                        <span className="text-xl">🚪</span> 
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </nav>
            </div>

            {/* Overlay للخلفية عند فتح الشريط الجانبي على الشاشات الصغيرة */}
            {isSidebarOpen && window.innerWidth < 768 && (
                <div className="fixed inset-0 bg-black/70 md:hidden z-40 transition-opacity duration-300 backdrop-blur-sm" onClick={toggleSidebar}></div>
            )}

            {/* منطقة المحتوى الرئيسية */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden mb-6 text-[#07396a] focus:outline-none p-3 bg-white rounded-full shadow-md hover:bg-[#ffdd33]/20 transition-colors float-left"
                    aria-label="فتح الشريط الجانبي"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="clear-both"></div>
                <Outlet />
            </div>

            {/* تخصيص شريط التمرير */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 221, 51, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 221, 51, 0.8);
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;