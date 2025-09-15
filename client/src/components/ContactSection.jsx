import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ContactSection = () => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArabic = i18n.language === 'ar';
  const directionClass = isArabic ? 'rtl' : 'ltr';
  const textAlignmentClass = isArabic ? 'text-right' : 'text-left';
  const inputPlaceholderClass = isArabic ? 'placeholder-gray-500 text-right' : 'placeholder-gray-500 text-left';

  // Define new IT colors
  const colors = {
    turquoise: '#218A7A', // IT 158-1
    darkBlue: '#003366',  // IT 160-3
    yellow: '#FFDD33',    // IT 58-5
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error && e.target.value) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(t('required_fields_error') || 'Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError(t('invalid_email_error') || 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('https://one-stop.ps/api/contacts', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 8000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(t('send_message_failed') || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Maps URL for "Dura, Hebron, Palestine"

  return (
    <section 
      id="contact" 
      className={`relative py-12 md:py-20 overflow-hidden ${directionClass} 
                  bg-white dark:bg-gray-900`}
    >
      {/* Background Image from image_b684bf.png */}
      <div 
        className="absolute inset-0 z-0 opacity-10 md:opacity-[0.03]" 
        style={{
          backgroundImage: `url('/image_b684bf.png')`, // Path to your uploaded image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Left Side: Contact Information (UPDATED) */}
          <div className={`w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center ${textAlignmentClass}
                           bg-gray-100 dark:bg-gray-700`}>
            
            <div className={`flex items-center mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className="w-3 h-3 mr-2 ml-2 flex-shrink-0" style={{ backgroundColor: colors.yellow }}></div> {/* Yellow square */}
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                {t('lets_work_together') || "LET'S WORK TOGETHER"}
              </p>
            </div>
            
            <h2 className={`text-4xl lg:text-5xl font-extrabold mb-6 leading-tight`} style={{ color: colors.darkBlue }}> {/* Dark Blue Title */}
              {t('get_in_touch_title') || 'Get In Touch With Us'}
            </h2>
            {/* <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('contact_description') || 'If you need to repair or replace your Plumbing system, call today and talk to one of our Plumbing specialists.'}
            </p> */}

            <div className="space-y-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('call_us') || 'Call Us'}</p>
                <a href="tel:+972569900416" className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 hover:text-[#003366] dark:hover:text-[#FFDD33] transition-colors duration-300">
                  +972 56-990-0416
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-8 sm:space-y-0 space-y-4">
                <div className={`${isArabic ? 'sm:text-right' : 'sm:text-left'} flex-1`}>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('our_location') || 'Our Location'}</p>
                  {/* Display original address text as static text */}
                  <p className="text-gray-800 dark:text-gray-100 font-medium mb-2">
                    {t('full_address') || 'Palestine - Hebron - Dura'}
                  </p>
                  {/* Separate button/icon to open map */}
                  {/* <a
  href="https://maps.app.goo.gl/fw7Fk7FaZYNteVqE7"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#3C4196] text-[#F4EB27] hover:bg-[#2e3279] transition-colors duration-300 shadow-md"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
  </svg>
  <span>عرض الخريطة</span>
</a> */}

                </div>
                <div className={`${isArabic ? 'sm:text-right' : 'sm:text-left'} flex-1`}>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('email_us') || 'Email Us'}</p>
                  <a href="mailto:info@one-stop.ps" className="text-gray-800 dark:text-gray-100 font-medium hover:text-[#003366] dark:hover:text-[#FFDD33] transition-colors duration-300">
                    info@one-stop.ps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-white dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('name_placeholder') || '*Your name'}
                  required
                  className={`p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50
                              focus:outline-none focus:ring-1 transition-all duration-200
                              ${inputPlaceholderClass}`}
                  style={{ '--tw-ring-color': colors.darkBlue }}
                />
              </div>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('email_placeholder') || '*Email address'}
                  required
                  className={`p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50
                              focus:outline-none focus:ring-1 transition-all duration-200
                              ${inputPlaceholderClass}`}
                  style={{ '--tw-ring-color': colors.darkBlue }}
                />
              </div>
              <div>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('message_placeholder') || 'Write message...'}
                  required
                  rows="6"
                  className={`p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50
                              focus:outline-none focus:ring-1 transition-all duration-200
                              resize-y ${inputPlaceholderClass}`}
                  style={{ '--tw-ring-color': colors.darkBlue }}
                ></textarea>
              </div>

              <div className="flex justify-end items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 py-3 px-6 rounded-md text-lg font-semibold
                               hover:bg-opacity-90 transition-all duration-300 shadow-md 
                               ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: colors.turquoise, color: 'white' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('sending_message') || 'Sending...'}
                    </>
                  ) : (
                    t('send_message_button') || 'SEND MESSAGE'
                  )}
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center h-12 w-12 rounded-md text-white hover:bg-opacity-90 transition-all duration-300 shadow-md`}
                  disabled={isSubmitting}
                  style={{ backgroundColor: colors.turquoise }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill={colors.yellow}/>
                    </svg>
                </button>
              </div>

              {/* Success and Error Messages */}
              {sent && (
                <p className={`text-[#218A7A] dark:text-green-300 bg-green-100 dark:bg-green-800 p-4 rounded-lg text-center font-medium animate-fade-in shadow-md`}>
                  {t('message_sent_success') || 'Your message has been sent successfully!'}
                </p>
              )}
              {error && (
                <p className={`text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800 p-4 rounded-lg text-center font-medium animate-pulse shadow-md`}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;