import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ضبط اللغة على العربية
  useEffect(() => {
    i18n.changeLanguage('ar');
  }, [i18n]);

  const login = async () => {
    setError('');
    try {
      console.log('Attempting to log in to /api/admin/login...');
      const response = await axiosInstance.post('/api/admin/login', { email, password });

      console.log('Login response:', response.data);

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        console.log('Authentication token stored:', access_token);
        navigate('/admin/about');
      } else {
        setError(t('no_token_received', 'لم يتم استلام رمز التوثيق. حاول مرة أخرى.'));
      }
    } catch (err) {
      console.error('Login error details:', err.response?.data || err.message);
      if (err.response) {
        if (err.response.status === 419) {
          setError(t('csrf_mismatch_error', 'فشل تسجيل الدخول: عدم تطابق رمز الأمان. يرجى مسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط في المتصفح، ثم حاول مرة أخرى.'));
        } else if (err.response.status === 401) {
          setError(t('invalid_credentials', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
        } else if (err.response.data && err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0][0];
          setError(firstError);
        } else {
          setError(err.response.data.message || t('login_failed_generic', 'فشل تسجيل الدخول. حدث خطأ غير متوقع.'));
        }
      } else {
        setError(t('network_error', 'خطأ في الشبكة أو الخادم غير متاح.'));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-green-400 to-yellow-300 animate-gradient">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 hover:shadow-xl border border-blue-600" dir="rtl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-yellow-600">
            شركة ون ستوب
          </h1>
          <p className="text-blue-600 font-medium mt-2">{t('admin_login', 'تسجيل دخول الأدمن')}</p>
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-100 p-2 rounded-lg animate-pulse">
            {error}
          </p>
        )}
        <div className="space-y-5">
          <input
            type="email"
            placeholder={t('email', 'البريد الإلكتروني')}
            className="w-full px-5 py-3 border border-blue-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-200 text-right"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('password', 'كلمة المرور')}
            className="w-full px-5 py-3 border border-blue-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-200 text-right"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-blue-600 transition-colors duration-200 font-semibold"
          >
            {t('login', 'تسجيل الدخول')}
          </button>
        </div>
        <p className="text-center text-gray-600 mt-6 text-sm">
          © {new Date().getFullYear()} شركة ون ستوب. {t('all_rights_reserved', 'جميع الحقوق محفوظة.')}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;