import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CompanyIntro from '../components/CompanyIntro';
import AboutSection from '../components/AboutSection';
import Services from '../components/Services';
import TeamSection from '../components/TeamSection';
import CertificatesSection from '../components/CertificatesSection';
import BlogsSection from '../components/BlogsSection';
import ContactSection from '../components/ContactSection';
import Projects from '../components/Projects';
import WhyChooseUs from '../components/WhyChooseUs';
import OurStory from '../components/OurStory';
import CompanyMotto from '../components/CompanyMotto';
import CSRSection from '../components/CSRPage'; // <--- استيراد مكون CSR الجديد

const Home = ({ setActiveSection }) => {
  const location = useLocation();

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

      setActiveSection(currentActiveSection);
    };

    window.addEventListener('scroll', handleScrollSection);
    handleScrollSection();

    return () => window.removeEventListener('scroll', handleScrollSection);
  }, [location.pathname, setActiveSection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.hash) {
        const id = location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <main className="pt-24 md:pt-32 p-4 md:p-0 space-y-2 min-h-screen bg-gradient-to-br from-sky-50 to-white dark:from-gray-950 dark:to-gray-800">
      <section id="company-intro" className="bg-white shadow-xl rounded-2xl">
        <CompanyIntro />
      </section>
      <section id="our-story" className="bg-white shadow-xl rounded-2xl">
        <OurStory />
      </section>

      <div className="my-4 md:my-8 -mt-2 -mb-2">
        <CompanyMotto />
      </div>

      <section id="about" className="bg-white shadow-xl rounded-2xl">
        <AboutSection />
      </section>
      <section id="services" className="bg-white shadow-xl rounded-2xl">
        <Services />
      </section>
      <section id="team" className="bg-white shadow-xl rounded-2xl">
        <TeamSection />
      </section>
      <section id="certificates" className="bg-white shadow-xl rounded-2xl">
        <CertificatesSection />
      </section>

      <div className="my-4 md:my-8 -mt-2 -mb-2">
        <CompanyMotto />
      </div>
      
      {/* قسم المسؤولية المجتمعية (CSR) الجديد */}
      <section id="csr" className="bg-white shadow-xl rounded-2xl">
        <CSRSection />
      </section>

      <section id="why-choose-us" className="bg-white shadow-xl rounded-2xl">
        <WhyChooseUs />
      </section>
      <section id="blogs" className="bg-white shadow-xl rounded-2xl">
        <BlogsSection />
      </section>
      <section id="projects" className="bg-white shadow-xl rounded-2xl">
        <Projects />
      </section>
      <section id="contact" className="bg-white shadow-xl rounded-2xl">
        <ContactSection />
      </section>
    </main>
  );
};

export default Home;