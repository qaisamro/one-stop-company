import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// General Page Components
import Header from './components/Header';
import AboutDetails from './components/AboutDetails';
import BlogsSection from './components/BlogsSection';
import BlogDetailPage from './components/BlogDetailPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import Footer from './components/Footer';

// Import the Home component
import Home from './pages/Home';

// Admin Pages
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

// Layout component for public pages
const PublicLayout = ({ showScrollToTop, scrollToTop, activeSection, setActiveSection }) => (
  <>
    <Header activeSection={activeSection} setActiveSection={setActiveSection} />
    <Outlet />
    <Footer />
    {showScrollToTop && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#3C4196] hover:bg-[#2f337a] text-[#F4EB27] p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 ease-in-out z-50 transform scale-0 opacity-0 animate-scale-in"
        aria-label="Scroll to top"
      >
        <FaArrowUp className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
      </button>
    )}
  </>
);

function App() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
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
          <Route element={<PublicLayout showScrollToTop={showScrollToTop} scrollToTop={scrollToTop} activeSection={activeSection} setActiveSection={setActiveSection} />}>
            <Route path="/" element={<Home setActiveSection={setActiveSection} />} />
            <Route
              path="/about-details"
              element={
                <main className="pt-24 md:pt-32 p-4 md:p-0 space-y-10 min-h-screen bg-gradient-to-br from-sky-50 to-white dark:from-gray-950 dark:to-gray-800">
                  <AboutDetails />
                </main>
              }
            />
            <Route path="/blogs" element={<BlogsSection />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
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
            <Route path="/admin/story" element={<AdminStory />} />

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
          </Route>
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;