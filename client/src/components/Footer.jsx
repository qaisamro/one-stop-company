import React from 'react';
import { useTranslation } from 'react-i18next';
// استيراد أيقونة TikTok بالإضافة إلى الأيقونات الموجودة
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok,FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  // textAlignmentClass will control the overall alignment of the grid items' content
  const textAlignmentClass = isRTL ? 'text-right' : 'text-left';

  // Define new IT colors
  const colors = {
    turquoise: '#218A7A',  // تركواز IT 158-1
    darkBlue: '#003366',  // أزرق غامق IT 160-3
    yellow: '#FFDD33',     // أصفر IT 58-5
  };

  // Google Maps URL for "Dura, Hebron, Palestine"
  const googleMapsUrl = "https://maps.app.goo.gl/fw7Fk7FaZYNteVqE7";

  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Changed lg:grid-cols-4 to lg:grid-cols-5 to accommodate the new "Contact Info" section better */}
        {/* Note: If you want 4 distinct columns, consider if "Contact Info" and "Location" should be merged or separated */}
        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 text-sm ${textAlignmentClass}`}>
          {/* Company Info (Logo + About) */}
          <div className="md:col-span-1 lg:col-span-2">
            {/* Company title: Always LTR and left-aligned for consistency with English */}
            <h3 className={`text-2xl font-extrabold mb-4 tracking-wider text-left`} style={{ color: colors.turquoise }} dir="ltr"> 
              One Stop Company
            </h3>
            {/* Description follows the global language direction */}
            <p className="text-gray-200 dark:text-gray-300 leading-relaxed max-w-md"> 
              {t('footer_description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-4 md:mt-0">
            <h4 className="text-lg font-bold mb-4" style={{ color: colors.yellow }}> 
              {t('quick_links')}
            </h4>
            <ul className={`space-y-3 ${textAlignmentClass}`}>
              <li><a href="#about" className="text-white dark:text-gray-200 hover:underline transition-colors duration-200" onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{t('about_us')}</a></li>
              <li><a href="#services" className="text-white dark:text-gray-200 hover:underline transition-colors duration-200" onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{t('services')}</a></li>
              <li><a href="#blogs" className="text-white dark:text-gray-200 hover:underline transition-colors duration-200" onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{t('blogs_news_title')}</a></li>
              <li><a href="#certificates" className="text-white dark:text-gray-200 hover:underline transition-colors duration-200" onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{t('certificates_title')}</a></li>
              <li><a href="#team" className="text-white dark:text-gray-200 hover:underline transition-colors duration-200" onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{t('team_title')}</a></li>
              <li><a href="#contact" className="text-white dark:text-gray-200 hover:underline transition-colors duration-200" onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{t('contact_us_title')}</a></li>
            </ul>
          </div>

          {/* Contact Info - UPDATED TO INCLUDE LOCATION */}
          <div className="mt-4 md:mt-0">
            <h4 className="text-lg font-bold mb-4" style={{ color: colors.yellow }}>
              {t('contact_us')} {/* 'contact_us' or 'contact_info' based on your i18n */}
            </h4>
            <ul className={`space-y-3 ${textAlignmentClass}`}>
              {/* Email */}
              <li className="flex items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <a 
                  href="mailto:info@one-stop.ps" 
                  className="text-white dark:text-gray-200 hover:underline transition-colors duration-200"
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} 
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  info@one-stop.ps
                </a>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75m18 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m18 0v.562m-18-.562c0-1.105.895-2 2-2h12.556L18 7.375 21.75 6.75Z" />
                </svg>
              </li>
              {/* Phone */}
              <li className="flex items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <a 
                  href="tel:+972569900416" 
                  className="text-white dark:text-gray-200 hover:underline transition-colors duration-200 whitespace-nowrap"
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.turquoise} 
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  +972 56-990-0416
                </a>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.106l-1.412-.363a1.125 1.125 0 0 1-.823-.307l-2.541-2.541a1.125 1.125 0 0 1-.307-.823v-1.412a1.125 1.125 0 0 1 1.106-.852l.363-1.412A2.25 2.25 0 0 0 18.75 8.25V6H9.75a2.25 2.25 0 0 0-2.25 2.25v2.25c0 .354.124.693.351.972l2.541 2.541c.28.28.618.404.972.404h.54c.354 0 .693-.124.972-.351l2.541-2.541c.227-.28.351-.618.351-.972v-.54a1.125 1.125 0 0 0-1.106-.852L9 8.25a2.25 2.25 0 0 0-2.25 2.25V15" />
                </svg>
              </li>
              {/* Location Text */}
              <li>
                <p className="text-white dark:text-gray-200">
                  {t('full_address') || 'Palestine - Hebron - Dura - Banks Street'}
                </p>
              </li>
              {/* Location Map Button */}
              <li>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300 shadow-md"
                  style={{ backgroundColor: colors.darkBlue, color: colors.yellow, borderColor: colors.yellow }} // Apply colors here
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.yellow;
                    e.currentTarget.style.color = colors.darkBlue;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.darkBlue;
                    e.currentTarget.style.color = colors.yellow;
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                  </svg>
                  <span>{t('view_on_map') || 'View on Map'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="mt-4 md:mt-0">
  <h4 className="text-lg font-bold mb-4" style={{ color: colors.yellow }}>
    {t('follow_us')}
  </h4>
  <div className={`flex gap-5 text-2xl ${isRTL ? 'justify-end' : 'justify-start'}`}>
    <a
      href="https://www.facebook.com/1StopCompany"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white dark:text-gray-200 hover:scale-110 transition-transform duration-200"
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
      aria-label="Facebook"
    >
      <FaFacebook />
    </a>
    <a
      href="https://instagram.com/one_stop_company1"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white dark:text-gray-200 hover:scale-110 transition-transform duration-200"
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
      aria-label="Instagram"
    >
      <FaInstagram />
    </a>
    <a
      href="https://www.linkedin.com/company/1stopcompany"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white dark:text-gray-200 hover:scale-110 transition-transform duration-200"
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
      aria-label="LinkedIn"
    >
      <FaLinkedin />
    </a>
    {/* TikTok Link */}
    <a
      href="https://tiktok.com/@one_stop_company"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white dark:text-gray-200 hover:scale-110 transition-transform duration-200"
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
      aria-label="TikTok"
    >
      <FaTiktok />
    </a>
    {/* WhatsApp Link - Added here */}
    <a
      href="https://api.whatsapp.com/send?phone=972569901416"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white dark:text-gray-200 hover:scale-110 transition-transform duration-200"
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.yellow)}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
      aria-label="WhatsApp"
    >
      <FaWhatsapp />
    </a>
  </div>
</div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 border-t border-gray-700 dark:border-gray-700 text-center text-sm pt-6">
          <p className="text-gray-300 dark:text-gray-400"> 
            © {new Date().getFullYear()} One Stop Company. {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;