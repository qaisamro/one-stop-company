import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { FaArrowUp, FaImages, FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// (بقية الاستيرادات كما هي)
import Header from './components/Header';
import AboutDetails from './components/AboutDetails';
import BlogsSection from './components/BlogsSection';
import BlogDetailPage from './components/BlogDetailPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import CsrDetailPage from './components/CsrDetailPage';

import Footer from './components/Footer';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAbout from './pages/AdminAbout';
import AdminServices from './pages/AdminServices';
import AdminStatistics from './pages/AdminStatistics';
import AdminTeam from './pages/AdminTeam';
import AdminCertificates from './pages/AdminCertificates';
import AdminBlogs from './pages/AdminBlogs';
import AdminMessages from './pages/AdminMessages';
import AdminCompanyIntro from './pages/AdminCompanyIntro';
import AdminHeader from './pages/AdminHeader';
import AdminProjects from './pages/AdminProjects';
import AdminFeatures from './pages/AdminFeatures';
import AdminStory from './pages/AdminStory';
import AdminCSR from './pages/AdminCSR';
import AdminGallery from './pages/AdminGallery'; // تم تصحيح الاستيراد
import GalleryPage from './components/GalleryPage';

// Layout component for public pages
const PublicLayout = ({ showScrollToTop, scrollToTop, activeSection, setActiveSection, showGalleryButton }) => {
    const location = useLocation();
    const [isSocialOpen, setIsSocialOpen] = useState(false);
    const colors = { yellow: '#F4EB27' };

    // **التعديل هنا: استخدام useEffect لتمرير الصفحة للأعلى عند تغيير المسار**
    useEffect(() => {
        // لا تنفذ التمرير إذا كان هناك هاش في المسار (#)
        if (!location.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.pathname, location.hash]);

    // Hide the gallery button on the gallery page itself to prevent redundancy
    const shouldShowGalleryButton = showGalleryButton && location.pathname !== '/gallery';

    return (
        <>
            <Header activeSection={activeSection} setActiveSection={setActiveSection} />
            <Outlet />
            <Footer />

            {/* زر العودة للأعلى */}
            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#3C4196] hover:bg-[#2f337a] text-[#F4EB27] p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 ease-in-out z-50 transform scale-0 opacity-0 animate-scale-in"
                    aria-label="Scroll to top"
                >
                    <FaArrowUp className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </button>
            )}

            {/* زر معرض الصور الجديد */}
            {shouldShowGalleryButton && (
                <Link to="/gallery"
                    className="fixed bottom-24 right-6 md:bottom-28 md:right-8 bg-[#3C4196] hover:bg-[#2f337a] text-[#F4EB27] p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ease-in-out z-50 animate-scale-in"
                    aria-label="View gallery">
                    <FaImages className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
            )}

            {/* زر ومواقع التواصل الاجتماعي الجديد على الجهة اليسرى */}
            <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50">
                {/* Main button */}
                <button
                    onClick={() => setIsSocialOpen(!isSocialOpen)}
                    className="bg-[#F4EB27] hover:bg-[#F4EB27] text-[#3C4196] p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-110"
                    aria-label="Social media"
                >
                    <FaGlobe className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Social media icons container */}
                <div className={`absolute bottom-14 left-0 transition-all duration-500 ease-in-out ${isSocialOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-5'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex gap-5 text-2xl">
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/1StopCompany"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform duration-200"
                                onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                aria-label="Facebook"
                            >
                                <FaFacebook />
                            </a>
                            {/* Instagram */}
                            <a
                                href="https://instagram.com/one_stop_company1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform duration-200"
                                onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                aria-label="Instagram"
                            >
                                <FaInstagram />
                            </a>
                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/company/1stopcompany"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform duration-200"
                                onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin />
                            </a>
                            {/* TikTok */}
                            <a
                                href="https://tiktok.com/@one_stop_company"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform duration-200"
                                onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                aria-label="TikTok"
                            >
                                <FaTiktok />
                            </a>
                            {/* WhatsApp */}
                            <a
                                href="https://api.whatsapp.com/send?phone=972569901416"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform duration-200"
                                onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                                aria-label="WhatsApp"
                            >
                                <FaWhatsapp />
                            </a>
                        </div>
                        
                        {/* Close button */}
                        <button 
                            onClick={() => setIsSocialOpen(false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                            aria-label="Close social media menu"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

function App() {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [activeSection, setActiveSection] = useState('/');
    const [showGalleryButton, setShowGalleryButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > 300);
            setShowGalleryButton(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <I18nextProvider i18n={i18n}>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route
                        element={<PublicLayout
                            showScrollToTop={showScrollToTop}
                            scrollToTop={scrollToTop}
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                            showGalleryButton={showGalleryButton}
                        />}
                    >
                        <Route path="/" element={<Home setActiveSection={setActiveSection} />} />
                        <Route path="/about-details" element={
                            <main className="pt-24 md:pt-32 p-4 md:p-0 space-y-10 min-h-screen bg-gradient-to-br from-sky-50 to-white dark:from-gray-950 dark:to-gray-800">
                                <AboutDetails />
                            </main>
                        } />
                        <Route path="/blogs" element={<BlogsSection />} />
                        <Route path="/blogs/:id" element={<BlogDetailPage />} />
                        <Route path="/projects/:id" element={<ProjectDetailPage />} />
                        <Route path="/gallery" element={<GalleryPage />} />
                        <Route path="/csr/:id" element={<CsrDetailPage />} />
                    </Route>

                    {/* Admin routes */}
                    <Route path="/admin/login/J89Li7iBorOS8cBMrPJEmAi10fy66gczWWeIxsv4uCJ4JJqWOFbnXuyTE4gTkeQKe7lF2DT8KNZWD7750rVF8w==" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminDashboard />}>
                        <Route
                            index
                            element={
                                <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-md mx-auto text-center transition-all duration-300">
                                    <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">لوحة تحكم الأدمن</h1>
                                    <p className="text-gray-600 mb-6">اختر خيارًا من الشريط الجانبي لإدارة المحتوى.</p>
                                </div>
                            }
                        />
                        <Route
                            path="dashboard"
                            element={
                                <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-md mx-auto text-center transition-all duration-300">
                                    <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">لوحة تحكم الأدمن</h1>
                                    <p className="text-gray-600 mb-6">مرحباً بك في لوحة تحكم الأدمن! استخدم الشريط الجانبي للتنقل.</p>
                                </div>
                            }
                        />
                        <Route path="company-intro" element={<AdminCompanyIntro />} />
                        <Route path="story" element={<AdminStory />} />
                        <Route path="about" element={<AdminAbout />} />
                        <Route path="services" element={<AdminServices />} />
                        <Route path="statistics" element={<AdminStatistics />} />
                        <Route path="team" element={<AdminTeam />} />
                        <Route path="certificates" element={<AdminCertificates />} />
                        <Route path="blogs" element={<AdminBlogs />} />
                        <Route path="messages" element={<AdminMessages />} />
                        <Route path="header" element={<AdminHeader />} />
                        <Route path="projects" element={<AdminProjects />} />
                        <Route path="why-choose-us" element={<AdminFeatures />} />
                        <Route path="csr" element={<AdminCSR />} />
                        <Route path="gallery" element={<AdminGallery />} />
                    </Route>
                </Routes>
            </Router>
        </I18nextProvider>
    );
}

export default App;