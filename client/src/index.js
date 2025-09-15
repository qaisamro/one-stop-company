// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios'; // ⬅️ أضف هذا السطر لاستيراد Axios

// 🔄 استدعاء إعداد الترجمة
import './i18n';

// ⬅️ أضف هذا السطر لتعيين معالجة بيانات الاعتماد مع الطلبات
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);