import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ activeSection, setActiveSection }) => {
    const { i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showHeader, setShowHeader] = useState(true);
    const [isMobileView, setIsMobileView] = useState(false);
    const location = useLocation();

    const itColors = {
        turquoise: '#218A7A',
        darkBlue: '#003366',
        yellow: '#FFDD33',
        white: '#FFFFFF',
    };

    const allLinksMobile = [
        { id: 17, label: 'الرئيسية', href: '/', language: 'ar', isSection: 0 },
        { id: 1, label: 'من نحن', href: '#about', language: 'ar', isSection: 1 },
        { id: 5, label: 'المشاريع', href: '#projects', language: 'ar', isSection: 1 },
        { id: 3, label: 'الخدمات', href: '#services', language: 'ar', isSection: 1 },
        { id: 4, label: 'الفريق', href: '#team', language: 'ar', isSection: 1 },
        { id: 6, label: 'الأخبار', href: '#blogs', language: 'ar', isSection: 1 },
        { id: 7, label: 'تواصل معنا', href: '#contact', language: 'ar', isSection: 1 },
        { id: 18, label: 'Home', href: '/', language: 'en', isSection: 0 },
        { id: 8, label: 'About Us', href: '#about', language: 'en', isSection: 1 },
        { id: 12, label: 'Projects', href: '#projects', language: 'en', isSection: 1 },
        { id: 10, label: 'Services', href: '#services', language: 'en', isSection: 1 },
        { id: 11, label: 'Team', href: '#team', language: 'en', isSection: 1 },
        { id: 13, label: 'Blogs', href: '#blogs', language: 'en', isSection: 1 },
        { id: 14, label: 'Contact Us', href: '#contact', language: 'en', isSection: 1 },
    ];

    const allLinksDesktop = [
        { id: 7, label: 'تواصل معنا', href: '#contact', language: 'ar', isSection: 1 },
        { id: 6, label: 'الأخبار', href: '#blogs', language: 'ar', isSection: 1 },
        { id: 5, label: 'المشاريع', href: '#projects', language: 'ar', isSection: 1 },
        { id: 4, label: 'الفريق', href: '#team', language: 'ar', isSection: 1 },
        { id: 3, label: 'الخدمات', href: '#services', language: 'ar', isSection: 1 },
        { id: 1, label: 'من نحن', href: '#about', language: 'ar', isSection: 1 },
        { id: 17, label: 'الرئيسية', href: '/', language: 'ar', isSection: 0 },
        { id: 18, label: 'Home', href: '/', language: 'en', isSection: 0 },
        { id: 8, label: 'About Us', href: '#about', language: 'en', isSection: 1 },
        { id: 10, label: 'Services', href: '#services', language: 'en', isSection: 1 },
        { id: 11, label: 'Team', href: '#team', language: 'en', isSection: 1 },
        { id: 12, label: 'Projects', href: '#projects', language: 'en', isSection: 1 },
        { id: 13, label: 'Blogs', href: '#blogs', language: 'en', isSection: 1 },
        { id: 14, label: 'Contact Us', href: '#contact', language: 'en', isSection: 1 },
    ];

    const currentAllLinks = isMobileView ? allLinksMobile : allLinksDesktop;
    const links = currentAllLinks.filter((link) => link.language === i18n.language);
    const homeLink = links.find(link => link.href === '/');
    const otherLinks = links.filter(link => link.href !== '/');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowHeader(false);
            } else if (currentScrollY < lastScrollY) {
                setShowHeader(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const handleScrollSection = () => {
            if (location.pathname !== '/') return;

            const sections = document.querySelectorAll('section[id]');
            let currentActiveSection = '/';

            sections.forEach((section) => {
                const sectionTop = section.offsetTop - window.innerHeight / 3;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                    currentActiveSection = `#${section.id}`;
                    if (section.id === 'company-intro') {
                        currentActiveSection = '/';
                    }
                }
            });

            if (activeSection !== currentActiveSection) {
                setActiveSection(currentActiveSection);
            }
        };

        window.addEventListener('scroll', handleScrollSection);
        handleScrollSection();

        return () => window.removeEventListener('scroll', handleScrollSection);
    }, [activeSection, setActiveSection, location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleLang = () => {
        i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
        if (isMenuOpen) setIsMenuOpen(false);
    };

    const isArabic = i18n.language === 'ar';
    const directionClass = isArabic ? 'rtl' : 'ltr';
    const textAlignmentClass = isArabic ? 'text-right' : 'text-left';

    // --- Custom logic for desktop link arrangement ---
    let leftLinks = [];
    let rightLinks = [];

    if (isArabic) {
        // For Arabic, maintain the current desktop arrangement
        // assuming it's already balanced or desired as is.
        const arabicLinks = links;
        const splitIndex = Math.floor(arabicLinks.length / 2);
        leftLinks = arabicLinks.slice(0, splitIndex);
        rightLinks = arabicLinks.slice(splitIndex);
    } else {
        // For English, explicitly define left and right links
        const englishLinks = links;
        const home = englishLinks.find(link => link.href === '/');
        const aboutUs = englishLinks.find(link => link.href === '#about');
        const services = englishLinks.find(link => link.href === '#services');
        const team = englishLinks.find(link => link.href === '#team');
        const projects = englishLinks.find(link => link.href === '#projects');
        const blogs = englishLinks.find(link => link.href === '#blogs');
        const contactUs = englishLinks.find(link => link.href === '#contact');

        // Assign links to left and right for English
        leftLinks = [
            home,
            aboutUs,
            services,
            team, // Team is explicitly placed on the left
        ].filter(Boolean); // Filter out any undefined if a link isn't found

        rightLinks = [
            projects,
            blogs,
            contactUs,
        ].filter(Boolean); // Filter out any undefined if a link isn't found
    }
    // --- End Custom logic ---

    const isLinkActive = (linkHref) => {
        if (linkHref === '/') {
            return location.pathname === '/' && (activeSection === '/' || activeSection === '#company-intro');
        }
        if (linkHref === '#blogs') {
            return (
                (location.pathname === '/' && activeSection === '#blogs') ||
                location.pathname.startsWith('/blogs')
            );
        }
        if (linkHref.startsWith('#') && location.pathname === '/') {
            return activeSection === linkHref;
        }
        if (!linkHref.startsWith('#')) {
            return location.pathname.startsWith(linkHref);
        }
        return false;
    };

    const getLinkTo = (href) => {
        if (href.startsWith('#')) {
            return { pathname: '/', hash: href };
        }
        return href;
    };

    return (
        <>
            {/* Mobile menu toggle button (visible when menu is closed and header is shown) */}
            <div
                className={`md:hidden fixed top-0 ${isArabic ? 'right-0' : 'left-0'} p-4 z-[950] ${isMenuOpen || !showHeader ? 'hidden' : ''}`}
            >
                <button
                    onClick={toggleMenu}
                    className="text-white focus:outline-none p-3 rounded-full hover:bg-it-turquoise transition-all duration-300 bg-it-dark-blue shadow-lg"
                    aria-label="Toggle menu"
                    style={{ boxShadow: '0 0 15px rgba(255, 221, 51, 0.5)' }}
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            {/* Header for desktop and mobile (when open) */}
            <header
                className={`fixed w-full top-0 z-40 transition-all duration-500 ease-in-out
                    ${showHeader ? 'translate-y-0' : '-translate-y-full'}
                    bg-it-dark-blue text-white shadow-2xl
                    md:rounded-none
                    ${!isMenuOpen && 'rounded-b-3xl'}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(0,51,102,0.98) 0%, rgba(0,51,102,0.95) 100%)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}
            >
                <div className="max-w-screen-2xl mx-auto px-4 md:px-24 relative z-30 flex items-center justify-between h-32">
                    {/* Mobile Logo & Title (visible only when menu is closed on mobile) */}
                    {(isMobileView && !isMenuOpen) && (
                        <div className="md:hidden flex flex-col items-center justify-center w-full">
                            <Link to="/" className="flex flex-col items-center gap-1">
                                <img
                                    src="/logo.svg"
                                    alt="One Stop Logo"
                                    className="w-10 h-10 transition-all duration-300 hover:scale-110"
                                    style={{ filter: 'drop-shadow(0 0 8px rgb(255, 255, 255))' }}
                                />
                                <h1 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ textShadow: '0 0 10px rgba(255, 221, 51, 0.5)' }}>
                                    ONE<span className="text-it-yellow">STOP</span>
                                </h1>
                                {/* Added: CONSTRUCTION & SERVICES under company name for mobile */}
                                <span className="text-white text-xs font-semibold tracking-wide mt-[-5px]" style={{ color: itColors.turquoise }}>
                                    CONSTRUCTION & SERVICES
                                </span>
                            </Link>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center w-full">
                        <nav
                            className={`flex-1 flex ${isArabic ? 'justify-start pl-6' : 'justify-start pl-6'} items-center space-x-6 lg:space-x-8 xl:space-x-10 ${isArabic ? 'rtl:space-x-reverse' : ''}`}
                        >
                            {leftLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    to={getLinkTo(link.href)}
                                    className={`relative group uppercase text-lg font-semibold py-2 whitespace-nowrap tracking-wider
                                        ${isLinkActive(link.href) ? 'text-it-yellow' : 'text-gray-200 hover:text-white'}
                                        transition duration-300`}
                                >
                                    {link.label}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-it-yellow transition-all duration-300 ${isLinkActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </Link>
                            ))}
                        </nav>

                        {/* Centered Logo and Company Name for Desktop */}
                        <div
                            className="flex flex-col items-center justify-center shrink-0 px-8 py-3 rounded-b-lg shadow-2xl transition-all duration-300 group hover:scale-105 z-50"
                            style={{
                                backgroundColor: itColors.darkBlue,
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                                marginBottom: '-1.2rem', // Simulate extension below header
                            }}
                        >
                            <Link to="/" className="flex flex-col items-center">
                                <div className="relative mb-2">
                                    <img
                                        src="/logo.svg"
                                        alt="One Stop Logo"
                                        className="h-20 w-20 transition-all duration-500 hover:rotate-12"
                                        style={{ filter: 'drop-shadow(0 0 12px rgb(255, 255, 255))' }}
                                    />
                                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow pointer-events-none"></div>
                                </div>
                                <h1 className="text-3xl font-bold uppercase tracking-wider text-white" style={{ textShadow: '0 0 12px rgba(255, 221, 51, 0.5)' }}>
                                    ONE<span className="text-it-yellow">STOP</span>
                                    <span className="block h-0.5 bg-it-yellow mx-auto mt-1" style={{ width: '80%' }}></span>
                                </h1>
                                {/* Added: CONSTRUCTION & SERVICES under company name for desktop */}
                                <span className="text-white text-sm font-semibold tracking-wide mt-1" style={{ color: itColors.turquoise }}>
                                    CONSTRUCTION & SERVICES
                                </span>
                            </Link>
                        </div>

                        <nav
                            className={`flex-1 flex ${isArabic ? 'justify-end pr-6' : 'justify-end pr-6'} items-center space-x-6 lg:space-x-8 xl:space-x-10 ${isArabic ? 'rtl:space-x-reverse' : ''}`}
                        >
                            {rightLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    to={getLinkTo(link.href)}
                                    className={`relative group uppercase text-lg font-semibold py-2 whitespace-nowrap tracking-wider
                                        ${isLinkActive(link.href) ? 'text-it-yellow' : 'text-gray-200 hover:text-white'}
                                        transition duration-300`}
                                >
                                    {link.label}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-it-yellow transition-all duration-300 ${isLinkActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </Link>
                            ))}
                            <button
                                onClick={toggleLang}
                                className="ml-6 text-sm px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap font-bold tracking-wider hover:shadow-lg"
                                style={{
                                    backgroundColor: itColors.yellow,
                                    color: itColors.darkBlue,
                                    boxShadow: '0 0 10px rgba(255, 221, 51, 0.5)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = itColors.turquoise;
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(33, 138, 122, 0.7)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = itColors.yellow;
                                    e.currentTarget.style.color = itColors.darkBlue;
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 221, 51, 0.5)';
                                }}
                            >
                                {i18n.language === 'ar' ? 'EN' : 'AR'}
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Sidebar */}
            <nav
                className={`fixed inset-y-0 ${isArabic ? 'right-0' : 'left-0'} w-80 bg-gradient-to-b from-it-dark-blue to-it-dark-blue shadow-2xl z-[900]
                    transform ${isMenuOpen ? 'translate-x-0' : isArabic ? 'translate-x-full' : '-translate-x-full'}
                    transition-all duration-300 ease-in-out md:hidden flex flex-col p-6 overflow-y-auto`}
                dir={directionClass}
                style={{
                    background: 'linear-gradient(160deg, rgba(0,51,102,0.98) 0%, rgba(0,51,102,0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.svg"
                            alt="One Stop Logo"
                            className="w-12 h-12"
                            style={{ filter: 'drop-shadow(0 0 10px rgb(255, 255, 255))' }}
                        />
                        <h2 className={`text-2xl font-bold text-it-yellow ${textAlignmentClass}`}>
                            ONE<span className="text-white">STOP</span>
                        </h2>
                    </div>
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none p-2 rounded-full hover:bg-it-turquoise transition-all duration-300"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {homeLink && (
                    <Link
                        to={getLinkTo(homeLink.href)}
                        onClick={toggleMenu}
                        className={`block py-4 px-6 transition-all duration-300 ease-in-out uppercase tracking-wider rounded-xl mb-4
                            ${isLinkActive(homeLink.href) ? 'text-it-dark-blue bg-it-yellow font-bold' : 'text-white bg-gray-700/30 hover:bg-it-yellow hover:text-it-dark-blue font-semibold'}
                            flex items-center gap-3 text-xl`}
                        style={{
                            boxShadow: isLinkActive(homeLink.href) ? '0 0 15px rgba(255, 221, 51, 0.7)' : 'none'
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        {homeLink.label}
                    </Link>
                )}

                <nav className={`flex flex-col gap-y-3 text-white font-medium text-xl flex-grow`}>
                    {otherLinks.map((link) => (
                        <Link
                            key={link.id}
                            to={getLinkTo(link.href)}
                            onClick={toggleMenu}
                            className={`block py-3 px-6 transition-all duration-300 ease-in-out uppercase tracking-wider rounded-lg
                                ${isLinkActive(link.href) ? 'text-it-yellow bg-gray-700/50 font-semibold' : 'text-gray-200 hover:text-it-yellow hover:bg-gray-700/30'}
                                flex items-center gap-3`}
                        >
                            {/* Icons based on link href - keep consistent */}
                            {link.href === '#about' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            )}
                            {link.href === '#services' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            )}
                            {link.href === '#team' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.149-1.275-.415-1.844m0 0C14.659 13.93 14.156 13 13 13h-2c-1.156 0-1.659.93-2.585 2.156m0 0A2.997 2.997 0 007 18v2m0 0H2v-2a3 3 0 015.356-1.857M12 20v-9m0 0C9.69 8.93 7.842 8 6 8s-3.69.93-6 4"></path>
                                </svg>
                            )}
                            {link.href === '#blogs' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 002 2zm0 0l1 1m-1-1v-1a2 2 0 00-2-2H8m2-6h4m-4 4h4"></path>
                                </svg>
                            )}
                            {link.href === '#projects' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 002.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            )}
                            {link.href === '#contact' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            )}
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-700/50">
                    <button
                        onClick={toggleLang}
                        className="w-full text-lg px-6 py-3 rounded-full transition-all duration-300 font-bold tracking-wider flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: itColors.yellow,
                            color: itColors.darkBlue,
                            boxShadow: '0 0 10px rgba(255, 221, 51, 0.5)',
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                        </svg>
                        {i18n.language === 'ar' ? 'English' : 'العربية'}
                    </button>
                </div>
            </nav>

            {/* Overlay for mobile menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-[800] md:hidden transition-opacity duration-300"
                    onClick={toggleMenu}
                ></div>
            )}

            {/* Keyframe for ping animation */}
            <style>{`
                @keyframes ping-slow {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    70% { transform: scale(1.05); opacity: 0.2; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
            `}</style>
        </>
    );
};

export default Header;